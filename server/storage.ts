import { 
  users, movies, cinemas, rooms, showtimes, tickets, reviews, promotions,
  type User, type InsertUser, type Movie, type InsertMovie,
  type Cinema, type InsertCinema, type Room, type InsertRoom,
  type Showtime, type InsertShowtime, type Ticket, type InsertTicket,
  type Review, type InsertReview, type Promotion, type InsertPromotion
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Movie methods
  getMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, updates: Partial<Movie>): Promise<Movie | undefined>;
  deleteMovie(id: number): Promise<boolean>;
  
  // Cinema methods
  getCinemas(): Promise<Cinema[]>;
  getCinema(id: number): Promise<Cinema | undefined>;
  createCinema(cinema: InsertCinema): Promise<Cinema>;
  updateCinema(id: number, updates: Partial<Cinema>): Promise<Cinema | undefined>;
  deleteCinema(id: number): Promise<boolean>;
  
  // Room methods
  getRooms(): Promise<Room[]>;
  getRoom(id: number): Promise<Room | undefined>;
  getRoomsByCinema(cinemaId: number): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoom(id: number, updates: Partial<Room>): Promise<Room | undefined>;
  deleteRoom(id: number): Promise<boolean>;
  
  // Showtime methods
  getShowtimes(): Promise<Showtime[]>;
  getShowtime(id: number): Promise<Showtime | undefined>;
  getShowtimesByMovie(movieId: number): Promise<Showtime[]>;
  createShowtime(showtime: InsertShowtime): Promise<Showtime>;
  updateShowtime(id: number, updates: Partial<Showtime>): Promise<Showtime | undefined>;
  deleteShowtime(id: number): Promise<boolean>;
  
  // Ticket methods
  getTickets(): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketsByUser(userId: number): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket | undefined>;
  deleteTicket(id: number): Promise<boolean>;
  
  // Review methods
  getReviews(): Promise<Review[]>;
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByMovie(movieId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, updates: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  
  // Promotion methods
  getPromotions(): Promise<Promotion[]>;
  getPromotion(id: number): Promise<Promotion | undefined>;
  getPromotionByCode(code: string): Promise<Promotion | undefined>;
  getActivePromotions(): Promise<Promotion[]>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  updatePromotion(id: number, updates: Partial<Promotion>): Promise<Promotion | undefined>;
  deletePromotion(id: number): Promise<boolean>;
  
  // User management
  deleteUser(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private movies: Map<number, Movie> = new Map();
  private cinemas: Map<number, Cinema> = new Map();
  private rooms: Map<number, Room> = new Map();
  private showtimes: Map<number, Showtime> = new Map();
  private tickets: Map<number, Ticket> = new Map();
  private reviewsMap: Map<number, Review> = new Map();
  private promotionsMap: Map<number, Promotion> = new Map();
  
  private currentUserId = 1;
  private currentMovieId = 1;
  private currentCinemaId = 1;
  private currentRoomId = 1;
  private currentShowtimeId = 1;
  private currentTicketId = 1;
  private currentReviewId = 1;
  private currentPromotionId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with some sample data
    // Create admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      email: "admin@cinemabook.vn",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      fullName: "Administrator",
      phone: "0123456789",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Create additional admin user for testing
    const adminUser2: User = {
      id: this.currentUserId++,
      username: "admin2",
      email: "admin2@cinemabook.vn",
      password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      fullName: "Admin User 2",
      phone: "0987654321",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminUser2.id, adminUser2);

    // Create sample movies
    const movie1: Movie = {
      id: this.currentMovieId++,
      title: "Fast & Furious X",
      description: "Dom Toretto và gia đình của anh ấy trở thành mục tiêu của con trai báo thù của trùm ma túy Hernan Reyes.",
      genre: "Hành động",
      duration: 142,
      ageRating: "16+",
      posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=600",
      trailerUrl: "https://www.youtube.com/watch?v=example",
      actors: ["Vin Diesel", "Michelle Rodriguez", "Tyrese Gibson", "Ludacris"],
      director: "Louis Leterrier",
      releaseDate: new Date("2024-01-15"),
      status: "active",
      createdAt: new Date(),
    };
    this.movies.set(movie1.id, movie1);

    const movie2: Movie = {
      id: this.currentMovieId++,
      title: "Em và Trịnh",
      description: "Câu chuyện tình yêu đẹp đẽ và cuộc đời đầy thăng trầm của nhạc sĩ Trịnh Công Sơn.",
      genre: "Tâm lý",
      duration: 105,
      ageRating: "13+",
      posterUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=600",
      trailerUrl: "https://www.youtube.com/watch?v=example2",
      actors: ["Avin Lu", "Anh Tú"],
      director: "Phan Gia Nhật Linh",
      releaseDate: new Date("2024-02-20"),
      status: "active",
      createdAt: new Date(),
    };
    this.movies.set(movie2.id, movie2);

    // Create coming soon movie
    const movie3: Movie = {
      id: this.currentMovieId++,
      title: "Spider-Man: Across the Spider-Verse",
      description: "Phần tiếp theo của bộ phim hoạt hình Spider-Man đoạt giải Oscar",
      genre: "Hành động",
      duration: 140,
      ageRating: "13+",
      posterUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
      actors: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
      director: "Joaquim Dos Santos",
      releaseDate: new Date("2024-05-20"),
      status: "coming-soon",
      createdAt: new Date(),
    };
    this.movies.set(movie3.id, movie3);

    // Create sample cinemas
    const cinema1: Cinema = {
      id: this.currentCinemaId++,
      name: "CGV Vincom Center",
      address: "191 Bà Triệu, Hai Bà Trưng, Hà Nội",
      phone: "1900 6017",
      createdAt: new Date(),
    };
    this.cinemas.set(cinema1.id, cinema1);

    const cinema2: Cinema = {
      id: this.currentCinemaId++,
      name: "Lotte Cinema Landmark",
      address: "Keangnam Landmark, Phạm Hùng, Cầu Giấy, Hà Nội",
      phone: "1900 5555",
      createdAt: new Date(),
    };
    this.cinemas.set(cinema2.id, cinema2);

    const cinema3: Cinema = {
      id: this.currentCinemaId++,
      name: "Galaxy Cinema Nguyễn Du",
      address: "116 Nguyễn Du, Hai Bà Trưng, Hà Nội",
      phone: "1900 2224",
      createdAt: new Date(),
    };
    this.cinemas.set(cinema3.id, cinema3);

    const cinema4: Cinema = {
      id: this.currentCinemaId++,
      name: "BHD Star Times City",
      address: "458 Minh Khai, Hai Bà Trưng, Hà Nội",
      phone: "1900 2099",
      createdAt: new Date(),
    };
    this.cinemas.set(cinema4.id, cinema4);

    // Create rooms for Cinema 1 (CGV Vincom Center)
    const room1: Room = {
      id: this.currentRoomId++,
      cinemaId: cinema1.id,
      name: "Phòng 1",
      capacity: 120,
      seatLayout: {
        rows: 10,
        seatsPerRow: 12,
        seatMap: Array.from({ length: 10 }, (_, i) => 
          Array.from({ length: 12 }, (_, j) => ({
            row: String.fromCharCode(65 + i),
            number: j + 1,
            available: true
          }))
        )
      },
      createdAt: new Date(),
    };
    this.rooms.set(room1.id, room1);

    const room2: Room = {
      id: this.currentRoomId++,
      cinemaId: cinema1.id,
      name: "Phòng 2",
      capacity: 100,
      seatLayout: {
        rows: 10,
        seatsPerRow: 10,
        seatMap: Array.from({ length: 10 }, (_, i) => 
          Array.from({ length: 10 }, (_, j) => ({
            row: String.fromCharCode(65 + i),
            number: j + 1,
            available: true
          }))
        )
      },
      createdAt: new Date(),
    };
    this.rooms.set(room2.id, room2);

    // Create rooms for Cinema 2 (Lotte Cinema Landmark)
    const room3: Room = {
      id: this.currentRoomId++,
      cinemaId: cinema2.id,
      name: "Phòng A",
      capacity: 150,
      seatLayout: {
        rows: 10,
        seatsPerRow: 15,
        seatMap: Array.from({ length: 10 }, (_, i) => 
          Array.from({ length: 15 }, (_, j) => ({
            row: String.fromCharCode(65 + i),
            number: j + 1,
            available: true
          }))
        )
      },
      createdAt: new Date(),
    };
    this.rooms.set(room3.id, room3);

    const room4: Room = {
      id: this.currentRoomId++,
      cinemaId: cinema2.id,
      name: "Phòng B",
      capacity: 140,
      seatLayout: {
        rows: 10,
        seatsPerRow: 14,
        seatMap: Array.from({ length: 10 }, (_, i) => 
          Array.from({ length: 14 }, (_, j) => ({
            row: String.fromCharCode(65 + i),
            number: j + 1,
            available: true
          }))
        )
      },
      createdAt: new Date(),
    };
    this.rooms.set(room4.id, room4);

    // Create rooms for Cinema 3 (Galaxy Cinema Nguyễn Du)
    const room5: Room = {
      id: this.currentRoomId++,
      cinemaId: cinema3.id,
      name: "Phòng 1",
      capacity: 110,
      seatLayout: {
        rows: 10,
        seatsPerRow: 11,
        seatMap: Array.from({ length: 10 }, (_, i) => 
          Array.from({ length: 11 }, (_, j) => ({
            row: String.fromCharCode(65 + i),
            number: j + 1,
            available: true
          }))
        )
      },
      createdAt: new Date(),
    };
    this.rooms.set(room5.id, room5);

    // Create rooms for Cinema 4 (BHD Star Times City)
    const room6: Room = {
      id: this.currentRoomId++,
      cinemaId: cinema4.id,
      name: "Phòng Premium",
      capacity: 80,
      seatLayout: {
        rows: 8,
        seatsPerRow: 10,
        seatMap: Array.from({ length: 8 }, (_, i) => 
          Array.from({ length: 10 }, (_, j) => ({
            row: String.fromCharCode(65 + i),
            number: j + 1,
            available: true
          }))
        )
      },
      createdAt: new Date(),
    };
    this.rooms.set(room6.id, room6);

    // Create sample showtimes
    const showtime1: Showtime = {
      id: this.currentShowtimeId++,
      movieId: movie1.id,
      roomId: room1.id,
      startTime: new Date("2024-12-25T20:00:00"),
      endTime: new Date("2024-12-25T22:22:00"),
      price: "85000",
      availableSeats: Array.from({ length: 10 }, (_, i) => 
        Array.from({ length: 12 }, (_, j) => `${String.fromCharCode(65 + i)}${j + 1}`)
      ).flat(),
      createdAt: new Date(),
    };
    this.showtimes.set(showtime1.id, showtime1);

    // Create showtime for Em và Trịnh
    const showtime2: Showtime = {
      id: this.currentShowtimeId++,
      movieId: movie2.id,
      roomId: room1.id,
      startTime: new Date("2024-12-25T18:00:00"),
      endTime: new Date("2024-12-25T19:45:00"),
      price: "75000",
      availableSeats: Array.from({ length: 10 }, (_, i) => 
        Array.from({ length: 12 }, (_, j) => `${String.fromCharCode(65 + i)}${j + 1}`)
      ).flat(),
      createdAt: new Date(),
    };
    this.showtimes.set(showtime2.id, showtime2);

    // Create another showtime for Em và Trịnh
    const showtime3: Showtime = {
      id: this.currentShowtimeId++,
      movieId: movie2.id,
      roomId: room1.id,
      startTime: new Date("2024-12-25T21:00:00"),
      endTime: new Date("2024-12-25T22:45:00"),
      price: "75000",
      availableSeats: Array.from({ length: 10 }, (_, i) => 
        Array.from({ length: 12 }, (_, j) => `${String.fromCharCode(65 + i)}${j + 1}`)
      ).flat(),
      createdAt: new Date(),
    };
    this.showtimes.set(showtime3.id, showtime3);

    // Create sample promotions
    const promotion1: Promotion = {
      id: this.currentPromotionId++,
      title: "Khuyến mãi sinh viên",
      description: "Giảm 20% cho tất cả sinh viên có thẻ sinh viên",
      discountType: "percentage",
      discountValue: "20",
      minPurchase: "100000",
      maxDiscount: "50000",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      usageLimit: 1000,
      currentUsage: 0,
      code: "STUDENT20",
      status: "active",
      cinemaId: null,
      createdAt: new Date(),
    };
    this.promotionsMap.set(promotion1.id, promotion1);

    const promotion2: Promotion = {
      id: this.currentPromotionId++,
      title: "Thứ 2 vui vẻ",
      description: "Giảm 30% cho tất cả suất chiếu vào thứ 2",
      discountType: "percentage",
      discountValue: "30",
      minPurchase: null,
      maxDiscount: null,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      usageLimit: null,
      currentUsage: 0,
      code: "MONDAY30",
      status: "active",
      cinemaId: 1,
      createdAt: new Date(),
    };
    this.promotionsMap.set(promotion2.id, promotion2);
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      role: insertUser.role || "user",
      phone: insertUser.phone || null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Movie methods
  async getMovies(): Promise<Movie[]> {
    return Array.from(this.movies.values());
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const movie: Movie = {
      ...insertMovie,
      id: this.currentMovieId++,
      status: insertMovie.status || "active",
      posterUrl: insertMovie.posterUrl || null,
      trailerUrl: insertMovie.trailerUrl || null,
      actors: insertMovie.actors || null,
      director: insertMovie.director || null,
      releaseDate: insertMovie.releaseDate || null,
      createdAt: new Date(),
    };
    this.movies.set(movie.id, movie);
    return movie;
  }

  async updateMovie(id: number, updates: Partial<Movie>): Promise<Movie | undefined> {
    const movie = this.movies.get(id);
    if (!movie) return undefined;
    
    const updatedMovie = { ...movie, ...updates };
    this.movies.set(id, updatedMovie);
    return updatedMovie;
  }

  async deleteMovie(id: number): Promise<boolean> {
    return this.movies.delete(id);
  }

  // Cinema methods
  async getCinemas(): Promise<Cinema[]> {
    return Array.from(this.cinemas.values());
  }

  async getCinema(id: number): Promise<Cinema | undefined> {
    return this.cinemas.get(id);
  }

  async createCinema(insertCinema: InsertCinema): Promise<Cinema> {
    const cinema: Cinema = {
      ...insertCinema,
      id: this.currentCinemaId++,
      phone: insertCinema.phone || null,
      createdAt: new Date(),
    };
    this.cinemas.set(cinema.id, cinema);
    return cinema;
  }

  async updateCinema(id: number, updates: Partial<Cinema>): Promise<Cinema | undefined> {
    const cinema = this.cinemas.get(id);
    if (!cinema) return undefined;
    
    const updatedCinema = { ...cinema, ...updates };
    this.cinemas.set(id, updatedCinema);
    return updatedCinema;
  }

  async deleteCinema(id: number): Promise<boolean> {
    return this.cinemas.delete(id);
  }

  // Room methods
  async getRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values());
  }

  async getRoom(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRoomsByCinema(cinemaId: number): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(room => room.cinemaId === cinemaId);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const room: Room = {
      ...insertRoom,
      id: this.currentRoomId++,
      createdAt: new Date(),
    };
    this.rooms.set(room.id, room);
    return room;
  }

  async updateRoom(id: number, updates: Partial<Room>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async deleteRoom(id: number): Promise<boolean> {
    return this.rooms.delete(id);
  }

  // Showtime methods
  async getShowtimes(): Promise<Showtime[]> {
    return Array.from(this.showtimes.values());
  }

  async getShowtime(id: number): Promise<Showtime | undefined> {
    return this.showtimes.get(id);
  }

  async getShowtimesByMovie(movieId: number): Promise<Showtime[]> {
    return Array.from(this.showtimes.values()).filter(showtime => showtime.movieId === movieId);
  }

  async createShowtime(insertShowtime: InsertShowtime): Promise<Showtime> {
    const showtime: Showtime = {
      ...insertShowtime,
      id: this.currentShowtimeId++,
      availableSeats: insertShowtime.availableSeats || null,
      createdAt: new Date(),
    };
    this.showtimes.set(showtime.id, showtime);
    return showtime;
  }

  async updateShowtime(id: number, updates: Partial<Showtime>): Promise<Showtime | undefined> {
    const showtime = this.showtimes.get(id);
    if (!showtime) return undefined;
    
    const updatedShowtime = { ...showtime, ...updates };
    this.showtimes.set(id, updatedShowtime);
    return updatedShowtime;
  }

  async deleteShowtime(id: number): Promise<boolean> {
    return this.showtimes.delete(id);
  }

  // Ticket methods
  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async getTicketsByUser(userId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(ticket => ticket.userId === userId);
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const ticket: Ticket = {
      ...insertTicket,
      id: this.currentTicketId++,
      status: insertTicket.status || "pending",
      paymentMethod: insertTicket.paymentMethod || null,
      customerInfo: insertTicket.customerInfo || null,
      createdAt: new Date(),
    };
    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { ...ticket, ...updates };
    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async deleteTicket(id: number): Promise<boolean> {
    return this.tickets.delete(id);
  }

  // Review methods
  async getReviews(): Promise<Review[]> {
    return Array.from(this.reviewsMap.values());
  }

  async getReview(id: number): Promise<Review | undefined> {
    return this.reviewsMap.get(id);
  }

  async getReviewsByMovie(movieId: number): Promise<Review[]> {
    return Array.from(this.reviewsMap.values()).filter(review => review.movieId === movieId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const review: Review = {
      ...insertReview,
      id: this.currentReviewId++,
      content: insertReview.content || null,
      status: insertReview.status || "active",
      createdAt: new Date(),
    };
    this.reviewsMap.set(review.id, review);
    return review;
  }

  async updateReview(id: number, updates: Partial<Review>): Promise<Review | undefined> {
    const review = this.reviewsMap.get(id);
    if (!review) return undefined;
    
    const updatedReview = { ...review, ...updates };
    this.reviewsMap.set(id, updatedReview);
    return updatedReview;
  }

  async deleteReview(id: number): Promise<boolean> {
    return this.reviewsMap.delete(id);
  }

  // Promotion methods
  async getPromotions(): Promise<Promotion[]> {
    return Array.from(this.promotionsMap.values());
  }

  async getPromotion(id: number): Promise<Promotion | undefined> {
    return this.promotionsMap.get(id);
  }

  async getPromotionByCode(code: string): Promise<Promotion | undefined> {
    return Array.from(this.promotionsMap.values()).find(promotion => promotion.code === code);
  }

  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    return Array.from(this.promotionsMap.values()).filter(promotion => 
      promotion.status === "active" && 
      promotion.startDate <= now && 
      promotion.endDate >= now
    );
  }

  async createPromotion(insertPromotion: InsertPromotion): Promise<Promotion> {
    const promotion: Promotion = {
      ...insertPromotion,
      id: this.currentPromotionId++,
      code: insertPromotion.code || null,
      status: insertPromotion.status || "active",
      cinemaId: insertPromotion.cinemaId || null,
      minPurchase: insertPromotion.minPurchase || null,
      maxDiscount: insertPromotion.maxDiscount || null,
      usageLimit: insertPromotion.usageLimit || null,
      currentUsage: 0,
      createdAt: new Date(),
    };
    this.promotionsMap.set(promotion.id, promotion);
    return promotion;
  }

  async updatePromotion(id: number, updates: Partial<Promotion>): Promise<Promotion | undefined> {
    const promotion = this.promotionsMap.get(id);
    if (!promotion) return undefined;
    
    const updatedPromotion = { ...promotion, ...updates };
    this.promotionsMap.set(id, updatedPromotion);
    return updatedPromotion;
  }

  async deletePromotion(id: number): Promise<boolean> {
    const deleted = this.promotionsMap.delete(id);
    return deleted;
  }

  async deleteUser(id: number): Promise<boolean> {
    const deleted = this.users.delete(id);
    return deleted;
  }
}

import { MongoStorage } from './mongodb';

export const storage = new MongoStorage();
