# The Washing Machine – Vehicle Service Booking Platform

A premium, full-stack vehicle service management platform built with modern web technologies. The Washing Machine delivers a seamless booking experience for customers and a comprehensive management suite for business operations, featuring robust security, real-time scheduling, and advanced analytics.

## 🎯 Project Overview

The Washing Machine is a complete enterprise solution for modern vehicle service businesses (car wash, detailing, maintenance). It features dual high-performance portals for customers and employees, handling complex scheduling, service catalogs, fleet management, payment processing, incident tracking, employee leave management, and business analytics—all with a unified, professional "Hot Red" design aesthetic.

**Built for scalability, security, and superior user experience.**

## ✨ Key Features

### Customer Experience

- ✅ **6-Step Booking Flow:** Intuitive vehicle → service → location → employee → time → confirmation flow
- ✅ **Fleet Management:** Comprehensive vehicle registration and lifecycle tracking
- ✅ **Real-Time Scheduling:** Live availability checking with conflict prevention
- ✅ **Payment History:** Complete transaction records and receipts
- ✅ **Service Feedback:** Rating and review system for quality assurance
- ✅ **Profile Management:** Avatar upload, personal information editing, password management

### Employee Portal

- ✅ **Service Queue Dashboard:** Manage assigned bookings from scheduled to completed
- ✅ **Status Updates:** Real-time service progress tracking
- ✅ **Payment Recording:** Cashier interface for payment processing
- ✅ **Leave Management:** Request time off with approval workflow
- ✅ **Incident Reporting:** Document and track service-related incidents with photo upload

### Business Administration

- ✅ **Employee Management:** Full CRUD operations, role assignment (Owner, Employee, Cashier)
- ✅ **Service Catalog:** Pricing management, add-ons, active/inactive status
- ✅ **Customer Database:** View and manage customer information
- ✅ **Leave Approvals:** Review and approve/reject employee leave requests
- ✅ **Incident Resolution:** Track and resolve reported incidents
- ✅ **Vehicle Catalog:** Standardized vehicle type classification
- ✅ **Advanced Analytics:**
  - Daily Income Reports with date filtering
  - Employee Performance metrics
  - Booking statistics and trends

### Technical Features

- ✅ **Role-Based Access Control:** 4 distinct roles (Customer, Employee, Cashier, Owner)
- ✅ **JWT Authentication:** Secure token-based auth with password reset via email OTP
- ✅ **Email Notifications:** Nodemailer integration for password recovery
- ✅ **Comprehensive Testing:** 9 backend + 14 frontend test suites
- ✅ **API Documentation:** Interactive Swagger/OpenAPI documentation
- ✅ **Security Hardening:** Rate limiting, Helmet.js, CORS, input validation

## 🛠️ Technology Stack

### Backend (Node.js + Express)

| Category                | Technologies                                          |
| ----------------------- | ----------------------------------------------------- |
| **Runtime & Framework** | Node.js 18+, Express.js ~4.16.1                       |
| **Database**            | PostgreSQL ^8.16.3 with connection pooling            |
| **Authentication**      | JWT (jsonwebtoken ^9.0.3), bcryptjs ^3.0.3            |
| **Validation**          | Joi ^18.0.2                                           |
| **Security**            | Helmet ^8.1.0, CORS ^2.8.5, express-rate-limit ^8.2.1 |
| **Email**               | Nodemailer ^7.0.12                                    |
| **Testing**             | Jest ^29.7.0, Supertest ^7.0.0                        |
| **Documentation**       | Swagger UI Express ^5.0.1, YAMLJS ^0.3.0              |
| **Optimizations**       | Compression (gzip) ^1.8.1                             |

### Frontend (React + Vite)

| Category             | Technologies                                |
| -------------------- | ------------------------------------------- |
| **Framework**        | React 19.2.0, Vite 7.2.4                    |
| **Routing**          | React Router DOM 7.11.0                     |
| **Styling**          | Tailwind CSS 4.1.18 (OKLCH color space)     |
| **UI Components**    | shadcn/ui (Radix UI), Lucide React 0.562.0  |
| **HTTP Client**      | Axios 1.13.2                                |
| **State Management** | React Context API                           |
| **Testing**          | Vitest 4.0.18, React Testing Library 16.3.2 |
| **Build Tool**       | Vite with fast HMR                          |

## 📁 Project Architecture

### Directory Structure

```
The_Washing_Machine/
├── backend/                    # Express.js API Server
│   ├── src/
│   │   ├── configs/            # Database & environment configuration (3 files)
│   │   ├── routes/             # API route definitions (16 modules)
│   │   ├── controllers/        # Request handling & response formatting (16 controllers)
│   │   ├── services/           # Business logic layer (14 services)
│   │   ├── models/             # PostgreSQL models (18 models)
│   │   ├── middleware/         # Auth, security, validation, errors (8 middleware)
│   │   ├── validators/         # Joi schemas (7 validators)
│   │   ├── docs/               # Swagger/OpenAPI specs (16 path definitions)
│   │   ├── scripts/            # Database utilities (11 scripts)
│   │   ├── templates/          # Email templates (2 templates)
│   │   ├── utils/              # Helper functions (5 utilities)
│   │   └── __tests__/          # Jest test suites (9 test files)
│   ├── app.js                  # Express application entry
│   ├── package.json            # Backend dependencies
│   └── README.md               # Backend documentation
│
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/         # Reusable UI components & layouts
│   │   ├── features/           # Feature modules (8 modules)
│   │   │   ├── admin/          # Admin management (11 components)
│   │   │   ├── auth/           # Authentication (5 components)
│   │   │   ├── booking/        # Booking flow (7 components)
│   │   │   ├── dashboard/      # Customer dashboard (6 components)
│   │   │   ├── employee/       # Employee portal (5 components)
│   │   │   ├── home/           # Landing page (4 components)
│   │   │   ├── services/       # Service catalog (2 components)
│   │   │   └── vehicles/       # Vehicle management (1 component)
│   │   ├── services/           # API service layer (13 services)
│   │   ├── contexts/           # React contexts (AuthContext)
│   │   ├── pages/              # Route-level wrappers (13 pages)
│   │   ├── styles/             # Global design system
│   │   └── __tests__/          # Vitest test suites (14 test files)
│   ├── package.json            # Frontend dependencies
│   └── README.md               # Frontend documentation
│
├── .github/                    # GitHub Actions CI/CD
├── README.md                   # This file - Project overview
└── .gitignore                  # Git ignore rules
```

### Architecture Patterns

**Backend - Layered Architecture:**

```
Routes → Controllers → Services → Models → Database
    ↓         ↓           ↓
Middleware  Validators  Utils
```

**Frontend - Feature-Based Architecture:**

```
Pages → Features → Components → Services → API
   ↓        ↓          ↓
Contexts  Hooks     Utils
```

### Data Flow

1. **Customer Request:** Frontend sends HTTP request via Axios service modules
2. **API Gateway:** Express routes match endpoints, apply middleware (auth, validation)
3. **Business Logic:** Services layer processes request, orchestrates database operations
4. **Database:** PostgreSQL models execute queries via connection pool
5. **Response:** Controllers format and return JSON response
6. **Frontend Update:** React components update state and re-render UI

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v12 or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd The_Washing_Machine
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables: DB credentials, JWT_SECRET, SMTP settings
nano .env
```

**Backend .env Configuration:**

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=washing_machine
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secure_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

#### 3. Database Initialization

```bash
# Reset database schema and seed default owner
npm run db:reset:seed
```

**Default Owner Account:**

- Email: `owner@washingmachine.com`
- Password: `Owner@123`

> ⚠️ **Important:** Change the default owner password immediately after first login!

#### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env
nano .env
```

**Frontend .env Configuration:**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Running the Application

#### Development Mode

Open two terminal windows:

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

✅ Backend running at `http://localhost:5000`
✅ API Documentation at `http://localhost:5000/api-docs`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

✅ Frontend running at `http://localhost:5173`

#### Production Mode

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

### First Steps

1. **Access Application:** Navigate to `http://localhost:5173`
2. **Admin Login:** Use default owner credentials
3. **Change Password:** Update default password immediately
4. **Add Employees:** Create employee accounts via Admin → Employees
5. **Setup Services:** Configure service catalog via Admin → Services
6. **Add Vehicle Types:** Setup vehicle catalog via Admin → Vehicle Catalog
7. **Test Customer Flow:** Create a customer account and test booking

## 🧪 Testing

### Backend Testing (Jest + Supertest)

The backend includes **9 comprehensive test suites** covering all critical endpoints.

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suite
npm test -- auth/customerAuth.test.js
```

**Test Coverage:**

- Authentication (Customer & Employee)
- Bookings CRUD
- Vehicles Management
- Services Catalog
- Payments Recording
- Feedback System
- Profile Updates

### Frontend Testing (Vitest + React Testing Library)

The frontend includes **14 test files** covering critical user flows.

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run
```

**Test Coverage:**

- Booking flow (6 tests)
- Dashboard features (2 tests)
- Admin operations (5 tests)
- App routing (1 test)

### CI/CD Pipeline

Automated testing via GitHub Actions:

- **Location:** `.github/workflows/backend-tests.yml`
- **Trigger:** Pull requests to `automate/testing` branch
- **Action:** Runs full test suite before merge

## 📚 Documentation

### Detailed Documentation

