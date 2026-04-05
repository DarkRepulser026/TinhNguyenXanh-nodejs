import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../contexts/useAuth'
import './AdminDashboard.css'

interface AdminStats {
  totalUsers: number
  totalEvents: number
  totalOrganizations: number
  pendingApprovals: number
  reports: number
}

interface PendingEvent {
  id: string
  title: string
  organizationName: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'users' | 'moderations'>('overview')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'Admin') {
      navigate('/login')
      return
    }
    fetchAdminData()
  }, [isAuthenticated, navigate, user])

  const fetchAdminData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        axios.get('/api/v1/admin/dashboard', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        }),
        axios.get('/api/v1/admin/pending-events', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        })
      ])
      setStats(statsRes.data)
      setPendingEvents(eventsRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      setLoading(false)
    }
  }

  const handleApproveEvent = async (eventId: string) => {
    try {
      await axios.put(`/api/v1/admin/events/${eventId}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      })
      alert('Sự kiện đã được duyệt!')
      fetchAdminData()
    } catch (error) {
      alert('Lỗi khi duyệt sự kiện!')
      console.error('Error approving event:', error)
    }
  }

  const handleRejectEvent = async (eventId: string) => {
    try {
      await axios.put(`/api/v1/admin/events/${eventId}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      })
      alert('Sự kiện đã bị từ chối!')
      fetchAdminData()
    } catch (error) {
      alert('Lỗi khi từ chối sự kiện!')
      console.error('Error rejecting event:', error)
    }
  }

  if (!isAuthenticated) {
    return <div>Vui lòng đăng nhập</div>
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="admin-dashboard">
      <h1>Bảng Điều Khiển Quản Trị</h1>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Tổng Quan
        </button>
        <button 
          className={`tab ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          Phê Duyệt
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Người Dùng
        </button>
        <button 
          className={`tab ${activeTab === 'moderations' ? 'active' : ''}`}
          onClick={() => setActiveTab('moderations')}
        >
          Moderation
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{stats?.totalUsers || 0}</div>
              <div className="stat-label">Tổng Người Dùng</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{stats?.totalEvents || 0}</div>
              <div className="stat-label">Tổng Sự Kiện</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏢</div>
              <div className="stat-value">{stats?.totalOrganizations || 0}</div>
              <div className="stat-label">Tổng Tổ Chức</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-value">{stats?.pendingApprovals || 0}</div>
              <div className="stat-label">Chờ Phê Duyệt</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚨</div>
              <div className="stat-value">{stats?.reports || 0}</div>
              <div className="stat-label">Báo Cáo</div>
            </div>
          </div>

          <div className="quick-actions">
            <h2>Hành Động Nhanh</h2>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => setActiveTab('approvals')}>
                📋 Phê Duyệt Sự Kiện ({stats?.pendingApprovals})
              </button>
              <button className="action-btn" onClick={() => setActiveTab('users')}>
                👥 Quản Lý Người Dùng
              </button>
              <button className="action-btn" onClick={() => setActiveTab('moderations')}>
                🚨 Xem Báo Cáo ({stats?.reports})
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="tab-content">
          <h2>Phê Duyệt Sự Kiện</h2>
          <div className="events-list">
            {pendingEvents.length === 0 ? (
              <p>Không có sự kiện nào chờ phê duyệt</p>
            ) : (
              pendingEvents.map((event) => (
                <div key={event.id} className="approval-card">
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="organization">🏢 {event.organizationName}</p>
                    <p className="date">📅 {new Date(event.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="actions">
                    <button 
                      className="btn btn-approve"
                      onClick={() => handleApproveEvent(event.id)}
                    >
                      ✅ Duyệt
                    </button>
                    <button 
                      className="btn btn-reject"
                      onClick={() => handleRejectEvent(event.id)}
                    >
                      ❌ Từ Chối
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="tab-content">
          <h2>Quản Lý Người Dùng</h2>
          <div className="users-section">
            <div className="filter-bar">
              <input type="text" placeholder="Tìm kiếm người dùng..." />
              <select>
                <option value="">Tất Cả Vai Trò</option>
                <option value="admin">Quản Trị</option>
                <option value="organizer">Ban Tổ Chức</option>
                <option value="volunteer">Tình Nguyện Viên</option>
              </select>
            </div>
            <p style={{marginTop: '20px'}}>Danh sách người dùng sẽ hiển thị ở đây</p>
          </div>
        </div>
      )}

      {activeTab === 'moderations' && (
        <div className="tab-content">
          <h2>Moderation</h2>
          <div className="moderations-section">
            <p>Danh sách báo cáo sẽ hiển thị ở đây</p>
          </div>
        </div>
      )}
    </div>
  )
}
