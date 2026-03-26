import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { organizationService, type OrganizationItem } from '../../services/api';

const OrganizationList: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await organizationService.getAll({ page: 1, pageSize: 20 });
        setOrganizations(response.data.items);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Khong tai duoc danh sach to chuc.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading) {
    return <div className="alert alert-info">Dang tai danh sach to chuc...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-4">Danh sach to chuc</h1>
      <div className="row g-4">
        {organizations.map((org) => (
          <div key={org.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 rounded-4">
              <div className="card-body d-flex flex-column">
                <h5 className="fw-bold">{org.name}</h5>
                <p className="text-muted small grow">{org.description || 'Chua co mo ta.'}</p>
                <p className="small mb-1">Dia diem: {org.city || 'Chua cap nhat'}</p>
                <p className="small mb-3">Su kien da to chuc: {org.eventsOrganized}</p>
                <Link to={`/organizations/${org.id}`} className="btn btn-success rounded-pill">Xem chi tiet</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationList;

