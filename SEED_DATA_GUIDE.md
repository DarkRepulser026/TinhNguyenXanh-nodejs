# 📊 Enhanced Seed Data Guide

Hướng dẫn tạo dữ liệu test đầy đủ cho hệ thống Tinh Nguyen Xanh

## 🎯 Tính năng Mới

### Dữ liệu được tạo:
- **3 Volunteers** bao gồm: Hồ sơ, hoạt động, giờ tình nguyện
- **3 Organizations** với thông tin chi tiết và xác minh
- **7 Event Categories**: Environment, Education, Healthcare, Community Support, Sports, Arts & Culture, Tech
- **18 Events** được phân phối trên các tổ chức
- **36+ Event Registrations** với các trạng thái khác nhau
- **18+ Event Ratings & Reviews** (3-5 sao)
- **18+ Event Comments** (Q&A trước sự kiện)
- **9+ Organization Reviews**

### Hình ảnh & Avatar:
- **DiceBear API**: Tạo avatars độc nhất cho mỗi user/org
- **Picsum Photos API**: Random background images cho events
- **Public APIs**: Không cần tải file ảnh thêm

## 🚀 Cách Sử Dụng

### 1️⃣ Reset Database + Seed Dữ Liệu
```bash
npm run db-reset
npm run db-seed
```

### 2️⃣ Chỉ Generate Schema (không xóa dữ liệu)
```bash
npm run db-generate
```

## 📋 Package.json Scripts (Cập Nhật)

Thêm hoặc cập nhật các script này vào `package.json`:

```json
{
  "scripts": {
    "db-generate": "node scripts/db-generate.js",
    "db-reset": "node scripts/db-reset.js",
    "db-seed": "node scripts/db-seed.js"
  }
}
```

## 👤 Test Users (Cơ Bản)

| Email | Password | Role | Tên |
|-------|----------|------|-----|
| admin1@tinhnguyenxanh.local | Admin12345 | Admin | System Admin 1 |
| admin2@tinhnguyenxanh.local | Admin12345 | Admin | System Admin 2 |
| organizer1@tinhnguyenxanh.local | Organizer12345 | Organizer | Organizer 1 |
| organizer2@tinhnguyenxanh.local | Organizer12345 | Organizer | Organizer 2 |
| organizer3@tinhnguyenxanh.local | Organizer12345 | Organizer | Organizer 3 |
| volunteer1@tinhnguyenxanh.local | Volunteer12345 | Volunteer | Nguyễn Văn An |
| volunteer2@tinhnguyenxanh.local | Volunteer12345 | Volunteer | Trần Thị Bích Liên |
| volunteer3@tinhnguyenxanh.local | Volunteer12345 | Volunteer | Phạm Công Cường |

## 🏢 Organizations Tạo

### 1. Tinh Nguyen Xanh Community
- **City**: Ho Chi Minh City (District 1)
- **Type**: Non-profit
- **Events**: 6-9 environment & education events

### 2. Education For All Foundation
- **City**: Hanoi (Hoan Kiem)
- **Type**: Non-profit
- **Events**: 6-9 education & tech events

### 3. Health & Wellness Foundation
- **City**: Da Nang (Hai Chau)
- **Type**: NGO
- **Events**: 6-9 healthcare & community support events

## 📅 Events Theo Danh Mục

### 🌍 Environment (5 events)
- Urban Park Clean-up Drive
- Tree Planting Initiative
- River & Canal Cleanup Campaign
- Beach Cleanup & Ocean Conservation
- Community Garden Setup

### 📚 Education (5 events)
- Weekend English Tutoring Classes
- STEM Workshop Series
- Computer Literacy Training
- Middle School Mentorship Program
- English Speaking Club

### 🏥 Healthcare (4 events)
- Community Health Screening Camp
- Mental Health Awareness Workshop
- First Aid Certification Training
- Senior Health & Fitness Program

### 👥 Community Support (4 events)
- Community Meal Distribution
- Elderly Care & Companionship Visit
- Homeless Support & Outreach
- Community Kitchen & Cooking Class

### ⚽ Sports (3 events)
- Community Sports Day Fitness Fest
- Kids Football & Soccer Training
- Marathon & Fun Run Organization

### 🎨 Arts & Culture (3 events)
- Community Mural Art Project
- Cultural Festival Volunteer Team
- Art Workshop for Children

### 💻 Tech & Innovation (2 events)
- Digital Skills Workshop
- Website Design Workshop

## 📊 Dữ Liệu Thống Kê

