import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  FileText, 
  Upload, 
  CheckCircle2
} from 'lucide-react';
import Swal from 'sweetalert2';

const OrganizationRegister: React.FC = () => {
    const [step, setStep] = useState(1);
    /* const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        description: '',
        taxCode: '',
        type: 'NGO'
    }); */

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        Swal.fire({
            title: 'Gửi hồ sơ thành công!',
            text: 'Chúng tôi sẽ xem xét và phản hồi trong vòng 2-3 ngày làm việc.',
            icon: 'success',
            confirmButtonColor: 'var(--primary-color)',
            confirmButtonText: 'Xem trang xác nhận'
        }).then(() => {
            window.location.href = '/organizations/success';
        });
    };

    return (
        <div className="org-register-page py-5 bg-light min-vh-100">
            <div className="container">
                <div className="max-width-container mx-auto" style={{ maxWidth: '800px' }}>
                    
                    {/* Progress Header */}
                    <div className="text-center mb-5">
                       <h2 className="fw-bold mb-3">Đăng ký Tổ chức</h2>
                       <p className="text-muted">Trở thành đối tác của Kết Nối Xanh để lan tỏa hoạt động cộng đồng.</p>
                       
                       <div className="d-flex justify-content-center align-items-center gap-4 mt-4">
                          <div className={`step-item ${step >= 1 ? 'text-success' : 'text-muted'}`}>
                             <div className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center fw-bold ${step >= 1 ? 'bg-success text-white shadow' : 'bg-white border'}`} style={{ width: '40px', height: '40px' }}>1</div>
                             <span className="small fw-600">Thông tin cơ bản</span>
                          </div>
                          <div className="bg-light-subtle" style={{ width: '60px', height: '2px' }}></div>
                          <div className={`step-item ${step >= 2 ? 'text-success' : 'text-muted'}`}>
                             <div className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center fw-bold ${step >= 2 ? 'bg-success text-white shadow' : 'bg-white border'}`} style={{ width: '40px', height: '40px' }}>2</div>
                             <span className="small fw-600">Pháp lý & Mô tả</span>
                          </div>
                       </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
                        <form onSubmit={handleSubmit}>
                            {step === 1 && (
                                <div className="animate-fade-in">
                                    <h5 className="fw-bold mb-4 border-bottom pb-2 d-flex align-items-center gap-2">
                                       <Building2 className="text-success" size={20} /> Thông tin liên hệ
                                    </h5>
                                    
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-600 small">Tên tổ chức <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className="form-control rounded-3 p-3" 
                                                placeholder="VD: Hội Chữ Thập Đỏ Việt Nam" 
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-600 small">Email liên hệ <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0"><Mail size={18} className="text-muted" /></span>
                                                <input type="email" className="form-control rounded-3 p-3 border-start-0" placeholder="organization@email.com" required />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-600 small">Số điện thoại <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0"><Phone size={18} className="text-muted" /></span>
                                                <input type="tel" className="form-control rounded-3 p-3 border-start-0" placeholder="0123 456 789" required />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-600 small">Trang web (nếu có)</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0"><Globe size={18} className="text-muted" /></span>
                                                <input type="url" className="form-control rounded-3 p-3 border-start-0" placeholder="https://example.org" />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-600 small">Địa chỉ trụ sở <span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-white border-end-0"><MapPin size={18} className="text-muted" /></span>
                                                <input type="text" className="form-control rounded-3 p-3 border-start-0" placeholder="Số nhà, Tên đường, Quận/Huyện..." required />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 text-end">
                                        <button type="button" onClick={handleNext} className="btn btn-success rounded-pill px-5 py-3 fw-bold shadow-sm border-0">
                                            Tiếp tục
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="animate-fade-in">
                                    <h5 className="fw-bold mb-4 border-bottom pb-2 d-flex align-items-center gap-2">
                                       <FileText className="text-success" size={20} /> Hồ sơ tổ chức
                                    </h5>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label fw-600 small">Mã số thuế / Số ĐKKD <span className="text-danger">*</span></label>
                                            <input type="text" className="form-control rounded-3 p-3" placeholder="Nhập mã số 10 chữ số" required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-600 small">Loại hình tổ chức <span className="text-danger">*</span></label>
                                            <select className="form-select rounded-3 p-3">
                                                <option value="NGO">Phi chính phủ (NGO)</option>
                                                <option value="Government">Cơ quan Nhà nước</option>
                                                <option value="Club">Câu lạc bộ thiện nguyện</option>
                                                <option value="Company">Doanh nghiệp (CSR)</option>
                                            </select>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-600 small">Giới thiệu tổ chức <span className="text-danger">*</span></label>
                                            <textarea className="form-control rounded-4 p-3" rows={5} placeholder="Hãy cho chúng tôi biết về mục tiêu và các hoạt động của bạn..." required></textarea>
                                        </div>
                                        
                                        <div className="col-12">
                                            <div className="p-4 bg-light rounded-4 border-dashed text-center">
                                                <Upload size={32} className="text-muted mb-2" />
                                                <p className="mb-0 fw-bold small">Tải lên Logo tổ chức</p>
                                                <p className="text-muted x-small">Hỗ trợ JPG, PNG (tối đa 2MB)</p>
                                                <input type="file" className="d-none" id="logoUpload" />
                                                <label htmlFor="logoUpload" className="btn btn-white border-light-subtle btn-sm rounded-pill px-4 mt-2">Chọn tệp</label>
                                            </div>
                                        </div>

                                        <div className="col-12 mt-4">
                                           <div className="form-check">
                                              <input className="form-check-input" type="checkbox" id="termsCheck" required />
                                              <label className="form-check-label small text-muted">
                                                Tôi cam kết các thông tin cung cấp là chính xác và tuân thủ <a href="#" className="text-success text-decoration-none fw-bold">Điều khoản hoạt động</a> của Kết Nối Xanh.
                                              </label>
                                           </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 d-flex justify-content-between">
                                        <button type="button" onClick={handleBack} className="btn btn-light rounded-pill px-4 py-3 fw-bold border-light-subtle">
                                            Quay lại
                                        </button>
                                        <button type="submit" className="btn btn-success rounded-pill px-5 py-3 fw-bold shadow-sm border-0">
                                            Gửi hồ sơ đăng ký
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>

                    <div className="mt-4 p-3 rounded-4 bg-success-subtle border border-success-subtle d-flex gap-3">
                        <CheckCircle2 className="text-success shrink-0" size={24} />
                        <div>
                            <h6 className="fw-bold text-success mb-1 small">Tại sao nên đăng ký?</h6>
                            <p className="mb-0 x-small text-muted">Hơn 500+ tổ chức đã sử dụng nền tảng của chúng tôi để quản lý hàng nghìn tình nguyện viên mỗi tháng hiệu quả hơn 60%.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationRegister;

