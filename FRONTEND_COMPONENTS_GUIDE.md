# 🎨 Frontend Components Guide - NaCinema

## 🎯 Tổng quan Frontend Architecture

NaCinema Frontend được xây dựng với **React 18**, **TypeScript**, **Tailwind CSS** và **shadcn/ui** components, sử dụng **Vite** làm build tool và **React Query** cho state management.

### 🏗️ Kiến trúc tổng thể

```
Frontend Architecture
├── 🎨 Presentation Layer (React Components)
│   ├── Pages (Route Components)
│   ├── Components (Reusable UI)
│   └── UI Library (shadcn/ui)
├── 🔄 State Management Layer
│   ├── Server State (React Query)
│   ├── Client State (useState, useReducer)
│   └── Form State (React Hook Form)
├── 🌐 Data Layer
│   ├── API Client (Fetch/Axios)
│   ├── Authentication (JWT)
│   └── Local Storage
└── 🎛️ Configuration Layer
    ├── Routing (Wouter)
    ├── Styling (Tailwind CSS)
    └── Build (Vite)
```

### 🎨 Design System

- **Color Palette**: Cinema-themed với dark/light mode
- **Typography**: Inter font family với responsive sizes
- **Spacing**: Consistent spacing scale (4px base)
- **Components**: Accessible, reusable, customizable

---

## 📱 Main Application Structure

### `client/src/App.tsx`

- **Tác dụng**: Root component của ứng dụng
- **Chức năng**:
  - Setup routing với Wouter
  - Authentication context
  - Global layout và navigation
  - Error boundaries

```typescript
// Cấu trúc routing chính
const routes = {
  "/": Home,
  "/movies/:id": MovieDetail,
  "/login": Login,
  "/register": Register,
  "/admin": AdminPanel,
  "/staff": StaffPanel,
};
```

### `client/src/main.tsx`

- **Tác dụng**: Entry point của React app
- **Setup**:
  - React Query client
  - Global CSS imports
  - App mounting

---

## 🧩 Core Components

### 🧭 Navigation Component (`Navigation.tsx`)

**Tác dụng**: Thanh điều hướng chính của ứng dụng với responsive design và role-based access

#### 🎨 Visual Structure

```
Desktop Navigation:
[Logo] [Home] [Movies] [Cinemas] [Promotions] ... [User Menu] [Theme Toggle]

Mobile Navigation:
[Logo] [Hamburger Menu]
└── Dropdown: [All Menu Items]
```

#### 🔧 Props Interface

```typescript
interface NavigationProps {
  user?: User | null;
  onLogout: () => void;
  className?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "staff" | "admin";
  fullName?: string;
}
```

#### 🎯 Key Features

**1. Responsive Design**

```typescript
// Mobile menu state
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

// Responsive breakpoints
const isMobile = useMediaQuery("(max-width: 768px)");
```

**2. Role-based Menu Items**

```typescript
const getMenuItems = (user: User | null) => {
  const baseItems = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/movies", label: "Phim", icon: Film },
    { href: "/cinemas", label: "Rạp chiếu", icon: Building },
    { href: "/promotions", label: "Khuyến mãi", icon: Gift },
  ];

  if (!user) return baseItems;

  const userItems = [
    ...baseItems,
    { href: "/tickets", label: "Vé của tôi", icon: Ticket },
  ];

  if (user.role === "staff" || user.role === "admin") {
    userItems.push({ href: "/staff", label: "Quản lý", icon: Settings });
  }

  if (user.role === "admin") {
    userItems.push({ href: "/admin", label: "Admin", icon: Shield });
  }

  return userItems;
};
```

**3. Authentication State Management**

```typescript
const { user, logout } = useAuth();
const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

const handleLogout = async () => {
  try {
    await logout();
    toast.success("Đăng xuất thành công");
    navigate("/");
  } catch (error) {
    toast.error("Lỗi đăng xuất");
  }
};
```

---

### 🎬 Movie Components

#### `MovieCard.tsx`

**Tác dụng**: Hiển thị thông tin phim dạng card với interactive elements

##### 🎨 Visual Structure

