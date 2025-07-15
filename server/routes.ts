import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertMovieSchema, insertCinemaSchema, insertRoomSchema, insertShowtimeSchema, insertTicketSchema, insertReviewSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Middleware to check if user is admin
function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// Middleware to check if user is staff or admin
function requireStaff(req: any, res: any, next: any) {
  if (req.user?.role !== 'staff' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Staff access required' });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'NaCinema API',
      version: '1.0.0'
    });
  });

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          fullName: user.fullName, 
          role: user.role 
        }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid registration data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          fullName: user.fullName, 
          role: user.role 
        }, 
        token 
      });
    } catch (error) {
      res.status(400).json({ message: 'Login failed' });
    }
  });

  // Movie routes
  app.get('/api/movies', async (req, res) => {
    try {
      const movies = await storage.getMovies();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch movies' });
    }
  });

  app.get('/api/movies/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const movie = await storage.getMovie(id);
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      res.json(movie);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch movie' });
    }
  });

  app.post('/api/movies', authenticateToken, requireAdmin, async (req, res) => {
    try {
      console.log('Movie data received:', req.body);
      const movieData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(movieData);
      res.status(201).json(movie);
    } catch (error: any) {
      console.error('Movie creation error:', error);
      res.status(400).json({ message: 'Invalid movie data', error: error.message });
    }
  });

  app.put('/api/movies/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const movie = await storage.updateMovie(id, updates);
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      res.json(movie);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update movie' });
    }
  });

  app.delete('/api/movies/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMovie(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete movie' });
    }
  });

  // Cinema routes
  app.get('/api/cinemas', async (req, res) => {
    try {
      const cinemas = await storage.getCinemas();
      res.json(cinemas);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch cinemas' });
    }
  });

  app.post('/api/cinemas', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const cinemaData = insertCinemaSchema.parse(req.body);
      const cinema = await storage.createCinema(cinemaData);
      res.status(201).json(cinema);
    } catch (error) {
      res.status(400).json({ message: 'Invalid cinema data' });
    }
  });

  app.put('/api/cinemas/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const cinema = await storage.updateCinema(id, updates);
      if (!cinema) {
        return res.status(404).json({ message: 'Cinema not found' });
      }
      res.json(cinema);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update cinema' });
    }
  });

  app.delete('/api/cinemas/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCinema(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Cinema not found' });
      }
      res.json({ message: 'Cinema deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete cinema' });
    }
  });

  // Room routes
  app.get('/api/rooms', async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch rooms' });
    }
  });

  app.get('/api/cinemas/:cinemaId/rooms', async (req, res) => {
    try {
      const cinemaId = parseInt(req.params.cinemaId);
      const rooms = await storage.getRoomsByCinema(cinemaId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch rooms' });
    }
  });

  // Showtime routes
  app.get('/api/showtimes', async (req, res) => {
    try {
      const showtimes = await storage.getShowtimes();
      res.json(showtimes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch showtimes' });
    }
  });

  app.post('/api/showtimes', authenticateToken, requireAdmin, async (req, res) => {
    try {
      console.log('Showtime data received:', req.body);
      const processedData = {
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        price: req.body.price.toString()
      };
      const showtimeData = insertShowtimeSchema.parse(processedData);
      const showtime = await storage.createShowtime(showtimeData);
      res.status(201).json(showtime);
    } catch (error: any) {
      console.error('Showtime creation error:', error);
      res.status(400).json({ message: 'Invalid showtime data', error: error.message });
    }
  });

  app.put('/api/showtimes/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const processedData = {
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        price: req.body.price.toString()
      };
      const showtime = await storage.updateShowtime(id, processedData);
      if (!showtime) {
        return res.status(404).json({ message: 'Showtime not found' });
      }
      res.json(showtime);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update showtime' });
    }
  });

  app.delete('/api/showtimes/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteShowtime(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Showtime not found' });
      }
      res.json({ message: 'Showtime deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete showtime' });
    }
  });

  app.delete('/api/showtimes/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteShowtime(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Showtime not found' });
      }
      res.json({ message: 'Showtime deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete showtime' });
    }
  });

  app.get('/api/movies/:movieId/showtimes', async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId);
      const showtimes = await storage.getShowtimesByMovie(movieId);
      res.json(showtimes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch showtimes' });
    }
  });

  app.post('/api/showtimes', authenticateToken, requireStaff, async (req, res) => {
    try {
      const showtimeData = insertShowtimeSchema.parse(req.body);
      const showtime = await storage.createShowtime(showtimeData);
      res.status(201).json(showtime);
    } catch (error) {
      res.status(400).json({ message: 'Invalid showtime data' });
    }
  });

  app.put('/api/showtimes/:id', authenticateToken, requireStaff, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const showtime = await storage.updateShowtime(id, updates);
      if (!showtime) {
        return res.status(404).json({ message: 'Showtime not found' });
      }
      res.json(showtime);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update showtime' });
    }
  });

  // Ticket routes
  app.get('/api/tickets', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const tickets = await storage.getTicketsByUser(userId);
      
      // Enrich tickets with movie, showtime, and room information
      const enrichedTickets = await Promise.all(
        tickets.map(async (ticket) => {
          const showtime = await storage.getShowtime(ticket.showtimeId);
          if (showtime) {
            const movie = await storage.getMovie(showtime.movieId);
            const room = await storage.getRoom(showtime.roomId);
            const cinema = room ? await storage.getCinema(room.cinemaId) : null;
            
            return {
              ...ticket,
              movie,
              showtime: {
                ...showtime,
                room: room ? {
                  ...room,
                  cinema
                } : null
              }
            };
          }
          return ticket;
        })
      );
      
      res.json(enrichedTickets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tickets' });
    }
  });

  app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
      const { showtimeId, seats, totalPrice, paymentMethod, customerInfo } = req.body;
      
      // Get fresh showtime data
      const showtime = await storage.getShowtime(showtimeId);
      if (!showtime) {
        return res.status(404).json({ message: 'Showtime not found' });
      }

      console.log(`Checking seats for showtime ${showtimeId}:`, seats);
      console.log(`Available seats:`, showtime.availableSeats);

      // Check if any requested seats are already taken
      const unavailableSeats = seats.filter((seat: string) => 
        !showtime.availableSeats?.includes(seat)
      );

      if (unavailableSeats.length > 0) {
        console.log(`Unavailable seats found:`, unavailableSeats);
        return res.status(400).json({ 
          message: 'Some seats are not available',
          unavailableSeats 
        });
      }

      // Double-check by getting all existing tickets for this showtime
      const allTickets = await storage.getTickets();
      const existingTicketsForShowtime = allTickets.filter(t => t.showtimeId === showtimeId);
      const alreadyBookedSeats = existingTicketsForShowtime.flatMap(t => t.seats);
      
      const conflictingSeats = seats.filter((seat: string) => 
        alreadyBookedSeats.includes(seat)
      );

      if (conflictingSeats.length > 0) {
        console.log(`Conflicting seats found:`, conflictingSeats);
        return res.status(400).json({ 
          message: 'Some seats are already booked',
          conflictingSeats 
        });
      }

      const ticketData = {
        userId: req.user.userId,
        showtimeId,
        seats,
        totalPrice,
        paymentMethod,
        customerInfo: JSON.stringify(customerInfo),
        status: 'confirmed',
        bookingCode: `TK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      };

      const ticket = await storage.createTicket(ticketData);
      
      // Update available seats
      const updatedAvailableSeats = showtime.availableSeats?.filter((seat: string) => 
        !seats.includes(seat)
      );
      
      await storage.updateShowtime(showtimeId, {
        availableSeats: updatedAvailableSeats
      });

      console.log(`Updated showtime ${showtimeId} available seats from ${showtime.availableSeats?.length} to ${updatedAvailableSeats?.length}`);

      res.status(201).json(ticket);
    } catch (error) {
      console.error('Booking error:', error);
      res.status(400).json({ message: 'Invalid booking data' });
    }
  });

  app.post('/api/tickets', authenticateToken, async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse({
        ...req.body,
        userId: req.user.userId,
        bookingCode: `TK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      });
      
      // Check seat availability
      const showtime = await storage.getShowtime(ticketData.showtimeId);
      if (!showtime) {
        return res.status(404).json({ message: 'Showtime not found' });
      }

      const unavailableSeats = ticketData.seats.filter(seat => 
        !showtime.availableSeats?.includes(seat)
      );

      if (unavailableSeats.length > 0) {
        return res.status(400).json({ 
          message: 'Some seats are not available',
          unavailableSeats 
        });
      }

      const ticket = await storage.createTicket(ticketData);
      
      // Update available seats
      const updatedAvailableSeats = showtime.availableSeats?.filter(seat => 
        !ticketData.seats.includes(seat)
      );
      
      await storage.updateShowtime(ticketData.showtimeId, {
        availableSeats: updatedAvailableSeats
      });

      res.status(201).json(ticket);
    } catch (error) {
      res.status(400).json({ message: 'Invalid ticket data' });
    }
  });

  app.put('/api/tickets/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const ticket = await storage.getTicket(id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Check if user owns the ticket or is staff/admin
      if (ticket.userId !== req.user.userId && req.user.role === 'user') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedTicket = await storage.updateTicket(id, updates);
      res.json(updatedTicket);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update ticket' });
    }
  });

  // Review routes
  app.get('/api/movies/:movieId/reviews', async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId);
      const reviews = await storage.getReviewsByMovie(movieId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  });

  app.post('/api/reviews', authenticateToken, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.userId,
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: 'Invalid review data' });
    }
  });

  // Admin routes
  app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Remove password from response
      const safeUsers = users.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt
      }));
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.put('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update user' });
    }
  });

  app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const currentUser = req.user;
      
      if (currentUser.userId === id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const deleted = await storage.deleteUser(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  app.get('/api/admin/tickets', authenticateToken, requireStaff, async (req, res) => {
    try {
      const tickets = await storage.getTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tickets' });
    }
  });

  app.get('/api/admin/all-tickets', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const tickets = await storage.getTickets();
      
      // Enrich tickets with movie, showtime, and room information
      const enrichedTickets = await Promise.all(
        tickets.map(async (ticket) => {
          const showtime = await storage.getShowtime(ticket.showtimeId);
          if (showtime) {
            const movie = await storage.getMovie(showtime.movieId);
            const room = await storage.getRoom(showtime.roomId);
            const cinema = room ? await storage.getCinema(room.cinemaId) : null;
            
            return {
              ...ticket,
              movie,
              showtime: {
                ...showtime,
                room: room ? {
                  ...room,
                  cinema
                } : null
              }
            };
          }
          return ticket;
        })
      );
      
      res.json(enrichedTickets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch all tickets' });
    }
  });

  // Promotion routes
  app.get("/api/promotions", async (req, res) => {
    try {
      const promotions = await storage.getPromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promotions" });
    }
  });

  app.get("/api/promotions/active", async (req, res) => {
    try {
      const promotions = await storage.getActivePromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active promotions" });
    }
  });

  app.get("/api/promotions/:id", async (req, res) => {
    try {
      const promotion = await storage.getPromotion(parseInt(req.params.id));
      if (!promotion) {
        return res.status(404).json({ error: "Promotion not found" });
      }
      res.json(promotion);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promotion" });
    }
  });

  app.post("/api/promotions/validate", async (req, res) => {
    try {
      const { code, totalPrice } = req.body;
      const promotion = await storage.getPromotionByCode(code);
      
      if (!promotion) {
        return res.status(404).json({ error: "Promotion not found" });
      }

      if (promotion.status !== "active") {
        return res.status(400).json({ error: "Promotion is not active" });
      }

      const now = new Date();
      if (now < promotion.startDate || now > promotion.endDate) {
        return res.status(400).json({ error: "Promotion has expired" });
      }

      if (promotion.usageLimit && (promotion.currentUsage || 0) >= promotion.usageLimit) {
        return res.status(400).json({ error: "Promotion usage limit exceeded" });
      }

      if (promotion.minPurchase && totalPrice < parseFloat(promotion.minPurchase)) {
        return res.status(400).json({ error: "Minimum purchase amount not met" });
      }

      let discount = 0;
      if (promotion.discountType === "percentage") {
        discount = (totalPrice * parseFloat(promotion.discountValue)) / 100;
        if (promotion.maxDiscount && discount > parseFloat(promotion.maxDiscount)) {
          discount = parseFloat(promotion.maxDiscount);
        }
      } else {
        discount = parseFloat(promotion.discountValue);
      }

      res.json({
        code: promotion.code,
        discount,
        description: promotion.description,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to validate promotion" });
    }
  });

  // Movie reviews routes
  app.get("/api/movies/:id/reviews", async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByMovie(movieId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/movies/:id/reviews", authenticateToken, async (req, res) => {
    try {
      const movieId = parseInt(req.params.id);
      const { rating, content } = req.body;
      const userId = req.user.id;

      const review = await storage.createReview({
        movieId,
        userId,
        rating,
        content,
      });

      res.json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
