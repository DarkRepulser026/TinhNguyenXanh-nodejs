import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Settings, 
  User as UserIcon,
  Heart,
  TrendingUp,
  Award,
  Layers // Đã thêm Layers vào import để không bị lỗi giao diện
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { volunteerService } from '../../services/api';

const VolunteerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Bắt đầu gọi API lấy dữ liệu thật
    useEffect(() => {
        const fetchDashboard = async () => {
            if (!user?.id) return;
            try {
                const response = await volunteerService.getDashboard(user.id);
                setDashboardData(response.data);
            } catch (error) {
                console.error("Lỗi khi tải Dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchDashboard();
    }, [user?.id]);

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center min-vh-100">Đang tải bảng điều khiển...</div>;
    }
    
    // Ráp dữ liệu từ API hoặc dùng mặc định nếu chưa có
    const stats = dashboardData?.stats || { 
        totalEvents: 0, 
        completedEvents: 0, 
        pendingEvents: 0, 
        totalHours: 0, 
        rank: "Tân binh", 
        points: 0 
    };
    const upcomingEvents = dashboardData?.upcomingEvents || [];

    return (
        <div className="volunteer-page volunteer-dashboard py-5">
            <div className="container">
                <div className="section-header d-flex flex-column flex-md-row align-items-start justify-content-between gap-3 mb-4">
                    <div>
                        <span className="badge bg-success-soft text-success rounded-pill py-2 px-3 mb-3">Trang tình nguyện viên</span>
                        <h1 className="section-title mb-2">Xin chào, {user?.fullName?.split(' ')[0] || 'Tình nguyện viên'}!</h1>
                        <p className="section-subtitle">Xem nhanh kết quả hoạt động, hồ sơ và sự kiện phù hợp với bạn.</p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Link to="/events" className="btn btn-success btn-pill px-4 py-3 shadow-sm">Khám phá sự kiện mới</Link>
                    </div>
                </div>
                <div className="row g-4">
                    {/* Left Sidebar */}
                    <div className="col-lg-3">
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                            <div className="text-center mb-4">
                                <div className="avatar-placeholder bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                    <UserIcon size={40} />
                                </div>
                                <h5 className="fw-bold mb-1">{user?.fullName || 'Tình nguyện viên'}</h5>
                                <p className="text-muted small mb-0">{stats.rank}</p>
                            </div>
                            <hr className="text-muted opacity-25" />
                            <div className="nav flex-column nav-pills gap-2">
                                <Link to="/volunteer/dashboard" className="nav-link active bg-success text-white rounded-3 px-3 py-2 d-flex align-items-center">
                                    <BarChart2 size={18} className="me-2" /> Tổng quan
                                </Link>
                                <Link to="/volunteer/profile" className="nav-link text-dark hover-success rounded-3 px-3 py-2 d-flex align-items-center">
                                    <UserIcon size={18} className="me-2" /> Hồ sơ cá nhân
                                </Link>
                                <Link to="/volunteer/registrations" className="nav-link text-dark hover-success rounded-3 px-3 py-2 d-flex align-items-center">
                                    <Calendar size={18} className="me-2" /> Lịch sử đăng ký
                                </Link>
                                <Link to="/volunteer/favorites" className="nav-link text-dark hover-success rounded-3 px-3 py-2 d-flex align-items-center">
                                    <Heart size={18} className="me-2" /> Yêu thích
                                </Link>
                                <Link to="/account/settings" className="nav-link text-dark hover-success rounded-3 px-3 py-2 d-flex align-items-center mt-2">
                                    <Settings size={18} className="me-2" /> Cài đặt
                                </Link>
                            </div>
                        </div>
                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-gradient-success text-white" style={{ background: 'linear-gradient(135deg, #198754 0%, #20c997 100%)' }}>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h6 className="fw-bold mb-0">Điểm tích lũy</h6>
                                <Award size={24} />
                            </div>
                            <h2 className="fw-bold mb-0">{stats.points}</h2>
                            <p className="small mb-0 opacity-75">Điểm sẽ được dùng để đổi quà tặng</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-lg-9">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="fw-bold mb-0">Bảng điều khiển</h3>
                            <Link to="/events" className="btn btn-outline-success rounded-pill px-4">
                                Khám phá sự kiện mới
                            </Link>
                        </div>

                        {/* Stats Cards */}
                        <div className="row g-4 mb-4">
                            <div className="col-md-3 col-sm-6">
                                <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="p-2 bg-success-subtle text-success rounded-3 me-3">
                                            <Layers size={20} />
                                        </div>
                                        <span className="text-muted fw-medium small">Tổng sự kiện</span>
                                    </div>
                                    <h3 className="fw-bold mb-0 ms-1">{stats.totalEvents}</h3>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="p-2 bg-primary-subtle text-primary rounded-3 me-3">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <span className="text-muted fw-medium small">Đã tham gia</span>
                                    </div>
                                    <h3 className="fw-bold mb-0 ms-1">{stats.completedEvents}</h3>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="p-2 bg-warning-subtle text-warning rounded-3 me-3">
                                            <Clock size={20} />
                                        </div>
                                        <span className="text-muted fw-medium small">Đang chờ</span>
                                    </div>
                                    <h3 className="fw-bold mb-0 ms-1">{stats.pendingEvents}</h3>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <div className="card border-0 shadow-sm rounded-4 p-3 h-100 bg-white">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="p-2 bg-info-subtle text-info rounded-3 me-3">
                                            <TrendingUp size={20} />
                                        </div>
                                        <span className="text-muted fw-medium small">Giờ cống hiến</span>
                                    </div>
                                    <h3 className="fw-bold mb-0 ms-1">{stats.totalHours}h</h3>
                                </div>
                            </div>
                        </div>

                        <div className="row g-4">
                            {/* Upcoming Events */}
                            <div className="col-md-8">
                                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h5 className="fw-bold mb-0">Hoạt động sắp tới</h5>
                                        <Link to="/volunteer/registrations" className="text-success text-decoration-none small fw-medium">Xem tất cả</Link>
                                    </div>
                                    {upcomingEvents.length > 0 ? (
                                        <div className="list-group list-group-flush gap-2">
                                            {upcomingEvents.map((event: any) => (
                                                <div key={event.id} className="list-group-item list-group-item-action rounded-3 border bg-light d-flex justify-content-between align-items-center p-3">
                                                    <div>
                                                        <h6 className="fw-bold mb-1">{event.title}</h6>
                                                        <span className="text-muted small d-flex align-items-center">
                                                            <Calendar size={14} className="me-1" /> {new Date(event.date).toLocaleDateString('vi-VN')}
                                                        </span>
                                                    </div>
                                                    <span className={`badge ${event.status === 'Confirmed' ? 'bg-success' : 'bg-warning text-dark'} rounded-pill px-3 py-2`}>
                                                        {event.status === 'Confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted py-4">
                                            <Calendar size={48} className="mb-3 opacity-50 mx-auto" />
                                            <p>Bạn chưa có hoạt động nào sắp tới.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recommended */}
                            <div className="col-md-4">
                                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                    <h5 className="fw-bold mb-4">Đề xuất cho bạn</h5>
                                    <div className="p-3 bg-success-subtle rounded-4 mb-3 border border-success-subtle">
                                       <h6 className="fw-bold text-success mb-1 small">Chiến dịch mùa hè xanh</h6>
                                       <p className="text-muted x-small mb-2">Dành cho tình nguyện viên hệ Môi trường</p>
                                       <Link to="/events" className="btn btn-success btn-sm rounded-pill px-3 fw-bold w-100">Khám phá</Link>
                                    </div>
                                    <div className="p-3 bg-info-subtle rounded-4 border border-info-subtle">
                                       <h6 className="fw-bold text-info mb-1 small">Gia sư trực tuyến</h6>
                                       <p className="text-muted x-small mb-2">Phù hợp với kinh nghiệm dạy học của bạn</p>
                                       <Link to="/events" className="btn btn-info btn-sm rounded-pill px-3 fw-bold w-100 text-white">Khám phá</Link>
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