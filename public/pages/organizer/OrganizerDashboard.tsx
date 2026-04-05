import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../contexts/useAuth'
import './OrganizerDashboard.css'

interface OrganizerEvent {
  id: string
  title: string
  status: 'draft' | 'approved' | 'active' | 'completed'
  registeredCount: number
  maxVolunteers: number
  date: string
}

interface OrganizerStats {
  totalEvents: number
  activeEvents: number
  totalVolunteers: number
  totalHours: number
}

export default function OrganizerDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState<OrganizerStats | null>(null)
  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [newEventModal, setNewEventModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startTime: '',
    maxVolunteers: 0,
    category: ''
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'Organizer') {
      navigate('/login')
      return
    }
    fetchOrganizerData()
  }, [isAuthenticated, navigate, user])

  const fetchOrganizerData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        axios.get('/api/v1/organizer/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        }),
        axios.get('/api/v1/organizer/events', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        })
      ])
      setStats(statsRes.data)
      setEvents(eventsRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching organizer data:', error)
      setLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('/api/v1/events', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      })
      alert('Tạo sự kiện thành công!')
      setNewEventModal(false)
      setFormData({
        title: '',
        description: '',
        location: '',
        startTime: '',
        maxVolunteers: 0,
        category: ''
      })
      fetchOrganizerData()
    } catch (error) {
      alert('Lỗi khi tạo sự kiện!')
      console.error('Error creating event:', error)
    }
  }

  if (!isAuthenticated) {
    return <div>Vui lòng đăng nhập</div>
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="organizer-dashboard">
      <h1>Bảng Điều Khiển Ban Tổ Chức</h1>
      
      <div className="dashboard-header">
        <div className="header-content">
          <h2>Chào mừng, {user?.fullName}! 👋</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setNewEventModal(true)}
          >
            ➕ Tạo Sự Kiện Mới
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalEvents || 0}</div>
          <div className="stat-label">Tổng Sự Kiện</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.activeEvents || 0}</div>
          <div className="stat-label">Sự Kiện Hoạt Động</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalVolunteers || 0}</div>
          <div className="stat-label">Người Tình Nguyện</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalHours || 0}</div>
          <div className="stat-label">Giờ Tình Nguyện</div>
        </div>
      </div>

      <div className="events-section">
        <h2>Các Sự Kiện Của Tôi</h2>
        <table className="events-table">
          <thead>
            <tr>
              <th>Sự Kiện</th>
              <th>Trạng Thái</th>
              <th>Người Đăng Ký</th>
              <th>Ngày</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>
                  <span className={`status status-${event.status}`}>
                    {event.status === 'draft' && '📝 Nháp'}
                    {event.status === 'approved' && '✅ Đã duyệt'}
                    {event.status === 'active' && '🔄 Đang hoạt động'}
                    {event.status === 'completed' && '✔️ Hoàn thành'}
                  </span>
                </td>
                <td>{event.registeredCount}/{event.maxVolunteers}</td>
                <td>{new Date(event.date).toLocaleDateString('vi-VN')}</td>
                <td>
                  <button className="btn-sm btn-info">Chi Tiết</button>
                  <button className="btn-sm btn-edit">Chỉnh Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {newEventModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Tạo Sự Kiện Mới</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label>Tên Sự Kiện:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mô Tả:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Địa Điểm:</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Danh Mục:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="environment">Môi Trường</option>
                    <option value="education">Giáo Dục</option>
                    <option value="community">Cộng Đồng</option>
                    <option value="health">Sức Khỏe</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ngày Bắt Đầu:</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số Tình Nguyện Viên Tối Đa:</label>
                  <input
                    type="number"
                    value={formData.maxVolunteers}
                    onChange={(e) => setFormData({...formData, maxVolunteers: Number(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn btn-primary">Tạo Sự Kiện</button>
                <button type="button" className="btn btn-secondary" onClick={() => setNewEventModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
