import React, { useState, useEffect } from 'react';
import { 
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

    const getStatusBadgeClass = (status: string) => {
        if (status === 'Success') return 'bg-success';
        if (status === 'Pending') return 'bg-warning text-dark';
        return 'bg-danger';
    };

    const getStatusLabel = (status: string) => {
        if (status === 'Success') return 'Thành công';
        if (status === 'Pending') return 'Đang xử lý';
        return 'Thất bại';
    };

    return (
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
                                <th>Trạng thái</th>
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
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(donation.status)}`}>
                                            {getStatusLabel(donation.status)}
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
    );
};

export default DonationHistory;