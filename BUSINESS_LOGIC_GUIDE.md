# 🏢 Business Logic & Workflows - NaCinema

## 🎯 Tổng quan Business Logic

File này mô tả chi tiết các quy trình nghiệp vụ, workflows, và business rules trong hệ thống NaCinema.

---

## 🎫 Booking Workflow - Quy trình đặt vé

### 📋 Complete Booking Flow
```
1. User Journey:
   Browse Movies → Select Movie → Choose Showtime → Select Seats → 
   Fill Customer Info → Apply Promotion → Choose Payment → Confirm Booking → 
   Receive Booking Code → Payment Processing → Ticket Generation

2. System Validation:
   Movie Status → Showtime Availability → Seat Availability → 
   Customer Info Validation → Promotion Validation → Payment Processing → 
   Seat Locking → Booking Confirmation
```

### 🔄 Detailed Booking Process

#### Step 1: Movie & Showtime Selection
```typescript
interface BookingSession {
  sessionId: string;
  userId?: string;
  movieId: string;
  showtimeId: string;
  selectedSeats: string[];
  customerInfo?: CustomerInfo;
  promotionCode?: string;
  paymentMethod?: PaymentMethod;
  totalAmount: number;
  expiresAt: Date;
  status: 'draft' | 'pending' | 'confirmed' | 'expired' | 'cancelled';
}

// Business rules for showtime selection
const validateShowtimeSelection = (showtime: Showtime): ValidationResult => {
  const now = new Date();
  const showtimeStart = new Date(showtime.startTime);
  
  // Rule 1: Cannot book past showtimes
  if (showtimeStart <= now) {
    return { valid: false, error: 'Không thể đặt vé cho suất chiếu đã qua' };
  }
  
  // Rule 2: Must book at least 30 minutes before showtime
  const minBookingTime = new Date(showtimeStart.getTime() - 30 * 60 * 1000);
  if (now >= minBookingTime) {
    return { valid: false, error: 'Phải đặt vé trước ít nhất 30 phút' };
  }
  
  // Rule 3: Check available seats
  if (showtime.availableSeats <= 0) {
    return { valid: false, error: 'Suất chiếu đã hết vé' };
  }
  
  return { valid: true };
};
```

#### Step 2: Seat Selection & Locking
```typescript
interface SeatLock {
  seatId: string;
  showtimeId: string;
  sessionId: string;
  lockedBy: string; // userId or sessionId
  lockedAt: Date;
  expiresAt: Date;
}

// Seat locking mechanism
const lockSeats = async (seatIds: string[], sessionId: string, showtimeId: string) => {
  const lockDuration = 10 * 60 * 1000; // 10 minutes
  const expiresAt = new Date(Date.now() + lockDuration);
  
  // Check if seats are available
  const unavailableSeats = await checkSeatAvailability(seatIds, showtimeId);
  if (unavailableSeats.length > 0) {
    throw new Error(`Ghế ${unavailableSeats.join(', ')} đã được đặt`);
  }
  
  // Lock seats
  const locks = seatIds.map(seatId => ({
    seatId,
    showtimeId,
    sessionId,
    lockedBy: sessionId,
    lockedAt: new Date(),
    expiresAt
  }));
  
  await SeatLock.insertMany(locks);
  
  // Set auto-release timer
  setTimeout(() => {
    releaseSeatLocks(sessionId);
  }, lockDuration);
  
  return locks;
};

// Business rules for seat selection
const validateSeatSelection = (seats: string[], showtime: Showtime): ValidationResult => {
  // Rule 1: Maximum 8 seats per booking
  if (seats.length > 8) {
    return { valid: false, error: 'Chỉ được đặt tối đa 8 vé trong một lần' };
  }
  
  // Rule 2: Minimum 1 seat
  if (seats.length === 0) {
    return { valid: false, error: 'Phải chọn ít nhất 1 ghế' };
  }
  
  // Rule 3: Sweet seats must be booked in pairs
  const sweetSeats = seats.filter(seatId => isSweetSeat(seatId));
  if (sweetSeats.length > 0 && sweetSeats.length % 2 !== 0) {
    return { valid: false, error: 'Ghế Sweet phải đặt theo cặp' };
  }
  
  return { valid: true };
};
```