### Users:
- ✅ **2 Admins** (admin1, admin2)
- ✅ **3 Organizers** (organizer1, organizer2, organizer3)
- ✅ **3 Volunteers** (volunteer1, volunteer2, volunteer3)

### Organizations:
- ✅ **3 Organizations** (1 per organizer)
- ✅ **18 Events** (6 events per organization)
- ✅ **36+ Registrations** (2-5 per event)
- ✅ **18+ Ratings** (1-4 per event)
- ✅ **18+ Comments** (2-5 per event)
- ✅ **9+ Organization Reviews** (2-5 per organization)

Mỗi volunteer có:
- ✅ Hours Completed: 5-150 giờ (random)
- ✅ Events Joined: 1-20 sự kiện
- ✅ Avatar: Generated từ DiceBear API
- ✅ Bio: Custom biography
- ✅ Join Date: Random từ 30-365 ngày trước

Mỗi event có:
- ✅ Status: Approved/Pending (80% approved)
- ✅ Current Volunteers: Random từ 5 đến max
- ✅ Image: Random từ Picsum Photos
- ✅ Location: Thuộc thành phố tương ứng

Mỗi registration có:
- ✅ Status: Pending/Approved/Rejected/Completed
- ✅ Reason: Lý do tham gia (thích hợp)

## 🖼️ Xử Lý Hình Ảnh

### Avatar API (DiceBear)
```
https://api.dicebear.com/7.x/avataaars/svg?seed={email}
```

### Event Images (Picsum)
```
https://picsum.photos/600/400?random={index}&blur=1
```

### Org Header Images
```
https://picsum.photos/1200/400?random={index}&blur=2
```

**Ưu điểm:**
- ✅ Không cần upload tệp
- ✅ URL luôn khả dụng
- ✅ Avatar nhất quán per user
- ✅ Image random nhưng chất lượng cao

## 🔄 Quy Trình Seed

1. **Create Users** (2 Admins + 3 Organizers + 3 Volunteers)
2. **Create Volunteer Profiles** với avatar & stats
3. **Create Categories** (7 loại)
4. **Create Organizations** với member permissions
5. **Create Events** (18) phân phối trên orgs
6. **Create Registrations** (36+) với trạng thái realistic
7. **Create Ratings** (18+) 3-5 sao
8. **Create Comments** (18+) Q&A trước sự kiện
9. **Create Org Reviews** (9+) đánh giá tổ chức

## 🧪 Testing Endpoints

Sau khi seed, bạn có thể test:

```bash
# Lấy tất cả events
curl http://localhost:3000/api/v1/events?page=1&pageSize=20

# Lấy organization
curl http://localhost:3000/api/v1/organizations?page=1&pageSize=10

# Lấy event comments
curl http://localhost:3000/api/v1/events/{eventId}/comments

# Lấy event ratings
curl http://localhost:3000/api/v1/events/{eventId}/ratings

# Lấy volunteer profile
curl http://localhost:3000/api/v1/volunteers/{volunteerId}/profile \
  -H "Authorization: Bearer {token}"
```

## ⚠️ Ghi Chú Quan Trọng

1. **Database URL**: Đảm bảo `.env` hoặc `.env.local` có `DATABASE_URL` hoặc `MONGO_URI`
2. **Net Connection**: Cần internet để tải DiceBear & Picsum images
3. **Scripting**: Tất cả scripts tự động ngắt kết nối MongoDB
4. **Idempotent**: Chạy lại script không tạo duplicates (upsert logic)

## 🆘 Troubleshooting

### Lỗi: "DATABASE_URL is required"
```bash
# Kiểm tra file .env
cat .env

# Hoặc set environment variable
export DATABASE_URL=mongodb://localhost:27017/tinhnguyenxanh
```

### Lỗi: "No schema files found"
```bash
# Đảm bảo schema files tồn tại
ls schemas/
# Kết quả phải có: *.js files
```

### Hình ảnh không load
- Kiểm tra kết nối internet
- DiceBear API: https://www.dicebear.com/
- Picsum Photos: https://picsum.photos/

### Events không hiển thị
```bash
# Kiểm tra status = 'approved'
# Event cần có categoryId, organizationId, title, description
```

## 📝 Tiếp Theo

1. Chạy `npm run db-setup` để tạo full dataset
2. Khởi động server: `npm start`
3. Login với test user
4. Explore events, registrations, ratings
5. Test API endpoints

---

**Version**: 1.1 | **Last Updated**: 2024 | **Contributors**: Development Team
