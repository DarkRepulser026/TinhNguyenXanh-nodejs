import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage, paymentService } from '../../lib/api';

const DonatePage: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('200000');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [method, setMethod] = useState('momo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountValue = Number(amount);
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await paymentService.createMomo({
        amount: amountValue,
        method: method === 'bank' ? 'bank' : 'momo',
        donorName: fullName || undefined,
        message: message || undefined,
      });

      navigate(response.data.paymentUrl);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tạo giao dịch thanh toán.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-4">
      <div className="container" style={{ maxWidth: '820px' }}>
        <div className="mb-4">
          <h1 className="fw-bold mb-2">Ủng hộ cộng đồng</h1>
          <p className="text-muted mb-0">Đóng góp nhanh để hỗ trợ các chương trình tình nguyện.</p>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
          <form className="row g-3" onSubmit={submitDonation}>
            <div className="col-12">
              <label className="form-label fw-semibold">Số tiền (VND)</label>
              <input
                type="number"
                min={10000}
                step={10000}
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <div className="form-text">Gợi ý: 100,000 - 200,000 - 500,000 VND</div>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Người đóng góp</label>
              <input
                type="text"
                className="form-control"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ tên"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Kênh thanh toán</label>
              <select className="form-select" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="momo">MoMo</option>
                <option value="bank">Chuyển khoản</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Lời nhắn (tùy chọn)</label>
              <textarea
                className="form-control"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Chung tay vì cộng đồng xanh"
              />
            </div>

            <div className="col-12 d-flex justify-content-end">
              <button className="btn btn-success rounded-pill px-4" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang chuyển hướng...' : 'Tiếp tục thanh toán'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
