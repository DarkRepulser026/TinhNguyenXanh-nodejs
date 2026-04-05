import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Edit2, Save, X, Camera, Award, Target, Heart, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { getApiErrorMessage, type VolunteerProfile as VolunteerProfileType, volunteerService } from '../../lib/api';
import { useAuth } from '../../contexts/useAuth';

const VolunteerProfile: React.FC = () => {
  const { user, updateProfile: updateAuthProfile } = useAuth();
  const [profile, setProfile] = useState<VolunteerProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

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
        setFormData({
          fullName: response.data.fullName || '',
          phone: response.data.phone || '',
        });
      } catch (e) {
        setError(getApiErrorMessage(e, 'Không tải được hồ sơ tình nguyện viên.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id || !profile) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('Lỗi', 'Kích thước ảnh không được vượt quá 5MB.', 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire('Lỗi', 'Vui lòng chọn một tệp ảnh.', 'error');
      return;
    }

    try {
      setUploadingAvatar(true);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        try {
          const response = await volunteerService.uploadAvatar(user.id, base64);
          setProfile(prev => prev ? { ...prev, avatar: response.data.avatar } : null);
          Swal.fire('Thành công', 'Ảnh đại diện đã được cập nhật.', 'success');
        } catch (err) {
          Swal.fire('Lỗi', getApiErrorMessage(err, 'Không thể tải ảnh lên.'), 'error');
        } finally {
          setUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      Swal.fire('Lỗi', 'Có lỗi xảy ra khi tải ảnh lên.', 'error');
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id || !profile) return;

    if (!formData.fullName.trim()) {
      Swal.fire('Lỗi', 'Vui lòng nhập họ và tên.', 'error');
      return;
    }

    try {
      setSaving(true);
      const response = await volunteerService.updateProfile(user.id, {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
      });

      setProfile(response.data);
      await updateAuthProfile({
        fullName: response.data.fullName,
        phone: response.data.phone,
      });

      setIsEditing(false);
      Swal.fire('Thành công', 'Hồ sơ đã được cập nhật.', 'success');
    } catch (e) {
      Swal.fire('Lỗi', getApiErrorMessage(e, 'Không thể cập nhật hồ sơ.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error || !profile || !user) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Không tìm thấy hồ sơ.'}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row g-4">
        {/* Left Column - Avatar & Basic Info */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden sticky-lg-top" style={{ top: '80px' }}>
            {/* Avatar Section */}
            <div className="bg-success bg-opacity-10 p-4 text-center position-relative">
              <div className="position-relative d-inline-block mb-3">
                <div
                  className="rounded-circle bg-success d-flex align-items-center justify-content-center overflow-hidden"
                  style={{ width: '120px', height: '120px', color: 'white' }}
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={60} />
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

              <h5 className="fw-bold mb-1">{profile.fullName}</h5>
              <p className="text-muted small mb-3">Tình nguyện viên</p>

              {!isEditing && (
                <button
                  className="btn btn-outline-success btn-sm w-100 rounded-pill d-flex align-items-center justify-content-center gap-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={16} /> Chỉnh sửa hồ sơ
                </button>
              )}
            </div>

            {/* Stats Section */}
            {profile.stats && (
              <div className="p-4">
                <div className="row g-3 text-center">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <div className="h5 text-success mb-1 fw-bold">{profile.stats.totalEvents}</div>
                      <div className="small text-muted">Tổng sự kiện</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <div className="h5 text-success mb-1 fw-bold">{profile.stats.completedEvents}</div>
                      <div className="small text-muted">Hoàn thành</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <div className="h5 text-success mb-1 fw-bold">{profile.stats.pendingEvents}</div>
                      <div className="small text-muted">Đang chờ</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3">
                      <div className="h5 text-success mb-1 fw-bold">{profile.stats.favoriteEvents}</div>
                      <div className="small text-muted">Yêu thích</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Details & Edit Form */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              {isEditing ? (
                <>
                  <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                    <Edit2 size={20} className="text-success" />
                    Chỉnh sửa thông tin cá nhân
                  </h5>

                  <form>
                    <div className="mb-3">
                      <label htmlFor="fullName" className="form-label fw-semibold">
                        Họ và tên <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        className="form-control rounded-pill px-4"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-semibold">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="form-control rounded-pill px-4"
                        value={user?.email || ''}
                        disabled
                      />
                      <small className="text-muted">Email không thể thay đổi</small>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="phone" className="form-label fw-semibold">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="form-control rounded-pill px-4"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-success rounded-pill px-4 d-flex align-items-center gap-2"
                        onClick={handleSaveProfile}
                        disabled={saving}
                      >
                        <Save size={16} />
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-2"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X size={16} />
                        Hủy
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h5 className="fw-bold mb-4">Thông tin cá nhân</h5>

                  <div className="row g-3 mb-4">
                    <div className="col-12">
                      <div className="d-flex gap-3 p-3 bg-light rounded-3">
                        <User size={20} className="text-success flex-shrink-0 mt-1" />
                        <div>
                          <div className="small text-muted">Họ và tên</div>
                          <div className="fw-semibold">{profile.fullName}</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex gap-3 p-3 bg-light rounded-3">
                        <Mail size={20} className="text-success flex-shrink-0 mt-1" />
                        <div>
                          <div className="small text-muted">Email</div>
                          <div className="fw-semibold">{user?.email}</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="d-flex gap-3 p-3 bg-light rounded-3">
                        <Phone size={20} className="text-success flex-shrink-0 mt-1" />
                        <div>
                          <div className="small text-muted">Số điện thoại</div>
                          <div className="fw-semibold">{profile.phone || 'Chưa cập nhật'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Section */}
                  <hr className="my-4" />

                  <h5 className="fw-bold mb-3">Hoạt động gần đây</h5>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3 border rounded-3 text-center">
                        <div className="d-flex justify-content-center mb-2">
                          <Target size={24} className="text-success" />
                        </div>
                        <div className="h6 fw-bold mb-1">Tham gia sự kiện</div>
                        <div className="h5 text-success mb-0">{profile.stats?.totalEvents || 0}</div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 border rounded-3 text-center">
                        <div className="d-flex justify-content-center mb-2">
                          <CheckCircle2 size={24} className="text-success" />
                        </div>
                        <div className="h6 fw-bold mb-1">Hoàn thành</div>
                        <div className="h5 text-success mb-0">{profile.stats?.completedEvents || 0}</div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 border rounded-3 text-center">
                        <div className="d-flex justify-content-center mb-2">
                          <Award size={24} className="text-success" />
                        </div>
                        <div className="h6 fw-bold mb-1">Đang chờ phê duyệt</div>
                        <div className="h5 text-success mb-0">{profile.stats?.pendingEvents || 0}</div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 border rounded-3 text-center">
                        <div className="d-flex justify-content-center mb-2">
                          <Heart size={24} className="text-success" />
                        </div>
                        <div className="h6 fw-bold mb-1">Sự kiện yêu thích</div>
                        <div className="h5 text-success mb-0">{profile.stats?.favoriteEvents || 0}</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;

