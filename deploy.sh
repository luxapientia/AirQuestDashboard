#!/bin/bash

# AirQuest Dashboard Deployment Script for Ubuntu with PM2
# This script builds the frontend and deploys the backend using PM2

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="backend"
FRONTEND_DIR="."
APP_NAME="airquest-dashboard"
BACKEND_APP_NAME="airquest-backend"
FRONTEND_APP_NAME="airquest-frontend"

echo -e "${GREEN}🚀 Starting AirQuest Dashboard Deployment...${NC}\n"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 is not installed. Installing PM2...${NC}"
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed successfully${NC}\n"
else
    echo -e "${GREEN}✅ PM2 is installed${NC}\n"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Step 1: Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}\n"

# Step 2: Build frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}\n"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

# Step 3: Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd "$BACKEND_DIR"
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}\n"

# Step 4: Validate backend
echo -e "${YELLOW}🔍 Validating backend code...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend validation passed${NC}\n"
else
    echo -e "${RED}❌ Backend validation failed${NC}"
    exit 1
fi

# Step 5: Check for .env file in backend
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env file not found. Creating from .env.example if it exists...${NC}"
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        echo -e "${YELLOW}⚠️  Please update backend/.env with your configuration before starting the server${NC}\n"
    else
        echo -e "${YELLOW}⚠️  No .env.example found. Please create backend/.env manually${NC}\n"
    fi
fi

# Step 6: Stop existing PM2 processes if running
echo -e "${YELLOW}🛑 Stopping existing PM2 processes...${NC}"
pm2 stop "$BACKEND_APP_NAME" 2>/dev/null || true
pm2 delete "$BACKEND_APP_NAME" 2>/dev/null || true
echo -e "${GREEN}✅ Existing processes stopped${NC}\n"

# Step 7: Create logs directory if it doesn't exist
echo -e "${YELLOW}📁 Creating logs directory...${NC}"
mkdir -p "$BACKEND_DIR/logs"
echo -e "${GREEN}✅ Logs directory ready${NC}\n"

# Step 8: Start backend with PM2
echo -e "${YELLOW}🚀 Starting backend with PM2...${NC}"
cd "$BACKEND_DIR"

# Use ecosystem file if it exists, otherwise use direct command
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js
else
    pm2 start server.js --name "$BACKEND_APP_NAME" \
        --log-date-format="YYYY-MM-DD HH:mm:ss Z" \
        --error-log="logs/error.log" \
        --out-log="logs/out.log" \
        --merge-logs \
        --time
fi

# Step 9: Save PM2 configuration
echo -e "${YELLOW}💾 Saving PM2 configuration...${NC}"
pm2 save
pm2 startup 2>/dev/null || echo -e "${YELLOW}⚠️  Run 'pm2 startup' manually to enable auto-start on system boot${NC}"

# Step 10: Show status
echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}\n"
echo -e "${GREEN}📊 PM2 Status:${NC}"
pm2 status

echo -e "\n${GREEN}📝 Useful PM2 commands:${NC}"
echo -e "  pm2 logs $BACKEND_APP_NAME     # View logs"
echo -e "  pm2 restart $BACKEND_APP_NAME   # Restart backend"
echo -e "  pm2 stop $BACKEND_APP_NAME      # Stop backend"
echo -e "  pm2 monit                       # Monitor processes"
echo -e "  pm2 list                        # List all processes"

echo -e "\n${GREEN}🌐 Frontend build is in the 'dist' directory${NC}"
echo -e "${YELLOW}💡 Configure your web server (nginx/apache) to serve the 'dist' directory${NC}\n"

cd ..

