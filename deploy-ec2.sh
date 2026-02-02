#!/bin/bash

# AWS EC2 Deployment Script for Student ERP Portal Backend

echo "🚀 Starting AWS EC2 Deployment..."

# Update system
echo "📦 Updating system packages..."
sudo yum update -y || sudo apt-get update -y

# Install Node.js 18.x (if not installed)
echo "📦 Installing Node.js..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs || sudo apt-get install -y nodejs

# Verify Node installation
echo "✅ Node version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Navigate to application directory
cd /home/ec2-user/erp_portal/backend || cd /home/ubuntu/erp_portal/backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads

# Set environment to production
export NODE_ENV=production

# Stop existing PM2 process (if any)
echo "🛑 Stopping existing processes..."
pm2 stop erp-backend || true
pm2 delete erp-backend || true

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start server.js --name erp-backend --node-args="--max-old-space-size=2048"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system reboot
pm2 startup

echo "✅ Deployment complete!"
echo "📊 Check status: pm2 status"
echo "📝 View logs: pm2 logs erp-backend"
echo "🔄 Restart: pm2 restart erp-backend"
