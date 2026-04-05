import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>🌿 Tình Nguyện Xanh</h1>
          <p>Cùng Nhau Tạo Xanh - Nền Tảng Kết Nối Tình Nguyện Viên</p>
          <div className="hero-buttons">
            <Link to="/events" className="btn btn-primary">Khám Phá Sự Kiện</Link>
            <Link to="/organizations" className="btn btn-secondary">Tìm Tổ Chức</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Tính Năng Chính</h2>
        <div className="features-grid grid grid-3">
          <div className="feature-card card">
            <h3>🎯 Tìm Sự Kiện</h3>
            <p>Khám phá hàng trăm hoạt động tình nguyện thú vị trong cộng đồng của bạn.</p>
          </div>
          <div className="feature-card card">
            <h3>👥 Kết Nối Cộng Đồng</h3>
            <p>Gặp gỡ những người có cùng đam mê và tạo sự thay đổi tích cực.</p>
          </div>
          <div className="feature-card card">
            <h3>📊 Theo Dõi Tiến Trình</h3>
            <p>Quản lý các hoạt động tình nguyện và xem danh sách đóng góp của bạn.</p>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stat-item">
          <h3>5000+</h3>
          <p>Tình Nguyện Viên</p>
        </div>
        <div className="stat-item">
          <h3>500+</h3>
          <p>Sự Kiện</p>
        </div>
        <div className="stat-item">
          <h3>100+</h3>
          <p>Tổ Chức</p>
        </div>
        <div className="stat-item">
          <h3>50K+</h3>
          <p>Giờ Tình Nguyện</p>
        </div>
      </section>

      <section className="cta">
        <h2>Sẵn Sàng Bắt Đầu?</h2>
        <p>Tham gia cộng đồng tình nguyện xanh ngày hôm nay</p>
        <Link to="/register" className="btn btn-primary">Đăng Ký Ngay</Link>
      </section>
    </div>
  )
}
