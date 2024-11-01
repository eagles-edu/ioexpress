// pm2 start ecosystem.config.js --env production

module.exports = {
  apps: [
    {
      name: 'express-dev',
      script: './server.js', // Path to the main server file
      instances: 1,
      exec_mode: 'fork', // Use 'cluster' for load balancing if needed
      watch: true, // Disable watching in production for stability
      ignore_watch: ['logs'], // Useful if watch is enabled in other environments
      env: {
        NODE_ENV: 'development',
        TZ: 'Asia/Bangkok' // Default timezone for non-production environments
      },
      env_production: {
        NODE_ENV: 'production',
        TZ: 'Asia/Bangkok' // Timezone for production
      },
      log_date_format: 'YYYY-MM-DD HH:mm z', // Timezone-aware log format
      max_restarts: 5, // Limit restarts on crash loops
      restart_delay: 5000 // 5-second delay between restarts
    }
  ]
};

