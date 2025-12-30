# The Washing Machine - Vehicle Service Booking Platform

A comprehensive full-stack web application for managing vehicle service bookings, customer relationships, employee assignments, and payment processing. The platform provides separate interfaces for customers, employees, managers, and administrators with role-based access control and real-time availability management.

## Project Overview

The Washing Machine is designed to streamline vehicle service operations with an intuitive user experience for customers booking services and powerful management tools for business operations. The system handles complex workflows including multi-service bookings, employee availability management, payment tracking, and comprehensive service history.

## Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT with HTTP-only cookies
- **Password Security:** bcryptjs
- **Validation:** Joi
- **Documentation:** Swagger/OpenAPI
- **Additional:** Helmet (security), CORS, rate limiting, gzip compression

### Frontend
- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Routing:** React Router DOM 7.11.0
- **Styling:** Tailwind CSS 4.1.18
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React 0.562.0

## Project Structure

```
The_Washing_Machine/
├── backend/                    # Node.js + Express API server
│   ├── src/
│   │   ├── configs/           # Database and environment configuration
│   │   ├── controllers/       # Request handlers (9 modules)
│   │   ├── middleware/        # Auth, CORS, error handling, rate limiting
│   │   ├── models/            # Database schema definitions (13 tables)
│   │   ├── routes/            # API endpoint definitions
│   │   ├── services/          # Business logic layer
│   │   ├── scripts/           # Database utilities
│   │   └── utils/             # Shared utilities and token generation
│   ├── app.js                 # Express application setup
│   ├── package.json
│   └── README.md              # Backend documentation
│
└── frontend/                   # React + Vite application
    ├── src/
    │   ├── components/        # UI components (shadcn/ui, Navbar, Layout)
    │   ├── features/          # Feature modules (auth, booking, dashboard, etc.)
    │   ├── pages/             # Route wrapper components
    │   ├── configs/           # Environment configuration
    │   ├── styles/            # Global styles
    │   └── App.jsx            # Main application with routing
    ├── package.json
    └── README.md              # Frontend documentation
```

## Key Features

### Authentication & Authorization
- Separate authentication flows for customers and employees
- Four-tier role-based access control (Customer, Employee, Manager, Owner)
- JWT token authentication with HTTP-only cookie storage
- Password hashing with bcryptjs (salt rounds: 12)
- Secure password recovery mechanism

### Customer Portal
- User registration and login
- Vehicle management (add, edit, delete, track mileage)
- 6-step booking workflow with real-time validation
  - Step 1: Vehicle selection
  - Step 2: Multiple service selection
  - Step 3: Location selection (branch or home visit)
  - Step 4: Employee preference (specific or any available)
  - Step 5: Date and time slot selection
  - Step 6: Booking confirmation and review
- Service history and booking management
- Payment history tracking
- Service feedback submission
- Profile management and password change

### Employee Portal
- Employee login and role-based dashboards
- Assigned service queue with status management (Scheduled, In-Progress, Completed)
- Service details with customer and vehicle information
- Mileage tracking and updates
- Payment recording interface
- Role-specific features for managers and owners

### Management Features
- Employee management (add, promote, delete, role hierarchy)
- Service catalog management (create, update, delete services with pricing)
- Customer database access and management
- Payment management and recording
- Comprehensive audit trails and service history

### System Features
- Real-time booking availability checking
- Automatic role hierarchy enforcement
- Centralized error handling with typed errors
- Request validation (Joi)
- Rate limiting (100 req/15min general, 5 req/15min auth)
- Response compression (gzip)
- SQL injection prevention (parameterized queries)
- CORS support with configurable origins

## Installation & Setup

### Prerequisites
- Node.js v16 or higher
- PostgreSQL database
- npm or yarn

### Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd The_Washing_Machine

# Backend setup
cd backend
npm install
cp .env.example .env.development.local

# Frontend setup
cd ../frontend
npm install
cp .env.example .env.development.local
```

### Environment Configuration

#### Backend (.env.development.local)
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=washing_machine
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
SALT_ROUNDS=12
COOKIE_AGE=7
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX=5
```

#### Frontend (.env.development.local)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=The Washing Machine
```

### Database Setup

```bash
cd backend

# Create database and schema
npm run db:init

# Seed initial owner account
npm run db:seed-owner
```

Default owner credentials:
- Email: `owner@washingmachine.com`
- Password: `Owner@123`

Security note: Change credentials immediately in production.

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
API available at: `http://localhost:5000`  
Swagger docs: `http://localhost:5000/api-docs`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Application available at: `http://localhost:5173`

### Production Build

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## API Documentation

Complete API documentation is available via Swagger UI at `http://localhost:5000/api-docs` in development mode.

### API Endpoints Overview

- **Authentication:** `/api/authcustomer`, `/api/authemployee`
- **Customers:** `/api/customer`
- **Employees:** `/api/employee`
- **Vehicles:** `/api/vehicle`
- **Bookings:** `/api/booking`
- **Services:** `/api/service`
- **Payments:** `/api/payment`

