import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage, paymentService } from '../../lib/api';
import { useAuth } from '../../contexts/useAuth';
import { Heart, CreditCard, Wallet, AlertCircle, CheckCircle2 } from 'lucide-react';

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

const DonatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('200000');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [method, setMethod] = useState('momo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
    }
  }, [user]);

  const submitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue < 10000) {
      setError('Số tiền ủng hộ tối thiểu là 10,000 VND.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await paymentService.createMomo({
        userId: user?.id || undefined,
        amount: amountValue,
        method: method === 'bank' ? 'bank' : 'momo',
        donorName: fullName || undefined,
        message: message || undefined,
      });

      const paymentUrl = response.data.paymentUrl;
      if (/^https?:\/\//i.test(paymentUrl)) {
        window.location.href = paymentUrl;
      } else {
        navigate(paymentUrl);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tạo giao dịch thanh toán.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-5 bg-light" style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="row g-0">
                
                {/* Left Info Panel */}
                <div className="col-md-5 text-white p-5 d-flex flex-column justify-content-center" style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}>
                  <Heart size={48} className="mb-4" />
                  <h2 className="fw-bold mb-3">Chung tay vì cộng đồng</h2>
                  <p className="opacity-75 mb-4" style={{ fontSize: '1.1rem' }}>
                    Mỗi đóng góp của bạn đều trực tiếp hỗ trợ các dự án tình nguyện, giúp đỡ những hoàn cảnh khó khăn và bảo vệ môi trường xanh.
                  </p>
                  <div className="mt-auto">
                    <div className="d-flex align-items-center gap-3 mb-3 opacity-75">
                      <CheckCircle2 size={20} />
                      <span>Minh bạch & Rõ ràng</span>
                    </div>
                    <div className="d-flex align-items-center gap-3 opacity-75">
                      <CheckCircle2 size={20} />
                      <span>100% chuyển đến quỹ dự án</span>
                    </div>
                  </div>
                </div>

                {/* Right Form Panel */}
                <div className="col-md-7 p-4 p-md-5 bg-white">
                  <h3 className="fw-bold mb-4">Thông tin ủng hộ</h3>

                  {error && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3">
                      <AlertCircle size={20} />
                      {error}
                    </div>
                  )}

                  <form onSubmit={submitDonation}>
                    <div className="mb-4">
                      <label className="form-label fw-semibold">Chọn số tiền (VND)</label>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {QUICK_AMOUNTS.map(amt => (
                          <button
                            type="button"
                            key={amt}
                            className={`btn rounded-pill px-3 ${Number(amount) === amt ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => setAmount(String(amt))}
                          >
                            {amt.toLocaleString('vi-VN')} đ
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        min={10000}
                        step={10000}
                        className="form-control form-control-lg rounded-3"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        placeholder="Hoặc nhập số tiền khác"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Người đóng góp</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ tên (tùy chọn)"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Kênh thanh toán</label>
                      <div className="row g-2">
                        <div className="col-6">
                          <div className={`border rounded-3 p-3 text-center cursor-pointer ${method === 'momo' ? 'border-success bg-success-subtle' : 'border-secondary-subtle'}`} onClick={() => setMethod('momo')} style={{ cursor: 'pointer', transition: 'all 0.2s' }}>
                            <Wallet size={24} className={method === 'momo' ? 'text-success' : 'text-muted'} />
                            <div className={`mt-2 fw-semibold ${method === 'momo' ? 'text-success' : 'text-muted'}`}>Ví MoMo</div>
                          </div>
                        </div>
                        {/* <div className="col-6"> */}
                          {/* <div className={`border rounded-3 p-3 text-center cursor-pointer ${method === 'bank' ? 'border-success bg-success-subtle' : 'border-secondary-subtle'}`} onClick={() => setMethod('bank')} style={{ cursor: 'pointer', transition: 'all 0.2s' }}> */}
                            {/* <CreditCard size={24} className={method === 'bank' ? 'text-success' : 'text-muted'} /> */}
                            {/* <div className={`mt-2 fw-semibold ${method === 'bank' ? 'text-success' : 'text-muted'}`}>Chuyển khoản</div> */}
                          {/* </div> */}
                        {/* </div> */}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Lời nhắn (tùy chọn)</label>
                      <textarea
                        className="form-control rounded-3"
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nhập lời nhắn của bạn..."
                      />
                    </div>

                    <button className="btn btn-success btn-lg w-100 rounded-pill fw-bold" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Đang xử lý...' : `Ủng hộ ${Number(amount).toLocaleString('vi-VN')} VND`}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
