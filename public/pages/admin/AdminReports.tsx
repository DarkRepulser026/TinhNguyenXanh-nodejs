import React, { useEffect, useState } from 'react';
import { adminService, getApiErrorMessage, type AdminEventReport } from '../../lib/api';
import { AlertTriangle, CheckCircle, XCircle, EyeOff, Eye, Calendar, FileText } from 'lucide-react';

type FilterStatus = 'all' | 'Pending' | 'Approved' | 'Rejected';

const statusBadgeStyle = (status: string): React.CSSProperties => {
  const map: Record<string, React.CSSProperties> = {
    Pending: { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
    Approved: { background: '#d1fae5', color: '#065f46', border: '1px solid #86efac' },
    Rejected: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
  };
  return {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '9999px',
    fontSize: '0.78rem',
    fontWeight: 700,
    ...map[status] || { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' },
  };
};

const hiddenBadge: React.CSSProperties = {
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: '9999px',
  fontSize: '0.78rem',
  fontWeight: 700,
  background: '#fee2e2',
  color: '#dc2626',
  border: '1px solid #fca5a5',
};

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
    if (!confirm('Xác nhận phê duyệt báo cáo này? Sự kiện sẽ bị ẩn.')) return;
    try {
      setProcessingId(id);
      await adminService.approveReport(id);
      alert('Đã phê duyệt báo cáo và ẩn sự kiện.');
      await loadReports();
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Xác nhận từ chối báo cáo này?')) return;
    try {
      setProcessingId(id);
      await adminService.rejectReport(id);
      alert('Đã từ chối báo cáo.');
      await loadReports();
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'Pending').length,
    approved: reports.filter((r) => r.status === 'Approved').length,
    rejected: reports.filter((r) => r.status === 'Rejected').length,
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}>
          <AlertTriangle size={28} color="#dc2626" />
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: 0,
          }}>
            Quản lý báo cáo sự kiện
          </h1>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          Xem xét và xử lý các báo cáo vi phạm từ người dùng
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {[
          { label: 'Tổng báo cáo', value: stats.total, color: '#3b82f6' },
          { label: 'Chờ xử lý', value: stats.pending, color: '#f59e0b' },
          { label: 'Đã phê duyệt', value: stats.approved, color: '#10b981' },
          { label: 'Đã từ chối', value: stats.rejected, color: '#ef4444' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '8px' }}>
              {stat.label}
            </div>
            <div style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: stat.color,
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        {(['all', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              background: filterStatus === status ? '#16a34a' : '#ffffff',
              color: filterStatus === status ? '#ffffff' : '#0f172a',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {status === 'all' ? 'Tất cả' : status === 'Pending' ? 'Chờ xử lý' : status === 'Approved' ? 'Đã duyệt' : 'Đã từ chối'}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          color: '#991b1b',
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Đang tải dữ liệu...
        </div>
      )}

      {/* Reports List */}
      {!loading && filteredReports.length === 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: '#64748b',
        }}>
          Không có báo cáo nào
        </div>
      )}

      {!loading && filteredReports.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredReports.map((report) => (
            <div
              key={report.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '20px',
                flexWrap: 'wrap',
              }}>
                {/* Left: Info */}
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                  }}>
                    <span style={statusBadgeStyle(report.status)}>{report.status}</span>
                    {report.isHidden && (
                      <span style={hiddenBadge}>
                        <EyeOff size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        Đã ẩn
                      </span>
                    )}
                  </div>

                  <div style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <FileText size={18} color="#16a34a" />
                    {report.eventTitle || 'Sự kiện không xác định'}
                  </div>

                  <div style={{
                    color: '#64748b',
                    fontSize: '0.9rem',
                    marginBottom: '12px',
                    lineHeight: 1.6,
                  }}>
                    <strong>Lý do:</strong> {report.reason}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#64748b',
                    fontSize: '0.85rem',
                  }}>
                    <Calendar size={14} />
                    {new Date(report.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>

                {/* Right: Actions */}
                {report.status === 'Pending' && (
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                  }}>
                    <button
                      onClick={() => handleApprove(report.id)}
                      disabled={processingId === report.id}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#10b981',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: processingId === report.id ? 'not-allowed' : 'pointer',
                        opacity: processingId === report.id ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <CheckCircle size={16} />
                      Phê duyệt & Ẩn sự kiện
                    </button>
                    <button
                      onClick={() => handleReject(report.id)}
                      disabled={processingId === report.id}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: processingId === report.id ? 'not-allowed' : 'pointer',
                        opacity: processingId === report.id ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <XCircle size={16} />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReports;