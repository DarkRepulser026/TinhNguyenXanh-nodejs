import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Trash2, 
  Eye, 
  Clock, 
  MapPin, 
  AlertCircle,
  Calendar,
  Layers,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getApiErrorMessage, type FavoriteItem, volunteerService } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';

const FavoriteEvents: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        setError('Vui lòng đăng nhập để xem mục yêu thích.');
        return;
      }

      try {
        const response = await volunteerService.getFavorites(user.id);
        setFavorites(response.data);
      } catch (e) {
        setError(getApiErrorMessage(e, 'Không tải được danh sách yêu thích.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user?.id]);

  const handleRemoveFavorite = (eventId: number) => {
    Swal.fire({
      title: 'Bỏ yêu thích?',
      text: "Bạn có chắc muốn xóa sự kiện này khỏi danh sách yêu thích?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (!user?.id) {
          return;
        }

        await volunteerService.removeFavorite(user.id, eventId);
        setFavorites(favorites.filter((fav) => fav.id !== eventId));
        Swal.fire(
          'Đã xóa!',
          'Sự kiện đã được xóa khỏi danh sách yêu thích.',
          'success'
        );
      }
    });
  };

  const filteredFavorites = favorites.filter(fav => 
    fav.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fav.location ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-success mb-1">
            <Heart className="me-2 text-danger" fill="currentColor" />
            Sự kiện yêu thích
          </h2>
          <p className="text-muted mb-0">Danh sách các hoạt động bạn đã lưu để theo dõi</p>
        </div>
        
        <div className="position-relative" style={{ width: '300px' }}>
          <Search className="position-absolute top-50 inset-s-0 translate-middle-y ms-3 text-muted" size={18} />
          <input 
            type="text" 
            className="form-control ps-5 rounded-pill border-2 border-success-subtle shadow-sm"
            placeholder="Tìm trong danh sách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredFavorites.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 bg-light py-5 text-center">
          <div className="card-body">
            <AlertCircle size={48} className="text-muted mb-3" />
            <h4 className="text-muted">Chưa có sự kiện yêu thích nào</h4>
            <p className="mb-4">Hãy khám phá các hoạt động và nhấn ❤️ để lưu lại nhé!</p>
            <Link to="/events" className="btn btn-success px-4 rounded-pill">Khám phá ngay</Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredFavorites.map((fav) => (
            <div key={fav.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden favorite-card">
                <div className="position-relative" style={{ height: '200px' }}>
                  <img 
                    src={fav.thumbnail || '/images/placeholder.jpg'}
                    className="w-100 h-100 object-fit-cover transition-scale" 
                    alt={fav.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                  <div className="position-absolute top-0 inset-e-0 m-2">
                    <span className="badge bg-white text-success rounded-pill shadow-sm py-2 px-3">
                      {fav.category}
                    </span>
                  </div>
                </div>
                
                <div className="card-body d-flex flex-column p-4">
                  <h5 className="card-title fw-bold mb-3 line-clamp-2">{fav.title}</h5>
                  
                  <div className="mb-3 grow">
                    <div className="d-flex align-items-center mb-2 text-muted">
                      <MapPin size={16} className="me-2 text-primary" />
                      <small>{fav.location ?? 'Không rõ địa điểm'}</small>
                    </div>
                    <div className="d-flex align-items-center mb-2 text-muted">
                      <Calendar size={16} className="me-2 text-info" />
                      <small>{new Date(fav.date).toLocaleDateString('vi-VN')}</small>
                    </div>
                    <div className="d-flex align-items-center text-muted">
                      <Clock size={16} className="me-2 text-warning" />
                      <small className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                        {fav.status}
                      </small>
                    </div>
                  </div>

                  <div className="d-flex gap-2 pt-3 border-top mt-auto">
                    <Link to={`/events/${fav.id}`} className="btn btn-outline-success grow rounded-pill d-flex align-items-center justify-content-center">
                      <Eye size={16} className="me-2" /> Xem chi tiết
                    </Link>
                    <button 
                      onClick={() => handleRemoveFavorite(fav.id)}
                      className="btn btn-outline-danger px-3 rounded-pill"
                      title="Xóa khỏi yêu thích"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Section */}
      <div className="mt-5 pt-4 bg-success-subtle rounded-4 p-4 shadow-sm border border-success-subtle">
        <div className="d-flex align-items-center mb-3">
          <Layers className="text-success me-2" />
          <h5 className="fw-bold mb-0 text-success-emphasis">Bạn có thể quan tâm</h5>
        </div>
        <p className="text-muted small">Dựa trên các sự kiện bạn đã yêu thích, chúng tôi gợi ý các hoạt động này.</p>
        <Link to="/events" className="btn btn-sm btn-success px-4 rounded-pill fw-medium">Xem thêm các hoạt động tương tự</Link>
      </div>
    </div>
  );
};

export default FavoriteEvents;

