import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApiErrorMessage, organizerService, type OrganizerRegistrationItem } from '../../services/api';

const OrganizerVolunteers = () => {
  const [items, setItems] = useState<OrganizerRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Pending');
  const [eventId, setEventId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await organizerService.getVolunteers({
        search: search.trim() || undefined,
        status: status === 'All' ? '' : status,
        eventId: eventId.trim() || undefined,
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

      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật trạng thái đăng ký.'));
    }
  };

  const getStatusLabel = (value: string) => {
    switch (value) {
      case 'Pending':
        return 'Chờ duyệt';
      case 'Confirmed':
        return 'Đã duyệt';
      case 'Rejected':
        return 'Đã từ chối';
      default:
        return value;
    }
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Duyệt tình nguyện viên</h1>
        <p className="text-muted-foreground text-sm">
          Xem và xử lý các đăng ký tham gia sự kiện của tổ chức bạn.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      <div className="mb-4 grid gap-3 rounded-2xl border bg-card p-4 md:grid-cols-4">
        <input
          className="rounded-lg border px-3 py-2 text-sm"
          placeholder="Tìm theo tên / số điện thoại"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="Pending">Chờ duyệt</option>
          <option value="Confirmed">Đã duyệt</option>
          <option value="Rejected">Đã từ chối</option>
          <option value="All">Tất cả</option>
        </select>

        <input
          className="rounded-lg border px-3 py-2 text-sm"
          placeholder="Nhập Event ID (nếu cần)"
          value={eventId}
          onChange={(e) => {
            setPage(1);
            setEventId(e.target.value);
          }}
        />

        <button
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          onClick={() => void load()}
          type="button"
        >
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-card p-4 text-sm">
          Đang tải danh sách tình nguyện viên...
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3">Tình nguyện viên</th>
              <th className="px-4 py-3">Sự kiện</th>
              <th className="px-4 py-3">Lý do đăng ký</th>
              <th className="px-4 py-3">Thời gian đăng ký</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {items.map((row) => (
              <tr className="border-b" key={row.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{row.fullName}</div>
                  <div className="text-xs text-muted-foreground">{row.phone || '-'}</div>
                </td>

                <td className="px-4 py-3">
                  <div className="font-medium">{row.event.title}</div>
                  <div className="text-xs text-muted-foreground">{row.event.location || '-'}</div>
                </td>

                <td className="px-4 py-3">
                  <div className="max-w-xs whitespace-pre-wrap text-sm">
                    {row.reason || 'Không có lý do đăng ký'}
                  </div>
                </td>

                <td className="px-4 py-3">
                  {row.registeredAt ? new Date(row.registeredAt).toLocaleString('vi-VN') : '-'}
                </td>

                <td className="px-4 py-3">
                  <span className="rounded-full border px-2 py-1 text-xs">
                    {getStatusLabel(row.status)}
                  </span>
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      className="rounded border px-3 py-1 text-xs"
                      to={`/organizer/registrations/${row.id}`}
                    >
                      Chi tiết
                    </Link>

                    {row.volunteer.id ? (
                      <Link
                        className="rounded border px-3 py-1 text-xs"
                        to={`/organizer/volunteers/${row.volunteer.id}/history`}
                      >
                        Lịch sử
                      </Link>
                    ) : null}

                    <button
                      className="rounded bg-green-700 px-3 py-1 text-xs text-white disabled:opacity-50"
                      disabled={row.status !== 'Pending'}
                      onClick={() => void updateStatus(row.id, 'approve')}
                      type="button"
                    >
                      Duyệt
                    </button>

                    <button
                      className="rounded bg-red-700 px-3 py-1 text-xs text-white disabled:opacity-50"
                      disabled={row.status !== 'Pending'}
                      onClick={() => void updateStatus(row.id, 'reject')}
                      type="button"
                    >
                      Từ chối
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && items.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                  Chưa có đăng ký tình nguyện viên nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Trang {page} / {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            className="rounded-lg border px-3 py-1 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            type="button"
          >
            Prev
          </button>

          <button
            className="rounded-lg border px-3 py-1 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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