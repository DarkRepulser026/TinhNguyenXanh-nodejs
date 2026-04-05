# Hướng Dẫn Cấu Trúc & Cách Chạy Ứng Dụng

## 📁 Cấu Trúc Thư Mục Dự Án

```
TinhNguyenXanh-nodejs/
├── app.js                          # Entry point của ứng dụng Express
├── package.json                    # Cấu hình dependency và scripts
├── bin/
│   └── www                         # Script khởi động server
├── routes/                         # Các tệp định tuyến (Router)
│   ├── index.js                    # Route chính
│   ├── auth.js                     # Route xác thực (đăng ký, đăng nhập)
│   ├── events.js                   # Route sự kiện
│   ├── organizations.js            # Route tổ chức
│   ├── volunteers.js               # Route tình nguyện viên
│   ├── payments.js                 # Route thanh toán
│   ├── moderation.js               # Route kiểm duyệt
│   ├── admin.js                    # Route quản trị viên
│   ├── organizer.js                # Route nhà tổ chức
│   ├── health.js                   # Route kiểm tra sức khỏe server
│   └── ...
├── controllers/                    # Các tệp xử lý logic backend
│   ├── authController.js           # Logic xác thực
│   ├── eventController.js          # Logic sự kiện
│   ├── organizationController.js   # Logic tổ chức
│   ├── volunteerController.js      # Logic tình nguyện viên
│   ├── paymentController.js        # Logic thanh toán
│   ├── moderationController.js     # Logic kiểm duyệt
│   ├── adminController.js          # Logic quản trị
│   ├── organizerController.js      # Logic nhà tổ chức
│   └── ...
├── schemas/                        # Định nghĩa Mongoose models
│   ├── AppUser.js
│   ├── Event.js
│   ├── Organization.js
│   ├── Volunteer.js
│   ├── EventRegistration.js
│   └── ...
├── utils/                          # Các lệnh tính năng hỗ trợ
│   ├── authHandler.js              # Xử lý JWT token và xác thực
│   ├── mongo.js                    # Tiếp tục với MongoDB (toObjectId, toPlain)
│   ├── mongo-connection.js         # Kết nối MongoDB
│   ├── models.js                   # Export models
│   └── ...
├── scripts/                        # Các script help
│   ├── db-seed.js                  # Tạo dữ liệu mẫu
│   ├── db-reset.js                 # Xóa toàn bộ dữ liệu
│   ├── db-generate.js              # Tạo dữ liệu ngẫu nhiên
│   └── smoke-test.js               # Kiểm tra cơ bản
├── public/                         # Static files (CSS, JS, images)
├── uploads/                        # Thư mục lưu trữ tệp tải lên
└── README.md                       # Hướng dẫn dự án
```

## 🔄 Luồng Hoạt Động (Architecture Flow)

### 1. Quy Trình Xử Lý Request

```
Client HTTP Request
    ↓
Express Middleware (logger, parser, auth)
    ↓
routes/xxx.js (Route Handler)
    ↓
Kiểm tra Middleware (CheckLogin)
    ↓
controllers/xxxController.js (Get dữ liệu từ Database)
    ↓
schemas/*.js (Mongoose Query)
    ↓
MongoDB Database
    ↓
Trả về dữ liệu
    ↓
Route gửi Response
    ↓
HTTP Response trả cho Client
```

### 2. Mô Hình Controller - Route

**Controller:** Chứa logic xử lý dữ liệu
- Không xử lý HTTP request/response trực tiếp
- Export object với các function
- Mỗi function nhận tham số cần thiết
- Trả về data hoặc throw error

**Route:** Điều hướng và xử lý HTTP
- Nhận request từ client
- Gọi controller function với tham số từ request
- Gửi response về client
- Xử lý error thông qua middleware

### Ví Dụ: Xác Thực Người Dùng

