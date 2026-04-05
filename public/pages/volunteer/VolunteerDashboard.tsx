import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../contexts/useAuth'
import './VolunteerDashboard.css'

interface VolunteerEvent {
  id: string
  title: string
  location: string
  date: string
  status: 'registered' | 'completed' | 'cancelled'
  hours: number
  organization: string
}

interface VolunteerProfile {
  id: string
  email: string
  fullName: string
  phone: string
  city?: string
  totalHours: number
  eventsCount: number
  joinDate: string
  skills: string[]
}

export default function VolunteerDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<VolunteerProfile | null>(null)
  const [events, setEvents] = useState<VolunteerEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'profile'>('overview')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchVolunteerData()
  }, [isAuthenticated, navigate])

  const fetchVolunteerData = async () => {
    try {
      const [profileRes, eventsRes] = await Promise.all([
        axios.get('/api/v1/volunteer/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        }),
        axios.get('/api/v1/volunteer/events', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        })
      ])
      setProfile(profileRes.data)
      setEvents(eventsRes.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching volunteer data:', error)
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <div>Vui lòng đăng nhập</div>
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  return (
    <div className="volunteer-dashboard">
      <h1>Bảng Điều Khiển Tình Nguyện Viên</h1>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Tổng Quan
        </button>
        <button 
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Sự Kiện Của Tôi
        </button>
        <button 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Hồ Sơ
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="tab-content overview">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{profile?.totalHours || 0}</div>
              <div className="stat-label">Giờ Tình Nguyện</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{profile?.eventsCount || 0}</div>
              <div className="stat-label">Sự Kiện Tham Gia</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{events.filter(e => e.status === 'completed').length}</div>
              <div className="stat-label">Hoàn Thành</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{profile?.skills?.length || 0}</div>
              <div className="stat-label">Kỹ Năng</div>
            </div>
          </div>

          <div className="welcome-section">
            <h2>Chào mừng, {user?.fullName}! 👋</h2>
            <p>Cảm ơn bạn đã tham gia các hoạt động tình nguyện!</p>
            <button className="btn btn-primary" onClick={() => navigate('/events')}>
              Tìm Sự Kiện Mới
            </button>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="tab-content events">
          <h2>Sự Kiện Của Tôi</h2>
          <div className="events-list">
            {events.length === 0 ? (
              <p>Bạn chưa tham gia sự kiện nào. <a href="/events">Khám phá các sự kiện</a></p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="organization">🏢 {event.organization}</p>
                    <p className="location">📍 {event.location}</p>
                    <p className="date">📅 {new Date(event.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="event-meta">
                    <div className="hours">
                      <strong>{event.hours}</strong>
                      <span>giờ</span>
                    </div>
                    <span className={`status status-${event.status}`}>
                      {event.status === 'registered' && '⏳ Sắp tới'}
                      {event.status === 'completed' && '✅ Hoàn thành'}
                      {event.status === 'cancelled' && '❌ Đã hủy'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="tab-content profile">
          <div className="profile-card">
            <h2>Thông Tin Hồ Sơ</h2>
            <div className="profile-info">
              <div className="info-row">
                <label>Tên:</label>
                <span>{profile?.fullName}</span>
              </div>
              <div className="info-row">
                <label>Email:</label>
                <span>{profile?.email}</span>
              </div>
              <div className="info-row">
                <label>Điện Thoại:</label>
                <span>{profile?.phone}</span>
              </div>
              <div className="info-row">
                <label>Thành Phố:</label>
                <span>{profile?.city || 'Chưa cập nhật'}</span>
              </div>
              <div className="info-row">
                <label>Ngày Tham Gia:</label>
                <span>{new Date(profile?.joinDate!).toLocaleDateString('vi-VN')}</span>
              </div>
              {profile?.skills && profile.skills.length > 0 && (
                <div className="info-row">
                  <label>Kỹ Năng:</label>
                  <div className="skills">
                    {profile.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="btn btn-secondary">Chỉnh Sửa Hồ Sơ</button>
          </div>
        </div>
      )}
    </div>
  )
}
