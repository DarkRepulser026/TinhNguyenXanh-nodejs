# 🎯 Quick Start - Tình Nguyện Xanh

## ⚡ Chạy Nhanh (2 Terminal)

### **Terminal 1: Backend** (port 3000)
```bash
npm start
```
Output:
```
VolunteerHub API is running on port 3000
Connected to MongoDB
```

### **Terminal 2: Frontend** (port 5173)
```bash
npm run dev:frontend
```
Output:
```
VITE v5.4.21  ready in 234 ms

➜  Local:   http://localhost:5173/
```

## 🌐 Truy Cập

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1

---

## 📦 Cấu Trúc Thư Mục

```
├── app.js                    # Express server
├── bin/www                   # Server entry
├── public/                   # React app (frontend)
│   ├── index.html           # HTML entry
│   ├── main.tsx             # React entry
│   ├── App.tsx              # App component
│   ├── contexts/            # Auth management
│   ├── components/          # UI components
│   ├── pages/               # Page components
│   └── styles/              # CSS files
├── controllers/             # Business logic
├── routes/                  # API routes
├── schemas/                 # MongoDB models
├── utils/                   # Utilities
├── vite.config.mjs          # Vite config
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

---

## 🔧 Khác Các Lệnh

| Lệnh | Mô Tả |
|------|-------|
| `npm start` | Chạy backend - development mode |
| `npm run dev:frontend` | Chạy frontend - development mode (HMR) |
| `npm run build:frontend` | Build frontend cho production |
| `npm run preview` | Preview production build |
| `npm run db:seed` | Seed sample data |
| `npm run db:reset` | Reset database |
| `npm run smoke:test` | Test API endpoints |

---

## 🚀 Production (1 Server)

### Build Frontend
```bash
npm run build:frontend
```
→ Tạo folder `dist/` với HTML/CSS/JS optimized

### Run Server
```bash
NODE_ENV=production npm start
```
→ Backend serve cả frontend từ `dist/` folder

### Truy Cập
```
http://localhost:3000
```

---

## ✅ Checklist Trước Khi Chạy

- ✅ MongoDB running hoặc connected
- ✅ `.env` file configured
- ✅ `npm install` đã chạy
- ✅ Node.js >= 16.x
- ✅ Ports 3000 & 5173 available

---

## 🆘 Troubleshooting

| Lỗi | Giải Pháp |
|------|----------|
| `Cannot find module 'vite'` | `npm install` |
| `Error: Unknown file extension ".mjs"` | Node.js >= 14.x |
| `EADDRINUSE: address already in use` | Kill process trên port hoặc change port |
| `Cannot GET /` (Backend) | Check routes registered |
| `Cannot connect to MongoDB` | Start mongod hoặc check URI |
| `Frontend not connecting to API` | Check backend running & proxy in vite.config.mjs |

---

## 📚 Documentation

- [ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md) - Backend architecture
- [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md) - Frontend development
- [REFACTOR_GUIDE.md](REFACTOR_GUIDE.md) - Code patterns
- [GETTING_STARTED.md](GETTING_STARTED.md) - Detailed setup

---

**Ready? Hãy bắt đầu!** 🚀
