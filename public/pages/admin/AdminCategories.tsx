import { useEffect, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminCategoryItem } from '../../lib/api';

const AdminCategories = () => {
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [items, setItems] = useState<AdminCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [processing, setProcessing] = useState<{
    create: boolean;
    updateId: number | null;
    deleteId: number | null;
  }>({
    create: false,
    updateId: null,
    deleteId: null,
  });

  const load = async (keyword?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getCategories({ search: keyword || undefined, page: 1, pageSize: 50 });
      setItems(response.data.items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách danh mục.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await load(search.trim());
  };

  const clearAlerts = () => {
    setError(null);
    setSuccess(null);
  };

  const startEdit = (item: AdminCategoryItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
    clearAlerts();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    try {
      clearAlerts();
      setProcessing((prev) => ({ ...prev, create: true }));
      await adminService.createCategory(trimmed);
      setName('');
      await load(search.trim());
      setShowCreateForm(false);
      setSuccess('Đã thêm danh mục mới.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tạo danh mục mới.'));
    } finally {
      setProcessing((prev) => ({ ...prev, create: false }));
    }
  };

  const renameCategory = async (item: AdminCategoryItem) => {
    const next = editingName.trim();
    if (!next || next === item.name) {
      cancelEdit();
      return;
    }

    try {
      clearAlerts();
      setProcessing((prev) => ({ ...prev, updateId: item.id }));
      await adminService.updateCategory(item.id, next);
      setItems((prev) => prev.map((cat) => (cat.id === item.id ? { ...cat, name: next } : cat)));
      cancelEdit();
      setSuccess('Đã cập nhật tên danh mục.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật danh mục.'));
    } finally {
      setProcessing((prev) => ({ ...prev, updateId: null }));
    }
  };

  const deleteCategory = async (item: AdminCategoryItem) => {
    if (!window.confirm(`Xóa danh mục "${item.name}"?`)) {
      return;
    }

    try {
      clearAlerts();
      setProcessing((prev) => ({ ...prev, deleteId: item.id }));
      await adminService.deleteCategory(item.id);
      setItems((prev) => prev.filter((cat) => cat.id !== item.id));
      if (editingId === item.id) {
        cancelEdit();
      }
      setSuccess('Đã xóa danh mục.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể xóa danh mục.'));
    } finally {
      setProcessing((prev) => ({ ...prev, deleteId: null }));
    }
  };

  return (
    <section>
      <div className="admin-page-header mb-4">
        <h1 className="h3 mb-2">Event Categories</h1>
        <p className="text-muted small mb-0">CRUD danh mục cho phân loại sự kiện.</p>
      </div>

      <div className="row g-3 mb-3 admin-stats-row">
        <div className="col-12 col-md-6">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Tổng danh mục</p>
              <p className="h4 mb-0">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Từ khóa hiện tại</p>
              <p className="h6 mb-0 text-truncate">{search.trim() || 'Không lọc'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end mb-2">
        <button
          className={`btn btn-sm ${showCreateForm ? 'btn-outline-secondary' : 'btn-success'}`}
          type="button"
          onClick={() => {
            setShowCreateForm((prev) => !prev);
            setName('');
            clearAlerts();
          }}
        >
          {showCreateForm ? 'Đóng form thêm' : 'Thêm danh mục mới'}
        </button>
      </div>

      <div className="admin-toolbar mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
          <p className="small fw-semibold mb-0">Tìm kiếm danh mục</p>
        </div>

        <form className="row g-2" onSubmit={onSearchSubmit}>
          <div className="col-12 col-lg">
            <input
              className="form-control"
              placeholder="Nhập tên danh mục cần tìm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-auto">
            <button className="btn btn-dark w-100" type="submit">
              Tìm kiếm
            </button>
          </div>
          <div className="col-12 col-md-auto">
            <button
              className="btn btn-outline-secondary w-100"
              type="button"
              onClick={() => {
                setSearch('');
                void load();
              }}
            >
              Xóa lọc
            </button>
          </div>
        </form>
      </div>

      {showCreateForm ? (
        <div className="card mb-3">
          <div className="card-body">
            <p className="small fw-semibold mb-2">Thêm danh mục mới</p>
            <form className="row g-2" onSubmit={createCategory}>
              <div className="col-12 col-lg">
                <input
                  className="form-control"
                  placeholder="Nhập tên danh mục mới"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-auto">
                <button className="btn btn-success w-100" type="submit" disabled={processing.create || !name.trim()}>
                  {processing.create ? 'Đang thêm...' : 'Thêm danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {loading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <div className="table-responsive card">
        <table className="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isEditing = editingId === item.id;
              const isUpdating = processing.updateId === item.id;
              const isDeleting = processing.deleteId === item.id;

              return (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    {isEditing ? (
                      <input
                        className="form-control form-control-sm"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        disabled={isUpdating}
                        aria-label="Tên danh mục"
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="text-end">
                    {isEditing ? (
                      <div className="d-inline-flex gap-2">
                        <button
                          className="btn btn-sm btn-success"
                          type="button"
                          disabled={isUpdating || !editingName.trim()}
                          onClick={() => void renameCategory(item)}
                        >
                          {isUpdating ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button className="btn btn-sm btn-outline-secondary" type="button" disabled={isUpdating} onClick={cancelEdit}>
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="d-inline-flex gap-2">
                        <button className="btn btn-sm btn-dark" onClick={() => startEdit(item)} type="button" disabled={isDeleting}>
                          Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => void deleteCategory(item)}
                          type="button"
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {!loading && !items.length ? (
              <tr>
                <td className="text-center text-muted py-4" colSpan={3}>
                  Không có danh mục nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminCategories;
