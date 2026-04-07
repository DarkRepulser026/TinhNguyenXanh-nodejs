import { useEffect, useMemo, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminRegistrationItem } from '../../lib/api';

type RegistrationStatus = 'all' | 'Pending' | 'Confirmed' | 'Rejected' | 'Cancelled';

type RegistrationSummary = {
  pendingCount: number;
  confirmedCount: number;
  rejectedCount: number;
  cancelledCount: number;
};

const defaultSummary: RegistrationSummary = {
  pendingCount: 0,
  confirmedCount: 0,
  rejectedCount: 0,
  cancelledCount: 0,
};

const AdminRegistrations = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<RegistrationStatus>('all');
  const [items, setItems] = useState<AdminRegistrationItem[]>([]);
  const [summary, setSummary] = useState<RegistrationSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<Record<string, RegistrationStatus>>({});

  const load = async (nextSearch?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getRegistrations({
        search: (nextSearch ?? search).trim() || undefined,
        status: status === 'all' ? undefined : status,
        page: 1,
        pageSize: 30,
      });

      const nextItems = response.data.items || [];
      setItems(nextItems);
      setSummary(response.data.summary || defaultSummary);
      const drafts: Record<string, RegistrationStatus> = {};
      nextItems.forEach((item: AdminRegistrationItem) => {
        drafts[item.id] = item.status;
      });
      setStatusDraft(drafts);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách đăng ký.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [status]);

  const onSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await load(search);
  };

  const updateStatus = async (id: string) => {
    const nextStatus = statusDraft[id];
    if (!nextStatus || nextStatus === 'all') return;

    try {
      setSavingId(id);
      await adminService.updateRegistrationStatus(id, nextStatus);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật trạng thái đăng ký.'));
    } finally {
      setSavingId(null);
    }
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return '--';
    return date.toLocaleString('vi-VN');
  };

  const getStatusBadgeClass = (value?: string) => {
    if (value === 'Pending') return 'badge text-bg-warning';
    if (value === 'Confirmed') return 'badge text-bg-success';
    if (value === 'Rejected') return 'badge text-bg-danger';
    if (value === 'Cancelled') return 'badge text-bg-secondary';
    return 'badge text-bg-secondary';
  };

  const totalRows = useMemo(
    () => summary.pendingCount + summary.confirmedCount + summary.rejectedCount + summary.cancelledCount,
    [summary],
  );

  return (
    <section>
      <div className="admin-page-header mb-4">
        <h1 className="h3 mb-2">Registrations</h1>
        <p className="text-muted small mb-0">Theo dõi và xử lý đăng ký tình nguyện trên toàn hệ thống.</p>
      </div>

      <div className="row g-3 mb-3 admin-stats-row">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Tổng đăng ký</p>
              <p className="h4 mb-0">{totalRows}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Pending</p>
              <p className="h4 mb-0">{summary.pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Confirmed</p>
              <p className="h4 mb-0">{summary.confirmedCount}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Rejected/Cancelled</p>
              <p className="h4 mb-0">{summary.rejectedCount + summary.cancelledCount}</p>
            </div>
          </div>
        </div>
      </div>

      <form className="admin-toolbar row g-2 mb-3" onSubmit={onSearchSubmit}>
        <div className="col-12 col-lg">
          <input
            className="form-control"
            placeholder="Tìm theo tên, số điện thoại, sự kiện, tổ chức"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-auto">
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as RegistrationStatus)}
            aria-label="Lọc trạng thái đăng ký"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="col-12 col-md-auto">
          <button className="btn btn-dark w-100" type="submit">Search</button>
        </div>
      </form>

      {loading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="table-responsive card">
        <table className="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              <th>Tình nguyện viên</th>
              <th>Sự kiện</th>
              <th>Tổ chức</th>
              <th>Trạng thái</th>
              <th>Ngày đăng ký</th>
              <th className="text-end">Cập nhật trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const rowId = String(item.id || '');
              const selectedStatus = statusDraft[rowId] || item.status;
              const canSave = selectedStatus && selectedStatus !== item.status;
              return (
                <tr key={rowId || `${item.eventId}-${item.registeredAt}`}>
                  <td>
                    <div className="fw-semibold">{item.fullName || '--'}</div>
                    <div className="small text-muted">{item.phone || '--'}</div>
                  </td>
                  <td className="small">{item.eventTitle || '--'}</td>
                  <td className="small text-muted">{item.organizationName || '--'}</td>
                  <td>
                    <span className={getStatusBadgeClass(item.status)}>{item.status || 'Unknown'}</span>
                  </td>
                  <td className="small text-muted">{formatDateTime(item.registeredAt)}</td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <select
                        className="form-select form-select-sm"
                        value={selectedStatus}
                        onChange={(e) => setStatusDraft((prev) => ({ ...prev, [rowId]: e.target.value as RegistrationStatus }))}
                        aria-label="Registration status"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        className="btn btn-sm btn-success"
                        type="button"
                        disabled={!canSave || savingId === rowId}
                        onClick={() => void updateStatus(rowId)}
                      >
                        {savingId === rowId ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && !items.length ? (
              <tr>
                <td className="text-center text-muted py-4" colSpan={6}>
                  Không có đăng ký nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminRegistrations;
