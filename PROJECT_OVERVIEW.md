# Project Overview

## 1. Cấu trúc thư mục chính

- `app.js`
  - Khởi tạo Express app.
  - Đăng ký middleware, static file, API route, 404 và error handler.
- `bin/www`
  - Entry point server Node/Express.

- `routes/`
  - Chứa định nghĩa endpoint REST API.
  - File chính:
    - `auth.js` - đăng nhập, đăng ký, logout, profile.
    - `events.js` - sự kiện, đăng ký, yêu thích, bình luận, đánh giá.
    - `organizations.js` - tổ chức, chi tiết, tìm kiếm, đăng ký.
    - `volunteers.js` - profile tình nguyện viên, đăng ký, yêu thích, bình luận, đánh giá.
    - `payments.js` - thanh toán Momo, trạng thái giao dịch.
    - `moderation.js` - kiểm duyệt bình luận, đánh giá.
    - `admin.js` - dashboard admin, quản lý người dùng, danh mục, phê duyệt, kiểm duyệt.
    - `organizer.js` - dashboard organizer, quản lý tổ chức, sự kiện và đăng ký tình nguyện viên.

- `controllers/`
  - Xử lý nghiệp vụ chính và tương tác với database.
  - Quan trọng: `authController.js`, `eventController.js`, `organizationController.js`, `organizerController.js`, `adminController.js`, `moderationController.js`, `paymentController.js`.

- `schemas/`
  - Định nghĩa Mongoose schema/collection.
  - Các model chính:
    - `AppUser.js`
    - `Event.js`, `EventCategory.js`, `EventComment.js`, `EventFavorite.js`, `EventRating.js`, `EventRegistration.js`, `EventReport.js`, `EventTask.js`, `EventTaskAssignment.js`
    - `Organization.js`, `OrganizationMember.js`, `OrganizationReview.js`
    - `Volunteer.js`, `VolunteerEvaluation.js`, `VolunteerSkill.js`
    - `Notification.js`, `Donation.js`

- `public/`
  - Frontend React app.
  - `main.tsx` - render root React app.
  - `App.tsx` - cấu hình router và layout.
  - `components/` - component và UI reusable.
  - `contexts/` - `AuthContext`, global state.
  - `lib/api.ts` - helper frontend gọi API backend.
  - `pages/` - chia theo chức năng: `auth`, `events`, `organizations`, `admin`, `organizer`, `volunteer`, `public`.
  - `styles/`, `assets/`, `images/`.

- `utils/`
  - Hỗ trợ backend: `authHandler.js`, `models.js`, `mongo.js`, `mongo-connection.js`.

- `scripts/`
  - Script hỗ trợ: `db-generate.js`, `db-reset.js`, `db-seed.js`, `smoke-test.js`.

- `uploads/`
  - Lưu file upload (ảnh, tài liệu, v.v.).

## 2. Luồng xử lý chính

### 2.1. Backend khởi động

1. `bin/www` gọi `app.js`.
2. `app.js` cấu hình middleware:
   - `logger`, `express.json()`, `express.urlencoded()`, `cookieParser()`.
   - `app.use('/uploads', express.static(...))` phục vụ file upload.
   - `app.use('/api/v1', ...)` mount các route API.
   - 404 handler và global error handler.
3. Nếu `NODE_ENV === 'production'`, Express có thể phục vụ static React build từ thư mục `dist`.

### 2.2. Yêu cầu API

1. Frontend gọi API tới `/api/v1/...`.
2. `app.js` chuyển request tới router tương ứng.
3. Router gọi middleware `authHandler` nếu endpoint cần xác thực.
4. Router gọi controller xử lý nghiệp vụ.
5. Controller truy vấn MongoDB qua Mongoose.
6. Kết quả trả về frontend dạng JSON.

### 2.3. Frontend gọi backend

1. `public/lib/api.ts` tạo instance `axios` và gọi backend.
2. Thành phần React gọi `authService`, `eventService`, `volunteerService`, `adminService`, `organizerService`, `paymentService`.
3. `AuthContext.tsx` dùng `authService` để login/register/logout và refresh profile.
4. Các page gọi API, sau đó render dữ liệu.
5. Nếu backend trả về 401, axios interceptor xử lý unauthorized.

## 3. Vai trò và dữ liệu đăng nhập mẫu

### 3.1. Các role hiện có

- `Admin`
- `Organizer`
- `Volunteer`

`AppUser.role` được định nghĩa trong `schemas/AppUser.js` và kiểm tra trong `controllers/authController.js`, `utils/authHandler.js`, `controllers/adminController.js`.

### 3.2. Dữ liệu seed sẵn để đăng nhập

Script `scripts/db-seed.js` tạo sẵn tài khoản mẫu với mật khẩu plain text để login nhanh.

#### Admin
- email: `admin1@tinhnguyenxanh.local`
- password: `Admin12345`

- email: `admin2@tinhnguyenxanh.local`
- password: `Admin12345`

