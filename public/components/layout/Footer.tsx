import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Globe, Instagram, Youtube, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="row g-4">
          {/* Brand and About */}
          <div className="col-lg-4 col-md-6">
            <div className="footer-brand">
              <img src="/images/logo.jpg" alt="Logo" />
              <h6>Kết Nối Xanh</h6>
            </div>
            <p className="mb-4 pe-lg-4">
              Nền tảng kết nối tình nguyện viên và các biểu tượng phi lợi nhuận hàng đầu Việt Nam. 
              Cùng nhau lan tỏa yêu thương và tạo ra những giá trị bền vững cho cộng đồng.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" aria-label="Youtube"><Youtube size={20} /></a>
              <a href="#" aria-label="Website"><Globe size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h5 className="footer-title">Khám phá</h5>
            <ul className="footer-links">
              <li><Link to="/">Trang chủ</Link></li>
              <li><Link to="/events">Sự kiện</Link></li>
              <li><Link to="/organizations">Tổ chức</Link></li>
              <li><Link to="/about">Giới thiệu</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="col-lg-2 col-md-6">
            <h5 className="footer-title">Hỗ trợ</h5>
            <ul className="footer-links">
              <li><Link to="/contact">Liên hệ</Link></li>
              <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
              <li><Link to="/terms">Điều khoản sử dụng</Link></li>
              <li><Link to="/privacy">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-4 col-md-6">
            <h5 className="footer-title">Liên hệ với chúng tôi</h5>
            <div className="footer-contact">
              <div className="d-flex align-items-center mb-3 text-white-50">
                <MapPin size={18} className="me-2 text-success" /> 
                <span>Hà Nội, Việt Nam</span>
              </div>
              <div className="d-flex align-items-center mb-3 text-white-50">
                <Phone size={18} className="me-2 text-success" /> 
                <span>0123 456 789</span>
              </div>
              <div className="d-flex align-items-center mb-3 text-white-50">
                <Mail size={18} className="me-2 text-success" /> 
                <span>contact@ketnoixanh.vn</span>
              </div>
              <div className="mt-4 p-3 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-10">
                <p className="mb-0 small d-flex align-items-center gap-2 text-white-50">
                  <Heart size={16} className="text-danger" fill="#ef4444" />
                  Góp phần xây dựng cộng đồng xanh
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} <strong>Kết Nối Xanh</strong> - Đồng hành cùng cộng đồng Việt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
