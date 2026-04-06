import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Share2, 
  Heart, 
  ArrowLeft,
  Building2,
  CheckCircle2,
  Flag,
  AlertTriangle, // Thêm icon cảnh báo
  X 
} from 'lucide-react';
// Import thêm moderationService để gọi API báo cáo
import { eventService, getApiErrorMessage, type EventItem, volunteerService, moderationService } from '../../lib/api';
import { useAuth } from '../../contexts/useAuth';
import EventReview from '../../components/EventReview';
import EventRegistrationForm from '../../components/EventRegistrationForm'; 

const EventDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false); // State theo dõi trạng thái gửi

  const reportReasons = [
    'Nội dung sai sự thật',
    'Sự kiện lừa đảo',
    'Ngôn từ không phù hợp',
    'Khác...'
  ];

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const eventResponse = await eventService.getById(id);
        setEvent(eventResponse.data);

        if (user?.id) {
          try {
            const favoritesResponse = await volunteerService.getFavorites(user.id);
            setIsFavorited(favoritesResponse.data.some((item) => item.id === Number(id)));
          } catch { setIsFavorited(false); }

          try {
            const registrationsResponse = await volunteerService.getRegistrations(user.id);
            const registration = registrationsResponse.data.find((item) =>
              item.eventId === Number(id) || String(item.eventId) === id
            );
            if (registration) {
              setIsRegistered(true);
              setRegistrationStatus(registration.status);
            } else {
              setIsRegistered(false);
              setRegistrationStatus(null);
            }
          } catch {
            setIsRegistered(false);
            setRegistrationStatus(null);
          }
        }
      } catch (e) {
        setMessage(getApiErrorMessage(e, 'Khong tai duoc du lieu su kien.'));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, user?.id]);

  const progress = useMemo(() => {
    if (!event) return 0;
    return Math.min(100, (event.registeredCount / Math.max(1, event.maxVolunteers)) * 100);
  }, [event]);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  // GIỮ NGUYÊN LOGIC ĐĂNG KÝ CỦA BẠN
  const handleRegister = async () => {
    if (!event) return;
    if (isRegistered) {
      setMessage(registrationStatus === 'Pending' ? 'Bạn đã đăng ký sự kiện này. Đang chờ duyệt.' : 'Bạn đã đăng ký sự kiện này.');
      return;
    }
    if (!user?.id) {
      navigate(`/login?redirect=${encodeURIComponent(`/events/${event.id}`)}`);
      return;
    }
    setShowRegistrationForm(true);
  };

  // GIỮ NGUYÊN LOGIC YÊU THÍCH CỦA BẠN
  const handleFavorite = async () => {
    if (!event || !user?.id) {
      if (!user?.id) navigate(`/login?redirect=${encodeURIComponent(`/events/${event?.id}`)}`);
      return;
    }
    try {
      await eventService.toggleFavorite(event.id, user.id);
      setIsFavorited((value) => !value);
      setMessage(isFavorited ? 'Đã xóa khỏi yêu thích.' : 'Đã thêm vào yêu thích.');
    } catch (e) {
      setMessage(getApiErrorMessage(e, 'Cập nhật yêu thích thất bại.'));
    }
  };

  // CẬP NHẬT HÀM GỬI BÁO CÁO (KẾT NỐI DATABASE)
  const submitReport = async () => {
    if (!reportReason) {
      alert('Vui lòng chọn lý do báo cáo!');
      return;
    }
    if (!id) return;

    setIsSubmittingReport(true);
    try {
      // Gọi API thực tế để lưu vào database qua moderationService
      await moderationService.reportEvent(id, { 
        reason: reportReason,
        details: `Người dùng báo cáo lý do: ${reportReason}` 
      });

      setShowReportModal(false);
      setReportReason('');
      setMessage('Cảm ơn bạn! Báo cáo của bạn đã được gửi tới hệ thống quản trị.');
      
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      alert(getApiErrorMessage(e, 'Gửi báo cáo thất bại. Vui lòng thử lại sau.'));
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (loading) return <div className="alert alert-info m-4">Đang tải chi tiết sự kiện...</div>;
  if (!event) return <div className="alert alert-danger m-4">Không tìm thấy sự kiện.</div>;

  return (
    <div className="event-detail-page bg-light min-vh-100 py-4">
      {/* Modal Báo Cáo */}
      {showReportModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="fw-bold mb-0 text-danger d-flex align-items-center gap-2">
                  <AlertTriangle size={20} /> Báo cáo sự kiện
                </h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setShowReportModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <p className="text-muted mb-3">Vui lòng chọn lý do báo cáo:</p>
                <div className="d-grid gap-2">
                  {reportReasons.map((reason) => (
                    <div 
                      key={reason} 
                      onClick={() => setReportReason(reason)}
                      className={`p-3 rounded-3 border cursor-pointer transition-all ${reportReason === reason ? 'bg-danger-subtle border-danger text-danger fw-bold' : 'bg-light border-light-subtle text-dark'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => setShowReportModal(false)}>Hủy</button>
                <button 
                  className="btn btn-danger rounded-pill px-4 fw-bold" 
                  onClick={submitReport}
                  disabled={isSubmittingReport}
                >
                  {isSubmittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        {message && <div className="alert alert-info sticky-top mt-2 shadow-sm" style={{ zIndex: 999 }}>{message}</div>}
        
        <nav className="mb-4">
          <Link to="/events" className="text-success text-decoration-none d-flex align-items-center gap-2 fw-500">
            <ArrowLeft size={20} /> Quay lại danh sách
          </Link>
        </nav>

        <div className="row g-4 align-items-start">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div className="ratio ratio-21x9 bg-secondary">
                <img src={event.images || 'https://images.unsplash.com/photo-1618477471363-92a18d350e94?auto=format&fit=crop&q=80&w=1000'} className="object-fit-cover" alt={event.title} />
              </div>
              <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-600">{event.categoryName ?? 'Chung'}</span>
                  <span className="text-muted small">• Đăng tải 2 ngày trước</span>
                </div>
                <h1 className="display-6 fw-bold text-dark mb-3">{event.title}</h1>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="bg-success-subtle p-2 rounded-3 border border-success-subtle"><Building2 className="text-success" size={24} /></div>
                  <div>
                    <p className="mb-0 text-muted small uppercase fw-bold">Tổ chức bởi</p>
                    <Link to={`/organizations/1`} className="text-dark fw-bold text-decoration-none h5 mb-0">{event.organizationName ?? 'Chưa cập nhật'}</Link>
                  </div>
                </div>
                <div className="row g-3 mb-5">
                  <div className="col-sm-4">
                    <div className="p-3 bg-light rounded-4 text-center border border-white h-100">
                      <Calendar className="text-success mb-2" size={24} /><p className="mb-0 small text-muted">Ngày bắt đầu</p><p className="mb-0 fw-bold">{formatDate(event.startTime)}</p>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="p-3 bg-light rounded-4 text-center border border-white h-100">
                      <Clock className="text-success mb-2" size={24} /><p className="mb-0 small text-muted">Thời gian</p><p className="mb-0 fw-bold">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="p-3 bg-light rounded-4 text-center border border-white h-100">
                      <Users className="text-success mb-2" size={24} /><p className="mb-0 small text-muted">Tình nguyện viên</p><p className="mb-0 fw-bold">{event.registeredCount}/{event.maxVolunteers}</p>
                    </div>
                  </div>
                </div>
                <div className="section-title mb-3"><h4 className="fw-bold d-flex align-items-center gap-2"><CheckCircle2 className="text-success" size={22} /> Mô tả sự kiện</h4></div>
                <div className="event-description text-muted mb-5" style={{ whiteSpace: 'pre-line' }}>{event.description}</div>
              </div>
            </div>
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
              <EventReview eventId={event.id} />
            </div>
          </div>

          <div className="col-lg-4">
            {showRegistrationForm ? (
              <div style={{ position: 'sticky', top: '6rem', zIndex: 10 }}>
                <EventRegistrationForm
                  eventId={event.id}
                  eventTitle={event.title}
                  onSuccess={() => {
                    setShowRegistrationForm(false);
                    setIsRegistered(true);
                    setRegistrationStatus('Pending');
                    setEvent((prev) => prev ? { ...prev, registeredCount: prev.registeredCount + 1 } : prev);
                    setMessage('Đăng ký thành công! Đơn của bạn đang chờ duyệt.');
                  }}
                />
              </div>
            ) : (
              <div className="register-card border-0 shadow-sm rounded-4 bg-white p-4" style={{ position: 'sticky', top: '6rem', zIndex: 10 }}>
                <h5 className="fw-bold mb-4">Đăng ký tham gia</h5>
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">Tiến độ tuyển dụng</span>
                    <span className="fw-bold small">{Math.round(progress)}%</span>
                  </div>
                  <div className="progress rounded-pill" style={{ height: '8px' }}>
                    <div className="progress-bar bg-success" role="progressbar" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="mt-2 text-muted x-small mb-0">Còn {Math.max(0, event.maxVolunteers - event.registeredCount)} chỗ trong sự kiện này.</p>
                </div>

                <div className="d-grid gap-2">
                  <button onClick={handleRegister} disabled={isRegistered || event.registeredCount >= event.maxVolunteers} className="btn btn-success btn-lg rounded-pill fw-bold py-3 shadow-sm border-0">
                    {registrationStatus === 'Pending' ? 'Đang chờ duyệt' : registrationStatus === 'Confirmed' ? 'Đã đăng ký' : event.registeredCount >= event.maxVolunteers ? 'Đã đủ chỗ' : 'Đăng ký ngay'}
                  </button>
                  <button onClick={handleFavorite} className="btn btn-outline-light text-dark btn-lg rounded-pill fw-bold py-3 border-light-subtle transition-hover d-flex align-items-center justify-content-center gap-2">
                    <Heart size={20} className={isFavorited ? 'text-danger' : ''} fill={isFavorited ? 'currentColor' : 'none'} /> {isFavorited ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
                  </button>
                  
                  {/* NÚT BÁO CÁO ĐỔI SANG MÀU ĐỎ (btn-danger) */}
                  <button 
                    onClick={() => setShowReportModal(true)} 
                    className="btn btn-danger btn-lg rounded-pill fw-bold py-3 shadow-sm d-flex align-items-center justify-content-center gap-2 transition-hover"
                  >
                    <Flag size={20} /> Báo cáo sự kiện
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;