```
┌─────────────────────────┐
│                         │
│      [Poster Image]     │
│                         │
│  [Status Badge (if any)]│
├─────────────────────────┤
│ Title                   │
│ Rating ★★★★☆ | Genre    │
│ Duration: 120 min       │
│                         │
│ [Booking Button]        │
└─────────────────────────┘
```

##### 🔧 Props Interface

```typescript
interface MovieCardProps {
  movie: Movie;
  onBooking?: (movieId: string) => void;
  showStatus?: boolean;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string;
  duration: number; // minutes
  rating: string; // PG, PG-13, R
  poster: string; // URL
  status: "active" | "coming-soon" | "inactive";
  releaseDate: string;
}
```

##### 🎯 Key Features

**1. Responsive Image Handling**

```typescript
const PosterImage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative aspect-[2/3] overflow-hidden rounded-t-md">
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageOff className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      <Image
        src={movie.poster}
        alt={movie.title}
        fill
        className={cn(
          "object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
};
```

**2. Status Indicators**

```typescript
const StatusBadge = () => {
  if (!showStatus) return null;

  const statusConfig = {
    active: { label: "Đang chiếu", variant: "default" as const, icon: Play },
    "coming-soon": {
      label: "Sắp chiếu",
      variant: "secondary" as const,
      icon: Clock,
    },
    inactive: {
      label: "Ngừng chiếu",
      variant: "outline" as const,
      icon: XCircle,
    },
  };

  const config = statusConfig[movie.status];

  return (
    <Badge variant={config.variant} className="absolute top-2 right-2 z-10">
      <config.icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
};
```

**3. Interactive Elements**

```typescript
const handleBooking = () => {
  if (onBooking) {
    onBooking(movie.id);
  } else {
    navigate(`/movies/${movie.id}`);
  }
};

// Render booking button
const BookingButton = () => (
  <Button
    variant="default"
    size="sm"
    className="w-full mt-2"
    onClick={handleBooking}
    disabled={movie.status !== "active"}
  >
    {movie.status === "active" ? "Đặt vé" : "Chi tiết"}
  </Button>
);
```

#### `MovieDetail.tsx` (Page)

**Tác dụng**: Trang chi tiết phim

**Sections**:

- Movie information panel
- Showtimes selection
- Seat booking integration
- Reviews và ratings

**State Management**:

```typescript
const { data: movie } = useQuery(["movie", movieId]);
const { data: showtimes } = useQuery(["showtimes", movieId]);
const { data: reviews } = useQuery(["reviews", movieId]);
```

---

### 🪑 Seat Selection System

#### `SeatMap.tsx`

**Tác dụng**: Component chọn ghế ngồi tương tác

**Props**:

```typescript
interface SeatMapProps {
  showtime: Showtime;
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  onSeatDeselect: (seatId: string) => void;
}
```

**Seat Types & Pricing**:

- **Regular**: Giá cơ bản
- **VIP**: +50% giá cơ bản
- **Sweet**: +30% giá cơ bản (ghế đôi)
- **Premium**: +20% giá cơ bản

**Features**:

- Visual seat layout
- Real-time availability
- Price calculation
- Seat type indicators

**Seat States**:

```typescript
type SeatStatus = "available" | "selected" | "booked" | "maintenance";
```

---

### 📝 Booking System

#### `BookingForm.tsx`

**Tác dụng**: Form đặt vé hoàn chỉnh

**Form Fields**:

```typescript
interface BookingFormData {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod: "cash" | "card" | "momo" | "banking";
  promotionCode?: string;
}
```

**Validation**:

- Email format validation
- Phone number validation
- Required fields checking
- Promotion code verification

**Payment Integration**:

- Multiple payment methods
- Price calculation với discounts
- Booking confirmation

---

### ⭐ Review System

#### `MovieReviews.tsx`

**Tác dụng**: Hệ thống đánh giá phim

**Features**:

- Star rating input (1-5 stars)
- Comment text area
- Review listing với pagination
- User authentication check

**Review Display**:

```typescript
interface ReviewProps {
  review: Review;
  canEdit?: boolean;
  onEdit?: (reviewId: string) => void;
  onDelete?: (reviewId: string) => void;
}
```

---

## 🎛️ Admin & Staff Panels

### 👑 Admin Panel (`AdminPanel.tsx`)

