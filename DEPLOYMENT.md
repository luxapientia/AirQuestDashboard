# Deployment Guide for AirQuest Dashboard

This guide explains how to deploy the AirQuest Dashboard on Ubuntu using PM2.

## Prerequisites

- Ubuntu 18.04 or higher
- Node.js (v18 or higher)
- npm (comes with Node.js)
- MongoDB (installed and running)
- PM2 (will be installed automatically by the script)

## Quick Deployment

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repo-url>
   cd airquest_dashboard
   ```

2. **Make the deployment script executable**:
   ```bash
   chmod +x deploy.sh
   ```

3. **Configure environment variables**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB connection string and other settings
   nano .env
   ```

4. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```

The script will:
- ✅ Check and install PM2 if needed
- ✅ Install all dependencies (frontend and backend)
- ✅ Build the frontend
- ✅ Validate the backend
- ✅ Start the backend with PM2
- ✅ Save PM2 configuration

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Install PM2
```bash
npm install -g pm2
```

### 2. Build Frontend
```bash
npm install
npm run build
```

### 3. Setup Backend
```bash
cd backend
npm install
npm run build  # Validates the code
```

### 4. Configure Environment
```bash
# Create .env file
cp .env.example .env
nano .env  # Edit with your settings
```

### 5. Start with PM2

**Option A: Using ecosystem.config.js (Recommended)**
```bash
cd backend
pm2 start ecosystem.config.js
pm2 save
```

**Option B: Direct command**
```bash
cd backend
pm2 start server.js --name airquest-backend \
  --log-date-format="YYYY-MM-DD HH:mm:ss Z" \
  --error-log="logs/error.log" \
  --out-log="logs/out.log" \
  --merge-logs \
  --time
pm2 save
```

### 6. Enable Auto-start on Boot
```bash
pm2 startup
# Follow the instructions shown
pm2 save
```

## PM2 Management Commands

### View Status
```bash
pm2 status
pm2 list
```

### View Logs
```bash
pm2 logs airquest-backend          # All logs
pm2 logs airquest-backend --lines 100  # Last 100 lines
pm2 logs airquest-backend --err     # Error logs only
```

### Restart/Stop/Delete
```bash
pm2 restart airquest-backend
pm2 stop airquest-backend
pm2 delete airquest-backend
```

### Monitor
```bash
pm2 monit  # Real-time monitoring
```

### Update Application
```bash
# After pulling new code
cd backend
npm install
pm2 restart airquest-backend
```

## Frontend Deployment

The frontend is built into the `dist` directory. You need to serve it with a web server:

### Option 1: Nginx (Recommended)

1. **Install Nginx**:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Create Nginx configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/airquest
   ```

3. **Add configuration**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # or your server IP

       root /path/to/airquest_dashboard/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Proxy API requests to backend
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

4. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/airquest /etc/nginx/sites-enabled/
   sudo nginx -t  # Test configuration
   sudo systemctl reload nginx
   ```

### Option 2: Serve with PM2 (Simple, not recommended for production)

You can also serve the frontend with PM2 using a simple HTTP server:

```bash
npm install -g serve
pm2 serve dist 3000 --name airquest-frontend --spa
pm2 save
```

## Environment Variables

Make sure your `backend/.env` file contains:

```env
PORT=3001
FRONTEND_URL=http://your-domain.com
MONGODB_URI=mongodb://localhost:27017/airquest
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/airquest
```

## MongoDB Setup

### Local MongoDB
```bash
# Install MongoDB
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Add connection string to `backend/.env`

## Troubleshooting

### PM2 process not starting
```bash
pm2 logs airquest-backend --err  # Check error logs
pm2 describe airquest-backend    # Check process details
```

### MongoDB connection issues
- Verify MongoDB is running: `sudo systemctl status mongodb`
- Check connection string in `.env`
- Verify MongoDB is accessible: `mongosh mongodb://localhost:27017`

### Port already in use
```bash
# Check what's using port 3001
sudo lsof -i :3001
# Or
sudo netstat -tulpn | grep 3001
```

### Frontend not loading
- Check if `dist` directory exists and has files
- Verify Nginx configuration
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

## Production Checklist

- [ ] MongoDB is running and accessible
- [ ] Environment variables are configured
- [ ] PM2 is installed and configured
- [ ] Backend is running with PM2
- [ ] Frontend is built and served
- [ ] Nginx (or web server) is configured
- [ ] Firewall allows ports 80, 443, and 3001
- [ ] SSL certificate is configured (for HTTPS)
- [ ] PM2 auto-start is enabled
- [ ] Logs are being monitored

## Updating the Application

1. **Pull latest code**:
   ```bash
   git pull origin main
   ```

2. **Rebuild frontend**:
   ```bash
   npm install
   npm run build
   ```

3. **Update backend**:
   ```bash
   cd backend
   npm install
   pm2 restart airquest-backend
   ```

4. **Reload web server** (if using Nginx):
   ```bash
   sudo systemctl reload nginx
   ```

## Monitoring

### PM2 Monitoring
```bash
pm2 monit  # Real-time dashboard
```

### System Monitoring
```bash
# Check system resources
htop
# Or
top

# Check disk space
df -h

# Check MongoDB status
sudo systemctl status mongodb
```

## Backup

### MongoDB Backup
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/airquest" --out=/backup/airquest-$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/airquest" /backup/airquest-YYYYMMDD
```

## Security Considerations

1. **Firewall**: Only expose necessary ports
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. **Environment Variables**: Never commit `.env` files
3. **MongoDB**: Use authentication in production
4. **HTTPS**: Use SSL certificates (Let's Encrypt)
5. **PM2**: Run as non-root user when possible

## Support

For issues or questions, check:
- PM2 documentation: https://pm2.keymetrics.io/
- MongoDB documentation: https://docs.mongodb.com/
- Nginx documentation: https://nginx.org/en/docs/

