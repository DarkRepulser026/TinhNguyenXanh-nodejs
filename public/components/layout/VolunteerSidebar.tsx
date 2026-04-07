import React from 'react';
import {
  Award,
  BarChart2,
  Calendar,
  Camera,
  CreditCard,
  Heart,
  Settings,
  User as UserIcon,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import Swal from 'sweetalert2';
import { getApiErrorMessage, volunteerService } from '../../lib/api';

type VolunteerSidebarProps = {
  rank?: string;
  points?: number;
};

const VolunteerSidebar: React.FC<VolunteerSidebarProps> = ({
  rank = 'Tình nguyện viên',
  points = 0,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = React.useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const navItems = [
    { to: '/volunteer/dashboard', label: 'Tổng quan', icon: BarChart2 },
    { to: '/volunteer/profile', label: 'Hồ sơ cá nhân', icon: UserIcon },
    { to: '/volunteer/registrations', label: 'Lịch sử đăng ký', icon: Calendar },
    { to: '/volunteer/favorites', label: 'Yêu thích', icon: Heart },
    { to: '/volunteer/donations', label: 'Lịch sử đóng góp', icon: CreditCard },
    { to: '/account/settings', label: 'Cài đặt', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/account/settings') {
      return location.pathname === '/account/settings' || location.pathname.startsWith('/account/');
    }
    return location.pathname === path;
  };

  React.useEffect(() => {
    const loadProfileAvatar = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const response = await volunteerService.getProfile(user.id);
        setAvatarUrl(response.data?.avatar || '');
      } catch {
        setAvatarUrl('');
      }
    };

    void loadProfileAvatar();
  }, [user?.id]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Lỗi', 'Kích thước ảnh không được vượt quá 5MB.', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      Swal.fire('Lỗi', 'Vui lòng chọn một tệp ảnh.', 'error');
      return;
    }

    try {
      setUploadingAvatar(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;

        try {
          const response = await volunteerService.uploadAvatar(user.id as number, base64);
          setAvatarUrl(response.data.avatar || '');
          Swal.fire('Thành công', 'Ảnh đại diện đã được cập nhật.', 'success');
        } catch (err) {
          Swal.fire('Lỗi', getApiErrorMessage(err, 'Không thể tải ảnh lên.'), 'error');
        } finally {
          setUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      Swal.fire('Lỗi', getApiErrorMessage(err, 'Không thể tải ảnh lên.'), 'error');
      setUploadingAvatar(false);
    }
  };

  return (
    <>
      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
        <div className="bg-success bg-opacity-10 p-4 text-center position-relative">
          <div className="position-relative d-inline-block mb-3">
            <div
              className="rounded-circle bg-success d-flex align-items-center justify-content-center overflow-hidden"
              style={{ width: '120px', height: '120px', color: 'white' }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserIcon size={60} />
              )}
            </div>
            <button
              className="btn btn-sm btn-light position-absolute bottom-0 end-0 rounded-circle p-2"
              title="Thay đổi ảnh"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
              disabled={uploadingAvatar}
            />
          </div>

          {uploadingAvatar && (
            <div className="mb-3">
              <div className="spinner-border spinner-border-sm text-success" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          )}

          <h5 className="fw-bold mb-1">{user?.fullName || 'Tình nguyện viên'}</h5>
          <p className="text-muted small mb-3">{rank}</p>
        </div>

        <div className="px-4 pb-4">
          <hr className="text-muted opacity-25" />

          <div className="nav flex-column nav-pills gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-link rounded-3 px-3 py-2 d-flex align-items-center ${
                    active ? 'active bg-success text-white' : 'text-dark hover-success'
                  }`}
                >
                  <Icon size={18} className="me-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="card border-0 shadow-sm rounded-4 p-4 bg-gradient-success text-white"
        style={{ background: 'linear-gradient(135deg, #198754 0%, #20c997 100%)' }}
      >
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold mb-0">Điểm tích lũy</h6>
          <Award size={24} />
        </div>
        <h2 className="fw-bold mb-0">{points}</h2>
        <p className="small mb-0 opacity-75">Điểm sẽ được dùng để đổi quà tặng</p>
      </div>
    </>
  );
};

export default VolunteerSidebar;
