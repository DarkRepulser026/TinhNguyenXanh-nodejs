import { useEffect, useState } from 'react';
import { getApiErrorMessage, organizerService, type OrganizerEventItem } from '../../services/api';

const OrganizerEventManagement = () => {
  const [items, setItems] = useState<OrganizerEventItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxVolunteers, setMaxVolunteers] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizerService.getEvents({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page: 1,
        pageSize: 50,
      });
      setItems(response.data.items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách sự kiện.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await load();
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) {
      return;
    }

    try {
      await organizerService.createEvent({
        title: title.trim(),
        location: location.trim() || undefined,
        startTime,
        endTime,
        maxVolunteers: Number(maxVolunteers) || 0,
      });
      setTitle('');
      setLocation('');
      setStartTime('');
      setEndTime('');
      setMaxVolunteers('0');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tạo sự kiện mới.'));
    }
  };

  const toggleHide = async (item: OrganizerEventItem) => {
    try {
      if (item.status === 'hidden') {
        const response = await organizerService.unhideEvent(item.id);
        setItems((prev) =>
          prev.map((event) =>
            event.id === item.id ? { ...event, status: response.data.status } : event,
          ),
        );
      } else {
        const response = await organizerService.hideEvent(item.id);
        setItems((prev) =>
          prev.map((event) =>
            event.id === item.id ? { ...event, status: response.data.status } : event,
          ),
        );
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật trạng thái ẩn/hiện sự kiện.'));
    }
  };

  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Event Management</h1>
      <p className="text-muted-foreground mb-6 text-sm">Quản lý sự kiện của tổ chức (CRUD và ẩn/hiện).</p>

      <form className="mb-4 grid gap-2 md:grid-cols-4" onSubmit={onFilterSubmit}>
        <input
          className="rounded border px-3 py-2 text-sm md:col-span-2"
          placeholder="Tìm theo tiêu đề/địa điểm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="rounded border px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">draft</option>
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="hidden">hidden</option>
          <option value="rejected">rejected</option>
        </select>
        <button className="rounded bg-black px-3 py-2 text-sm text-white" type="submit">
          Apply
        </button>
      </form>

      <form className="mb-4 grid gap-2 rounded-xl border bg-card p-4 md:grid-cols-6" onSubmit={createEvent}>
        <input className="rounded border px-3 py-2 text-sm md:col-span-2" placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="rounded border px-3 py-2 text-sm" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input className="rounded border px-3 py-2 text-sm" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        <input className="rounded border px-3 py-2 text-sm" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        <input className="rounded border px-3 py-2 text-sm" placeholder="Max" type="number" min={0} value={maxVolunteers} onChange={(e) => setMaxVolunteers(e.target.value)} />
        <button className="rounded bg-green-700 px-3 py-2 text-sm text-white md:col-span-6" type="submit">
          Create event
        </button>
      </form>

      {loading ? <div className="rounded border bg-card p-4 text-sm">Đang tải dữ liệu...</div> : null}
      {error ? <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Registrations</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-b" key={item.id}>
                <td className="px-4 py-3">{item.title}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">{new Date(item.startTime).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3">{item.registrationCount}/{item.maxVolunteers}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="rounded bg-slate-900 px-3 py-1 text-white"
                    onClick={() => void toggleHide(item)}
                    type="button"
                  >
                    {item.status === 'hidden' ? 'Unhide' : 'Hide'}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && !items.length ? (
              <tr>
                <td className="px-4 py-5 text-center text-muted-foreground" colSpan={5}>
                  Không có sự kiện nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default OrganizerEventManagement;