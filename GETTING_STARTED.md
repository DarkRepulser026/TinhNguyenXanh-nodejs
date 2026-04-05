# 🚀 Hướng Dẫn Chạy Toàn Bộ Ứng Dụng

## ✅ Yêu Cầu Trước Khi Bắt Đầu

- **Node.js** >= 16.x
- **npm** >= 8.x  
- **MongoDB** (local hoặc cloud)
- **Git** (tuỳ chọn)

## 🔧 Setup Lần Đầu

### 1. Cài Đặt Dependencies

```bash
cd TinhNguyenXanh-nodejs
npm install
```

### 2. Cấu Hình Environment

Tạo file `.env` ở thư mục gốc:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/tinhnguyenxanh

# Server
PORT=3000
NODE_ENV=development

# JWT (tuỳ chọn)
JWT_SECRET=your-secret-key-here
```

**Hoặc dùng MongoDB Atlas Cloud:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tinhnguyenxanh?retryWrites=true&w=majority
```

### 3. Kiểm Tra MongoDB

```bash
# Local MongoDB
mongod

# Hoặc test connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('✅ MongoDB connected')).catch(err => console.error('❌ Error:', err))"
```

## 🏃 Chạy Ứng Dụng

### Tùy Chọn 1: Frontend + Backend Riêng Biệt (Development)

**Terminal 1 - Backend (Port 3000):**
```bash
npm start
# hoặc
npm run dev:backend
```

Output:
```
VolunteerHub API is running on port 3000
Connected to MongoDB
```

**Terminal 2 - Frontend (Port 5173):**
```bash
npm run dev:frontend
```

Output:
```
  VITE v5.4.21  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Truy cập:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1

### Tùy Chọn 2: Production (Frontend + Backend Một Server)

**Bước 1: Build Frontend**
```bash
npm run build:frontend
```

Folder `dist/` được tạo với tất cả file HTML/CSS/JS đã build.

**Bước 2: Chạy Server (Serve cả Frontend)**
```bash
NODE_ENV=production npm start
```

**Truy cập:**
- Tất cả: http://localhost:3000

## 📋 Các Lệnh Hữu Ích

| Lệnh | Mô Tả |
|------|-------|
| `npm start` | Chạy backend |
| `npm run dev:backend` | Backend dev mode (nodemon auto-reload) |
| `npm run dev:frontend` | Frontend dev mode (Vite HMR) |
| `npm run build:frontend` | Build frontend cho production |
| `npm run preview` | Preview production build |
| `npm run db:seed` | Tạo dữ liệu mẫu |
| `npm run db:reset` | Xóa phần dữ liệu cũ |
| `npm run db:generate` | Tạo dữ liệu ngẫu nhiên |
| `npm run smoke:test` | Test toàn bộ API |

## 🧪 Kiểm Tra Hệ Thống

### 1. Health Check

```bash
curl http://localhost:3000/api/v1/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 2. Test API - Register

```bash
curl -X POST http://localhost:3000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "password": "password123",
    "phone": "0123456789",
    "role": "Volunteer"
  }'
```

### 3. Test API - Login

```bash
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Test API - Get Events

```bash
curl http://localhost:3000/api/v1/events
```

## 🎨 Frontend Features

- ✅ Home page với hero section
- ✅ Events listing page
- ✅ Organizations listing page
- ✅ Login/Register pages
- ✅ Navigation header & footer
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

## 🛠️ Cấu Trúc Entry Points

```
Backend Entry: bin/www
  ↓
app.js (Express config)
  ↓
