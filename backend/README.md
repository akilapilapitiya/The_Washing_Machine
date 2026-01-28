# Backend API – The Washing Machine

## Overview

This is a robust, production-ready RESTful API built with Node.js and Express. It powers a comprehensive vehicle service booking platform with role-based access control, complete business logic for managing customers, employees, bookings, payments, incidents, leaves, and analytics.

**Key Features:**

- ✅ Secure JWT authentication with role-based access control (4 roles)
- ✅ 40+ RESTful API endpoints across 16 modules
- ✅ Complex booking management with service-employee assignment
- ✅ Integrated payment processing and tracking
- ✅ Customer feedback and service rating system
- ✅ Employee leave management with approval workflow
- ✅ Incident reporting and resolution tracking
- ✅ Email service for password reset and notifications
- ✅ Advanced analytics (Daily Income, Employee Performance)
- ✅ Vehicle catalog standardization
- ✅ Comprehensive test suite (9 test suites with Jest + Supertest)
- ✅ Interactive Swagger/OpenAPI documentation
- ✅ Centralized validation with Joi
- ✅ Typed error handling with custom error classes
- ✅ Rate limiting and security hardening

## Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js ~4.16.1
- **Database:** PostgreSQL ^8.16.3
- **Authentication:** JWT (jsonwebtoken ^9.0.3)
- **Validation:** Joi ^18.0.2
- **Testing:** Jest ^29.7.0, Supertest ^7.0.0
- **Security:** Helmet ^8.1.0, CORS ^2.8.5, bcryptjs ^3.0.3
- **Email:** Nodemailer ^7.0.12
- **Rate Limiting:** express-rate-limit ^8.2.1
- **Optimizations:** Compression (gzip) ^1.8.1
- **Documentation:** Swagger UI Express ^5.0.1, YAMLJS ^0.3.0

## Project Architecture

The backend follows a strictly layered architecture for maximum maintainability and testability:

- **Routes:** API endpoint definitions and middleware mounting
- **Controllers:** Request parsing, response formatting (API envelopes)
- **Services:** Core business logic, validation, database orchestration
- **Models:** Database schema definitions and pool interactions
- **Middleware:** Security, Authentication, Validation, Error Handling
- **Validators:** Joi schema definitions for request validation
- **Scripts:** Database maintenance, seeding, and utility scripts
- **Utils:** Shared utility functions and helpers
- **Docs:** Swagger/OpenAPI YAML specifications

## Folder Structure

