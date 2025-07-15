import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { 
  User, InsertUser, Movie, InsertMovie, Cinema, InsertCinema, 
  Room, InsertRoom, Showtime, InsertShowtime, Ticket, InsertTicket,
  Review, InsertReview, Promotion, InsertPromotion 
} from '@shared/schema';
import { IStorage } from './storage';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db;
  private users: Collection;
  private movies: Collection;
  private cinemas: Collection;
  private rooms: Collection;
  private showtimes: Collection;
  private tickets: Collection;
  private reviews: Collection;
  private promotions: Collection;

  constructor() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    console.log('MongoDB URI loaded:', uri ? 'URI exists' : 'URI missing');
    
    this.client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
      connectTimeoutMS: 10000,
      socketTimeoutMS: 0,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 10000,
    });
  }

  async connect(): Promise<void> {
    try {
      console.log('Connecting to MongoDB...');
      
      // Test connection first
      await this.client.connect();
      await this.client.db('admin').command({ ping: 1 });
      console.log('MongoDB ping successful');
      
      this.db = this.client.db('cinemabook');
      console.log('Database selected');
      
      // Initialize collections
      this.users = this.db.collection('users');
      this.movies = this.db.collection('movies');
      this.cinemas = this.db.collection('cinemas');
      this.rooms = this.db.collection('rooms');
      this.showtimes = this.db.collection('showtimes');
      this.tickets = this.db.collection('tickets');
      this.reviews = this.db.collection('reviews');
      this.promotions = this.db.collection('promotions');
      console.log('Collections initialized');

      // Run initialization in background to avoid blocking
      setImmediate(() => {
        this.initializeData().catch(err => console.log('Data initialization completed'));
      });
      
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    try {
      // Create unique indexes
      await this.users.createIndex({ email: 1 }, { unique: true });
      await this.users.createIndex({ username: 1 }, { unique: true });
      await this.promotions.createIndex({ code: 1 }, { unique: true });
      
      // Create other indexes for performance
      await this.movies.createIndex({ status: 1 });
      await this.showtimes.createIndex({ movieId: 1 });
      await this.showtimes.createIndex({ roomId: 1 });
      await this.showtimes.createIndex({ startTime: 1 });
      await this.tickets.createIndex({ userId: 1 });
      await this.tickets.createIndex({ showtimeId: 1 });
      await this.reviews.createIndex({ movieId: 1 });
      await this.reviews.createIndex({ userId: 1 });
    } catch (error) {
      console.log('Index creation completed with some existing indexes');
    }
  }

  private async initializeData(): Promise<void> {
    const userCount = await this.users.countDocuments();
    if (userCount > 0) {
      console.log('Data already exists, skipping initialization');
      return; // Data already exists
    }

    try {
      console.log('Creating admin users...');
      // Create admin users
      const adminUser: InsertUser = {
        username: "admin",
        email: "admin@cinemabook.vn",
        password: await bcrypt.hash("password", 10),
        fullName: "Administrator",
        phone: "0123456789",
        role: "admin",
      };

      const adminUser2: InsertUser = {
        username: "admin2",
        email: "admin2@cinemabook.vn",
        password: await bcrypt.hash("password", 10),
        fullName: "Admin User 2",
        phone: "0987654321",
        role: "admin",
      };

      const userResults = await this.users.insertMany([adminUser, adminUser2]);
      const adminId = userResults.insertedIds[0];
      const admin2Id = userResults.insertedIds[1];
      console.log('Admin users created');

      // Create sample movies
      const movies = [
        {
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
        },
        {
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
        },
        {
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
        }
      ];

      const movieResults = await this.movies.insertMany(movies);
      const movieIds = Object.values(movieResults.insertedIds);

      // Create sample cinemas
      const cinemas = [
        {
          name: "CGV Vincom Center",
          address: "191 Bà Triệu, Hai Bà Trưng, Hà Nội",
          phone: "1900 6017",
          createdAt: new Date(),
        },
        {
          name: "Lotte Cinema",
          address: "54 Liễu Giai, Ba Đình, Hà Nội",
          phone: "1900 5555",
          createdAt: new Date(),
        },
        {
          name: "Galaxy Cinema",
          address: "116 Nguyễn Du, Hai Bà Trưng, Hà Nội",
          phone: "1900 2224",
          createdAt: new Date(),
        },
        {
          name: "Beta Cinema",
          address: "Tầng 3, TTTM Golden Palace, Mễ Trì, Nam Từ Liêm, Hà Nội",
          phone: "1900 2610",
          createdAt: new Date(),
        }
      ];

      const cinemaResults = await this.cinemas.insertMany(cinemas);
      const cinemaIds = Object.values(cinemaResults.insertedIds);

      // Create sample rooms
      const rooms = [
        {
          cinemaId: cinemaIds[0],
          name: "Phòng 1",
          capacity: 120,
          createdAt: new Date(),
        },
        {
          cinemaId: cinemaIds[0],
          name: "Phòng 2",
          capacity: 100,
          createdAt: new Date(),
        },
        {
          cinemaId: cinemaIds[1],
          name: "Phòng VIP",
          capacity: 80,
          createdAt: new Date(),
        },
        {
          cinemaId: cinemaIds[1],
          name: "Phòng 3D",
          capacity: 150,
          createdAt: new Date(),
        },
        {
          cinemaId: cinemaIds[2],
          name: "Phòng IMAX",
          capacity: 200,
          createdAt: new Date(),
        },
        {
          cinemaId: cinemaIds[3],
          name: "Phòng Premium",
          capacity: 90,
          createdAt: new Date(),
        }
      ];

      const roomResults = await this.rooms.insertMany(rooms);
      const roomIds = Object.values(roomResults.insertedIds);

      // Generate seat layout for showtimes
      const generateSeats = () => {
        const seats = [];
        for (let row = 0; row < 10; row++) {
          for (let seat = 1; seat <= 12; seat++) {
            seats.push(`${String.fromCharCode(65 + row)}${seat}`);
          }
        }
        return seats;
      };

      // Create sample showtimes
      const showtimes = [
        {
          movieId: movieIds[0],
          roomId: roomIds[0],
          startTime: new Date("2024-12-25T20:00:00Z"),
          endTime: new Date("2024-12-25T22:22:00Z"),
          price: "111111",
          availableSeats: generateSeats(),
          createdAt: new Date(),
        },
        {
          movieId: movieIds[1],
          roomId: roomIds[0],
          startTime: new Date("2024-12-25T18:00:00Z"),
          endTime: new Date("2024-12-25T19:45:00Z"),
          price: "75000",
          availableSeats: generateSeats(),
          createdAt: new Date(),
        },
        {
          movieId: movieIds[1],
          roomId: roomIds[0],
          startTime: new Date("2024-12-25T21:00:00Z"),
          endTime: new Date("2024-12-25T22:45:00Z"),
          price: "75000",
          availableSeats: generateSeats(),
          createdAt: new Date(),
        }
      ];

      await this.showtimes.insertMany(showtimes);

      // Create sample promotions
      const promotions = [
        {
          title: "Khuyến mãi sinh viên",
          description: "Giảm giá 20% cho sinh viên có thẻ",
          code: "STUDENT20",
          discountType: "percentage",
          discountValue: 20,
          minPurchase: 0,
          maxUses: 100,
          currentUses: 0,
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-12-31"),
          isActive: true,
          createdAt: new Date(),
        },
        {
          title: "Khuyến mãi cuối tuần",
          description: "Giảm 50,000 VND cho đơn hàng cuối tuần",
          code: "WEEKEND50",
          discountType: "fixed",
          discountValue: 50000,
          minPurchase: 200000,
          maxUses: 50,
          currentUses: 0,
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-12-31"),
          isActive: true,
          createdAt: new Date(),
        }
      ];

      await this.promotions.insertMany(promotions);

      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
    }
  }

  // Helper method to convert MongoDB _id to numeric id
  private transformDocument(doc: any): any {
    if (!doc) return doc;
    
    if (Array.isArray(doc)) {
      return doc.map(item => this.transformDocument(item));
    }
    
    const transformed = { ...doc };
    if (doc._id) {
      // Convert ObjectId to a simple numeric ID using hash
      const id = this.objectIdToNumericId(doc._id);
      transformed.id = id;
      delete transformed._id;
    }
    
    // Transform nested ObjectIds
    Object.keys(transformed).forEach(key => {
      if (key.endsWith('Id') && transformed[key] && typeof transformed[key] === 'object') {
        transformed[key] = this.objectIdToNumericId(transformed[key]);
      }
    });
    
    return transformed;
  }

  // Convert ObjectId to numeric ID
  private objectIdToNumericId(objectId: any): number {
    const str = objectId.toString();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Convert numeric ID to ObjectId - use a mapping approach
  private async numericIdToObjectId(id: number): Promise<ObjectId> {
    // Find the document with the matching numeric ID
    const collections = [this.users, this.movies, this.cinemas, this.rooms, this.showtimes, this.tickets, this.reviews, this.promotions];
    
    for (const collection of collections) {
      const docs = await collection.find({}).toArray();
      for (const doc of docs) {
        if (this.objectIdToNumericId(doc._id) === id) {
          return doc._id;
        }
      }
    }
    
    throw new Error(`No document found with numeric ID: ${id}`);
  }

  // User methods
  async getUsers(): Promise<User[]> {
    const users = await this.users.find({}).toArray();
    return users.map(user => this.transformDocument(user));
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const user = await this.users.findOne({ _id: objectId });
      return user ? this.transformDocument(user) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.users.findOne({ username });
    return user ? this.transformDocument(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.users.findOne({ email });
    return user ? this.transformDocument(user) : undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await this.users.insertOne({
      ...userData,
      createdAt: new Date()
    });
    
    const user = await this.users.findOne({ _id: result.insertedId });
    return this.transformDocument(user);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const result = await this.users.findOneAndUpdate(
        { _id: objectId },
        { $set: updates },
        { returnDocument: 'after' }
      );
      
      return result ? this.transformDocument(result) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const result = await this.users.deleteOne({ _id: objectId });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }

  // Movie methods
  async getMovies(): Promise<Movie[]> {
    const movies = await this.movies.find({}).toArray();
    return movies.map(movie => this.transformDocument(movie));
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const movie = await this.movies.findOne({ _id: objectId });
      return movie ? this.transformDocument(movie) : undefined;
    } catch (error) {
      console.error('Error getting movie:', error);
      return undefined;
    }
  }

  async createMovie(movieData: InsertMovie): Promise<Movie> {
    const result = await this.movies.insertOne({
      ...movieData,
      createdAt: new Date()
    });
    
    const movie = await this.movies.findOne({ _id: result.insertedId });
    return this.transformDocument(movie);
  }

  async updateMovie(id: number, updates: Partial<Movie>): Promise<Movie | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const result = await this.movies.findOneAndUpdate(
        { _id: objectId },
        { $set: updates },
        { returnDocument: 'after' }
      );
      
      return result ? this.transformDocument(result) : undefined;
    } catch (error) {
      console.error('Error updating movie:', error);
      return undefined;
    }
  }

  async deleteMovie(id: number): Promise<boolean> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const result = await this.movies.deleteOne({ _id: objectId });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }

  // Cinema methods
  async getCinemas(): Promise<Cinema[]> {
    const cinemas = await this.cinemas.find({}).toArray();
    return cinemas.map(cinema => this.transformDocument(cinema));
  }

  async getCinema(id: number): Promise<Cinema | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const cinema = await this.cinemas.findOne({ _id: objectId });
      return cinema ? this.transformDocument(cinema) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async createCinema(cinemaData: InsertCinema): Promise<Cinema> {
    const result = await this.cinemas.insertOne({
      ...cinemaData,
      createdAt: new Date()
    });
    
    const cinema = await this.cinemas.findOne({ _id: result.insertedId });
    return this.transformDocument(cinema);
  }

  async updateCinema(id: number, updates: Partial<Cinema>): Promise<Cinema | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const result = await this.cinemas.findOneAndUpdate(
        { _id: objectId },
        { $set: updates },
        { returnDocument: 'after' }
      );
      
      return result ? this.transformDocument(result) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async deleteCinema(id: number): Promise<boolean> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const result = await this.cinemas.deleteOne({ _id: objectId });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }

  // Room methods
  async getRooms(): Promise<Room[]> {
    const rooms = await this.rooms.find({}).toArray();
    return rooms.map(room => this.transformDocument(room));
  }

  async getRoom(id: number): Promise<Room | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const room = await this.rooms.findOne({ _id: objectId });
      return room ? this.transformDocument(room) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getRoomsByCinema(cinemaId: number): Promise<Room[]> {
    try {
      const objectId = await this.numericIdToObjectId(cinemaId);
      const rooms = await this.rooms.find({ cinemaId: objectId }).toArray();
      return rooms.map(room => this.transformDocument(room));
    } catch (error) {
      return [];
    }
  }

  async createRoom(roomData: InsertRoom): Promise<Room> {
    const cinemaObjectId = await this.numericIdToObjectId(roomData.cinemaId);
    const result = await this.rooms.insertOne({
      ...roomData,
      cinemaId: cinemaObjectId,
      createdAt: new Date()
    });
    
    const room = await this.rooms.findOne({ _id: result.insertedId });
    return this.transformDocument(room);
  }

  async updateRoom(id: number, updates: Partial<Room>): Promise<Room | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const updateData = { ...updates };
      if (updateData.cinemaId) {
        updateData.cinemaId = await this.numericIdToObjectId(updateData.cinemaId);
      }
      
      const result = await this.rooms.findOneAndUpdate(
        { _id: objectId },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result ? this.transformDocument(result) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async deleteRoom(id: number): Promise<boolean> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const result = await this.rooms.deleteOne({ _id: objectId });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }

  // Showtime methods
  async getShowtimes(): Promise<Showtime[]> {
    const showtimes = await this.showtimes.find({}).toArray();
    return showtimes.map(showtime => this.transformDocument(showtime));
  }

  async getShowtime(id: number): Promise<Showtime | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const showtime = await this.showtimes.findOne({ _id: objectId });
      return showtime ? this.transformDocument(showtime) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getShowtimesByMovie(movieId: number): Promise<Showtime[]> {
    try {
      const objectId = await this.numericIdToObjectId(movieId);
      const showtimes = await this.showtimes.find({ movieId: objectId }).toArray();
      return showtimes.map(showtime => this.transformDocument(showtime));
    } catch (error) {
      return [];
    }
  }

  async createShowtime(showtimeData: InsertShowtime): Promise<Showtime> {
    const movieObjectId = await this.numericIdToObjectId(showtimeData.movieId);
    const roomObjectId = await this.numericIdToObjectId(showtimeData.roomId);
    
    const result = await this.showtimes.insertOne({
      ...showtimeData,
      movieId: movieObjectId,
      roomId: roomObjectId,
      createdAt: new Date()
    });
    
    const showtime = await this.showtimes.findOne({ _id: result.insertedId });
    return this.transformDocument(showtime);
  }

  async updateShowtime(id: number, updates: Partial<Showtime>): Promise<Showtime | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const updateData = { ...updates };
      if (updateData.movieId) {
        updateData.movieId = await this.numericIdToObjectId(updateData.movieId);
      }
      if (updateData.roomId) {
        updateData.roomId = await this.numericIdToObjectId(updateData.roomId);
      }
      
      const result = await this.showtimes.findOneAndUpdate(
        { _id: objectId },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result ? this.transformDocument(result) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async deleteShowtime(id: number): Promise<boolean> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const result = await this.showtimes.deleteOne({ _id: objectId });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }

  // Ticket methods
  async getTickets(): Promise<Ticket[]> {
    const tickets = await this.tickets.find({}).toArray();
    return tickets.map(ticket => this.transformDocument(ticket));
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const ticket = await this.tickets.findOne({ _id: objectId });
      return ticket ? this.transformDocument(ticket) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getTicketsByUser(userId: number): Promise<Ticket[]> {
    try {
      const objectId = await this.numericIdToObjectId(userId);
      const tickets = await this.tickets.find({ userId: objectId }).toArray();
      return tickets.map(ticket => this.transformDocument(ticket));
    } catch (error) {
      return [];
    }
  }

  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    const userObjectId = await this.numericIdToObjectId(ticketData.userId);
    const showtimeObjectId = await this.numericIdToObjectId(ticketData.showtimeId);
    
    const result = await this.tickets.insertOne({
      ...ticketData,
      userId: userObjectId,
      showtimeId: showtimeObjectId,
      createdAt: new Date()
    });
    
    const ticket = await this.tickets.findOne({ _id: result.insertedId });
    return this.transformDocument(ticket);
  }

  async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const updateData = { ...updates };
      if (updateData.userId) {
        updateData.userId = await this.numericIdToObjectId(updateData.userId);
      }
      if (updateData.showtimeId) {
        updateData.showtimeId = await this.numericIdToObjectId(updateData.showtimeId);
      }
      
      const result = await this.tickets.findOneAndUpdate(
        { _id: objectId },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result ? this.transformDocument(result) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async deleteTicket(id: number): Promise<boolean> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const result = await this.tickets.deleteOne({ _id: objectId });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }

  // Review methods
  async getReviews(): Promise<Review[]> {
    const reviews = await this.reviews.find({}).toArray();
    return reviews.map(review => this.transformDocument(review));
  }

  async getReview(id: number): Promise<Review | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const review = await this.reviews.findOne({ _id: objectId });
      return review ? this.transformDocument(review) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getReviewsByMovie(movieId: number): Promise<Review[]> {
    try {
      const objectId = await this.numericIdToObjectId(movieId);
      const reviews = await this.reviews.find({ movieId: objectId }).toArray();
      return reviews.map(review => this.transformDocument(review));
    } catch (error) {
      return [];
    }
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const userObjectId = await this.numericIdToObjectId(reviewData.userId);
    const movieObjectId = await this.numericIdToObjectId(reviewData.movieId);
    
    const result = await this.reviews.insertOne({
      ...reviewData,
      userId: userObjectId,
      movieId: movieObjectId,
      createdAt: new Date()
    });
    
    const review = await this.reviews.findOne({ _id: result.insertedId });
    return this.transformDocument(review);
  }

  async updateReview(id: number, updates: Partial<Review>): Promise<Review | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const updateData = { ...updates };
      if (updateData.userId) {
        updateData.userId = await this.numericIdToObjectId(updateData.userId);
      }
      if (updateData.movieId) {
        updateData.movieId = await this.numericIdToObjectId(updateData.movieId);
      }
      
      const result = await this.reviews.findOneAndUpdate(
        { _id: objectId },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result ? this.transformDocument(result) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async deleteReview(id: number): Promise<boolean> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const result = await this.reviews.deleteOne({ _id: objectId });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }

  // Promotion methods
  async getPromotions(): Promise<Promotion[]> {
    const promotions = await this.promotions.find({}).toArray();
    return promotions.map(promotion => this.transformDocument(promotion));
  }

  async getPromotion(id: number): Promise<Promotion | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const promotion = await this.promotions.findOne({ _id: objectId });
      return promotion ? this.transformDocument(promotion) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getPromotionByCode(code: string): Promise<Promotion | undefined> {
    const promotion = await this.promotions.findOne({ code });
    return promotion ? this.transformDocument(promotion) : undefined;
  }

  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    const promotions = await this.promotions.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).toArray();
    return promotions.map(promotion => this.transformDocument(promotion));
  }

  async createPromotion(promotionData: InsertPromotion): Promise<Promotion> {
    const result = await this.promotions.insertOne({
      ...promotionData,
      createdAt: new Date()
    });
    
    const promotion = await this.promotions.findOne({ _id: result.insertedId });
    return this.transformDocument(promotion);
  }

  async updatePromotion(id: number, updates: Partial<Promotion>): Promise<Promotion | undefined> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const result = await this.promotions.findOneAndUpdate(
        { _id: objectId },
        { $set: updates },
        { returnDocument: 'after' }
      );
      
      return result ? this.transformDocument(result) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async deletePromotion(id: number): Promise<boolean> {
    try {
      const objectId = await this.numericIdToObjectId(id);
      const result = await this.promotions.deleteOne({ _id: objectId });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }
}