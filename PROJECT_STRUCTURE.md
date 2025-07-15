# 📁 Cấu trúc dự án NaCinema - Hướng dẫn chi tiết

## 🎯 Tổng quan dự án

**NaCinema** là hệ thống quản lý vé xem phim được xây dựng theo kiến trúc Full-Stack với Frontend (React) và Backend (Node.js/Express) riêng biệt, sử dụng MongoDB làm cơ sở dữ liệu.

---

## 📂 Cấu trúc thư mục chính

```
MovieNA/
├── 📁 client/              # Frontend React Application
├── 📁 server/              # Backend Node.js/Express API
├── 📁 shared/              # Code dùng chung giữa client và server
├── 📁 .vscode/             # Cấu hình VS Code
├── 📁 attached_assets/     # Tài nguyên đính kèm (hình ảnh, docs)
├── 📄 package.json         # Dependencies và scripts chính
├── 📄 README.md           # Tài liệu chính của dự án
└── 🔧 Các file cấu hình...
```

---

## 🎨 Frontend - Thư mục `client/`

### `client/index.html`
- **Tác dụng**: File HTML chính, entry point của ứng dụng React
- **Nội dung**: Chứa thẻ `<div id="root">` để mount React app
- **Đặc biệt**: Đã loại bỏ script Replit banner

### `client/src/main.tsx`
- **Tác dụng**: Entry point của React application
- **Chức năng**: 
  - Khởi tạo React app
  - Cấu hình React Query client
  - Mount app vào DOM

### `client/src/App.tsx`
- **Tác dụng**: Component chính của ứng dụng
- **Chức năng**:
  - Định nghĩa routing với Wouter
  - Quản lý authentication state
  - Layout chính của ứng dụng

### `client/src/components/`
Thư mục chứa các React components:

#### `Navigation.tsx`
- **Tác dụng**: Component thanh điều hướng chính
- **Chức năng**: Menu, user authentication, responsive design

#### `MovieCard.tsx`
- **Tác dụng**: Component hiển thị thông tin phim dạng card
- **Chức năng**: Poster, title, rating, booking button

#### `SeatMap.tsx`
- **Tác dụng**: Component chọn ghế ngồi
- **Chức năng**: 
  - Hiển thị sơ đồ ghế
  - Xử lý chọn/bỏ chọn ghế
  - Phân loại ghế (Regular, VIP, Sweet, Premium)

#### `BookingForm.tsx`
- **Tác dụng**: Form đặt vé
- **Chức năng**:
  - Thu thập thông tin khách hàng
  - Xử lý thanh toán
  - Áp dụng mã khuyến mãi

#### `MovieReviews.tsx`
- **Tác dụng**: Component đánh giá phim
- **Chức năng**: Hiển thị và thêm review cho phim

### `client/src/components/ui/`
Thư mục chứa UI components từ shadcn/ui:
- `button.tsx`, `card.tsx`, `dialog.tsx`, etc.
- **Tác dụng**: Các component UI tái sử dụng với design system nhất quán

### `client/src/pages/`
Thư mục chứa các trang chính:

#### `Home.tsx`
- **Tác dụng**: Trang chủ
- **Chức năng**: Hiển thị danh sách phim đang chiếu

#### `MovieDetail.tsx`
- **Tác dụng**: Trang chi tiết phim
- **Chức năng**: Thông tin phim, lịch chiếu, đặt vé

#### `Login.tsx` & `Register.tsx`
- **Tác dụng**: Trang đăng nhập và đăng ký
- **Chức năng**: Authentication với JWT

#### `AdminPanel.tsx`
- **Tác dụng**: Bảng điều khiển admin
- **Chức năng**: Quản lý phim, rạp, vé, thống kê

#### `StaffPanel.tsx`
- **Tác dụng**: Bảng điều khiển nhân viên
- **Chức năng**: Quản lý suất chiếu, duyệt vé

### `client/src/lib/`
Thư mục utilities và configurations:

#### `auth.ts`
- **Tác dụng**: Quản lý authentication
- **Chức năng**: JWT token, login/logout, user state

#### `types.ts`
- **Tác dụng**: TypeScript type definitions
- **Chức năng**: Định nghĩa types cho Movie, User, Booking, etc.

#### `utils.ts`
- **Tác dụng**: Utility functions
- **Chức năng**: Helper functions, formatters

#### `queryClient.ts`
- **Tác dụng**: Cấu hình React Query
- **Chức năng**: API caching, state management

---

## 🔧 Backend - Thư mục `server/`

### `server/index.ts`
- **Tác dụng**: Entry point của backend server
- **Chức năng**:
  - Khởi tạo Express app
  - Kết nối MongoDB
  - Setup middleware
  - Khởi động server trên port 5000

### `server/routes.ts`
- **Tác dụng**: Định nghĩa API routes
- **Chức năng**:
  - RESTful API endpoints
  - Authentication middleware
  - CRUD operations cho movies, bookings, users

### `server/mongodb.ts`
- **Tác dụng**: Quản lý kết nối MongoDB
- **Chức năng**:
  - Database connection
  - Collections management
  - Data initialization
  - Indexes creation

### `server/storage.ts`
- **Tác dụng**: Data access layer
- **Chức năng**:
  - Database operations
  - Business logic
  - Data validation

