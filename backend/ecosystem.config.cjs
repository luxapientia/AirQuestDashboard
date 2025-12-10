/**
 * PM2 Ecosystem Configuration for AirQuest Backend
 * 
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 start ecosystem.config.cjs --env production
 */

module.exports = {
  apps: [
    {
      name: 'airquest-backend',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 80,
        FRONTEND_URL: 'http://localhost:8080,http://38.54.6.91:8080',
        MONGODB_URI: 'mongodb://localhost:27017/airquest'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 80,
        FRONTEND_URL: 'http://38.54.6.91:8080,http://localhost:8080',
        MONGODB_URI: 'mongodb://localhost:27017/airquest'
      },
      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      merge_logs: true,
      time: true,
      
      // Auto restart settings
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      
      // Advanced settings
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: false
    }
  ]
};

