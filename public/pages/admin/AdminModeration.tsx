import { useEffect, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminModerationReport } from '../../services/api';

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
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Moderation</h1>
      <p className="text-muted-foreground mb-6 text-sm">Báo cáo kiểm duyệt tổng hợp.</p>

      {loading ? <div className="rounded border bg-card p-4 text-sm">Đang tải dữ liệu...</div> : null}
      {error ? <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 text-sm">
          <p className="font-medium">Rejected events</p>
          <p className="mt-1 text-xl font-semibold">{report.summary.rejectedEvents}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-sm">
          <p className="font-medium">Hidden events</p>
          <p className="mt-1 text-xl font-semibold">{report.summary.hiddenEvents}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-sm">
          <p className="font-medium">Inactive users</p>
          <p className="mt-1 text-xl font-semibold">{report.summary.inactiveUsers}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-card p-6">
        <p className="text-sm font-medium">System note</p>
        <p className="text-muted-foreground mt-1 text-xs">{report.message || 'Không có ghi chú.'}</p>
      </div>
    </section>
  );
};

export default AdminModeration;
