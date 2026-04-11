# The Washing Machine

A full-stack vehicle service booking platform for modern automotive businesses. The system provides a customer self-service portal, an employee management suite, and a complete administrative interface, delivered as a containerised application with an automated CI/CD pipeline.

**Live:** [washingmachine.truegate.live](https://washingmachine.truegate.live)

---

## Repository Structure

```
The_Washing_Machine/
├── backend/              # Node.js + Express REST API
├── frontend/             # React + Vite SPA
├── terraform/            # AWS infrastructure (IaC)
├── .github/workflows/    # GitHub Actions (mirror to GitLab)
├── .gitlab-ci.yml        # CI/CD pipeline definition
├── docker-compose.yml    # Local development stack
└── docker-compose.prod.yml # Production stack
```

Each subdirectory contains its own `README.md` with detailed documentation:

- [backend/README.md](./backend/README.md) — API architecture, routes, database schema, auth, testing
- [frontend/README.md](./frontend/README.md) — SPA architecture, routing, state management, build
- [terraform/README.md](./terraform/README.md) — AWS resources, Security Groups, EC2 spec, state management

---

## System Architecture

```
User (Browser)
    │
    ▼
Nginx (HTTP/2 + Gzip)              ← React SPA + Let's Encrypt SSL
    │
    ├── /                          → Serves optimized React (Vite Chunking)
    └── /api/*                     → Proxies to backend (PM2 Cluster Mode)
                                            │
                                   ┌────────┼────────┐
                                   │                 │
                               PostgreSQL          Redis
                               (data store)   (Edge Cache + queue broker)
                                                     │
                                                 BullMQ Worker
                                                 (email dispatch)
                                                     │
                                                 Socket.io
                                                 (real-time push)
                                                     │
                                               Telegram Bot
                                             (employee notifications)
```

All services run as Docker containers on a single AWS EC2 Instance. The Nginx frontend container serves static assets with high parallelism and proxies /api requests to a Node.js cluster managed by PM2. API performance is accelerated by an integrated Redis Edge Caching layer.

---

## Technology Stack

### Backend

| Category | Technology |
|---|---|
| Runtime | Node.js 18+ (ES Modules) |
| Framework | Express.js ~4.16 |
| Database | PostgreSQL 15 (pg pool, raw SQL) |
| Cache / Queue | Redis 7 + ioredis + BullMQ |
| Auth | JWT + bcryptjs |
| Logging | Pino + pino-http (JSON streaming) |
| Process Management | PM2 (Cluster mode) |
| Performance | Redis Edge Caching |
| Validation | Joi |
| File uploads | Multer |
| Email | Nodemailer (SMTP) |
| Real-time | Socket.io 4 |
| Bot | node-telegram-bot-api |
| API docs | Swagger UI Express |
| Testing | Jest + Supertest |

### Frontend

| Category | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS v4 |
| UI Primitives | Radix UI |
| HTTP | Axios |
| Forms | React Hook Form |
| Performance | React.lazy() + Vite manualChunks |
| Maps | @vis.gl/react-google-maps |
| Real-time | Socket.io client |
| Testing | Vitest + React Testing Library |

### Infrastructure

| Category | Technology |
|---|---|
| Cloud | Amazon Web Services (Singapore) |
| IaC | Terraform + AWS provider |
| Compute | AWS t3.micro EC2 (Ubuntu 22.04 LTS) |
| Containers | Docker + Docker Compose |
| Reverse proxy | Nginx |
| SSL | Let's Encrypt (Certbot, auto-renew) |
| CI/CD | GitLab CI/CD |
| Source mirror | GitHub Actions → GitLab |

---

## User Roles

| Role | Type | Capabilities |
|---|---|---|
| Customer | Customer account | Book services, manage vehicles, submit advertisement requests, payment history, feedback, Service Due Reminders, real-time WebSocket notifications |
| Employee | Employee account | View assigned jobs, update status, Next Service Due tracking, leave requests, incident filing, real-time job update alerts |
| Cashier | Employee (`emptype=cashier`) | All employee capabilities + unified payment recording with automated service card updates |
| Owner | Employee (`emptype=owner`) | Full administrative access, marketplace ad management, daily schedule matrix locking, administrative service rescheduling, reports |

---

## CI/CD Pipeline

Pushes and pull requests to `main` on GitHub trigger the following:

```
GitHub (main branch)
    └── GitHub Actions: mirror to GitLab
            └── GitLab CI/CD:
                ├── infra    → terraform apply  (provision / update AWS EC2)
                ├── build    → docker build + push  (backend + frontend images)
                ├── deploy   → SSH into EC2, write .env.prod, docker compose up
                ├── ssl      → [manual] Certbot issues Let's Encrypt certificate
                └── seed     → [manual] seed roles, settings, owner account
```

The `ssl` and `seed` stages are triggered manually and are one-time operations. All other stages run automatically on the `main` branch.

---

## Production Services

| Container | Role | Exposed |
|---|---|---|
| `washing_machine_frontend` | Nginx: serves SPA + proxies `/api` | 80, 443 |
| `washing_machine_backend` | Node.js API | Internal only |
| `washing_machine_db` | PostgreSQL 15 | Internal only |
| `washing_machine_redis` | Redis 7 | Internal only |
| `washing_machine_certbot` | Certificate renewal (every 12 h) | — |

---

## Quick Start — Local Development

### Prerequisites

- Node.js v18+
- Docker and Docker Compose

### 1. Start infrastructure

```bash
docker-compose up -d
```

Starts PostgreSQL and Redis locally.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env.development.local
# Set DB_PASSWORD, JWT_SECRET, SMTP credentials, TELEGRAM_BOT_TOKEN
npm run db:reset:seed
npm run dev
```

API available at `http://localhost:5500`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5500/api
# Set VITE_GOOGLE_MAPS_API_KEY=your_key
npm run dev
```

Application available at `http://localhost:5173`.

---

## First-Time Production Deployment

### Prerequisites

1. AWS IAM Credentials — set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as protected GitLab CI/CD variables.
2. SSH Key Pair — set `SSH_PUBLIC_KEY` and `SSH_PRIVATE_KEY` (base64-encoded private key) as GitLab CI/CD variables.
3. Google Maps API key — set `VITE_GOOGLE_MAPS_API_KEY` as a GitLab CI/CD variable.
4. DNS `A` record: `washingmachine` → AWS Elastic IP at your DNS provider.

### Deployment sequence

```bash
# 1. Push to main — pipeline runs infra → build → deploy automatically
git push origin main

# 2. In GitLab: trigger ssl:init manually (one-time)
#    Certbot obtains the Let's Encrypt certificate via webroot
#    Container restarts; Nginx switches to HTTPS config

# 3. In GitLab: trigger seed:prod manually (one-time)
#    Runs role seeding and creates the owner account
```

Default owner credentials after seeding (change immediately):
```
Email:    owner@washingmachine.lk
Password: Owner@123
```

---

## Testing

### Backend

```bash
cd backend
npm test
```

9 test suites covering: customer auth, employee auth, bookings, vehicles, services, payments, feedback, profile, and health check.

### Frontend

```bash
cd frontend
npm run test:run
```

Vitest with React Testing Library in a jsdom environment.

---

## License

Proprietary software. All rights reserved.

---

**Version:** 1.9.0
**Last Updated:** April 11, 2026
**Live:** [washingmachine.truegate.live](https://washingmachine.truegate.live)

## Recent Maintenance

- March 29, 2026: Prettier and lint-driven clean up across backend/ frontend routes, scripts, and shared utilities.
- March 30, 2026: Implemented the **"Service Due Reminder"** engine and refined the **Payment Management** ledger.
- April 11, 2026: **Production Platform Migration**. Successfully migrated infrastructure from Azure (East US) to AWS (Singapore). Replaced Azure VM architecture with AWS EC2/VPC and updated the automated CI/CD pipeline to target the new environment.
