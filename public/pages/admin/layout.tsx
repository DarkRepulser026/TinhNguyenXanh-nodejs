import type { ComponentType, ReactNode } from 'react';
import { FileWarning, LayoutDashboard, ListChecks, Menu, ShieldCheck, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

type AdminLayoutProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  path: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const navItems: NavItem[] = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Approvals', path: '/admin/approvals', icon: ListChecks },
  { label: 'Moderation', path: '/admin/moderation', icon: FileWarning },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Categories', path: '/admin/categories', icon: ShieldCheck },
];

function AdminNav({ closeMobile }: { closeMobile?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ul className="nav flex-column gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.path);

        return (
          <li className="nav-item" key={item.path}>
            <button
              className={`btn w-100 d-flex align-items-center gap-2 text-start ${isActive ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => {
                navigate(item.path);
                if (closeMobile) {
                  closeMobile();
                }
              }}
              type="button"
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <div className="container-fluid px-0 bg-light" style={{ minHeight: '100vh' }}>
      <div className="row g-0" style={{ minHeight: '100vh' }}>
        <aside className="col-md-3 col-lg-2 bg-white border-end d-none d-md-block p-3">
          <h5 className="mb-3">VolunteerHub Admin</h5>
          <AdminNav />
        </aside>

        <div className="col-12 col-md-9 col-lg-10 d-flex flex-column">
          <header className="bg-white border-bottom p-3 d-flex align-items-center justify-content-between sticky-top">
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary d-md-none"
                data-bs-toggle="offcanvas"
                data-bs-target="#adminSidebarCanvas"
                aria-controls="adminSidebarCanvas"
                type="button"
              >
                <Menu size={16} />
              </button>
              <span className="text-muted small">Admin Workspace</span>
            </div>

            <div className="dropdown">
              <button className="btn btn-outline-success dropdown-toggle" data-bs-toggle="dropdown" type="button">
                {user?.fullName || 'Admin User'}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button className="dropdown-item text-danger" onClick={() => void logout()} type="button">
                    Sign out
                  </button>
                </li>
              </ul>
            </div>
          </header>

          <main className="p-3 p-lg-4">{children}</main>
        </div>
      </div>

      <div className="offcanvas offcanvas-start" id="adminSidebarCanvas" tabIndex={-1} aria-labelledby="adminSidebarCanvasLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="adminSidebarCanvasLabel">VolunteerHub Admin</h5>
          <button className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" type="button"></button>
        </div>
        <div className="offcanvas-body">
          <AdminNav closeMobile={() => {
            const canvas = document.getElementById('adminSidebarCanvas');
            if (!canvas) return;
            const api = (window as any).bootstrap?.Offcanvas?.getOrCreateInstance(canvas);
            api?.hide();
          }} />
        </div>
      </div>
    </div>
  );
}
