import React from 'react';
import { 
  BarChart2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Heart,
  TrendingUp,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

const VolunteerDashboard: React.FC = () => {
    // Placeholder Data
    const stats = {
        totalEvents: 12,
        completedEvents: 8,
        pendingEvents: 4,
        totalHours: 48,
        rank: "Silver Volunteer",
        points: 1250
    };

    const upcomingEvents = [
        { id: 1, title: "Làm sạch bãi biển", date: "15/06/2026", status: "Chờ xác nhận" },
        { id: 2, title: "Dạy học vùng cao", date: "10/07/2026", status: "Đã xác nhận" }
    ];

    return (
        <div className="volunteer-dashboard py-4 bg-light min-vh-100">
            <div className="container">
                <div className="row g-4">
                    {/* Left Sidebar */}
                    <div className="col-lg-3">
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                            <div className="text-center mb-4">
                               <div className="rounded-circle bg-success shadow-sm mx-auto d-flex align-items-center justify-content-center text-white display-5 fw-bold mb-3" style={{ width: '80px', height: '80px' }}>
                                 TV
                               </div>
                               <h5 className="fw-bold mb-1">Tình Nguyện Viên</h5>
                               <p className="text-muted small">Thành viên từ 2024</p>
                               <div className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2 fw-600 mb-0">
                                  <Award size={16} className="me-1 mb-1" /> {stats.rank}
                               </div>
                            </div>

                            <hr className="my-4 border-light-subtle" />

                            <div className="nav flex-column gap-2">
                                <Link to="/dashboard" className="nav-link active bg-success text-white rounded-3 p-3 fw-600 d-flex align-items-center gap-2">
                                    <BarChart2 size={20} /> Tổng quan
                                </Link>
                                <Link to="/my-events" className="nav-link text-muted rounded-3 p-3 fw-500 d-flex align-items-center gap-2 hover-bg-light">
                                    <Calendar size={20} /> Hoạt động của tôi
                                </Link>
                                <Link to="/favorites" className="nav-link text-muted rounded-3 p-3 fw-500 d-flex align-items-center gap-2 hover-bg-light">
                                    <Heart size={20} /> Danh sách yêu thích
                                </Link>
                                <hr className="my-4 border-light-subtle" />
                                <Link to="/profile" className="nav-link text-muted rounded-3 p-3 fw-500 d-flex align-items-center gap-2 hover-bg-light">
                                    <UserIcon size={20} /> Hồ sơ cá nhân
                                </Link>
                                <Link to="/settings" className="nav-link text-muted rounded-3 p-3 fw-500 d-flex align-items-center gap-2 hover-bg-light">
                                    <Settings size={20} /> Cài đặt
                                </Link>
                                <button className="nav-link text-danger rounded-3 p-3 fw-600 d-flex align-items-center gap-2 mt-4 hover-bg-danger-subtle">
                                    <LogOut size={20} /> Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-lg-9">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="fw-bold mb-0">Xin chào, Trần Văn A</h3>
                            <div className="text-muted small">Cập nhật lần cuối: 10 phút trước</div>
                        </div>

                        {/* Stats Cards */}
                        <div className="row g-4 mb-4">
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 position-relative overflow-hidden">
                                    <div className="position-absolute end-0 top-0 p-3 opacity-10">
                                      <Calendar size={60} />
                                    </div>
                                    <p className="text-muted small mb-2 fw-600">Tổng sự kiện</p>
                                    <h2 className="fw-bold text-dark mb-0">{stats.totalEvents}</h2>
                                    <span className="text-success small d-flex align-items-center gap-1 mt-2">
                                        <TrendingUp size={14} /> +2 tháng này
                                    </span>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 position-relative overflow-hidden">
                                    <div className="position-absolute end-0 top-0 p-3 opacity-10">
                                      <CheckCircle2 size={60} />
                                    </div>
                                    <p className="text-muted small mb-2 fw-600">Đã hoàn thành</p>
                                    <h2 className="fw-bold text-success mb-0">{stats.completedEvents}</h2>
                                    <p className="text-muted x-small mt-2">Đã xác nhận sự tham gia</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 position-relative overflow-hidden">
                                    <div className="position-absolute end-0 top-0 p-3 opacity-10">
                                      <Clock size={60} />
                                    </div>
                                    <p className="text-muted small mb-2 fw-600">Tổng số giờ</p>
                                    <h2 className="fw-bold text-primary mb-0">{stats.totalHours}h</h2>
                                    <p className="text-muted x-small mt-2">Giờ cống hiến thực tế</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 position-relative overflow-hidden">
                                    <div className="position-absolute end-0 top-0 p-3 opacity-10">
                                      <Award size={60} />
                                    </div>
                                    <p className="text-muted small mb-2 fw-600">Điểm cống hiến</p>
                                    <h2 className="fw-bold text-warning mb-0">{stats.points}</h2>
                                    <p className="text-muted x-small mt-2">Điểm thưởng BXH</p>
                                </div>
                            </div>
                        </div>

                        {/* Activity Row */}
                        <div className="row g-4">
                            <div className="col-md-7">
                                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0">Sự kiện sắp tới</h5>
                                        <Link to="/my-events" className="text-success small text-decoration-none">Xem thêm</Link>
                                    </div>
                                    <div className="d-grid gap-3">
                                        {upcomingEvents.map(evt => (
                                            <div key={evt.id} className="p-3 bg-light rounded-4 d-flex align-items-center justify-content-between border border-white">
                                                <div className="d-flex align-items-center gap-3">
                                                   <div className="p-2 bg-white rounded-3 shadow-sm">
                                                      <Calendar className="text-success" size={24} />
                                                   </div>
                                                   <div>
                                                      <h6 className="fw-bold mb-0">{evt.title}</h6>
                                                      <p className="text-muted x-small mb-0">{evt.date}</p>
                                                   </div>
                                                </div>
                                                <div className={`badge rounded-pill px-3 py-2 small fw-600 ${evt.status === 'Đã xác nhận' ? 'bg-success text-white' : 'bg-warning-subtle text-warning'}`}>
                                                   {evt.status}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-md-5">
                                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                    <h5 className="fw-bold mb-4">Đề xuất cho bạn</h5>
                                    <div className="p-3 bg-success-subtle rounded-4 mb-3 border border-success-subtle">
                                       <h6 className="fw-bold text-success mb-1 small">Chiến dịch mùa hè xanh</h6>
                                       <p className="text-muted x-small mb-2">Dành cho tình nguyện viên hệ Môi trường</p>
                                       <button className="btn btn-success btn-sm rounded-pill px-3 fw-bold w-100">Khám phá</button>
                                    </div>
                                    <div className="p-3 bg-info-subtle rounded-4 border border-info-subtle">
                                       <h6 className="fw-bold text-info mb-1 small">Gia sư trực tuyến</h6>
                                       <p className="text-muted x-small mb-2">Phù hợp với kinh nghiệm dạy học của bạn</p>
                                       <button className="btn btn-info btn-sm rounded-pill px-3 fw-bold w-100 text-white">Khám phá</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;

