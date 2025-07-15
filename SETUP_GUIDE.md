# Hướng dẫn Setup Chi tiết - NaCinema

## 📋 Mục lục
1. [Setup MongoDB Atlas](#setup-mongodb-atlas)
2. [Cài đặt Development Environment](#cài-đặt-development-environment)
3. [Chạy Project trên VS Code](#chạy-project-trên-vs-code)
4. [Troubleshooting](#troubleshooting)
5. [Database Structure](#database-structure)

## 🗄️ Setup MongoDB Atlas

### Bước 1: Tạo Account MongoDB Atlas
1. Truy cập [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Đăng ký tài khoản miễn phí
3. Tạo cluster mới (chọn M0 Sandbox - Free tier)

### Bước 2: Cấu hình Database
1. **Tạo Database User:**
   - Vào Database Access → Add New Database User
   - Username: `admin` (hoặc tùy chọn)
   - Password: tạo password mạnh
   - Database User Privileges: `Atlas admin`

2. **Cấu hình Network Access:**
   - Vào Network Access → Add IP Address
   - Chọn "Allow access from anywhere" (0.0.0.0/0)
   - Hoặc thêm IP cụ thể cho bảo mật cao hơn

3. **Lấy Connection String:**
   - Vào Clusters → Connect → Connect your application
   - Chọn Node.js và phiên bản 4.1 or later
   - Copy connection string có dạng:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/databasename?retryWrites=true&w=majority
   ```

### Bước 3: Cấu hình Environment Variables
Tạo file `.env` trong thư mục root:
```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster.mongodb.net/nacinema?retryWrites=true&w=majority

# JWT Secret (thay đổi để bảo mật)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

# Development Settings
NODE_ENV=development
PORT=5000
```

## 🛠️ Cài đặt Development Environment

### Yêu cầu hệ thống
- **Node.js**: 18.0.0 hoặc cao hơn
- **NPM**: 9.0.0 hoặc cao hơn
- **VS Code**: Phiên bản mới nhất
- **Git**: Để clone repository

### Bước 1: Clone và cài đặt
```bash
# Clone repository
git clone <repository-url>
cd movie-ticket-booking

# Cài đặt dependencies
npm install

# Verify installation
npm run check
```

### Bước 2: Cài đặt VS Code Extensions
Mở VS Code và cài đặt các extensions khuyến nghị:
- **Tailwind CSS IntelliSense**: Hỗ trợ autocomplete cho Tailwind
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **TypeScript Hero**: TypeScript support nâng cao
- **Auto Rename Tag**: Tự động đổi tên tag HTML
- **Path Intellisense**: Autocomplete cho đường dẫn file
- **MongoDB for VS Code**: Quản lý MongoDB database

## 🚀 Chạy Project trên VS Code

### Cách 1: Sử dụng Integrated Terminal
1. Mở VS Code
2. Mở terminal (`Ctrl + \``)
3. Chạy lệnh:
```bash
npm run dev
```

### Cách 2: Sử dụng Tasks
1. Nhấn `Ctrl + Shift + P`
2. Gõ "Tasks: Run Task"
3. Chọn "Start Development Server"

### Cách 3: Sử dụng Debug Mode
1. Vào Debug panel (`Ctrl + Shift + D`)
2. Chọn "Launch Server"
3. Nhấn F5 để start với debugging

### Kiểm tra kết quả
- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api/movies
- **Database**: Kiểm tra MongoDB Atlas dashboard

## 🔧 Troubleshooting

### 1. Lỗi MongoDB Connection
```
Error: MongooseError: The `uri` parameter to `openUri()` must be a string
```
**Giải pháp:**
- Kiểm tra `MONGODB_URI` trong file `.env`
- Đảm bảo không có ký tự đặc biệt chưa được encode
- Thử connection string trên MongoDB Compass

### 2. Lỗi JWT Token
```
Error: jwt malformed
```
**Giải pháp:**
- Xóa localStorage trong browser (F12 → Application → Local Storage)
- Restart server
- Đảm bảo `JWT_SECRET` đủ dài (tối thiểu 32 ký tự)

### 3. Lỗi Port đã được sử dụng
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Giải pháp:**
```bash
# Tìm process đang dùng port 5000
lsof -ti:5000

# Kill process
kill -9 <process-id>

# Hoặc thay đổi port trong server/index.ts
```

### 4. Lỗi Dependencies
```
Error: Cannot find module '@/components/ui/button'
```
**Giải pháp:**
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install

# Kiểm tra path mappings trong tsconfig.json
```

### 5. Lỗi MongoDB Atlas Network
```
Error: MongoNetworkError: connection refused
```
**Giải pháp:**
- Kiểm tra Network Access trong MongoDB Atlas
- Thêm IP address hiện tại vào whitelist
- Hoặc cho phép truy cập từ mọi IP (0.0.0.0/0)

### 6. Build errors
```
Error: Cannot resolve module
```
**Giải pháp:**
```bash
# Clear cache và rebuild
npm run clean
npm run build

# Kiểm tra import paths
```

## 📊 Database Structure

### Collections Overview
```
cinemabook/
├── users           # Thông tin người dùng
├── movies          # Danh sách phim
├── cinemas         # Thông tin rạp chiếu
├── rooms           # Phòng chiếu
├── showtimes       # Suất chiếu
├── tickets         # Vé đã đặt
├── reviews         # Đánh giá phim
└── promotions      # Mã khuyến mãi
```

### Sample Data Structure

#### Users Collection
```json
{
  "_id": ObjectId,
  "username": "admin",
  "email": "admin@cinemabook.vn",
  "password": "$2b$10$...",
  "role": "admin",
  "fullName": "Administrator",
  "phone": "+84123456789",
  "createdAt": ISODate
}
```

#### Movies Collection
```json
{
  "_id": ObjectId,
  "title": "Fast & Furious X",
  "description": "Dom Toretto và gia đình...",
  "genre": "Hành động",
  "duration": 141,
  "ageRating": "T16",
  "posterUrl": "https://example.com/poster.jpg",
  "trailerUrl": "https://youtube.com/watch?v=...",
  "director": "Louis Leterrier",
  "actors": ["Vin Diesel", "Michelle Rodriguez"],
  "status": "active",
  "createdAt": ISODate
}
```

#### Tickets Collection
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "showtimeId": ObjectId,
  "seats": ["A1", "A2"],
  "totalPrice": "200000",
  "customerName": "Nguyễn Văn A",
  "customerEmail": "customer@email.com",
  "customerPhone": "+84987654321",
  "paymentMethod": "card",
  "promotionCode": "STUDENT10",
  "bookingCode": "BK123456",
  "status": "confirmed",
  "createdAt": ISODate
}
```

## 🔐 Security Considerations

### Production Environment
```env
# Production .env example
NODE_ENV=production
MONGODB_URI=mongodb+srv://prod_user:strong_password@production-cluster.mongodb.net/cinemabook_prod?retryWrites=true&w=majority
JWT_SECRET=super-long-secure-jwt-secret-for-production-use-at-least-64-characters
PORT=5000
```

### Best Practices
1. **Environment Variables**: Không commit file `.env` vào git
2. **JWT Secret**: Sử dụng secret key dài và phức tạp
3. **MongoDB**: Tạo user riêng với quyền hạn tối thiểu
4. **HTTPS**: Sử dụng HTTPS trong production
5. **Input Validation**: Luôn validate input từ client

## 📝 Development Tips

### VS Code Shortcuts
- `Ctrl + Shift + P`: Command palette
- `Ctrl + \``: Toggle terminal
- `F5`: Start debugging
- `Ctrl + Shift + D`: Debug view
- `Ctrl + Shift + E`: Explorer view
- `Ctrl + Shift + F`: Global search

### Hot Reload
Project sử dụng Vite cho hot reload:
- Frontend: Tự động reload khi có thay đổi
- Backend: Sử dụng `tsx` với watch mode
- Database: Không cần restart khi thay đổi schema

### Code Organization
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components (routes)
├── lib/           # Utilities & configurations
├── hooks/         # Custom React hooks
└── types/         # TypeScript type definitions
```

## 🚢 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
1. **Development**: MongoDB Atlas (free tier)
2. **Staging**: MongoDB Atlas (shared cluster)
3. **Production**: MongoDB Atlas (dedicated cluster)

---

**Lưu ý quan trọng:**
- Luôn backup database trước khi deploy
- Test đầy đủ trên môi trường staging
- Monitor logs và performance metrics
- Cập nhật dependencies thường xuyên

Nếu gặp vấn đề không có trong guide này, hãy tạo issue trên GitHub repository.