#### Step 3: Promotion Code Validation
```typescript
interface PromotionValidation {
  code: string;
  totalAmount: number;
  userId?: string;
  showtimeId: string;
}

const validatePromotionCode = async (validation: PromotionValidation): Promise<PromotionResult> => {
  const { code, totalAmount, userId, showtimeId } = validation;
  
  // Find promotion
  const promotion = await Promotion.findOne({ 
    code, 
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });
  
  if (!promotion) {
    return { valid: false, error: 'Mã khuyến mãi không tồn tại hoặc đã hết hạn' };
  }
  
  // Rule 1: Check usage limit
  if (promotion.usedCount >= promotion.maxUsage) {
    return { valid: false, error: 'Mã khuyến mãi đã hết lượt sử dụng' };
  }
  
  // Rule 2: Check minimum purchase
  if (totalAmount < promotion.minPurchase) {
    return { 
      valid: false, 
      error: `Đơn hàng tối thiểu ${formatPrice(promotion.minPurchase)} để sử dụng mã này` 
    };
  }
  
  // Rule 3: Check user usage (if user-specific)
  if (userId && promotion.maxUsagePerUser) {
    const userUsage = await PromotionUsage.countDocuments({ 
      promotionId: promotion._id, 
      userId 
    });
    
    if (userUsage >= promotion.maxUsagePerUser) {
      return { valid: false, error: 'Bạn đã sử dụng hết lượt cho mã này' };
    }
  }
  
  // Calculate discount
  let discount = 0;
  if (promotion.discountType === 'percentage') {
    discount = totalAmount * (promotion.discountValue / 100);
    if (promotion.maxDiscount) {
      discount = Math.min(discount, promotion.maxDiscount);
    }
  } else {
    discount = promotion.discountValue;
  }
  
  return {
    valid: true,
    promotion,
    discount: Math.min(discount, totalAmount) // Cannot exceed total amount
  };
};
```

#### Step 4: Payment Processing
```typescript
interface PaymentRequest {
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  customerInfo: CustomerInfo;
  returnUrl?: string;
}

const processPayment = async (request: PaymentRequest): Promise<PaymentResult> => {
  const { bookingId, amount, paymentMethod, customerInfo } = request;
  
  try {
    let paymentResult: PaymentResult;
    
    switch (paymentMethod) {
      case 'cash':
        paymentResult = await processCashPayment(request);
        break;
      case 'card':
        paymentResult = await processCardPayment(request);
        break;
      case 'momo':
        paymentResult = await processMoMoPayment(request);
        break;
      case 'banking':
        paymentResult = await processBankingPayment(request);
        break;
      case 'vnpay':
        paymentResult = await processVNPayPayment(request);
        break;
      default:
        throw new Error('Phương thức thanh toán không được hỗ trợ');
    }
    
    // Update booking status
    if (paymentResult.success) {
      await updateBookingStatus(bookingId, 'confirmed');
      await releaseSeatLocks(bookingId); // Convert locks to actual bookings
      await generateTickets(bookingId);
    }
    
    return paymentResult;
    
  } catch (error) {
    await updateBookingStatus(bookingId, 'failed');
    await releaseSeatLocks(bookingId); // Release locks on failure
    throw error;
  }
};

// Cash payment (pay at counter)
const processCashPayment = async (request: PaymentRequest): Promise<PaymentResult> => {
  return {
    success: true,
    paymentId: generatePaymentId(),
    method: 'cash',
    status: 'pending', // Will be confirmed when customer pays at counter
    message: 'Vui lòng thanh toán tại quầy trong vòng 30 phút'
  };
};

// MoMo payment integration
const processMoMoPayment = async (request: PaymentRequest): Promise<PaymentResult> => {
  const momoRequest = {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    accessKey: process.env.MOMO_ACCESS_KEY,
    requestId: request.bookingId,
    amount: request.amount,
    orderId: request.bookingId,
    orderInfo: `Thanh toán vé xem phim - ${request.bookingId}`,
    returnUrl: request.returnUrl || `${process.env.BASE_URL}/booking/success`,
    notifyUrl: `${process.env.BASE_URL}/api/payment/momo/callback`,
    extraData: '',
    requestType: 'captureWallet',
    signature: generateMoMoSignature(/* ... */)
  };
  
  const response = await fetch(process.env.MOMO_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(momoRequest)
  });
  
  const result = await response.json();
  
  if (result.errorCode === 0) {
    return {
      success: true,
      paymentId: result.requestId,
      method: 'momo',
      status: 'pending',
      paymentUrl: result.payUrl,
      message: 'Chuyển hướng đến MoMo để thanh toán'
    };
  } else {
    throw new Error(result.localMessage || 'Lỗi thanh toán MoMo');
  }
};
```

