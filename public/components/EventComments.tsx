import React, { useEffect, useState } from 'react';
import { eventService, type CommentItem, getApiErrorMessage } from '../services/api';
import { useAuth } from '../contexts/useAuth';
import { MessageSquare, Send } from 'lucide-react';
import Swal from 'sweetalert2';

interface EventCommentsProps {
  eventId: number;
}

const EventComments: React.FC<EventCommentsProps> = ({ eventId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [eventId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await eventService.getComments(eventId);
      setComments(response.data);
      setError(null);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Không tải được bình luận.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      Swal.fire('Lỗi', 'Vui lòng nhập bình luận.', 'warning');
      return;
    }

    if (!user?.id) {
      Swal.fire('Lỗi', 'Vui lòng đăng nhập để bình luận.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const response = await eventService.createComment(eventId, newComment);
      setComments([response.data, ...comments]);
      setNewComment('');
      Swal.fire('Thành công', 'Bình luận của bạn đã được gửi.', 'success');
    } catch (e) {
      setError(getApiErrorMessage(e, 'Có lỗi khi gửi bình luận.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="event-comments mt-5 pt-4">
      <h4 className="fw-bold mb-4 d-flex align-items-center gap-2">
        <MessageSquare size={22} className="text-success" /> Bình luận ({comments.length})
      </h4>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Comment Form */}
      {user?.id ? (
        <form onSubmit={handleSubmitComment} className="mb-4">
          <div className="d-flex gap-3">
            <div className="flex-grow-1">
              <textarea
                className="form-control rounded-3 border-2 border-success-subtle"
                rows={3}
                placeholder="Chia sẻ ý kiến của bạn..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
          <div className="mt-2 d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-success rounded-pill px-4 d-flex align-items-center gap-2"
              disabled={submitting || !newComment.trim()}
            >
              <Send size={16} /> {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </button>
          </div>
        </form>
      ) : (
        <div className="alert alert-info mb-4">
          <a href="/login" className="alert-link">Đăng nhập</a> để bình luận về sự kiện này.
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center text-muted py-4">
          <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="card border-0 mb-3 p-3 bg-light">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-1">{comment.userName}</h6>
                  <p className="text-muted small mb-2">
                    {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="mb-0">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventComments;
