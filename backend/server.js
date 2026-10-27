const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require("dotenv").config();

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const { connectDB, getDBStatus } = require('./config/db');
const { syncInitialSongs } = require('./services/songService');
const { syncInitialStations } = require('./services/radioService');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const songRoutes = require('./routes/songRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const radioRoutes = require('./routes/radioRoutes');
const statRoutes = require('./routes/statRoutes');

// Import Error Middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable Cross-Origin Resource Sharing with credentials for any local development port
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly permissive CORS
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Standard Body & Cookie Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'apni_dhun_cookie_secret_key_secure_mood'));

// Serve Existing Frontend as Static View Layer
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'Apni Dhun Music Platform',
    timestamp: new Date().toISOString(),
    database: getDBStatus()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/radio', radioRoutes);
app.use('/api/stats', statRoutes);

// Fallback to frontend index for unhandled non-API page routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const filePath = path.join(frontendPath, req.path.endsWith('.html') ? req.path : `${req.path}.html`);
  res.sendFile(filePath, err => {
    if (err) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    }
  });
});

// 404 & Global Error Middleware
app.use('/api', notFound);
app.use(errorHandler);

// Start Server and Initialize Database
const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Sync initial seed catalog into Database if needed
  await syncInitialSongs();
  await syncInitialStations();

  app.listen(PORT, () => {
    console.log(`
===========================================================
  APNI DHUN MUSIC PLATFORM - BACKEND SERVER RUNNING
===========================================================
  URL:            http://localhost:${PORT}
  Environment:    ${process.env.NODE_ENV || 'development'}
  Frontend:       Served directly from /frontend
  Health:         http://localhost:${PORT}/api/health
===========================================================
`);
  });
};

startServer().catch(err => {
  console.error('[Server Fatal Error]:', err);
});

module.exports = app;
