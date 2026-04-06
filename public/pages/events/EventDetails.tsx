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
} from 'lucide-react';
import { eventService, getApiErrorMessage, type EventItem, volunteerService } from '../../lib/api';
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

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        const eventResponse = await eventService.getById(id);

        setEvent(eventResponse.data);

        if (user?.id) {
          try {
            const favoritesResponse = await volunteerService.getFavorites(user.id);
            setIsFavorited(favoritesResponse.data.some((item) => item.id === Number(id)));
          } catch {
            setIsFavorited(false);
          }

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
        } else {
          setIsFavorited(false);
          setIsRegistered(false);
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
    if (!event) {
      return 0;
    }

    return Math.min(100, (event.registeredCount / Math.max(1, event.maxVolunteers)) * 100);
  }, [event]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegister = async () => {
    if (!event) {
      return;
    }

    if (isRegistered) {
      if (registrationStatus === 'Pending') {
        setMessage('Bạn đã đăng ký sự kiện này. Đang chờ duyệt.');
      } else {
        setMessage('Bạn đã đăng ký sự kiện này.');
      }
      return;
    }

    if (!user?.id) {
      navigate(`/login?redirect=${encodeURIComponent(`/events/${event.id}`)}`);
      return;
    }

    setShowRegistrationForm(true);
  };

  const handleFavorite = async () => {
    if (!event) {
      return;
    }

    if (!user?.id) {
      navigate(`/login?redirect=${encodeURIComponent(`/events/${event.id}`)}`);
      return;
    }

    try {
      await eventService.toggleFavorite(event.id, user.id);
      setIsFavorited((value) => !value);
      setMessage(isFavorited ? 'Da xoa khoi yeu thich.' : 'Da them vao yeu thich.');
    } catch (e) {
      setMessage(getApiErrorMessage(e, 'Cap nhat yeu thich that bai.'));
    }
  };

  if (loading) {
    return <div className="alert alert-info">Dang tai chi tiet su kien...</div>;
  }

  if (!event) {
    return <div className="alert alert-danger">Khong tim thay su kien.</div>;
  }

  return (
    <div className="event-detail-page bg-light min-vh-100 py-4">
      <div className="container">
        {message && <div className="alert alert-info">{message}</div>}
        {/* Navigation */}
        <nav className="mb-4">
          <Link to="/events" className="text-success text-decoration-none d-flex align-items-center gap-2 fw-500">
            <ArrowLeft size={20} /> Quay lại danh sách
          </Link>
        </nav>

        <div className="row g-4 align-items-start">
          {/* Main Content */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
              <div className="ratio ratio-21x9 bg-secondary">
                <img 
                  src={event.images || 'https://images.unsplash.com/photo-1618477471363-92a18d350e94?auto=format&fit=crop&q=80&w=1000'}
                  className="object-fit-cover" 
                  alt={event.title} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1000';
                  }}
                />
              </div>
              <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-600">
                    {event.categoryName ?? 'Chung'}
                  </span>
                  <span className="text-muted small">•</span>
                  <span className="text-muted small d-flex align-items-center gap-1">
                    <Clock size={14} /> Đăng tải 2 ngày trước
                  </span>
                </div>

                <h1 className="display-6 fw-bold text-dark mb-3">{event.title}</h1>
                
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="bg-success-subtle p-2 rounded-3 border border-success-subtle">
                    <Building2 className="text-success" size={24} />
                  </div>
                  <div>
                    <p className="mb-0 text-muted small uppercase fw-bold tracking-wider">Tổ chức bởi</p>
                    <Link to={`/organizations/1`} className="text-dark fw-bold text-decoration-none h5 mb-0">
                      {event.organizationName ?? 'Chua cap nhat'}
                    </Link>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="row g-3 mb-5">
                  <div className="col-sm-4">
                    <div className="p-3 bg-light rounded-4 text-center border border-white h-100">
                      <Calendar className="text-success mb-2" size={24} />
                      <p className="mb-0 small text-muted">Ngày bắt đầu</p>
                      <p className="mb-0 fw-bold">{formatDate(event.startTime)}</p>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="p-3 bg-light rounded-4 text-center border border-white h-100">
                      <Clock className="text-success mb-2" size={24} />
                      <p className="mb-0 small text-muted">Thời gian</p>
                      <p className="mb-0 fw-bold">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="p-3 bg-light rounded-4 text-center border border-white h-100">
                      <Users className="text-success mb-2" size={24} />
                      <p className="mb-0 small text-muted">Tình nguyện viên</p>
                      <p className="mb-0 fw-bold">{event.registeredCount}/{event.maxVolunteers}</p>
                    </div>
                  </div>
                </div>

                <div className="section-title mb-3">
                  <h4 className="fw-bold d-flex align-items-center gap-2">
                    <CheckCircle2 className="text-success" size={22} /> Mô tả sự kiện
                  </h4>
                </div>
                <div className="event-description text-muted mb-5" style={{ whiteSpace: 'pre-line' }}>
                  {event.description}
                </div>

                <div className="section-title mb-3">
                  <h4 className="fw-bold d-flex align-items-center gap-2">
                    <MapPin className="text-success" size={22} /> Địa điểm
                  </h4>
                </div>
                <div className="p-3 bg-light rounded-4 mb-3 d-flex align-items-center gap-2">
                  <MapPin className="text-success" size={20} />
                  <span className="fw-500">{event.location ?? 'Khong ro dia diem'}</span>
                </div>
                {/* Map Placeholder */}
                {event.mapUrl ? (
                  <div className="ratio ratio-21x9 bg-secondary-subtle rounded-4 overflow-hidden mb-4 border border-white">
                    <iframe
                      src={event.mapUrl}
                      title="Google Maps Location"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                ) : (
                  <div className="ratio ratio-21x9 bg-secondary-subtle rounded-4 overflow-hidden mb-4 border border-white">
                    <div className="d-flex align-items-center justify-content-center text-muted">
                      Bản đồ chưa được thiết lập
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
              <EventReview eventId={event.id} />
            </div>
          </div>

          {/* Sidebar */}
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
                    <div 
                      className="progress-bar bg-success" 
                      role="progressbar" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-muted x-small mb-0">Con {Math.max(0, event.maxVolunteers - event.registeredCount)} cho trong su kien nay.</p>
               </div>

               <div className="d-grid gap-2">
                 <button
                   onClick={handleRegister}
                   disabled={isRegistered || event.registeredCount >= event.maxVolunteers}
                   className="btn btn-success btn-lg rounded-pill fw-bold py-3 shadow-sm border-0 transition-hover"
                 >
                   {registrationStatus === 'Pending'
                     ? 'Đang chờ duyệt'
                     : registrationStatus === 'Confirmed'
                     ? 'Đã đăng ký'
                     : event.registeredCount >= event.maxVolunteers
                     ? 'Đã đủ chỗ'
                     : 'Đăng ký ngay'}
                 </button>
                 <button onClick={handleFavorite} className="btn btn-outline-light text-dark btn-lg rounded-pill fw-bold py-3 border-light-subtle transition-hover d-flex align-items-center justify-content-center gap-2">
                   <Heart size={20} className={isFavorited ? 'text-danger' : ''} fill={isFavorited ? 'currentColor' : 'none'} /> {isFavorited ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
                 </button>
                 <button className="btn btn-outline-light text-secondary btn-lg rounded-pill fw-bold py-3 border-light-subtle transition-hover d-flex align-items-center justify-content-center gap-2">
                   <Share2 size={20} /> Chia sẻ
                 </button>
               </div>
               {isRegistered && (
                 <div className="mt-3 small text-success fw-medium">
                   {registrationStatus === 'Pending'
                     ? 'Bạn đã đăng ký sự kiện này. Đang chờ duyệt.'
                     : registrationStatus === 'Confirmed'
                     ? 'Bạn đã đăng ký sự kiện này. Đăng ký thành công.'
                     : 'Bạn đã đăng ký sự kiện này.'}
                 </div>
               )}

               <div className="mt-5 p-3 rounded-4 bg-light border border-white">
                  <h6 className="fw-bold mb-3">Lợi ích khi tham gia</h6>
                  <ul className="list-unstyled small d-grid gap-2 mb-0">
                    <li className="d-flex align-items-start gap-2">
                      <CheckCircle2 size={16} className="text-success mt-1" />
                      Nhận giấy chứng nhận tình nguyện điện tử
                    </li>
                    <li className="d-flex align-items-start gap-2">
                      <CheckCircle2 size={16} className="text-success mt-1" />
                      Tích lũy 4 giờ hoạt động xã hội
                    </li>
                    <li className="d-flex align-items-start gap-2">
                      <CheckCircle2 size={16} className="text-success mt-1" />
                      Giao lưu, kết nối với cộng đồng sống xanh
                    </li>
                  </ul>
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
