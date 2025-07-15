# 🔒 Security & Performance Guide - NaCinema

## 🎯 Tổng quan Security & Performance

File này mô tả chi tiết các biện pháp bảo mật, tối ưu hiệu suất, và best practices được áp dụng trong hệ thống NaCinema.

---

## 🔐 Security Implementation

### 🛡️ Authentication & Authorization

#### JWT Token Security
```typescript
interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
  issuer: string;
  audience: string;
}

const jwtConfig: JWTConfig = {
  secret: process.env.JWT_SECRET!, // Must be 256-bit key
  expiresIn: '15m',              // Short-lived access token
  refreshExpiresIn: '7d',        // Longer refresh token
  issuer: 'nacinema-api',
  audience: 'nacinema-client'
};

// Secure token generation
const generateTokens = (user: User): TokenPair => {
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
    iat: Math.floor(Date.now() / 1000)
  };

  const accessToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience
  });

  const refreshToken = jwt.sign(
    { id: user._id, type: 'refresh' },
    jwtConfig.secret,
    {
      expiresIn: jwtConfig.refreshExpiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }
  );

  return { accessToken, refreshToken };
};

// Token validation middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    }) as JWTPayload;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

#### Role-Based Access Control (RBAC)
```typescript
enum Permission {
  // Movie permissions
  VIEW_MOVIES = 'view:movies',
  CREATE_MOVIES = 'create:movies',
  UPDATE_MOVIES = 'update:movies',
  DELETE_MOVIES = 'delete:movies',
  
  // Booking permissions
  VIEW_OWN_BOOKINGS = 'view:own_bookings',
  VIEW_ALL_BOOKINGS = 'view:all_bookings',
  CREATE_BOOKINGS = 'create:bookings',
  CANCEL_BOOKINGS = 'cancel:bookings',
  
  // Admin permissions
  VIEW_ANALYTICS = 'view:analytics',
  MANAGE_USERS = 'manage:users',
  MANAGE_PROMOTIONS = 'manage:promotions'
}

const rolePermissions: Record<UserRole, Permission[]> = {
  user: [
    Permission.VIEW_MOVIES,
    Permission.VIEW_OWN_BOOKINGS,
    Permission.CREATE_BOOKINGS
  ],
  staff: [
    Permission.VIEW_MOVIES,
    Permission.CREATE_MOVIES,
    Permission.UPDATE_MOVIES,
    Permission.VIEW_ALL_BOOKINGS,
    Permission.CANCEL_BOOKINGS
  ],
  admin: Object.values(Permission) // All permissions
};

// Permission checking middleware
const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPermissions = rolePermissions[user.role] || [];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
```

### 🔒 Data Validation & Sanitization

#### Input Validation with Zod
```typescript
// Comprehensive validation schemas
const createMovieSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .regex(/^[a-zA-Z0-9\s\-:.,!?()]+$/, 'Invalid characters in title'),
    
  description: z.string()
    .min(10, 'Description too short')
    .max(2000, 'Description too long'),
    
  genre: z.string()
    .min(1, 'Genre is required')
    .refine(val => VALID_GENRES.includes(val), 'Invalid genre'),
    
  duration: z.number()
    .int('Duration must be integer')
    .min(30, 'Duration too short')
    .max(300, 'Duration too long'),
    
  rating: z.enum(['G', 'PG', 'PG-13', 'R', 'NC-17']),
  
  poster: z.string()
    .url('Invalid poster URL')
    .refine(url => isValidImageUrl(url), 'Invalid image format'),
    
  releaseDate: z.string()
    .datetime('Invalid date format')
    .refine(date => new Date(date) > new Date(), 'Release date must be in future')
});

// SQL Injection prevention
const sanitizeQuery = (query: any): any => {
  if (typeof query === 'string') {
    return query.replace(/['"\\;]/g, ''); // Remove dangerous characters
  }
  
  if (Array.isArray(query)) {
    return query.map(sanitizeQuery);
  }
  
  if (typeof query === 'object' && query !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(query)) {
      // Prevent NoSQL injection
      if (key.startsWith('$') || key.includes('.')) {
        continue; // Skip dangerous keys
      }
      sanitized[key] = sanitizeQuery(value);
    }
    return sanitized;
  }
  
  return query;
};
```

### 🛡️ Security Headers & CORS

#### Security Middleware
```typescript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://nacinema.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting
const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ error: message });
    }
  });
};

// Different rate limits for different endpoints
app.use('/api/auth/login', createRateLimit(15 * 60 * 1000, 5, 'Too many login attempts'));
app.use('/api/auth/register', createRateLimit(60 * 60 * 1000, 3, 'Too many registration attempts'));
app.use('/api/bookings', createRateLimit(60 * 1000, 10, 'Too many booking requests'));
app.use('/api/', createRateLimit(15 * 60 * 1000, 100, 'Too many requests'));
```

---

## ⚡ Performance Optimization

### 🗄️ Database Optimization

#### MongoDB Indexes
```typescript
// Essential indexes for performance
const createIndexes = async () => {
  // Movies collection
  await db.collection('movies').createIndexes([
    { key: { status: 1, genre: 1 } },
    { key: { releaseDate: -1 } },
    { key: { title: 'text', description: 'text' } } // Text search
  ]);

  // Showtimes collection
  await db.collection('showtimes').createIndexes([
    { key: { movieId: 1, startTime: 1 } },
    { key: { roomId: 1, startTime: 1 } },
    { key: { startTime: 1 } }
  ]);

  // Tickets collection
  await db.collection('tickets').createIndexes([
    { key: { userId: 1, createdAt: -1 } },
    { key: { showtimeId: 1 } },
    { key: { bookingCode: 1 }, unique: true },
    { key: { status: 1, createdAt: -1 } }
  ]);

  // Users collection
  await db.collection('users').createIndexes([
    { key: { username: 1 }, unique: true },
    { key: { email: 1 }, unique: true },
    { key: { role: 1 } }
  ]);

  // Seat locks collection (TTL index for auto-cleanup)
  await db.collection('seatlocks').createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );
};

