import { useEffect, useState } from 'react';
import { getApiErrorMessage, organizerService, type OrganizerRegistrationItem } from '../../services/api';

const OrganizerVolunteers = () => {
  const [items, setItems] = useState<OrganizerRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Pending');
  const [eventId, setEventId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const parsedEventId = Number(eventId);
      const response = await organizerService.getVolunteers({
        search: search || undefined,
        status: status === 'All' ? '' : status,
        eventId: Number.isFinite(parsedEventId) && parsedEventId > 0 ? parsedEventId : undefined,
        page,
        pageSize: 10,
      });

      setItems(response.data.items);
      setTotalPages(Math.max(1, response.data.totalPages));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách tình nguyện viên.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [search, status, eventId, page]);

  const updateStatus = async (id: number, action: 'approve' | 'reject') => {
    try {
      setError(null);
      await organizerService.updateRegistrationStatus(id, action);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật trạng thái đăng ký.'));
    }
  };

  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Volunteer Management</h1>
      <p className="text-muted-foreground mb-6 text-sm">Duyệt đăng ký tình nguyện viên theo sự kiện của bạn.</p>

      <div className="mb-4 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
        <input
          className="rounded border px-3 py-2 text-sm"
          placeholder="Tìm theo tên / số điện thoại"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="rounded border px-3 py-2 text-sm"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Rejected">Rejected</option>
          <option value="All">All</option>
        </select>
        <input
          className="rounded border px-3 py-2 text-sm"
          placeholder="Event ID (optional)"
          value={eventId}
          onChange={(e) => {
            setPage(1);
            setEventId(e.target.value);
          }}
        />
        <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" onClick={() => void load()} type="button">
          Refresh
        </button>
      </div>

      {loading ? <div className="rounded border bg-card p-4 text-sm">Đang tải dữ liệu...</div> : null}
      {error ? <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase">
            <tr>
              <th className="px-3 py-2">Volunteer</th>
              <th className="px-3 py-2">Event</th>
              <th className="px-3 py-2">Registered</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr className="border-b" key={row.id}>
                <td className="px-3 py-2">
                  <div className="font-medium">{row.fullName}</div>
                  <div className="text-xs text-muted-foreground">{row.phone || '-'}</div>
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium">{row.event.title}</div>
                  <div className="text-xs text-muted-foreground">{row.event.location || '-'}</div>
                </td>
                <td className="px-3 py-2">{new Date(row.registeredAt).toLocaleString()}</td>
                <td className="px-3 py-2">{row.status}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      className="rounded bg-green-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                      disabled={row.status !== 'Pending'}
                      onClick={() => void updateStatus(row.id, 'approve')}
                      type="button"
                    >
                      Approve
                    </button>
                    <button
                      className="rounded bg-red-700 px-2 py-1 text-xs text-white disabled:opacity-50"
                      disabled={row.status !== 'Pending'}
                      onClick={() => void updateStatus(row.id, 'reject')}
                      type="button"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center text-muted-foreground" colSpan={5}>
                  Không có dữ liệu.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {page} / {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            type="button"
          >
            Prev
          </button>
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default OrganizerVolunteers;