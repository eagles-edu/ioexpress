const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/error-handler'); 

require('dotenv').config();

// Routes for CSP violations
const cspRoutes = require('./routes/api'); // CSP logger routes

// Session management and related middlewares
const sessionManager = require('./middleware/session'); // Redis session manager (with timestamp and logger)

// General request logging
const requestLog = require('./middleware/requests'); // Logs general request activity
const logger = require('./middleware/logger'); // Logs request details

const app = express();
const PORT = process.env.PORT || 8910;
const NODE_ENV = process.env.NODE_ENV || 'development'; // Fallback to 'development' if not set

// Security middleware
app.use(helmet()); // Secure HTTP headers
app.disable('x-powered-by'); // Disable X-Powered-By header for security

// Apply logger middleware to log request details
app.use(logger);

// Apply request log middleware to log all requests
app.use(requestLog);

// CORS configuration
app.use(
  cors({
    origin: NODE_ENV === 'production'
      ? 'https://obgyn.eaglesvn.club' // Frontend domain for production
      : 'http://127.0.0.1:3001',      // Frontend domain for development
    methods: ['POST', 'GET'],         // Allowed methods
    credentials: true                 // Allow session cookies in CORS
  })
);

// Parse incoming JSON requests
app.use(express.json()); // Ensure that the request body is parsed as JSON

// Apply Redis session manager (which includes session logging and timestamp middleware)
app.use(sessionManager);

// Define routes for handling CSP violations
app.use('/api', cspRoutes);

// Route for setting session data
app.post('/api/set-session', (req, res) => {
  try {
    
    const sessionData = req.body.data;

    if (sessionData) {
      req.session.data = sessionData; // Store the provided data in the session
      res.send({ message: 'Session data stored successfully' });
    } else {
      res.status(400).send({ error: 'No session data provided' });
    }
  } catch (error) {
    console.error('Error setting session data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Apply error handler middleware after all routes
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
});