```
backend/
├── app.js                      # Express application entry
├── src/
│   ├── configs/                # Configuration files (3)
│   │   ├── database.js         # PostgreSQL connection pool
│   │   ├── env.js              # Environment variables
│   │   └── swagger.js          # Swagger setup
│   ├── routes/                 # API route definitions (16 modules)
│   │   ├── customerAuth.route.js
│   │   ├── employeeAuth.route.js
│   │   ├── booking.route.js
│   │   ├── vehicle.route.js
│   │   ├── service.routes.js
│   │   ├── payment.route.js
│   │   ├── feedback.route.js
│   │   ├── customer.route.js
│   │   ├── employee.route.js
│   │   ├── employeeLeave.route.js
│   │   ├── incident.route.js
│   │   ├── report.route.js
│   │   ├── schedule.route.js
│   │   ├── vehicleCatalog.route.js
│   │   ├── notification.route.js
│   │   └── test.route.js
│   ├── controllers/            # Route handlers (16 controllers)
│   ├── services/               # Business logic layer (14 services)
│   │   ├── customerAuth.service.js
│   │   ├── employeeAuth.service.js
│   │   ├── booking.service.js
│   │   ├── vehicle.service.js
│   │   ├── service.service.js
│   │   ├── payment.service.js
│   │   ├── feedback.service.js
│   │   ├── customer.service.js
│   │   ├── employee.service.js
│   │   ├── employeeLeave.service.js
│   │   ├── email.service.js
│   │   ├── notification.service.js
│   │   ├── report.service.js
│   │   └── schedule.service.js
│   ├── models/                 # Database models (18 models)
│   │   ├── customer.model.js
│   │   ├── employee.model.js
│   │   ├── role.model.js
│   │   ├── booking.model.js
│   │   ├── vehicle.model.js
│   │   ├── service.model.js
│   │   ├── payment.model.js
│   │   ├── feedback.model.js
│   │   ├── employeeLeave.model.js
│   │   ├── incident.model.js
│   │   ├── schedule.model.js
│   │   ├── servicesBooked.model.js
│   │   ├── employeeAssigned.model.js
│   │   ├── employeePreference.model.js
│   │   ├── vehicleCatalog.model.js
│   │   ├── notification.model.js
│   │   ├── passwordResetToken.model.js
│   │   └── index.js
│   ├── middleware/             # Express middleware (8 modules)
│   │   ├── auth.middleware.js
│   │   ├── bodyParser.middleware.js
│   │   ├── compression.middleware.js
│   │   ├── cors.middleware.js
│   │   ├── error.middleware.js
│   │   ├── helmet.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── validation.middleware.js
│   ├── validators/             # Joi validation schemas (7 validators)
│   │   ├── booking.validator.js
│   │   ├── customer.validator.js
│   │   ├── employee.validator.js
│   │   ├── payment.validator.js
│   │   ├── service.validator.js
│   │   ├── vehicle.validator.js
│   │   └── index.js
│   ├── docs/                   # Swagger/OpenAPI documentation
│   │   ├── openapi.yaml        # Main specification
│   │   ├── components/         # Reusable schemas (3)
│   │   └── paths/              # API path definitions (16)
│   ├── scripts/                # Database utilities (11 scripts)
│   │   ├── dbReset.script.js
│   │   ├── dataClean.script.js
│   │   ├── addOwner.js
│   │   ├── runReset.js
│   │   ├── runClean.js
│   │   └── ...
│   ├── templates/              # Email templates (2)
│   ├── utils/                  # Utility functions (5)
│   └── __tests__/              # Test suites (9 test files)
│       ├── auth/
│       ├── booking/
│       ├── feedback/
│       ├── payment/
│       ├── people/
│       ├── service/
│       └── vehicle/
├── coverage/                   # Test coverage reports
├── jest.config.js              # Jest configuration
└── package.json                # Dependencies and scripts
```

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database (v12 or higher)
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=washing_machine
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Database Setup

Initialize the database schema and seed default owner:

```bash
# Option 1: Reset DB and create owner
npm run db:reset:seed

# Option 2: Reset DB only
npm run db:reset

# Option 3: Add owner to existing DB
npm run db:seed-owner
```

**Default Owner Credentials:**

- Email: `owner@washingmachine.com`
- Password: `Owner@123`

## Running the Application

### Development Mode

```bash
npm run dev
```

Runs with nodemon for auto-reload on file changes.

### Production Mode

```bash
npm start
```

### Access Points

- **API Base URL:** `http://localhost:5000/api`
- **Swagger Documentation:** `http://localhost:5000/api-docs`

## API Endpoints

### 🔐 Authentication (2 modules)

#### Customer Authentication

- `POST /api/authcustomer/signup` - Customer registration
- `POST /api/authcustomer/signin` - Customer login
- `POST /api/authcustomer/forgot-password` - Request password reset OTP
- `POST /api/authcustomer/verify-otp` - Verify OTP for password reset
- `POST /api/authcustomer/reset-password` - Reset password with token

#### Employee Authentication

- `POST /api/authemployee/signin` - Employee/Admin login
- `POST /api/authemployee/forgot-password` - Request password reset OTP
- `POST /api/authemployee/reset-password` - Reset password with token

### 🚗 Core Resources (7 modules)

#### Bookings (`/api/booking`)

- `GET /api/booking` - Get all bookings (with filters)
- `GET /api/booking/:id` - Get booking by ID
- `POST /api/booking` - Create new booking
- `PUT /api/booking/:id` - Update booking
- `DELETE /api/booking/:id` - Cancel booking
- `PUT /api/booking/:id/status` - Update booking status
- `GET /api/booking/customer/:customerId` - Get customer bookings
- `GET /api/booking/employee/:employeeId` - Get employee assigned bookings

#### Vehicles (`/api/vehicle`)

- `GET /api/vehicle` - Get all vehicles
- `GET /api/vehicle/:id` - Get vehicle by ID
- `POST /api/vehicle` - Add new vehicle
- `PUT /api/vehicle/:id` - Update vehicle
- `DELETE /api/vehicle/:id` - Delete vehicle
- `GET /api/vehicle/customer/:customerId` - Get customer vehicles

#### Services (`/api/service`)