For detailed endpoint specifications, refer to [Backend README](backend/README.md#api-endpoints).

## Frontend Routes

### Public Routes
```
/                      Landing page
/services              Service catalog
/login                 Customer login
/employee/login        Employee login
/signup                Customer registration
/forgot-password       Password recovery
```

### Protected Routes (Customer)
```
/dashboard                      Dashboard
/dashboard/book                 New booking
/dashboard/bookings             Booking management
/dashboard/vehicles             Vehicle management
/dashboard/history              Service history
/dashboard/payments             Payment history
/dashboard/feedback             Feedback submission
/dashboard/profile              Profile settings
/dashboard/change-password      Password change
```

### Protected Routes (Employee)
```
/dashboard                           Employee dashboard
/dashboard/employee/assigned         Service queue
/dashboard/employee/service/:id      Service details
/dashboard/employee/payments         Payment management
/dashboard/admin/employees           Employee management
/dashboard/admin/services            Service catalog
/dashboard/admin/customers           Customer database
/dashboard/profile                   Profile settings
/dashboard/change-password           Password change
```

## Architecture Patterns

### Backend Architecture
- **Layered Architecture:** Routes → Controllers → Services → Models
- **Separation of Concerns:** Business logic isolated from HTTP handling
- **Centralized Error Handling:** Typed errors (AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError)
- **Database Transactions:** Used for multi-table operations
- **Parameterized Queries:** All database operations use prepared statements

### Frontend Architecture
- **Feature-Based Structure:** Features grouped by domain (auth, booking, dashboard, etc.)
- **Component Composition:** Reusable UI components from shadcn/ui
- **State Management:** Local state with React hooks, ready for Context API integration
- **Responsive Design:** Mobile-first approach with Tailwind CSS breakpoints
- **Type Safety:** TypeScript support throughout

## Development Guidelines

### Code Style
- Functional components with React hooks
- Descriptive variable and function names
- Maximum component size: 300 lines (split if larger)
- Arrow functions for component definitions

### File Naming Conventions
- Components: `PascalCase.jsx`
- Utilities: `camelCase.js`
- Styles: `kebab-case.css`
- Types: `PascalCase.tsx`

### Testing
Frontend testing setup recommended:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## Security Features

- Password hashing with bcryptjs (salt rounds: 12)
- JWT authentication with HTTP-only cookies
- Role-based access control (RBAC) with 4-tier hierarchy
- Rate limiting on authentication endpoints (5 attempts/15min)
- CORS configuration for cross-origin requests
- Security headers via Helmet.js
- SQL injection prevention with parameterized queries
- Request validation with Joi
- Centralized error handling (no sensitive data exposure)

## Performance Considerations

### Backend
- Connection pooling for database efficiency
- Response compression (gzip)
- Rate limiting to prevent abuse
- Efficient query design with proper indexing

### Frontend
- Vite for fast HMR and optimized builds
- Code splitting via React Router
- Tailwind CSS purging for minimal bundle size
- Responsive images optimization
- Expected bundle size: ~200KB gzipped

## Deployment

### Backend Deployment
- Production environment: `NODE_ENV=production`
- Disable Swagger UI in production
- Secure JWT secret in environment variables
- Database backups recommended
- Use environment-specific connection strings

### Frontend Deployment
Suitable for static hosting providers:
```bash
npm run build
# Deploy contents of dist/ folder
```

Recommended platforms: Vercel, Netlify, AWS S3 + CloudFront

## Database Schema

The system uses 13 tables:
- Users: Customer, Employee, EmployeeAssigned
- Services: Service, ServicesBooked
- Operations: Booking, Payment, Schedule
- Management: Vehicle, Feedback, EmployeeLeave, EmployeePreference

For detailed schema information, refer to model definitions in `backend/src/models/`.

## Troubleshooting

### Backend
- Check PostgreSQL connection string in .env
- Verify JWT_SECRET is set
- Check database exists and migrations applied
- Review server logs for detailed error messages

### Frontend
- Clear node_modules and reinstall if module errors occur
- Check VITE_API_BASE_URL points to correct backend
- Clear browser cache if styles appear incorrect
- Check console for authentication errors

## Status & Roadmap

### Current Status
- Backend API: Production ready with comprehensive testing
- Frontend UI: Production ready, awaiting API integration
- Integration: Ready for implementation

### Next Phase
- Authentication context integration
- API service layer implementation
- Mock data replacement with live API calls
- End-to-end testing across full stack
- Performance optimization and monitoring

## Contributing

1. Follow code style guidelines (see Development Guidelines section)
2. Create feature branches from development branch
3. Write tests for new functionality
4. Ensure all tests pass before submitting PR
5. Update relevant documentation

## Documentation

- [Backend Documentation](backend/README.md) - API endpoints, architecture, security details
- [Frontend Documentation](frontend/README.md) - Component structure, features, setup instructions

## License

Proprietary software. All rights reserved.

## Contact

For technical issues or questions, contact the development team.

---

**Project Version:** 1.0.0  
**Last Updated:** December 30, 2025  
**Status:** Development