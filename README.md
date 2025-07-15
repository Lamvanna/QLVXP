# NaCinema - Hệ Thống Đặt Vé Phim

## Giới thiệu

NaCinema là hệ thống đặt vé phim toàn diện được xây dựng với React, Node.js, Express và MongoDB. Hệ thống cung cấp đầy đủ các tính năng từ duyệt phim, đặt vé, quản lý rạp chiếu đến bảng điều khiển admin.

## Công nghệ sử dụng

### Frontend
- **React 18** với TypeScript
- **Vite** - Build tool và dev server
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **React Query** - Server state management
- **React Hook Form** - Form validation
- **Wouter** - Routing

### Backend
- **Node.js** với Express
- **TypeScript** - Type safety
- **MongoDB** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Yêu cầu hệ thống

- Node.js 18 hoặc cao hơn
- NPM hoặc Yarn
- MongoDB Atlas account (hoặc MongoDB local)
- VS Code (khuyến nghị)

## Cài đặt và chạy dự án

> **Lưu ý**: Dự án đã được cấu hình để chạy thủ công, không còn tự động khởi chạy.

### Cách 1: Chạy Development Mode (Khuyến nghị)

```bash
# 1. Cài đặt dependencies
npm install

# 2. Tạo file .env với cấu hình MongoDB
# Xem mẫu trong MANUAL_RUN_GUIDE.md

# 3. Chạy development server
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:5000

### Cách 2: Sử dụng Docker

#### Quick Start
```bash
# Clone dự án
git clone <repository-url>
cd nacinema

# Chạy development với Docker
./docker-scripts.sh dev

# Hoặc chạy production
./docker-scripts.sh prod
```

#### Development với Docker
```bash
# Chạy development environment
docker-compose -f docker-compose.dev.yml up --build

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

#### Production với Docker
```bash
# Chạy production environment
docker-compose up --build -d

# Kiểm tra health
curl http://localhost/api/health

# Xem logs
docker-compose logs -f
```

### Cách 2: Chạy Local (Traditional)

#### 1. Clone dự án
```bash
git clone <repository-url>
cd nacinema
```

#### 2. Cài đặt dependencies
```bash
npm install
```

#### 3. Cấu hình môi trường
Tạo file `.env` từ template:
```bash
cp .env.example .env
```

Cập nhật thông tin trong `.env`:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nacinema?retryWrites=true&w=majority

# JWT Secret Key
JWT_SECRET=your-super-secret-jwt-key-here
```

#### 4. Chạy dự án
```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

Server sẽ chạy trên: http://localhost:5000

## Cấu trúc dự án

```
movie-ticket-booking/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities
│   │   └── hooks/          # Custom hooks
│   └── index.html
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage interface
│   └── mongodb.ts          # MongoDB implementation
├── shared/                 # Shared types and schemas
│   └── schema.ts
├── package.json
└── README.md
```

## Tài khoản mặc định

### Admin Account
- **Email:** admin@nacinema.com
- **Password:** admin123
- **Role:** Admin (toàn quyền)

### Staff Account
- **Email:** staff@nacinema.com
- **Password:** staff123
- **Role:** Staff (quản lý suất chiếu, vé)

## Tính năng chính

### 🎬 Cho người dùng
- Duyệt danh sách phim
- Xem thông tin chi tiết phim
- Chọn suất chiếu và ghế
- Đặt vé với nhiều phương thức thanh toán
- Áp dụng mã khuyến mãi
- Xem lịch sử đặt vé
- Đánh giá và review phim

### 🎭 Cho nhân viên (Staff)
- Quản lý suất chiếu
- Phê duyệt/hủy vé
- Xem thống kê cơ bản

### 👑 Cho admin
- Quản lý phim (CRUD)
- Quản lý rạp chiếu và phòng
- Quản lý suất chiếu
- Quản lý người dùng và phân quyền
- Quản lý khuyến mãi
- Xem thống kê chi tiết
- Báo cáo doanh thu

## Cấu hình VS Code

### Extensions khuyến nghị

Tạo file `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### Settings cho VS Code

Tạo file `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### Launch configuration

Tạo file `.vscode/launch.json` để debug:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      },
      "runtimeArgs": ["-r", "tsx/cjs"]
    }
  ]
}
```

## Scripts có sẵn

### NPM Scripts
```bash
# Chạy development server (frontend + backend)
npm run dev

# Build project
npm run build

# Chạy production server
npm start

# Type checking
npm run check

# Database push
npm run db:push
```

### Docker Scripts
```bash
# Development
./docker-scripts.sh dev        # Start development environment
./docker-scripts.sh logs       # View logs
./docker-scripts.sh stop       # Stop services

# Production
./docker-scripts.sh build      # Build Docker image
./docker-scripts.sh prod       # Start production environment

# Maintenance
./docker-scripts.sh clean      # Clean up Docker resources
./docker-scripts.sh backup     # Backup database
./docker-scripts.sh shell      # Access app container
./docker-scripts.sh mongo      # Access MongoDB shell
```

## Cơ sở dữ liệu

### MongoDB Collections

- `users` - Thông tin người dùng
- `movies` - Danh sách phim
- `cinemas` - Thông tin rạp chiếu
- `rooms` - Phòng chiếu
- `showtimes` - Suất chiếu
- `tickets` - Vé đã đặt
- `reviews` - Đánh giá phim
- `promotions` - Mã khuyến mãi

### Data seeding

Dữ liệu mẫu sẽ được tự động tạo khi chạy lần đầu:
- 3 phim mẫu
- 4 rạp chiếu
- 6 phòng chiếu
- Các suất chiếu mẫu
- 2 mã khuyến mãi

## Troubleshooting

### Lỗi thường gặp

1. **MongoDB connection failed**
   - Kiểm tra MONGODB_URI trong .env
   - Đảm bảo IP được whitelist trong MongoDB Atlas

2. **Port 5000 đã được sử dụng**
   - Thay đổi port trong server/index.ts
   - Hoặc kill process đang sử dụng port 5000

3. **JWT token errors**
   - Xóa localStorage trong browser
   - Đảm bảo JWT_SECRET được cấu hình

4. **Build errors**
   - Xóa node_modules và chạy lại npm install
   - Kiểm tra phiên bản Node.js

### Debug tips

1. **Console logs**: Server logs hiển thị trong terminal
2. **Network tab**: Kiểm tra API calls trong DevTools
3. **React DevTools**: Cài extension để debug React components
4. **MongoDB Compass**: Kết nối để xem database

## Deployment

### Docker Deployment (Khuyến nghị)

#### Development
```bash
# Sử dụng Docker Compose cho development
docker-compose -f docker-compose.dev.yml up --build
```

#### Production
```bash
# Sử dụng Docker Compose cho production
docker-compose up --build -d

# Với Nginx reverse proxy
docker-compose -f docker-compose.yml up -d
```

#### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb://admin:strong_password@mongo:27017/nacinema?authSource=admin
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-jwt-key-for-production
PORT=5000
```

### Traditional Deployment
```bash
# Build production
npm run build
npm start

# Với PM2
pm2 start dist/index.js --name nacinema
```

### Docker Features
- **Multi-stage builds** cho optimization
- **Health checks** cho reliability
- **Nginx reverse proxy** cho load balancing
- **Redis caching** cho performance
- **MongoDB với persistent volumes**
- **Automatic restarts** và scaling

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License

## Liên hệ

- Email: support@nacinema.com
- GitHub: [repository-url]

---

**Lưu ý:** Đây là dự án demo. Trong production, cần thêm các biện pháp bảo mật, validation, và monitoring.