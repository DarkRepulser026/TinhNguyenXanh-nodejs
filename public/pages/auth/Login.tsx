import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { getApiErrorMessage } from '../../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('demo@volunteerhub.local');
  const [password, setPassword] = useState('Demo@123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Đăng nhập thất bại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-hero">
          <div className="auth-hero-content">
            <div className="auth-hero-badge">Kết nối tình nguyện viên</div>
            <h2 className="auth-hero-title">Chào mừng trở lại!</h2>
            <p className="auth-hero-text">
              Đăng nhập để tiếp tục tham gia các chiến dịch thực tế, kết nối với tổ chức và đóng góp cho cộng đồng.
            </p>
          </div>
        </div>

        <div className="auth-form-panel">
          <div>
            <h1 className="h3 fw-bold mb-2">Đăng nhập</h1>
            <p className="text-muted mb-4">Truy cập tài khoản để quản lý sự kiện và hồ sơ tình nguyện.</p>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit} className="d-grid gap-3">
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
              <label className="form-label">Mật khẩu</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="btn btn-success btn-auth" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="auth-actions">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;

