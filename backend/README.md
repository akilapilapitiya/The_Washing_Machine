# Backend — Technical Reference

## Overview

The backend is a RESTful API server built with Node.js and Express.js, serving as the core of The Washing Machine vehicle service platform. It handles authentication, booking lifecycle management, scheduling, payments, notifications, and real-time communication across four distinct user roles.

The server exposes 21 route modules, manages 22 database tables initialised at boot via a model-driven schema, processes background email jobs through a Redis-backed queue, and delivers real-time events over an authenticated WebSocket connection.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Authentication and Authorisation](#authentication-and-authorisation)
6. [API Reference](#api-reference)
7. [Middleware Stack](#middleware-stack)
8. [Background Job Processing](#background-job-processing)
9. [Edge Caching](#edge-caching)
10. [Real-Time Communication](#real-time-communication)
11. [External Integrations](#external-integrations)
12. [Configuration](#configuration)
13. [Running the Server](#running-the-server)
14. [Database Management](#database-management)
15. [Testing](#testing)

---

## Architecture

```
HTTP Request
    │
    ├── CORS
    ├── Helmet (security headers)
    ├── Compression
    ├── Pino Logging (telemetry)
    ├── Rate Limiter (global + auth)
    ├── Redis Edge Cache (GET interceptor)
    ├── Body Parser / Cookie Parser
    │
    ├── Route Layer  (/api/*)
    │       ├── Auth Middleware  (JWT verification + DB existence check)
    │       ├── Role Guard       (restrictTo(...roles))
    │       ├── Validation       (Joi schemas)
    │       └── Controller
    │               └── Service  (business logic, direct SQL via pg Pool)
    │
    └── Error Handler (centralised, structured responses)

Parallel systems:
    ├── Socket.io  — authenticated WebSocket, per-user rooms
    ├── BullMQ     — Redis-backed email job queue
    └── Telegram   — optional bot for employee notifications
```

The application follows a strict layered pattern:

- **Routes** define HTTP method, path, and middleware chain only.
- **Controllers** extract request data and delegate to services. No SQL.
- **Services** contain all business logic and execute parameterised SQL directly against the connection pool. No ORM.
- **Validators** define Joi schemas consumed by `validation.middleware.js`.
- **Models** are schema-definition functions run at startup — not active query objects.

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 18+ (ESM) |
| Framework | Express.js | ~4.16.1 |
| Database | PostgreSQL + pg Pool | ^8.16.3 |
| Cache / Queue broker | Redis via ioredis | ^5.9.2 |
| Job queue | BullMQ | ^5.67.2 |
| Authentication | jsonwebtoken + bcryptjs | ^9.0.3 / ^3.0.3 |
| Input validation | Joi | ^18.0.2 |
| File uploads | Multer | ^2.0.2 |
| Email | Nodemailer | ^7.0.12 |
| Messaging | node-telegram-bot-api | ^0.67.0 |
| Real-time | Socket.io | ^4.8.3 |
| Security | Helmet, express-rate-limit, CORS | ^8.1.0 / ^8.2.1 / ^2.8.5 |
| Compression | compression | ^1.8.1 |
| HTTP client | axios | ^1.13.4 |
| API docs | swagger-ui-express + yamljs | ^5.0.1 / ^0.3.0 |
| Logging | Pino + pino-http | ^9.6.0 / ^10.4.0 |
| Process Management | PM2 | ^5.4.3 |
| Testing | Jest + Supertest | ^29.7.0 / ^7.0.0 |
| Dev server | nodemon | ^3.1.11 |

The codebase uses **ES Modules** (`"type": "module"` in package.json). All imports use `.js` extensions explicitly.

---

## Project Structure

```
backend/
├── app.js                      # Express app factory + HTTP server bootstrap
├── Dockerfile                  # Production container definition
├── package.json
│
├── scripts/
│   └── seed/                   # Standalone seeding scripts (roles, settings, owner)
│
└── src/
    ├── __tests__/              # Jest test suites (9 suites)
    │   ├── auth/
    │   ├── booking/
    │   ├── feedback/
    │   ├── payment/
    │   ├── people/
    │   ├── service/
    │   └── vehicle/
    │
    ├── configs/
    │   ├── database.js         # pg Pool singleton
    │   ├── env.js              # Centralised environment variable exports
    │   └── swagger.js          # Swagger/OpenAPI setup
    │
    ├── controllers/            # 21 controllers (one per resource)
    ├── docs/                   # OpenAPI YAML spec files
    ├── logics/                 # Complex reusable business logic modules
    ├── middleware/             # 10 middleware modules (see Middleware Stack)
    ├── models/                 # 22 schema-definition functions + init orchestrator
    ├── modules/
    │   └── chat/
    │       └── telegram.service.js
    ├── queue/
    │   └── email.queue.js      # BullMQ queue + worker
    ├── routes/                 # 21 route modules
    ├── scripts/                # DB lifecycle scripts (reset, clean, seed)
    ├── services/               # 18 service modules (business logic + SQL)
    ├── socket/
    │   └── index.js            # Socket.io server init + auth middleware
    ├── templates/              # HTML email templates
    ├── utils/                  # Shared utilities
    └── validators/             # Joi validation schemas (8 modules)
```

---

## Database Schema

Tables are initialised in dependency order on server startup via `initModels()`. All DDL uses `CREATE TABLE IF NOT EXISTS` — safe for repeated restarts.

### Table Inventory

| Table | Description |
|---|---|
| `customer` | Customer accounts (active flag, soft-delete pattern) |
| `role` | System roles — seeded automatically on first creation |
| `employee` | Employee accounts with `emptype` (owner / employee / cashier) |
| `employee_dependent` | Employee family/emergency contact records |
| `employee_preference` | Employee scheduling preferences |
| `employee_leave` | Leave requests and approval status |
| `employee_assigned` | Booking-to-employee assignment junction |
| `vehicle_catalog` | Standardised vehicle type taxonomy |
| `vehicle` | Customer-registered vehicles (service trackers: mileage, next service date) |
| `service` | Service definitions with pricing, duration, and active status |
| `booking` | Core booking record; links customer, vehicle, and location |
| `services_booked` | Booking line items (service + price snapshot at booking time) |
| `booking_extras` | Add-ons attached to a booking |
| `schedule` | Time-slot availability grid |
| `payment` | Payment records tied to a booking |
| `feedback` | Customer ratings and comments per booking |
| `incident` | Service-related incidents with photo attachments |
| `notification` | Persistent in-app notifications per user |
| `password_reset_token` | OTP tokens for email-based password recovery |
| `sys_settings` | Key-value store for system-wide configuration |
| `system_holiday` | Non-working days that block scheduling |
| `advertisement` | Homepage banner/ad records |

### Initialisation Order

Dependencies are resolved before creation. For example, `employee` references `role`; `booking` references `customer`, `vehicle`, and `employee`; `services_booked` references both `booking` and `service`.

---

## Authentication and Authorisation

### Token Handling

The `authMiddleware` accepts a JWT from either:
- `Authorization: Bearer <token>` header
- `jwt` HTTP-only cookie

On every authenticated request the middleware:
1. Decodes and verifies the token against `JWT_SECRET`.
2. Queries the database to confirm the user record still exists (`is_active = true` for customers).
3. Attaches `req.user = { id, role, emptype? }` for downstream use.

Tokens are never stored server-side. Revocation relies on the existence check above.

### Role System

Four effective roles exist:

| Role | User Type | Scope |
|---|---|---|
| `customer` | Customer | Booking, vehicles, payments, feedback |
| `employee` | Employee | Assigned bookings, schedule, leave, incidents |
| `cashier` | Employee (`emptype = cashier`) | Payment recording |
| `owner` | Employee (`emptype = owner`) | Full administrative access |

The `restrictTo(...roles)` guard checks `req.user.emptype` for employees and `req.user.role` for customers, then matches against the allowed list for the route.

---

## API Reference

All routes are mounted under `/api`. Interactive documentation is available at `/api-docs` (Swagger UI) when the server is running.

### Route Index

| Prefix | Module | Auth | Roles |
|---|---|---|---|
| `/api/authcustomer` | Customer authentication | None (rate limited) | — |
| `/api/authemployee` | Employee authentication | None (rate limited) | — |
| `/api/advertisement` | Marketplace & Ad Requests | Varies | Public GET & POST (requests) |
| `/api/booking` | Booking lifecycle | Required | Customer, Employee, Owner |
| `/api/vehicle` | Customer vehicles & Service tracking | Required | Customer, Employee, Owner |
| `/api/vehicle-catalog` | Vehicle type catalog | Required | Owner, public read |
| `/api/service` | Service catalog | Required | Owner, public read |
| `/api/employee` | Employee management | Required | Owner |
| `/api/customer` | Customer management | Required | Customer, Owner |
| `/api/payment` | Payment recording and history | Required | Customer, Cashier, Owner |
| `/api/feedback` | Booking feedback | Required | Customer, Owner |
| `/api/leave` | Employee leave requests | Required | Employee, Owner |
| `/api/schedule` | Availability scheduling | Required | Employee, Owner |
| `/api/incident` | Incident reporting | Required | Employee, Owner |
| `/api/report` | Business analytics and reports | Required | Owner |
| `/api/notification` | In-app notifications | Required | All |
| `/api/dependent` | Employee dependents | Required | Employee, Owner |
| `/api/settings` | System settings | Required | Owner |
| `/api` (charges) | Travel charge configuration | Required | Owner |
| `/api` (holiday) | System holiday management | Required | Owner |

### Authentication Endpoints

```
POST /api/authcustomer/signup     Register new customer account
POST /api/authcustomer/signin     Authenticate customer; sets jwt cookie
POST /api/authcustomer/signout    Clear session cookie
POST /api/authcustomer/forgot-password   Request OTP via email
POST /api/authcustomer/reset-password    Verify OTP and set new password

POST /api/authemployee/signin     Authenticate employee; sets jwt cookie
POST /api/authemployee/signout    Clear session cookie
POST /api/authemployee/forgot-password
POST /api/authemployee/reset-password
```

### Advertisement Endpoints

```
GET /api/advertisement                   Get all live advertisements (Cached)
POST /api/advertisement/request          Submit an advertisement request
GET /api/advertisement/admin             Get all advertisements for review (Owner only)
POST /api/advertisement                  Create an advertisement with banner image (Owner only)
PUT /api/advertisement/:id               Update status and banner image of an advertisement
DELETE /api/advertisement/:id            Delete an advertisement
```

---

## Middleware Stack

Middleware is applied globally or per-route in the following order:

| Middleware | File | Purpose |
|---|---|---|
| CORS | `cors.middleware.js` | Dynamic origin allowlist; production uses `CORS_ORIGIN` env var |
| Helmet | `helmet.middleware.js` | Sets 15+ security response headers |
| Compression | `compression.middleware.js` | gzip response compression |
| Pino Http | `app.js` | Automated request/response JSON logging |
| Rate Limiter | `rateLimit.middleware.js` | `authLimiter` (5 req/15 min) on auth routes; `generalLimiter` (global protection) |
| Redis Cache | `cache.middleware.js` | Edge caching for public GET routes (Service/Ads/Catalog) |
| Body Parser | `bodyParser.middleware.js` | Handles malformed JSON gracefully |
| Cookie Parser | (express built-in) | Parses `jwt` cookie |
| Auth | `auth.middleware.js` | JWT decode + DB existence verification |
| Role Guard | `auth.middleware.js` | `restrictTo(...roles)` per-route |
| Validation | `validation.middleware.js` | Joi schema validation; returns structured 400 on failure |
| Upload | `upload.middleware.js` | Multer; stores files to `uploads/` with type and size validation |
| Transform | `transform.middleware.js` | Response shaping utility |
| Error Handler | `error.middleware.js` | Centralised error classification; maps known errors to HTTP codes |

---

## Background Job Processing

Email dispatch is decoupled from the request cycle using **BullMQ** backed by Redis.

```
Request Handler
    └── addEmailJob({ type, to, subject, html, data })
            └── emailQueue.add("send-email", payload)
                        │
                    Redis (queue storage)
                        │
                    BullMQ Worker
                        ├── type === "otp"  → sendOtpEmail(to, otp)
                        └── otherwise       → sendEmail({ to, subject, html })
```

- Queue name: `email-queue`
- Worker retries on failure (BullMQ default backoff)
- Worker events (`completed`, `failed`) are logged

Email jobs are created in the password reset and notification flows. The queue connection uses the same Redis instance as the Edge Cache and Telegram bot.

---

## Edge Caching

The backend implements high-performance **Edge Caching** at the Express route level using Redis RAM storage.

- **Mechanism**: `cache.middleware.js` intercepts `GET` requests, checks for a matching key (`cache:<url>`), and serves the JSON directly if present.
- **Auto-Population**: On a cache miss, the middleware intercepts `res.json` and saves the successful database response to Redis with a 1-hour TTL.
- **Invalidation**: Admin controllers (`service`, `advertisement`, `catalog`) use `clearCacheByPattern` to instantly purge relevant cache keys when data is created, updated, or deleted.

---

## Real-Time Communication

Socket.io runs on the same HTTP server as Express. All socket connections require a valid JWT passed via:
- `socket.handshake.auth.token`
- `socket.handshake.query.token`

On successful authentication:
1. The decoded user payload is attached to `socket.user`.
2. The socket automatically joins a strictly isolated, role-based private namespace room: `user-<role>-<id>`.

The server can emit targeted notifications to any connected user using `io.to("user-<role>-<id>").emit(event, data)`. This is highly utilized by the Rescheduling engine to push `INFO`, `JOB_UPDATE`, and `SUCCESS` real-time alerts strictly to respective Customers, assigned Employees, and executing Administrators without cross-contamination.

---

## External Integrations

### Nodemailer (SMTP)

Used for OTP delivery and general notifications. Configured via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. HTML email templates are stored in `src/templates/`.

### Telegram Bot (optional)

Enabled when `ENABLE_TELEGRAM_BOT=true` and `TELEGRAM_BOT_TOKEN` are set. The bot allows employees to receive job assignment notifications and update booking status directly from Telegram. State (e.g., pending responses) is stored in Redis using ioredis.

### Google Maps

The `GOOGLE_MAPS_API_KEY` is used server-side for distance and duration calculations to determine travel charges between the service centre and customer location. Results are stored on the booking record at creation time.

---

## Configuration

All configuration is loaded from environment variables via `src/configs/env.js`. dotenv is applied with a layered strategy:

1. `.env.${NODE_ENV}.local` (e.g., `.env.development.local`)
2. Root `.env` fallback (used in Docker/production)

### Required Variables

| Variable | Description |
|---|---|
| `PORT` | HTTP server port (default: 5500) |
| `NODE_ENV` | `development` / `production` / `test` |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default: 5432) |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Signing secret for JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (e.g., `1d`) |
| `COOKIE_AGE` | Cookie max-age in days |
| `SALT_ROUNDS` | bcrypt cost factor |
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP login |
| `SMTP_PASS` | SMTP password |
| `GOOGLE_MAPS_API_KEY` | For distance matrix calculation |
| `CORS_ORIGIN` | Allowed browser origin in production |

### Optional Variables

| Variable | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `ENABLE_TELEGRAM_BOT` | `true` to activate bot on startup |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (default: 900000) |
| `RATE_LIMIT_MAX_REQUESTS` | General request cap per window |
| `RATE_LIMIT_AUTH_MAX` | Auth endpoint cap (default: 5) |
| `OTP_EXPIRES_IN_MINUTES` | OTP validity window (default: 10) |
| `REDIS_PASSWORD` | Redis auth password |
| `LOG_LEVEL` | Pino log level (`info` / `debug` / `error`) |
| `ENABLE_REDIS_CACHE` | (Future toggle) |

---

## Running the Server

### Development

```bash
cd backend
npm install
cp .env.example .env.development.local
# Edit .env.development.local with your local database and Redis credentials
npm run dev
```

The database schema is initialised automatically on first start (`initModels(pool)`).

### Production

The server is containerised and optimized for high availability. In production, it runs as the `washing_machine_backend` container using **PM2 Cluster Mode** to spawn multiple worker processes. Configuration is managed via `.env.prod`.

```bash
# Build image
docker build -t backend:latest ./backend

# Run in cluster mode (standard for docker-compose.prod.yml)
# CMD ["pm2-runtime", "app.js", "-i", "max"]
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart on file change) |
| `npm start` | Start without auto-restart |
| `npm test` | Run all Jest test suites |
| `npm run test:watch` | Jest in watch mode |
| `npm run db:reset` | Drop and recreate all tables |
| `npm run db:reset:seed` | Reset + seed the owner account |
| `npm run db:seed-owner` | Seed owner account only |
| `npm run db:seed` | Full seed (roles, settings, owner) |
| `npm run db:clean` | Remove all data without dropping tables |
| `npm run docker:up` | Start local dev infrastructure (db + redis) |
| `npm run docker:down` | Stop local dev infrastructure |

---

## Database Management

Schema initialisation is code-driven. There is no migration tool or migration history file. Each model file exports a function that runs `CREATE TABLE IF NOT EXISTS` with all constraints inline. The `initModels` orchestrator calls them in topological dependency order.

To reset the schema in development:

```bash
npm run db:reset:seed
```

This drops all tables, recreates them via `initModels`, then runs the owner seed script to create a default administrative account.

### Seeding

```bash
# Full seed (recommended for first-time setup)
npm run db:seed

# Seed owner account only
npm run db:seed-owner
```

Default owner credentials (change immediately after first login):
```
Email:    owner@washingmachine.lk
Password: Owner@123
```

---

## Testing

The test suite uses **Jest** with **Supertest** for HTTP-layer integration tests. Tests run against a test database indicated by `NODE_ENV=test`. Jest's experimental VM modules flag is required for ESM compatibility.

```bash
npm test
```

### Test Suites

| Suite | File | Coverage Area |
|---|---|---|
| Customer Auth | `auth/customerAuth.test.js` | Signup, signin, token flow |
| Employee Auth | `auth/employeeAuth.test.js` | Employee signin, role validation |
| Booking | `booking/booking.test.js` | Create, update, cancel, status flow |
| Feedback | `feedback/feedback.test.js` | Submit and retrieve feedback |
| Payment | `payment/payment.test.js` | Payment recording, history |
| Profile | `people/profile.test.js` | Profile update, avatar upload |
| Service | `service/service.test.js` | Service CRUD, availability |
| Vehicle | `vehicle/vehicle.test.js` | Vehicle registration and management |
| Test route | `test.route.test.js` | Health check baseline |

Tests are run in band (`--runInBand`) to avoid parallel database contention.

---

## API Documentation

When the server is running, interactive documentation is available at:

```
http://localhost:5500/api-docs
```

The specification is defined in YAML files under `src/docs/` and served via `swagger-ui-express`. All request/response schemas, authentication requirements, and example payloads are documented there.

## Recent Maintenance

- **March 29, 2026** — Applied Prettier formatting across controllers, middleware, and routes. Every Express router now follows a consistent `// Public routes` / `// Protected routes` comment scheme, Telegram bot text moved into `src/modules/chat/telegram.prompts.js`, and all scripts were consolidated under `src/scripts` (`accounts/`, `maintenance/`, `seed/`). Dependency cleanup removed `debug` and `morgan`, while `@jest/globals` was added to unbreak Jest suites.
- **March 30, 2026** — Implemented "Next Service Due" reminder engine. Added vehicle odometer tracking and automated email/in-app service reminders triggered by booking completion. Refined the Payment management interface by consolidating "Extras" into the main ledger and renaming the final transaction step to "Complete Payment" for clarity. Relaxed payment validation to allow recording of Rs. 0.00 items when explicitly desired.
