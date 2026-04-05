import React, { useState } from 'react';
import { eventService, getApiErrorMessage } from '../services/api';
import { useAuth } from '../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, User, Phone, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

interface EventRegistrationFormProps {
  eventId: number;
  eventTitle: string;
  onSuccess?: () => void;
}

const EventRegistrationForm: React.FC<EventRegistrationFormProps> = ({
  eventId,
  eventTitle,
  onSuccess,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!/^[0-9]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      Swal.fire('Lỗi', 'Vui lòng đăng nhập để đăng ký.', 'warning');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await eventService.register(eventId, {
        userId: user.id,
        fullName: formData.fullName,
        phone: formData.phone,
      });

      Swal.fire({
        title: 'Đăng ký thành công!',
        text: 'Đơn đăng ký của bạn đã được gửi. Vui lòng chờ phê duyệt từ người tổ chức.',
        icon: 'success',
        confirmButtonText: 'Xem lịch sử đăng ký',
      }).then(result => {
        if (result.isConfirmed) {
          navigate('/volunteer/registrations');
        }
      });

      onSuccess?.();
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        reason: '',
      });
    } catch (error) {
      Swal.fire('Lỗi', getApiErrorMessage(error, 'Không thể đăng ký sự kiện.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-registration-form">
      <div className="card border-0 shadow-lg rounded-4 p-5 bg-white">
        <div className="mb-4">
          <h3 className="fw-bold mb-2">Đăng ký tham gia</h3>
          <p className="text-muted mb-0">Sự kiện: <span className="fw-semibold text-success">{eventTitle}</span></p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="form-label fw-semibold d-flex align-items-center gap-2">
              <User size={18} className="text-success" />
              Họ và tên
            </label>
            <input
              type="text"
              name="fullName"
              className={`form-control form-control-lg rounded-3 ${errors.fullName ? 'is-invalid' : ''}`}
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên của bạn"
              disabled={loading}
            />
            {errors.fullName && (
              <div className="invalid-feedback d-block mt-1">{errors.fullName}</div>
            )}
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="form-label fw-semibold d-flex align-items-center gap-2">
              <Phone size={18} className="text-success" />
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              className={`form-control form-control-lg rounded-3 ${errors.phone ? 'is-invalid' : ''}`}
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại (10-15 chữ số)"
              disabled={loading}
            />
            {errors.phone && (
              <div className="invalid-feedback d-block mt-1">{errors.phone}</div>
            )}
          </div>

          {/* Reason (Optional) */}
          <div className="mb-4">
            <label className="form-label fw-semibold d-flex align-items-center gap-2">
              <FileText size={18} className="text-success" />
              Lý do tham gia (tùy chọn)
            </label>
            <textarea
              name="reason"
              className="form-control rounded-3"
              rows={3}
              value={formData.reason}
              onChange={handleChange}
              placeholder="Chia sẻ lý do bạn muốn tham gia sự kiện này..."
              disabled={loading}
            />
            <small className="text-muted d-block mt-1">Giới hạn: 500 ký tự</small>
          </div>

          {/* Info Box */}
          <div className="alert alert-info-subtle border border-info-subtle rounded-3 p-3 mb-4">
            <div className="d-flex align-items-start gap-2">
              <CheckCircle2 size={20} className="text-info flex-shrink-0 mt-1" />
              <div>
                <strong>Thông tin quan trọng:</strong>
                <ul className="mb-0 mt-2 ps-3">
                  <li>Vui lòng điền đầy đủ thông tin cá nhân của bạn</li>
                  <li>Số điện thoại sẽ được sử dụng để liên hệ về sự kiện</li>
                  <li>Đơn đăng ký của bạn sẽ được xét duyệt trong vòng 24-48 giờ</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="d-grid gap-2">
            <button
              type="submit"
              className="btn btn-success btn-lg rounded-pill fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} className="me-2" />
                  Gửi đơn đăng ký
                </>
              )}
            </button>
          </div>
        </form>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-top">
          <p className="text-muted small mb-0">
            Bằng việc đăng ký, bạn đồng ý với <a href="/terms" className="text-success text-decoration-none">Điều khoản dịch vụ</a> và <a href="/privacy" className="text-success text-decoration-none">Chính sách bảo mật</a> của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationForm;
