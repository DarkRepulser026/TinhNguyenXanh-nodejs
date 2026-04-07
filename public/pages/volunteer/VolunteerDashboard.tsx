import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
    Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { volunteerService } from '../../lib/api';

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
        return (
            <div className="py-5 text-center">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
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
        <div className="volunteer-dashboard">
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                            <div>
                                <h2 className="fw-bold text-success mb-1">Bảng điều khiển</h2>
                                <p className="text-muted mb-0">Theo dõi tổng quan hoạt động tình nguyện của bạn.</p>
                            </div>
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
    );
};

export default VolunteerDashboard;
