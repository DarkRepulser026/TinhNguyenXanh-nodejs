import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import './Header.css'

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()

  const getDashboardLink = () => {
    if (!user) return null
    switch (user.role) {
      case 'Admin':
        return { path: '/admin/dashboard', label: 'Quản Trị' }
      case 'Organizer':
        return { path: '/organizer/dashboard', label: 'Ban Tổ Chức' }
      case 'Volunteer':
        return { path: '/volunteer/dashboard', label: 'Bảng Điều Khiển' }
      default:
        return null
    }
  }

  const dashboardLink = getDashboardLink()

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          🌿 Tình Nguyện Xanh
        </Link>
        
        <nav className="nav">
          <Link to="/">Trang Chủ</Link>
          <Link to="/events">Sự Kiện</Link>
          <Link to="/organizations">Tổ Chức</Link>
          {isAuthenticated && dashboardLink && (
            <Link to={dashboardLink.path}>{dashboardLink.label}</Link>
          )}
        </nav>

        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <span className="user-name">{user?.fullName}</span>
              <span className="user-role">({user?.role})</span>
              <button onClick={logout} className="btn-logout">Đăng Xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login">Đăng Nhập</Link>
              <Link to="/register" className="btn-register">Đăng Ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
