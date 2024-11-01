const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

// Define the log file path for general request logs
const requestLogFilePath = path.join(__dirname, '../logs/requests.log');

// Ensure the logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir); // Create the logs directory if it doesn't exist
}

// Logger middleware for general requests
const logger = (req, res, next) => {
  const formattedDate = moment()
    .tz('Asia/Bangkok')
    .format('YYYY-MM-DD HH:mm:ss z');
  const logMessage = `
  =============================================
  Request Activity:
    - Method: ${req.method}
    - URL: ${req.url}
    - Time: ${formattedDate}
    - IP: ${req.ip}
    - User-Agent: ${req.headers['user-agent'] || 'Unknown'}
    - Referer: ${req.headers.referer || 'None'}
  =============================================
`;

  // Log to console (optional, for debugging purposes)
  console.log(logMessage);

  // Append request log to requests.log asynchronously
  fs.appendFile(requestLogFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to request log file:', err);
    }
  });

  next();
};

module.exports = logger;
