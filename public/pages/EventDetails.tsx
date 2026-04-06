import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/useAuth'
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
        </div>
      </div>

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
