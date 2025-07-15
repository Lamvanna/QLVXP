# 🚀 Deployment Guide - NaCinema

## 🎯 Tổng quan Deployment Options

NaCinema hỗ trợ nhiều phương thức deployment từ development đến production scale với Docker, cloud services, và traditional hosting.

---

## 🔧 Development Deployment

### Local Development
```bash
# 1. Clone repository
git clone https://github.com/Lamvanna/QLVXP.git
cd QLVXP

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env với MongoDB connection string

# 4. Start development server
npm run dev
# hoặc
./start-dev.bat  # Windows script
```

### Environment Variables (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/nacinema
# hoặc MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nacinema

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
NODE_ENV=development
PORT=5000

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

---

## 🐳 Docker Deployment

### Development với Docker
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Services included:
# - MongoDB
# - Redis (caching)
# - NaCinema app với hot reload
```

### Production với Docker
```bash
# Start production environment
docker-compose up --build -d

# Services included:
# - MongoDB với persistent storage
# - Redis cho caching
# - NaCinema app (optimized build)
# - Nginx reverse proxy
```

### Docker Scripts
```bash
# Build image
./docker-scripts.sh build

# Start development
./docker-scripts.sh dev

# Start production
./docker-scripts.sh prod

# Stop services
./docker-scripts.sh stop

# View logs
./docker-scripts.sh logs

# Cleanup
./docker-scripts.sh clean
```

---

## ☁️ Cloud Deployment

### 1. Heroku Deployment

#### Preparation
```bash
# Install Heroku CLI
# Create Heroku app
heroku create nacinema-app

# Add MongoDB Atlas addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production
```

#### Deploy
```bash
# Deploy to Heroku
git push heroku main

# Scale dynos
heroku ps:scale web=1
```

### 2. Vercel Deployment (Frontend)

#### Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Configuration (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ]
}
```

### 3. AWS Deployment

#### EC2 Instance Setup
```bash
# 1. Launch EC2 instance (Ubuntu 20.04)
# 2. Install Docker
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker ubuntu

# 3. Clone repository
git clone https://github.com/Lamvanna/QLVXP.git
cd QLVXP

# 4. Setup environment
cp .env.example .env
# Edit .env với production values

# 5. Deploy
docker-compose up -d
```

#### RDS MongoDB Setup
- Use AWS DocumentDB (MongoDB compatible)
- Configure security groups
- Update MONGODB_URI in .env

### 4. DigitalOcean Droplet

#### Droplet Setup
```bash
# 1. Create Ubuntu droplet
# 2. Install Node.js và MongoDB
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
sudo apt-get install -y mongodb-org

# 4. Clone và setup
git clone https://github.com/Lamvanna/QLVXP.git
cd QLVXP
npm install
npm run build

# 5. Setup PM2 for process management
npm install -g pm2
pm2 start npm --name "nacinema" -- start
pm2 startup
pm2 save
```

---

## 🔒 Production Security

### Environment Security
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Use environment-specific configs
NODE_ENV=production
```

### Database Security
- Enable MongoDB authentication
- Use connection string với credentials
- Setup database firewall rules
- Regular backups

### Server Security
```bash
# Setup firewall
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS

# SSL Certificate với Let's Encrypt
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 Monitoring & Logging

### Application Monitoring
```javascript
// server/index.ts - Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});
```

### Health Checks
```javascript
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
```

### Log Management
```bash
# PM2 logs
pm2 logs nacinema

# Docker logs
docker-compose logs -f

# System logs
sudo journalctl -u nacinema -f
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/nacinema
          git pull origin main
          npm install
          npm run build
          pm2 restart nacinema
```

---

## 📈 Performance Optimization

### Database Optimization
```javascript
// MongoDB indexes
db.movies.createIndex({ status: 1, genre: 1 });
db.showtimes.createIndex({ movieId: 1, startTime: 1 });
db.tickets.createIndex({ userId: 1, createdAt: -1 });
```

### Caching Strategy
```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache movie data
app.get('/api/movies', async (req, res) => {
  const cached = await client.get('movies:all');
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const movies = await fetchMovies();
  await client.setex('movies:all', 300, JSON.stringify(movies)); // 5 min cache
  res.json(movies);
});
```

### CDN Setup
- Use CloudFlare hoặc AWS CloudFront
- Cache static assets (images, CSS, JS)
- Optimize image delivery

---

## 🔧 Maintenance

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/nacinema" --out=/backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d_%H%M%S)"
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR"
tar -czf "$BACKUP_DIR.tar.gz" "$BACKUP_DIR"
rm -rf "$BACKUP_DIR"
```

### Updates & Patches
```bash
# Update dependencies
npm audit fix
npm update

# Security patches
npm audit --audit-level high
```

### Scaling Considerations
- Load balancer setup
- Database sharding
- Microservices architecture
- Container orchestration (Kubernetes)

---

Deployment được thiết kế để:
- ✅ **Flexible**: Multiple deployment options
- ✅ **Scalable**: Easy to scale horizontally
- ✅ **Secure**: Production-ready security
- ✅ **Monitored**: Comprehensive logging và monitoring
- ✅ **Automated**: CI/CD pipeline support
- ✅ **Maintainable**: Easy updates và backups
