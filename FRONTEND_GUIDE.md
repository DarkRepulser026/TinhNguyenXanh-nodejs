# 🎨 Frontend Development Guide

## 📦 Cấu Trúc Frontend

```
public/
├── index.html                 # Entry point HTML
├── main.tsx                   # React entry point
├── App.tsx                    # Main App component
├── App.css                    # Global styles
├── index.css                  # Base styles
│
├── contexts/                  # React Contexts
│   ├── AuthContext.tsx        # Authentication context
│   └── useAuth.ts            # Custom auth hook
│
├── components/               # Reusable components
│   ├── auth/
│   │   └── RequireAuth.tsx   # Protected route wrapper
│   └── layout/
│       ├── Header.tsx        # Navigation header
│       ├── Header.css
│       ├── Footer.tsx        # Footer component
│       └── Footer.css
│
├── pages/                    # Page components
│   ├── Home.tsx             # Home page
│   ├── Home.css
│   ├── Events.tsx           # Events listing
│   ├── Organizations.tsx    # Organizations listing
│   └── auth/
│       ├── Login.tsx        # Login page
│       ├── Register.tsx     # Registration page
│       └── Auth.css         # Auth styles
│
└── styles/                  # Global styles (optional)
    └── variables.css        # CSS variables
```

## 🚀 Development Mode

### Backend + Frontend Riêng Biệt

**Terminal 1 - Backend (port 3000):**
```bash
npm start
# hoặc
npm run dev:backend
```

**Terminal 2 - Frontend (port 5173):**
```bash
npm run dev:frontend
```

Frontend sẽ tự động proxy API calls đến backend.
```
http://localhost:5173 → Frontend
http://localhost:3000 → Backend API
```

## 🏗️ Production Build

### Build Frontend
```bash
npm run build:frontend
```

Kết quả: `dist/` folder chứa HTML/CSS/JS tối ưu

### Run Production
```bash
NODE_ENV=production npm start
```

Backend sẽ serve `dist/` folder tự động.

## 📚 Tech Stack

- **React 18** - UI framework
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool
- **TypeScript** - Type safety
- **CSS3** - Styling

## 🔐 Authentication Flow

### 1. Login
```typescript
// AuthContext.tsx
const login = async (email: string, password: string) => {
  const response = await axios.post('/api/v1/login', { email, password })
  setUser(response.data.user)
  // Token được lưu trong HTTP-only cookie tự động
}
```

### 2. Protected Routes
```typescript
// pages/MyProfile.tsx
function MyProfile() {
  return (
    <RequireAuth>
      <div>Private content</div>
    </RequireAuth>
  )
}
```

### 3. useAuth Hook
```typescript
import { useAuth } from './contexts/useAuth'

function MyComponent() {
  const { user, logout } = useAuth()
  return <span>{user?.fullName}</span>
}
```

## 🎨 Styling

### CSS Files
- `App.css` - Global styles
- `index.css` - Base/reset styles
- `components/layout/Header.css` - Header styles
- `pages/Home.css` - Page-specific styles

### CSS Variables (Optional)
```css
:root {
  --primary-color: #28a745;
  --secondary-color: #20c997;
  --danger-color: #dc3545;
}
```

## 🔗 API Integration

### Axios Setup
```typescript
import axios from 'axios'

// API base URL = http://localhost:3000 (backend)
// Proxy configured in vite.config.mjs
// All /api calls go to backend

const response = await axios.get('/api/v1/events')
```

## 📝 Adding New Page

1. Create component in `pages/`
```typescript
// pages/MyPage.tsx
export default function MyPage() {
  return <div>Page Content</div>
}
```

2. Add route in `App.tsx`
```typescript
<Route path="/mypage" element={<MyPage />} />
```

3. Add navigation in `Header.tsx`
```typescript
<Link to="/mypage">My Page</Link>
```

## 🧩 Adding New Component

1. Create component folder
```
components/
  mycomponent/
    MyComponent.tsx
    MyComponent.css
```

2. Export from component
```typescript
export default function MyComponent() {
  return <div>Component</div>
}
```

3. Use in pages
```typescript
import MyComponent from '../components/mycomponent/MyComponent'

function MyPage() {
  return <MyComponent />
}
```

## 🐛 Debugging

### React DevTools
Install: https://react-devtools-tutorial.vercel.app/

### Console Logs
```typescript
console.log('Debug:', data)  // Will show in browser DevTools
```

### Network Requests
- Open browser DevTools (F12)
- Go to Network tab
- Watch API calls to backend

### Vite HMR
Automatic hot module replacement - saves don't need full refresh

## 📊 Component Structure Pattern

```typescript
import { useState, useEffect } from 'react'
import axios from 'axios'
import './MyComponent.css'

interface DataItem {
  id: string
  name: string
}

export default function MyComponent() {
  const [data, setData] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/v1/items')
      setData(response.data.items || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="my-component">
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

## ✅ Best Practices

1. **Use TypeScript** - Type safety
2. **Custom Hooks** - Reuse logic (useAuth, useFetch)
3. **Error Handling** - Try-catch with user feedback
4. **Loading States** - Show loading indicator
5. **Lazy Loading** - React.lazy for code splitting
6. **Responsive Design** - Mobile-first approach
7. **Accessibility** - Semantic HTML, ARIA labels

## 🚨 Common Issues

### CORS Error
- Ensure backend is running on port 3000
- Check vite.config.mjs proxy configuration

### API Calls Fail
- Check browser DevTools Network tab
- Verify backend routes exist
- Check Authentication token (cookies)

### Page Not Loading
- Check React Router routes
- Verify component path is correct
- Check browser console for errors

## 📦 Dependencies

All required packages are in `package.json`:
```json
"react": "^18.3.1",
"react-dom": "^18.3.1",
"react-router-dom": "^6.30.1",
"axios": "^1.13.0"
```

Install new packages: `npm install <package-name>`

## 🎯 Next Steps

1. ✅ Setup frontend structure
2. ✅ Create pages & components
3. ✅ Implement authentication
4. ✅ Connect to backend APIs
5. 🚀 Deploy to production

Giao diện đã sẵn sàng phát triển! 🎉
