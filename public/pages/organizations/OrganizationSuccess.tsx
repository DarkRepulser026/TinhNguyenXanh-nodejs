import React from 'react';
import { Link } from 'react-router-dom';

const OrganizationSuccess: React.FC = () => {
  return (
    <div className="py-5">
      <div className="container" style={{ maxWidth: '760px' }}>
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center">
          <h1 className="h3 fw-bold mb-3">Gui ho so thanh cong</h1>
          <p className="text-muted mb-4">
            Ho so dang ky to chuc cua ban da duoc tiep nhan. Chung toi se phan hoi trong 2-3 ngay lam viec.
          </p>
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <Link className="btn btn-success rounded-pill px-4" to="/organizations">
              Xem danh sach to chuc
            </Link>
            <Link className="btn btn-outline-success rounded-pill px-4" to="/">
              Ve trang chu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSuccess;
