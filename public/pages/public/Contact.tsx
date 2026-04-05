import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
  };

  return (
    <div className="contact-section bg-white py-5 min-vh-100">
      <div className="container">
        {/* Header Section */}
        <div className="contact-header text-center mb-5">
          <h2 className="display-4 fw-extrabold text-dark position-relative d-inline-block">
            Liên Hệ Với Chúng Tôi
            <span className="position-absolute bottom-0 start-50 translate-middle-x" style={{ width: '80px', height: '4px', background: 'linear-gradient(90deg, #16a34a, #15803d)', borderRadius: '2px', marginBottom: '-15px' }}></span>
          </h2>
          <p className="text-muted fs-5 mx-auto mt-4" style={{ maxWidth: '600px', lineHeight: '1.7' }}>
            Góp ý của bạn là động lực để chúng tôi hoàn thiện nền tảng và phục vụ cộng đồng tốt hơn.
          </p>
        </div>

        <div className="row g-5">
          {/* Contact Info */}
          <div className="col-lg-4">
            <div className="contact-info-cards d-flex flex-column gap-4">
              <div className="info-card p-4 rounded-4 border bg-light shadow-sm transition-all hover-translate-y">
                <div className="icon-wrapper bg-success text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '50px', height: '50px' }}>
                  <MapPin size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Địa Chỉ</h5>
                <p className="text-muted mb-0 small">Khu công nghệ cao, Long Thạnh Mỹ, Quận 9, TP.HCM</p>
              </div>

              <div className="info-card p-4 rounded-4 border bg-light shadow-sm transition-all hover-translate-y">
                <div className="icon-wrapper bg-success text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '50px', height: '50px' }}>
                  <Phone size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Điện Thoại</h5>
                <p className="text-muted mb-0 small">038 911 3247 - Phòng Công Tác Sinh Viên</p>
              </div>

              <div className="info-card p-4 rounded-4 border bg-light shadow-sm transition-all hover-translate-y">
                <div className="icon-wrapper bg-success text-white rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: '50px', height: '50px' }}>
                  <Mail size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Email</h5>
                <p className="text-muted mb-0 small">ketnoixanh.contact@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-lg-8">
            <div className="contact-form-card bg-white p-5 rounded-5 border shadow-lg">
              <h4 className="fw-bold text-dark mb-4 pb-2 border-bottom border-success border-3 d-inline-block">Gửi Tin Nhắn</h4>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold text-dark">Họ và Tên</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3 py-2 px-3 border-2" 
                      placeholder="Nhập tên của bạn"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold text-dark">Email</label>
                    <input 
                      type="email" 
                      className="form-control rounded-3 py-2 px-3 border-2" 
                      placeholder="email@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold text-dark">Chủ Đề</label>
                    <input 
                      type="text" 
                      className="form-control rounded-3 py-2 px-3 border-2" 
                      placeholder="Bạn muốn liên hệ về việc gì?"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    />
                  </div>
                  <div className="col-12 mb-4">
                    <label className="form-label fw-semibold text-dark">Nội Dung</label>
                    <textarea 
                      className="form-control rounded-3 py-2 px-3 border-2" 
                      rows={5} 
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>
                  <div className="col-12 text-end">
                    <button type="submit" className="btn btn-success btn-lg px-5 py-3 rounded-pill fw-bold shadow-sm d-inline-flex align-items-center gap-2 transition-all hover-scale">
                      <Send size={20} /> Gửi Liên Hệ
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

