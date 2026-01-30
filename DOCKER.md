# Docker Deployment Files

This project includes Docker configuration for easy deployment.

## Quick Start

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete instructions.

## Files Included

- `docker-compose.yml` - Orchestration for all services (PostgreSQL, Backend, Frontend)
- `backend/Dockerfile` - Backend API container
- `frontend/Dockerfile` - Frontend React + Nginx container
- `frontend/nginx.conf` - Nginx web server configuration
- `.env.example` - Environment variables template
- `verify-docker.sh` - Local testing script (optional)

## Services

| Service  | Port | Access                              |
| -------- | ---- | ----------------------------------- |
| Frontend | 80   | http://YOUR_SERVER_IP               |
| Backend  | 5000 | http://YOUR_SERVER_IP:5000/api-docs |
| Database | 5432 | Internal (not exposed)              |
