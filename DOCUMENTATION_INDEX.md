# 📚 NaCinema - Tài liệu tổng hợp

## 🎯 Giới thiệu

**NaCinema** là hệ thống quản lý vé xem phim toàn diện được xây dựng với React, Node.js, Express và MongoDB. Dự án này cung cấp đầy đủ tính năng từ duyệt phim, đặt vé, quản lý rạp chiếu đến bảng điều khiển admin.

## 📑 Danh mục tài liệu

### 📁 Tài liệu cấu trúc dự án

| Tài liệu | Mô tả |
|----------|-------|
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Cấu trúc thư mục và file của dự án |
| [API_DATABASE_GUIDE.md](./API_DATABASE_GUIDE.md) | Chi tiết về API và Database Schema |
| [FRONTEND_COMPONENTS_GUIDE.md](./FRONTEND_COMPONENTS_GUIDE.md) | Hướng dẫn về Frontend Components |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Hướng dẫn triển khai ứng dụng |

### 📁 Tài liệu hướng dẫn sử dụng

| Tài liệu | Mô tả |
|----------|-------|
| [README.md](./README.md) | Tổng quan dự án và hướng dẫn cài đặt |
| [MANUAL_RUN_GUIDE.md](./MANUAL_RUN_GUIDE.md) | Hướng dẫn chạy thủ công |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Hướng dẫn cài đặt môi trường |
| [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) | Hướng dẫn sử dụng Docker |
| [SCRIPTS_README.md](./SCRIPTS_README.md) | Hướng dẫn sử dụng scripts |

## 🚀 Bắt đầu nhanh

### 1. Cài đặt
```bash
# Clone repository
git clone https://github.com/Lamvanna/QLVXP.git
cd QLVXP

# Cài đặt dependencies
npm install
```

### 2. Cấu hình môi trường
```bash
# Tạo file .env
cp .env.example .env
# Chỉnh sửa .env với thông tin MongoDB
```

### 3. Chạy ứng dụng
```bash
# Windows
./start-dev.bat

# Linux/Mac
npm run dev
```

## 🔍 Tổng quan kiến trúc

### Frontend (React)
- **Framework**: React 18 với TypeScript
- **UI Library**: Radix UI components với shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Routing**: Wouter

### Backend (Node.js)
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **API**: RESTful endpoints

## 💻 Chức năng chính

### 🎬 Quản lý phim
- Danh sách phim đang chiếu/sắp chiếu
- Chi tiết phim với trailer, rating
- Đánh giá và bình luận

### 🎫 Đặt vé
- Chọn suất chiếu
- Chọn ghế ngồi tương tác
- Áp dụng mã khuyến mãi
- Thanh toán đa phương thức

### 👑 Quản trị viên
- Quản lý phim, rạp, phòng chiếu
- Quản lý suất chiếu
- Quản lý người dùng
- Thống kê và báo cáo

### 👨‍💼 Nhân viên
- Quản lý suất chiếu
- Duyệt đặt vé
- Hỗ trợ khách hàng

## 🧩 Cấu trúc dự án

```
MovieNA/
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── lib/         # Utilities
│   │   └── hooks/       # Custom hooks
├── server/              # Backend Express
│   ├── index.ts         # Entry point
│   ├── routes.ts        # API routes
│   ├── mongodb.ts       # Database connection
│   └── storage.ts       # Data access layer
├── shared/              # Shared code
│   └── schema.ts        # Shared schemas
└── scripts/             # Utility scripts
```

## 🔌 API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/movies` | GET | Danh sách phim |
| `/api/movies/:id` | GET | Chi tiết phim |
| `/api/showtimes` | GET | Danh sách suất chiếu |
| `/api/bookings` | POST | Đặt vé |
| `/api/auth/login` | POST | Đăng nhập |
| `/api/auth/register` | POST | Đăng ký |

## 📊 Database Schema

### Collections
- **Movies**: Thông tin phim
- **Users**: Người dùng và authentication
- **Cinemas**: Rạp chiếu phim
- **Rooms**: Phòng chiếu
- **Showtimes**: Lịch chiếu
- **Tickets**: Vé đã đặt
- **Reviews**: Đánh giá phim
- **Promotions**: Khuyến mãi

## 🛠️ Scripts hỗ trợ

| Script | Mô tả |
|--------|-------|
| `start-dev.bat` | Khởi chạy development server |
| `stop-dev.bat` | Dừng development server |
| `kill-port.bat` | Xử lý port conflicts |
| `upload-to-github.bat` | Upload code lên GitHub |

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run start
```

### Docker
```bash
docker-compose up -d
```

## 🔧 Troubleshooting

### Port conflicts
```bash
# Windows
./kill-port.bat

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### MongoDB connection issues
- Kiểm tra MongoDB service đang chạy
- Xác nhận connection string trong `.env`
- Kiểm tra firewall/network settings

## 🔗 Links hữu ích

- **GitHub Repository**: [https://github.com/Lamvanna/QLVXP](https://github.com/Lamvanna/QLVXP)
- **MongoDB Documentation**: [https://docs.mongodb.com/](https://docs.mongodb.com/)
- **React Documentation**: [https://reactjs.org/docs/getting-started.html](https://reactjs.org/docs/getting-started.html)
- **Express Documentation**: [https://expressjs.com/](https://expressjs.com/)

## 📝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo Pull Request hoặc Issue trên GitHub repository.

## 📄 License

MIT License
