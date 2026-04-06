import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import {
  BadgeCheck,
  Building2,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { getApiErrorMessage, organizerService, type OrganizationItem } from '../../lib/api';

const emptyOrganization: OrganizationItem = {
  id: '',
  name: '',
  description: '',
  city: '',
  district: '',
  ward: '',
  address: '',
  contactEmail: '',
  phoneNumber: '',
  website: '',
  organizationType: '',
  taxCode: '',
  foundedDate: '',
  legalRepresentative: '',
  documentType: '',
  verificationDocsUrl: '',
  facebookUrl: '',
  zaloNumber: '',
  achievements: '',
  focusAreas: [],
  avatarUrl: '',
  memberCount: 0,
  eventsOrganized: 0,
  averageRating: 0,
  totalReviews: 0,
  verified: false,
  events: [],
};

const sectionTitleStyle: CSSProperties = {
  color: '#0f172a',
  fontSize: '1.2rem',
  fontWeight: 700,
  marginBottom: '1.25rem',
  paddingBottom: '0.75rem',
  borderBottom: '2px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const cardStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '1.75rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  marginBottom: '1.5rem',
};

const inputStyle: CSSProperties = {
  border: '2px solid #e2e8f0',
  borderRadius: '10px',
  padding: '12px 14px',
  fontSize: '0.95rem',
};

const labelStyle: CSSProperties = {
  fontWeight: 600,
  color: '#0f172a',
  marginBottom: '8px',
  display: 'block',
  fontSize: '0.95rem',
};

const infoBoxStyle: CSSProperties = {
  background: '#f8fafc',
  border: '1px solid #e5e7eb',
  borderRadius: '14px',
  padding: '16px',
  height: '100%',
};

const OrganizerOrganizationManagement = () => {
  const [organization, setOrganization] = useState<OrganizationItem>(emptyOrganization);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimId, setClaimId] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    contactEmail: '',
    phoneNumber: '',
    website: '',
    city: '',
    district: '',
    ward: '',
    address: '',
    organizationType: '',
    legalRepresentative: '',
    achievements: '',
    avatarUrl: '',
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await organizerService.getOrganization();
      const item = response.data;

      setOrganization(item);
      setForm({
        name: item.name || '',
        description: item.description || '',
        contactEmail: item.contactEmail || '',
        phoneNumber: item.phoneNumber || '',
        website: item.website || '',
        city: item.city || '',
        district: item.district || '',
        ward: item.ward || '',
        address: item.address || '',
        organizationType: item.organizationType || '',
        legalRepresentative: item.legalRepresentative || '',
        achievements: item.achievements || '',
        avatarUrl: item.avatarUrl || '',
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải hồ sơ tổ chức.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const summary = useMemo(() => {
    return {
      verifiedText: organization.verified ? 'Đã xác minh' : 'Chưa xác minh',
      eventCount: organization.eventsOrganized ?? 0,
      reviewCount: organization.totalReviews ?? 0,
      rating: Number(organization.averageRating ?? 0).toFixed(1),
    };
  }, [organization]);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateField('avatarUrl', base64);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await organizerService.updateOrganization({
        name: form.name.trim() || undefined,
        description: form.description.trim() || undefined,
        contactEmail: form.contactEmail.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        website: form.website.trim() || undefined,
        city: form.city.trim() || undefined,
        district: form.district.trim() || undefined,
        ward: form.ward.trim() || undefined,
        address: form.address.trim() || undefined,
        organizationType: form.organizationType.trim() || undefined,
        legalRepresentative: form.legalRepresentative.trim() || undefined,
        achievements: form.achievements.trim() || undefined,
        avatarUrl: form.avatarUrl.trim() || undefined,
      });

      setOrganization(response.data);
      setSuccess('Cập nhật hồ sơ tổ chức thành công.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật hồ sơ tổ chức.'));
    } finally {
      setSaving(false);
    }
  };

  const onClaim = async () => {
    if (!claimId.trim()) {
      setError('Vui lòng nhập Organization ID để liên kết.');
      setSuccess(null);
      return;
    }

    try {
      setClaiming(true);
      setError(null);
      setSuccess(null);

      await organizerService.claimOrganization(claimId.trim());
      setSuccess('Liên kết tổ chức thành công.');
      setClaimId('');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể liên kết tổ chức.'));
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        minHeight: '100vh',
        padding: '3rem 0',
      }}
    >
      <div className="container">
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, #16a34a, #10b981)',
            }}
          />

          <h1
            style={{
              color: '#0f172a',
              fontSize: '1.75rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
            }}
          >
            Quản lý hồ sơ{' '}
            <span style={{ color: '#16a34a' }}>tổ chức</span>
          </h1>

          <p
            style={{
              color: '#64748b',
              fontSize: '1rem',
              marginBottom: 0,
            }}
          >
            Cập nhật thông tin tổ chức của bạn để quản lý sự kiện và tình nguyện viên hiệu quả hơn.
          </p>
        </div>

        {loading ? (
          <div className="alert alert-info rounded-4">Đang tải hồ sơ tổ chức...</div>
        ) : null}

        {error ? (
          <div className="alert alert-danger rounded-4">{error}</div>
        ) : null}

        {success ? (
          <div className="alert alert-success rounded-4">{success}</div>
        ) : null}

        {!loading ? (
          <>
            <div className="row g-4">
              <div className="col-lg-8">
                <div style={cardStyle}>
                  <div style={sectionTitleStyle}>
                    <Building2 size={22} color="#16a34a" />
                    <span>Thông tin tổ chức</span>
                  </div>

                  <form onSubmit={onSubmit}>
                    <div className="row">
                      <div className="col-md-8 mb-3">
                        <label style={labelStyle}>Tên tổ chức</label>
                        <input
                          className="form-control"
                          style={inputStyle}
                          value={form.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          placeholder="Nhập tên tổ chức"
                        />
                      </div>

                      <div className="col-md-4 mb-3">
                        <label style={labelStyle}>Loại tổ chức</label>
                        <input
                          className="form-control"
                          style={inputStyle}
                          value={form.organizationType}
                          onChange={(e) => updateField('organizationType', e.target.value)}
                          placeholder="VD: Cộng đồng, NGO..."
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label style={labelStyle}>Ảnh đại diện / Logo Tổ chức (Tải lên hoặc nhập URL)</label>
                      <div className="d-flex gap-2 mb-2">
                         <input
                           type="file"
                           accept="image/*"
                           className="form-control"
                           style={{ ...inputStyle, flex: 1 }}
                           onChange={handleImageUpload}
                         />
                      </div>
                      <input
                        className="form-control"
                        style={inputStyle}
                        value={form.avatarUrl}
                        onChange={(e) => updateField('avatarUrl', e.target.value)}
                        placeholder="Hoặc dán URL ảnh đại diện vào đây..."
                      />
                      
                      {form.avatarUrl && (
                        <div className="mt-3 p-2 border rounded text-center bg-light">
                          <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '8px' }}>Ảnh xem trước:</div>
                          <img 
                            src={form.avatarUrl} 
                            alt="Avatar Preview" 
                            style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px' }} 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=1000';
                            }}
                          />
                        </div>
                      )}
                    </div>



                    <div className="mb-3">
                      <label style={labelStyle}>Mô tả tổ chức</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        style={inputStyle}
                        value={form.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="Giới thiệu ngắn về tổ chức"
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Email liên hệ</label>
                        <input
                          className="form-control"
                          style={inputStyle}
                          value={form.contactEmail}
                          onChange={(e) => updateField('contactEmail', e.target.value)}
                          placeholder="contact@organization.vn"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Số điện thoại</label>
                        <input
                          className="form-control"
                          style={inputStyle}
                          value={form.phoneNumber}
                          onChange={(e) => updateField('phoneNumber', e.target.value)}
                          placeholder="0901234567"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label style={labelStyle}>Website</label>
                      <input
                        className="form-control"
                        style={inputStyle}
                        value={form.website}
                        onChange={(e) => updateField('website', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label style={labelStyle}>Thành phố</label>
                        <input
                          className="form-control"
                          style={inputStyle}
                          value={form.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          placeholder="TP. Hồ Chí Minh"
                        />
                      </div>

                      <div className="col-md-4 mb-3">
                        <label style={labelStyle}>Quận/Huyện</label>
                        <input
                          className="form-control"
                          style={inputStyle}
                          value={form.district}
                          onChange={(e) => updateField('district', e.target.value)}
                          placeholder="Quận 1"
                        />
                      </div>

                      <div className="col-md-4 mb-3">
                        <label style={labelStyle}>Phường/Xã</label>
                        <input
                          className="form-control"
                          style={inputStyle}
                          value={form.ward}
                          onChange={(e) => updateField('ward', e.target.value)}
                          placeholder="Phường Bến Nghé"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label style={labelStyle}>Địa chỉ chi tiết</label>
                      <input
                        className="form-control"
                        style={inputStyle}
                        value={form.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        placeholder="Số nhà, tên đường..."
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Người đại diện</label>
                        <input
                          className="form-control"
                          style={inputStyle}
                          value={form.legalRepresentative}
                          onChange={(e) => updateField('legalRepresentative', e.target.value)}
                          placeholder="Nguyễn Văn A"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label style={labelStyle}>Thành tích nổi bật</label>
                        <input
                          className="form-control"
                          style={inputStyle}
                          value={form.achievements}
                          onChange={(e) => updateField('achievements', e.target.value)}
                          placeholder="Giải thưởng, hoạt động nổi bật..."
                        />
                      </div>
                    </div>

                    <button
                      disabled={saving}
                      type="submit"
                      style={{
                        background: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: saving ? 0.75 : 1,
                        cursor: 'pointer',
                      }}
                    >
                      <Save size={18} />
                      {saving ? 'Đang lưu...' : 'Lưu hồ sơ tổ chức'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="col-lg-4">
                <div style={cardStyle}>
                  <div style={sectionTitleStyle}>
                    <ShieldCheck size={22} color="#16a34a" />
                    <span>Thông tin nhanh</span>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <div style={infoBoxStyle}>
                        <div className="text-muted small mb-2">Trạng thái xác minh</div>
                        <div style={{ fontWeight: 700, color: organization.verified ? '#166534' : '#92400e' }}>
                          {summary.verifiedText}
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div style={infoBoxStyle}>
                        <div className="text-muted small mb-2">Sự kiện đã tổ chức</div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.25rem' }}>
                          {summary.eventCount}
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div style={infoBoxStyle}>
                        <div className="text-muted small mb-2">Điểm đánh giá</div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.25rem' }}>
                          {summary.rating}
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div style={infoBoxStyle}>
                        <div className="text-muted small mb-2">Tổng lượt đánh giá</div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.25rem' }}>
                          {summary.reviewCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={cardStyle}>
                  <div style={sectionTitleStyle}>
                    <BadgeCheck size={22} color="#16a34a" />
                    <span>Liên kết tổ chức</span>
                  </div>

                  <p style={{ color: '#64748b', lineHeight: 1.7 }}>
                    Nếu tài khoản này chưa sở hữu tổ chức nào, bạn có thể nhập Organization ID để nhận quyền quản lý.
                  </p>

                  <div className="mb-3">
                    <input
                      className="form-control"
                      style={inputStyle}
                      value={claimId}
                      onChange={(e) => setClaimId(e.target.value)}
                      placeholder="Nhập Organization ID"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={claiming}
                    onClick={() => void onClaim()}
                    style={{
                      background: '#0f172a',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      width: '100%',
                      opacity: claiming ? 0.75 : 1,
                      cursor: 'pointer',
                    }}
                  >
                    {claiming ? 'Đang liên kết...' : 'Liên kết tổ chức'}
                  </button>
                </div>

                <div style={cardStyle}>
                  <div style={sectionTitleStyle}>
                    <FileText size={22} color="#16a34a" />
                    <span>Thông tin hiển thị</span>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                      <Mail size={16} color="#16a34a" />
                      <span>{organization.contactEmail || 'Chưa có email'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                      <Phone size={16} color="#16a34a" />
                      <span>{organization.phoneNumber || 'Chưa có số điện thoại'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                      <MapPin size={16} color="#16a34a" />
                      <span>
                        {organization.city || 'Chưa có thành phố'}
                        {organization.district ? `, ${organization.district}` : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b' }}>
                      <Globe size={16} color="#16a34a" />
                      <span>{organization.website || 'Chưa có website'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default OrganizerOrganizationManagement;
