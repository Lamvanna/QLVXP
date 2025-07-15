# Hướng dẫn chạy thủ công NaCinema

## Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn
- MongoDB (local hoặc MongoDB Atlas)

## Cách 1: Chạy Development Mode (Khuyến nghị)

### Bước 1: Cài đặt dependencies

```bash
npm install
```

### Bước 2: Cấu hình môi trường

Tạo file `.env` trong thư mục gốc:

```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nacinema
JWT_SECRET=your-secret-key-here
PORT=5000
```

### Bước 3: Khởi động MongoDB

- **MongoDB Local**: Khởi động MongoDB service trên máy
- **MongoDB Atlas**: Sử dụng connection string từ Atlas

### Bước 4: Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:5000

> **Lưu ý cho Windows**: Đã cấu hình sử dụng `cross-env` để tương thích với Windows và bind địa chỉ `localhost` thay vì `0.0.0.0`.

## Cách 2: Chạy Production Mode

### Bước 1: Build ứng dụng

```bash
npm run build
```

### Bước 2: Khởi động production

```bash
npm run start
```

## Cách 3: Sử dụng Docker

### Development với Docker

```bash
# Chạy development environment
docker-compose -f docker-compose.dev.yml up --build
```

### Production với Docker

```bash
# Chạy production environment
docker-compose up --build -d
```

### Dừng Docker services

```bash
docker-compose down
```

## Scripts có sẵn

- `npm run dev` - Chạy development server với hot reload
- `npm run build` - Build ứng dụng cho production
- `npm run start` - Chạy production server
- `npm run check` - Kiểm tra TypeScript
- `npm run db:push` - Push database schema

## Troubleshooting

### Lỗi kết nối MongoDB

- Kiểm tra MongoDB service đang chạy
- Xác nhận connection string trong `.env`
- Kiểm tra firewall/network settings

### Lỗi port đã được sử dụng (EADDRINUSE)

**Cách 1: Sử dụng script tự động (Khuyến nghị)**

```bash
# Chạy script để tự động dừng tất cả process trên port 5000
./kill-port.bat
```

**Cách 2: Thủ công**

```bash
# Tìm process đang sử dụng port 5000
netstat -ano | findstr :5000
# Kill process (Windows) - thay <PID> bằng số PID thực tế
taskkill /PID <PID> /F
```

**Cách 3: Sử dụng port khác**

```bash
# Chạy trên port khác (ví dụ: 3000)
set PORT=3000 && npm run dev
```

### Lỗi dependencies

```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

## Tính năng chính

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **Hot Reload**: Vite development server

## Cấu trúc thư mục

```
/client          # React frontend
  /src
    /components  # UI components
    /pages       # Route components
    /lib         # Utilities
/server          # Express backend
/shared          # Shared types
```

## Lưu ý quan trọng

1. **Không còn tự động chạy**: Đã xóa bỏ file `.replit` và các plugin Replit
2. **Chạy thủ công**: Cần chạy lệnh `npm run dev` để khởi động
3. **MongoDB**: Cần cấu hình kết nối MongoDB trước khi chạy
4. **Environment**: Tạo file `.env` với các biến môi trường cần thiết

## Liên hệ hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:

1. Node.js version (>= 18)
2. MongoDB connection
3. Environment variables
4. Port availability (5000)
