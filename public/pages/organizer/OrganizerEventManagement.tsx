import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import {
  CalendarDays,
  Eye,
  EyeOff,
  Filter,
  MapPin,
  Pencil,
  PlusCircle,
  Save,
  XCircle,
} from 'lucide-react';

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

const statusBadgeStyle = (status: string, isHidden: boolean): CSSProperties => {
  if (isHidden || status === 'hidden') {
    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: '999px',
      background: '#f3f4f6',
      color: '#4b5563',
      fontSize: '12px',
      fontWeight: 700,
    };
  }

  if (status === 'approved') {
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

  if (status === 'pending') {
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

  if (status === 'rejected') {
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
    background: '#e0f2fe',
    color: '#075985',
    fontSize: '12px',
    fontWeight: 700,
  };
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
  const [filtering, setFiltering] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async (showFiltering = false) => {
    try {
      if (showFiltering) {
        setFiltering(true);
      } else {
        setLoading(true);
      }

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
      setFiltering(false);
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
    await load(true);
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
        setSuccess('Tạo sự kiện thành công.');
      }

      resetForm();
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể lưu sự kiện.'));
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
        setSuccess(`Đã hiện lại sự kiện "${item.title}".`);
      } else {
        await organizerService.hideEvent(item.id);
        setSuccess(`Đã ẩn sự kiện "${item.title}".`);
      }

      await load(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật trạng thái sự kiện.'));
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
              Quản lý{' '}
              <span style={{ color: '#16a34a' }}>sự kiện</span>
            </h1>

            <p
              style={{
                color: '#64748b',
                fontSize: '1rem',
                marginBottom: 0,
              }}
            >
              Tạo mới, chỉnh sửa, lọc và quản lý trạng thái hiển thị của các sự kiện thuộc tổ chức bạn.
            </p>
          </div>

          {error ? <div className="alert alert-danger rounded-4">{error}</div> : null}
          {success ? <div className="alert alert-success rounded-4">{success}</div> : null}

          <div className="row g-4">
            <div className="col-lg-5">
              <div style={cardStyle}>
                <div style={sectionTitleStyle}>
                  {editingId ? <Pencil size={22} color="#16a34a" /> : <PlusCircle size={22} color="#16a34a" />}
                  <span>{editingId ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}</span>
                </div>

                <form onSubmit={onSubmit}>
                  <div className="mb-3">
                    <label style={labelStyle}>Tên sự kiện</label>
                    <input
                      className="form-control"
                      style={inputStyle}
                      value={form.title}
                      onChange={(e) => updateForm('title', e.target.value)}
                      placeholder="Nhập tên sự kiện"
                    />
                  </div>

                  <div className="mb-3">
                    <label style={labelStyle}>Mô tả</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      style={inputStyle}
                      value={form.description}
                      onChange={(e) => updateForm('description', e.target.value)}
                      placeholder="Mô tả ngắn về sự kiện"
                    />
                  </div>

                  <div className="mb-3">
                    <label style={labelStyle}>Địa điểm</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0">
                        <MapPin size={16} />
                      </span>
                      <input
                        className="form-control border-start-0"
                        style={inputStyle}
                        value={form.location}
                        onChange={(e) => updateForm('location', e.target.value)}
                        placeholder="Nhập địa điểm"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label style={labelStyle}>Category ID</label>
                    <input
                      className="form-control"
                      style={inputStyle}
                      value={form.categoryId}
                      onChange={(e) => updateForm('categoryId', e.target.value)}
                      placeholder="Nhập category id nếu có"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label style={labelStyle}>Bắt đầu</label>
                      <input
                        className="form-control"
                        style={inputStyle}
                        type="datetime-local"
                        value={form.startTime}
                        onChange={(e) => updateForm('startTime', e.target.value)}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label style={labelStyle}>Kết thúc</label>
                      <input
                        className="form-control"
                        style={inputStyle}
                        type="datetime-local"
                        value={form.endTime}
                        onChange={(e) => updateForm('endTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label style={labelStyle}>Số lượng tình nguyện viên tối đa</label>
                    <input
                      className="form-control"
                      style={inputStyle}
                      type="number"
                      min={0}
                      value={form.maxVolunteers}
                      onChange={(e) => updateForm('maxVolunteers', e.target.value)}
                    />
                  </div>

                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        background: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 18px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: submitting ? 0.75 : 1,
                      }}
                    >
                      <Save size={18} />
                      {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật sự kiện' : 'Tạo sự kiện'}
                    </button>

                    {editingId ? (
                      <button
                        type="button"
                        onClick={resetForm}
                        style={{
                          background: '#ffffff',
                          color: '#0f172a',
                          border: '2px solid #e5e7eb',
                          padding: '12px 18px',
                          borderRadius: '10px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <XCircle size={18} />
                        Hủy chỉnh sửa
                      </button>
                    ) : null}
                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-7">
              <div style={cardStyle}>
                <div style={sectionTitleStyle}>
                  <Filter size={22} color="#16a34a" />
                  <span>Bộ lọc sự kiện</span>
                </div>

                <form onSubmit={onFilterSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label style={labelStyle}>Tìm kiếm</label>
                      <input
                        className="form-control"
                        style={inputStyle}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tiêu đề / mô tả / địa điểm"
                      />
                    </div>

                    <div className="col-md-4 mb-3">
                      <label style={labelStyle}>Trạng thái</label>
                      <select
                        className="form-select"
                        style={inputStyle}
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
                    </div>

                    <div className="col-md-2 mb-3 d-flex align-items-end">
                      <button
                        type="submit"
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
                </form>
              </div>

              <div style={cardStyle}>
                <div style={sectionTitleStyle}>
                  <CalendarDays size={22} color="#16a34a" />
                  <span>Danh sách sự kiện</span>
                </div>

                {loading ? (
                  <div className="alert alert-info rounded-4 mb-0">Đang tải danh sách sự kiện...</div>
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
                    Chưa có sự kiện nào.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Tên sự kiện</th>
                          <th>Trạng thái</th>
                          <th>Thời gian</th>
                          <th>Đăng ký</th>
                          <th className="text-end">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                {item.location || 'Chưa có địa điểm'}
                              </div>
                            </td>

                            <td>
                              <span style={statusBadgeStyle(item.status, item.isHidden)}>
                                {item.isHidden || item.status === 'hidden' ? 'hidden' : item.status}
                              </span>
                            </td>

                            <td>
                              <div style={{ color: '#0f172a', fontSize: '0.92rem', fontWeight: 600 }}>
                                {new Date(item.startTime).toLocaleString('vi-VN')}
                              </div>
                              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                đến {new Date(item.endTime).toLocaleString('vi-VN')}
                              </div>
                            </td>

                            <td>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                {item.registrationCount}/{item.maxVolunteers}
                              </div>
                            </td>

                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => onEdit(item)}
                                  style={{
                                    background: '#ffffff',
                                    color: '#0f172a',
                                    border: '1px solid #d1d5db',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  <Pencil size={15} />
                                  Sửa
                                </button>

                                <button
                                  type="button"
                                  onClick={() => void onToggleHide(item)}
                                  style={{
                                    background: item.isHidden || item.status === 'hidden' ? '#16a34a' : '#0f172a',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  {item.isHidden || item.status === 'hidden' ? <Eye size={15} /> : <EyeOff size={15} />}
                                  {item.isHidden || item.status === 'hidden' ? 'Hiện lại' : 'Ẩn'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default OrganizerEventManagement;