routes/*.js → controllers/*.js → schemas/*.js → MongoDB

Frontend Entry: public/index.html
  ↓
public/main.tsx (React)
  ↓
App.tsx → Routes → Pages/Components
  ↓
Vite dev server (port 5173) → http://localhost:3000/api
```

## 🌐 API Endpoints Chính

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/v1/health` | Check server status |
| POST | `/api/v1/register` | Register new user |
| POST | `/api/v1/login` | Login |
| GET | `/api/v1/profile` | Get user profile (cần auth) |
| GET | `/api/v1/events` | Get all events |
| GET | `/api/v1/organizations` | Get all organizations |

**Xem đầy đủ:** [ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md#-các-api-chính)

## 🔐 Authentication

### Cookies
- Token được lưu trong **HTTP-only cookie**
- Tự động gửi với requests
- Bảo vệ khỏi XSS attacks

### Headers
- Mỗi request đã auth tự động gửi cookie
- Không cần thêm Authorization header

### Per-Request (nếu cần)
```typescript
const response = await axios.get('/api/v1/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## 🐛 Troubleshooting

### MongoDB Connection Failed
```
❌ Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Giải pháp:**
- Bắt đầu MongoDB: `mongod`
- Hoặc sử dụng MongoDB Atlas cloud
- Kiểm tra `MONGODB_URI` trong `.env`

### Frontend không load (port 5173)
```
❌ Error: Cannot find module 'vite'
```

**Giải pháp:**
- Run: `npm install`
- Run: `npm run dev:frontend`

### API calls từ Frontend fail
```
❌ 404 Not Found
```

**Kiểm tra:**
1. Backend đang chạy? `npm start`
2. Port 3000 available?
3. API endpoint đúng? `/api/v1/...`

### Hot Reload không hoạt động
- Frontend (Vite): Tự động refresh browser
- Backend (Nodemon): Tự động restart server

## 📊 Database Management

### Seed Sample Data
```bash
npm run db:seed
```

### Reset Database
```bash
npm run db:reset
```

### Generate Random Data
```bash
npm run db:generate
```

## 🎯 Workflow Tiêu Biểu

1. **Khởi động:**
   ```bash
   # Terminal 1
   npm start
   
   # Terminal 2
   npm run dev:frontend
   ```

2. **Truy cập ứng dụng:**
   - http://localhost:5173

3. **Đăng ký / Đăng nhập:**
   - Tạo tài khoản mới
   - Backend tạo user trong MongoDB

4. **Truy cập resources:**
   - View events
   - View organizations
   - Register events

5. **Production:**
   ```bash
   npm run build:frontend
   NODE_ENV=production npm start
   ```

## 🚀 Deployment

### Heroku / Railway / Vercel

**package.json start script:**
```json
"start": "node bin/www"
```

**Vite build được tracking trong git:**
```bash
npm run build:frontend
git add dist/
git commit -m "Build frontend"
```

**Environment variables cần setup:**
- `MONGODB_URI`
- `NODE_ENV=production`

## 📚 Tài Liệu Tham Khảo

- [ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md) - Cấu trúc chi tiết
- [REFACTOR_GUIDE.md](REFACTOR_GUIDE.md) - Controller pattern
- [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) - Frontend dev guide
- [CHANGELOG.md](CHANGELOG.md) - Lịch sử thay đổi

## 💡 Tips & Tricks

1. **Monitor file changes:**
   ```bash
   # Dev mode auto-reload
   npm start
   ```

2. **Check DB directly:**
   ```bash
   mongo
   use tinhnguyenxanh
   db.appusers.find()
   ```

3. **Clear node_modules:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **View server logs:**
   ```bash
   # Tìm dòng "API is running"
   npm start 2>&1 | grep -i "running\|error"
   ```

## ✅ Ready to Go!

- ✅ Backend structure (Controllers + Routes)
- ✅ Frontend setup (React + Vite)
- ✅ Database connection (MongoDB)
- ✅ API integration
- ✅ Authentication
- ✅ Responsive UI

**Hãy bắt đầu phát triển! 🎉**

```bash
# Step 1: Backend
npm start

# Step 2: Frontend (new terminal)
npm run dev:frontend

# Step 3: Truy cập http://localhost:5173
```
