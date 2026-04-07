import React, { useState, useEffect } from 'react';
import { 
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { getApiErrorMessage, volunteerService } from '../../lib/api';

const DonationHistory: React.FC = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDonations = async () => {
            if (!user?.id) return;
            try {
                const response = await volunteerService.getDonations(user.id);
                setDonations(response.data);
            } catch (e) {
                setError(getApiErrorMessage(e, 'Không tải được lịch sử đóng góp.'));
            } finally {
                setLoading(false);
            }
        };

        void fetchDonations();
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

    if (error) {
        return <div className="alert alert-danger rounded-4">{error}</div>;
    }

    return (
        <div>
                        <div className="mb-4">
                            <h2 className="fw-bold text-success mb-1">Lịch sử đóng góp</h2>
                            <p className="text-muted mb-0">Theo dõi các khoản đóng góp bạn đã thực hiện.</p>
                        </div>

                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                            {donations.length > 0 ? (
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
    );
};

export default DonationHistory;