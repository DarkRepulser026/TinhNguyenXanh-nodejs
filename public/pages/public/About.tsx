import React from 'react';

const About: React.FC = () => {
  return (
    <div className="about-section bg-white py-5">
      <div className="container">
        {/* Header Section */}
        <div className="about-header text-center mb-5 animate-fade-in-down">
          <h2 className="display-4 fw-extrabold text-dark position-relative d-inline-block">
            Về Chúng Tôi
            <span className="position-absolute bottom-0 start-50 translate-middle-x" style={{ width: '80px', height: '4px', background: 'linear-gradient(90deg, #16a34a, #15803d)', borderRadius: '2px', marginBottom: '-15px' }}></span>
          </h2>
          <p className="text-muted fs-5 mx-auto mt-4" style={{ maxWidth: '700px', lineHeight: '1.7' }}>
            Chào mừng bạn đến với Kết Nối Xanh – nền tảng gắn kết những trái tim thiện nguyện và các tổ chức cộng đồng vì một Việt Nam bền vững.
          </p>
        </div>

        <div className="row g-5 align-items-stretch">
          {/* Image Card */}
          <div className="col-lg-6">
            <div className="image-card rounded-5 overflow-hidden shadow-lg h-100 d-flex align-items-center justify-content-center border" style={{ background: '#f0fdf4' }}>
              <img 
                src="/images/hinhvongtron.jpg" 
                alt="Community circle" 
                className="img-fluid p-4 transition-transform shadow-sm"
                style={{ maxHeight: '500px', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Content Card */}
          <div className="col-lg-6">
            <div className="content-card bg-white p-5 rounded-5 border shadow-sm h-100">
              <h3 className="fw-bold text-dark mb-4 pb-2 border-bottom border-success border-3 d-inline-block">Sứ Mệnh Của Chúng Tôi</h3>
              <p className="text-muted mb-4 lead">
                <strong>Kết Nối Xanh</strong> ra đời với mong muốn trở thành cầu nối giữa tình nguyện viên
                và các tổ chức xã hội, câu lạc bộ, dự án cộng đồng. Giúp mọi người dễ dàng tìm kiếm, tham gia
                lan tỏa những hoạt động ý nghĩa vì xã hội.
              </p>
              
              <div className="mission-goals bg-light p-4 rounded-4 mb-4">
                <h4 className="h5 fw-bold text-success mb-3">Mục tiêu chiến lược:</h4>
                <ul className="list-unstyled text-muted">
                  <li className="mb-2 d-flex align-items-start">
                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                    Kết nối tình nguyện viên với các cơ hội phù hợp với kỹ năng và sở thích.
                  </li>
                  <li className="mb-2 d-flex align-items-start">
                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                    Hỗ trợ tổ chức quản lý tình nguyện viên minh bạch và hiệu quả.
                  </li>
                  <li className="mb-2 d-flex align-items-start">
                    <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                    Xây dựng cộng đồng nhân ái, sẵn sàng đóng góp vì lợi ích chung.
                  </li>
                </ul>
              </div>

              <div className="core-values d-flex justify-content-between p-3 rounded-4 border border-success border-opacity-25 bg-success bg-opacity-10">
                <div className="text-center">
                  <div className="fw-bold text-success">Kết nối</div>
                </div>
                <div className="text-center border-start border-end px-4 border-success border-opacity-25">
                  <div className="fw-bold text-success">Chia sẻ</div>
                </div>
                <div className="text-center">
                  <div className="fw-bold text-success">Minh bạch</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Closing Section */}
        <div className="text-center mt-5 pt-5">
            <img src="/images/anhcongdong.jpg" alt="Community" className="img-fluid rounded-5 shadow-lg mb-4" style={{ width: '100%', height: '400px', objectFit: 'cover' }} />
            <p className="fst-italic fs-4 text-muted mt-4">
                “Một người có thể tạo ra thay đổi, nhưng cả cộng đồng cùng hành động sẽ tạo ra điều kỳ diệu.”
            </p>
            <p className="fw-bold text-success fs-5">
                Kết Nối Xanh – Nơi những trái tim thiện nguyện cùng chung nhịp đập.
            </p>
        </div>
      </div>
    </div>
  );
};

export default About;

