# 🌿 Tình Nguyện Xanh - VolunteerHub

Nền tảng kết nối tình nguyện viên với các tổ chức cộng đồng.

---

## 🚀 Bắt Đầu Nhanh

### 1️⃣ Cài Đặt Dependencies
```bash
npm install
```

### 2️⃣ Cấu Hình Environment
Tạo file `.env`:
```
MONGODB_URI=mongodb://localhost:27017/tinhnguyenxanh
NODE_ENV=development
PORT=3000
```

### 3️⃣ Chạy Backend (Terminal 1)
```bash
npm start
```
→ http://localhost:3000

### 4️⃣ Chạy Frontend (Terminal 2)
```bash
npm run dev:frontend
```
→ http://localhost:5173

---

## 📚 Full Documentation

- 📖 [QUICK_START.md](QUICK_START.md) - Quick reference
- 📖 [GETTING_STARTED.md](GETTING_STARTED.md) - Complete guide
- 📖 [ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md) - Backend architecture
- 📖 [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) - Frontend development
- 📖 [REFACTOR_GUIDE.md](REFACTOR_GUIDE.md) - Code patterns

---

## 🎯 Features

### Backend API
- ✅ User Authentication (Register/Login)
- ✅ Event Management
- ✅ Organization Management  
- ✅ Volunteer Registration
- ✅ Admin Dashboard
- ✅ JWT Token Security

### Frontend UI
- ✅ Responsive Design
- ✅ Home Page with Hero
- ✅ Events Listing & Details
- ✅ Organizations Directory
- ✅ Authentication Pages
- ✅ Protected Routes

---

## 🏗️ Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- RESTful API

**Frontend:**
- React 18
- Vite
- React Router v6
- Axios

---

## 📊 Cấu Trúc Thư Mục

```
├── public/              # Frontend (React + Vite)
├── controllers/         # Business logic
├── routes/             # API routes
├── schemas/            # MongoDB models
├── utils/              # Utilities
└── app.js              # Express server
```

---

## 🔗 API Endpoints

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| GET | `/api/v1/health` | Server status |
| POST | `/api/v1/register` | Register user |
| POST | `/api/v1/login` | Login |
| GET | `/api/v1/profile` | User profile |
| GET | `/api/v1/events` | List events |
| GET | `/api/v1/organizations` | List organizations |

---

## 📦 NPM Commands

```bash
npm start                 # Backend
npm run dev:frontend      # Frontend dev
npm run build:frontend    # Build production
npm run db:seed          # Seed sample data
npm run db:reset          # Reset database
```

---

## 🚀 Production

```bash
npm run build:frontend
NODE_ENV=production npm start
```

---

**Created with ❤️ for volunteers**

