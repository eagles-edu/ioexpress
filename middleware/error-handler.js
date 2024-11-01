// error-handler.js
const moment = require('moment-timezone');

const errorHandler = (err, req, res, next) => {
  const currentTime = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss z');

  // Log error details to console (you can log it to a file in production)
  console.error(`[${currentTime}] Error occurred during ${req.method} ${req.url}:`);
  console.error(err.stack || err.message);

  // Send generic response to client based on environment
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'An internal server error occurred. Please try again later.',
    });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

module.exports = errorHandler;

