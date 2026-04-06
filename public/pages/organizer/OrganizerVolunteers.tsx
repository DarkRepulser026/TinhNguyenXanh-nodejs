import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  Filter,
  History,
  Search,
  Users,
  XCircle,
} from 'lucide-react';

import { getApiErrorMessage, organizerService, type OrganizerRegistrationItem } from '../../lib/api';

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

const OrganizerVolunteers = () => {
  const [items, setItems] = useState<OrganizerRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Pending');
  const [eventId, setEventId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (
    opts: { search: string; status: string; eventId: string; page: number; showFiltering?: boolean } = {
      search,
      status,
      eventId,
      page,
      showFiltering: false,
    },
  ) => {
    try {
      if (opts.showFiltering) {
        setFiltering(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response = await organizerService.getVolunteers({
        search: opts.search.trim() || undefined,
        status: opts.status === 'All' ? undefined : opts.status || undefined,
        eventId: opts.eventId.trim() || undefined,
        page: opts.page,
        pageSize: 10,
      });

      setItems(response.data.items);
      setTotalPages(Math.max(1, response.data.totalPages));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách tình nguyện viên.'));
    } finally {
      setLoading(false);
      setFiltering(false);
    }
  };

  useEffect(() => {
    void load({ search, status, eventId, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const applyFilters = async () => {
    setPage(1);
    await load({ search, status, eventId, page: 1, showFiltering: true });
  };

  const updateStatus = async (id: string, action: 'approve' | 'reject') => {
    const confirmed = window.confirm(
      action === 'approve'
        ? 'Bạn có chắc muốn duyệt đăng ký này không?'
        : 'Bạn có chắc muốn từ chối đăng ký này không?',
    );

    if (!confirmed) return;

    try {
      setError(null);
      setSuccess(null);

      await organizerService.updateRegistrationStatus(id, action);

      setSuccess(
        action === 'approve'
          ? 'Đã duyệt đăng ký tình nguyện viên.'
          : 'Đã từ chối đăng ký tình nguyện viên.',
      );

      await load({ search, status, eventId, page, showFiltering: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật trạng thái đăng ký.'));
    }
  };

  return (
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
              Duyệt{' '}
              <span style={{ color: '#16a34a' }}>tình nguyện viên</span>
            </h1>

            <p
              style={{
                color: '#64748b',
                fontSize: '1rem',
                marginBottom: 0,
              }}
            >
              Xử lý các đơn đăng ký tham gia sự kiện, xem chi tiết hồ sơ và lịch sử volunteer.
            </p>
          </div>

          {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}
          {success ? <div className="alert alert-success rounded-4">{success}</div> : null}

          <div style={cardStyle}>
            <div style={sectionTitleStyle}>
              <Filter size={22} color="#16a34a" />
              <span>Bộ lọc đăng ký</span>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label style={labelStyle}>Tìm kiếm</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <Search size={16} />
                  </span>
                  <input
                    className="form-control border-start-0"
                    style={inputStyle}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tên hoặc số điện thoại"
                  />
                </div>
              </div>

              <div className="col-md-3 mb-3">
                <label style={labelStyle}>Trạng thái</label>
                <select
                  className="form-select"
                  style={inputStyle}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Pending">Chờ duyệt</option>
                  <option value="Confirmed">Đã duyệt</option>
                  <option value="Rejected">Đã từ chối</option>
                  <option value="All">Tất cả</option>
                </select>
              </div>

              <div className="col-md-3 mb-3">
                <label style={labelStyle}>Event ID</label>
                <input
                  className="form-control"
                  style={inputStyle}
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="Nhập event id nếu cần"
                />
              </div>

              <div className="col-md-2 mb-3 d-flex align-items-end">
                <button
                  type="button"
                  onClick={() => void applyFilters()}
                  disabled={filtering}
                  style={{
                    background: '#0f172a',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    width: '100%',
                    opacity: filtering ? 0.75 : 1,
                  }}
                >
                  {filtering ? '...' : 'Lọc'}
                </button>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={sectionTitleStyle}>
              <Users size={22} color="#16a34a" />
              <span>Danh sách đăng ký</span>
            </div>

            {loading ? (
              <div className="alert alert-info rounded-4 mb-0">Đang tải danh sách tình nguyện viên...</div>
            ) : items.length === 0 ? (
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
                Chưa có đăng ký tình nguyện viên nào.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Tình nguyện viên</th>
                      <th>Sự kiện</th>
                      <th>Lý do đăng ký</th>
                      <th>Ngày đăng ký</th>
                      <th>Trạng thái</th>
                      <th className="text-end">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.fullName}</div>
                          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {row.phone || 'Chưa có số điện thoại'}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.event.title}</div>
                          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {row.event.location || 'Chưa có địa điểm'}
                          </div>
                        </td>

                        <td>
                          <div style={{ color: '#374151', fontSize: '0.92rem', maxWidth: '240px' }}>
                            {row.reason || 'Không có lý do đăng ký'}
                          </div>
                        </td>

                        <td>
                          <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>
                            {row.registeredAt ? new Date(row.registeredAt).toLocaleString('vi-VN') : '-'}
                          </div>
                        </td>

                        <td>
                          <span style={statusBadgeStyle(row.status)}>
                            {row.status === 'Pending'
                              ? 'Chờ duyệt'
                              : row.status === 'Confirmed'
                                ? 'Đã duyệt'
                                : row.status === 'Rejected'
                                  ? 'Đã từ chối'
                                  : row.status}
                          </span>
                        </td>

                        <td className="text-end">
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', minWidth: '220px', marginLeft: 'auto' }}>
                            <Link
                              to={`/organizer/registrations/${row.id}`}
                              style={{
                                background: '#ffffff',
                                color: '#0f172a',
                                border: '1px solid #d1d5db',
                                padding: '8px 4px',
                                borderRadius: '10px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                width: '100%',
                              }}
                            >
                              <Eye size={15} />
                              Chi tiết
                            </Link>

                            {row.volunteer.id ? (
                              <Link
                                to={`/organizer/volunteers/${row.volunteer.id}/history`}
                                style={{
                                  background: '#ffffff',
                                  color: '#0f172a',
                                  border: '1px solid #d1d5db',
                                  padding: '8px 4px',
                                  borderRadius: '10px',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  width: '100%',
                                }}
                              >
                                <History size={15} />
                                Lịch sử
                              </Link>
                            ) : <div></div>}

                            <button
                              type="button"
                              disabled={row.status !== 'Pending'}
                              onClick={() => void updateStatus(row.id, 'approve')}
                              style={{
                                background: '#16a34a',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 4px',
                                borderRadius: '10px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                width: '100%',
                                opacity: row.status !== 'Pending' ? 0.5 : 1,
                              }}
                            >
                              <CheckCircle2 size={15} />
                              Duyệt
                            </button>

                            <button
                              type="button"
                              disabled={row.status !== 'Pending'}
                              onClick={() => void updateStatus(row.id, 'reject')}
                              style={{
                                background: '#dc2626',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 4px',
                                borderRadius: '10px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                width: '100%',
                                opacity: row.status !== 'Pending' ? 0.5 : 1,
                              }}
                            >
                              <XCircle size={15} />
                              Từ chối
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Trang {page} / {totalPages}
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  style={{
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #d1d5db',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    opacity: page <= 1 ? 0.5 : 1,
                  }}
                >
                  Prev
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  style={{
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #d1d5db',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    opacity: page >= totalPages ? 0.5 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={sectionTitleStyle}>
              <ClipboardList size={22} color="#16a34a" />
              <span>Gợi ý thao tác</span>
            </div>

            <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: 0 }}>
              Bạn có thể dùng nút <strong>Chi tiết</strong> để xem đầy đủ hồ sơ đăng ký,
              dùng <strong>Lịch sử</strong> để xem các lần tham gia trước của volunteer,
              và chỉ duyệt hoặc từ chối khi hồ sơ còn ở trạng thái <strong>Chờ duyệt</strong>.
            </p>
          </div>
        </div>
      </div>
  );
};

export default OrganizerVolunteers;