### `server/vite.ts`
- **Tác dụng**: Vite integration cho development
- **Chức năng**:
  - Hot reload setup
  - Static file serving
  - Development middleware

---

## 🔄 Shared - Thư mục `shared/`

### `shared/schema.ts`
- **Tác dụng**: Shared data schemas
- **Chức năng**:
  - Zod validation schemas
  - Type definitions dùng chung
  - API contract validation

---

## ⚙️ Configuration Files

### `package.json`
- **Tác dụng**: Cấu hình dự án Node.js
- **Nội dung**:
  - Dependencies (React, Express, MongoDB, etc.)
  - Scripts (dev, build, start)
  - Project metadata

### `tsconfig.json`
- **Tác dụng**: Cấu hình TypeScript
- **Chức năng**: Compiler options, path mapping

### `vite.config.ts`
- **Tác dụng**: Cấu hình Vite build tool
- **Chức năng**: 
  - React plugin
  - Path aliases
  - Build optimization

### `tailwind.config.ts`
- **Tác dụng**: Cấu hình Tailwind CSS
- **Chức năng**: Theme, colors, responsive breakpoints

### `components.json`
- **Tác dụng**: Cấu hình shadcn/ui components
- **Chức năng**: Component library settings

---

## 🐳 Docker Configuration

### `Dockerfile`
- **Tác dụng**: Production Docker image
- **Chức năng**:
  - Multi-stage build
  - Optimized production image
  - Security best practices

### `Dockerfile.dev`
- **Tác dụng**: Development Docker image
- **Chức năng**: Development environment với hot reload

### `docker-compose.yml`
- **Tác dụng**: Production orchestration
- **Services**: App, MongoDB, Redis, Nginx

### `docker-compose.dev.yml`
- **Tác dụng**: Development orchestration
- **Chức năng**: Development environment setup

### `nginx.conf`
- **Tác dụng**: Nginx reverse proxy configuration
- **Chức năng**: Load balancing, SSL, static files

---

## 📜 Scripts và Utilities

### `start-dev.bat`
- **Tác dụng**: Khởi chạy development server
- **Chức năng**:
  - Kiểm tra port conflicts
  - Tự động kill processes cũ
  - Start npm run dev

### `stop-dev.bat`
- **Tác dụng**: Dừng development server
- **Chức năng**: Safely stop all processes on port 5000

### `kill-port.bat`
- **Tác dụng**: Kill processes trên port 5000
- **Chức năng**: Troubleshooting port conflicts

### `upload-to-github.bat`
- **Tác dụng**: Upload code lên GitHub
- **Chức năng**: Git init, add, commit, push

### `update-github.bat`
- **Tác dụng**: Cập nhật GitHub repository
- **Chức năng**: Git add, commit, push changes

---

## 📚 Documentation Files

### `README.md`
- **Tác dụng**: Tài liệu chính của dự án
- **Nội dung**: Overview, installation, usage

### `MANUAL_RUN_GUIDE.md`
- **Tác dụng**: Hướng dẫn chạy thủ công
- **Nội dung**: Step-by-step setup, troubleshooting

### `SETUP_GUIDE.md`
- **Tác dụng**: Hướng dẫn setup development environment
- **Nội dung**: VS Code, MongoDB, dependencies

### `DOCKER_GUIDE.md`
- **Tác dụng**: Hướng dẫn sử dụng Docker
- **Nội dung**: Docker commands, best practices

### `SCRIPTS_README.md`
- **Tác dụng**: Hướng dẫn sử dụng scripts
- **Nội dung**: Batch scripts usage, Windows specific

---

## 🔧 VS Code Configuration

### `.vscode/settings.json`
- **Tác dụng**: VS Code workspace settings
- **Chức năng**: TypeScript, Prettier, ESLint configuration

### `.vscode/extensions.json`
- **Tác dụng**: Recommended extensions
- **Chức năng**: Auto-suggest useful extensions

### `.vscode/tasks.json`
- **Tác dụng**: VS Code tasks
- **Chức năng**: Build, dev server tasks

### `.vscode/launch.json`
- **Tác dụng**: Debug configuration
- **Chức năng**: Node.js debugging setup

---

## 🚫 Ignore Files

### `.gitignore`
- **Tác dụng**: Git ignore patterns
- **Nội dung**: node_modules, dist, .env, logs

### `.dockerignore`
- **Tác dụng**: Docker ignore patterns
- **Nội dung**: Development files, git, docs

---

## 🌍 Environment & Config

### `.env.example`
- **Tác dụng**: Environment variables template
- **Nội dung**: MongoDB URI, JWT secret, port

### `.prettierrc`
- **Tác dụng**: Code formatting rules
- **Chức năng**: Consistent code style

---

## 📊 Attached Assets

### `attached_assets/`
- **Tác dụng**: Project assets và documentation
- **Nội dung**: Screenshots, design files, requirements

---

Dự án này được thiết kế theo best practices với:
- ✅ **Separation of Concerns**: Frontend/Backend tách biệt
- ✅ **Type Safety**: TypeScript throughout
- ✅ **Modern Stack**: React 18, Node.js, MongoDB
- ✅ **Developer Experience**: Hot reload, debugging, scripts
- ✅ **Production Ready**: Docker, Nginx, optimization
- ✅ **Documentation**: Comprehensive guides và comments
