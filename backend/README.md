# Apni Dhun — Node.js Express MVC Backend

Complete Node.js, Express.js, and MongoDB (Mongoose) MVC backend built specifically to power the existing **Apni Dhun** frontend without changing any UI, layout, styling, or design.

---

## 📁 Architecture Overview (MVC)

```
backend/
├── config/
│   └── db.js                 # Database connection & status configuration
├── controllers/
│   ├── authController.js     # User registration, login, logout, password resets
│   ├── songController.js     # Song listing, search, genre filtering & playback logging
│   ├── favoriteController.js # Add, remove, and list user favorites
│   ├── playlistController.js # Playlist CRUD operations & song management
│   ├── radioController.js    # Live radio station streaming & now-playing metadata
│   └── statController.js     # Platform metrics & user listening analytics
├── middleware/
│   ├── authMiddleware.js     # JWT session verification (cookie & header support)
│   └── errorMiddleware.js    # 404 handler and comprehensive global error handler
├── models/
│   ├── User.js               # User schema with bcrypt password hashing
│   ├── Song.js               # Song catalog schema
│   ├── Playlist.js           # Playlist schema with user relationships
│   ├── RadioStation.js       # Radio station schema
│   └── PlayHistory.js        # Playback tracking schema
├── routes/
│   ├── authRoutes.js         # /api/auth endpoints
│   ├── songRoutes.js         # /api/songs endpoints
│   ├── favoriteRoutes.js     # /api/favorites endpoints
│   ├── playlistRoutes.js     # /api/playlists endpoints
│   ├── radioRoutes.js        # /api/radio endpoints
│   └── statRoutes.js         # /api/stats endpoints
├── services/
│   ├── authService.js        # Auth logic with resilient storage fallback
│   ├── songService.js        # Song retrieval, search, and playback tracking
│   ├── favoriteService.js    # Favorite management
│   ├── playlistService.js    # Playlist business logic
│   ├── radioService.js       # Real-time continuous radio broadcast simulation
│   └── statService.js        # Top track and mood aggregation
├── utils/
│   ├── jwt.js                # JWT sign, verify, and cookie config
│   └── seedData.js           # Initial songs and radio stations catalog
├── .env                      # Local environment configuration
├── .env.example              # Example environment template
├── .gitignore
├── package.json              # Backend dependencies and scripts
├── server.js                 # Application entry point & static frontend server
└── test-api.js               # Automated 21-test API suite
```

---

## 🚀 Getting Started

### 1. Installation
From the project root:
```bash
npm install
```
Or inside the `backend` folder:
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
A `.env` file is already created. You can customize it as needed:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/apni_dhun
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000,http://127.0.0.1:5500,http://localhost:5500
```

> **Note on MongoDB**: If MongoDB is running locally or configured via MongoDB Atlas, the backend automatically connects and syncs the database. If MongoDB is offline, the backend runs in **Resilient Fallback Mode** so you can develop and test the entire site immediately without blocking!

### 3. Start the Server
From the root folder:
```bash
npm start
```
Or from the `backend/` folder:
```bash
node server.js
```

The application is now live at:
👉 **http://localhost:3000**

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Sign in with email & password | Public |
| `GET` | `/api/auth/me` | Get current logged-in user profile (`{ user: null }` for guest) | Public |
| `POST` | `/api/auth/logout` | Sign out and clear session cookie | Public |
| `POST` | `/api/auth/forgot-password` | Generate password reset token | Public |
| `POST` | `/api/auth/reset-password` | Set new password with token | Public |

### 🎵 Songs (`/api/songs`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/songs` | List all songs (optional `?genre=...&search=...`) | Public |
| `GET` | `/api/songs/:id` | Get details for a single song | Public |
| `POST` | `/api/songs/:id/play` | Record playback event for analytics | Public |

### ❤️ Favorites (`/api/favorites`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/favorites` | Get array of user's saved song IDs | Private |
| `PUT` | `/api/favorites/:id` | Add song to favorites | Private |
| `DELETE` | `/api/favorites/:id` | Remove song from favorites | Private |

### 🎼 Playlists (`/api/playlists`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/playlists` | List user's playlists with songs | Private |
| `POST` | `/api/playlists` | Create a new playlist | Private |
| `PUT` | `/api/playlists/:id/songs` | Update songs in a playlist | Private |
| `DELETE` | `/api/playlists/:id` | Delete a playlist | Private |

### 📻 Radio Stations (`/api/radio`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/radio/stations/:stationId/now-playing` | Get live synced now-playing track | Public |

### 📊 Listening Stats (`/api/stats`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/stats` | Platform metrics & most played song / top genre | Public |

---

## 🧪 Testing the API
To run the automated 21-test API suite:
```bash
cd backend
node test-api.js
```