---

## 👑 Admin Workflows - Quy trình quản trị

### 🎬 Movie Management Workflow
```typescript
interface MovieManagementWorkflow {
  createMovie: (movieData: MovieData) => Promise<Movie>;
  updateMovie: (movieId: string, updates: Partial<MovieData>) => Promise<Movie>;
  deleteMovie: (movieId: string) => Promise<void>;
  scheduleShowtimes: (movieId: string, showtimes: ShowtimeData[]) => Promise<Showtime[]>;
}

// Business rules for movie management
const validateMovieData = (movieData: MovieData): ValidationResult => {
  // Rule 1: Release date cannot be in the past for new movies
  if (movieData.releaseDate < new Date() && movieData.status === 'coming-soon') {
    return { valid: false, error: 'Ngày phát hành không thể trong quá khứ' };
  }
  
  // Rule 2: Duration must be reasonable
  if (movieData.duration < 30 || movieData.duration > 300) {
    return { valid: false, error: 'Thời lượng phim phải từ 30-300 phút' };
  }
  
  // Rule 3: Rating must be valid
  const validRatings = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
  if (!validRatings.includes(movieData.rating)) {
    return { valid: false, error: 'Xếp hạng phim không hợp lệ' };
  }
  
  return { valid: true };
};

// Showtime scheduling with conflict detection
const scheduleShowtimes = async (movieId: string, showtimes: ShowtimeData[]): Promise<Showtime[]> => {
  const results: Showtime[] = [];
  
  for (const showtimeData of showtimes) {
    // Validate showtime
    const validation = await validateShowtime(showtimeData);
    if (!validation.valid) {
      throw new Error(`Lỗi suất chiếu ${showtimeData.startTime}: ${validation.error}`);
    }
    
    // Check for conflicts
    const conflicts = await checkShowtimeConflicts(showtimeData);
    if (conflicts.length > 0) {
      throw new Error(`Xung đột lịch chiếu: ${conflicts.map(c => c.startTime).join(', ')}`);
    }
    
    // Create showtime
    const showtime = await Showtime.create({
      ...showtimeData,
      movieId,
      availableSeats: await calculateAvailableSeats(showtimeData.roomId)
    });
    
    results.push(showtime);
  }
  
  return results;
};

const validateShowtime = async (showtimeData: ShowtimeData): Promise<ValidationResult> => {
  // Rule 1: Start time must be in the future
  if (new Date(showtimeData.startTime) <= new Date()) {
    return { valid: false, error: 'Thời gian chiếu phải trong tương lai' };
  }
  
  // Rule 2: Room must exist and be available
  const room = await Room.findById(showtimeData.roomId);
  if (!room) {
    return { valid: false, error: 'Phòng chiếu không tồn tại' };
  }
  
  // Rule 3: Price must be positive
  if (showtimeData.price <= 0) {
    return { valid: false, error: 'Giá vé phải lớn hơn 0' };
  }
  
  return { valid: true };
};
```