**Controller (authController.js):**
```javascript
module.exports = {
  Register: async function (email, fullName, phone, password, role) {
    // Validate input
    if (!email || !fullName || !password) {
      throw { status: 400, message: 'Required fields missing' };
    }
    
    // Check existing email
    const existing = await models.appUser.findOne({ email });
    if (existing) {
      throw { status: 409, message: 'Email already registered' };
    }
    
    // Create user
    const user = await models.appUser.create({ email, fullName, ... });
    
    // Create token
    const token = authHandler.createAuthToken({ userId: user.id, ... });
    
    // Return data (không dùng res.send)
    return { token, user: { ... } };
  }
};
```

**Route (routes/auth.js):**
```javascript
router.post("/register", async function (req, res, next) {
  try {
    // Gọi controller
    const result = await authController.Register(
      req.body.email,
      req.body.fullName,
      req.body.phone,
      req.body.password,
      req.body.role
    );
    
    // Set cookie
    res.cookie(authHandler.AUTH_COOKIE_NAME, result.token, { ... });
    
    // Trả response
    res.status(201).send({ user: result.user });
  } catch (error) {
    next(error);  // Pass to error handler
  }
});
```

### 3. Error Handling

Controller throws error object:
```javascript
throw { status: 400, message: 'Invalid input' };
throw { status: 404, message: 'Not found' };
throw { status: 409, message: 'Conflict' };
```

Route catches và chuyển đến middleware error handler trong `app.js`

## 🚀 Cách Chạy Ứng Dụng

### 1. Cài Đặt Dependencies

```bash
cd TinhNguyenXanh-nodejs
npm install
```

### 2. Cấu Hình Environment

Tạo file `.env` ở thư mục gốc:
```
MONGODB_URI=mongodb://localhost:27017/tinhnguyenxanh
NODE_ENV=development
PORT=3000
```

### 3. Khởi Động Server

```bash
# Chế độ development
npm start

# Hoặc sử dụng nodemon để tự restart khi thay đổi code
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

### 4. Kiểm Tra Server

```bash
# Health check
curl http://localhost:3000/api/v1/health

