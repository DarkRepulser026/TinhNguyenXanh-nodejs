import React from 'react';
import { Heart, Users, Calendar, ArrowRight, MapPin, Globe, Share2, ShieldCheck, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div className="container py-4">
            {/* Hero Section */}
            <section className="hero-section text-center py-5 rounded-5 mb-5 shadow-sm position-relative overflow-hidden" style={{ minHeight: '450px' }}>
                <div className="position-absolute top-0 start-0 w-100 h-100 z-0">
                    <img src="/images/anhcongdong.jpg" className="w-100 h-100 object-fit-cover opacity-25" alt="Background" />
                </div>
                <div className="position-relative z-1 py-5 animate-fade-in">
                    <h1 className="fw-bold mb-3 display-3 text-success">Kết Nối Xanh</h1>
                    <p className="lead mb-4 mx-auto text-dark fw-medium" style={{ maxWidth: '750px' }}>
                        Chào mừng bạn đến với <strong>Kết Nối Xanh</strong> – Nơi những trái tim tình nguyện 
                        và các tổ chức xã hội cùng chung tay lan tỏa giá trị nhân văn và xây dựng cộng đồng bền vững.
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                        <Link to="/events" className="btn btn-success btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg border-0 transition-all hover-scale">
                            Khám phá hoạt động
                        </Link>
                        <Link to="/about" className="btn btn-outline-success btn-lg px-5 py-3 rounded-pill fw-bold bg-white shadow-sm transition-all hover-scale">
                            Về chúng tôi
                        </Link>
                    </div>
                </div>
            </section>

            {/* Mục tiêu Section */}
            <section className="p-5 mb-5 rounded-5 text-center shadow-sm border border-success border-opacity-10" style={{ backgroundColor: '#f0fdf4' }}>
                <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-4" style={{ width: '60px', height: '60px' }}>
                    <Target size={30} />
                </div>
                <h4 className="fw-bold mb-4 display-6 text-dark font-primary">Mục tiêu của chúng tôi</h4>
                <div className="row justify-content-center">
                    <div className="col-md-10">
                        <p className="fs-5 text-muted lh-base">
                            Kết nối tình nguyện viên với các cơ hội hoạt động xã hội phù hợp với kỹ năng, thời gian và sở thích.
                            <br /><br />
                            Hỗ trợ các tổ chức xã hội, câu lạc bộ, dự án cộng đồng trong việc tìm kiếm và quản lý tình nguyện viên một cách thuận tiện, minh bạch và hiệu quả.
                            <br /><br />
                            Xây dựng cộng đồng những con người giàu lòng nhân ái, luôn sẵn sàng đóng góp vì lợi ích chung.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section with Real Images */}
            <div className="row g-4 mb-5 pb-4">
                <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden text-white bg-dark position-relative group">
                        <img src="/images/congdong.jpg" className="card-img opacity-50 h-100 object-fit-cover transition-scale" alt="Community" style={{ minHeight: '200px' }} />
                        <div className="card-img-overlay d-flex flex-column justify-content-center text-center p-4">
                            <div className="mb-2"><Users size={32} className="text-success" /></div>
                            <h3 className="fw-bold mb-0 display-6">1,200+</h3>
                            <p className="card-text fw-medium">Tình nguyện viên đăng ký</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden text-white bg-dark position-relative group">
                        <img src="/images/tochucxanhvn.jpg" className="card-img opacity-50 h-100 object-fit-cover transition-scale" alt="Organizations" style={{ minHeight: '200px' }} />
                        <div className="card-img-overlay d-flex flex-column justify-content-center text-center p-4">
                            <div className="mb-2"><Heart size={32} className="text-danger" /></div>
                            <h3 className="fw-bold mb-0 display-6">85+</h3>
                            <p className="card-text fw-medium">Tổ chức thiện nguyện</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden text-white bg-dark position-relative group">
                        <img src="/images/vongtay.jpg" className="card-img opacity-50 h-100 object-fit-cover transition-scale" alt="Events" style={{ minHeight: '200px' }} />
                        <div className="card-img-overlay d-flex flex-column justify-content-center text-center p-4">
                            <div className="mb-2"><Calendar size={32} className="text-info" /></div>
                            <h3 className="fw-bold mb-0 display-6">450+</h3>
                            <p className="card-text fw-medium">Sự kiện thành công</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Giá trị cốt lõi */}
            <section className="text-center mb-5">
                <div className="row align-items-center g-5">
                    <div className="col-lg-6">
                        <img src="/images/vongtay.jpg" alt="Giá trị cốt lõi" className="img-fluid rounded-5 shadow-lg border" />
                    </div>
                    <div className="col-lg-6 text-start">
                        <div className="p-5 rounded-5 h-100 shadow-sm" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <h4 className="fw-bold mb-4 text-success display-6">Giá trị cốt lõi</h4>
                            <div className="d-flex flex-wrap gap-4 mb-4">
                                <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fs-6 d-flex align-items-center gap-2">
                                    <Globe size={18} /> Kết nối
                                </span>
                                <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fs-6 d-flex align-items-center gap-2">
                                    <Share2 size={18} /> Chia sẻ
                                </span>
                                <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fs-6 d-flex align-items-center gap-2">
                                    <ShieldCheck size={18} /> Minh bạch
                                </span>
                            </div>
                            <p className="fst-italic fw-bold text-success mb-3" style={{ fontSize: '1.2rem' }}>Phát triển bền vững</p>
                            <p className="text-muted fs-6">
                                <i className="bi bi-dot"></i> Liên kết các cá nhân và tổ chức cùng chung tấm lòng vì cộng đồng. <br />
                                <i className="bi bi-dot"></i> Mọi người cùng nhau đóng góp, học hỏi và lan tỏa giá trị sống tích cực. <br />
                                <i className="bi bi-dot"></i> Mọi thông tin về dự án, tổ chức và cơ hội đều được công khai, rõ ràng. <br />
                                <i className="bi bi-dot"></i> Hướng đến những hoạt động mang lại lợi ích lâu dài cho xã hội.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Section Header */}
            <div className="d-flex justify-content-between align-items-end mb-4 pt-4 border-top">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Sự kiện nổi bật</h2>
                    <p className="text-muted mb-0">Những hoạt động đang cần sự giúp đỡ từ bạn</p>
                </div>
                <Link to="/events" className="btn btn-link text-success text-decoration-none fw-bold d-flex align-items-center gap-1 p-0">
                    Xem tất cả <ArrowRight size={18} />
                </Link>
            </div>

            {/* Event Cards with placeholders for real images */}
            <div className="row g-4 mb-5">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="col-lg-4 col-md-6">
                        <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden transition-all hover-translate-y">
                            <div className="position-relative" style={{ height: '240px' }}>
                                <img 
                                    src={`/images/1.jpg`} 
                                    className="w-100 h-100 object-fit-cover" 
                                    alt="Event"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Event+Image'; }}
                                />
                                <div className="position-absolute top-0 end-0 p-3">
                                    <span className="badge bg-success rounded-pill px-3 py-2 fw-bold shadow-sm">
                                        HOT
                                    </span>
                                </div>
                            </div>
                            <div className="card-body p-4">
                                <span className="text-success small fw-bold text-uppercase mb-2 d-block">Môi trường</span>
                                <h5 className="card-title fw-bold mb-3 line-clamp-2">Hoạt động cộng đồng hỗ trợ môi trường xanh năm 2026 #{i}</h5>
                                <div className="d-flex align-items-center text-muted small mb-4 gap-3">
                                    <span className="d-flex align-items-center"><MapPin size={14} className="me-1 text-success" /> Hà Nội</span>
                                    <span className="d-flex align-items-center"><Calendar size={14} className="me-1 text-success" /> 20/03/2026</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                                    <span className="small text-muted fw-medium">85 lượt đăng ký</span>
                                    <Link to="/events/1" className="btn btn-success btn-sm rounded-pill px-4 fw-bold">Tham gia</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Call to Action */}
            <section className="cta-section bg-success-subtle rounded-5 p-5 text-center mb-5 border border-success-subtle">
                <h2 className="fw-bold text-success-emphasis mb-3">Sẵn sàng lan tỏa yêu thương?</h2>
                <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '600px' }}>
                    Hãy trở thành một phần của cộng đồng Kết Nối Xanh ngay hôm nay. 
                    Mỗi hành động nhỏ của bạn đều góp phần tạo nên một tương lai tốt đẹp hơn.
                </p>
                <Link to="/register" className="btn btn-success rounded-pill px-5 py-2 fw-bold shadow-sm">
                    Đăng ký tình nguyện viên
                </Link>
            </section>
        </div>
    );
};

export default Home;

