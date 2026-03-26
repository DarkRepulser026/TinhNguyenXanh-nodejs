import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { eventService, type EventItem } from '../../services/api';

const EventList: React.FC = () => {
   const [searchParams] = useSearchParams();
   const [events, setEvents] = useState<EventItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const keyword = searchParams.get('keyword')?.trim() || '';
   const location = searchParams.get('location')?.trim() || '';
   const categoryRaw = searchParams.get('category')?.trim() || '';
   const category = categoryRaw ? Number(categoryRaw) : undefined;

   useEffect(() => {
      const load = async () => {
         try {
            const response = await eventService.getAll({
              page: 1,
              pageSize: 20,
              keyword: keyword || undefined,
              location: location || undefined,
              category: Number.isFinite(category) ? category : undefined,
            });
            setEvents(response.data.items);
         } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load events');
         } finally {
            setLoading(false);
         }
      };

      void load();
   }, [keyword, location, category]);

   const formatDate = (value: string) => new Date(value).toLocaleDateString('vi-VN');

  return (
    <div className="event-list-page py-4">
      <div className="container">
            <div className="mb-4">
               <h2 className="fw-bold mb-1 display-6">Khám phá hoạt động</h2>
               <p className="text-muted small mb-0">Tìm thấy {events.length} hoạt động đang diễn ra.</p>
        </div>

            {loading && <div className="alert alert-info">Đang tải dữ liệu sự kiện...</div>}
            {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-4">
           {events.map((event) => (
              <div key={event.id} className="col-lg-4 col-md-6 mb-4">
                 <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden transition-hover">
                    <div className="card-img-top position-relative" style={{ height: '220px' }}>
                                  <img
                                     src={event.images || 'https://images.unsplash.com/photo-1618477471363-92a18d350e94?auto=format&fit=crop&q=80&w=1000'}
                                     className="w-100 h-100 object-fit-cover shadow-inner"
                                     alt={event.title}
                                  />
                       <div className="position-absolute top-0 inset-e-0 p-3">
                          <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-600 shadow-sm">
                                          {event.categoryName ?? 'Chung'}
                          </span>
                       </div>
                    </div>
                    <div className="card-body p-4">
                       <div className="d-flex align-items-center text-muted small mb-2 gap-2">
                                     <span className="text-success fw-bold text-uppercase">{event.location ?? 'Khong ro dia diem'}</span>
                                     <span>•</span>
                                     <span>To chuc boi {event.organizationName ?? 'Chua cap nhat'}</span>
                       </div>
                       <h5 className="card-title fw-bold text-dark mb-3 line-clamp-2" style={{ height: '3rem' }}>
                         {event.title}
                       </h5>
                       
                       <div className="p-3 bg-light rounded-4 mb-4 border border-white">
                          <div className="d-flex justify-content-between mb-2">
                             <span className="text-muted x-small">Đã tham gia</span>
                             <span className="fw-bold x-small text-success">{event.registeredCount}/{event.maxVolunteers}</span>
                          </div>
                          <div className="progress rounded-pill bg-white border border-light-subtle" style={{ height: '6px' }}>
                             <div 
                               className="progress-bar bg-success" 
                               style={{ width: `${Math.min(100, (event.registeredCount / Math.max(1, event.maxVolunteers)) * 100)}%` }}
                             ></div>
                          </div>
                       </div>

                       <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                          <div className="d-flex flex-column">
                             <span className="x-small text-muted mb-0">Thời gian</span>
                             <span className="small fw-bold">{formatDate(event.startTime)}</span>
                          </div>
                          <Link to={`/events/${event.id}`} className="btn btn-success rounded-pill px-4 fw-bold">Chi tiết</Link>
                       </div>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default EventList;

