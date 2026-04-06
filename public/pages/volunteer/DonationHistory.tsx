import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  Calendar, 
  Settings, 
  User as UserIcon,
  Heart,
  Award,
  CreditCard,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { volunteerService } from '../../lib/api';

const DonationHistory: React.FC = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonations = async () => {
            if (!user?.id) return;
            try {
                const response = await volunteerService.getDonations(user.id);
                setDonations(response.data);
            } catch (error) {
                console.error("Lỗi khi tải lịch sử đóng góp:", error);
            } finally {
                setLoading(false);
            }
        };

        void fetchDonations();
    }, [user?.id]);

    const stats = { rank: "Tân binh", points: 0 }; // Lấy từ API nếu cần thiết

    return (
        <div className="volunteer-page py-5">
            <div className="container">
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
                                <Link to="/volunteer/dashboard" className="nav-link text-dark hover-success rounded-3 px-3 py-2 d-flex align-items-center">
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
                                <Link to="/volunteer/donations" className="nav-link active bg-success text-white rounded-3 px-3 py-2 d-flex align-items-center">
                                    <CreditCard size={18} className="me-2" /> Lịch sử đóng góp
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
                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                            <h4 className="fw-bold mb-4">Lịch sử đóng góp</h4>
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-success" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : donations.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table align-middle">
                                        <thead>
                                            <tr>
                                                <th>Ngày đóng góp</th>
                                                <th>Mã giao dịch</th>
                                                <th>Số tiền</th>
                                                <th>Phương thức</th>
                                            
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {donations.map((donation) => (
                                                <tr key={donation.id}>
                                                    <td>{new Date(donation.createdAt).toLocaleDateString('vi-VN')} {new Date(donation.createdAt).toLocaleTimeString('vi-VN')}</td>
                                                    <td><span className="text-muted">{donation.transactionCode}</span></td>
                                                    <td className="fw-bold text-success">{donation.amount.toLocaleString('vi-VN')} đ</td>
                                                    <td>
                                                        <span className="badge bg-light text-dark border">
                                                            {donation.paymentMethod === 'momo' ? 'Ví MoMo' : donation.paymentMethod}
                                                        </span>
                                                    </td>
                                                   
                                                
                                                
                                                                                        
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <Clock size={48} className="mb-3 opacity-50 mx-auto" />
                                    <p>Bạn chưa có lượt đóng góp nào.</p>
                                    <Link to="/donate" className="btn btn-outline-success mt-2">
                                        Đóng góp ngay
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationHistory;