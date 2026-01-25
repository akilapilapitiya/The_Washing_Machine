# The Washing Machine - Vehicle Service Booking Platform

A premium, full-stack vehicle service management platform. The Washing Machine provides a seamless booking experience for customers and a powerful management suite for business operations, built with modern web technologies and a focus on performance and security.

## Project Overview

The Washing Machine is an integrated solution for modern car wash and detailing businesses. It features separate high-performance portals for customers and employees, handling complex scheduling, service catalogs, fleet management, and payment processing with a unified, professional "Hot Red" aesthetic.

## Technology Stack

### Backend

- **Framework:** Node.js (v18+) & Express.js ~4.16
- **Database:** PostgreSQL ^8.16 with connection pooling
- **Security:** JWT (jsonwebtoken ^9.0), bcryptjs ^3.0, Helmet ^8.1
- **Testing:** Jest ^29.7 & Supertest ^7.0
- **Docs:** Swagger/OpenAPI 3.0

### Frontend

- **Framework:** React 19.2.0 & Vite 7.2.4
- **Routing:** React Router DOM 7.11.0
- **Styling:** Tailwind CSS 4.1.18 (OKLCH color space)
- **UI:** shadcn/ui components & Lucide React 0.562
- **Data:** Axios 1.13 & React Context API

## Project Structure

```
The_Washing_Machine/
├── backend/                # Express API (Routes -> Controllers -> Services -> Models)
│   ├── src/
│   │   ├── configs/       # DB & Env configuration
│   │   ├── controllers/   # Request orchestration
│   │   ├── middleware/    # Auth, Security, Error handlers
│   │   ├── models/        # PG-specific data models
│   │   ├── services/      # Core business logic layer
│   │   ├── __tests__/     # Jest integration test suite
│   │   └── docs/          # OpenAPI/Swagger specs
│   └── README.md          # [Backend Details]
│
└── frontend/               # React Application (Vite/Tailwind 4)
    ├── src/
    │   ├── components/    # Atomic UI & Layout modules
    │   ├── features/      # Domain-driven feature sets
    │   ├── services/      # Centralized API service layer
    │   ├── contexts/      # Auth state management
    │   └── styles/        # Global "Hot Red" design theme
    └── README.md          # [Frontend Details]
```

## Key Features

- **🔐 Dual Portal Auth:** Specialized login/signup flows for customers and staff with RBAC (Customer, Employee, Manager, Owner).
- **📋 6-Step Booking:** Intuitive selection of vehicles, services, location, staff, and time slots with real-time overlap checking.
- **🚗 Fleet Management:** Comprehensive vehicle lifecycle tracking for registered customers.
- **💳 Integrated Payments:** Recording and tracking of service transactions within the management portal.
- **💬 Feedback Loop:** Built-in customer rating and feedback system for quality assurance.
- **👔 Service Queue:** Specialized dashboard for employees to manage assigned tasks from "Scheduled" to "Completed".
- **📊 Business Admin:** Full control over the employee roster, service pricing, and customer database.

## Quick Start

### 1. Prerequisites

- Node.js v18+
- PostgreSQL instance running

### 2. Installation

```bash
# Install root dependencies (if any) and sub-projects
git clone <repository-url>
cd The_Washing_Machine

# Setup Backend
cd backend && npm install
cp .env.example .env && # Update .env with DB credentials

# Setup Frontend
cd ../frontend && npm install
cp .env.example .env
```

### 3. Database Initialization

```bash
cd backend
npm run db:reset:seed # WARNING: Drops existing tables and seeds default owner
```

**Default Owner:** `owner@washingmachine.com` / `Owner@123`

### 4. Run Development Servers

```bash
# Terminal 1: Backend
cd backend && npm run dev (API: http://localhost:5000)

# Terminal 2: Frontend
cd frontend && npm run dev (App: http://localhost:5173)
```

## Verification & Testing

### Backend Testing

The backend includes a comprehensive Jest test suite covering all major modules.

```bash
cd backend && npm test
```

### Documentation

- **API Docs:** Accessible at `http://localhost:5000/api-docs` via Swagger UI.
- **Architecture:** Layered backend and Domain-driven frontend.

---

**Version:** 1.2.0  
**Last Updated:** January 25, 2026  
**Status:** Feature Complete & Integrated
