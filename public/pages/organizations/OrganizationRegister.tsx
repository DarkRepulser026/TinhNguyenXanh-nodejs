import { organizationService, getApiErrorMessage } from '../../lib/api';
import { useMemo, useState, type ChangeEvent, type FormEvent, type CSSProperties } from 'react';
import Swal from 'sweetalert2';
import {
    Building2,
    CheckCircle2,
    FileText,
    Globe,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    Share2,
    Upload,
    Users,
} from 'lucide-react';

type RegisterForm = {
    name: string;
    organizationType: string;
    description: string;
    contactEmail: string;
    phoneNumber: string;
    website: string;
    city: string;
    district: string;
    ward: string;
    address: string;
    taxCode: string;
    foundedDate: string;
    legalRepresentative: string;
    documentType: string;
    verificationDocsUrl: string;
    facebookUrl: string;
    zaloNumber: string;
    memberCount: string;
    eventsOrganized: string;
    achievements: string;
    focusAreas: string[];
    agree: boolean;
};

const focusAreaOptions = [
    'Môi trường',
    'Giáo dục',
    'Y tế',
    'Trẻ em',
    'Người cao tuổi',
    'Người khuyết tật',
    'Cộng đồng',
    'Động vật',
    'Văn hóa',
];

const districtMap: Record<string, string[]> = {
    'Hồ Chí Minh': [
        'Quận 1',
        'Quận 3',
        'Quận 5',
        'Quận 7',
        'Quận 10',
        'Quận Bình Thạnh',
        'Quận Gò Vấp',
        'Quận Tân Bình',
        'Quận Thủ Đức',
        'Huyện Bình Chánh',
    ],
    'Hà Nội': [
        'Ba Đình',
        'Hoàn Kiếm',
        'Cầu Giấy',
        'Đống Đa',
        'Hai Bà Trưng',
        'Hoàng Mai',
        'Thanh Xuân',
    ],
    'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu'],
    'Cần Thơ': ['Ninh Kiều', 'Cái Răng', 'Bình Thủy', 'Ô Môn', 'Thốt Nốt'],
    'Hải Phòng': ['Hồng Bàng', 'Lê Chân', 'Ngô Quyền', 'Hải An', 'Kiến An'],
};

const initialForm: RegisterForm = {
    name: '',
    organizationType: '',
    description: '',
    contactEmail: '',
    phoneNumber: '',
    website: '',
    city: '',
    district: '',
    ward: '',
    address: '',
    taxCode: '',
    foundedDate: '',
    legalRepresentative: '',
    documentType: '',
    verificationDocsUrl: '',
    facebookUrl: '',
    zaloNumber: '',
    memberCount: '',
    eventsOrganized: '',
    achievements: '',
    focusAreas: [],
    agree: false,
};

const sectionTitleStyle: CSSProperties = {
    color: '#16a34a',
    fontSize: '1.2rem',
    fontWeight: 700,
    margin: '30px 0 18px',
    paddingBottom: '10px',
    borderBottom: '2px solid #16a34a',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
};

const inputStyle: CSSProperties = {
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '0.95rem',
};

const labelStyle: CSSProperties = {
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: '8px',
    display: 'block',
    fontSize: '0.95rem',
};

const cardStyle: CSSProperties = {
    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    overflow: 'hidden',
    maxWidth: '1180px',
    margin: '0 auto',
};

