import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileWarning, 
  Home,
  LayoutDashboard, 
  ListChecks, 
  LogOut, 
  Menu, 
  ShieldCheck, 
  Users,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';

type AdminLayoutProps = {
  children: React.ReactNode;
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
  cursor: 'pointer',
  border: '1px solid transparent',
};

const getLinkStyle = (active: boolean): CSSProperties => ({
  ...baseLinkStyle,
  background: active ? '#16a34a' : '#ffffff',
  color: active ? '#ffffff' : '#0f172a',
  border: active ? '1px solid #16a34a' : '1px solid #e5e7eb',
  boxShadow: active ? '0 8px 18px rgba(22,163,74,0.18)' : 'none',
});

const profileCardStyle: CSSProperties = {
  marginTop: 'auto',
  border: '1px solid #bbf7d0',
  borderRadius: '16px',
  padding: '14px',
  background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const mobileMenuBtnStyle: CSSProperties = {
  display: 'none',
  padding: '10px',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  background: 'transparent',
  cursor: 'pointer',
  '@media (max-width: 768px)': {
    display: 'flex',
  }
} as any;

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
    { label: 'Phê duyệt', path: '/admin/approvals', icon: ListChecks },
    { label: 'Moderation', path: '/admin/moderation', icon: FileWarning },
    { label: 'Báo cáo', path: '/admin/reports', icon: AlertTriangle },
    { label: 'Người dùng', path: '/admin/users', icon: Users },
    { label: 'Danh mục', path: '/admin/categories', icon: ShieldCheck },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      <div style={shellStyle}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          {/* Desktop Sidebar */}
          <aside style={{ 
            ...sidebarStyle, 
            display: 'flex',
            flexDirection: 'column',
            '@media (max-width: 768px)': { display: 'none' } 
          } as any}>
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
                <Shield size={28} />
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '4px',
              }}>
                VolunteerHub
              </div>
              <div style={{
                color: '#64748b',
                fontSize: '0.9rem',
                lineHeight: 1.6,
              }}>
                Khu vực quản trị hệ thống
              </div>
            </div>

            <div style={sectionLabelStyle}>Điều hướng</div>
            <div style={menuContainerStyle}>
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path}
                  style={getLinkStyle(isActive(item.path))}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            <div style={profileCardStyle}>
              <div style={{ color: '#166534', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tài khoản
              </div>
              <div style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 700 }}>
                Chào mừng, {user?.fullName || 'Quản trị viên'}
              </div>
              <Link
                to="/"
                style={{
                  ...baseLinkStyle,
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #d1d5db',
                }}
              >
                <Home size={18} />
                <span>Trang chủ</span>
              </Link>
              <button
                style={{
                  ...baseLinkStyle,
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                }}
                onClick={() => void logout()}
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main style={mainStyle}>
            <div style={contentWrapStyle}>{children}</div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 999,
              }} 
              onClick={() => setSidebarOpen(false)}
            />
            <aside 
              style={{ 
                ...sidebarStyle, 
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 1000,
                width: '280px',
                display: 'flex',
                flexDirection: 'column',
                transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease',
              }}
            >
              {/* Mobile content same as desktop */}
              <div style={brandBoxStyle}>
                {/* Same brand content */}
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#16a34a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}>
                  <Shield size={28} />
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '4px',
                }}>
                  VolunteerHub
                </div>
                <div style={{
                  color: '#64748b',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                }}>
                  Khu vực quản trị hệ thống
                </div>
              </div>

              <div style={sectionLabelStyle}>Điều hướng</div>
              <div style={menuContainerStyle}>
                {navItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    style={getLinkStyle(isActive(item.path))}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
              <div style={profileCardStyle}>
                <div style={{ color: '#166534', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Tài khoản
                </div>
                <div style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 700 }}>
                  Chào mừng, {user?.fullName || 'Quản trị viên'}
                </div>
                <Link
                  to="/"
                  style={{
                    ...baseLinkStyle,
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #d1d5db',
                  }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Home size={18} />
                  <span>Trang chủ</span>
                </Link>
                <button 
                  style={{
                    ...baseLinkStyle,
                    background: '#fee2e2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                  }}
                  onClick={() => {
                    void logout();
                    setSidebarOpen(false);
                  }}
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Mobile Menu Button */}
        <button 
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1001,
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            background: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            display: 'none',
          }}
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </button>
      </div>
    </>
  );
};

export default AdminLayout;