import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { getApiErrorMessage } from '../../lib/api';

const AccountSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName || '');
    setPhone(user?.phone || '');
  }, [user?.fullName, user?.phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      setIsSubmitting(true);
      await updateProfile({
        fullName,
        phone,
      });
      setMessage('Cập nhật thông tin thành công.');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Cập nhật thất bại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
            <h1 className="h3 fw-bold mb-2">Cài đặt tài khoản</h1>
            <p className="text-muted mb-4">Quản lý thông tin cá nhân cho tài khoản của bạn.</p>

            {message && <div className="alert alert-success py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <form onSubmit={handleSubmit} className="d-grid gap-3">
              <div>
                <label className="form-label">Email</label>
                <input className="form-control" value={user?.email || ''} disabled />
              </div>

              <div>
                <label className="form-label">Vai trò</label>
                <input className="form-control" value={user?.role || ''} disabled />
              </div>

              <div>
                <label className="form-label">Họ và tên</label>
                <input
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Số điện thoại</label>
                <input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <button className="btn btn-success" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>
    </div>
  );
};

export default AccountSettings;

