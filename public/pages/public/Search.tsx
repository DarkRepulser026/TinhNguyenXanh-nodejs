import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { organizationService, eventService, type EventItem, type OrganizationItem } from '../../services/api';

type Scope = 'events' | 'organizations' | 'all';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [location, setLocation] = useState(searchParams.get('location') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [scope, setScope] = useState<Scope>((searchParams.get('scope') as Scope) || 'all');

  const [events, setEvents] = useState<EventItem[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
    setLocation(searchParams.get('location') ?? '');
    setCategory(searchParams.get('category') ?? '');
    setScope(((searchParams.get('scope') as Scope) || 'all'));
  }, [searchParams]);

  useEffect(() => {
    const keyword = (searchParams.get('q') ?? '').trim();
    const place = (searchParams.get('location') ?? '').trim();
    const categoryRaw = (searchParams.get('category') ?? '').trim();
    const searchScope = ((searchParams.get('scope') as Scope) || 'all');

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const eventPromise =
          searchScope === 'organizations'
            ? Promise.resolve({ data: { items: [] as EventItem[] } })
            : eventService.getAll({
                page: 1,
                pageSize: 12,
                keyword: keyword || undefined,
                location: place || undefined,
                category: categoryRaw ? Number(categoryRaw) : undefined,
              });

        const orgPromise =
          searchScope === 'events'
            ? Promise.resolve({ data: { items: [] as OrganizationItem[] } })
            : organizationService.getAll({
                page: 1,
                pageSize: 12,
                keyword: keyword || undefined,
                city: place || undefined,
              });

        const [eventResponse, orgResponse] = await Promise.all([eventPromise, orgPromise]);
        setEvents(eventResponse.data.items);
        setOrganizations(orgResponse.data.items);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không thể tải kết quả tìm kiếm.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [searchParams]);

  const total = useMemo(() => events.length + organizations.length, [events.length, organizations.length]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (query.trim()) {
      params.set('q', query.trim());
    }
    if (location.trim()) {
      params.set('location', location.trim());
    }
    if (category.trim()) {
      params.set('category', category.trim());
    }
    if (scope !== 'all') {
      params.set('scope', scope);
    }

    setSearchParams(params);
  };

  return (
    <div className="py-4">
      <div className="container">
        <div className="mb-4">
          <h1 className="fw-bold mb-2">Trang tìm kiếm</h1>
          <p className="text-muted mb-0">Tìm kiếm sự kiện và tổ chức từ dữ liệu API.</p>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
          <form onSubmit={submitSearch} className="row g-3">
            <div className="col-lg-4">
              <label className="form-label small fw-semibold">Từ khóa</label>
              <input
                className="form-control"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="VD: môi trường, giáo dục"
              />
            </div>
            <div className="col-lg-3">
              <label className="form-label small fw-semibold">Khu vực</label>
              <input
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: Hà Nội"
              />
            </div>
            <div className="col-lg-2">
              <label className="form-label small fw-semibold">Danh mục</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Tất cả</option>
                <option value="1">Môi trường</option>
                <option value="2">Giáo dục</option>
                <option value="3">Y tế</option>
                <option value="4">Cộng đồng</option>
              </select>
            </div>
            <div className="col-lg-3">
              <label className="form-label small fw-semibold">Phạm vi</label>
              <select className="form-select" value={scope} onChange={(e) => setScope(e.target.value as Scope)}>
                <option value="all">Tất cả</option>
                <option value="events">Sự kiện</option>
                <option value="organizations">Tổ chức</option>
              </select>
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button className="btn btn-success rounded-pill px-4" type="submit">
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>

        {loading ? <div className="alert alert-info">Đang tìm kiếm...</div> : null}
        {error ? <div className="alert alert-danger">{error}</div> : null}

        {!loading && !error ? (
          <div className="alert alert-light border">
            Tìm thấy <strong>{total}</strong> kết quả ({events.length} sự kiện, {organizations.length} tổ chức).
          </div>
        ) : null}

        {(scope === 'all' || scope === 'events') && (
          <section className="mb-4">
            <h2 className="h5 fw-bold mb-3">Sự kiện</h2>
            <div className="row g-3">
              {events.map((event) => (
                <div key={event.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm rounded-4">
                    <div className="card-body">
                      <span className="badge bg-success-subtle text-success mb-2">{event.categoryName ?? 'Chung'}</span>
                      <h3 className="h6 fw-bold">{event.title}</h3>
                      <p className="small text-muted mb-3">{event.location ?? 'Chưa cập nhật địa điểm'}</p>
                      <Link to={`/events/${event.id}`} className="btn btn-sm btn-outline-success rounded-pill px-3">
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {!events.length && <p className="text-muted mb-0">Không có sự kiện phù hợp.</p>}
            </div>
          </section>
        )}

        {(scope === 'all' || scope === 'organizations') && (
          <section>
            <h2 className="h5 fw-bold mb-3">Tổ chức</h2>
            <div className="row g-3">
              {organizations.map((organization) => (
                <div key={organization.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm rounded-4">
                    <div className="card-body">
                      <h3 className="h6 fw-bold">{organization.name}</h3>
                      <p className="small text-muted mb-1">{organization.city ?? 'Chưa cập nhật khu vực'}</p>
                      <p className="small text-muted mb-3">{organization.organizationType ?? 'Tổ chức cộng đồng'}</p>
                      <Link
                        to={`/organizations/${organization.id}`}
                        className="btn btn-sm btn-outline-success rounded-pill px-3"
                      >
                        Xem tổ chức
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {!organizations.length && <p className="text-muted mb-0">Không có tổ chức phù hợp.</p>}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
