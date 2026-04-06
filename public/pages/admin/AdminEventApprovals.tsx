import { useEffect, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminEventApprovalItem } from '../../lib/api';

const AdminEventApprovals = () => {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<AdminEventApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (keyword?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getEventApprovals({ search: keyword || undefined, page: 1, pageSize: 20 });
      setItems(response.data.items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách chờ duyệt sự kiện.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateStatus = async (id: number, action: 'approve' | 'reject') => {
    try {
      await adminService.updateEventStatus(id, action);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật trạng thái sự kiện.'));
    }
  };

  const onSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await load(search.trim());
  };

  return (
    <section>
      <h1 className="h3 mb-2">Event Approvals</h1>
      <p className="text-muted small mb-4">Danh sách sự kiện đang ở trạng thái draft/pending.</p>

      <form className="row g-2 mb-3" onSubmit={onSearchSubmit}>
        <input
          className="form-control col"
          placeholder="Tìm theo tiêu đề/tổ chức"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-dark col-auto" type="submit">
          Search
        </button>
      </form>

      {loading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="table-responsive card">
        <table className="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              <th>Title</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Start</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.organizationName || 'N/A'}</td>
                <td>{item.status}</td>
                <td>{new Date(item.startTime).toLocaleDateString('vi-VN')}</td>
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
                <td className="text-center text-muted py-4" colSpan={5}>
                  Không có sự kiện nào đang chờ duyệt.
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