- `GET /api/service` - Get all services
- `GET /api/service/:id` - Get service by ID
- `POST /api/service` - Create service (Owner only)
- `PUT /api/service/:id` - Update service (Owner only)
- `DELETE /api/service/:id` - Delete service (Owner only)
- `GET /api/service/active` - Get active services only
- `GET /api/service/:id/addons` - Get service add-ons

#### Payments (`/api/payment`)

- `GET /api/payment` - Get all payments
- `GET /api/payment/:id` - Get payment by ID
- `POST /api/payment` - Record payment
- `PUT /api/payment/:id` - Update payment
- `DELETE /api/payment/:id` - Delete payment
- `GET /api/payment/booking/:bookingId` - Get payments for booking
- `GET /api/payment/customer/:customerId` - Get customer payments

#### Feedback (`/api/feedback`)

- `GET /api/feedback` - Get all feedback (Owner only)
- `GET /api/feedback/:id` - Get feedback by ID
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/booking/:bookingId` - Get feedback for booking

#### Customers (`/api/customer`)

- `GET /api/customer` - Get all customers (Owner/Cashier)
- `GET /api/customer/:id` - Get customer by ID
- `PUT /api/customer/:id` - Update customer profile
- `DELETE /api/customer/:id` - Delete customer (Owner only)
- `PUT /api/customer/:id/avatar` - Update profile picture

#### Employees (`/api/employee`)

- `GET /api/employee` - Get all employees (Owner only)
- `GET /api/employee/:id` - Get employee by ID
- `POST /api/employee` - Create employee (Owner only)
- `PUT /api/employee/:id` - Update employee (Owner only)
- `DELETE /api/employee/:id` - Delete employee (Owner only)
- `PUT /api/employee/:id/role` - Update employee role (Owner only)
- `GET /api/employee/available` - Get available employees

### 🆕 New Features (6 modules)

#### Employee Leave (`/api/leave`)

- `GET /api/leave` - Get all leaves (Owner) or personal leaves (Employee)
- `GET /api/leave/:id` - Get leave by ID
- `POST /api/leave` - Request leave
- `PUT /api/leave/:id/approve` - Approve leave (Owner only)
- `PUT /api/leave/:id/reject` - Reject leave (Owner only)
- `DELETE /api/leave/:id` - Cancel leave request

#### Incidents (`/api/incident`)

- `GET /api/incident` - Get all incidents (Owner) or assigned (Employee)
- `GET /api/incident/:id` - Get incident by ID
- `POST /api/incident` - Report incident
- `PUT /api/incident/:id` - Update incident
- `PUT /api/incident/:id/resolve` - Resolve incident (Owner only)
- `DELETE /api/incident/:id` - Delete incident (Owner only)

#### Reports (`/api/report`)

- `GET /api/report/daily-income` - Daily income report (Owner only)
- `GET /api/report/employee-performance` - Employee performance stats (Owner only)
- `GET /api/report/booking-summary` - Booking summary statistics

#### Vehicle Catalog (`/api/vehicle-catalog`)

- `GET /api/vehicle-catalog` - Get all vehicle types
- `GET /api/vehicle-catalog/:id` - Get vehicle type by ID
- `POST /api/vehicle-catalog` - Add vehicle type (Owner only)
- `PUT /api/vehicle-catalog/:id` - Update vehicle type (Owner only)
- `DELETE /api/vehicle-catalog/:id` - Delete vehicle type (Owner only)

#### Schedule (`/api/schedule`)

- `GET /api/schedule/availability` - Check time slot availability
- `POST /api/schedule/slots` - Get available time slots for date

#### Notifications (`/api/notification`)

- `GET /api/notification` - Get user notifications
- `PUT /api/notification/:id/read` - Mark notification as read
- `DELETE /api/notification/:id` - Delete notification

### 🔧 Utility

#### Test Route (`/api/test`)

- `GET /api/test` - API health check

---

**Total Endpoints:** 40+ across 16 route modules

## Database Models (18 Models)

### People & Roles

- **customer.model.js:** Customer accounts and profiles
- **employee.model.js:** Employee accounts and details
- **role.model.js:** Role definitions (Customer, Employee, Cashier, Owner)
- **passwordResetToken.model.js:** Password reset OTP tokens

### Bookings & Scheduling

- **booking.model.js:** Main booking records
- **schedule.model.js:** Booking time slots
- **servicesBooked.model.js:** Many-to-many booking-service relationship
- **employeeAssigned.model.js:** Employee-booking assignments
- **employeePreference.model.js:** Customer employee preferences

### Services & Feedback

- **service.model.js:** Service catalog with pricing
- **feedback.model.js:** Customer feedback and ratings

### Vehicles

- **vehicle.model.js:** Customer vehicles
- **vehicleCatalog.model.js:** Vehicle type standardization

### Payments

- **payment.model.js:** Payment records

### Leaves & Incidents

- **employeeLeave.model.js:** Employee leave requests
- **incident.model.js:** Service incident reports

### Notifications

- **notification.model.js:** User notifications

### Database Relationships

```
customer 1──────* vehicle
customer 1──────* booking
customer 1──────* payment
customer 1──────* feedback
customer 1──────* notification

