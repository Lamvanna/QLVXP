# Docker Guide - NaCinema

## Tổng quan

NaCinema được containerized sử dụng Docker và Docker Compose để dễ dàng deploy và scaling. Hệ thống bao gồm:

- **App Container**: NaCinema application (Node.js + React)
- **MongoDB Container**: Database
- **Redis Container**: Caching layer
- **Nginx Container**: Reverse proxy và load balancer

## Cấu trúc Docker

```
nacinema/
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build
├── docker-compose.yml      # Production setup
├── docker-compose.dev.yml  # Development setup
├── nginx.conf             # Nginx configuration
├── mongo-init.js          # MongoDB initialization
├── docker-scripts.sh      # Helper scripts
└── .dockerignore          # Docker ignore file
```

## Yêu cầu hệ thống

- Docker Engine 20.10+
- Docker Compose 2.0+
- RAM: 2GB minimum, 4GB recommended
- Disk: 5GB free space
- CPU: 2 cores recommended

## Quick Start

### 1. Development Environment

```bash
# Chạy development với hot reload
./docker-scripts.sh dev

# Hoặc manual
docker-compose -f docker-compose.dev.yml up --build
```

### 2. Production Environment

```bash
# Build và chạy production
./docker-scripts.sh prod

# Hoặc manual
docker-compose up --build -d
```

### 3. Kiểm tra trạng thái

```bash
# Xem logs
./docker-scripts.sh logs

# Xem trạng thái containers
docker-compose ps
```

## Environment Variables

### Development (.env.dev)
```env
NODE_ENV=development
MONGODB_URI=mongodb://admin:dev123@mongo:27017/nacinema_dev?authSource=admin
REDIS_URL=redis://redis:6379
JWT_SECRET=dev-secret-key-not-for-production
PORT=5000
```

### Production (.env.prod)
```env
NODE_ENV=production
MONGODB_URI=mongodb://admin:strong_password@mongo:27017/nacinema?authSource=admin
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-jwt-key-for-production-change-this-immediately
PORT=5000
```

## Services

### App Service (nacinema_app)
- **Port**: 5000
- **Health Check**: `/api/health`
- **Dependencies**: MongoDB, Redis
- **Volume**: `./uploads:/app/uploads`

### MongoDB Service (nacinema_mongo)
- **Port**: 27017
- **Username**: admin
- **Password**: Configure in docker-compose.yml
- **Database**: nacinema / nacinema_dev
- **Volume**: `mongo_data:/data/db`

### Redis Service (nacinema_redis)
- **Port**: 6379
- **Volume**: `redis_data:/data`
- **Usage**: Session storage, caching

### Nginx Service (nacinema_nginx)
- **Port**: 80 (HTTP), 443 (HTTPS)
- **Config**: `nginx.conf`
- **Features**: Rate limiting, SSL termination, static file serving

## Docker Scripts

### Cách sử dụng
```bash
# Make executable
chmod +x docker-scripts.sh

# Xem help
./docker-scripts.sh
```

### Available Commands

#### Development
```bash
# Start development environment
./docker-scripts.sh dev

# View logs
./docker-scripts.sh logs
```

#### Production
```bash
# Build image
./docker-scripts.sh build

# Start production
./docker-scripts.sh prod

# Stop services
./docker-scripts.sh stop
```

#### Maintenance
```bash
# Clean up
./docker-scripts.sh clean

# Backup database
./docker-scripts.sh backup

# Restore database
./docker-scripts.sh restore backup_folder_name

# Access app shell
./docker-scripts.sh shell

# Access MongoDB shell
./docker-scripts.sh mongo
```

## Volumes

### Persistent Data
- `mongo_data`: MongoDB data
- `redis_data`: Redis data
- `./uploads`: File uploads

### Backup Strategy
```bash
# Create backup
docker exec nacinema_mongo mongodump --out /backup/$(date +%Y%m%d_%H%M%S)

# Restore backup
docker exec nacinema_mongo mongorestore /backup/20240101_120000
```

## Networking

### Internal Network
- Network: `nacinema_network`
- Driver: bridge
- Services communicate via service names

### Port Mapping
- **80**: Nginx HTTP
- **443**: Nginx HTTPS
- **5000**: App (direct access)
- **27017**: MongoDB (development)
- **6379**: Redis (development)

## Health Checks

### App Health Check
```bash
curl http://localhost:5000/api/health
```

### MongoDB Health Check
```bash
docker exec nacinema_mongo mongosh --eval "db.adminCommand('ping')"
```

### Redis Health Check
```bash
docker exec nacinema_redis redis-cli ping
```

## Security

### Production Security
1. **Environment Variables**: Store secrets in `.env.prod`
2. **Non-root User**: App runs as `nacinema` user
3. **Network Isolation**: Services in private network
4. **Rate Limiting**: Nginx limits requests
5. **SSL/TLS**: Configure certificates in `nginx.conf`

### Development Security
- Use weak credentials for development only
- Expose ports for debugging
- Disable SSL for local development

## Performance Optimization

### Container Optimization
- Multi-stage builds for smaller images
- Node.js alpine images
- Proper layer caching
- Health checks for reliability

### Application Performance
- Redis caching layer
- MongoDB indexes
- Nginx compression
- Static file optimization

## Monitoring

### Container Monitoring
```bash
# Container stats
docker stats

# Container logs
docker-compose logs -f [service_name]

# Container health
docker-compose ps
```

### Application Monitoring
- Health endpoint: `/api/health`
- MongoDB metrics via MongoDB Compass
- Redis metrics via Redis CLI

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port
lsof -ti:5000

# Kill process
kill -9 <process_id>
```

#### 2. Database Connection Failed
```bash
# Check MongoDB container
docker-compose logs mongo

# Verify network connectivity
docker exec nacinema_app ping mongo
```

#### 3. Build Failures
```bash
# Clean build cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache
```

#### 4. Volume Issues
```bash
# Remove volumes
docker-compose down -v

# Recreate volumes
docker-compose up --build
```

### Debug Mode
```bash
# Run with debug output
DEBUG=* docker-compose up

# Access container shell
docker exec -it nacinema_app /bin/sh
```

## Scaling

### Horizontal Scaling
```bash
# Scale app service
docker-compose up --scale app=3

# Load balancing via Nginx
# Configure upstream servers in nginx.conf
```

### Vertical Scaling
```yaml
# In docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build Docker image
      run: docker build -t nacinema:latest .
    
    - name: Run tests
      run: docker-compose -f docker-compose.test.yml up --abort-on-container-exit
    
    - name: Deploy to production
      run: |
        docker-compose -f docker-compose.prod.yml up -d
```

## Best Practices

### Development
- Use `docker-compose.dev.yml` for development
- Mount source code as volume for hot reload
- Use weak credentials for development databases
- Expose all ports for debugging

### Production
- Use `docker-compose.yml` for production
- Store secrets in environment variables
- Use strong credentials
- Enable SSL/TLS
- Configure rate limiting
- Set up monitoring and logging
- Regular backups
- Security updates

### Maintenance
- Regular container updates
- Monitor disk usage
- Clean up unused images/volumes
- Database maintenance
- Log rotation

---

**Lưu ý**: Đây là hướng dẫn cơ bản. Trong production thực tế, cần cấu hình thêm monitoring, logging, security scanning và backup automation.