// MongoDB initialization script for NaCinema
db = db.getSiblingDB('nacinema');

// Create collections
db.createCollection('users');
db.createCollection('movies');
db.createCollection('cinemas');
db.createCollection('rooms');
db.createCollection('showtimes');
db.createCollection('tickets');
db.createCollection('reviews');
db.createCollection('promotions');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.movies.createIndex({ "title": 1 });
db.movies.createIndex({ "status": 1 });
db.cinemas.createIndex({ "name": 1 });
db.rooms.createIndex({ "cinemaId": 1 });
db.showtimes.createIndex({ "movieId": 1 });
db.showtimes.createIndex({ "roomId": 1 });
db.showtimes.createIndex({ "startTime": 1 });
db.tickets.createIndex({ "userId": 1 });
db.tickets.createIndex({ "showtimeId": 1 });
db.tickets.createIndex({ "bookingCode": 1 }, { unique: true });
db.reviews.createIndex({ "movieId": 1 });
db.reviews.createIndex({ "userId": 1 });
db.promotions.createIndex({ "code": 1 }, { unique: true });
db.promotions.createIndex({ "endDate": 1 });

print('NaCinema database initialized with collections and indexes');