### 📊 Analytics & Reporting
```typescript
interface AnalyticsService {
  getDashboardStats: (dateRange: DateRange) => Promise<DashboardStats>;
  getRevenueReport: (dateRange: DateRange) => Promise<RevenueReport>;
  getMoviePerformance: (movieId?: string) => Promise<MoviePerformance[]>;
  getCustomerInsights: () => Promise<CustomerInsights>;
}

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  totalCustomers: number;
  averageTicketPrice: number;
  occupancyRate: number;
  topMovies: MovieStats[];
  recentBookings: BookingSummary[];
  revenueByDay: DailyRevenue[];
}

const getDashboardStats = async (dateRange: DateRange): Promise<DashboardStats> => {
  const { startDate, endDate } = dateRange;
  
  // Aggregate revenue
  const revenueAgg = await Ticket.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'confirmed'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        totalBookings: { $sum: 1 },
        averagePrice: { $avg: '$totalPrice' }
      }
    }
  ]);
  
  // Get occupancy rate
  const occupancyRate = await calculateOccupancyRate(dateRange);
  
  // Get top performing movies
  const topMovies = await getTopMovies(dateRange, 5);
  
  // Get recent bookings
  const recentBookings = await getRecentBookings(10);
  
  // Get daily revenue
  const revenueByDay = await getDailyRevenue(dateRange);
  
  return {
    totalRevenue: revenueAgg[0]?.totalRevenue || 0,
    totalBookings: revenueAgg[0]?.totalBookings || 0,
    totalCustomers: await User.countDocuments({ role: 'user' }),
    averageTicketPrice: revenueAgg[0]?.averagePrice || 0,
    occupancyRate,
    topMovies,
    recentBookings,
    revenueByDay
  };
};

const calculateOccupancyRate = async (dateRange: DateRange): Promise<number> => {
  const showtimes = await Showtime.find({
    startTime: { $gte: dateRange.startDate, $lte: dateRange.endDate }
  });
  
  let totalSeats = 0;
  let bookedSeats = 0;
  
  for (const showtime of showtimes) {
    const room = await Room.findById(showtime.roomId);
    totalSeats += room.capacity;
    bookedSeats += showtime.bookedSeats.length;
  }
  
  return totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;
};
```

---

## 🔄 Background Jobs & Automation

### ⏰ Scheduled Tasks
```typescript
interface ScheduledTasks {
  cleanupExpiredSeatLocks: () => Promise<void>;
  sendBookingReminders: () => Promise<void>;
  generateDailyReports: () => Promise<void>;
  updateMovieStatuses: () => Promise<void>;
  processRefunds: () => Promise<void>;
}

// Cleanup expired seat locks (runs every minute)
const cleanupExpiredSeatLocks = async (): Promise<void> => {
  const expiredLocks = await SeatLock.find({
    expiresAt: { $lt: new Date() }
  });
  
  if (expiredLocks.length > 0) {
    await SeatLock.deleteMany({
      _id: { $in: expiredLocks.map(lock => lock._id) }
    });
    
    console.log(`Cleaned up ${expiredLocks.length} expired seat locks`);
  }
};

// Send booking reminders (runs every hour)
const sendBookingReminders = async (): Promise<void> => {
  const reminderTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
  
  const upcomingBookings = await Ticket.find({
    status: 'confirmed',
    'showtime.startTime': {
      $gte: new Date(),
      $lte: reminderTime
    },
    reminderSent: { $ne: true }
  }).populate('showtime movie');
  
  for (const booking of upcomingBookings) {
    await sendBookingReminderEmail(booking);
    await Ticket.updateOne(
      { _id: booking._id },
      { reminderSent: true }
    );
  }
  
  console.log(`Sent ${upcomingBookings.length} booking reminders`);
};

// Auto-update movie statuses based on release dates
const updateMovieStatuses = async (): Promise<void> => {
  const now = new Date();
  
  // Update coming-soon movies to active
  await Movie.updateMany(
    {
      status: 'coming-soon',
      releaseDate: { $lte: now }
    },
    { status: 'active' }
  );
  
  // Update movies to inactive if no future showtimes
  const moviesWithoutFutureShowtimes = await Movie.aggregate([
    {
      $lookup: {
        from: 'showtimes',
        localField: '_id',
        foreignField: 'movieId',
        as: 'showtimes'
      }
    },
    {
      $match: {
        status: 'active',
        'showtimes.startTime': { $not: { $gte: now } }
      }
    }
  ]);
  
  for (const movie of moviesWithoutFutureShowtimes) {
    await Movie.updateOne(
      { _id: movie._id },
      { status: 'inactive' }
    );
  }
};
```

Hệ thống business logic được thiết kế để:
- ✅ **Đảm bảo tính nhất quán**: Validation rules và constraints
- ✅ **Xử lý concurrency**: Seat locking và conflict resolution
- ✅ **Automation**: Background jobs và scheduled tasks
- ✅ **Scalability**: Efficient queries và caching
- ✅ **Reliability**: Error handling và rollback mechanisms
- ✅ **Monitoring**: Comprehensive logging và analytics
