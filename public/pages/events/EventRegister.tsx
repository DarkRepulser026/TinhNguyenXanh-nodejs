import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const EventRegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const eventId = searchParams.get('eventId');
  const eventTitle = searchParams.get('title') || 'Su kien tinh nguyen';

  return (
    <div className="py-5">
      <div className="container" style={{ maxWidth: '760px' }}>
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
          <h1 className="h4 fw-bold mb-2">Dang ky su kien</h1>
          <p className="text-muted mb-4">
            Trang parity cho luong dang ky su kien. Ban co the thay bang form xac nhan chi tiet trong giai doan tiep theo.
          </p>

          <div className="rounded-4 bg-light border p-3 mb-4">
            <p className="mb-1 small text-muted">Su kien</p>
            <p className="mb-0 fw-semibold">{eventTitle}</p>
            {eventId ? (
              <p className="mb-0 mt-2 small text-muted">Ma su kien: #{eventId}</p>
            ) : null}
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link to="/registrations" className="btn btn-success rounded-pill px-4">
              Xem dang ky cua toi
            </Link>
            <Link to="/events" className="btn btn-outline-success rounded-pill px-4">
              Quay lai danh sach su kien
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegisterPage;
