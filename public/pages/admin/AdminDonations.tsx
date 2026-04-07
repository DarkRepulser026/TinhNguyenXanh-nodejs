import { useEffect, useMemo, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminDonationItem, type DonationStatus } from '../../lib/api';

type DonationFilterStatus = 'all' | 'Pending' | 'Success' | 'Failed';
type DonationFilterMethod = 'all' | 'momo' | 'bank';

type DonationSummary = {
  totalAmountSuccess: number;
  pendingCount: number;
  successCount: number;
  failedCount: number;
};

const defaultSummary: DonationSummary = {
  totalAmountSuccess: 0,
  pendingCount: 0,
  successCount: 0,
  failedCount: 0,
};

const AdminDonations = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DonationFilterStatus>('all');
  const [method, setMethod] = useState<DonationFilterMethod>('all');
  const [items, setItems] = useState<AdminDonationItem[]>([]);
  const [summary, setSummary] = useState<DonationSummary>(defaultSummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<Record<string, DonationStatus>>({});

  const load = async (nextSearch?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getDonations({
        search: (nextSearch ?? search).trim() || undefined,
        status: status === 'all' ? undefined : status,
        method: method === 'all' ? undefined : method,
        page: 1,
        pageSize: 30,
      });

      const nextItems = response.data.items || [];
      setItems(nextItems);
      setSummary(response.data.summary || defaultSummary);
      const drafts: Record<string, DonationStatus> = {};
      nextItems.forEach((item: AdminDonationItem) => {
        drafts[item.id] = item.status;
      });
      setStatusDraft(drafts);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách giao dịch ủng hộ.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [status, method]);

  const onSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await load(search);
  };

  const updateStatus = async (id: string) => {
    const nextStatus = statusDraft[id];
    if (!nextStatus) return;

    try {
      setSavingId(id);
      await adminService.updateDonationStatus(id, nextStatus);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật trạng thái giao dịch.'));
    } finally {
      setSavingId(null);
    }
  };

  const formatCurrency = (value: unknown) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return '--';
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return '--';
    return date.toLocaleString('vi-VN');
  };

  const getStatusBadgeClass = (value?: string) => {
    if (value === 'Pending') return 'badge text-bg-warning';
    if (value === 'Success') return 'badge text-bg-success';
    if (value === 'Failed') return 'badge text-bg-danger';
    return 'badge text-bg-secondary';
  };

  const totalRows = useMemo(() => summary.pendingCount + summary.successCount + summary.failedCount, [summary]);

  return (
    <section>
      <div className="admin-page-header mb-4">
        <h1 className="h3 mb-2">Donations</h1>
        <p className="text-muted small mb-0">Quản lý giao dịch ủng hộ và đối soát trạng thái thanh toán.</p>
      </div>

      <div className="row g-3 mb-3 admin-stats-row">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Tổng giao dịch</p>
              <p className="h4 mb-0">{totalRows}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Đang chờ</p>
              <p className="h4 mb-0">{summary.pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Thành công</p>
              <p className="h4 mb-0">{summary.successCount}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Tổng tiền (Success)</p>
              <p className="h5 mb-0">{formatCurrency(summary.totalAmountSuccess)}</p>
            </div>
          </div>
        </div>
      </div>

      <form className="admin-toolbar row g-2 mb-3" onSubmit={onSearchSubmit}>
        <div className="col-12 col-lg">
          <input
            className="form-control"
            placeholder="Tìm theo mã giao dịch, người ủng hộ, số điện thoại"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-auto">
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as DonationFilterStatus)}
            aria-label="Lọc trạng thái"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Pending">Pending</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        <div className="col-12 col-md-auto">
          <select
            className="form-select"
            value={method}
            onChange={(e) => setMethod(e.target.value as DonationFilterMethod)}
            aria-label="Lọc phương thức"
          >
            <option value="all">Tất cả phương thức</option>
            <option value="momo">MoMo</option>
            <option value="bank">Bank</option>
          </select>
        </div>
        <div className="col-12 col-md-auto">
          <button className="btn btn-dark w-100" type="submit">Search</button>
        </div>
      </form>

      {loading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="table-responsive card">
        <table className="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              <th>Mã giao dịch</th>
              <th>Người ủng hộ</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Thời gian tạo</th>
              <th className="text-end">Cập nhật trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const rowId = String(item.id || '');
              const selectedStatus = statusDraft[rowId] || item.status;
              const canSave = selectedStatus && selectedStatus !== item.status;
              return (
                <tr key={rowId || item.transactionCode}>
                  <td className="small fw-semibold">{item.transactionCode || '--'}</td>
                  <td>
                    <div>{item.donorName || '--'}</div>
                    <div className="small text-muted">{item.phoneNumber || '--'}</div>
                  </td>
                  <td className="small">{formatCurrency(item.amount)}</td>
                  <td className="text-uppercase small">{item.paymentMethod || '--'}</td>
                  <td>
                    <span className={getStatusBadgeClass(item.status)}>{item.status || 'Unknown'}</span>
                  </td>
                  <td className="small text-muted">{formatDateTime(item.createdAt)}</td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <select
                        className="form-select form-select-sm"
                        value={selectedStatus}
                        onChange={(e) => setStatusDraft((prev) => ({ ...prev, [rowId]: e.target.value as DonationStatus }))}
                        aria-label="Donation status"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Success">Success</option>
                        <option value="Failed">Failed</option>
                      </select>
                      <button
                        className="btn btn-sm btn-success"
                        type="button"
                        disabled={!canSave || savingId === rowId}
                        onClick={() => void updateStatus(rowId)}
                      >
                        {savingId === rowId ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && !items.length ? (
              <tr>
                <td className="text-center text-muted py-4" colSpan={7}>
                  Không có giao dịch nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminDonations;
