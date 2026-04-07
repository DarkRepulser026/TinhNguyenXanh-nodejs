import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  MapPin,
  Search,
  Trash2,
  XSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getApiErrorMessage, type RegistrationItem, volunteerService } from '../../lib/api';
import { useAuth } from '../../contexts/useAuth';

const FALLBACK_EVENT_IMAGE = '/images/volunteer_team.png';

const MyRegistrations: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Confirmed' | 'Pending' | 'Rejected'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        setError('Vui lòng đăng nhập để xem đăng ký.');
        return;
      }

      try {
        const response = await volunteerService.getRegistrations(user.id);
        setRegistrations(response.data);
      } catch (e) {
        setError(getApiErrorMessage(e, 'Không tải được danh sách đăng ký.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user?.id]);

  const handleCancelRegistration = (id: number) => {
    Swal.fire({
      title: 'Hủy đăng ký?',
      text: 'Bạn có chắc muốn hủy đăng ký tham gia sự kiện này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Có, hủy ngay',
      cancelButtonText: 'Đóng',
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (!user?.id) {
          return;
        }

        await volunteerService.cancelRegistration(user.id, id);
        setRegistrations((prev) => prev.filter((r) => r.id !== id));
        Swal.fire('Đã hủy!', 'Hồ sơ đăng ký của bạn đã được xóa.', 'success');
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill py-2 px-3">
            <CheckCircle2 size={16} className="me-1" /> Đã chấp nhận
          </span>
        );
      case 'Pending':
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill py-2 px-3">
            <Clock size={16} className="me-1" /> Chờ phê duyệt
          </span>
        );
      case 'Rejected':
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill py-2 px-3">
            <XSquare size={16} className="me-1" /> Đã từ chối
          </span>
        );
      default:
        return null;
    }
  };

  const filteredRegistrations = registrations
    .filter((r) => filter === 'All' || r.status === filter)
    .filter(
      (r) =>
        r.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.eventLocation ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-bold text-success mb-1">Cá nhân & Đăng ký</h2>
              <p className="text-muted mb-0">Quản lý lịch sử tham gia hoạt động tình nguyện của bạn</p>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <div className="position-relative" style={{ width: '250px', maxWidth: '100%' }}>
                <Search className="position-absolute top-50 inset-s-0 translate-middle-y ms-3 text-muted" size={16} />
                <input
                  type="text"
                  className="form-control form-control-sm ps-5 rounded-pill shadow-sm"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-outline-success rounded-pill px-3 shadow-sm dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <Filter size={16} className="me-1" /> {filter === 'All' ? 'Tất cả' : filter}
                </button>
                <ul className="dropdown-menu shadow border-0 rounded-4 mt-2 px-2 py-2">
                  <li>
                    <button className={`dropdown-item rounded-pill ${filter === 'All' ? 'active bg-success' : ''}`} onClick={() => setFilter('All')}>
                      Tất cả
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item rounded-pill ${filter === 'Confirmed' ? 'active bg-success' : ''}`}
                      onClick={() => setFilter('Confirmed')}
                    >
                      Đã chấp nhận
                    </button>
                  </li>
                  <li>
                    <button className={`dropdown-item rounded-pill ${filter === 'Pending' ? 'active bg-success' : ''}`} onClick={() => setFilter('Pending')}>
                      Chờ phê duyệt
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item rounded-pill ${filter === 'Rejected' ? 'active bg-success' : ''}`}
                      onClick={() => setFilter('Rejected')}
                    >
                      Đã từ chối
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row g-4 mt-2">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-white">
                <div className="badge bg-success-subtle text-success p-3 rounded-circle mb-3 mx-auto" style={{ width: 'fit-content' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="fw-bold text-success mb-1">{registrations.filter((r) => r.status === 'Confirmed').length}</h3>
                <p className="text-muted mb-0">Đã đăng ký thành công</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-white">
                <div className="badge bg-warning-subtle text-warning p-3 rounded-circle mb-3 mx-auto" style={{ width: 'fit-content' }}>
                  <Clock size={32} />
                </div>
                <h3 className="fw-bold text-warning mb-1">{registrations.filter((r) => r.status === 'Pending').length}</h3>
                <p className="text-muted mb-0">Đang chờ xét duyệt</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center bg-light">
                <div className="badge bg-secondary-subtle text-secondary p-3 rounded-circle mb-3 mx-auto" style={{ width: 'fit-content' }}>
                  <Calendar size={32} />
                </div>
                <h3 className="fw-bold text-secondary mb-1">0</h3>
                <p className="text-muted mb-0">Sự kiện đã tham gia</p>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 mt-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light text-muted fw-semi-bold">
                  <tr>
                    <th className="py-3 px-4 border-0">Sự kiện</th>
                    <th className="py-3 px-4 border-0 text-center">Ngày đăng ký</th>
                    <th className="py-3 px-4 border-0 text-center">Địa điểm & Thời gian</th>
                    <th className="py-3 px-4 border-0 text-center">Trạng thái</th>
                    <th className="py-3 px-4 border-0 text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-5 text-center text-muted">
                        <AlertOctagon size={40} className="mb-2 d-block mx-auto opacity-50" />
                        <p className="mb-0 fw-medium">Không tìm thấy yêu cầu đăng ký nào.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="transition-all">
                        <td className="py-4 px-4">
                          <div className="d-flex align-items-center">
                            <div className="me-3 position-relative" style={{ width: '64px', height: '64px' }}>
                              <img
                                src={reg.thumbnail || FALLBACK_EVENT_IMAGE}
                                className="w-100 h-100 object-fit-cover rounded-3 shadow-sm"
                                alt={reg.eventTitle}
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.onerror = null;
                                  target.src = FALLBACK_EVENT_IMAGE;
                                }}
                              />
                            </div>
                            <div>
                              <h6 className="fw-bold mb-1 line-clamp-1">{reg.eventTitle}</h6>
                              <div className="text-muted small">ID: REG-{reg.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-muted fw-medium">{reg.registrationDate}</td>
                        <td className="py-4 px-4 text-center">
                          <div className="d-flex flex-column align-items-center gap-1">
                            <span className="small text-muted d-flex align-items-center">
                              <MapPin size={12} className="me-1" /> {reg.eventLocation ?? 'Không rõ địa điểm'}
                            </span>
                            <span className="small text-muted d-flex align-items-center">
                              <Calendar size={12} className="me-1" /> {new Date(reg.eventDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">{getStatusBadge(reg.status)}</td>
                        <td className="py-4 px-4 text-end">
                          <div className="d-flex gap-2 justify-content-end">
                            <Link to={`/events/${reg.eventId}`} className="btn btn-sm btn-light rounded-circle shadow-sm" title="Xem sự kiện">
                              <Eye size={18} className="text-success" />
                            </Link>
                            {reg.status === 'Pending' && (
                              <button
                                onClick={() => handleCancelRegistration(reg.id)}
                                className="btn btn-sm btn-light rounded-circle shadow-sm border-danger-subtle p-2"
                                title="Hủy đăng ký"
                              >
                                <Trash2 size={18} className="text-danger" />
                              </button>
                            )}
                            <button className="btn btn-sm btn-light rounded-circle shadow-sm hover-bg-success-subtle">
                              <ChevronRight size={18} className="text-muted" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
};

export default MyRegistrations;
