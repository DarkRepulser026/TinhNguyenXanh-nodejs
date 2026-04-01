import React, { useEffect, useState } from 'react';
import { eventService, type RatingItem, getApiErrorMessage } from '../services/api';
import { useAuth } from '../contexts/useAuth';
import { Star, MessageSquare } from 'lucide-react';
import Swal from 'sweetalert2';

interface EventReviewProps {
  eventId: number;
}

const EventReview: React.FC<EventReviewProps> = ({ eventId }) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<{ averageRating: number; totalRatings: number; ratings: RatingItem[] }>({
    averageRating: 0,
    totalRatings: 0,
    ratings: [],
  });
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRatings();
  }, [eventId]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const response = await eventService.getRatings(eventId);
      setRatings(response.data);
      
      // Check if user already rated this event
      const userExistingRating = response.data.ratings.find(r => r.userId === user?.id);
      if (userExistingRating) {
        setUserRating(userExistingRating.rating);
        setUserReview(userExistingRating.review || '');
      }
      
      setError(null);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Không tải được đánh giá.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userRating || userRating < 1 || userRating > 5) {
      Swal.fire('Lỗi', 'Vui lòng chọn đánh giá từ 1 đến 5 sao.', 'warning');
      return;
    }

    if (!user?.id) {
      Swal.fire('Lỗi', 'Vui lòng đăng nhập để đánh giá.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const response = await eventService.createRating(eventId, {
        rating: userRating,
        review: userReview || undefined,
      });

      // Reload ratings to update the list
      await loadRatings();
      Swal.fire('Thành công', 'Đánh giá của bạn đã được gửi.', 'success');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Có lỗi khi gửi đánh giá.'));
    } finally {
      setSubmitting(false);
    }
  };

  const RatingStars: React.FC<{ value: number; onChange?: (val: number) => void; readOnly?: boolean }> = ({
    value,
    onChange,
    readOnly = false,
  }) => {
    return (
      <div className="d-flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`btn p-0 border-0 ${
              star <= value ? 'text-warning' : 'text-muted'
            }`}
            style={{ fontSize: '1.5rem' }}
            onClick={() => !readOnly && onChange?.(star)}
            disabled={readOnly}
          >
            <Star size={20} fill={star <= value ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="event-reviews mt-5 pt-4">
      <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
        <Star size={22} className="text-warning" fill="currentColor" />
        Đánh giá & Review ({ratings.totalRatings})
      </h4>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Rating Summary */}
      {ratings.totalRatings > 0 && (
        <div className="card border-0 bg-light rounded-4 p-4 mb-4">
          <div className="row align-items-center">
            <div className="col-md-3 text-center mb-3 mb-md-0">
              <h2 className="fw-bold text-warning mb-1">{ratings.averageRating.toFixed(1)}</h2>
              <RatingStars value={Math.round(ratings.averageRating)} readOnly />
              <p className="text-muted small mt-2">{ratings.totalRatings} đánh giá</p>
            </div>
            <div className="col-md-9">
              <div className="rating-bars">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratings.ratings.filter(r => r.rating === stars).length;
                  const percentage = ratings.totalRatings > 0 ? (count / ratings.totalRatings) * 100 : 0;
                  return (
                    <div key={stars} className="d-flex align-items-center gap-2 mb-2">
                      <span className="small text-muted" style={{ minWidth: '60px' }}>
                        {stars} <Star size={14} fill="currentColor" className="text-warning" />
                      </span>
                      <div className="progress flex-grow-1" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-warning"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="small text-muted" style={{ minWidth: '40px' }}>({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Form */}
      {user?.id ? (
        <form onSubmit={handleSubmitRating} className="card border-0 bg-white rounded-4 p-4 mb-4 shadow-sm">
          <h6 className="fw-bold mb-3">Đánh giá sự kiện này</h6>
          
          <div className="mb-3">
            <label className="form-label">Đánh giá</label>
            <RatingStars value={userRating} onChange={setUserRating} />
          </div>

          <div className="mb-3">
            <label className="form-label">Nhận xét (tùy chọn)</label>
            <textarea
              className="form-control rounded-3 border-2 border-success-subtle"
              rows={3}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={() => {
                setUserRating(0);
                setUserReview('');
              }}
              disabled={submitting}
            >
              Xóa
            </button>
            <button
              type="submit"
              className="btn btn-success rounded-pill px-4"
              disabled={submitting || userRating === 0}
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      ) : (
        <div className="alert alert-info mb-4">
          <a href="/login" className="alert-link">Đăng nhập</a> để đánh giá sự kiện này.
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : ratings.ratings.length === 0 ? (
        <div className="text-center text-muted py-4">
          <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {ratings.ratings.map((rating) => (
            <div key={rating.id} className="card border-0 mb-3 p-3 bg-light">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="fw-bold mb-1">{rating.userName}</h6>
                  <RatingStars value={rating.rating} readOnly />
                </div>
                <small className="text-muted">
                  {new Date(rating.createdAt).toLocaleDateString('vi-VN')}
                </small>
              </div>
              {rating.review && <p className="mb-0 text-dark">{rating.review}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventReview;
