import { useEffect, useMemo, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminEventApprovalItem } from '../../lib/api';

const AdminEventApprovals = () => {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<AdminEventApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'draft'>('all');

  const load = async (keyword?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getEventApprovals({
        search: keyword || undefined,
        page: 1,
        pageSize: 20,
      });
      setItems(response.data.items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách sự kiện chờ duyệt.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredItems = useMemo(() => {
    if (filterStatus === 'all') {
      return items;
    }
    return items.filter((item) => item.status === filterStatus);
  }, [filterStatus, items]);

  const stats = useMemo(
    () => ({
      total: items.length,
      pending: items.filter((item) => item.status === 'pending').length,
      draft: items.filter((item) => item.status === 'draft').length,
    }),
    [items],
  );

  const updateStatus = async (id: number, action: 'approve' | 'reject') => {
    if (action === 'reject' && !confirm('Bạn có chắc chắn muốn từ chối sự kiện này?')) {
      return;
    }

    try {
      await adminService.updateEventStatus(id, action);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, `Không thể ${action === 'approve' ? 'phê duyệt' : 'từ chối'} sự kiện.`));
    }
  };

  const onSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await load(search.trim());
  };

  const getStatusBadgeClass = (status: AdminEventApprovalItem['status']) => {
    if (status === 'pending') return 'badge text-bg-warning';
    if (status === 'draft') return 'badge text-bg-secondary';
    return 'badge text-bg-light text-dark';
  };

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return '--';
    return date.toLocaleString('vi-VN');
  };

  return (
    <section>
      <div className="admin-page-header d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Event Approvals</h1>
        <span className="badge rounded-pill text-bg-dark">{filteredItems.length}</span>
      </div>
      <p className="text-muted small mb-4">Quản lý sự kiện nháp và sự kiện chờ phê duyệt.</p>

      <div className="row g-3 mb-3 admin-stats-row">
        <div className="col-12 col-md-4">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Tổng sự kiện</p>
              <p className="h4 mb-0">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Chờ duyệt</p>
              <p className="h4 mb-0">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Nháp</p>
              <p className="h4 mb-0">{stats.draft}</p>
            </div>
          </div>
        </div>
      </div>

      <form className="admin-toolbar row g-2 mb-3" onSubmit={onSearchSubmit}>
        <div className="col-12 col-md">
          <input
            className="form-control"
            placeholder="Tìm theo tên sự kiện hoặc tổ chức"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-auto">
          <button className="btn btn-dark w-100" type="submit">
            Search
          </button>
        </div>
        <div className="col-12 col-md-auto">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'draft')}
            aria-label="Lọc trạng thái"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="draft">Nháp</option>
          </select>
        </div>
      </form>

      {loading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="table-responsive card">
        <table className="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              <th>Sự kiện</th>
              <th>Tổ chức</th>
              <th>Thời gian bắt đầu</th>
              <th>Trạng thái</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="fw-semibold">{item.title}</div>
                </td>
                <td>{item.organizationName || '--'}</td>
                <td className="small text-muted">{formatDateTime(item.startTime)}</td>
                <td>
                  <span className={getStatusBadgeClass(item.status)}>
                    {item.status === 'draft' ? 'Draft' : 'Pending'}
                  </span>
                </td>
                <td className="text-end">
                  <div className="d-inline-flex gap-2">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => void updateStatus(item.id, 'approve')}
                      type="button"
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => void updateStatus(item.id, 'reject')}
                      type="button"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !filteredItems.length ? (
              <tr>
                <td className="text-center text-muted py-4" colSpan={5}>
                  Không có sự kiện phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminEventApprovals;

