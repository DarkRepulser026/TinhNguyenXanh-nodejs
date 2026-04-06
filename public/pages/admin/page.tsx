import { useEffect, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminDashboardMetrics } from '../../lib/api';

const defaultMetrics: AdminDashboardMetrics = {
  totalUsers: 0,
  activeUsers: 0,
  totalEvents: 0,
  pendingApprovals: 0,
  totalOrganizations: 0,
  totalCategories: 0,
  totalVolunteers: 0,
  pendingRegistrations: 0,
};

export default function AdminPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics>(defaultMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const response = await adminService.getDashboard();
        setMetrics(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Không thể tải dữ liệu dashboard admin.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Tổng quan hệ thống theo dữ liệu backend.</p>
      </div>

      {loading ? <div className="rounded-xl border bg-card p-4 text-sm">Đang tải số liệu...</div> : null}
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-medium">Users</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.totalUsers}</p>
          <p className="text-muted-foreground mt-1 text-xs">Active: {metrics.activeUsers}</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm font-medium">Events</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.totalEvents}</p>
          <p className="text-muted-foreground mt-1 text-xs">Pending approvals: {metrics.pendingApprovals}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 md:col-span-2 xl:col-span-1">
          <p className="text-sm font-medium">Registrations</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.pendingRegistrations}</p>
          <p className="text-muted-foreground mt-1 text-xs">Pending volunteer confirmations</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 text-sm">
          <p className="font-medium">Organizations</p>
          <p className="mt-1 text-xl font-semibold">{metrics.totalOrganizations}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-sm">
          <p className="font-medium">Categories</p>
          <p className="mt-1 text-xl font-semibold">{metrics.totalCategories}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-sm">
          <p className="font-medium">Volunteers</p>
          <p className="mt-1 text-xl font-semibold">{metrics.totalVolunteers}</p>
        </div>
      </div>
    </section>
  );
}
