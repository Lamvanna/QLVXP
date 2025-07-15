export interface MovieWithDetails {
  id: number;
  title: string;
  description: string;
  genre: string;
  duration: number;
  ageRating: string;
  posterUrl?: string;
  trailerUrl?: string;
  actors?: string[];
  director?: string;
  releaseDate?: Date;
  status: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface ShowtimeWithDetails {
  id: number;
  movieId: number;
  roomId: number;
  startTime: Date;
  endTime: Date;
  price: string;
  availableSeats?: string[];
  movie?: MovieWithDetails;
  room?: {
    id: number;
    name: string;
    cinema: {
      id: number;
      name: string;
      address: string;
    };
  };
}

export interface TicketWithDetails {
  id: number;
  userId: number;
  showtimeId: number;
  seats: string[];
  totalPrice: string;
  status: string;
  paymentMethod?: string;
  bookingCode: string;
  customerInfo?: any;
  createdAt: Date;
  movie?: MovieWithDetails;
  showtime?: ShowtimeWithDetails;
}

export interface SeatSelection {
  row: string;
  number: number;
  seatId: string;
  available: boolean;
  selected: boolean;
}

export interface BookingData {
  showtimeId: number;
  seats: string[];
  totalPrice: string;
  paymentMethod: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
}