employee 1──────* employeeAssigned ──── booking
employee 1──────* employeeLeave
employee 1──────* incident
employee 1──────* notification
employee *──────1 role

booking 1───────* servicesBooked ──── service
booking 1───────1 schedule
booking 1───────* payment
booking 1───────* feedback
booking 1───────* incident

vehicle *───────1 vehicleCatalog
```

## Testing

### Test Framework

The project uses **Jest** with **Supertest** for comprehensive integration testing.

**Configuration:**

- Runner: Jest with ES Modules support
- HTTP Testing: Supertest
- Environment: Node
- Coverage: Enabled with coverage reports
- Run Mode: Sequential (`--runInBand`) for database consistency

### Test Suites (9 test files)

#### Authentication Tests (2 suites)

- `auth/customerAuth.test.js` - Customer signup, login, password reset
- `auth/employeeAuth.test.js` - Employee login, password reset

#### Core Resource Tests (5 suites)

- `booking/booking.test.js` - Booking CRUD, status updates, assignments
- `vehicle/vehicle.test.js` - Vehicle CRUD operations
- `service/service.test.js` - Service catalog management
- `payment/payment.test.js` - Payment recording and history
- `feedback/feedback.test.js` - Feedback submission and retrieval

#### User Management Tests (1 suite)

- `people/profile.test.js` - Profile updates, avatar upload

#### Utility Tests (1 suite)

- `test.route.test.js` - API health check

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suite
npm test -- auth/customerAuth.test.js

# Run with coverage
npm test -- --coverage
```

### Test Coverage

Coverage reports are generated in the `coverage/` directory after running tests.

### CI/CD Integration

Automated testing is configured via GitHub Actions:

- **Workflow:** `.github/workflows/backend-tests.yml`
- **Trigger:** Pull requests to `automate/testing` branch
- **Action:** Runs `npm test` before merge

## Middleware Layer (8 Middleware)

### Security & Protection

- **helmet.middleware.js:** Security headers (XSS, clickjacking, MIME sniffing protection)
- **cors.middleware.js:** Cross-Origin Resource Sharing configuration
- **rateLimit.middleware.js:** Rate limiting (auth endpoints: 5 req/15min, general: 100 req/15min)

### Authentication & Authorization

- **auth.middleware.js:** JWT token validation, role-based access control

### Request Processing

- **bodyParser.middleware.js:** Request body parsing error handling
- **compression.middleware.js:** gzip compression for responses
- **validation.middleware.js:** Joi schema validation wrapper

### Error Handling

- **error.middleware.js:** Centralized error handling with custom error classes

## Validators (7 Validators)

All validators use **Joi** for robust schema validation:

- **booking.validator.js:** Booking creation and updates
- **customer.validator.js:** Customer registration and profile updates
- **employee.validator.js:** Employee creation and management
- **payment.validator.js:** Payment recording validation
- **service.validator.js:** Service catalog operations
- **vehicle.validator.js:** Vehicle data validation
- **index.js:** Validator exports

### Validation Features

- Type checking (string, number, date, email, etc.)
- Required field enforcement
- Custom error messages
- Pattern matching (phone, license plate, etc.)
- Conditional validation
- Array validation

## Services Layer (14 Services)

Business logic modules separated from controllers:

### Authentication

- **customerAuth.service.js:** Customer authentication, password reset
- **employeeAuth.service.js:** Employee authentication, password reset

### Core Resources

