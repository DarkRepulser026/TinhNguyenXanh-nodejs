import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { getApiErrorMessage } from '../../lib/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        fullName,
        email,
        password,
        phone: phone || undefined,
        role: 'Volunteer',
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Đăng ký thất bại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-hero">
          <div className="auth-hero-content">
            <div className="auth-hero-badge">Bắt đầu hành trình</div>
            <h2 className="auth-hero-title">Tham gia cộng đồng xanh</h2>
            <p className="auth-hero-text">
              Tạo tài khoản tình nguyện viên để đăng ký sự kiện, kết nối với tổ chức và góp phần tạo lỗi sống bền vững.
            </p>
          </div>
        </div>

        <div className="auth-form-panel">
          <div>
            <h1 className="h3 fw-bold mb-2">Đăng ký tài khoản</h1>
            <p className="text-muted mb-4">Tạo tài khoản tình nguyện viên để tham gia các chiến dịch cộng đồng.</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit} className="d-grid gap-3">
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
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="form-label">Số điện thoại</label>
              <input
                className="form-control"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="form-label">Xác nhận mật khẩu</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <button className="btn btn-success btn-auth" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </form>

          <p className="auth-actions">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Register;

