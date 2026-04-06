import React, { useEffect, useState } from 'react'
import { Calendar, Building2, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { adminService, getApiErrorMessage, type AdminEventApprovalItem } from '../../lib/api'

const AdminEventApprovals = () => {
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<AdminEventApprovalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'draft'>('all')

  const load = async (keyword?: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminService.getEventApprovals({ 
        search: keyword || undefined, 
        page: 1, 
        pageSize: 20 
      })
      let filteredItems = response.data.items
      if (filterStatus !== 'all') {
        filteredItems = filteredItems.filter(item => item.status === filterStatus)
      }
      setItems(filteredItems)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách sự kiện chờ duyệt.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const updateStatus = async (id: number, action: 'approve' | 'reject') => {
    if (action === 'reject' && !confirm('Bạn có chắc chắn muốn từ chối sự kiện này?')) {
      return
    }

    try {
      await adminService.updateEventStatus(id, action)
      setItems((prev) => prev.filter((item) => item.id !== id))
      // Show success feedback
      setTimeout(() => {
        const message = action === 'approve' 
          ? '✅ Sự kiện đã được phê duyệt!' 
          : '❌ Sự kiện đã bị từ chối!'
        alert(message)
      }, 300)
    } catch (err) {
      setError(getApiErrorMessage(err, `Không thể ${action === 'approve' ? 'phê duyệt' : 'từ chối'} sự kiện.`))
    }
  }

  const onSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await load(search.trim())
  }

  const EventApprovalCard = ({ item }: { item: AdminEventApprovalItem }) => (
    <div className="approval-card">
      <div className="event-left">
        <div className="event-header">
          <h3 className="event-title">{item.title}</h3>
          <span className={`status-badge status-${item.status}`}>
            {item.status === 'draft' ? '📝 Nháp' : '⏳ Chờ duyệt'}
          </span>
        </div>
        <div className="event-meta">
          <div className="meta-item">
            <Building2 size={16} />
            <span>{item.organizationName || 'Chưa có tổ chức'}</span>
          </div>
          <div className="meta-item">
            <Clock size={16} />
            <span>{new Date(item.startTime).toLocaleString('vi-VN')}</span>
          </div>
        </div>
      </div>
      <div className="event-actions">
        <button
          className="btn-approve modern"
          onClick={() => void updateStatus(item.id, 'approve')}
          title="Phê duyệt sự kiện"
        >
          <CheckCircle2 size={20} />
          Duyệt
        </button>
        <button
          className="btn-reject modern"
          onClick={() => void updateStatus(item.id, 'reject')}
          title="Từ chối sự kiện"
        >
          <XCircle size={20} />
          Từ chối
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="loading-section">
        <div className="loading-skeleton">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-event-approvals">
      <div className="page-header">
        <div>
          <h1>✅ Sự kiện chờ phê duyệt</h1>
          <p className="page-subtitle">
            Quản lý {items.length} sự kiện đang chờ duyệt ({items.filter(item => item.status === 'pending').length} pending)
          </p>
        </div>
        <div className="header-badge">{items.length}</div>
      </div>

      <div className="filter-section">
        <form className="search-form" onSubmit={onSearchSubmit}>
          <div className="search-input-group">
            <input
              className="search-input"
              placeholder="🔍 Tìm theo tên sự kiện hoặc tổ chức..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="search-btn" type="submit">
              Tìm
            </button>
          </div>
        </form>
        
        <div className="status-filter">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Tất cả
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            onClick={() => setFilterStatus('pending')}
          >
            Chờ duyệt
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'draft' ? 'active' : ''}`}
            onClick={() => setFilterStatus('draft')}
          >
            Nháp
          </button>
        </div>
      </div>

      {error ? (
        <div className="error-card">
          <AlertTriangle size={48} />
          <h4>Lỗi tải dữ liệu</h4>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => load(search.trim())}>
            🔄 Thử lại
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Calendar size={80} className="empty-icon" />
          <h3>Không có sự kiện chờ xử lý</h3>
          <p>Tất cả sự kiện đều đã được phê duyệt hoặc từ chối.</p>
        </div>
      ) : (
        <div className="events-grid">
          {items.map((item) => (
            <EventApprovalCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <style jsx>{`
        .admin-event-approvals {
          --primary-green: #16a34a;
          --card-bg: #ffffff;
          --border-color: #e5e7eb;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--border-color);
        }

        .page-header h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary-green), #22c55e);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 1rem;
          margin: 0.25rem 0 0 0;
        }

        .header-badge {
          background: linear-gradient(135deg, var(--primary-green), #22c55e);
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
        }

        .filter-section {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-form {
          flex: 1;
          min-width: 300px;
        }

        .search-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .search-input {
          flex: 1;
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-green);
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
        }

        .search-btn {
          background: var(--primary-green);
          color: white;
          border: none;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-btn:hover {
          background: #15803d;
          transform: translateY(-1px);
        }

        .status-filter {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.75rem 1.25rem;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #64748b;
        }

        .filter-btn:hover {
          border-color: var(--primary-green);
          color: var(--primary-green);
        }

        .filter-btn.active {
          background: var(--primary-green);
          color: white;
          border-color: var(--primary-green);
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
        }

        .approval-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .approval-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(22, 163, 74, 0.15);
          border-color: var(--primary-green);
        }

        .event-left {
          flex: 1;
        }

        .event-header {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .event-title {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
          flex: 1;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #f59e0b;
        }

        .status-pending {
          background: #dbeafe;
          color: #1e40af;
          border-color: #3b82f6;
        }

        .event-meta {
          display: flex;
          gap: 1.5rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.9rem;
        }

        .event-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-approve.modern,
        .btn-reject.modern {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .btn-approve.modern {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #166534;
          border: 2px solid #86efac;
        }

        .btn-approve.modern:hover {
          background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(22, 163, 74, 0.3);
        }

        .btn-reject.modern {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #dc2626;
          border: 2px solid #fca5a5;
        }

        .btn-reject.modern:hover {
          background: linear-gradient(135deg, #fecaca 0%, #f87171 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(220, 38, 38, 0.3);
        }

        .events-grid {
          display: grid;
          gap: 1rem;
        }

        .loading-section {
          padding: 4rem 2rem;
          text-align: center;
        }

        .loading-skeleton {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .skeleton-card {
          height: 120px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          border-radius: 16px;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .error-card {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border: 1px solid #fecaca;
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          margin: 2rem 0;
        }

        .error-card svg {
          color: #ef4444;
        }

        .retry-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s ease;
        }

        .retry-btn:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #64748b;
        }

        .empty-icon {
          opacity: 0.5;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .header-badge {
            align-self: flex-end;
          }

          .filter-section {
            flex-direction: column;
          }

          .approval-card {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .event-actions {
            justify-content: stretch;
          }

          .btn-approve.modern,
          .btn-reject.modern {
            flex: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default AdminEventApprovals