const OrganizationRegister = () => {
    const [form, setForm] = useState<RegisterForm>(initialForm);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const districts = useMemo(() => {
        return form.city ? districtMap[form.city] || [] : [];
    }, [form.city]);

    const updateField = <K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox' && name === 'agree') {
            const checked = (e.target as HTMLInputElement).checked;
            updateField('agree', checked);
            return;
        }

        if (name === 'city') {
            setForm((prev) => ({
                ...prev,
                city: value,
                district: '',
            }));
            return;
        }

        updateField(name as keyof RegisterForm, value as never);
    };

    const handleFocusAreaChange = (area: string) => {
        setForm((prev) => {
            const exists = prev.focusAreas.includes(area);
            return {
                ...prev,
                focusAreas: exists
                    ? prev.focusAreas.filter((item) => item !== area)
                    : [...prev.focusAreas, area],
            };
        });
    };

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            void Swal.fire({
                icon: 'warning',
                title: 'Sai định dạng',
                text: 'Chỉ chấp nhận JPG, PNG hoặc GIF.',
                confirmButtonColor: '#16a34a',
            });
            e.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            void Swal.fire({
                icon: 'warning',
                title: 'File quá lớn',
                text: 'Kích thước ảnh không được vượt quá 5MB.',
                confirmButtonColor: '#16a34a',
            });
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setLogoPreview(String(event.target?.result || ''));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (form.focusAreas.length === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Thiếu lĩnh vực hoạt động',
                text: 'Vui lòng chọn ít nhất một lĩnh vực hoạt động.',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        if (!form.agree) {
            await Swal.fire({
                icon: 'warning',
                title: 'Chưa xác nhận cam kết',
                text: 'Bạn cần xác nhận thông tin là chính xác trước khi gửi.',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        try {
            setSubmitting(true);

            await organizationService.register({
                name: form.name.trim(),
                organizationType: form.organizationType,
                description: form.description.trim(),
                contactEmail: form.contactEmail.trim(),
                phoneNumber: form.phoneNumber.trim(),
                website: form.website.trim() || undefined,
                city: form.city,
                district: form.district,
                ward: form.ward.trim() || undefined,
                address: form.address.trim(),
                taxCode: form.taxCode.trim() || undefined,
                foundedDate: form.foundedDate || undefined,
                legalRepresentative: form.legalRepresentative.trim() || undefined,
                documentType: form.documentType || undefined,
                verificationDocsUrl: form.verificationDocsUrl.trim() || undefined,
                facebookUrl: form.facebookUrl.trim() || undefined,
                zaloNumber: form.zaloNumber.trim() || undefined,
                achievements: form.achievements.trim() || undefined,
                memberCount: Number(form.memberCount || 0),
                eventsOrganized: Number(form.eventsOrganized || 0),
                focusAreas: form.focusAreas,
                avatarUrl: logoPreview || undefined,
            });

            await Swal.fire({
                title: 'Đăng ký thành công!',
                text: 'Hồ sơ tổ chức của bạn đã được tạo.',
                icon: 'success',
                confirmButtonColor: '#16a34a',
                confirmButtonText: 'Tiếp tục',
            });

            window.location.href = '/organizations/success';
        } catch (error) {
            await Swal.fire({
                title: 'Đăng ký thất bại',
                text: getApiErrorMessage(error, 'Không thể gửi hồ sơ đăng ký tổ chức.'),
                icon: 'error',
                confirmButtonColor: '#dc2626',
            });
        } finally {
            setSubmitting(false);
        }
    };
    const [submitting, setSubmitting] = useState(false);
    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #dcfce7 0%, #16a34a 100%)',
                padding: '56px 16px',
            }}
        >
            <div className="container">
                <div style={cardStyle}>
                    <div
                        style={{
                            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                            color: '#fff',
                            padding: '40px 28px',
                            textAlign: 'center',
                        }}
                    >
                        <div style={{ marginBottom: '12px' }}>
                            <Building2 size={52} />
                        </div>
                        <h2 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: '10px' }}>
                            Đăng ký Ban Tổ Chức
                        </h2>
                        <p style={{ margin: 0, opacity: 0.95 }}>
                            Tham gia cùng chúng tôi để tạo ra những hoạt động tình nguyện ý nghĩa
                        </p>
                    </div>

                    <div style={{ padding: '36px 44px' }}>
                        <form onSubmit={handleSubmit}>
                            <div style={sectionTitleStyle}>
                                <Building2 size={20} />
                                <span>Thông tin cơ bản</span>
                            </div>

                            <div className="mb-4">
                                <label style={labelStyle}>Logo/Ảnh đại diện tổ chức (Không bắt buộc)</label>
                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '24px',
                                        alignItems: 'center',
                                        padding: '18px',
                                        background: '#f8fafc',
                                        border: '2px dashed #d1d5db',
                                        borderRadius: '12px',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '50%',
                                            background: '#fff',
                                            border: '3px solid #e2e8f0',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#94a3b8',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {logoPreview ? (
                                            <img
                                                alt="preview"
                                                src={logoPreview}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ textAlign: 'center' }}>
                                                <Building2 size={44} />
                                                <div style={{ fontSize: '0.9rem', marginTop: '8px' }}>Chọn ảnh</div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <label
                                            htmlFor="logoUpload"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 18px',
                                                borderRadius: '10px',
                                                border: '2px solid #16a34a',
                                                color: '#16a34a',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                marginBottom: '12px',
                                            }}
                                        >
                                            <Upload size={18} />
                                            Tải ảnh lên
                                        </label>
                                        <input
                                            accept="image/*"
                                            id="logoUpload"
                                            onChange={handleLogoChange}
                                            style={{ display: 'none' }}
                                            type="file"
                                        />
                                        <p className="text-muted small mb-1">Định dạng: JPG, PNG, GIF</p>
                                        <p className="text-muted small mb-0">Kích thước tối đa: 5MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-8 mb-3">
                                    <label htmlFor="name" style={labelStyle}>
                                        Tên tổ chức <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <input
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        onChange={handleInputChange}
                                        placeholder="VD: Nhóm Tình Nguyện Xanh TP.HCM"
                                        required
                                        style={inputStyle}
                                        value={form.name}
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor="organizationType" style={labelStyle}>
                                        Loại tổ chức <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        id="organizationType"
                                        name="organizationType"
                                        onChange={handleInputChange}
                                        required
                                        style={inputStyle}
                                        value={form.organizationType}
                                    >
                                        <option value="">-- Chọn loại --</option>
                                        <option value="NGO">NGO/Phi lợi nhuận</option>
                                        <option value="Volunteer">Nhóm tình nguyện</option>
                                        <option value="Social">Doanh nghiệp xã hội</option>
                                        <option value="School">Trường học/Đại học</option>
                                        <option value="Government">Cơ quan nhà nước</option>
                                        <option value="Other">Khác</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="description" style={labelStyle}>
                                    Mô tả tổ chức <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <textarea
                                    className="form-control"
                                    id="description"
                                    maxLength={2000}
                                    name="description"
                                    onChange={handleInputChange}
                                    placeholder="Giới thiệu về sứ mệnh, tầm nhìn và các hoạt động chính của tổ chức..."
                                    required
                                    rows={5}
                                    style={inputStyle}
                                    value={form.description}
                                />
                                <div className="text-end small text-muted mt-1">
                                    {form.description.length}/2000 ký tự
                                </div>
                            </div>

                            <div style={sectionTitleStyle}>
                                <CheckCircle2 size={20} />
                                <span>Lĩnh vực hoạt động</span>
                            </div>

                            <div className="mb-3">
                                <label style={labelStyle}>
                                    Chọn lĩnh vực (có thể chọn nhiều) <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <div className="row g-2">
                                    {focusAreaOptions.map((area) => {
                                        const active = form.focusAreas.includes(area);
                                        return (
                                            <div className="col-md-4 col-sm-6" key={area}>
                                                <button
                                                    onClick={() => handleFocusAreaChange(area)}
                                                    style={{
                                                        width: '100%',
                                                        textAlign: 'left',
                                                        padding: '10px 14px',
                                                        borderRadius: '10px',
                                                        border: `2px solid ${active ? '#16a34a' : '#e2e8f0'}`,
                                                        background: active ? '#f0fdf4' : '#f8fafc',
                                                        color: active ? '#166534' : '#334155',
                                                        fontWeight: active ? 600 : 500,
                                                    }}
                                                    type="button"
                                                >
                                                    {area}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={sectionTitleStyle}>
                                <Mail size={20} />
                                <span>Thông tin liên hệ</span>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="contactEmail" style={labelStyle}>
                                        Email liên hệ <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0">
                                            <Mail size={18} />
                                        </span>
                                        <input
                                            className="form-control border-start-0"
                                            id="contactEmail"
                                            name="contactEmail"
                                            onChange={handleInputChange}
                                            placeholder="contact@organization.vn"
                                            required
                                            style={inputStyle}
                                            type="email"
                                            value={form.contactEmail}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="phoneNumber" style={labelStyle}>
                                        Số điện thoại <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0">
                                            <Phone size={18} />
                                        </span>
                                        <input
                                            className="form-control border-start-0"
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            onChange={handleInputChange}
                                            placeholder="0901234567"
                                            required
                                            style={inputStyle}
                                            value={form.phoneNumber}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="website" style={labelStyle}>
                                    Website (không bắt buộc)
                                </label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                        <Globe size={18} />
                                    </span>
                                    <input
                                        className="form-control border-start-0"
                                        id="website"
                                        name="website"
                                        onChange={handleInputChange}
                                        placeholder="https://www.organization.vn"
                                        style={inputStyle}
                                        value={form.website}
                                    />
                                </div>
                            </div>

                            <div style={sectionTitleStyle}>
                                <MapPin size={20} />
                                <span>Địa chỉ trụ sở</span>
                            </div>

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label htmlFor="city" style={labelStyle}>
                                        Tỉnh/Thành phố <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        id="city"
                                        name="city"
                                        onChange={handleInputChange}
                                        required
                                        style={inputStyle}
                                        value={form.city}
                                    >
                                        <option value="">-- Chọn tỉnh/thành --</option>
                                        <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                                        <option value="Hà Nội">Hà Nội</option>
                                        <option value="Đà Nẵng">Đà Nẵng</option>
                                        <option value="Cần Thơ">Cần Thơ</option>
                                        <option value="Hải Phòng">Hải Phòng</option>
                                    </select>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor="district" style={labelStyle}>
                                        Quận/Huyện <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <select
                                        className="form-select"
                                        id="district"
                                        name="district"
                                        onChange={handleInputChange}
                                        required
                                        style={inputStyle}
                                        value={form.district}
                                    >
                                        <option value="">-- Chọn quận/huyện --</option>
                                        {districts.map((district) => (
                                            <option key={district} value={district}>
                                                {district}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor="ward" style={labelStyle}>
                                        Phường/Xã
                                    </label>
                                    <input
                                        className="form-control"
                                        id="ward"
                                        name="ward"
                                        onChange={handleInputChange}
                                        placeholder="Phường 1"
                                        style={inputStyle}
                                        value={form.ward}
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="address" style={labelStyle}>
                                    Địa chỉ chi tiết <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <input
                                    className="form-control"
                                    id="address"
                                    name="address"
                                    onChange={handleInputChange}
                                    placeholder="Số nhà, tên đường..."
                                    required
                                    style={inputStyle}
                                    value={form.address}
                                />
                            </div>

                            <div style={sectionTitleStyle}>
                                <FileText size={20} />
                                <span>Thông tin pháp lý (không bắt buộc)</span>
                            </div>

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label htmlFor="taxCode" style={labelStyle}>
                                        Mã số thuế/ĐKKD
                                    </label>
                                    <input
                                        className="form-control"
                                        id="taxCode"
                                        name="taxCode"
                                        onChange={handleInputChange}
                                        placeholder="0123456789"
                                        style={inputStyle}
                                        value={form.taxCode}
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor="foundedDate" style={labelStyle}>
                                        Ngày thành lập
                                    </label>
                                    <input
                                        className="form-control"
                                        id="foundedDate"
                                        name="foundedDate"
                                        onChange={handleInputChange}
                                        style={inputStyle}
                                        type="date"
                                        value={form.foundedDate}
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor="legalRepresentative" style={labelStyle}>
                                        Người đại diện pháp luật
                                    </label>
                                    <input
                                        className="form-control"
                                        id="legalRepresentative"
                                        name="legalRepresentative"
                                        onChange={handleInputChange}
                                        placeholder="Nguyễn Văn A"
                                        style={inputStyle}
                                        value={form.legalRepresentative}
                                    />
                                </div>
                            </div>

                            <div style={sectionTitleStyle}>
                                <ShieldCheck size={20} />
                                <span>Tài liệu xác minh (không bắt buộc)</span>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="documentType" style={labelStyle}>
                                        Loại tài liệu
                                    </label>
                                    <select
                                        className="form-select"
                                        id="documentType"
                                        name="documentType"
                                        onChange={handleInputChange}
                                        style={inputStyle}
                                        value={form.documentType}
                                    >
                                        <option value="">-- Chọn loại --</option>
                                        <option value="License">Giấy phép hoạt động</option>
                                        <option value="Registration">Giấy đăng ký kinh doanh</option>
                                        <option value="Decision">Quyết định thành lập</option>
                                        <option value="Other">Khác</option>
                                    </select>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="verificationDocsUrl" style={labelStyle}>
                                        Link tài liệu
                                    </label>
                                    <input
                                        className="form-control"
                                        id="verificationDocsUrl"
                                        name="verificationDocsUrl"
                                        onChange={handleInputChange}
                                        placeholder="https://drive.google.com/..."
                                        style={inputStyle}
                                        value={form.verificationDocsUrl}
                                    />
                                </div>
                            </div>

                            <div style={sectionTitleStyle}>
                                <Share2 size={20} />
                                <span>Mạng xã hội (không bắt buộc)</span>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="facebookUrl" style={labelStyle}>
                                        Facebook Page
                                    </label>
                                    <input
                                        className="form-control"
                                        id="facebookUrl"
                                        name="facebookUrl"
                                        onChange={handleInputChange}
                                        placeholder="https://facebook.com/your-page"
                                        style={inputStyle}
                                        value={form.facebookUrl}
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="zaloNumber" style={labelStyle}>
                                        Zalo
                                    </label>
                                    <input
                                        className="form-control"
                                        id="zaloNumber"
                                        name="zaloNumber"
                                        onChange={handleInputChange}
                                        placeholder="0901234567"
                                        style={inputStyle}
                                        value={form.zaloNumber}
                                    />
                                </div>
                            </div>

                            <div style={sectionTitleStyle}>
                                <Users size={20} />
                                <span>Thông tin bổ sung (không bắt buộc)</span>
                            </div>

                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <label htmlFor="memberCount" style={labelStyle}>
                                        Số thành viên
                                    </label>
                                    <input
                                        className="form-control"
                                        id="memberCount"
                                        min={0}
                                        name="memberCount"
                                        onChange={handleInputChange}
                                        placeholder="50"
                                        style={inputStyle}
                                        type="number"
                                        value={form.memberCount}
                                    />
                                </div>

                                <div className="col-md-4 mb-3">
                                    <label htmlFor="eventsOrganized" style={labelStyle}>
                                        Số sự kiện đã tổ chức
                                    </label>
                                    <input
                                        className="form-control"
                                        id="eventsOrganized"
                                        min={0}
                                        name="eventsOrganized"
                                        onChange={handleInputChange}
                                        placeholder="10"
                                        style={inputStyle}
                                        type="number"
                                        value={form.eventsOrganized}
                                    />
                                </div>

                                <div className="col-md-12 mb-3">
                                    <label htmlFor="achievements" style={labelStyle}>
                                        Thành tích nổi bật
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="achievements"
                                        name="achievements"
                                        onChange={handleInputChange}
                                        placeholder="Các giải thưởng, thành tích đáng nhớ..."
                                        rows={3}
                                        style={inputStyle}
                                        value={form.achievements}
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: '#f8fafc',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '10px',
                                    padding: '15px',
                                    marginBottom: '22px',
                                }}
                            >
                                <input
                                    checked={form.agree}
                                    id="agree"
                                    name="agree"
                                    onChange={handleInputChange}
                                    type="checkbox"
                                />
                                <label htmlFor="agree" style={{ margin: 0, fontWeight: 500 }}>
                                    Tôi cam kết các thông tin cung cấp là chính xác và tuân thủ điều khoản hoạt động.
                                </label>
                            </div>

                            <button
                                className="w-100"
                                disabled={submitting}
                                style={{
                                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                    border: 'none',
                                    color: '#fff',
                                    padding: '14px',
                                    fontSize: '1.05rem',
                                    fontWeight: 700,
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)',
                                    opacity: submitting ? 0.7 : 1,
                                }}
                                type="submit"
                            >
                                {submitting ? 'Đang gửi hồ sơ...' : 'Đăng ký ngay'}
                            </button>

                            <div className="text-center mt-3">
                                <a href="/" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}>
                                    ← Quay lại trang chủ
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default OrganizationRegister;
