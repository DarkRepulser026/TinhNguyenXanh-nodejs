import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { organizationService, type OrganizationItem } from '../../services/api';

const OrganizationDetails: React.FC = () => {
  const { id } = useParams();
  const [organization, setOrganization] = useState<OrganizationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        const response = await organizationService.getById(id);
        setOrganization(response.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Khong tai duoc chi tiet to chuc.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  if (loading) {
    return <div className="alert alert-info">Dang tai chi tiet to chuc...</div>;
  }

  if (error || !organization) {
    return <div className="alert alert-danger">{error || 'Khong tim thay to chuc.'}</div>;
  }

  return (
    <div className="container py-5">
      <Link to="/organizations" className="btn btn-link">&lt; Quay lai danh sach</Link>
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h1 className="fw-bold">{organization.name}</h1>
        <p className="text-muted">{organization.description || 'Chua co mo ta.'}</p>
        <ul className="list-group list-group-flush mt-3">
          <li className="list-group-item">Thanh pho: {organization.city || 'Chua cap nhat'}</li>
          <li className="list-group-item">Quan/Huyen: {organization.district || 'Chua cap nhat'}</li>
          <li className="list-group-item">Dia chi: {organization.address || 'Chua cap nhat'}</li>
          <li className="list-group-item">Email: {organization.contactEmail || 'Chua cap nhat'}</li>
          <li className="list-group-item">Dien thoai: {organization.phoneNumber || 'Chua cap nhat'}</li>
          <li className="list-group-item">Website: {organization.website || 'Chua cap nhat'}</li>
          <li className="list-group-item">So su kien da to chuc: {organization.eventsOrganized}</li>
          <li className="list-group-item">Xac thuc: {organization.verified ? 'Da xac thuc' : 'Chua xac thuc'}</li>
        </ul>
      </div>
    </div>
  );
};

export default OrganizationDetails;

