import { useEffect, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminEventApprovalItem } from '../../services/api';

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
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Event Approvals</h1>
      <p className="text-muted-foreground mb-6 text-sm">Danh sách sự kiện đang ở trạng thái draft/pending.</p>

      <form className="mb-4 flex gap-2" onSubmit={onSearchSubmit}>
        <input
          className="w-full max-w-md rounded border px-3 py-2 text-sm"
          placeholder="Tìm theo tiêu đề/tổ chức"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="rounded bg-black px-3 py-2 text-sm text-white" type="submit">
          Search
        </button>
      </form>

      {loading ? <div className="rounded border bg-card p-4 text-sm">Đang tải dữ liệu...</div> : null}
      {error ? <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Organization</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-b" key={item.id}>
                <td className="px-4 py-3">{item.title}</td>
                <td className="px-4 py-3">{item.organizationName || 'N/A'}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">{new Date(item.startTime).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button
                      className="rounded bg-green-600 px-3 py-1 text-white"
                      onClick={() => void updateStatus(item.id, 'approve')}
                      type="button"
                    >
                      Approve
                    </button>
                    <button
                      className="rounded bg-red-600 px-3 py-1 text-white"
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
                <td className="px-4 py-5 text-center text-muted-foreground" colSpan={5}>
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