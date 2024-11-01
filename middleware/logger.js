const express = require('express');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const router = express.Router();

// Define an absolute path to the log file
const logFilePath = path.join(__dirname, '../logs/csp-violations.log');

// Ensure the logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir); // Create the logs directory if it doesn't exist
}

// Middleware to parse CSP reports
router.use(express.json({ type: ['application/json', 'application/csp-report'] }));

// Example CSP violation route
router.post('/csp-violation', (req, res) => {
  // Log raw incoming request for debugging
  console.log('Raw CSP report received:', req.body);

  const violation = req.body['csp-report']; // Access the 'csp-report' key

  if (violation) {
    const currentTime = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss z');

    // Format the log message as a readable list
    const logMessage = `
======================================
CSP Violation Reported:
  - Time: ${currentTime}
  - Document URI: ${violation['document-uri'] || 'N/A'}
  - Violated Directive: ${violation['violated-directive'] || 'N/A'}
  - Blocked URI: ${violation['blocked-uri'] || 'N/A'}
=======================================

`;

    // Asynchronous logging with error handling
    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) {
        console.error('Error writing to CSP log file:', err);
      } else {
        console.log('CSP Violation Logged:', logMessage);
      }
    });
  } else {
    console.warn('No "csp-report" found in the request body');
  }

  res.status(204).send(); // Send "No Content" status
});

module.exports = router;
