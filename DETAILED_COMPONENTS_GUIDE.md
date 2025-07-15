# 🔍 Chi tiết Components - NaCinema

## 🎯 Giới thiệu chi tiết

File này cung cấp thông tin chi tiết về từng component trong hệ thống NaCinema, bao gồm cách hoạt động, props, state management, và examples cụ thể.

---

## 🪑 SeatMap Component - Chi tiết đầy đủ

### 🎨 Visual Layout Structure
```
                    [SCREEN]
                    ========

    A  [1][2][3]  [4][5][6]  [7][8][9]
    B  [1][2][3]  [4][5][6]  [7][8][9]
    C  [1][2][3]  [4][5][6]  [7][8][9]
    D  [1][2][3]  [4][5][6]  [7][8][9]
    E  [1][2][3]  [4][5][6]  [7][8][9]  <- VIP Row
    F  [1][2][3]  [4][5][6]  [7][8][9]  <- VIP Row
    G  [1][2][3]  [4][5][6]  [7][8][9]
    H  [1][2][3]  [4][5][6]  [7][8][9]
    I  [1][2][3]  [4][5][6]  [7][8][9]

Legend: 🟦 Available  🟢 Selected  🟥 Booked  🟨 Maintenance
```

### 🔧 Complete Props Interface
```typescript
interface SeatMapProps {
  showtime: Showtime;
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  onSeatDeselect: (seatId: string) => void;
  maxSeats?: number;
  disabled?: boolean;
  showPricing?: boolean;
  className?: string;
}

interface Seat {
  id: string;          // "A1", "B2", etc.
  row: string;         // "A", "B", "C"
  number: number;      // 1, 2, 3
  type: SeatType;      // regular, vip, sweet, premium
  status: SeatStatus;  // available, selected, booked, maintenance
  price: number;       // Calculated price
}

interface SeatLayout {
  rows: string[];           // ["A", "B", "C", ...]
  seatsPerRow: number;      // 12
  aisles: number[];         // [3, 6] - positions of aisles
  vipRows: string[];        // ["E", "F"] - VIP rows
  sweetSeats: string[];     // ["H7", "H8"] - couple seats
  premiumRows: string[];    // ["G", "H", "I"] - premium rows
}
```

### 🎯 Seat Types Configuration
```typescript
const SEAT_TYPES = {
  regular: {
    type: 'regular' as const,
    priceMultiplier: 1.0,
    color: 'bg-blue-500 hover:bg-blue-600',
    selectedColor: 'bg-green-500',
    bookedColor: 'bg-gray-400',
    label: 'Thường',
    description: 'Ghế thường',
    icon: '🪑'
  },
  vip: {
    type: 'vip' as const,
    priceMultiplier: 1.5,
    color: 'bg-yellow-500 hover:bg-yellow-600',
    selectedColor: 'bg-green-500',
    bookedColor: 'bg-gray-400',
    label: 'VIP',
    description: 'Ghế VIP (+50%)',
    icon: '👑'
  },
  sweet: {
    type: 'sweet' as const,
    priceMultiplier: 1.3,
    color: 'bg-pink-500 hover:bg-pink-600',
    selectedColor: 'bg-green-500',
    bookedColor: 'bg-gray-400',
    label: 'Sweet',
    description: 'Ghế đôi (+30%)',
    icon: '💕'
  },
  premium: {
    type: 'premium' as const,
    priceMultiplier: 1.2,
    color: 'bg-purple-500 hover:bg-purple-600',
    selectedColor: 'bg-green-500',
    bookedColor: 'bg-gray-400',
    label: 'Premium',
    description: 'Ghế cao cấp (+20%)',
    icon: '⭐'
  }
} as const;
```

