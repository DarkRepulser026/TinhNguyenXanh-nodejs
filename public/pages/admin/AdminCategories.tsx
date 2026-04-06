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
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Event Categories</h1>
      <p className="text-muted-foreground mb-6 text-sm">CRUD danh mục cho phân loại sự kiện.</p>

      <form className="mb-3 flex gap-2" onSubmit={onSearchSubmit}>
        <input
          className="w-full max-w-md rounded border px-3 py-2 text-sm"
          placeholder="Tìm danh mục"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="rounded bg-black px-3 py-2 text-sm text-white" type="submit">
          Search
        </button>
      </form>

      <form className="mb-4 flex gap-2" onSubmit={createCategory}>
        <input
          className="w-full max-w-md rounded border px-3 py-2 text-sm"
          placeholder="Tên danh mục mới"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="rounded bg-green-700 px-3 py-2 text-sm text-white" type="submit">
          Add
        </button>
      </form>

      {loading ? <div className="rounded border bg-card p-4 text-sm">Đang tải dữ liệu...</div> : null}
      {error ? <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-b" key={item.id}>
                <td className="px-4 py-3">{item.id}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button className="rounded bg-slate-900 px-3 py-1 text-white" onClick={() => void renameCategory(item)} type="button">
                      Edit
                    </button>
                    <button className="rounded bg-red-700 px-3 py-1 text-white" onClick={() => void deleteCategory(item)} type="button">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !items.length ? (
              <tr>
                <td className="px-4 py-5 text-center text-muted-foreground" colSpan={3}>
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
