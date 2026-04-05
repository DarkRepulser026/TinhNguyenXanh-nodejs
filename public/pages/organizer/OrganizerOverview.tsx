import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Hourglass,
  Users,
} from 'lucide-react';
import OrganizerLayout from './OrganizerLayout';
import { organizerService, getApiErrorMessage } from '../../services/api';

const sectionTitleStyle: CSSProperties = {
  color: '#0f172a',
  fontSize: '1.25rem',
  fontWeight: 700,
  marginBottom: '1.5rem',
  paddingBottom: '0.75rem',
  borderBottom: '2px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const statCardStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '1.75rem',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
};

const actionCardStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '2rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  height: '100%',
};

const iconBox = (bg: string): CSSProperties => ({
  width: '64px',
  height: '64px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  background: bg,
});

const OrganizerOverview = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizerService.getDashboard();
      setDashboard(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải dữ liệu tổng quan organizer.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const summary = useMemo(() => {
    const d = dashboard || {};

    return {
      organizationName:
        d.organizationName ||
        d.organization?.name ||
        d.profile?.name ||
        'Tổ chức của bạn',

      totalEvents:
        d.totalEvents ??
        d.eventCount ??
        d.eventsCount ??
        0,

      pendingEvents:
        d.pendingEvents ??
        d.pendingApprovals ??
        d.pendingEventCount ??
        0,

      pendingRegistrations:
        d.pendingRegistrations ??
        d.pendingVolunteerRegistrations ??
        d.totalPendingRegistrations ??
        0,

      confirmedVolunteers:
        d.confirmedVolunteers ??
        d.totalConfirmedVolunteers ??
        d.approvedVolunteers ??
        0,
    };
  }, [dashboard]);

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

            <h1
              style={{
                color: '#0f172a',
                fontSize: '1.75rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
              }}
            >
              Bảng điều khiển{' '}
              <span style={{ color: '#16a34a' }}>Organizer</span>
            </h1>

            <p
              style={{
                color: '#64748b',
                fontSize: '1rem',
                marginBottom: 0,
              }}
            >
              Quản lý tổ chức, sự kiện và hồ sơ tình nguyện viên của bạn tại{' '}
              <strong>{summary.organizationName}</strong>.
            </p>
          </div>

          {loading ? (
            <div className="alert alert-info rounded-4">Đang tải dữ liệu tổng quan...</div>
          ) : null}

          {error ? (
            <div className="alert alert-danger rounded-4">{error}</div>
          ) : null}

          {!loading && !error ? (
            <>
              <div style={sectionTitleStyle}>
                <CalendarDays size={22} color="#16a34a" />
                <span>Tổng quan hoạt động</span>
              </div>

              <div className="row g-4 mb-4">
                <div className="col-md-6 col-xl-3">
                  <div
                    style={statCardStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.10)';
                      e.currentTarget.style.borderColor = '#16a34a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div style={iconBox('#dbeafe')}>
                        <CalendarDays size={28} color="#2563eb" />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            lineHeight: 1,
                            color: '#0f172a',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {summary.totalEvents}
                        </div>
                        <div
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: '#0f172a',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Tổng sự kiện
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Tổng số sự kiện bạn đã quản lý
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-3">
                  <div
                    style={statCardStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.10)';
                      e.currentTarget.style.borderColor = '#16a34a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div style={iconBox('#fef3c7')}>
                        <Hourglass size={28} color="#d97706" />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            lineHeight: 1,
                            color: '#0f172a',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {summary.pendingEvents}
                        </div>
                        <div
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: '#0f172a',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Sự kiện chờ duyệt
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Các sự kiện đang chờ admin phê duyệt
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-3">
                  <div
                    style={statCardStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.10)';
                      e.currentTarget.style.borderColor = '#16a34a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div style={iconBox('#cffafe')}>
                        <ClipboardList size={28} color="#0891b2" />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            lineHeight: 1,
                            color: '#0f172a',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {summary.pendingRegistrations}
                        </div>
                        <div
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: '#0f172a',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Đăng ký chờ xử lý
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Các đơn đăng ký tình nguyện đang chờ bạn duyệt
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6 col-xl-3">
                  <div
                    style={statCardStyle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.10)';
                      e.currentTarget.style.borderColor = '#16a34a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div style={iconBox('#dcfce7')}>
                        <CheckCircle2 size={28} color="#16a34a" />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            lineHeight: 1,
                            color: '#0f172a',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {summary.confirmedVolunteers}
                        </div>
                        <div
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: '#0f172a',
                            marginBottom: '0.25rem',
                          }}
                        >
                          Tình nguyện viên đã duyệt
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Số lượng tình nguyện viên đã được xác nhận
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={sectionTitleStyle}>
                <Building2 size={22} color="#16a34a" />
                <span>Truy cập nhanh</span>
              </div>

              <div className="row g-4">
                <div className="col-md-6 col-xl-4">
                  <div style={actionCardStyle}>
                    <div
                      style={{
                        color: '#0f172a',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Building2 size={22} color="#16a34a" />
                      Hồ sơ tổ chức
                    </div>

                    <p style={{ color: '#64748b', lineHeight: 1.7 }}>
                      Cập nhật thông tin tổ chức, địa chỉ, mô tả và trạng thái xác minh.
                    </p>

                    <Link
                      to="/organizer/organization"
                      style={{
                        background: '#16a34a',
                        color: '#fff',
                        padding: '0.875rem 1.5rem',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                      }}
                    >
                      Quản lý hồ sơ tổ chức
                    </Link>
                  </div>
                </div>

                <div className="col-md-6 col-xl-4">
                  <div style={actionCardStyle}>
                    <div
                      style={{
                        color: '#0f172a',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <CalendarDays size={22} color="#16a34a" />
                      Quản lý sự kiện
                    </div>

                    <p style={{ color: '#64748b', lineHeight: 1.7 }}>
                      Tạo mới, chỉnh sửa, ẩn/hiện và theo dõi các sự kiện của tổ chức.
                    </p>

                    <Link
                      to="/organizer/events"
                      style={{
                        background: '#16a34a',
                        color: '#fff',
                        padding: '0.875rem 1.5rem',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                      }}
                    >
                      Đi tới quản lý sự kiện
                    </Link>
                  </div>
                </div>

                <div className="col-md-6 col-xl-4">
                  <div style={actionCardStyle}>
                    <div
                      style={{
                        color: '#0f172a',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Users size={22} color="#16a34a" />
                      Duyệt tình nguyện viên
                    </div>

                    <p style={{ color: '#64748b', lineHeight: 1.7 }}>
                      Xử lý đơn đăng ký, xem lịch sử và đánh giá tình nguyện viên.
                    </p>

                    <Link
                      to="/organizer/volunteers"
                      style={{
                        background: '#16a34a',
                        color: '#fff',
                        padding: '0.875rem 1.5rem',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                      }}
                    >
                      Đi tới duyệt volunteer
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default OrganizerOverview;