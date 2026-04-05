import { useEffect, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminUserItem, type UserRole } from '../../services/api';

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (keyword?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getUsers({ search: keyword || undefined, page: 1, pageSize: 30 });
      setItems(response.data.items);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách người dùng.'));
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

  const toggleStatus = async (user: AdminUserItem) => {
    try {
      const response = await adminService.updateUserStatus(user.id, !user.isActive);
      setItems((prev) => prev.map((item) => (item.id === user.id ? { ...item, isActive: response.data.isActive } : item)));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật trạng thái người dùng.'));
    }
  };

  const changeRole = async (user: AdminUserItem, role: UserRole) => {
    try {
      const response = await adminService.updateUserRole(user.id, role);
      setItems((prev) => prev.map((item) => (item.id === user.id ? { ...item, role: response.data.role } : item)));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật vai trò người dùng.'));
    }
  };

  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Users</h1>
      <p className="text-muted-foreground mb-6 text-sm">Quản lý vai trò và trạng thái hoạt động của tài khoản.</p>

      <form className="mb-4 flex gap-2" onSubmit={onSearchSubmit}>
        <input
          className="w-full max-w-md rounded border px-3 py-2 text-sm"
          placeholder="Tìm theo email/tên/sđt"
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
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-b" key={item.id}>
                <td className="px-4 py-3">{item.email}</td>
                <td className="px-4 py-3">{item.fullName}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded border px-2 py-1"
                    onChange={(e) => void changeRole(item, e.target.value as UserRole)}
                    value={item.role}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Organizer">Organizer</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </td>
                <td className="px-4 py-3">{item.isActive ? 'Active' : 'Disabled'}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="rounded bg-gray-900 px-3 py-1 text-white"
                    onClick={() => void toggleStatus(item)}
                    type="button"
                  >
                    {item.isActive ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && !items.length ? (
              <tr>
                <td className="px-4 py-5 text-center text-muted-foreground" colSpan={5}>
                  Không tìm thấy người dùng.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminUsers;