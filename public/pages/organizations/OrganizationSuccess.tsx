import { Link } from 'react-router-dom';

const OrganizationSuccess = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
        padding: '60px 20px',
      }}
    >
      <div className="container">
        <div
          style={{
            maxWidth: '760px',
            margin: '0 auto',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            padding: '48px 32px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>

          <h2
            style={{
              color: '#16a34a',
              fontSize: '2.2rem',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            Đăng ký tổ chức thành công!
          </h2>

          <p
            style={{
              color: '#475569',
              fontSize: '1rem',
              lineHeight: 1.8,
              marginBottom: '28px',
            }}
          >
            Bạn đã trở thành Ban tổ chức. Bây giờ bạn có thể quản lý hồ sơ tổ chức,
            sự kiện và tình nguyện viên của mình.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/organizer/overview"
              style={{
                background: '#16a34a',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '12px 22px',
                borderRadius: '10px',
                fontWeight: 600,
                display: 'inline-block',
              }}
            >
              Vào trang quản lý
            </Link>

            <Link
              to="/organizations"
              style={{
                background: '#ffffff',
                color: '#16a34a',
                textDecoration: 'none',
                padding: '12px 22px',
                borderRadius: '10px',
                fontWeight: 600,
                border: '2px solid #16a34a',
                display: 'inline-block',
              }}
            >
              Xem danh sách tổ chức
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSuccess;