### 🔄 Real-time Updates Implementation
```typescript
const useSeatMap = (showtimeId: string) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  // React Query for data fetching
  const { data: seatData, refetch } = useQuery(
    ['seats', showtimeId],
    () => fetchSeatMap(showtimeId),
    {
      refetchInterval: 5000, // Update every 5 seconds
      refetchOnWindowFocus: true,
      onSuccess: (data) => {
        setSeats(data.seats);
        setLoading(false);
      }
    }
  );

  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:5000/seats/${showtimeId}`);
    
    ws.onopen = () => {
      console.log('Connected to seat updates');
    };

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      if (update.type === 'seat_booked') {
        setSeats(prev => prev.map(seat => 
          seat.id === update.seatId 
            ? { ...seat, status: 'booked' }
            : seat
        ));
      }
      
      if (update.type === 'seat_released') {
        setSeats(prev => prev.map(seat => 
          seat.id === update.seatId 
            ? { ...seat, status: 'available' }
            : seat
        ));
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [showtimeId]);

  return { seats, loading, refetch };
};
```

### 🎨 Seat Rendering Logic
```typescript
const SeatComponent = ({ seat, isSelected, onSeatClick }: SeatProps) => {
  const seatType = SEAT_TYPES[seat.type];
  
  const getSeatClasses = () => {
    const baseClasses = "w-8 h-8 rounded-t-md border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-medium relative";
    
    if (seat.status === 'booked') {
      return cn(baseClasses, seatType.bookedColor, "cursor-not-allowed opacity-60");
    }
    
    if (seat.status === 'maintenance') {
      return cn(baseClasses, "bg-red-400 border-red-500 cursor-not-allowed");
    }
    
    if (isSelected) {
      return cn(baseClasses, seatType.selectedColor, "scale-110 shadow-lg border-green-600");
    }
    
    return cn(baseClasses, seatType.color, "hover:scale-105 border-transparent");
  };

  const handleClick = () => {
    if (seat.status === 'booked' || seat.status === 'maintenance') {
      return;
    }
    onSeatClick(seat.id);
  };

  return (
    <div
      className={getSeatClasses()}
      onClick={handleClick}
      title={`${seat.id} - ${seatType.description} - ${formatPrice(seat.price)}`}
    >
      <span className="text-white font-bold">
        {seat.number}
      </span>
      
      {/* Seat type indicator */}
      <div className="absolute -top-1 -right-1 text-xs">
        {seatType.icon}
      </div>
      
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
  );
};
```

### 🧮 Price Calculation System
```typescript
const usePriceCalculation = (selectedSeats: string[], seats: Seat[], basePrice: number) => {
  const [pricing, setPricing] = useState({
    subtotal: 0,
    discount: 0,
    total: 0,
    breakdown: [] as PriceBreakdown[]
  });

  useEffect(() => {
    const breakdown: PriceBreakdown[] = [];
    let subtotal = 0;

    selectedSeats.forEach(seatId => {
      const seat = seats.find(s => s.id === seatId);
      if (seat) {
        const seatType = SEAT_TYPES[seat.type];
        const price = basePrice * seatType.priceMultiplier;
        
        breakdown.push({
          seatId: seat.id,
          type: seat.type,
          basePrice,
          multiplier: seatType.priceMultiplier,
          finalPrice: price
        });
        
        subtotal += price;
      }
    });

    setPricing({
      subtotal,
      discount: 0, // Will be calculated with promotion codes
      total: subtotal,
      breakdown
    });
  }, [selectedSeats, seats, basePrice]);

  return pricing;
};

