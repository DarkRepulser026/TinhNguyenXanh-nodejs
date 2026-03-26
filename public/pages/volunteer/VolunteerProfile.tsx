import React, { useEffect, useState } from 'react';
import { getApiErrorMessage, type VolunteerProfile as VolunteerProfileType, volunteerService } from '../../services/api';
import { useAuth } from '../../contexts/useAuth';

const VolunteerProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VolunteerProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        setError('Vui lòng đăng nhập để xem hồ sơ.');
        return;
      }

      try {
        const response = await volunteerService.getProfile(user.id);
        setProfile(response.data);
      } catch (e) {
        setError(getApiErrorMessage(e, 'Không tải được hồ sơ tình nguyện viên.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user?.id]);

  if (loading) {
    return <div className="alert alert-info">Đang tải hồ sơ...</div>;
  }

  if (error || !profile) {
    return <div className="alert alert-danger">{error || 'Không tìm thấy hồ sơ.'}</div>;
  }

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-4">Hồ sơ tình nguyện viên</h1>
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h4 className="mb-3">{profile.fullName}</h4>
        <p className="text-muted mb-4">User ID: {profile.userId}</p>
        <div className="row g-3">
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 text-center">
              <div className="small text-muted">Tổng sự kiện</div>
              <div className="h4 mb-0">{profile.stats.totalEvents}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 text-center">
              <div className="small text-muted">Đã hoàn thành</div>
              <div className="h4 mb-0">{profile.stats.completedEvents}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 text-center">
              <div className="small text-muted">Đang chờ</div>
              <div className="h4 mb-0">{profile.stats.pendingEvents}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 text-center">
              <div className="small text-muted">Yêu thích</div>
              <div className="h4 mb-0">{profile.stats.favoriteEvents}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;

