import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="py-4">
      <div className="container" style={{ maxWidth: '900px' }}>
        <h1 className="fw-bold mb-3">Chính sách bảo mật</h1>
        <p className="text-muted mb-4">
          VolunteerHub cam kết bảo vệ dữ liệu cá nhân của bạn và chỉ sử dụng thông tin theo đúng mục đích vận hành nền tảng.
        </p>

        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
          <h2 className="h5 fw-bold mb-2">1. Thông tin thu thập</h2>
          <p className="text-muted">
            Chúng tôi có thể thu thập thông tin tài khoản, thông tin liên hệ, và lịch sử tương tác với sự kiện để cải thiện trải nghiệm.
          </p>

          <h2 className="h5 fw-bold mb-2 mt-4">2. Mục đích sử dụng</h2>
          <p className="text-muted">
            Dữ liệu được sử dụng để xác thực tài khoản, kết nối tình nguyện viên với tổ chức, và gửi thông báo liên quan đến hoạt động.
          </p>

          <h2 className="h5 fw-bold mb-2 mt-4">3. Lưu trữ và bảo mật</h2>
          <p className="text-muted">
            Chúng tôi áp dụng biện pháp kỹ thuật và quy trình vận hành để giảm thiểu rủi ro truy cập trái phép vào dữ liệu người dùng.
          </p>

          <h2 className="h5 fw-bold mb-2 mt-4">4. Quyền của người dùng</h2>
          <p className="text-muted mb-0">
            Bạn có quyền cập nhật hồ sơ, yêu cầu xóa tài khoản, và liên hệ bộ phận hỗ trợ nếu cần giải đáp về dữ liệu cá nhân.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
