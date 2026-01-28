# Backend API – The Washing Machine

## Overview

This backend is a robust RESTful API built using Node.js and Express. It powers a vehicle service booking platform with role-based access control and comprehensive management of customers, employees, bookings, payments, and services.

**Key Features:**

- Secure authentication with role-based access control (Customer/Employee)
- Vehicle management logic for registered customers
- Complex booking management (many-to-many service relationships)
- Integrated payment processing and tracking
- Customer feedback and service rating system
- Comprehensive automated test suite with Jest
- Interactive Swagger/OpenAPI documentation
- Centralized validation and typed error handling

## Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js ~4.16.1
- **Database:** PostgreSQL ^8.16.3
- **Authentication:** JWT (jsonwebtoken ^9.0.3)
- **Validation:** Joi ^18.0.2
- **Testing:** Jest ^29.7.0, Supertest ^7.0.0
- **Security:** Helmet ^8.1.0, CORS ^2.8.5, bcryptjs ^3.0.3
- **Optimizations:** Compression (gzip) ^1.8.1

## Project Architecture

The backend follows a strictly layered architecture for maximum maintainability:

- **Routes:** API endpoint definitions and middleware mounting
- **Controllers:** Request parsing and response formatting (API envelopes)
- **Services:** Core business logic, validation, and database orchestration
- **Models:** Database schema definitions and pool interactions
- **Middleware:** Security, Auth, Body Parsing, and Error Handling
- **Scripts:** Database maintenance and seeding utilities

## Folder Structure

```
src/
├── configs/          # Database & Environment config
├── controllers/      # Route handlers
├── docs/             # Swagger/OpenAPI specifications
├── middleware/       # Express middlewares (Auth, Errors, Security)
├── models/           # Database models & index
├── routes/           # API route definitions
├── services/         # Business logic layer
├── scripts/          # DB reset, clean, and seed scripts
├── utils/            # Shared utility functions
├── __tests__/        # Automated test suites
└── app.js            # Express application entry
```

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=washing_machine
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## Testing

The project uses Jest for comprehensive integration testing across all modules.

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### CI/CD Pipeline

Automated testing is configured via GitHub Actions.

- **Workflow:** `.github/workflows/backend-tests.yml`
- **Trigger:** Pull Requests to `automate/testing` branch
- **Action:** Runs `npm test` to verify all suites pass before merge.

## API Documentation (Swagger)

Interactive API documentation is available in development mode.

- **URL:** `http://localhost:5000/api-docs`
- **Spec:** Managed via `src/docs/` (YAML based components and paths)

## Database Management

Manage your PostgreSQL instance with built-in scripts:

- `npm run db:clean`: Truncates all tables (preserves schema)
- `npm run db:reset`: Drops and recreates all tables (schema reset)
- `npm run db:reset:seed`: Reset schema and create default owner account
- `npm run db:seed-owner`: Add initial owner account to existing DB

**Default Owner:** `owner@washingmachine.com` / `Owner@123`

## API Endpoints

### 🔐 Authentication

- `POST /api/authcustomer/signup`: Customer registration
- `POST /api/authcustomer/signin`: Customer login
- `POST /api/authemployee/signin`: Employee/Admin login

### 🚗 Core Modules

- **Vehicles:** `GET`, `POST`, `PUT`, `DELETE` on `/api/vehicle`
- **Bookings:** `GET`, `POST`, `PUT`, `DELETE` on `/api/booking`
- **Services:** `GET`, `POST`, `PUT`, `DELETE` on `/api/service`
- **Payments:** `GET`, `POST`, `PUT`, `DELETE` on `/api/payment`
- **Feedback:** `GET`, `POST` on `/api/feedback`

---

**Last Updated:** January 28, 2026
**Version:** 1.2.1
**Status:** Feature Complete & Tested
