import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("user"), // user, staff, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  genre: text("genre").notNull(),
  duration: integer("duration").notNull(), // in minutes
  ageRating: text("age_rating").notNull(),
  posterUrl: text("poster_url"),
  trailerUrl: text("trailer_url"),
  actors: text("actors").array(),
  director: text("director"),
  releaseDate: timestamp("release_date"),
  status: text("status").notNull().default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow(),
});

export const cinemas = pgTable("cinemas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  cinemaId: integer("cinema_id").notNull(),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull(),
  seatLayout: json("seat_layout").notNull(), // seat configuration
  createdAt: timestamp("created_at").defaultNow(),
});

export const showtimes = pgTable("showtimes", {
  id: serial("id").primaryKey(),
  movieId: integer("movie_id").notNull(),
  roomId: integer("room_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  availableSeats: text("available_seats").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  showtimeId: integer("showtime_id").notNull(),
  seats: text("seats").array().notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, cancelled
  paymentMethod: text("payment_method"),
  bookingCode: text("booking_code").notNull().unique(),
  customerInfo: json("customer_info"), // name, phone, email
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  rating: integer("rating").notNull(), // 1-5
  content: text("content"),
  status: text("status").notNull().default("active"), // active, hidden
  createdAt: timestamp("created_at").defaultNow(),
});

export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discountType: text("discount_type").notNull(), // percentage, fixed
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minPurchase: decimal("min_purchase", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  usageLimit: integer("usage_limit"),
  currentUsage: integer("current_usage").default(0),
  code: text("code").unique(),
  status: text("status").notNull().default("active"), // active, inactive, expired
  cinemaId: integer("cinema_id"), // null for all cinemas
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
  phone: true,
  role: true,
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
  createdAt: true,
}).extend({
  releaseDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export const insertCinemaSchema = createInsertSchema(cinemas).pick({
  name: true,
  address: true,
  phone: true,
});

export const insertRoomSchema = createInsertSchema(rooms).pick({
  cinemaId: true,
  name: true,
  capacity: true,
  seatLayout: true,
});

export const insertShowtimeSchema = createInsertSchema(showtimes).pick({
  movieId: true,
  roomId: true,
  startTime: true,
  endTime: true,
  price: true,
  availableSeats: true,
});

export const insertTicketSchema = createInsertSchema(tickets).pick({
  userId: true,
  showtimeId: true,
  seats: true,
  totalPrice: true,
  status: true,
  paymentMethod: true,
  bookingCode: true,
  customerInfo: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  movieId: true,
  rating: true,
  content: true,
  status: true,
});

export const insertPromotionSchema = createInsertSchema(promotions).pick({
  title: true,
  description: true,
  discountType: true,
  discountValue: true,
  minPurchase: true,
  maxDiscount: true,
  startDate: true,
  endDate: true,
  usageLimit: true,
  code: true,
  status: true,
  cinemaId: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;

export type Cinema = typeof cinemas.$inferSelect;
export type InsertCinema = z.infer<typeof insertCinemaSchema>;

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;

export type Showtime = typeof showtimes.$inferSelect;
export type InsertShowtime = z.infer<typeof insertShowtimeSchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
