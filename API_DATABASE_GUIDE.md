# 🔌 API & Database Guide - NaCinema

## 🎯 Tổng quan API Architecture

NaCinema sử dụng **RESTful API** với **Express.js** và **MongoDB** để xử lý tất cả các operations của hệ thống đặt vé phim.

---

## 📊 Database Schema (MongoDB)

### 🎬 Movies Collection
```javascript
{
  _id: ObjectId,
  title: String,           // Tên phim
  description: String,     // Mô tả phim
  genre: String,          // Thể loại
  duration: Number,       // Thời lượng (phút)
  rating: String,         // Độ tuổi (PG, PG-13, R)
  poster: String,         // URL poster
  trailer: String,        // URL trailer
  status: String,         // "active" | "coming-soon" | "inactive"
  releaseDate: Date,      // Ngày phát hành
  createdAt: Date,
  updatedAt: Date
}
```

### 👥 Users Collection
```javascript
{
  _id: ObjectId,
  username: String,       // Tên đăng nhập (unique)
  email: String,          // Email (unique)
  password: String,       // Hashed password (bcrypt)
  role: String,          // "user" | "staff" | "admin"
  fullName: String,      // Họ tên đầy đủ
  phone: String,         // Số điện thoại
  createdAt: Date,
  updatedAt: Date
}
```

### 🏢 Cinemas Collection
```javascript
{
  _id: ObjectId,
  name: String,          // Tên rạp
  address: String,       // Địa chỉ
  phone: String,         // Số điện thoại
  facilities: [String],  // Tiện ích ["parking", "food-court"]
  createdAt: Date
}
```

### 🎭 Rooms Collection
```javascript
{
  _id: ObjectId,
  cinemaId: ObjectId,    // Reference to Cinema
  name: String,          // Tên phòng chiếu
  capacity: Number,      // Sức chứa
  seatLayout: Object,    // Cấu hình ghế ngồi
  facilities: [String],  // Tiện ích phòng
  createdAt: Date
}
```

### ⏰ Showtimes Collection
```javascript
{
  _id: ObjectId,
  movieId: ObjectId,     // Reference to Movie
  roomId: ObjectId,      // Reference to Room
  startTime: Date,       // Thời gian bắt đầu
  endTime: Date,         // Thời gian kết thúc
  price: Number,         // Giá vé cơ bản
  availableSeats: Number, // Số ghế còn trống
  bookedSeats: [String], // Danh sách ghế đã đặt ["A1", "A2"]
  createdAt: Date
}
```

