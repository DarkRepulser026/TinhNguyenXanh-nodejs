import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/useAuth'
import { moderationService } from '../lib/api'
import './EventDetails.css'

interface Event {
  id: string
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  maxVolunteers: number
  registeredCount: number
  categoryName: string
  organizationName: string
  image?: string
  fullDescription?: string
}

interface Comment {
  id: string
  author: string
  content: string
  rating: number
  createdAt: string
}

export default function EventDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [rating, setRating] = useState(5)
  
  // Report feature states
  const [showReportModal, setShowReportModal] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [reportReason, setReportReason] = useState('spam')
  const [reportDetails, setReportDetails] = useState('')

  useEffect(() => {
    fetchEventDetails()
    fetchComments()
  }, [id])

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`/api/v1/events/${id}`)
      setEvent(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching event:', error)
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/v1/events/${id}/comments`)
      setComments(response.data)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setRegistering(true)
    try {
      await axios.post(`/api/v1/events/${id}/register`, {
        userId: user?.id,
        fullName: user?.fullName,
        phone: user?.phone,
        reason: 'Tôi muốn tham gia sự kiện này'
      })
      alert('Đăng ký tham gia sự kiện thành công!')
      fetchEventDetails()
    } catch (error) {
      alert('Lỗi khi đăng ký. Vui lòng thử lại!')
      console.error('Error registering:', error)
    } finally {
      setRegistering(false)
    }
  }

  const handleReport = async () => {
    if (!isAuthenticated || !id) {
      navigate('/login')
      return
    }

    // Hide for admins
    if (user?.role === 'Admin') return

    setReporting(true)
    try {
      await moderationService.reportEvent(id, {
        reason: reportReason,
        details: reportDetails || undefined
      })
      alert('✅ Báo cáo đã được gửi đến admin! Cảm ơn bạn.')
      setShowReportModal(false)
      setReportReason('spam')
      setReportDetails('')
    } catch (error) {
      alert('❌ Lỗi khi gửi báo cáo. Vui lòng thử lại!')
      console.error('Report error:', error)
    } finally {
      setReporting(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      await axios.post(`/api/v1/events/${id}/comments`, {
        author: user?.fullName,
        content: newComment,
        rating
      })
      setNewComment('')
      setRating(5)
      fetchComments()
    } catch (error) {
      alert('Lỗi khi đăng bình luận!')
      console.error('Error posting comment:', error)
    }
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  if (!event) {
    return <div className="not-found">Không tìm thấy sự kiện</div>
  }

  const spotsLeft = event.maxVolunteers - event.registeredCount

  return (
    <div className="event-details-page">
      <div className="event-header">
        <div className="event-image">
          <img src={event.image || '/assets/event-placeholder.jpg'} alt={event.title} />
        </div>
        <div className="event-info">
          <h1>{event.title}</h1>
          <div className="event-meta">
            <span className="category">{event.categoryName}</span>
            <span className="organization">{event.organizationName}</span>
          </div>
          <p className="description">{event.description}</p>
          <div className="event-stats">
            <div className="stat">
              <strong>📍 Địa điểm:</strong> {event.location}
            </div>
            <div className="stat">
              <strong>📅 Thời gian:</strong> {new Date(event.startTime).toLocaleDateString('vi-VN')}
            </div>
            <div className="stat">
              <strong>👥 Đã đăng ký:</strong> {event.registeredCount}/{event.maxVolunteers}
            </div>
            <div className="stat">
              <strong>Còn lại:</strong> {spotsLeft > 0 ? spotsLeft : 'Đầy'}
            </div>
          </div>
          <button 
            className="btn btn-primary register-btn"
            onClick={handleRegister}
            disabled={registering || spotsLeft <= 0}
          >
            {registering ? 'Đang đăng ký...' : 'Đăng Ký Tham Gia'}
          </button>
          
          {isAuthenticated && user?.role !== 'Admin' && id && (
            <button 
              className="report-btn"
              onClick={() => setShowReportModal(true)}
              title="Báo cáo sự kiện này"
            >
              🚨 Báo cáo
            </button>
          )}
        </div>
      </div>

      {showReportModal && (
        <div className="report-modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="report-modal" onClick={e => e.stopPropagation()}>
            <h3>🚨 Báo cáo sự kiện</h3>
            <p>Sự kiện: <strong>{event?.title}</strong></p>
            
            <div className="form-group">
              <label>Lý do báo cáo <span style={{ color: 'red' }}>*</span></label>
              <select 
                value={reportReason} 
                onChange={e => setReportReason(e.target.value)}
                required
              >
                <option value="spam">Nội dung spam/quảng cáo</option>
                <option value="fake">Thông tin giả mạo/lừa đảo</option>
                <option value="inappropriate">Nội dung không phù hợp</option>
                <option value="other">Khác</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Chi tiết (tùy chọn)</label>
              <textarea 
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
                placeholder="Mô tả chi tiết vấn đề..."
                rows={4}
              />
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowReportModal(false)}
                disabled={reporting}
              >
                Hủy
              </button>
              <button 
                onClick={handleReport}
                disabled={reporting || !reportReason}
              >
                {reporting ? 'Đang gửi...' : 'Gửi báo cáo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220,53,69,0.7); }
          70% { box-shadow: 0 0 0 10px rgba(220,53,69,0); }
          100% { box-shadow: 0 0 0 0 rgba(220,53,69,0); }
        }
        .report-btn:hover {
          transform: scale(1.05);
        }
        .report-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .report-modal {
          background: white;
          padding: 30px;
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .report-modal h3 {
          margin-top: 0;
          color: #dc3545;
          margin-bottom: 10px;
        }
        .report-modal .form-group {
          margin-bottom: 20px;
        }
        .report-modal .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
        }
        .report-modal select,
        .report-modal textarea {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-family: inherit;
          font-size: 1em;
        }
        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .modal-actions button {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }
        .modal-actions button:first-child {
          background: white;
          border: 1px solid #ddd;
          color: #333;
        }
        .modal-actions button:last-child {
          background: #dc3545;
          color: white;
        }
        .modal-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="event-content">
        <section className="full-description">
          <h2>Mô Tả Chi Tiết</h2>
          <p>{event.fullDescription || event.description}</p>
        </section>

        <section className="comments-section">
          <h2>Bình Luận & Đánh Giá</h2>
          
          {isAuthenticated && (
            <form className="comment-form" onSubmit={handleCommentSubmit}>
              <div className="form-group">
                <label>Đánh giá:</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  <option value={5}>⭐ 5 Sao</option>
                  <option value={4}>⭐ 4 Sao</option>
                  <option value={3}>⭐ 3 Sao</option>
                  <option value={2}>⭐ 2 Sao</option>
                  <option value={1}>⭐ 1 Sao</option>
                </select>
              </div>
              <div className="form-group">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  rows={4}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Đăng Bình Luận</button>
            </form>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-card">
                  <div className="comment-header">
                    <strong>{comment.author}</strong>
                    <span className="rating">{'⭐'.repeat(comment.rating)}</span>
                  </div>
                  <p>{comment.content}</p>
                  <small>{new Date(comment.createdAt).toLocaleDateString('vi-VN')}</small>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
