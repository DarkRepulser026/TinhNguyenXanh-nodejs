import { useEffect, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminModerationReport } from '../../lib/api';

const defaultReport: AdminModerationReport = {
  queue: [],
  summary: {
    rejectedEvents: 0,
    hiddenEvents: 0,
    inactiveUsers: 0,
  },
  message: '',
};

function formatDateTime(value?: string) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return '--';
  return date.toLocaleString('vi-VN');
}

function getStatusBadgeClass(status?: string) {
  if (status === 'Pending') return 'badge text-bg-warning';
  if (status === 'Resolved') return 'badge text-bg-success';
  if (status === 'Rejected') return 'badge text-bg-danger';
  return 'badge text-bg-secondary';
}

const AdminModeration = () => {
  const [report, setReport] = useState<AdminModerationReport>(defaultReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const response = await adminService.getModeration();
        setReport(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Không thể tải tổng quan kiểm duyệt.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <section>
      <h1 className="h3 mb-2">Moderation</h1>
      <p className="text-muted small mb-4">Báo cáo kiểm duyệt tổng hợp.</p>

      {loading ? <div className="alert alert-light border">Đang tải dữ liệu...</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <p className="fw-semibold mb-1">Rejected events</p>
              <p className="h4 mb-0">{report.summary.rejectedEvents}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <p className="fw-semibold mb-1">Hidden events</p>
              <p className="h4 mb-0">{report.summary.hiddenEvents}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <p className="fw-semibold mb-1">Inactive users</p>
              <p className="h4 mb-0">{report.summary.inactiveUsers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-body">
          <p className="fw-semibold mb-1">System note</p>
          <p className="text-muted small mb-0">{report.message || 'Không có ghi chú.'}</p>
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="fw-semibold mb-0">Report queue</p>
            <span className="badge rounded-pill text-bg-dark">{Array.isArray(report.queue) ? report.queue.length : 0}</span>
          </div>

          {!loading && !error && (!Array.isArray(report.queue) || report.queue.length === 0) ? (
            <div className="alert alert-light border mb-0">Không có báo cáo nào trong hàng đợi.</div>
          ) : null}

          {Array.isArray(report.queue) && report.queue.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Reason</th>
                    <th scope="col">Details</th>
                    <th scope="col">Event</th>
                    <th scope="col">Reporter</th>
                    <th scope="col">Status</th>
                    <th scope="col">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {report.queue.map((item: any) => (
                    <tr key={item.id || item._id || `${item.eventId}-${item.createdAt}`}>
                      <td className="small text-muted">{item.id || item._id || '--'}</td>
                      <td>{item.reason || '--'}</td>
                      <td className="small text-muted">{item.details || '--'}</td>
                      <td className="small">{item.eventId || '--'}</td>
                      <td className="small">{item.reporterUserId || '--'}</td>
                      <td>
                        <span className={getStatusBadgeClass(item.status)}>{item.status || 'Unknown'}</span>
                      </td>
                      <td className="small">{formatDateTime(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default AdminModeration;
