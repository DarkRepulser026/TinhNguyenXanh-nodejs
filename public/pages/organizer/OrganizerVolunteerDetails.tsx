import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CalendarDays,
  ClipboardList,
  Eye,
  FileText,
  Save,
  ShieldCheck,
  Star,
  UserCircle2,
} from 'lucide-react';
import OrganizerLayout from './OrganizerLayout';
import {
  getApiErrorMessage,
  organizerService,
  type OrganizerRegistrationDetail,
  type VolunteerEvaluationItem,
} from '../../lib/api';

const emptyDetail: OrganizerRegistrationDetail = {
  id: '',
  status: '',
  fullName: '',
  phone: null,
  reason: null,
  registeredAt: '',
  event: {
    id: '',
    title: '',
    startTime: '',
    endTime: '',
    location: null,
    status: '',
  },
  volunteer: {
    id: null,
    userId: null,
    fullName: '',
    phone: null,
  },
};

const sectionTitleStyle: CSSProperties = {
  color: '#0f172a',
  fontSize: '1.2rem',
  fontWeight: 700,
  marginBottom: '1.25rem',
  paddingBottom: '0.75rem',
  borderBottom: '2px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const cardStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '1.75rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  marginBottom: '1.5rem',
};

const inputStyle: CSSProperties = {
  border: '2px solid #e2e8f0',
  borderRadius: '10px',
  padding: '12px 14px',
  fontSize: '0.95rem',
};

const labelStyle: CSSProperties = {
  fontWeight: 600,
  color: '#0f172a',
  marginBottom: '8px',
  display: 'block',
  fontSize: '0.95rem',
};

const infoBoxStyle: CSSProperties = {
  background: '#f8fafc',
  border: '1px solid #e5e7eb',
  borderRadius: '14px',
  padding: '16px',
  height: '100%',
};

const statusBadgeStyle = (status: string): CSSProperties => {
  if (status === 'Pending') {
    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: '999px',
      background: '#fef3c7',
      color: '#92400e',
      fontSize: '12px',
      fontWeight: 700,
    };
  }

  if (status === 'Confirmed') {
    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: '999px',
      background: '#dcfce7',
      color: '#166534',
      fontSize: '12px',
      fontWeight: 700,
    };
  }

  if (status === 'Rejected') {
    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: '999px',
      background: '#fee2e2',
      color: '#991b1b',
      fontSize: '12px',
      fontWeight: 700,
    };
  }

  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '999px',
    background: '#e5e7eb',
    color: '#374151',
    fontSize: '12px',
    fontWeight: 700,
  };
};

