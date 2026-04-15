# The Washing Machine

**Version 2.0.0** — Production-grade vehicle service booking platform

A full-stack platform for modern automotive businesses serving customers, employees, and administrators. The system provides a customer self-service portal, an employee management suite, and a complete administrative interface — delivered as containerised microservices with automated CI/CD deployment.

**Live:** [washingmachine.truegate.live](https://washingmachine.truegate.live)

---

## Quick Start

### Development Environment

Start the full local stack in three steps:

```bash
# 1. Start PostgreSQL + Redis
docker-compose up -d

# 2. Backend (http://localhost:5500)
cd backend && npm install && npm run db:reset:seed && npm run dev

# 3. Frontend (http://localhost:5173)
cd frontend && npm install && npm run dev
```

See [backend/README.md](./backend/README.md) and [frontend/README.md](./frontend/README.md) for detailed setup.

### Production Deployment

Push to `main` on GitHub. The automated CI/CD pipeline handles:
- Terraform infrastructure provisioning
- Docker image building and pushing to GitLab Container Registry
- EC2 deployment with docker-compose
- SSL certificate management via Let's Encrypt

See [.gitlab-ci.yml](./.gitlab-ci.yml) for pipeline stages.

---

## What's New in v2.0.0

- **Backend**: Refined edge caching, enhanced real-time socket communication, improved error handling, PM2 cluster mode, comprehensive Swagger documentation, Telegram bot integration, advanced scheduling workflows
- **Frontend**: Lazy-loaded 35+ pages, enhanced form validation, integrated Google Maps location picker, real-time Socket.io notifications, responsive design improvements, Vite manual chunking for browser caching, full test coverage
- **Infrastructure**: AWS Singapore deployment, automated CI/CD pipeline, Docker containerization, Let's Encrypt SSL with auto-renewal
- **Documentation**: Complete API and SPA technical references, quick start guides, deployment instructions

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

## Detailed Setup Instructions

### Backend

Comprehensive guide: [backend/README.md](./backend/README.md)

```bash
cd backend
npm install
cp .env.example .env.development.local
# Edit .env.development.local with local credentials
npm run docker:up      # Start PostgreSQL + Redis
npm run db:reset:seed  # Initialize schema + seed owner account
npm run dev            # Start server (http://localhost:5500)
```

### Frontend

Comprehensive guide: [frontend/README.md](./frontend/README.md)

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API base URL and Google Maps key
npm run dev            # Start dev server (http://localhost:5173)
```

### Infrastructure

Comprehensive guide: [terraform/README.md](./terraform/README.md)

---

## Production Deployment

Automated CI/CD pipeline on every push to `main`:

1. **GitHub push** → GitHub Actions mirroring → GitLab push
2. **GitLab CI/CD pipeline** executes automatically:
   - `infra:deploy` — Terraform provisions/updates AWS EC2 infrastructure
   - `build:backend` — Docker builds backend:2.0.0 and pushes to GitLab Container Registry
   - `build:frontend` — Docker builds frontend:2.0.0 and pushes to GitLab Container Registry
   - `deploy:prod` — SSH into EC2, pulls images, runs docker-compose up -d

3. **One-time manual steps** (first deployment only):
   - `ssl:init` — Certbot obtains Let's Encrypt certificate via webroot validation
   - `seed:prod` — Runs database seeding (roles, settings, owner account)

After these one-time steps, subsequent deployments are fully automated.

### Prerequisites for First Deployment

Set GitLab CI/CD variables:
- `AWS_ACCESS_KEY_ID` — IAM user with EC2/VPC permissions
- `AWS_SECRET_ACCESS_KEY` — IAM secret key
- `SSH_PRIVATE_KEY` — Base64-encoded SSH private key for EC2 access
- `VITE_GOOGLE_MAPS_API_KEY` — Google Maps API key

Add DNS A record:
- `washingmachine.yourdomain.com` → AWS Elastic IP

### Default Owner Account (after seed:prod)

Create immediately after first deployment:

```
Email:    owner@washingmachine.lk
Password: Owner@123

Action: Change password and update email in dashboard
```

---

## Environment Configuration

All sensitive values are injected at deployment time via environment variables. No secrets are committed to the repository.

### Backend (.env.production)

Required variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `COOKIE_AGE`
- `REDIS_HOST`, `REDIS_PORT`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `GOOGLE_MAPS_API_KEY`, `CORS_ORIGIN`

Optional: Telegram bot token and feature toggles

### Frontend (build-time)

Build arguments passed to Docker:
- `VITE_API_BASE_URL` — `/api` (Nginx proxies to backend)
- `VITE_GOOGLE_MAPS_API_KEY` — Embedded at build time

### Infrastructure (terraform.tfvars)

EC2 sizing, VPC configuration, security groups — see [terraform/README.md](./terraform/README.md)

---

## Cloud Architecture

The application runs on **AWS (Singapore region)** with:
- **Compute**: t3.micro EC2 instance (Ubuntu 22.04 LTS)
- **Storage**: SSD-backed volumes (root + data partition)

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

MIT License — See [LICENSE](./LICENSE) for details.

---

**Version:** 2.0.0  
**Last Updated:** April 15, 2026  
**Live:** [washingmachine.truegate.live](https://washingmachine.truegate.live)
