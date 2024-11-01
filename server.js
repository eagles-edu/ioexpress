// server.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const Redis = require('ioredis'); // Redis client that supports password authentication
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const errorHandler = require('./middleware/error-handler');
const { sessionTimestampMiddleware, sessionLogger } = require('./middleware/session');  // Import custom middleware

require('dotenv').config();  // Load environment variables from .env file

// BEGIN: Redis Client Setup with Password
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6380, // Redis server port (match Docker setup)
  password: process.env.REDIS_PASSWORD, // Redis password from .env
});

// Redis connection logging
redisClient.on('connect', () => console.log('Connected to Redis with authentication'));
redisClient.on('error', (err) => console.error('Redis connection error:', err));
// END: Redis Client Setup

// BEGIN: Express Session Configuration with Redis Store
const sessionManager = session({
  store: new RedisStore({ client: redisClient }), // Use Redis client with password for session store
  secret: process.env.SESSION_SECRET || 'default-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,                                // Prevent client-side JavaScript access to cookies
    maxAge: 3600000,                               // 1-hour session expiration
  },
});
// END: Session Management Configuration

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8910;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());           // Secure HTTP headers
app.disable('x-powered-by'); // Disable X-Powered-By header for security

// Apply logging middleware
app.use(require('./middleware/logger'));    // Logs request details
app.use(require('./middleware/requests'));  // General request logging

// CORS configuration
app.use(cors({
  origin: NODE_ENV === 'production' ? 'https://obgyn.eaglesvn.club' : 'http://127.0.0.1:3001',
  methods: ['POST', 'GET'],
  credentials: true,  // Allow session cookies
}));

// Parse incoming JSON requests
app.use(express.json());

// Use Redis-backed session manager
console.log('Initializing middleware');
app.use(sessionManager);
console.log('Session manager applied');

// Apply custom session timestamp and logger middleware
app.use(sessionTimestampMiddleware);
console.log('Session timestamp middleware applied');

app.use(sessionLogger);
console.log('Session logger middleware applied');

// BEGIN: Routes
app.post('/api/set-session', (req, res) => {
  try {
    const sessionData = req.body.data;

    if (sessionData) {
      req.session.data = sessionData;  // Store session data in Redis
      res.send({ message: 'Session data stored successfully' });
    } else {
      res.status(400).send({ error: 'No session data provided' });
    }
  } catch (error) {
    console.error('Error setting session data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.use('/api', require('./routes/api'));
// END: Routes

// Custom error handler middleware
app.use(errorHandler);

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
});
