# 🚀 Deployment Guide

Complete guide for deploying **The Washing Machine** to Ubuntu Server with Docker.

## ⚡ Quick Start (Copy-Paste Commands)

```bash
# On Ubuntu Server - Install Docker
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER && newgrp docker

# Clone and Setup
git clone <YOUR_REPO_URL> && cd The_Washing_Machine
cp .env.example .env
nano .env  # Edit: Set DB_PASSWORD, JWT_SECRET, and YOUR_SERVER_IP
chmod +x backend/init-db.sh

# Deploy
docker compose build
docker compose up -d
sleep 30  # Wait for services to start
docker exec -it washing-machine-backend sh -c "npm run db:reset:seed"

# Access at http://YOUR_SERVER_IP
# Login: owner@washingmachine.com / Owner@123 (CHANGE PASSWORD IMMEDIATELY!)
```

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Server Setup](#initial-server-setup)
3. [Deployment Steps](#deployment-steps)
4. [Accessing the Application](#accessing-the-application)
5. [Maintenance & Operations](#maintenance--operations)
6. [Troubleshooting](#troubleshooting)
7. [Security Considerations](#security-considerations)

---

## Prerequisites

### On Ubuntu Server

- **Ubuntu Server 20.04 LTS or newer**
- **At least 2GB RAM** (4GB recommended)
- **10GB free disk space**
- **Network connection** (to download Docker images)

### On Your Development Machine

- **Git** installed
- SSH access to Ubuntu Server
- Same local network as Ubuntu Server

---

## Initial Server Setup

### Step 1: SSH into Ubuntu Server

```bash
ssh username@YOUR_SERVER_IP
```

Replace `YOUR_SERVER_IP` with your Ubuntu server's IP address (e.g., `192.168.1.100`).

### Step 2: Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### Step 3: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Apply group changes (or logout and login again)
newgrp docker

# Verify Docker installation
docker --version
```

Expected output: `Docker version 24.x.x` or newer

### Step 4: Install Docker Compose

```bash
# Docker Compose is included in recent Docker installations
# Verify it's available:
docker compose version
```

Expected output: `Docker Compose version v2.x.x` or newer

---

## Deployment Steps

### Step 1: Clone the Repository

```bash
# Navigate to desired location
cd ~

# Clone your repository (replace with your GitHub URL)
git clone https://github.com/YOUR_USERNAME/The_Washing_Machine.git

# Navigate to project directory
cd The_Washing_Machine

# Ensure you're on main branch
git checkout main
```

### Step 2: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment file
nano .env
```

**Required Configuration:**

```env
# Database Password - CHANGE THIS!
DB_PASSWORD=your_secure_password_123

# JWT Secret - Generate a strong random key
# Run this command to generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_64_character_random_hex_string_here

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Frontend URL - Use your server's IP
FRONTEND_URL=http://192.168.1.100

# Backend API URL - Use your server's IP
VITE_API_BASE_URL=http://192.168.1.100:5000/api
```

**To find your server's IP address:**

```bash
hostname -I | awk '{print $1}'
# or
ip addr show | grep "inet 192.168"
```

Save the file: Press `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Make Init Script Executable

```bash
chmod +x backend/init-db.sh
```

### Step 4: Build Docker Images

```bash
# This will build all containers (may take 5-10 minutes)
docker compose build
```

You should see output indicating successful builds for:

- ✅ postgres (from Docker Hub)
- ✅ backend (building from Dockerfile)
- ✅ frontend (building from Dockerfile)

### Step 5: Start the Application

```bash
# Start all services in detached mode
docker compose up -d
```

### Step 6: Initialize Database

Wait about 30 seconds for the database to be ready, then initialize:

```bash
# Enter the backend container
docker exec -it washing-machine-backend sh

# Run database reset and seed owner
npm run db:reset:seed

# Exit the container
exit
```

You should see:

```
✅ Owner account created successfully!
=====================================
Email: owner@washingmachine.com
Password: Owner@123
=====================================
```

### Step 7: Verify All Services Are Running

```bash
docker compose ps
```

Expected output - all services should show "Up" and healthy:

```
NAME                        STATUS
washing-machine-backend     Up (healthy)
washing-machine-db          Up (healthy)
washing-machine-frontend    Up (healthy)
```

---

## Accessing the Application

### From Any Device on Your Local Network

1. **Find your Ubuntu server's IP address** (already noted during setup)

   ```bash
   hostname -I | awk '{print $1}'
   ```

2. **Access the application:**
   - **Main Application:** `http://YOUR_SERVER_IP` (e.g., `http://192.168.1.100`)
   - **API Documentation:** `http://YOUR_SERVER_IP:5000/api-docs`

3. **Login with default owner credentials:**
   - Email: `owner@washingmachine.com`
   - Password: `Owner@123`

4. **🔒 IMPORTANT: Change the default password immediately!**
   - Go to Profile → Change Password

### Testing from Different Devices

- **Desktop/Laptop:** Open browser → `http://YOUR_SERVER_IP`
- **Mobile Phone:** Connect to same WiFi → Open browser → `http://YOUR_SERVER_IP`
- **Tablet:** Same as mobile

---

## Maintenance & Operations

### View Logs

```bash
# View all logs
docker compose logs

# View logs for specific service
docker compose logs backend
docker compose logs frontend
docker compose logs postgres

# Follow logs in real-time
docker compose logs -f backend
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend
```

### Stop the Application

```bash
# Stop all services (containers remain)
docker compose stop

# Stop and remove containers (data persists in volumes)
docker compose down

# Stop and remove containers AND volumes (⚠️ DELETES ALL DATA!)
docker compose down -v
```

### Start the Application Again

```bash
docker compose up -d
```

### Update the Application

When you push updates to GitHub:

```bash
# On Ubuntu Server
cd ~/The_Washing_Machine

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose build
docker compose up -d
```

### Backup Database

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
docker exec washing-machine-db pg_dump -U postgres washing_machine > ~/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# List backups
ls -lh ~/backups/
```

### Restore Database

```bash
# Stop backend to prevent conflicts
docker compose stop backend

# Restore from backup file
docker exec -i washing-machine-db psql -U postgres washing_machine < ~/backups/backup_YYYYMMDD_HHMMSS.sql

# Restart backend
docker compose start backend
```

### Monitor Resource Usage

```bash
# View container stats (CPU, memory)
docker stats

# View disk usage
docker system df
```

---

## Troubleshooting

### Issue: Can't access application from other devices

**Solution 1: Check if services are running**

```bash
docker compose ps
# All should show "Up (healthy)"
```

**Solution 2: Check Ubuntu firewall**

```bash
# Allow ports 80 and 5000
sudo ufw allow 80
sudo ufw allow 5000

# Check firewall status
sudo ufw status
```

**Solution 3: Verify IP address**

```bash
# Ensure you're using the correct IP
hostname -I | awk '{print $1}'

# Try accessing from server itself first
curl http://localhost
```

### Issue: Backend container keeps restarting

**Check logs:**

```bash
docker compose logs backend
```

**Common causes:**

- Database not ready → Wait 30 seconds and check again
- Wrong environment variables → Check `.env` file
- Database connection error → Verify `DB_PASSWORD` matches

### Issue: Frontend shows blank page

**Check browser console for errors:**

- Look for CORS errors
- Check if API URL is correct in `.env`
- Verify `VITE_API_BASE_URL` points to server IP

**Rebuild frontend:**

```bash
docker compose down
docker compose build frontend
docker compose up -d
```

### Issue: Database initialization failed

**Manually initialize:**

```bash
docker exec -it washing-machine-backend sh
npm run db:reset:seed
exit
```

### Issue: Out of disk space

**Clean up Docker resources:**

```bash
# Remove unused images, containers, networks
docker system prune -a

# WARNING: This removes all stopped containers and unused images
```

### Issue: Port 80 already in use

**Find what's using port 80:**

```bash
sudo lsof -i :80
```

**Stop conflicting service (e.g., Apache):**

```bash
sudo systemctl stop apache2
# or
sudo systemctl stop nginx
```

### View All Container Details

```bash
# Inspect specific container
docker inspect washing-machine-backend

# Check health status
docker inspect washing-machine-backend | grep -A 10 Health
```

---

## Security Considerations

### 🔒 Essential Security Steps

1. **Change Default Owner Password**
   - Login → Profile → Change Password
   - Use a strong password (12+ characters, mixed case, numbers, symbols)

2. **Secure Environment Variables**

   ```bash
   # Ensure .env is not readable by others
   chmod 600 .env
   ```

3. **Generate Strong JWT Secret**

   ```bash
   # Generate new random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   # Update in .env file
   nano .env
   ```

4. **Configure Firewall (UFW)**

   ```bash
   # Enable firewall
   sudo ufw enable

   # Allow SSH (IMPORTANT - don't lock yourself out!)
   sudo ufw allow ssh

   # Allow HTTP for the application
   sudo ufw allow 80
   sudo ufw allow 5000

   # Deny all other incoming traffic
   sudo ufw default deny incoming
   sudo ufw default allow outgoing

   # Check status
   sudo ufw status verbose
   ```

5. **Regular Backups**

   ```bash
   # Create weekly backup cron job
   crontab -e

   # Add this line (runs every Sunday at 2 AM):
   0 2 * * 0 docker exec washing-machine-db pg_dump -U postgres washing_machine > ~/backups/backup_$(date +\%Y\%m\%d).sql
   ```

6. **Keep System Updated**

   ```bash
   # Update Ubuntu packages weekly
   sudo apt update && sudo apt upgrade -y

   # Update Docker images monthly
   docker compose pull
   docker compose up -d
   ```

### 🌐 Network Security

**Local Network Only:**

- Application is accessible only on your local WiFi/LAN
- Not exposed to the internet
- Firewall blocks external access

**To verify local-only access:**

```bash
# This should time out from outside your network
curl -I http://YOUR_PUBLIC_IP
```

### Optional: Portainer for Container Management

Portainer provides a web UI for managing Docker containers:

```bash
# Create portainer volume
docker volume create portainer_data

# Run Portainer
docker run -d -p 9000:9000 --name=portainer --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# Access Portainer at: http://YOUR_SERVER_IP:9000
```

First login will ask you to create an admin password.

---

## Quick Reference Commands

### Start/Stop

```bash
docker compose up -d          # Start all services
docker compose down           # Stop all services
docker compose restart        # Restart all services
```

### Logs

```bash
docker compose logs -f        # Follow all logs
docker compose logs backend   # View backend logs
```

### Database

```bash
npm run db:reset:seed         # Reset DB and seed owner (inside container)
docker exec washing-machine-db pg_dump -U postgres washing_machine > backup.sql
```

### Status

```bash
docker compose ps             # Service status
docker stats                  # Resource usage
```

### Backup

```bash
docker exec washing-machine-db pg_dump -U postgres washing_machine > backup.sql
```

---

## Support

If you encounter issues:

1. **Check logs first:** `docker compose logs -f`
2. **Verify all services healthy:** `docker compose ps`
3. **Check environment variables:** `cat .env`
4. **Restart services:** `docker compose restart`

---

**🎉 Congratulations! Your application is now running on Ubuntu Server and accessible from your local network!**

Default credentials: `owner@washingmachine.com` / `Owner@123` (change immediately!)
