import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Về Chúng Tôi</h3>
          <p>Tình Nguyện Xanh là nền tảng kết nối tình nguyện viên với các tổ chức cộng đồng.</p>
        </div>
        
        <div className="footer-section">
          <h3>Liên Kết</h3>
          <ul>
            <li><a href="/">Trang Chủ</a></li>
            <li><a href="/events">Sự Kiện</a></li>
            <li><a href="/organizations">Tổ Chức</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Liên Hệ</h3>
          <p>Email: info@tinhnguyenxanh.com</p>
          <p>Phone: +84 123 456 789</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Tình Nguyện Xanh. Tất cả quyền lợi được bảo lưu.</p>
      </div>
    </footer>
  )
}
