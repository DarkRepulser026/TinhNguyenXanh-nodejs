import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getApiErrorMessage, paymentService, type DonationStatus } from '../../lib/api';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

type PaymentStatus = 'success' | 'failed' | 'pending';

const mapDonationStatus = (status: DonationStatus): PaymentStatus => {
  if (status === 'Success') {
    return 'success';
  }

  if (status === 'Failed') {
    return 'failed';
  }

  return 'pending';
};

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resolvedStatus, setResolvedStatus] = useState<PaymentStatus | null>(null);
  const [resolvedAmount, setResolvedAmount] = useState<string | null>(null);
  const [resolvedMethod, setResolvedMethod] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const txn = searchParams.get('txn') || searchParams.get('orderId') || 'N/A';
  const queryStatus = (searchParams.get('status') as PaymentStatus) || 'pending';
  const resultCode = searchParams.get('resultCode');

  let initialStatus = queryStatus;
  if (resultCode === '0') initialStatus = 'success';
  else if (resultCode && resultCode !== '0') initialStatus = 'failed';

  const queryAmount = searchParams.get('amount') || '0';
  const queryMethod = searchParams.get('method') || 'unknown';

  useEffect(() => {
    const loadTransaction = async () => {
      if (!txn || txn === 'N/A') {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await paymentService.getByTransaction(txn);
        setResolvedStatus(mapDonationStatus(response.data.status));
        setResolvedAmount(response.data.amount);
        setResolvedMethod(response.data.method);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Không thể đồng bộ trạng thái giao dịch từ hệ thống.'));
      } finally {
        setLoading(false);
      }
    };

    void loadTransaction();
  }, [txn]);

  const status = (resolvedStatus && resolvedStatus !== 'pending') ? resolvedStatus : initialStatus;
  const amount = resolvedAmount || queryAmount;
  const method = resolvedMethod || queryMethod;

  useEffect(() => {
    if (status === 'success') {
      if (countdown <= 0) {
        navigate('/');
        return;
      }
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, countdown, navigate]);

  const title = useMemo(
    () =>
      status === 'success' ? 'Thanh toán thành công' : status === 'failed' ? 'Thanh toán thất bại' : 'Thanh toán đang xử lý',
    [status],
  );

  const variant = status === 'success' ? 'success' : status === 'failed' ? 'danger' : 'warning';

  return (
    <div className="py-5">
      <div className="container" style={{ maxWidth: '760px' }}>
        {loading ? <div className="alert alert-info rounded-4">Đang đồng bộ trạng thái giao dịch...</div> : null}
        {error ? <div className="alert alert-warning rounded-4">{error}</div> : null}

        <div className={`alert alert-${variant} rounded-4 border-0 shadow-sm p-4 text-center`}>
          {status === 'success' ? (
            <CheckCircle2 size={56} className="text-success mx-auto mb-3" />
          ) : status === 'failed' ? (
            <XCircle size={56} className="text-danger mx-auto mb-3" />
          ) : (
            <Clock size={56} className="text-warning mx-auto mb-3" />
          )}
          <h1 className="h4 fw-bold mb-2">{title}</h1>
          <p className="mb-0">
            Cảm ơn bạn đã đồng hành cùng VolunteerHub. Vui lòng lưu thông tin giao dịch bên dưới.
          </p>
          {status === 'success' && (
            <p className="mt-3 mb-0 text-muted small">
              Trang sẽ tự động chuyển về trang chủ sau <strong className="text-dark">{countdown}</strong> giây...
            </p>
          )}
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4">
          <h2 className="h6 fw-bold mb-3">Thông tin giao dịch</h2>
          <div className="row g-3 small">
            <div className="col-sm-6">
              <p className="text-muted mb-1">Mã giao dịch</p>
              <p className="fw-semibold mb-0">{txn}</p>
            </div>
            <div className="col-sm-6">
              <p className="text-muted mb-1">Số tiền</p>
              <p className="fw-semibold mb-0">{Number(amount).toLocaleString('vi-VN')} VND</p>
            </div>
            <div className="col-sm-6">
              <p className="text-muted mb-1">Phương thức</p>
              <p className="fw-semibold mb-0 text-uppercase">{method}</p>
            </div>
            <div className="col-sm-6">
              <p className="text-muted mb-1">Trạng thái</p>
              <p className="fw-semibold mb-0 text-uppercase">{status}</p>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 mt-4">
            <Link to="/" className="btn btn-success rounded-pill px-4">
              Về trang chủ
            </Link>
            <Link to="/donate" className="btn btn-outline-success rounded-pill px-4">
              Đóng góp tiếp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
