import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/useAuth'
import './OrganizationDetails.css'

interface Organization {
  id: string
  name: string
  description: string
  city: string
  contactEmail: string
  phoneNumber: string
  logo?: string
  website?: string
  eventsCount?: number
  volunteersCount?: number
}

interface Review {
  id: string
  author: string
  content: string
  rating: number
  createdAt: string
}

export default function OrganizationDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [newReview, setNewReview] = useState('')
  const [rating, setRating] = useState(5)

  useEffect(() => {
    fetchOrgDetails()
    fetchReviews()
  }, [id])

  const fetchOrgDetails = async () => {
    try {
      const response = await axios.get(`/api/v1/organizations/${id}`)
      setOrg(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching organization:', error)
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/v1/organizations/${id}/reviews`)
      setReviews(response.data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      await axios.post(`/api/v1/organizations/${id}/reviews`, {
        author: user?.fullName,
        content: newReview,
        rating
      })
      setNewReview('')
      setRating(5)
      fetchReviews()
    } catch (error) {
      alert('Lỗi khi đăng đánh giá!')
      console.error('Error posting review:', error)
    }
  }

  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  if (!org) {
    return <div className="not-found">Không tìm thấy tổ chức</div>
  }

  return (
    <div className="org-details-page">
      <div className="org-header">
        <div className="org-logo">
          <img src={org.logo || '/assets/org-placeholder.jpg'} alt={org.name} />
        </div>
        <div className="org-info">
          <h1>{org.name}</h1>
          <p className="description">{org.description}</p>
          <div className="org-stats">
            <div className="stat">
              <strong>📍 Thành phố:</strong> {org.city}
            </div>
            <div className="stat">
              <strong>📧 Email:</strong> <a href={`mailto:${org.contactEmail}`}>{org.contactEmail}</a>
            </div>
            <div className="stat">
              <strong>📞 Điện thoại:</strong> {org.phoneNumber}
            </div>
            {org.website && (
              <div className="stat">
                <strong>🌐 Website:</strong> <a href={org.website} target="_blank" rel="noopener noreferrer">{org.website}</a>
              </div>
            )}
          </div>
          <div className="org-numbers">
            <div className="number-card">
              <h3>{org.eventsCount || 0}</h3>
              <p>Sự Kiện</p>
            </div>
            <div className="number-card">
              <h3>{org.volunteersCount || 0}</h3>
              <p>Người Tình Nguyện</p>
            </div>
          </div>
        </div>
      </div>

      <div className="org-content">
        <section className="reviews-section">
          <h2>Đánh Giá Từ Tình Nguyện Viên</h2>
          
          {isAuthenticated && (
            <form className="review-form" onSubmit={handleReviewSubmit}>
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
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Viết đánh giá của bạn..."
                  rows={4}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Đăng Đánh Giá</button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <strong>{review.author}</strong>
                    <span className="rating">{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <p>{review.content}</p>
                  <small>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</small>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