interface PriceBreakdown {
  seatId: string;
  type: SeatType;
  basePrice: number;
  multiplier: number;
  finalPrice: number;
}
```

### 🎯 Seat Selection Logic
```typescript
const useSeatSelection = (maxSeats: number = 8) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        // Deselect seat
        return prev.filter(id => id !== seatId);
      } else {
        // Select seat
        if (prev.length >= maxSeats) {
          toast.warning(`Chỉ được chọn tối đa ${maxSeats} ghế`);
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const clearSelection = () => {
    setSelectedSeats([]);
  };

  const selectRecommendedSeats = (seats: Seat[], count: number) => {
    // Algorithm to find best seats (center, together)
    const availableSeats = seats.filter(s => s.status === 'available');
    const centerSeats = findCenterSeats(availableSeats, count);
    setSelectedSeats(centerSeats.map(s => s.id));
  };

  return {
    selectedSeats,
    handleSeatSelect,
    clearSelection,
    selectRecommendedSeats
  };
};

const findCenterSeats = (seats: Seat[], count: number): Seat[] => {
  // Implementation to find best seats in center
  const seatsByRow = groupBy(seats, 'row');
  
  for (const [row, rowSeats] of Object.entries(seatsByRow)) {
    const consecutiveSeats = findConsecutiveSeats(rowSeats, count);
    if (consecutiveSeats.length === count) {
      return consecutiveSeats;
    }
  }
  
  // Fallback: return any available seats
  return seats.slice(0, count);
};
```

### 🎨 Legend Component
```typescript
const SeatLegend = () => {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4 p-4 bg-muted rounded-lg">
      {Object.values(SEAT_TYPES).map(seatType => (
        <div key={seatType.type} className="flex items-center gap-2">
          <div className={cn("w-6 h-6 rounded-t-md", seatType.color)} />
          <span className="text-sm font-medium">
            {seatType.label} {seatType.priceMultiplier !== 1 && `(+${Math.round((seatType.priceMultiplier - 1) * 100)}%)`}
          </span>
        </div>
      ))}
      
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-t-md bg-gray-400" />
        <span className="text-sm font-medium">Đã đặt</span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-t-md bg-green-500" />
        <span className="text-sm font-medium">Đang chọn</span>
      </div>
    </div>
  );
};
```

### 📱 Responsive Design
```typescript
const ResponsiveSeatMap = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={cn(
      "seat-map-container",
      isMobile ? "scale-75 origin-top" : "scale-100"
    )}>
      {/* Seat map content */}
    </div>
  );
};
```

---

## 📝 BookingForm Component - Chi tiết đầy đủ

### 🔧 Complete Form Interface
```typescript
interface BookingFormData {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  paymentMethod: PaymentMethod;
  promotionCode?: string;
  specialRequests?: string;
  agreeToTerms: boolean;
}

type PaymentMethod = 'cash' | 'card' | 'momo' | 'banking' | 'vnpay';

interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  icon: React.ComponentType;
  description: string;
  processingFee: number;
  enabled: boolean;
}
```

### 🎯 Payment Methods Configuration
```typescript
const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: 'cash',
    name: 'Tiền mặt',
    icon: Banknote,
    description: 'Thanh toán tại quầy',
    processingFee: 0,
    enabled: true
  },
  {
    id: 'card',
    name: 'Thẻ tín dụng',
    icon: CreditCard,
    description: 'Visa, Mastercard',
    processingFee: 0.03, // 3%
    enabled: true
  },
  {
    id: 'momo',
    name: 'MoMo',
    icon: Smartphone,
    description: 'Ví điện tử MoMo',
    processingFee: 0.01, // 1%
    enabled: true
  },
  {
    id: 'banking',
    name: 'Chuyển khoản',
    icon: Building2,
    description: 'Internet Banking',
    processingFee: 0,
    enabled: true
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: Wallet,
    description: 'Cổng thanh toán VNPay',
    processingFee: 0.02, // 2%
    enabled: true
  }
];
```

### 🔄 Form Validation Schema
```typescript
const bookingSchema = z.object({
  customerInfo: z.object({
    name: z.string()
      .min(2, 'Tên phải có ít nhất 2 ký tự')
      .max(50, 'Tên không được quá 50 ký tự')
      .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên chỉ được chứa chữ cái và khoảng trắng'),
    
    email: z.string()
      .email('Email không hợp lệ')
      .max(100, 'Email không được quá 100 ký tự'),
    
    phone: z.string()
      .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ')
      .min(10, 'Số điện thoại phải có ít nhất 10 số')
      .max(11, 'Số điện thoại không được quá 11 số'),
    
    address: z.string().optional()
  }),
  
  paymentMethod: z.enum(['cash', 'card', 'momo', 'banking', 'vnpay']),
  
  promotionCode: z.string()
    .optional()
    .refine(async (code) => {
      if (!code) return true;
      return await validatePromotionCode(code);
    }, 'Mã khuyến mãi không hợp lệ'),
  
  specialRequests: z.string()
    .max(500, 'Yêu cầu đặc biệt không được quá 500 ký tự')
    .optional(),
  
  agreeToTerms: z.boolean()
    .refine(val => val === true, 'Bạn phải đồng ý với điều khoản sử dụng')
});
```

Component này cung cấp cái nhìn chi tiết về cách các components hoạt động trong hệ thống NaCinema, giúp developers hiểu rõ hơn về implementation và có thể customize theo nhu cầu.