const OrganizerVolunteerDetails = () => {
  const { id } = useParams();

  const [detail, setDetail] = useState<OrganizerRegistrationDetail>(emptyDetail);
  const [evaluation, setEvaluation] = useState<VolunteerEvaluationItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [evaluationLoading, setEvaluationLoading] = useState(true);
  const [savingEvaluation, setSavingEvaluation] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  const loadEvaluation = async (registrationId: string) => {
    try {
      setEvaluationLoading(true);
      setEvaluationError(null);

      const response = await organizerService.getRegistrationEvaluation(registrationId);
      const item = response.data.item || null;

      setEvaluation(item);
      setRating(String(item?.rating ?? 5));
      setComment(item?.comment ?? '');
    } catch (err) {
      setEvaluationError(getApiErrorMessage(err, 'Không thể tải đánh giá tình nguyện viên.'));
    } finally {
      setEvaluationLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Thiếu registration id.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await organizerService.getRegistrationById(id);
        setDetail(response.data);

        await loadEvaluation(id);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Không thể tải chi tiết đăng ký.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const saveEvaluation = async () => {
    if (!id) return;

    if (detail.status !== 'Confirmed') {
      setEvaluationError('Chỉ đăng ký đã được duyệt mới có thể đánh giá.');
      setSuccess(null);
      return;
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      setEvaluationError('Điểm đánh giá phải từ 1 đến 5.');
      setSuccess(null);
      return;
    }

    try {
      setSavingEvaluation(true);
      setEvaluationError(null);
      setSuccess(null);

      const response = await organizerService.saveRegistrationEvaluation(id, {
        rating: numericRating,
        comment: comment.trim() || undefined,
      });

      setEvaluation(response.data);
      setRating(String(response.data.rating));
      setComment(response.data.comment || '');
      setSuccess('Lưu đánh giá tình nguyện viên thành công.');
    } catch (err) {
      setEvaluationError(getApiErrorMessage(err, 'Không thể lưu đánh giá tình nguyện viên.'));
      setSuccess(null);
    } finally {
      setSavingEvaluation(false);
    }
  };

  return (
    <OrganizerLayout>
      <div
        style={{
          background: '#ffffff',
          minHeight: '100vh',
          padding: '3rem 0',
        }}
      >
        <div className="container">
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, #16a34a, #10b981)',
              }}
            />

            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <h1
                  style={{
                    color: '#0f172a',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                  }}
                >
                  Chi tiết{' '}
                  <span style={{ color: '#16a34a' }}>tình nguyện viên</span>
                </h1>

                <p
                  style={{
                    color: '#64748b',
                    fontSize: '1rem',
                    marginBottom: 0,
                  }}
                >
                  Xem hồ sơ volunteer, thông tin đăng ký và đánh giá mức độ tham gia.
                </p>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <Link
                  to="/organizer/volunteers"
                  style={{
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #d1d5db',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Eye size={16} />
                  Quay lại
                </Link>

                {detail.volunteer.id ? (
                  <Link
                    to={`/organizer/volunteers/${detail.volunteer.id}/history`}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <ClipboardList size={16} />
                    Xem lịch sử
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {loading ? <div className="alert alert-info rounded-4">Đang tải chi tiết đăng ký...</div> : null}
          {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}
          {success ? <div className="alert alert-success rounded-4">{success}</div> : null}

          {!loading && !error ? (
            <>
              <div className="row g-4">
                <div className="col-lg-6">
                  <div style={cardStyle}>
                    <div style={sectionTitleStyle}>
                      <UserCircle2 size={22} color="#16a34a" />
                      <span>Thông tin tình nguyện viên</span>
                    </div>

                    <div className="row g-3">
                      <div className="col-12">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">Họ tên</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {detail.volunteer.fullName || detail.fullName}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">Số điện thoại</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {detail.volunteer.phone || detail.phone || 'Chưa cập nhật'}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">Volunteer ID</div>
                          <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-word' }}>
                            {detail.volunteer.id || '-'}
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">User ID</div>
                          <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-word' }}>
                            {detail.volunteer.userId || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={cardStyle}>
                    <div style={sectionTitleStyle}>
                      <FileText size={22} color="#16a34a" />
                      <span>Thông tin đăng ký</span>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">Registration ID</div>
                          <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-word' }}>
                            {detail.id}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">Trạng thái</div>
                          <div>
                            <span style={statusBadgeStyle(detail.status)}>
                              {detail.status === 'Pending'
                                ? 'Chờ duyệt'
                                : detail.status === 'Confirmed'
                                  ? 'Đã duyệt'
                                  : detail.status === 'Rejected'
                                    ? 'Đã từ chối'
                                    : detail.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">Thời gian đăng ký</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {detail.registeredAt ? new Date(detail.registeredAt).toLocaleString('vi-VN') : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">Lý do đăng ký</div>
                          <div style={{ color: '#374151', lineHeight: 1.7 }}>
                            {detail.reason || 'Không có lý do đăng ký'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div style={cardStyle}>
                    <div style={sectionTitleStyle}>
                      <CalendarDays size={22} color="#16a34a" />
                      <span>Thông tin sự kiện</span>
                    </div>

                    <div className="row g-3">
                      <div className="col-12">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">Tên sự kiện</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {detail.event.title}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">Trạng thái sự kiện</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {detail.event.status || '-'}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">Địa điểm</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {detail.event.location || 'Chưa cập nhật'}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">Bắt đầu</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {detail.event.startTime ? new Date(detail.event.startTime).toLocaleString('vi-VN') : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">Kết thúc</div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {detail.event.endTime ? new Date(detail.event.endTime).toLocaleString('vi-VN') : '-'}
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <div style={infoBoxStyle}>
                          <div className="text-muted small mb-2">Event ID</div>
                          <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-word' }}>
                            {detail.event.id}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={cardStyle}>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                      <div style={sectionTitleStyle}>
                        <Star size={22} color="#16a34a" />
                        <span>Đánh giá tình nguyện viên</span>
                      </div>

                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '6px 10px',
                          borderRadius: '999px',
                          background: evaluation ? '#dcfce7' : '#f3f4f6',
                          color: evaluation ? '#166534' : '#4b5563',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                      >
                        {evaluation ? 'Đã có đánh giá' : 'Chưa có đánh giá'}
                      </span>
                    </div>

                    {evaluationLoading ? (
                      <div className="alert alert-info rounded-4">Đang tải đánh giá hiện tại...</div>
                    ) : null}

                    {evaluationError ? (
                      <div className="alert alert-danger rounded-4">{evaluationError}</div>
                    ) : null}

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Điểm đánh giá</label>
                        <select
                          className="form-select"
                          style={inputStyle}
                          disabled={detail.status !== 'Confirmed' || savingEvaluation}
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                        >
                          <option value="1">1 sao</option>
                          <option value="2">2 sao</option>
                          <option value="3">3 sao</option>
                          <option value="4">4 sao</option>
                          <option value="5">5 sao</option>
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Điều kiện đánh giá</label>
                        <input
                          className="form-control"
                          disabled
                          style={{ ...inputStyle, background: '#f8fafc' }}
                          value={detail.status === 'Confirmed' ? 'Có thể đánh giá' : 'Chưa thể đánh giá'}
                        />
                      </div>

                      <div className="col-12 mb-3">
                        <label style={labelStyle}>Nhận xét</label>
                        <textarea
                          className="form-control"
                          rows={5}
                          disabled={detail.status !== 'Confirmed' || savingEvaluation}
                          style={inputStyle}
                          placeholder="Nhập nhận xét về thái độ, tinh thần trách nhiệm và khả năng hợp tác..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </div>

                      <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                          {evaluation
                            ? `Cập nhật lần cuối: ${new Date(evaluation.updatedAt).toLocaleString('vi-VN')}`
                            : 'Chưa có đánh giá nào được lưu.'}
                        </div>

                        <button
                          type="button"
                          disabled={detail.status !== 'Confirmed' || savingEvaluation}
                          onClick={() => void saveEvaluation()}
                          style={{
                            background: '#16a34a',
                            color: '#fff',
                            border: 'none',
                            padding: '12px 18px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: detail.status !== 'Confirmed' || savingEvaluation ? 0.5 : 1,
                          }}
                        >
                          <Save size={18} />
                          {savingEvaluation ? 'Đang lưu...' : evaluation ? 'Cập nhật đánh giá' : 'Lưu đánh giá'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={sectionTitleStyle}>
                  <ShieldCheck size={22} color="#16a34a" />
                  <span>Gợi ý xử lý</span>
                </div>

                <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: 0 }}>
                  Bạn chỉ có thể đánh giá volunteer khi đăng ký đã ở trạng thái <strong>Đã duyệt</strong>.
                  Nếu cần xem thêm lịch sử tham gia của volunteer này, hãy dùng nút <strong>Xem lịch sử</strong> ở phía trên.
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default OrganizerVolunteerDetails;