**Sections**:

1. **Dashboard**: Thống kê tổng quan
2. **Movies Management**: CRUD operations cho phim
3. **Users Management**: Quản lý người dùng
4. **Bookings Management**: Quản lý đặt vé
5. **Promotions Management**: Quản lý khuyến mãi
6. **Analytics**: Báo cáo và thống kê

**Key Features**:

- Real-time statistics
- Data tables với sorting/filtering
- Modal forms cho CRUD operations
- Export functionality

### 👨‍💼 Staff Panel (`StaffPanel.tsx`)

**Limited Access**:

- Showtimes management
- Booking approval/cancellation
- Customer support tools

---

## 🎨 UI Components Library

### shadcn/ui Components

#### `Button.tsx`

**Variants**: default, destructive, outline, secondary, ghost, link
**Sizes**: default, sm, lg, icon

#### `Card.tsx`

**Structure**: CardHeader, CardContent, CardFooter
**Usage**: Movie cards, booking summaries, dashboard widgets

#### `Dialog.tsx`

**Usage**: Modal forms, confirmations, detailed views
**Features**: Overlay, close on escape, focus management

#### `Form.tsx`

**Integration**: React Hook Form + Zod validation
**Components**: FormField, FormItem, FormLabel, FormControl, FormMessage

#### `Table.tsx`

**Features**: Responsive design, sorting, pagination
**Usage**: Admin data tables, booking history

#### `Toast.tsx`

**Types**: success, error, warning, info
**Usage**: User feedback, API responses

---

## 📱 Responsive Design

### Breakpoints (Tailwind CSS)

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Mobile-First Approach

- Components designed for mobile first
- Progressive enhancement for larger screens
- Touch-friendly interactions

---

## 🔄 State Management

### React Query Usage

#### Data Fetching

```typescript
// Movies
const { data: movies, isLoading } = useQuery(["movies"], fetchMovies);

// User tickets
const { data: tickets } = useQuery(["tickets"], fetchUserTickets, {
  enabled: !!user,
});

// Real-time seat updates
const { data: seatMap } = useQuery(
  ["seats", showtimeId],
  () => fetchSeatMap(showtimeId),
  {
    refetchInterval: 5000, // Update every 5 seconds
  }
);
```

#### Mutations

```typescript
// Booking mutation
const bookingMutation = useMutation(createBooking, {
  onSuccess: data => {
    queryClient.invalidateQueries(["seats", showtimeId]);
    toast.success("Booking successful!");
    navigate(`/tickets/${data.bookingCode}`);
  },
  onError: error => {
    toast.error(error.message);
  },
});
```

### Local State

- Component state với `useState`
- Form state với React Hook Form
- UI state (modals, dropdowns) với local state

---

## 🎯 User Experience Features

### Loading States

- Skeleton loaders cho content
- Spinner cho actions
- Progressive loading cho images

### Error Handling

- Error boundaries cho component crashes
- Retry mechanisms cho failed requests
- User-friendly error messages

### Accessibility

- ARIA labels và roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance

### Performance Optimizations

- Code splitting với React.lazy
- Image optimization và lazy loading
- Memoization với React.memo
- Virtual scrolling cho large lists

---

## 🔧 Development Tools

### TypeScript Integration

- Strict type checking
- Interface definitions
- Generic components
- Type-safe API calls

### Styling System

- Tailwind CSS utility classes
- CSS-in-JS với styled-components (nếu cần)
- Design tokens consistency
- Dark mode support

### Development Experience

- Hot reload với Vite
- ESLint và Prettier
- VS Code extensions
- Component storybook (future)

---

---

## 🚀 Build & Deployment

### Development Build

```bash
npm run dev  # Start development server
```

### Production Build

```bash
npm run build  # Build for production
npm run start  # Start production server
```

### Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=NaCinema
```

---

Frontend được thiết kế với focus vào:

- ✅ **User Experience**: Intuitive, responsive, accessible
- ✅ **Performance**: Fast loading, smooth interactions
- ✅ **Maintainability**: Clean code, reusable components
- ✅ **Scalability**: Easy to extend và modify
- ✅ **Type Safety**: TypeScript throughout
- ✅ **Modern Standards**: Latest React patterns và best practices
