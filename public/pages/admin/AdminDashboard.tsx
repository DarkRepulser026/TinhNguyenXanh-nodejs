import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Calendar, Building2, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
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
      // Better UX - toast notification instead of alert
      // For now, use improved message
      alert('✅ Sự kiện đã được duyệt thành công!')
      fetchAdminData()
    } catch (error) {
      alert('❌ Lỗi khi duyệt sự kiện! Vui lòng thử lại.')
      console.error('Error approving event:', error)
    }
  }

  const handleRejectEvent = async (eventId: string) => {
    if (!confirm('Bạn có chắc chắn muốn từ chối sự kiện này?')) return
    
    try {
      await axios.put(`/api/v1/admin/events/${eventId}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      })
      alert('✅ Sự kiện đã bị từ chối!')
      fetchAdminData()
    } catch (error) {
      alert('❌ Lỗi khi từ chối sự kiện!')
      console.error('Error rejecting event:', error)
    }
  }

  const StatCard = ({ icon: Icon, value, label }: { icon: any, value: number, label: string }) => (
    <div className="stat-card">
      <div className="stat-icon">
        <Icon size={32} />
      </div>
      <div className="stat-value">{value.toLocaleString()}</div>
      <div className="stat-label">{label}</div>
    </div>
  )

  const ActionButton = ({ children, onClick, count }: { children: React.ReactNode, onClick: () => void, count?: number }) => (
    <button className="action-btn" onClick={onClick}>
      {children}
      {count !== undefined && <span className="badge">{count}</span>}
    </button>
  )

  if (!isAuthenticated) {
    return (
      <div className="loading" style={{ minHeight: '400px' }}>
        🔐 Vui lòng đăng nhập với tài khoản Admin
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading" style={{ minHeight: '400px', fontSize: '1.2rem' }}>
          <div>⏳ Đang tải dữ liệu dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <h2>👋 Chào mừng quay lại, {user?.fullName || 'Quản trị viên'}!</h2>
        <p>Hệ thống đang hoạt động tốt với {stats?.totalEvents || 0}+ sự kiện và {stats?.totalUsers || 0}+ người dùng.</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Tổng quan
        </button>
        <button 
          className={`tab ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          ✅ Phê duyệt ({stats?.pendingApprovals || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Người dùng
        </button>
        <button 
          className={`tab ${activeTab === 'moderations' ? 'active' : ''}`}
          onClick={() => setActiveTab('moderations')}
        >
          🚨 Báo cáo ({stats?.reports || 0})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="stats-grid">
            <StatCard icon={Users} value={stats?.totalUsers || 0} label="Tổng người dùng" />
            <StatCard icon={Calendar} value={stats?.totalEvents || 0} label="Tổng sự kiện" />
            <StatCard icon={Building2} value={stats?.totalOrganizations || 0} label="Tổng tổ chức" />
            <StatCard icon={Clock} value={stats?.pendingApprovals || 0} label="Chờ phê duyệt" />
            <StatCard icon={AlertTriangle} value={stats?.reports || 0} label="Báo cáo" />
          </div>

          <div className="quick-actions">
            <h2>🚀 Hành động nhanh</h2>
            <div className="actions-grid">
              <ActionButton onClick={() => setActiveTab('approvals')} count={stats?.pendingApprovals}>
                📋 Xem sự kiện chờ duyệt
              </ActionButton>
              <ActionButton onClick={() => setActiveTab('users')}>
                👥 Quản lý tài khoản người dùng
              </ActionButton>
              <ActionButton onClick={() => setActiveTab('moderations')} count={stats?.reports}>
                🚨 Xử lý báo cáo vi phạm
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="tab-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>✅ Sự kiện chờ phê duyệt</h2>
            <span className="badge bg-success">{pendingEvents.length} sự kiện</span>
          </div>
          
          {pendingEvents.length === 0 ? (
            <div className="text-center py-5" style={{ color: '#64748b' }}>
              <Calendar size={64} className="mx-auto mb-3 opacity-50" />
              <h4>Không có sự kiện nào chờ phê duyệt</h4>
              <p>Tất cả sự kiện đều đã được xử lý!</p>
            </div>
          ) : (
            <div className="events-list">
              {pendingEvents.map((event) => (
                <div key={event.id} className="approval-card">
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="organization">
                      <Building2 size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                      {event.organizationName}
                    </p>
                    <p className="date">
                      <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                      {new Date(event.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="actions">
                    <button 
                      className="btn btn-approve"
                      onClick={() => handleApproveEvent(event.id)}
                    >
                      <CheckCircle size={18} />
                      Duyệt ngay
                    </button>
                    <button 
                      className="btn btn-reject"
                      onClick={() => handleRejectEvent(event.id)}
                    >
                      <XCircle size={18} />
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="tab-content">
          <h2>👥 Quản lý người dùng</h2>
          <div className="users-section">
            <div className="filter-bar">
              <input type="text" placeholder="🔍 Tìm kiếm theo tên/email..." />
              <select>
                <option value="">Tất cả vai trò</option>
                <option value="admin">Quản trị viên</option>
                <option value="organizer">Ban tổ chức</option>
                <option value="volunteer">Tình nguyện viên</option>
              </select>
              <button className="btn btn-success">Tìm kiếm</button>
            </div>
            <div className="mt-4 p-4 border rounded" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
              <Users size={48} className="mx-auto mb-3 text-muted d-block" />
              <h5 className="text-center text-muted">Danh sách người dùng sẽ hiển thị ở đây</h5>
              <p className="text-center text-muted mb-0">
                Tính năng quản lý user đang được phát triển...
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'moderations' && (
        <div className="tab-content">
          <h2>🚨 Quản lý báo cáo</h2>
          <div className="moderations-section">
            <div className="mt-4 p-4 border rounded" style={{ background: '#fef7e0', borderColor: '#fcd34d' }}>
              <AlertTriangle size={48} className="mx-auto mb-3 text-warning d-block" />
              <h5 className="text-center text-warning">Không có báo cáo mới</h5>
              <p className="text-center text-muted mb-0">
                Hệ thống hiện đang sạch sẽ, không có báo cáo vi phạm nào!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
