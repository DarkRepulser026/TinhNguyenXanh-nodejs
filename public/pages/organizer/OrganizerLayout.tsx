import { type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Users,
} from 'lucide-react';

type OrganizerLayoutProps = {
  children: ReactNode;
};

const shellStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
};

const sidebarStyle: CSSProperties = {
  width: '280px',
  background: '#ffffff',
  borderRight: '1px solid #e5e7eb',
  padding: '24px 18px',
  position: 'sticky',
  top: 0,
  height: '100vh',
  boxShadow: '4px 0 16px rgba(0,0,0,0.03)',
};

const brandBoxStyle: CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '18px',
  padding: '18px 16px',
  marginBottom: '24px',
  background: 'linear-gradient(135deg, #dcfce7 0%, #ffffff 100%)',
};

const mainStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const topbarStyle: CSSProperties = {
  background: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  padding: '18px 28px',
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

const contentWrapStyle: CSSProperties = {
  padding: '28px',
};

const sectionLabelStyle: CSSProperties = {
  fontSize: '0.78rem',
  color: '#64748b',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '10px',
  paddingLeft: '10px',
};

const menuContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginBottom: '24px',
};

const baseLinkStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  transition: 'all 0.2s ease',
};

const getLinkStyle = (active: boolean): CSSProperties => ({
  ...baseLinkStyle,
  background: active ? '#16a34a' : '#ffffff',
  color: active ? '#ffffff' : '#0f172a',
  border: active ? '1px solid #16a34a' : '1px solid #e5e7eb',
  boxShadow: active ? '0 8px 18px rgba(22,163,74,0.18)' : 'none',
});

const quickCardStyle: CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '16px',
  background: '#ffffff',
};

const OrganizerLayout = ({ children }: OrganizerLayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/organizer/overview') {
      return location.pathname === '/organizer/overview' || location.pathname === '/organizer';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={shellStyle}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={sidebarStyle}>
          <div style={brandBoxStyle}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: '#16a34a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <Building2 size={28} />
            </div>

            <div
              style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '4px',
              }}
            >
              Organizer Panel
            </div>

            <div
              style={{
                color: '#64748b',
                fontSize: '0.9rem',
                lineHeight: 1.6,
              }}
            >
              Quản lý tổ chức, sự kiện và tình nguyện viên trong cùng một nơi.
            </div>
          </div>

          <div style={sectionLabelStyle}>Điều hướng</div>

          <div style={menuContainerStyle}>
            <Link to="/organizer/overview" style={getLinkStyle(isActive('/organizer/overview'))}>
              <LayoutDashboard size={18} />
              <span>Tổng quan</span>
            </Link>

            <Link to="/organizer/organization" style={getLinkStyle(isActive('/organizer/organization'))}>
              <Building2 size={18} />
              <span>Hồ sơ tổ chức</span>
            </Link>

            <Link to="/organizer/events" style={getLinkStyle(isActive('/organizer/events'))}>
              <CalendarDays size={18} />
              <span>Quản lý sự kiện</span>
            </Link>

            <Link to="/organizer/volunteers" style={getLinkStyle(isActive('/organizer/volunteers'))}>
              <Users size={18} />
              <span>Duyệt volunteer</span>
            </Link>
          </div>

          <div style={sectionLabelStyle}>Truy cập nhanh</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={quickCardStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  color: '#0f172a',
                  fontWeight: 700,
                }}
              >
                <ClipboardList size={16} color="#16a34a" />
                Công việc chính
              </div>
              <div style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Tạo sự kiện, duyệt đăng ký và cập nhật hồ sơ tổ chức.
              </div>
            </div>

            <div style={quickCardStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  color: '#0f172a',
                  fontWeight: 700,
                }}
              >
                <History size={16} color="#16a34a" />
                Gợi ý
              </div>
              <div style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Kiểm tra lại các đơn chờ duyệt mỗi ngày để không bỏ lỡ volunteer mới.
              </div>
            </div>
          </div>
        </aside>

        <main style={mainStyle}>
          <div style={topbarStyle}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <div
                  style={{
                    color: '#0f172a',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    marginBottom: '2px',
                  }}
                >
                  Dashboard Organizer
                </div>
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '0.9rem',
                  }}
                >
                  Khu vực quản trị dành cho ban tổ chức
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Link
                  to="/"
                  style={{
                    textDecoration: 'none',
                    color: '#0f172a',
                    border: '1px solid #e5e7eb',
                    background: '#ffffff',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontWeight: 600,
                  }}
                >
                  Về trang chủ
                </Link>

                <Link
                  to="/login"
                  style={{
                    textDecoration: 'none',
                    color: '#ffffff',
                    background: '#0f172a',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <LogOut size={16} />
                  Đăng xuất
                </Link>
              </div>
            </div>
          </div>

          <div style={contentWrapStyle}>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default OrganizerLayout;