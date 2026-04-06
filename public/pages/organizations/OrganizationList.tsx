import { useEffect, useMemo, useState, type FormEvent, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Search, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { getApiErrorMessage, organizationService, type OrganizationItem } from '../../lib/api';

const cities = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];

const cardStyle: CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  overflow: 'hidden',
  marginBottom: '20px',
  transition: 'all 0.25s ease',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};

const badgeBase: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 600,
};

const OrganizationList = () => {
  const [items, setItems] = useState<OrganizationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [keywordInput, setKeywordInput] = useState('');
  const [cityInput, setCityInput] = useState('');

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (pageValue = page, keywordValue = keyword, cityValue = city) => {
    try {
      setLoading(true);
      setError(null);

      const response = await organizationService.getAll({
        keyword: keywordValue || undefined,
        city: cityValue || undefined,
        page: pageValue,
        pageSize,
      });

      setItems(response.data.items);
      setTotalCount(response.data.totalCount);
      setTotalPages(Math.max(1, response.data.totalPages));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không tải được danh sách tổ chức.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextKeyword = keywordInput.trim();
    const nextCity = cityInput.trim();

    setKeyword(nextKeyword);
    setCity(nextCity);
    setPage(1);
    await load(1, nextKeyword, nextCity);
  };

  const featured = useMemo(() => items.slice(0, 4), [items]);

  return (
    <div
      style={{
        background: '#ffffff',
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
            padding: '20px 24px',
            marginBottom: '28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <h6 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#0f172a' }}>
            <span style={{ color: '#16a34a', fontSize: '1.35rem' }}>{totalCount}</span> tổ chức đang hoạt động
          </h6>

          <form className="d-flex gap-2 flex-wrap" onSubmit={onFilterSubmit}>
            <div className="input-group" style={{ minWidth: '240px' }}>
              <span className="input-group-text bg-white border-end-0">
                <Search size={16} />
              </span>
              <input
                className="form-control border-start-0"
                placeholder="Tìm theo tên hoặc mô tả"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ minWidth: '180px' }}
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
            >
              <option value="">Tất cả thành phố</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              className="btn"
              style={{
                background: '#16a34a',
                color: '#fff',
                fontWeight: 600,
                padding: '10px 16px',
                borderRadius: '10px',
              }}
              type="submit"
            >
              Lọc
            </button>
          </form>
        </div>

        <div className="row">
          <div className="col-lg-8">
            {loading ? (
              <div className="alert alert-info rounded-4">Đang tải danh sách tổ chức...</div>
            ) : null}

            {error ? (
              <div className="alert alert-danger rounded-4">{error}</div>
            ) : null}

            {!loading &&
              !error &&
              items.map((org) => (
                <div
                  key={org.id}
                  style={cardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.10)';
                    e.currentTarget.style.borderColor = '#16a34a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div className="row g-0">
                    <div className="col-md-5">
                      <div
                        style={{
                          height: '100%',
                          minHeight: '220px',
                          background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#16a34a',
                          padding: '16px',
                        }}
                      >
                        {org.avatarUrl ? (
                          <img
                            alt={org.name}
                            src={org.avatarUrl}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '0',
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
                              padding: '16px',
                              width: '100%',
                              height: '100%',
                            }}
                          >
                            <Building2 size={54} />
                            <div style={{ marginTop: '10px', fontWeight: 700, textAlign: 'center' }}>
                              {org.name}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-7">
                      <div style={{ padding: '24px' }}>
                        <h5
                          style={{
                            color: '#0f172a',
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            marginBottom: '14px',
                            lineHeight: 1.4,
                          }}
                        >
                          {org.name}
                        </h5>

                        <div className="d-flex flex-column gap-2 mb-3">
                          <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.95rem' }}>
                            <MapPin size={16} color="#16a34a" />
                            <span>
                              {org.city || 'Chưa cập nhật'}
                              {org.district ? `, ${org.district}` : ''}
                            </span>
                          </div>

                          <div className="d-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.95rem' }}>
                            <ShieldCheck size={16} color="#16a34a" />
                            <span>Loại tổ chức: {org.organizationType || 'Chưa cập nhật'}</span>
                          </div>
                        </div>

                        <p
                          style={{
                            color: '#64748b',
                            fontSize: '0.92rem',
                            lineHeight: 1.6,
                            marginBottom: '14px',
                          }}
                        >
                          {org.description || 'Chưa có mô tả về tổ chức này.'}
                        </p>

                        <div className="d-flex flex-wrap gap-2 mb-3">
                          <span
                            style={{
                              ...badgeBase,
                              background: org.verified ? '#dcfce7' : '#fef3c7',
                              color: org.verified ? '#166534' : '#92400e',
                            }}
                          >
                            {org.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                          </span>

                          <span
                            style={{
                              ...badgeBase,
                              background: '#eff6ff',
                              color: '#1d4ed8',
                            }}
                          >
                            {org.eventsOrganized} sự kiện
                          </span>

                          <span
                            style={{
                              ...badgeBase,
                              background: '#f8fafc',
                              color: '#334155',
                            }}
                          >
                            ⭐ {org.averageRating?.toFixed?.(1) ?? org.averageRating ?? 0}
                          </span>
                        </div>

                        <div className="text-end">
                          <Link
                            to={`/organizations/${org.id}`}
                            style={{
                              background: '#16a34a',
                              color: '#fff',
                              textDecoration: 'none',
                              padding: '10px 18px',
                              borderRadius: '10px',
                              fontWeight: 600,
                              display: 'inline-block',
                            }}
                          >
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {!loading && !error && items.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                <Building2 size={42} style={{ marginBottom: '12px' }} />
                <p className="mb-0">Hiện chưa có tổ chức nào phù hợp với bộ lọc.</p>
              </div>
            ) : null}

            <div
              style={{
                marginTop: '28px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <div className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
                <button
                  className="btn btn-light"
                  disabled={page <= 1 || loading}
                  onClick={() => {
                    const next = Math.max(1, page - 1);
                    setPage(next);
                    void load(next, keyword, city);
                  }}
                  style={{ borderRadius: '10px', border: '1px solid #e5e7eb' }}
                  type="button"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="px-3 py-2 text-muted">
                  Trang {page} / {totalPages}
                </span>

                <button
                  className="btn btn-light"
                  disabled={page >= totalPages || loading}
                  onClick={() => {
                    const next = Math.min(totalPages, page + 1);
                    setPage(next);
                    void load(next, keyword, city);
                  }}
                  style={{ borderRadius: '10px', border: '1px solid #e5e7eb' }}
                  type="button"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div style={{ position: 'sticky', top: '24px' }}>
              <h5
                style={{
                  color: '#0f172a',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '18px',
                  paddingBottom: '10px',
                  borderBottom: '3px solid #16a34a',
                  display: 'inline-block',
                }}
              >
                Tổ chức nổi bật
              </h5>

              {featured.length > 0 ? (
                featured.map((org) => (
                  <Link
                    key={org.id}
                    to={`/organizations/${org.id}`}
                    style={{
                      display: 'block',
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '14px',
                      marginBottom: '12px',
                      textDecoration: 'none',
                    }}
                  >
                    <div className="d-flex gap-3 align-items-center">
                      <div
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '10px',
                          background: '#f0fdf4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#16a34a',
                          flexShrink: 0,
                        }}
                      >
                        {org.avatarUrl ? (
                          <img
                            alt={org.name}
                            src={org.avatarUrl}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '10px',
                            }}
                          />
                        ) : (
                          <Building2 size={28} />
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            color: '#0f172a',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            marginBottom: '6px',
                          }}
                        >
                          {org.name}
                        </div>
                        <small className="text-muted">
                          {org.city || 'Chưa cập nhật vị trí'}
                        </small>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '32px 20px',
                    textAlign: 'center',
                    color: '#64748b',
                  }}
                >
                  Chưa có dữ liệu nổi bật.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationList;
