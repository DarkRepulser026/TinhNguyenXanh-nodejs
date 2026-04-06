import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import { getApiErrorMessage, organizationService, type OrganizationItem } from '../../lib/api';

const emptyOrg: OrganizationItem = {
  id: '',
  name: '',
  description: '',
  city: '',
  district: '',
  address: '',
  contactEmail: '',
  phoneNumber: '',
  website: '',
  organizationType: '',
  memberCount: 0,
  eventsOrganized: 0,
  averageRating: 0,
  totalReviews: 0,
  verified: false,
};

const sectionCard: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};

const titleStyle: CSSProperties = {
  fontSize: '1.2rem',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const infoRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: '#64748b',
  marginBottom: '12px',
  fontSize: '0.96rem',
};

const OrganizationDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState<OrganizationItem>(emptyOrg);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ratingValue = useMemo(() => Number(item.averageRating || 0), [item.averageRating]);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Thiếu organization id.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await organizationService.getById(id);
        setItem(response.data);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Không thể tải chi tiết tổ chức.'));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const renderStars = () => {
    const stars = [];
    const rounded = Math.round(ratingValue);

    for (let i = 1; i <= 5; i += 1) {
      stars.push(
        <Star
          key={i}
          fill={i <= rounded ? '#fbbf24' : 'transparent'}
          color="#fbbf24"
          size={22}
        />,
      );
    }

    return stars;
  };

  return (
    <div
      style={{
        background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
        minHeight: '100vh',
        padding: '48px 0',
      }}
    >
      <div className="container">
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '18px 22px',
            marginBottom: '28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <h6 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700, color: '#0f172a' }}>
              Chi tiết tổ chức
            </h6>

            <Link
              to="/organizations"
              style={{
                textDecoration: 'none',
                color: '#16a34a',
                border: '2px solid #16a34a',
                padding: '8px 14px',
                borderRadius: '10px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ArrowLeft size={16} />
              Quay lại danh sách
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="alert alert-info rounded-4">Đang tải chi tiết tổ chức...</div>
        ) : null}

        {error ? (
          <div className="alert alert-danger rounded-4 d-flex align-items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="row">
            <div className="col-lg-8">
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                }}
              >
                <div className="row g-0">
                  <div className="col-md-4">
                    <div
                      style={{
                        height: '100%',
                        minHeight: '280px',
                        background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#16a34a',
                        padding: '24px',
                        textAlign: 'center',
                      }}
                    >
                      {item.avatarUrl ? (
                        <img
                          alt={item.name}
                          src={item.avatarUrl}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#16a34a',
                            padding: '24px',
                            textAlign: 'center',
                            width: '100%',
                            height: '100%',
                          }}
                        >
                          <Building2 size={72} />
                          <div style={{ marginTop: '14px', fontWeight: 700, fontSize: '1rem' }}>
                            {item.name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-8">
                    <div style={{ padding: '28px' }}>
                      <h3
                        style={{
                          color: '#16a34a',
                          fontWeight: 700,
                          fontSize: '1.8rem',
                          marginBottom: '20px',
                        }}
                      >
                        {item.name}
                      </h3>

                      <div style={infoRow}>
                        <ShieldCheck size={18} color="#16a34a" />
                        <span>
                          Xác minh:{' '}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 10px',
                              borderRadius: '999px',
                              background: item.verified ? '#dcfce7' : '#f3f4f6',
                              color: item.verified ? '#166534' : '#6b7280',
                              fontWeight: 600,
                            }}
                          >
                            {item.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                          </span>
                        </span>
                      </div>

                      <div style={infoRow}>
                        <MapPin size={18} color="#16a34a" />
                        <span>
                          {item.city || 'Chưa cập nhật'}
                          {item.district ? `, ${item.district}` : ''}
                          {item.address ? ` - ${item.address}` : ''}
                        </span>
                      </div>

                      <div style={infoRow}>
                        <BadgeCheck size={18} color="#16a34a" />
                        <span>Loại tổ chức: {item.organizationType || 'Chưa cập nhật'}</span>
                      </div>

                      <div style={infoRow}>
                        <Mail size={18} color="#16a34a" />
                        <span>{item.contactEmail || 'Chưa cập nhật email'}</span>
                      </div>

                      <div style={infoRow}>
                        <Phone size={18} color="#16a34a" />
                        <span>{item.phoneNumber || 'Chưa cập nhật số điện thoại'}</span>
                      </div>

                      {item.website ? (
                        <div style={infoRow}>
                          <Globe size={18} color="#16a34a" />
                          <a
                            href={item.website}
                            rel="noreferrer"
                            style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}
                            target="_blank"
                          >
                            {item.website}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div style={sectionCard}>
                <div style={titleStyle}>
                  <FileText size={20} color="#16a34a" />
                  <span>Giới thiệu về tổ chức</span>
                </div>
                <p style={{ color: '#64748b', lineHeight: 1.8, marginBottom: 0 }}>
                  {item.description || 'Tổ chức này chưa cập nhật phần mô tả.'}
                </p>
              </div>

              <div style={sectionCard}>
                <div style={titleStyle}>
                  <Users size={20} color="#16a34a" />
                  <span>Thông tin thống kê</span>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e5e7eb',
                        borderRadius: '14px',
                        padding: '18px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px' }}>
                        Số thành viên
                      </div>
                      <div style={{ color: '#0f172a', fontSize: '1.7rem', fontWeight: 700 }}>
                        {item.memberCount ?? 0}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e5e7eb',
                        borderRadius: '14px',
                        padding: '18px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px' }}>
                        Sự kiện đã tổ chức
                      </div>
                      <div style={{ color: '#0f172a', fontSize: '1.7rem', fontWeight: 700 }}>
                        {item.eventsOrganized ?? 0}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e5e7eb',
                        borderRadius: '14px',
                        padding: '18px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px' }}>
                        Tổng đánh giá
                      </div>
                      <div style={{ color: '#0f172a', fontSize: '1.7rem', fontWeight: 700 }}>
                        {item.totalReviews ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={sectionCard}>
                <div style={titleStyle}>
                  <BadgeCheck size={20} color="#16a34a" />
                  <span>Lĩnh vực hoạt động</span>
                </div>

                {item.focusAreas && item.focusAreas.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {item.focusAreas.map((area) => (
                      <span
                        key={area}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '8px 14px',
                          borderRadius: '999px',
                          background: '#f0fdf4',
                          color: '#166534',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          border: '1px solid #bbf7d0',
                        }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748b', marginBottom: 0 }}>
                    Tổ chức này chưa cập nhật lĩnh vực hoạt động.
                  </p>
                )}
              </div>

              <div style={sectionCard}>
                <div style={titleStyle}>
                  <FileText size={20} color="#16a34a" />
                  <span>Thông tin mở rộng</span>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '6px' }}>Mã số thuế / ĐKKD</div>
                    <div style={{ color: '#0f172a', fontWeight: 600 }}>{item.taxCode || 'Chưa cập nhật'}</div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '6px' }}>Ngày thành lập</div>
                    <div style={{ color: '#0f172a', fontWeight: 600 }}>
                      {item.foundedDate ? new Date(item.foundedDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '6px' }}>Người đại diện pháp luật</div>
                    <div style={{ color: '#0f172a', fontWeight: 600 }}>{item.legalRepresentative || 'Chưa cập nhật'}</div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '6px' }}>Loại tài liệu xác minh</div>
                    <div style={{ color: '#0f172a', fontWeight: 600 }}>{item.documentType || 'Chưa cập nhật'}</div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '6px' }}>Facebook</div>
                    <div style={{ color: '#0f172a', fontWeight: 600, wordBreak: 'break-word' }}>
                      {item.facebookUrl ? (
                        <a
                          href={item.facebookUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#16a34a', textDecoration: 'none' }}
                        >
                          {item.facebookUrl}
                        </a>
                      ) : (
                        'Chưa cập nhật'
                      )}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '6px' }}>Zalo</div>
                    <div style={{ color: '#0f172a', fontWeight: 600 }}>{item.zaloNumber || 'Chưa cập nhật'}</div>
                  </div>

                  <div className="col-md-12 mb-3">
                    <div style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '6px' }}>Tài liệu xác minh</div>
                    <div style={{ color: '#0f172a', fontWeight: 600, wordBreak: 'break-word' }}>
                      {item.verificationDocsUrl ? (
                        <a
                          href={item.verificationDocsUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#16a34a', textDecoration: 'none' }}
                        >
                          {item.verificationDocsUrl}
                        </a>
                      ) : (
                        'Chưa cập nhật'
                      )}
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '6px' }}>Thành tích nổi bật</div>
                    <div style={{ color: '#0f172a', lineHeight: 1.7 }}>
                      {item.achievements || 'Tổ chức này chưa cập nhật thành tích nổi bật.'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={sectionCard}>
                <div style={titleStyle}>
                  <CalendarDays size={20} color="#16a34a" />
                  <span>Đánh giá từ cộng đồng</span>
                </div>

                <div
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                    border: '2px solid #16a34a',
                    borderRadius: '16px',
                    padding: '28px 20px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '3.2rem',
                      fontWeight: 800,
                      color: '#16a34a',
                      lineHeight: 1,
                      marginBottom: '12px',
                    }}
                  >
                    {ratingValue.toFixed(1)}
                  </div>

                  <div className="d-flex justify-content-center gap-1 mb-3">{renderStars()}</div>

                  <div style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500 }}>
                    Dựa trên {item.totalReviews ?? 0} đánh giá
                  </div>
                </div>
              </div>
              
              <div style={sectionCard}>
                <div style={titleStyle}>
                  <Star size={20} color="#16a34a" />
                  <span>Chi tiết đánh giá các sự kiện</span>
                </div>

                {item.reviews && item.reviews.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {item.reviews.map((review: any) => (
                      <div
                        key={review.id}
                        style={{
                          background: '#f8fafc',
                          borderRadius: '12px',
                          padding: '20px',
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '32px', height: '32px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                                {(review.userName || 'U')[0].toUpperCase()}
                              </div>
                              {review.userName}
                            </div>
                            <div style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 600, marginTop: '8px' }}>
                              Tham gia sự kiện: {review.eventName || 'Sự kiện không xác định'}
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-1 bg-white px-2 py-1 rounded-pill border">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                fill={star <= review.rating ? '#fbbf24' : 'transparent'}
                                color="#fbbf24"
                                size={14}
                              />
                            ))}
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, marginLeft: '4px', color: '#0f172a' }}>
                              {review.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        {review.review && (
                          <div style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginTop: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '8px', borderLeft: '3px solid #16a34a' }}>
                            "{review.review}"
                          </div>
                        )}
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CalendarDays size={12} />
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')} lúc {new Date(review.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748b', marginBottom: 0 }}>
                    Tổ chức này chưa nhận được đánh giá nào từ cộng đồng tình nguyện viên.
                  </p>
                )}
              </div>
            </div>

            <div className="col-lg-4">
              <div style={{ position: 'sticky', top: '24px' }}>
                <div style={sectionCard}>
                  <div style={titleStyle}>
                    <Building2 size={20} color="#16a34a" />
                    <span>Thông tin nhanh</span>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '14px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <div className="text-muted small mb-1">Tên tổ chức</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '14px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <div className="text-muted small mb-1">Thành phố</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.city || '-'}</div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '14px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <div className="text-muted small mb-1">Website</div>
                      <div style={{ fontWeight: 700, color: '#0f172a', wordBreak: 'break-word' }}>
                        {item.website || 'Chưa có'}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={sectionCard}>
                  <div style={titleStyle}>
                    <CalendarDays size={20} color="#16a34a" />
                    <span>Sự kiện của tổ chức</span>
                  </div>

                  {item.events && item.events.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {item.events.map((event) => (
                        <div
                          key={event.id}
                          style={{
                            background: '#f8fafc',
                            borderRadius: '12px',
                            padding: '14px',
                            border: '1px solid #e5e7eb',
                          }}
                        >
                          <div
                            style={{
                              color: '#0f172a',
                              fontWeight: 700,
                              marginBottom: '8px',
                              lineHeight: 1.5,
                            }}
                          >
                            {event.title}
                          </div>

                          <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '6px' }}>
                            {event.location || 'Chưa cập nhật địa điểm'}
                          </div>

                          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {event.startTime
                              ? new Date(event.startTime).toLocaleString('vi-VN')
                              : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#64748b', marginBottom: 0 }}>
                      Tổ chức này chưa có sự kiện nào đang hiển thị.
                    </p>
                  )}
                </div>

                <div style={sectionCard}>
                  <div style={titleStyle}>
                    <ShieldCheck size={20} color="#16a34a" />
                    <span>Hành động</span>
                  </div>

                  <div className="d-grid gap-2">
                    <Link
                      to="/organizations/register"
                      style={{
                        background: '#16a34a',
                        color: '#fff',
                        textDecoration: 'none',
                        textAlign: 'center',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                      }}
                    >
                      Đăng ký trở thành ban tổ chức
                    </Link>

                    <Link
                      to="/organizations"
                      style={{
                        border: '2px solid #16a34a',
                        color: '#16a34a',
                        textDecoration: 'none',
                        textAlign: 'center',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        background: '#fff',
                      }}
                    >
                      Quay lại danh sách tổ chức
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OrganizationDetails;