- **booking.service.js:** Complex booking orchestration with employee assignment
- **vehicle.service.js:** Vehicle management with ownership validation
- **service.service.js:** Service catalog operations
- **payment.service.js:** Payment processing and tracking
- **feedback.service.js:** Feedback management

### User Management

- **customer.service.js:** Customer profile operations
- **employee.service.js:** Employee management

### New Features

- **employeeLeave.service.js:** Leave request and approval workflow
- **email.service.js:** Email sending with Nodemailer (password reset, notifications)
- **notification.service.js:** Notification creation and management
- **report.service.js:** Analytics generation (income, performance)
- **schedule.service.js:** Availability checking and slot management

## Database Management Scripts (11 Scripts)

### Core Utilities

- **dbReset.script.js:** Drop all tables and recreate schema
- **dataClean.script.js:** Truncate all tables (preserves schema)
- **runReset.js:** Execute reset script with optional owner seeding
- **runClean.js:** Execute clean script

### Seeding & Data Management

- **addOwner.js:** Create default owner account
- **addServiceType.js:** Add service types to catalog
- **addOffersToService.js:** Add service offers/add-ons
- **createIncidentTable.js:** Create incident reporting table
- **createVehicleCatalog.js:** Create vehicle catalog table

### Utilities

- **resetOwnerPassword.js:** Reset owner password utility
- **updateEmail.js:** Update user email utility

### Quick Commands

```bash
# Reset database and seed owner
npm run db:reset:seed

# Reset database only
npm run db:reset

# Clean all data
npm run db:clean

# Add owner to existing DB
npm run db:seed-owner
```

## Security Features

### Authentication & Authorization

- ✅ **JWT Tokens:** Secure token-based authentication
- ✅ **Password Hashing:** bcrypt with salt rounds
- ✅ **Role-Based Access Control:** 4 roles (Customer, Employee, Cashier, Owner)
- ✅ **Protected Routes:** Middleware-based route protection

### Request Security

- ✅ **Rate Limiting:** Prevents brute force attacks
- ✅ **CORS Protection:** Configured allowed origins
- ✅ **Helmet Security Headers:** XSS, clickjacking, MIME protection
- ✅ **Input Validation:** Joi schema validation on all inputs
- ✅ **SQL Injection Prevention:** Parameterized queries
- ✅ **Request Size Limits:** 10MB JSON limit

### Data Protection

- ✅ **Password Reset with OTP:** Time-limited OTP tokens
- ✅ **Email Verification:** Nodemailer integration
- ✅ **Secure Password Storage:** Never stored in plain text

## Swagger/OpenAPI Documentation

### Interactive API Documentation

Access comprehensive API documentation at `/api-docs` in development mode.

**Features:**

- 📚 All 40+ endpoints documented
- 🔍 Interactive testing interface
- 📝 Request/response schemas
- 🔐 Authentication examples
- ✅ Validation requirements

### Documentation Structure

```
src/docs/
├── openapi.yaml           # Main OpenAPI 3.0 specification
├── components/            # Reusable schemas
│   ├── schemas/
│   ├── responses/
│   └── parameters/
└── paths/                 # API path definitions (16 files)
    ├── customerAuth.path.yaml
    ├── employeeAuth.path.yaml
    ├── booking.path.yaml
    ├── vehicle.path.yaml
    ├── service.path.yaml
    ├── payment.path.yaml
    ├── feedback.path.yaml
    ├── customer.path.yaml
    ├── employee.path.yaml
    ├── employeeLeave.path.yaml
    ├── incident.path.yaml
    ├── report.path.yaml
    ├── schedule.path.yaml
    ├── vehicleCatalog.path.yaml
    ├── notification.path.yaml
    └── test.path.yaml
```

### Updating Documentation

When adding new endpoints:

1. Create/update YAML file in `src/docs/paths/`
2. Define request/response schemas
3. Add authentication requirements
4. Include example requests/responses

## Error Handling

### Centralized Error Handler

All errors flow through `error.middleware.js` for consistent formatting.

