import OrganizerLayout from './OrganizerLayout';
import { useEffect, useState } from 'react';
import { getApiErrorMessage, organizerService, type OrganizerDashboard } from '../../services/api';

const defaultDashboard: OrganizerDashboard = {
  organization: {
    id: 0,
    name: '',
  },
  metrics: {
    totalEvents: 0,
    approvedEvents: 0,
    pendingEvents: 0,
    draftEvents: 0,
    totalRegistrations: 0,
    pendingRegistrations: 0,
    confirmedRegistrations: 0,
  },
};

const OrganizerOverview = () => {
  const [dashboard, setDashboard] = useState<OrganizerDashboard>(defaultDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const response = await organizerService.getDashboard();
        setDashboard(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Không thể tải tổng quan tổ chức.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <OrganizerLayout>
      <section>
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Organizer Dashboard</h1>
        <p className="text-muted-foreground mb-6 text-sm">Tổng quan tổ chức: {dashboard.organization.name || 'N/A'}</p>

        {loading ? <div className="rounded border bg-card p-4 text-sm">Đang tải dữ liệu...</div> : null}
        {error ? <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-4 text-sm">
            <p className="font-medium">Total events</p>
            <p className="mt-1 text-xl font-semibold">{dashboard.metrics.totalEvents}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-sm">
            <p className="font-medium">Pending events</p>
            <p className="mt-1 text-xl font-semibold">{dashboard.metrics.pendingEvents}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-sm">
            <p className="font-medium">Pending registrations</p>
            <p className="mt-1 text-xl font-semibold">{dashboard.metrics.pendingRegistrations}</p>
          </div>
        </div>
      </section>
    </OrganizerLayout>
  );
};

export default OrganizerOverview;

