// ./middleware/session.js

const session = require('express-session');
const RedisStore = require('connect-redis').default;
const Redis = require('ioredis');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

// BEGIN: Redis Client Configuration with Custom Retry Strategy
const redisClient = new Redis(process.env.REDIS_URL, {
  retryStrategy: (times) => {
    if (times >= 10) {
      console.error('Max retries reached, stopping Redis reconnection attempts');
      return null; // Stop retrying after 10 attempts
    }
    const delay = Math.min(times * 100, 2000); // Exponential backoff, capped at 2 seconds
    console.log(`Retrying Redis connection in ${delay} ms...`);
    return delay;
  },
});

redisClient.on('connect', () => console.log('Connected to Redis with authentication'));
redisClient.on('error', (err) => console.error('Redis connection error:', err));
redisClient.on('close', () => console.log('Redis connection closed'));
redisClient.on('reconnecting', () => console.log('Reconnecting to Redis...'));
// END: Redis Client Configuration with Custom Retry Strategy

// BEGIN: Session Configuration with Redis Store
const sessionManager = session({
  store: new RedisStore({
    client: redisClient, // Use ioredis client here
    ttl: 3600, // Session TTL in seconds (1 hour)
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Use a secure secret
  resave: false, // Avoid resaving sessions if unmodified
  saveUninitialized: false, // Only save session if something is stored
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 3600000, // Session cookie expires after 1 hour
    httpOnly: true, // Prevent client-side JS from accessing cookies
    sameSite: 'lax' // CSRF protection by allowing only same-site requests
  },
});
// END: Session Configuration with Redis Store

// BEGIN: Timestamp Middleware
const sessionTimestampMiddleware = (req, res, next) => {
  if (req.session) {
    if (!req.session.createdAt) {
      req.session.createdAt = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss z');
    }
    req.session.lastAccess = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss z');
  }
  next();
};
// END: Timestamp Middleware

// BEGIN: Session Logger Middleware
const logsDir = path.join(__dirname, '../logs');
const sessionLogFilePath = path.join(logsDir, 'redis-session.log');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir); // Create logs directory if it doesn't exist
}

const sessionLogger = (req, res, next) => {
  if (req.session) {
    const currentTime = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss z');
    const sessionID = req.sessionID;
    const requestIP = req.ip || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referer = req.headers['referer'] || 'None';
    const sessionCreation = req.session.createdAt || 'N/A';
    const sessionExpires = req.session.cookie.expires
      ? moment(req.session.cookie.expires).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss z')
      : 'N/A';
    const lastAccess = req.session.lastAccess || 'Unknown';

    const logMessage = `
  =============================================
  Session Activity:
    - Time: ${currentTime}
    - SessionID: ${sessionID}
    - Method: ${req.method}
    - URL: ${req.url}
    - IP: ${requestIP}
    - UserAgent: ${userAgent}
    - Referer: ${referer}
    - Created: ${sessionCreation}
    - Expires: ${sessionExpires}
    - Last Access: ${lastAccess}
  =============================================
`;
    console.log(logMessage);

    // Append log entry to redis-session.log asynchronously with error handling
    fs.appendFile(sessionLogFilePath, logMessage, (err) => {
      if (err) {
        console.error('Error writing to session log file:', err);
      }
    });
  }
  next();
};
// END: Session Logger Middleware

// BEGIN: Export Middleware Array
module.exports = {
  sessionManager,
  sessionTimestampMiddleware,
  sessionLogger,
};
// END: Export Middleware Array
