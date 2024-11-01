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

// Asynchronous CSP violation route
router.post('/csp-violation', (req, res) => {
  const violation = req.body['csp-report'];

  if (violation) {
    const currentTime = moment().tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss z');

    // Format the log message as a readable list
    const logMessage = `
  ========================================
  CSP Violation Reported:
    - Time: ${currentTime}
    - Document URI: ${violation['document-uri'] || 'N/A'}
    - Violated Directive: ${violation['violated-directive'] || 'N/A'}
    - Blocked URI: ${violation['blocked-uri'] || 'N/A'}
  ========================================
`;

    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) {
        console.error('Error writing to CSP log file:', err);
        return res.status(500).send('Internal Server Error');
      }
      console.log('CSP Violation Logged:', logMessage);
      res.status(204).send(); // Send "No Content" status after logging successfully
    });
  } else {
    console.warn('No CSP violation report in request body');
    res.status(400).send('Bad Request: No CSP violation found');
  }
});

module.exports = router;