### 🎫 Tickets Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,      // Reference to User
  showtimeId: ObjectId,  // Reference to Showtime
  seats: [String],       // Ghế đã đặt ["A1", "A2"]
  seatTypes: [String],   // Loại ghế ["regular", "vip"]
  totalPrice: Number,    // Tổng tiền
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  paymentMethod: String, // "cash" | "card" | "momo" | "banking"
  promotionCode: String, // Mã khuyến mãi (optional)
  discount: Number,      // Số tiền giảm
  bookingCode: String,   // Mã đặt vé (unique)
  status: String,        // "pending" | "confirmed" | "cancelled"
  createdAt: Date
}
```

### ⭐ Reviews Collection
```javascript
{
  _id: ObjectId,
  movieId: ObjectId,     // Reference to Movie
  userId: ObjectId,      // Reference to User
  rating: Number,        // Điểm đánh giá (1-5)
  comment: String,       // Bình luận
  createdAt: Date
}
```

### 🎁 Promotions Collection
```javascript
{
  _id: ObjectId,
  title: String,         // Tiêu đề khuyến mãi
  description: String,   // Mô tả
  code: String,          // Mã khuyến mãi (unique)
  discountType: String,  // "percentage" | "fixed"
  discountValue: Number, // Giá trị giảm
  minPurchase: Number,   // Giá trị đơn hàng tối thiểu
  maxUsage: Number,      // Số lần sử dụng tối đa
  usedCount: Number,     // Số lần đã sử dụng
  startDate: Date,       // Ngày bắt đầu
  endDate: Date,         // Ngày kết thúc
  isActive: Boolean,     // Trạng thái hoạt động
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### 🔐 Authentication APIs

#### POST `/api/auth/register`
- **Mục đích**: Đăng ký tài khoản mới
- **Body**: `{ username, email, password, fullName, phone }`
- **Response**: `{ user, token }`

#### POST `/api/auth/login`
- **Mục đích**: Đăng nhập
- **Body**: `{ username, password }`
- **Response**: `{ user, token }`

#### POST `/api/auth/logout`
- **Mục đích**: Đăng xuất
- **Headers**: `Authorization: Bearer <token>`

---

### 🎬 Movies APIs

#### GET `/api/movies`
- **Mục đích**: Lấy danh sách phim
- **Query**: `?status=active&genre=action`
- **Response**: `Movie[]`

#### GET `/api/movies/:id`
- **Mục đích**: Lấy chi tiết phim
- **Response**: `Movie`

#### GET `/api/movies/:id/showtimes`
- **Mục đích**: Lấy lịch chiếu của phim
- **Response**: `Showtime[]`

#### GET `/api/movies/:id/reviews`
- **Mục đích**: Lấy đánh giá của phim
- **Response**: `Review[]`

#### POST `/api/movies` (Admin only)
- **Mục đích**: Thêm phim mới
- **Body**: `Movie data`

#### PUT `/api/movies/:id` (Admin only)
- **Mục đích**: Cập nhật phim
- **Body**: `Movie data`

#### DELETE `/api/movies/:id` (Admin only)
- **Mục đích**: Xóa phim

---

### 🏢 Cinemas APIs

#### GET `/api/cinemas`
- **Mục đích**: Lấy danh sách rạp chiếu
- **Response**: `Cinema[]`

#### GET `/api/cinemas/:id/rooms`
- **Mục đích**: Lấy danh sách phòng chiếu của rạp
- **Response**: `Room[]`

---

### 🎭 Rooms APIs

#### GET `/api/rooms`
- **Mục đích**: Lấy danh sách phòng chiếu
- **Response**: `Room[]`

#### GET `/api/rooms/:id`
- **Mục đích**: Lấy chi tiết phòng chiếu
- **Response**: `Room`

---

### ⏰ Showtimes APIs

#### GET `/api/showtimes`
- **Mục đích**: Lấy danh sách suất chiếu
- **Query**: `?movieId=xxx&date=2024-01-01`
- **Response**: `Showtime[]`

#### GET `/api/showtimes/:id`
- **Mục đích**: Lấy chi tiết suất chiếu
- **Response**: `Showtime`

#### GET `/api/showtimes/:id/seats`
- **Mục đích**: Lấy sơ đồ ghế ngồi
- **Response**: `{ availableSeats, bookedSeats, seatLayout }`

#### POST `/api/showtimes` (Staff/Admin)
- **Mục đích**: Tạo suất chiếu mới
- **Body**: `Showtime data`

---

### 🎫 Bookings APIs

#### POST `/api/bookings`
- **Mục đích**: Đặt vé
- **Body**: 
```javascript
{
  showtimeId: ObjectId,
  seats: ["A1", "A2"],
  customerInfo: { name, email, phone },
  paymentMethod: "card",
  promotionCode: "STUDENT10"
}
```
- **Response**: `{ booking, bookingCode }`

#### GET `/api/tickets` (User)
- **Mục đích**: Lấy danh sách vé đã đặt
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `Ticket[]`

#### GET `/api/tickets/:bookingCode`
- **Mục đích**: Lấy chi tiết vé theo mã đặt
- **Response**: `Ticket`

---

### ⭐ Reviews APIs

#### POST `/api/reviews`
- **Mục đích**: Thêm đánh giá phim
- **Body**: `{ movieId, rating, comment }`
- **Headers**: `Authorization: Bearer <token>`

#### GET `/api/reviews`
- **Mục đích**: Lấy danh sách đánh giá
- **Query**: `?movieId=xxx`

---

### 🎁 Promotions APIs

#### GET `/api/promotions/active`
- **Mục đích**: Lấy khuyến mãi đang hoạt động
- **Response**: `Promotion[]`

#### POST `/api/promotions/validate`
- **Mục đích**: Kiểm tra mã khuyến mãi
- **Body**: `{ code, totalAmount }`
- **Response**: `{ valid, discount }`

#### GET `/api/promotions` (Admin)
- **Mục đích**: Quản lý khuyến mãi

---

### 👑 Admin APIs

#### GET `/api/admin/dashboard`
- **Mục đích**: Thống kê tổng quan
- **Response**: 
```javascript
{
  totalMovies: Number,
  totalUsers: Number,
  totalBookings: Number,
  totalRevenue: Number,
  recentBookings: Booking[]
}
```

#### GET `/api/admin/users`
- **Mục đích**: Quản lý người dùng
- **Response**: `User[]`

#### GET `/api/admin/all-tickets`
- **Mục đích**: Quản lý tất cả vé
- **Response**: `Ticket[]`

#### PUT `/api/admin/tickets/:id/status`
- **Mục đích**: Cập nhật trạng thái vé
- **Body**: `{ status: "confirmed" | "cancelled" }`

---

## 🔒 Authentication & Authorization

### JWT Token Structure
```javascript
{
  id: ObjectId,      // User ID
  username: String,  // Username
  role: String,      // User role
  iat: Number,       // Issued at
  exp: Number        // Expires at
}
```

### Role-based Access Control
- **User**: Đặt vé, xem lịch sử, đánh giá phim
- **Staff**: Quản lý suất chiếu, duyệt vé
- **Admin**: Toàn quyền quản lý hệ thống

### Middleware Protection
```javascript
// Protect routes
app.use('/api/admin/*', requireAuth, requireRole('admin'));
app.use('/api/staff/*', requireAuth, requireRole(['staff', 'admin']));
app.use('/api/user/*', requireAuth);
```

---

## 🔧 Database Operations

### Connection Management
- **File**: `server/mongodb.ts`
- **Connection**: MongoDB Atlas hoặc local MongoDB
- **Features**: Connection pooling, auto-reconnect

### Data Initialization
- **Mock data**: Tự động tạo dữ liệu mẫu khi database trống
- **Indexes**: Tối ưu performance với indexes

### Error Handling
- **Validation**: Zod schemas cho data validation
- **Error responses**: Consistent error format
- **Logging**: Request/response logging

---

## 🚀 Performance Optimizations

### Database Indexes
```javascript
// Indexes for better performance
movies: { status: 1, genre: 1 }
showtimes: { movieId: 1, startTime: 1 }
tickets: { userId: 1, showtimeId: 1 }
users: { username: 1, email: 1 }
```

### API Caching
- **React Query**: Client-side caching
- **Stale-while-revalidate**: Background updates

### Data Aggregation
- **Dashboard stats**: Aggregation pipelines
- **Revenue reports**: Complex queries optimization

---

Hệ thống API được thiết kế để:
- ✅ **Scalable**: Dễ mở rộng và maintain
- ✅ **Secure**: Authentication, authorization, validation
- ✅ **Fast**: Optimized queries, caching
- ✅ **Reliable**: Error handling, logging
- ✅ **RESTful**: Standard HTTP methods và status codes
