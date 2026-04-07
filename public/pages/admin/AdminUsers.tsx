import { useEffect, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminUserItem, type UserRole } from '../../lib/api';

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
      <h1 className="h3 mb-2">Users</h1>
      <p className="text-muted small mb-4">Quản lý vai trò và trạng thái hoạt động của tài khoản.</p>

      <form className="row g-2 mb-3" onSubmit={onSearchSubmit}>
        <div className="col-12 col-md">
          <input
            className="form-control"
            placeholder="Tìm theo email/tên/sđt"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-auto">
          <button className="btn btn-dark w-100" type="submit">
            Search
          </button>
        </div>
      </form>

      {loading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="table-responsive card">
        <table className="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.email}</td>
                <td>{item.fullName}</td>
                <td>
                  <select
                    className="form-select form-select-sm"
                    onChange={(e) => void changeRole(item, e.target.value as UserRole)}
                    value={item.role}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Organizer">Organizer</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </td>
                <td>{item.isActive ? 'Active' : 'Disabled'}</td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-dark"
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
                <td className="text-center text-muted py-4" colSpan={5}>
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
