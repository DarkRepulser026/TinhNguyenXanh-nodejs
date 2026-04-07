import { useEffect, useMemo, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminEventReport } from '../../lib/api';

type FilterStatus = 'all' | 'Pending' | 'Approved' | 'Rejected';

const AdminReports = () => {
  const [reports, setReports] = useState<AdminEventReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getEventReports();
      setReports(res.data.items || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Xác nhận phê duyệt báo cáo này? Sự kiện sẽ bị ẩn.')) return;
    try {
      setProcessingId(id);
      await adminService.approveReport(id);
      await loadReports();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Xác nhận từ chối báo cáo này?')) return;
    try {
      setProcessingId(id);
      await adminService.rejectReport(id);
      await loadReports();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReports = useMemo(() => {
    if (filterStatus === 'all') return reports;
    return reports.filter((r) => r.status === filterStatus);
  }, [filterStatus, reports]);

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'Pending').length,
    approved: reports.filter((r) => r.status === 'Approved').length,
    rejected: reports.filter((r) => r.status === 'Rejected').length,
  };

  const getStatusBadgeClass = (status?: string) => {
    if (status === 'Pending') return 'badge text-bg-warning';
    if (status === 'Approved') return 'badge text-bg-success';
    if (status === 'Rejected') return 'badge text-bg-danger';
    return 'badge text-bg-secondary';
  };

  const formatDateTime = (value?: string) => {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) return '--';
    return date.toLocaleString('vi-VN');
  };

  const getFilterLabel = (status: FilterStatus) => {
    if (status === 'Pending') return 'Chờ xử lý';
    if (status === 'Approved') return 'Đã phê duyệt';
    if (status === 'Rejected') return 'Đã từ chối';
    return 'Tất cả trạng thái';
  };

  return (
    <section>
      <div className="admin-page-header mb-4">
        <h1 className="h3 mb-2">Reports</h1>
        <p className="text-muted small mb-0">Xem xét và xử lý báo cáo vi phạm sự kiện.</p>
      </div>

      <div className="row g-3 mb-3 admin-stats-row">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Tổng báo cáo</p>
              <p className="h4 mb-0">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Chờ xử lý</p>
              <p className="h4 mb-0">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Đã phê duyệt</p>
              <p className="h4 mb-0">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Đã từ chối</p>
              <p className="h4 mb-0">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      <form className="admin-toolbar row g-2 mb-3" onSubmit={(e) => e.preventDefault()}>
        <div className="col-12 col-md-auto">
          <div className="dropdown">
            <button
              className="btn btn-outline-dark admin-filter-dropdown"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Lọc trạng thái báo cáo"
            >
              {getFilterLabel(filterStatus)}
            </button>
            <ul className="dropdown-menu admin-filter-menu">
              <li>
                <button
                  type="button"
                  className={`dropdown-item ${filterStatus === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('all')}
                >
                  Tất cả trạng thái
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`dropdown-item ${filterStatus === 'Pending' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('Pending')}
                >
                  Chờ xử lý
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`dropdown-item ${filterStatus === 'Approved' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('Approved')}
                >
                  Đã phê duyệt
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`dropdown-item ${filterStatus === 'Rejected' ? 'active' : ''}`}
                  onClick={() => setFilterStatus('Rejected')}
                >
                  Đã từ chối
                </button>
              </li>
            </ul>
          </div>
        </div>
      </form>

      {loading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="table-responsive card">
        <table className="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              <th>Sự kiện</th>
              <th>Lý do</th>
              <th>Trạng thái</th>
              <th>Ẩn</th>
              <th>Thời gian</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => {
              const reportId = String(report.id || '');
              return (
                <tr key={reportId || `${report.eventId}-${report.createdAt}`}>
                  <td className="fw-semibold">{report.eventTitle || 'Sự kiện không xác định'}</td>
                  <td className="small text-muted">{report.reason || '--'}</td>
                  <td>
                    <span className={getStatusBadgeClass(report.status)}>{report.status || 'Unknown'}</span>
                  </td>
                  <td>{report.isHidden ? 'Yes' : 'No'}</td>
                  <td className="small text-muted">{formatDateTime(report.createdAt)}</td>
                  <td className="text-end">
                    {report.status === 'Pending' ? (
                      <div className="d-inline-flex gap-2">
                        <button
                          onClick={() => void handleApprove(reportId)}
                          disabled={processingId === reportId}
                          className="btn btn-sm btn-success"
                          type="button"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => void handleReject(reportId)}
                          disabled={processingId === reportId}
                          className="btn btn-sm btn-danger"
                          type="button"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="small text-muted">--</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {!loading && !filteredReports.length ? (
              <tr>
                <td className="text-center text-muted py-4" colSpan={6}>
                  Không có báo cáo nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminReports;