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
    <section>
      <div className="admin-page-header mb-4">
        <h1 className="h3 mb-1">Admin Dashboard</h1>
        <p className="text-muted small mb-0">Tổng quan hệ thống theo dữ liệu backend.</p>
      </div>

      {loading ? <div className="alert alert-light border mt-3">Đang tải số liệu...</div> : null}
      {error ? <div className="alert alert-danger mt-3">{error}</div> : null}

      <div className="row g-3 mt-1 admin-stats-row">
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Users</p>
              <p className="h4 mb-1">{metrics.totalUsers}</p>
              <p className="text-muted small mb-0">Active: {metrics.activeUsers}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Events</p>
              <p className="h4 mb-1">{metrics.totalEvents}</p>
              <p className="text-muted small mb-0">Pending approvals: {metrics.pendingApprovals}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-xl-4">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Registrations</p>
              <p className="h4 mb-1">{metrics.pendingRegistrations}</p>
              <p className="text-muted small mb-0">Pending volunteer confirmations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-1 admin-stats-row">
        <div className="col-12 col-md-4">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Organizations</p>
              <p className="h4 mb-0">{metrics.totalOrganizations}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Categories</p>
              <p className="h4 mb-0">{metrics.totalCategories}</p>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card h-100 admin-stat-card">
            <div className="card-body">
              <p className="fw-semibold mb-1">Volunteers</p>
              <p className="h4 mb-0">{metrics.totalVolunteers}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
