import { useEffect, useState, type FormEvent } from 'react';
import { getApiErrorMessage, organizerService, type OrganizationItem } from '../../services/api';

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

const OrganizerOrganizationManagement = () => {
  const [organization, setOrganization] = useState<OrganizationItem>(emptyOrg);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [claimId, setClaimId] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizerService.getOrganization();
      setOrganization(response.data);
    } catch (err) {
      setOrganization(emptyOrg);
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

  const save = async (e: FormEvent) => {
    e.preventDefault();

    if (!organization.name?.trim()) {
      setError('Tên tổ chức không được để trống.');
      setSuccess(null);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await organizerService.updateOrganization({
        name: organization.name?.trim(),
        description: organization.description?.trim() || '',
        city: organization.city?.trim() || '',
        district: organization.district?.trim() || '',
        address: organization.address?.trim() || '',
        contactEmail: organization.contactEmail?.trim() || '',
        phoneNumber: organization.phoneNumber?.trim() || '',
        website: organization.website?.trim() || '',
        organizationType: organization.organizationType?.trim() || '',
      });

      setOrganization(response.data);
      setSuccess('Cập nhật hồ sơ tổ chức thành công.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể cập nhật tổ chức.'));
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  const claim = async (e: FormEvent) => {
    e.preventDefault();
    const id = claimId.trim();

    if (!id) {
      setError('Vui lòng nhập Organization ID để liên kết.');
      setSuccess(null);
      return;
    }

    try {
      setClaiming(true);
      setError(null);
      setSuccess(null);

      const response = await organizerService.claimOrganization(id);
      setOrganization(response.data);
      setClaimId('');
      setSuccess('Liên kết tổ chức thành công.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể liên kết tổ chức.'));
      setSuccess(null);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Quản lý hồ sơ tổ chức</h1>
        <p className="text-muted-foreground text-sm">
          Cập nhật thông tin tổ chức của bạn để quản lý sự kiện và tình nguyện viên tốt hơn.
        </p>
      </div>

      {loading ? <div className="rounded-xl border bg-card p-4 text-sm">Đang tải dữ liệu tổ chức...</div> : null}

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      {!loading && !organization.id ? (
        <form className="rounded-2xl border bg-card p-6 shadow-sm" onSubmit={claim}>
          <h2 className="mb-2 text-lg font-semibold">Liên kết tổ chức</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Tài khoản này chưa sở hữu tổ chức nào. Nhập Organization ID để nhận quyền quản lý.
          </p>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Nhập Organization ID"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
            />
            <button
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={claiming}
              type="submit"
            >
              {claiming ? 'Đang liên kết...' : 'Liên kết tổ chức'}
            </button>
          </div>
        </form>
      ) : null}

      {!loading && organization.id ? (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-muted-foreground text-xs uppercase">Trạng thái xác minh</p>
              <p className={`mt-2 text-base font-semibold ${organization.verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                {organization.verified ? 'Đã xác minh' : 'Chưa xác minh'}
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-muted-foreground text-xs uppercase">Sự kiện đã tổ chức</p>
              <p className="mt-2 text-2xl font-semibold">{organization.eventsOrganized ?? 0}</p>
            </div>

            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-muted-foreground text-xs uppercase">Điểm đánh giá</p>
              <p className="mt-2 text-2xl font-semibold">{organization.averageRating ?? 0}</p>
            </div>

            <div className="rounded-2xl border bg-card p-4 shadow-sm">
              <p className="text-muted-foreground text-xs uppercase">Tổng đánh giá</p>
              <p className="mt-2 text-2xl font-semibold">{organization.totalReviews ?? 0}</p>
            </div>
          </div>

          <form className="grid gap-4 rounded-2xl border bg-card p-6 shadow-sm md:grid-cols-2" onSubmit={save}>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Tên tổ chức</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Nhập tên tổ chức"
                value={organization.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email liên hệ</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="contact@example.com"
                value={organization.contactEmail || ''}
                onChange={(e) => updateField('contactEmail', e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Nhập số điện thoại"
                value={organization.phoneNumber || ''}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Loại tổ chức</label>
              <select
                className="w-full rounded-lg border px-3 py-2 text-sm"
                value={organization.organizationType || ''}
                onChange={(e) => updateField('organizationType', e.target.value)}
              >
                <option value="">Chọn loại tổ chức</option>
                <option value="Trường học">Trường học</option>
                <option value="CLB">CLB</option>
                <option value="Doanh nghiệp">Doanh nghiệp</option>
                <option value="Phi lợi nhuận">Phi lợi nhuận</option>
                <option value="Cộng đồng">Cộng đồng</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Website</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="https://example.org"
                value={organization.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Thành phố</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Nhập thành phố"
                value={organization.city || ''}
                onChange={(e) => updateField('city', e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Quận / Huyện</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Nhập quận / huyện"
                value={organization.district || ''}
                onChange={(e) => updateField('district', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Địa chỉ</label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Nhập địa chỉ đầy đủ"
                value={organization.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">Mô tả tổ chức</label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Giới thiệu ngắn về tổ chức của bạn"
                rows={5}
                value={organization.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
                disabled={saving}
                type="submit"
              >
                {saving ? 'Đang lưu...' : 'Lưu hồ sơ tổ chức'}
              </button>
            </div>
          </form>
        </>
      ) : null}
    </section>
  );
};

export default OrganizerOrganizationManagement;