// Query optimization
const getMoviesOptimized = async (filters: MovieFilters, pagination: Pagination) => {
  const { status, genre, search } = filters;
  const { page = 1, limit = 20 } = pagination;

  const pipeline = [];

  // Match stage
  const matchStage: any = {};
  if (status) matchStage.status = status;
  if (genre) matchStage.genre = genre;
  if (search) {
    matchStage.$text = { $search: search };
  }
  pipeline.push({ $match: matchStage });

  // Add score for text search
  if (search) {
    pipeline.push({ $addFields: { score: { $meta: 'textScore' } } });
    pipeline.push({ $sort: { score: { $meta: 'textScore' } } });
  } else {
    pipeline.push({ $sort: { releaseDate: -1 } });
  }

  // Pagination
  pipeline.push({ $skip: (page - 1) * limit });
  pipeline.push({ $limit: limit });

  // Lookup showtimes count
  pipeline.push({
    $lookup: {
      from: 'showtimes',
      localField: '_id',
      foreignField: 'movieId',
      as: 'showtimes',
      pipeline: [
        { $match: { startTime: { $gte: new Date() } } },
        { $count: 'count' }
      ]
    }
  });

  return await Movie.aggregate(pipeline);
};
```

### 🚀 Caching Strategy

#### Redis Caching Implementation
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

interface CacheConfig {
  ttl: number;
  key: string;
}

const CACHE_CONFIGS = {
  movies: { ttl: 300, key: 'movies' },        // 5 minutes
  showtimes: { ttl: 60, key: 'showtimes' },   // 1 minute
  seatMap: { ttl: 30, key: 'seatmap' },       // 30 seconds
  userProfile: { ttl: 900, key: 'user' },     // 15 minutes
  analytics: { ttl: 3600, key: 'analytics' }  // 1 hour
};

// Generic cache wrapper
const withCache = <T>(
  config: CacheConfig,
  fetchFn: () => Promise<T>
) => {
  return async (cacheKey: string): Promise<T> => {
    const fullKey = `${config.key}:${cacheKey}`;
    
    // Try to get from cache
    const cached = await redis.get(fullKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fetch from database
    const data = await fetchFn();
    
    // Store in cache
    await redis.setex(fullKey, config.ttl, JSON.stringify(data));
    
    return data;
  };
};

// Cached functions
const getCachedMovies = withCache(
  CACHE_CONFIGS.movies,
  () => Movie.find({ status: 'active' }).lean()
);

const getCachedSeatMap = withCache(
  CACHE_CONFIGS.seatMap,
  async () => {
    // Implementation to fetch seat map
  }
);

// Cache invalidation
const invalidateCache = async (pattern: string) => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

// Invalidate related caches when data changes
const onMovieUpdate = async (movieId: string) => {
  await invalidateCache(`movies:*`);
  await invalidateCache(`showtimes:movie:${movieId}:*`);
};
```

### 🔄 API Response Optimization

#### Response Compression & Pagination
```typescript
import compression from 'compression';

// Enable gzip compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// Optimized pagination
interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const paginate = async <T>(
  model: any,
  query: any,
  options: PaginationOptions
): Promise<PaginationResult<T>> => {
  const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
  
  const [data, total] = await Promise.all([
    model.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(), // Use lean() for better performance
    model.countDocuments(query)
  ]);
  
  const pages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    }
  };
};

// Response optimization middleware
const optimizeResponse = (req: Request, res: Response, next: NextFunction) => {
  // Remove sensitive fields
  const originalJson = res.json;
  res.json = function(data: any) {
    if (data && typeof data === 'object') {
      // Remove password fields
      if (Array.isArray(data)) {
        data = data.map(item => omit(item, ['password', '__v']));
      } else {
        data = omit(data, ['password', '__v']);
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};
```

### 📊 Performance Monitoring

#### Request Logging & Metrics
```typescript
import { performance } from 'perf_hooks';

interface RequestMetrics {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
}

// Performance monitoring middleware
const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  
  res.on('finish', () => {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    const metrics: RequestMetrics = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: Math.round(responseTime * 100) / 100, // Round to 2 decimal places
      timestamp: new Date(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
    
    // Log slow requests
    if (responseTime > 1000) { // > 1 second
      console.warn('Slow request detected:', metrics);
    }
    
    // Store metrics for analytics
    storeMetrics(metrics);
  });
  
  next();
};

// Database connection monitoring
const monitorDatabase = () => {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });
  
  // Monitor slow queries
  mongoose.set('debug', (collectionName: string, method: string, query: any, doc: any) => {
    const start = Date.now();
    console.log(`${collectionName}.${method}`, JSON.stringify(query));
    
    // Log if query takes too long
    setTimeout(() => {
      const duration = Date.now() - start;
      if (duration > 100) { // > 100ms
        console.warn(`Slow query detected: ${collectionName}.${method} took ${duration}ms`);
      }
    }, 0);
  });
};
```

Hệ thống security và performance được thiết kế để:
- ✅ **Bảo mật toàn diện**: Authentication, authorization, input validation
- ✅ **Hiệu suất cao**: Caching, indexing, query optimization
- ✅ **Monitoring**: Request tracking, performance metrics
- ✅ **Scalability**: Efficient database queries, response optimization
- ✅ **Reliability**: Error handling, rate limiting, security headers