# Response:
# {
#   "status": "ok",
#   "timestamp": "2024-01-15T10:30:00.000Z"
# }
```

## 📊 Quy Trình Xác Thực (Authentication Flow)

### Đăng Ký Tài Khoản
```
POST /api/v1/register
Request: { email, fullName, phone, password, role }
Response: { user: {...}, token: "jwt_token" }
```

### Đăng Nhập
```
POST /api/v1/login
Request: { email, password }
Response: { user: {...}, token: "jwt_token" }
```

### Xác Minh Người Dùng Đã Đăng Nhập
- Token được lưu trong HTTP-only cookie
- Middleware `CheckLogin` kiểm tra token
- `req.authUser` chứa thông tin người dùng

```javascript
// Ví dụ trong route
router.get("/profile", authHandler.CheckLogin, async function (req, res, next) {
  // req.authUser = { userId, email, role }
  const user = await authController.GetProfile(req.authUser.userId);
  res.send({ user });
});
```

## 🎯 Các API Chính

### Authentication
- `POST /api/v1/register` - Đăng ký tài khoản mới
- `POST /api/v1/login` - Đăng nhập
- `POST /api/v1/logout` - Đăng xuất
- `GET /api/v1/profile` - Lấy info người dùng (cần login)
- `PUT /api/v1/profile` - Cập nhật info người dùng (cần login)

### Events
- `GET /api/v1/events` - Lấy danh sách sự kiện
- `GET /api/v1/events/:id` - Lấy chi tiết sự kiện
- `POST /api/v1/events/:id/register` - Đăng ký sự kiện (cần login)
- `POST /api/v1/events/:id/favorite` - Yêu thích/bỏ yêu thích sự kiện (cần login)

### Organizations
- `GET /api/v1/organizations` - Lấy danh sách tổ chức
- `GET /api/v1/organizations/:id` - Lấy chi tiết tổ chức
- `POST /api/v1/organizations` - Tạo tổ chức mới (cần login)

### Admin
- `GET /api/v1/admin/dashboard` - Dashboard (cần admin role)
- `GET /api/v1/admin/event-approvals` - Danh sách phê duyệt sự kiện
- `PUT /api/v1/admin/events/:id/approve` - Phê duyệt sự kiện
- `PUT /api/v1/admin/events/:id/reject` - Từ chối sự kiện

### Organizer
- `GET /api/v1/organizer/dashboard` - Dashboard (cần organizer role)
- `GET /api/v1/organizer/events` - Danh sách sự kiện của nhà tổ chức
- `POST /api/v1/organizer/events` - Tạo sự kiện mới
- `GET /api/v1/organizer/volunteers` - Danh sách tình nguyện viên đăng ký

## 📚 Các Tệp Quan Trọng

### app.js
- Cấu hình middleware cho Express
- Đăng ký các router
- Xử lý error global

### utils/authHandler.js
- `CheckLogin` middleware: kiểm tra JWT token
- `createAuthToken()`: tạo JWT token mới

### utils/models.js
- Export Mongoose models từ schemas
- Cung cấp interface thống nhất để truy cập models

### utils/mongo.js
- `toObjectId()`: chuyển string sang MongoDB ObjectId
- `toPlain()`: chuyển Mongoose document sang plain object, convert _id → id

## 🔐 Bảo Mật

### JWT Token
- Được lưu trong HTTP-only cookie (bảo vệ khỏi XSS)
- Mặc định hết hạn sau 7 ngày
- Sử dụng HS256 algorithm

### Xác Minh Quyền Hạn
```javascript
// Trong controller, kiểm tra req.authUser.role
if (req.authUser.role !== 'Admin') {
  throw { status: 403, message: 'Unauthorized' };
}
```

## 🗂️ Scripts Trong package.json

```json
{
  "scripts": {
    "start": "node bin/www",
    "dev": "nodemon bin/www",
    "test": "jest",
    "seed": "node scripts/db-seed.js",
    "reset": "node scripts/db-reset.js"
  }
}
```

- `npm start`: Chạy server
- `npm run dev`: Chạy với nodemon (auto-reload)
- `npm run seed`: Tạo dữ liệu mẫu
- `npm run reset`: Xóa tất cả dữ liệu

## 📝 Hướng Dẫn Thêm Controller Mới

1. **Tạo file controller** tại `controllers/newController.js`
```javascript
module.exports = {
  GetSomething: async function (param1, param2) {
    // Logic xử lý
    return { data: ... };
  },
  CreateSomething: async function (param1, param2) {
    // Validate
    if (!param1) throw { status: 400, message: '...' };
    
    // Create
    const item = await models.something.create({ ... });
    
    // Return
    return { message: 'Created', item };
  }
};
```

2. **Tạo/cập nhật route** tại `routes/xxxxx.js`
```javascript
const express = require("express");
const router = express.Router();
const authHandler = require("../utils/authHandler");
const xxxController = require("../controllers/xxxController");

router.get("/xxxxx", async function (req, res, next) {
  try {
    const result = await xxxController.GetSomething(req.query.param1);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

3. **Đăng ký route** trong `app.js`
```javascript
const xxxxxRouter = require('./routes/xxxxx');
app.use('/api/v1', xxxxxRouter);
```

## 🐛 Debugging

### Xem logs
```bash
# Tất cả logs
npm run dev

# Chỉ error logs
npm run dev 2>&1 | grep -i error
```

### Test API
```bash
# Dùng curl
curl -X GET http://localhost:3000/api/v1/events

# Hoặc dùng Postman
# Import URL: http://localhost:3000/api/v1/...
```

### Database
```bash
# Connect MongoDB
mongodb://localhost:27017/tinhnguyenxanh

# Xem dữ liệu
db.appusers.find()
db.events.find()
```

## 📌 Tổng Kết

- **Routes**: Điều hướng HTTP requests
- **Controllers**: Xử lý logic và dữ liệu
- **Schemas**: Định nghĩa MongoDB models
- **Utils**: Hàm tiện ích (auth, mongo, etc)
- **Error Handling**: Throw trong controller, catch trong route, xử lý trong middleware

Cấu trúc này giúp code dễ bảo trì, mở rộng, và test hơn! ✅