- **[Backend README](./backend/README.md)** - Complete API documentation, endpoints, models, middleware
- **[Frontend README](./frontend/README.md)** - Component architecture, features, routing, testing

### API Documentation

Interactive Swagger/OpenAPI documentation available at:

- **Development:** `http://localhost:5000/api-docs`
- **Features:** 40+ endpoints, request/response schemas, authentication examples

### Architecture Documentation

Both backend and frontend READMEs include:

- Detailed folder structure
- Architecture patterns
- Code style guides
- Troubleshooting guides

## 🔒 Security Features

- ✅ **JWT Authentication:** Secure token-based authentication
- ✅ **Password Hashing:** bcrypt with salt rounds
- ✅ **Role-Based Access Control:** 4 distinct roles with granular permissions
- ✅ **Rate Limiting:** Prevents brute force attacks (5 req/15min on auth)
- ✅ **Security Headers:** Helmet.js protection (XSS, clickjacking, MIME sniffing)
- ✅ **CORS Protection:** Configured allowed origins
- ✅ **Input Validation:** Joi schema validation on all inputs
- ✅ **SQL Injection Prevention:** Parameterized queries
- ✅ **Password Reset:** Time-limited OTP tokens via email

## 🌐 Deployment

### Production Checklist

Backend:

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set secure `JWT_SECRET`
- [ ] Configure production SMTP
- [ ] Enable HTTPS
- [ ] Setup database backups
- [ ] Configure PM2 or similar process manager

Frontend:

- [ ] Build for production (`npm run build`)
- [ ] Set production API URL
- [ ] Deploy to static hosting (Vercel/Netlify/S3)
- [ ] Configure CDN (optional)

### Deployment Platforms

**Backend:**

- Recommended: Heroku, AWS EC2, DigitalOcean, Railway
- Database: AWS RDS, ElephantSQL, DigitalOcean Managed Databases

**Frontend:**

- Recommended: Vercel, Netlify, AWS S3 + CloudFront

### Database Migration

```bash
# On production server
cd backend
npm run db:reset:seed
```

## 🆕 Recent Additions (v1.3.0)

**Since January 2026:**

### Backend

- ✅ **Leave Management API** - Employee leave request and approval workflow
- ✅ **Incident Reporting** - Service incident tracking with resolution
- ✅ **Email Service** - Nodemailer integration for password reset
- ✅ **Reports API** - Daily income and employee performance analytics
- ✅ **Vehicle Catalog** - Standardized vehicle type management
- ✅ **Notification System** - User notification infrastructure

### Frontend

- ✅ **Leave Management UI** - Employee and admin leave interfaces
- ✅ **Incident Reporting UI** - Incident submission and review pages
- ✅ **Reports Dashboard** - Income and performance visualization
- ✅ **Vehicle Catalog UI** - Admin vehicle type management
- ✅ **Profile Enhancement** - Avatar upload and profile completion
- ✅ **Comprehensive Testing** - 14 test files with Vitest

### Infrastructure

- ✅ **Test Coverage** - 9 backend + 14 frontend test suites
- ✅ **CI/CD Pipeline** - GitHub Actions integration
- ✅ **Documentation** - Complete Swagger API docs
- ✅ **Security Hardening** - Rate limiting and validation improvements

## 👥 Role-Based Access

| Role         | Access Level  | Capabilities                                                             |
| ------------ | ------------- | ------------------------------------------------------------------------ |
| **Customer** | Standard User | Book services, manage vehicles, view history, submit feedback            |
| **Employee** | Service Staff | View assignments, update service status, report incidents, manage leaves |
| **Cashier**  | Payment Staff | Employee permissions + record payments, view customer data               |
| **Owner**    | Administrator | Full system access - all CRUD, reports, approvals, employee management   |

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Before You Commit

1. Run linters and formatters
2. Run all tests (`npm test` in both backend and frontend)
3. Update documentation if needed
4. Test your changes thoroughly

### Development Workflow

1. Create feature branch from `main`
2. Make changes following code style guides
3. Add tests for new features
4. Update Swagger docs for API changes
5. Submit pull request with clear description

### Code Style

- **Backend:** ES6+ modules, async/await, descriptive naming
- **Frontend:** Functional components, hooks, React best practices
- **Both:** ESLint configured, follow existing patterns

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For issues, questions, or feature requests:

- Contact the development team
- Check documentation in `backend/README.md` and `frontend/README.md`
- Review API docs at `/api-docs`

---

**Version:** 1.3.0  
**Last Updated:** January 28, 2026  
**Status:** Production Ready with Comprehensive Testing

**Project Statistics:**

- 16 Backend Routes (40+ endpoints)
- 18 Database Models
- 8 Frontend Feature Modules
- 40+ React Components
- 9 Backend Test Suites
- 14 Frontend Test Files
- 100% Core Features Tested
