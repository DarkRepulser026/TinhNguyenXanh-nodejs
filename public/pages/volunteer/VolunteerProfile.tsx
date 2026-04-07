import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Edit2, Save, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
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

  useEffect(() => {
    setIsEditing(searchParams.get('edit') === '1');
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
      const next = new URLSearchParams(searchParams);
      next.delete('edit');
      setSearchParams(next, { replace: true });
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
    const next = new URLSearchParams(searchParams);
    next.delete('edit');
    setSearchParams(next, { replace: true });
  };

  const handleStartEdit = () => {
    const next = new URLSearchParams(searchParams);
    next.set('edit', '1');
    setSearchParams(next, { replace: true });
  };

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error || !profile || !user) {
    return (
      <div>
        <div className="alert alert-danger rounded-4" role="alert">
          {error || 'Không tìm thấy hồ sơ.'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold text-success mb-1">Thông tin cá nhân</h2>
        <p className="text-muted mb-0">Xem và cập nhật thông tin hồ sơ của bạn.</p>
      </div>

      <div className="row g-4 align-items-start">
      <div className="col-12">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-3 p-md-4">
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

                  <div className="mb-3">
                    <label htmlFor="role" className="form-label fw-semibold">
                      Vai trò
                    </label>
                    <input
                      type="text"
                      id="role"
                      className="form-control rounded-pill px-4"
                      value={user?.role || 'Tình nguyện viên'}
                      disabled
                    />
                    <small className="text-muted">Vai trò không thể thay đổi</small>
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
                <div className="row g-3 mb-0">
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
                      <User size={20} className="text-success flex-shrink-0 mt-1" />
                      <div>
                        <div className="small text-muted">Vai trò</div>
                        <div className="fw-semibold">{user.role || 'Tình nguyện viên'}</div>
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

                <div className="d-flex justify-content-end mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-success rounded-pill px-4 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleStartEdit}
                  >
                    <Edit2 size={16} /> Chỉnh sửa hồ sơ
                  </button>
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

