import { useEffect, useState, type FormEvent } from 'react';
import { getApiErrorMessage, organizerService, type OrganizerEventItem } from '../../services/api';

type EventFormState = {
  title: string;
  description: string;
  location: string;
  categoryId: string;
  startTime: string;
  endTime: string;
  maxVolunteers: string;
};

const emptyForm: EventFormState = {
  title: '',
  description: '',
  location: '',
  categoryId: '',
  startTime: '',
  endTime: '',
  maxVolunteers: '0',
};

const toDateTimeLocal = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - timezoneOffset);
  return local.toISOString().slice(0, 16);
};

const OrganizerEventManagement = () => {
  const [items, setItems] = useState<OrganizerEventItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState<EventFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const updateForm = (key: keyof EventFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onFilterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    await load();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError('Vui lòng nhập tên sự kiện.');
      setSuccess(null);
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError('Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc.');
      setSuccess(null);
      return;
    }

    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError('Thời gian kết thúc phải lớn hơn thời gian bắt đầu.');
      setSuccess(null);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        categoryId: form.categoryId.trim() || undefined,
        startTime: form.startTime,
        endTime: form.endTime,
        maxVolunteers: Number(form.maxVolunteers) || 0,
      };

      if (editingId) {
        await organizerService.updateEvent(editingId, payload);
        setSuccess('Cập nhật sự kiện thành công.');
      } else {
        await organizerService.createEvent(payload);
        setSuccess('Tạo sự kiện thành công. Sự kiện đang ở trạng thái draft.');
      }

      resetForm();
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể lưu sự kiện.'));
      setSuccess(null);
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (item: OrganizerEventItem) => {
    setEditingId(item.id);
    setSuccess(null);
    setError(null);

    setForm({
      title: item.title || '',
      description: item.description || '',
      location: item.location || '',
      categoryId: item.categoryId || '',
      startTime: toDateTimeLocal(item.startTime),
      endTime: toDateTimeLocal(item.endTime),
      maxVolunteers: String(item.maxVolunteers ?? 0),
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onToggleHide = async (item: OrganizerEventItem) => {
    try {
      setError(null);
      setSuccess(null);

      if (item.isHidden || item.status === 'hidden') {
        await organizerService.unhideEvent(item.id);
        setSuccess(`Đã gửi yêu cầu hiện lại sự kiện "${item.title}".`);
      } else {
        await organizerService.hideEvent(item.id);
        setSuccess(`Đã ẩn sự kiện "${item.title}".`);
      }

      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật trạng thái ẩn/hiện sự kiện.'));
    }
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Quản lý sự kiện</h1>
        <p className="text-muted-foreground text-sm">
          Tạo, chỉnh sửa, lọc và ẩn/hiện các sự kiện thuộc tổ chức của bạn.
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

      <form className="mb-4 grid gap-3 rounded-2xl border bg-card p-4 shadow-sm md:grid-cols-4" onSubmit={onFilterSubmit}>
        <input
          className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
          placeholder="Tìm theo tiêu đề / mô tả / địa điểm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="draft">draft</option>
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="hidden">hidden</option>
          <option value="rejected">rejected</option>
        </select>

        <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white" type="submit">
          Lọc sự kiện
        </button>
      </form>

      <form className="mb-6 grid gap-4 rounded-2xl border bg-card p-6 shadow-sm md:grid-cols-2" onSubmit={onSubmit}>
        <div className="md:col-span-2">
          <h2 className="mb-1 text-lg font-semibold">
            {editingId ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}
          </h2>
          <p className="text-muted-foreground text-sm">
            Điền thông tin sự kiện của tổ chức bạn.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Tên sự kiện</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Nhập tên sự kiện"
            value={form.title}
            onChange={(e) => updateForm('title', e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Mô tả</label>
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={4}
            placeholder="Mô tả ngắn về sự kiện"
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Địa điểm</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Nhập địa điểm"
            value={form.location}
            onChange={(e) => updateForm('location', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Category ID</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Nhập category id nếu có"
            value={form.categoryId}
            onChange={(e) => updateForm('categoryId', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Bắt đầu</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => updateForm('startTime', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Kết thúc</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => updateForm('endTime', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Số lượng tình nguyện viên tối đa</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            type="number"
            min={0}
            value={form.maxVolunteers}
            onChange={(e) => updateForm('maxVolunteers', e.target.value)}
          />
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button
            className="rounded-lg bg-green-700 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật sự kiện' : 'Tạo sự kiện'}
          </button>

          {editingId ? (
            <button
              className="rounded-lg border px-5 py-2 text-sm font-medium"
              onClick={resetForm}
              type="button"
            >
              Hủy chỉnh sửa
            </button>
          ) : null}
        </div>
      </form>

      {loading ? <div className="rounded-xl border bg-card p-4 text-sm">Đang tải danh sách sự kiện...</div> : null}

      <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-4 py-3">Tên sự kiện</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thời gian</th>
              <th className="px-4 py-3">Địa điểm</th>
              <th className="px-4 py-3">Đăng ký</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr className="border-b" key={item.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.categoryName || 'Chưa có danh mục'}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span className="rounded-full border px-2 py-1 text-xs">
                    {item.isHidden ? 'hidden' : item.status}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div>{new Date(item.startTime).toLocaleString('vi-VN')}</div>
                  <div className="text-xs text-muted-foreground">
                    đến {new Date(item.endTime).toLocaleString('vi-VN')}
                  </div>
                </td>

                <td className="px-4 py-3">{item.location || '-'}</td>

                <td className="px-4 py-3">
                  {item.registrationCount}/{item.maxVolunteers}
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded-lg border px-3 py-1 text-xs"
                      onClick={() => onEdit(item)}
                      type="button"
                    >
                      Sửa
                    </button>

                    <button
                      className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-white"
                      onClick={() => void onToggleHide(item)}
                      type="button"
                    >
                      {item.isHidden || item.status === 'hidden' ? 'Hiện lại' : 'Ẩn'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && items.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                  Chưa có sự kiện nào.
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