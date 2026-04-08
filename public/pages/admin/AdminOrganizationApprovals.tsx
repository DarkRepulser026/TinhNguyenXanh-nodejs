import { useEffect, useMemo, useState } from 'react';
import {
  adminService,
  getApiErrorMessage,
  type AdminOrganizationApprovalItem,
} from '../../lib/api';

const AdminOrganizationApprovals = () => {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<AdminOrganizationApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (keyword?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getOrganizationApprovals({
        search: keyword || undefined,
        page: 1,
        pageSize: 20,
      });
      setItems(response.data.items || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách tổ chức chờ duyệt.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const stats = useMemo(
    () => ({
      total: items.length,
      byCity: items.reduce((acc: Record<string, number>, item) => {
        const key = item.city || 'Khác';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    }),
    [items],
  );

  const updateStatus = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !confirm('Bạn có chắc chắn muốn từ chối tổ chức này?')) {
      return;
    }

    try {
      await adminService.updateOrganizationApprovalStatus(id, action);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, `Không thể ${action === 'approve' ? 'phê duyệt' : 'từ chối'} tổ chức.`));
    }
  };

  const onSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await load(search.trim());
  };

  return (
    <section>
      <div className="admin-page-header d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Organization Approvals</h1>
        <span className="badge rounded-pill text-bg-dark">{items.length}</span>
      </div>
      <p className="text-muted small mb-4">Duyệt hồ sơ tổ chức mới trước khi hiển thị công khai.</p>

      <div className="row g-3 mb-3 admin-stats-row">
        <div className="col-12 col-md-4">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Tổng hồ sơ chờ duyệt</p>
              <p className="h4 mb-0">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-8">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-2">Phân bổ theo khu vực</p>
              <div className="d-flex flex-wrap gap-2">
                {Object.keys(stats.byCity).length === 0 ? (
                  <span className="text-muted small">Chưa có dữ liệu</span>
                ) : (
                  Object.entries(stats.byCity).map(([city, count]) => (
                    <span key={city} className="badge text-bg-light border">
                      {city}: {Number(count)}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <form className="admin-toolbar row g-2 mb-3" onSubmit={onSearchSubmit}>
        <div className="col-12 col-md">
          <input
            className="form-control"
            placeholder="Tìm theo tên tổ chức, email, khu vực hoặc người đại diện"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-auto">
          <button className="btn btn-dark w-100" type="submit">
            Search
          </button>
        </div>
      </form>

      {loading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="table-responsive card">
        <table className="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              <th>Tổ chức</th>
              <th>Liên hệ</th>
              <th>Người sở hữu</th>
              <th>Khu vực</th>
              <th>Ngày gửi</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="fw-semibold">{item.name}</div>
                  <div className="small text-muted">{item.organizationType || '--'}</div>
                </td>
                <td>
                  <div>{item.contactEmail || '--'}</div>
                  <div className="small text-muted">{item.phoneNumber || '--'}</div>
                </td>
                <td>
                  <div>{item.ownerName || '--'}</div>
                  <div className="small text-muted">{item.ownerEmail || '--'}</div>
                </td>
                <td>
                  {item.city || '--'}
                  {item.district ? `, ${item.district}` : ''}
                </td>
                <td className="small text-muted">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '--'}
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
            {!loading && !items.length ? (
              <tr>
                <td className="text-center text-muted py-4" colSpan={6}>
                  Không có tổ chức nào đang chờ duyệt.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminOrganizationApprovals;
