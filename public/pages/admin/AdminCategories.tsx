import { useEffect, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminCategoryItem } from '../../lib/api';

const AdminCategories = () => {
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [items, setItems] = useState<AdminCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    try {
      await adminService.createCategory(name.trim());
      setName('');
      await load(search.trim());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tạo danh mục mới.'));
    }
  };

  const renameCategory = async (item: AdminCategoryItem) => {
    const next = window.prompt('Nhập tên danh mục mới', item.name);
    if (!next || next.trim() === item.name) {
      return;
    }

    try {
      await adminService.updateCategory(item.id, next.trim());
      setItems((prev) => prev.map((cat) => (cat.id === item.id ? { ...cat, name: next.trim() } : cat)));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật danh mục.'));
    }
  };

  const deleteCategory = async (item: AdminCategoryItem) => {
    if (!window.confirm(`Xóa danh mục ${item.name}?`)) {
      return;
    }

    try {
      await adminService.deleteCategory(item.id);
      setItems((prev) => prev.filter((cat) => cat.id !== item.id));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể xóa danh mục.'));
    }
  };

  return (
    <section>
      <h1 className="h3 mb-2">Event Categories</h1>
      <p className="text-muted small mb-4">CRUD danh mục cho phân loại sự kiện.</p>

      <form className="row g-2 mb-2" onSubmit={onSearchSubmit}>
        <input
          className="form-control col"
          placeholder="Tìm danh mục"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-dark col-auto" type="submit">
          Search
        </button>
      </form>

      <form className="row g-2 mb-3" onSubmit={createCategory}>
        <input
          className="form-control col"
          placeholder="Tên danh mục mới"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn btn-success col-auto" type="submit">
          Add
        </button>
      </form>

      {loading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="table-responsive card">
        <table className="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td className="text-end">
                  <div className="d-inline-flex gap-2">
                    <button className="btn btn-sm btn-dark" onClick={() => void renameCategory(item)} type="button">
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => void deleteCategory(item)} type="button">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
