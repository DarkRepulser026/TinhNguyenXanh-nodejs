import { useEffect, useState } from 'react';
import { getApiErrorMessage, organizerService, type OrganizationItem } from '../../services/api';

const emptyOrg: OrganizationItem = {
  id: 0,
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

const OrganizerOrganizationManagement = () => {
  const [organization, setOrganization] = useState<OrganizationItem>(emptyOrg);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimId, setClaimId] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizerService.getOrganization();
      setOrganization(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không tìm thấy tổ chức của tài khoản tổ chức này.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateField = (key: keyof OrganizationItem, value: string) => {
    setOrganization((prev) => ({ ...prev, [key]: value }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const response = await organizerService.updateOrganization({
        name: organization.name,
        description: organization.description,
        city: organization.city,
        district: organization.district,
        address: organization.address,
        contactEmail: organization.contactEmail,
        phoneNumber: organization.phoneNumber,
        website: organization.website,
        organizationType: organization.organizationType,
      });
      setOrganization(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật tổ chức.'));
    }
  };

  const claim = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(claimId);
    if (!Number.isFinite(id) || id <= 0) {
      return;
    }

    try {
      setError(null);
      const response = await organizerService.claimOrganization(id);
      setOrganization(response.data);
      setClaimId('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể liên kết tổ chức.'));
    }
  };

  return (
    <section>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">Organization Management</h1>
      <p className="text-muted-foreground mb-6 text-sm">Cập nhật thông tin hồ sơ tổ chức.</p>

      {loading ? <div className="rounded border bg-card p-4 text-sm">Đang tải dữ liệu...</div> : null}
      {error ? <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      {!organization.id ? (
        <form className="mb-4 flex gap-2 rounded-xl border bg-card p-4" onSubmit={claim}>
          <input
            className="w-full max-w-sm rounded border px-3 py-2 text-sm"
            placeholder="Nhập ID tổ chức để liên kết"
            value={claimId}
            onChange={(e) => setClaimId(e.target.value)}
          />
          <button className="rounded bg-green-700 px-3 py-2 text-sm text-white" type="submit">
            Claim
          </button>
        </form>
      ) : null}

      {organization.id ? (
        <form className="grid gap-3 rounded-xl border bg-card p-6 md:grid-cols-2" onSubmit={save}>
          <input className="rounded border px-3 py-2 text-sm md:col-span-2" placeholder="Organization name" value={organization.name || ''} onChange={(e) => updateField('name', e.target.value)} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Contact email" value={organization.contactEmail || ''} onChange={(e) => updateField('contactEmail', e.target.value)} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="Phone" value={organization.phoneNumber || ''} onChange={(e) => updateField('phoneNumber', e.target.value)} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="City" value={organization.city || ''} onChange={(e) => updateField('city', e.target.value)} />
          <input className="rounded border px-3 py-2 text-sm" placeholder="District" value={organization.district || ''} onChange={(e) => updateField('district', e.target.value)} />
          <input className="rounded border px-3 py-2 text-sm md:col-span-2" placeholder="Address" value={organization.address || ''} onChange={(e) => updateField('address', e.target.value)} />
          <textarea className="rounded border px-3 py-2 text-sm md:col-span-2" placeholder="Description" rows={4} value={organization.description || ''} onChange={(e) => updateField('description', e.target.value)} />
          <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white md:col-span-2" type="submit">
            Save profile
          </button>
        </form>
      ) : null}
    </section>
  );
};

export default OrganizerOrganizationManagement;