**Error Response Format:**

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "status": 400,
    "code": "VALIDATION_ERROR"
  }
}
```

### Error Types

- **Validation Errors:** Joi validation failures (400)
- **Authentication Errors:** Invalid/missing tokens (401)
- **Authorization Errors:** Insufficient permissions (403)
- **Not Found Errors:** Resource not found (404)
- **Database Errors:** SQL errors, constraint violations (500)
- **Server Errors:** Unexpected errors (500)

### Custom Error Classes

Located in `src/utils/`:

- `ValidationError`
- `AuthenticationError`
- `AuthorizationError`
- `NotFoundError`
- `DatabaseError`

## Recent Additions (Since v1.2.1)

### ✅ Employee Leave Management System

- Complete leave request workflow
- Admin approval/rejection interface
- Leave balance tracking
- History and reporting

### ✅ Incident Reporting & Tracking

- Employee incident reporting during service
- Photo upload capability
- Resolution workflow
- Incident history

### ✅ Email Service Integration

- Nodemailer configuration
- Password reset emails with OTP
- Email templates in `src/templates/`
- SMTP configuration

### ✅ Advanced Analytics & Reports

- **Daily Income Report:** Revenue analysis with date filtering
- **Employee Performance:** Service completion and ratings
- Stats aggregation and data visualization ready

### ✅ Vehicle Catalog Management

- Standardized vehicle type classification
- Admin CRUD interface
- Integration with booking flow

### ✅ Notification System

- User notification creation
- Read/unread status tracking
- Notification history

### ✅ Comprehensive Test Coverage

- 9 test suites with Jest + Supertest
- Integration testing across all major flows
- CI/CD pipeline integration

## Role-Based Access Control

The API implements **4 role types** with distinct permissions:

| Role         | Access Level  | Key Permissions                                                                |
| ------------ | ------------- | ------------------------------------------------------------------------------ |
| **Customer** | Standard User | Create bookings, manage vehicles, view history, submit feedback                |
| **Employee** | Service Staff | View assigned bookings, update service status, report incidents, manage leaves |
| **Cashier**  | Payment Staff | All Employee permissions + record payments, view customer data                 |
| **Owner**    | Administrator | Full system access - all CRUD operations, reports, approvals                   |

## Performance Optimizations

- ✅ **Compression:** gzip compression for all responses
- ✅ **Connection Pooling:** PostgreSQL connection pool
- ✅ **Rate Limiting:** Prevents API abuse
- ✅ **Efficient Queries:** Optimized SQL with proper indexing
- ✅ **Error Caching:** Prevents redundant error processing

## Code Style Guide

### General Principles

- Use ES6+ features (import/export, arrow functions)
- Async/await for asynchronous operations
- Descriptive variable and function names
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)

### File Naming

- Routes: `resourceName.route.js`
- Controllers: `resourceName.controller.js`
- Services: `resourceName.service.js`
- Models: `resourceName.model.js`
- Tests: `resourceName.test.js`

### Error Handling

Always use try-catch blocks and pass errors to next middleware:

```javascript
try {
  // Business logic
} catch (error) {
  next(error);
}
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Reset database
npm run db:reset

# Check environment variables
cat .env
```

### Test Failures

```bash
# Run tests with verbose output
npm test -- --verbose

# Clear Jest cache
npm test -- --clearCache

# Run specific test
npm test -- payment/payment.test.js
```

### Email Sending Issues

```bash
# Test email configuration
node test_email_debug.js

# Check SMTP credentials in .env
# Ensure "App Password" for Gmail (not regular password)
```

## Deployment

### Build for Production

No build step required - Node.js runtime.

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure `JWT_SECRET`
4. Configure SMTP for production emails
5. Set `FRONTEND_URL` to production domain

### Process Management

Recommended: PM2 for production

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start app.js --name washing-machine-api

# Monitor
pm2 monit

# Logs
pm2 logs
```

### Database Migration

```bash
# On production server
npm run db:reset:seed
```

### Security Checklist

- [ ] Change default owner password
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure logging and monitoring

## Contributing

### Before You Commit

1. Run tests: `npm test`
2. Run linter: `npm run lint` (if configured)
3. Update Swagger docs if adding endpoints
4. Update tests for new features

### Creating New Features

1. Create feature branch
2. Add route in `src/routes/`
3. Create controller in `src/controllers/`
4. Add business logic in `src/services/`
5. Create model if needed in `src/models/`
6. Add validator in `src/validators/`
7. Write tests in `src/__tests__/`
8. Update Swagger docs in `src/docs/paths/`
9. Test thoroughly before PR

## License

This project is proprietary software. All rights reserved.

## Support

For issues or questions, contact the development team.

---

**Last Updated:** January 28, 2026  
**Version:** 1.3.0  
**Status:** Production Ready with Comprehensive Testing