#### Organizer
- email: `organizer1@tinhnguyenxanh.local`
- password: `Organizer12345`

- email: `organizer2@tinhnguyenxanh.local`
- password: `Organizer12345`

- email: `organizer3@tinhnguyenxanh.local`
- password: `Organizer12345`

#### Volunteer
- email: `volunteer1@tinhnguyenxanh.local`
- password: `Volunteer12345`

- email: `volunteer2@tinhnguyenxanh.local`
- password: `Volunteer12345`

- email: `volunteer3@tinhnguyenxanh.local`
- password: `Volunteer12345`

> Nếu bạn chưa chạy seed, dùng `node scripts/db-seed.js` để tạo các tài khoản này trong MongoDB.

## 4. Dữ liệu / data chính

### 4.1. Người dùng và xác thực

- `AppUser` lưu thông tin: `email`, `fullName`, `phone`, `role`, `passwordHash`, `isActive`.
- Password trong seed dùng plain text (`passwordHash` thực chất là mật khẩu thô) nên chỉ dùng môi trường phát triển.
- `authController.Login` so sánh `password` với `user.passwordHash` trực tiếp.
- `authController.Register` tạo user mới và tự động tạo profile `Volunteer` nếu role là `Volunteer`.
- `authHandler` tạo và xác thực JWT cookie.

### 4.2. Sự kiện

- `Event` lưu thông tin sự kiện.
- `EventCategory` lưu nhóm category.
- `EventRegistration` lưu đăng ký tham gia.
- `EventFavorite` lưu sự kiện yêu thích.
- `EventComment` lưu bình luận.
- `EventRating` lưu đánh giá.
- `EventTask` và `EventTaskAssignment` dùng cho nhiệm vụ nội bộ.
- `EventReport` lưu báo cáo.

### 4.3. Tổ chức

- `Organization` lưu dữ liệu tổ chức.
- `OrganizationMember` lưu thành viên của tổ chức.
- `OrganizationReview` lưu review tổ chức.

### 4.4. Tình nguyện viên

- `Volunteer` lưu profile và dữ liệu bổ sung như `hoursCompleted`, `skillsBadges`, `bio`, `avatar`.
- `VolunteerSkill` lưu kỹ năng của volunteer.
- `VolunteerEvaluation` lưu đánh giá của organizer dành cho volunteer.

### 4.5. Thanh toán

- `Donation` lưu giao dịch thanh toán.
- Backend có endpoint thanh toán Momo và lấy trạng thái giao dịch.

### 4.6. Khác

- `Notification` dùng cho thông báo hệ thống.
- `uploads/` chứa ảnh và file upload.

## 5. Luồng dữ liệu chính từng nhóm

### 5.1. Đăng nhập / đăng ký

- Frontend gửi POST `/api/v1/login` hoặc `/api/v1/register`.
- Backend trả về JWT cookie và thông tin user.
- `AuthContext` lưu user vào trạng thái.
- Nếu token hết hạn, frontend cần thực hiện refresh hoặc yêu cầu login lại.

### 5.2. Quản lý sự kiện

- Lấy danh sách: GET `/api/v1/events`.
- Chi tiết: GET `/api/v1/events/:id`.
- Đăng ký: POST `/api/v1/events/:id/register`.
- Yêu thích: POST `/api/v1/events/:id/favorite`.
- Bình luận: GET/POST `/api/v1/events/:eventId/comments`.
- Đánh giá: GET/POST `/api/v1/events/:eventId/ratings`.

### 5.3. Quản lý tình nguyện viên

- Profile: GET `/api/v1/volunteers/:userId/profile`.
- Đăng ký: GET `/api/v1/volunteers/:userId/registrations`.
- Xóa đăng ký: DELETE `/api/v1/volunteers/:userId/registrations/:registrationId`.
- Yêu thích: GET `/api/v1/volunteers/:userId/favorites`.
- Cập nhật profile: PUT `/api/v1/volunteers/:userId/profile`.
- Upload avatar: POST `/api/v1/volunteers/:userId/avatar`.

### 5.4. Quản lý tổ chức

- Danh sách: GET `/api/v1/organizations`.
- Chi tiết: GET `/api/v1/organizations/:id`.
- Đăng ký tổ chức: POST `/api/v1/organizations/register`.

### 5.5. Admin và organizer

- Admin quản lý người dùng, danh mục, mod, duyệt sự kiện.
- Organizer quản lý tổ chức, tạo sự kiện, xem đăng ký tình nguyện viên.

## 6. Ghi chú nhanh

- `public/lib/api.ts` là nơi tập trung gọi API, nhưng không bắt buộc nếu bạn muốn gọi `axios`/`fetch` trực tiếp.
- Các role mặc định: `Admin`, `Organizer`, `Volunteer`.
- Seed script tạo tài khoản demo sẵn, dùng để đăng nhập thử.
- Nếu bạn dùng môi trường mới, chạy `node scripts/db-seed.js` trước.
