import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ClipboardList, History, MapPin } from 'lucide-react';
import OrganizerLayout from './OrganizerLayout';
import {
  getApiErrorMessage,
  organizerService,
  type OrganizerVolunteerHistoryItem,
} from '../../services/api';

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

const OrganizerVolunteerHistory = () => {
  const { id } = useParams();
  const [items, setItems] = useState<OrganizerVolunteerHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Thiếu volunteer id.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await organizerService.getVolunteerHistory(id);
        setItems(response.data.items || []);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Không thể tải lịch sử tình nguyện viên.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const summary = useMemo(() => {
    const total = items.length;
    const confirmed = items.filter((item) => item.status === 'Confirmed').length;
    const pending = items.filter((item) => item.status === 'Pending').length;
    const rejected = items.filter((item) => item.status === 'Rejected').length;

    return { total, confirmed, pending, rejected };
  }, [items]);

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
                  Lịch sử{' '}
                  <span style={{ color: '#16a34a' }}>tình nguyện viên</span>
                </h1>

                <p
                  style={{
                    color: '#64748b',
                    fontSize: '1rem',
                    marginBottom: 0,
                  }}
                >
                  Xem các lần đăng ký sự kiện thuộc tổ chức của bạn của volunteer này.
                </p>
              </div>

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
                <ArrowLeft size={16} />
                Quay lại
              </Link>
            </div>
          </div>

          {loading ? <div className="alert alert-info rounded-4">Đang tải lịch sử volunteer...</div> : null}
          {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}

          {!loading && !error ? (
            <>
              <div className="row g-4">
                <div className="col-md-6 col-xl-3">
                  <div style={infoBoxStyle}>
                    <div className="text-muted small mb-2">Tổng lượt đăng ký</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.6rem' }}>
                      {summary.total}
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-3">
                  <div style={infoBoxStyle}>
                    <div className="text-muted small mb-2">Đã duyệt</div>
                    <div style={{ fontWeight: 700, color: '#166534', fontSize: '1.6rem' }}>
                      {summary.confirmed}
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-3">
                  <div style={infoBoxStyle}>
                    <div className="text-muted small mb-2">Chờ duyệt</div>
                    <div style={{ fontWeight: 700, color: '#92400e', fontSize: '1.6rem' }}>
                      {summary.pending}
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-3">
                  <div style={infoBoxStyle}>
                    <div className="text-muted small mb-2">Đã từ chối</div>
                    <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '1.6rem' }}>
                      {summary.rejected}
                    </div>
                  </div>
                </div>
              </div>

              <div style={cardStyle}>
                <div style={sectionTitleStyle}>
                  <History size={22} color="#16a34a" />
                  <span>Lịch sử đăng ký</span>
                </div>

                {items.length === 0 ? (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      borderRadius: '14px',
                      padding: '24px',
                      textAlign: 'center',
                      color: '#64748b',
                    }}
                  >
                    Chưa có lịch sử đăng ký nào.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Sự kiện</th>
                          <th>Địa điểm</th>
                          <th>Thời gian</th>
                          <th>Lý do</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                {item.event.title}
                              </div>
                              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                Event ID: {item.event.id || '-'}
                              </div>
                            </td>

                            <td>
                              <div className="d-flex align-items-center gap-2" style={{ color: '#374151' }}>
                                <MapPin size={15} color="#16a34a" />
                                <span>{item.event.location || 'Chưa cập nhật địa điểm'}</span>
                              </div>
                            </td>

                            <td>
                              <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>
                                {item.event.startTime
                                  ? new Date(item.event.startTime).toLocaleString('vi-VN')
                                  : '-'}
                              </div>
                              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                đến {item.event.endTime
                                  ? new Date(item.event.endTime).toLocaleString('vi-VN')
                                  : '-'}
                              </div>
                            </td>

                            <td>
                              <div style={{ color: '#374151', fontSize: '0.92rem', maxWidth: '240px' }}>
                                {item.reason || 'Không có lý do đăng ký'}
                              </div>
                            </td>

                            <td>
                              <div className="d-flex flex-column gap-2">
                                <span style={statusBadgeStyle(item.status)}>
                                  {item.status === 'Pending'
                                    ? 'Chờ duyệt'
                                    : item.status === 'Confirmed'
                                      ? 'Đã duyệt'
                                      : item.status === 'Rejected'
                                        ? 'Đã từ chối'
                                        : item.status}
                                </span>
                                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                  {item.registeredAt
                                    ? new Date(item.registeredAt).toLocaleString('vi-VN')
                                    : '-'}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div style={cardStyle}>
                <div style={sectionTitleStyle}>
                  <ClipboardList size={22} color="#16a34a" />
                  <span>Ghi chú</span>
                </div>

                <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: 0 }}>
                  Lịch sử này chỉ hiển thị các sự kiện thuộc tổ chức của bạn mà volunteer đã từng đăng ký.
                  Bạn có thể dùng trang chi tiết đăng ký để đánh giá volunteer sau khi đơn đã được duyệt.
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default OrganizerVolunteerHistory;