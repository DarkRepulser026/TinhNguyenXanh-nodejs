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
    </section>
  );
};

export default AdminModeration;
