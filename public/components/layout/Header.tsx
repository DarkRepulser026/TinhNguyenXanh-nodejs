import React from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  CircleHelp,
  ClipboardPen,
  Heart,
  LayoutGrid,
  Shield,
  BriefcaseBusiness,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Search,
  Sparkles,
  ChevronDown,
  User,
  BarChart2,
  Settings,
  LogOut,
  HandCoins, // Thêm icon HandCoins cho Đóng góp
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  const [category, setCategory] = React.useState('');
  const [keyword, setKeyword] = React.useState('');
  const [searchLocation, setSearchLocation] = React.useState('');
  const shouldHideSearchSection =
    location.pathname === '/volunteer' ||
    location.pathname.startsWith('/volunteer/') ||
    location.pathname === '/account' ||
    location.pathname.startsWith('/account/');

  React.useEffect(() => {
    if (!location.pathname.startsWith('/events')) {
      return;
    }

    const params = new URLSearchParams(location.search);
    setCategory(params.get('category') || '');
    setKeyword(params.get('keyword') || '');
    setSearchLocation(params.get('location') || '');
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    await logout();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (category) {
      params.set('category', category);
    }
    if (keyword.trim()) {
      params.set('keyword', keyword.trim());
    }
    if (searchLocation) {
      params.set('location', searchLocation);
    }

    const query = params.toString();
    navigate(query ? `/events?${query}` : '/events');
  };

  return (
    <header className="main-header sticky-top">
      <div className="top-bar d-none d-md-block">
        <div className="container d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-4 small flex-wrap">
            <div className="d-flex align-items-center gap-2 top-bar-item">
              <Mail size={14} />
              <span>lienhe@ketnoixanh.vn</span>
            </div>
            <div className="d-flex align-items-center gap-2 top-bar-item">
              <Phone size={14} />
              <span>0909 123 456</span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 small top-bar-slogan">
            <Heart size={14} fill="currentColor" />
            Cùng nhau xây dựng cộng đồng tốt đẹp
          </div>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg main-navbar border-bottom">
        <div className="container">
          <Link to="/" className="navbar-brand brand-lockup">
            <div style={{ width: '52px', height: '52px' }} className="rounded-3 overflow-hidden border brand-mark">
              <img src="/images/logo.jpg" alt="Logo" className="w-100 h-100 object-fit-cover" />
            </div>
            <div className="brand-copy">
              <span className="brand-title">Ket Noi Xanh</span>
              <span className="brand-subtitle">Volunteer Platform</span>
            </div>
          </Link>

          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
          <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto mb-3 mb-lg-0 main-nav-list">
              <li className="nav-item">
                <NavLink to="/events" className="nav-link main-nav-link d-flex align-items-center gap-1">
                  <Calendar size={16} /> Tình nguyện
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/organizations" className="nav-link main-nav-link d-flex align-items-center gap-1">
                  <Building2 size={16} /> Tổ chức
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/about" className="nav-link main-nav-link d-flex align-items-center gap-1">
                  <CircleHelp size={16} /> Về chúng tôi
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/contact" className="nav-link main-nav-link d-flex align-items-center gap-1">
                  <PhoneCall size={16} /> Liên hệ
                </NavLink>
              </li>
             <li className="nav-item">
               <NavLink to="/donate" className="nav-link main-nav-link d-flex align-items-center gap-1">
                 <HandCoins size={16} /> Đóng góp
               </NavLink>
             </li>
            </ul>

            <div className="d-flex align-items-center gap-2 justify-content-lg-end auth-actions">
              {isAuthenticated ? (
                <div className="dropdown auth-dropdown">
                  <button
                    className="btn btn-outline-success btn-sm d-flex align-items-center gap-2 rounded-pill px-3 profile-btn dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <User size={16} />
                    <span className="profile-name">{user?.fullName || 'Tình nguyện viên'}</span>
                    <ChevronDown size={14} />
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 auth-dropdown-menu">
                    {user?.role === 'Admin' && (
                      <li>
                        <Link to="/admin" className="dropdown-item d-flex align-items-center gap-2">
                          <Shield size={15} /> Trang Quản trị
                        </Link>
                      </li>
                    )}
                    
                    {user?.role === 'Organizer' && (
                      <li>
                        <Link to="/organizer" className="dropdown-item d-flex align-items-center gap-2">
                          <BriefcaseBusiness size={15} /> Quản lý Tổ chức
                        </Link>
                      </li>
                    )}

                    {(!user?.role || user?.role === 'Volunteer') && (
                      <>
                        <li>
                          <Link to="/volunteer/dashboard" className="dropdown-item d-flex align-items-center gap-2">
                            <BarChart2 size={15} /> Tổng quan
                          </Link>
                        </li>
                        <li>
                          <Link to="/volunteer/profile" className="dropdown-item d-flex align-items-center gap-2">
                            <User size={15} /> Hồ sơ cá nhân
                          </Link>
                        </li>
                        <li>
                          <Link to="/volunteer/registrations" className="dropdown-item d-flex align-items-center gap-2">
                            <Calendar size={15} /> Lịch sử đăng ký
                          </Link>
                        </li>
                        <li>
                          <Link to="/volunteer/donations" className="dropdown-item d-flex align-items-center gap-2">
                            <CreditCard size={15} /> Lịch sử đóng góp
                          </Link>
                        </li>
                        
                        <li>
                          <Link to="/volunteer/favorites" className="dropdown-item d-flex align-items-center gap-2">
                            <Heart size={15} /> Yêu thích
                          </Link>
                        </li>
                        <li>
                          <Link to="/organizations/register" className="dropdown-item d-flex align-items-center gap-2">
                            <ClipboardPen size={15} /> Đăng ký Tổ chức
                          </Link>
                        </li>
                        <li>
                          <Link to="/account/settings" className="dropdown-item d-flex align-items-center gap-2">
                            <Settings size={15} /> Cài đặt
                          </Link>
                        </li>
                      </>
                    )}

                    <li><hr className="dropdown-divider" /></li>
                    
                    <li>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="dropdown-item text-danger d-flex align-items-center gap-2"
                      >
                        <LogOut size={15} /> Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-success btn-sm d-flex align-items-center gap-1 rounded-pill px-3">
                    <User size={15} /> Đăng nhập
                  </Link>
                  <Link to="/register" className="btn btn-success btn-sm rounded-pill px-3">Đăng ký</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {!shouldHideSearchSection && (
      <div className="search-section border-bottom">
        <div className="container">
          <div className="search-header d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <span className="search-badge">
                <Sparkles size={14} />
                Tìm nhanh
              </span>
              <span className="search-headline">Khám phá sự kiện tình nguyện phù hợp với bạn</span>
            </div>
            <Link to="/events" className="search-link">Xem tất cả sự kiện</Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="search-form-panel">
            <div className="row g-3 align-items-center">
              <div className="col-lg-3 col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <LayoutGrid size={16} />
                  </span>
                  <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Tất cả danh mục</option>
                    <option value="1">Môi trường</option>
                    <option value="2">Giáo dục</option>
                    <option value="3">Y tế</option>
                    <option value="4">Cộng đồng</option>
                  </select>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tìm kiếm sự kiện, tổ chức..."
                  />
                </div>
              </div>

              <div className="col-lg-3 col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <MapPin size={16} />
                  </span>
                  <select
                    className="form-select"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  >
                    <option value="">Tất cả khu vực</option>
                    <option value="TP.HCM">TP. Hồ Chí Minh</option>
                    <option value="Ha Noi">Hà Nội</option>
                    <option value="Da Nang">Đà Nẵng</option>
                    <option value="Can Tho">Cần Thơ</option>
                  </select>
                </div>
              </div>

              <div className="col-lg-2 col-md-6">
                <button type="submit" className="btn btn-search w-100">
                  <Search size={16} className="me-2" /> Tìm kiếm
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      )}
    </header>
  );
};

export default Header;
