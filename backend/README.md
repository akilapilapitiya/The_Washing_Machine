# Backend API – The Washing Machine

## Overview

This backend is a RESTful API built using Node.js and Express. It powers a vehicle service booking platform with role-based access control and comprehensive management of customers, employees, bookings, payments, and services.

**Key Features:**
- Customer and employee authentication with JWT
- Vehicle management for customers
- Booking management with multiple services per booking (many-to-many)
- Payment processing and tracking
- Employee and customer profile management
- Role-based access control (RBAC)
- JWT-based authentication with HTTP-only cookies

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **HTTP Parsing:** Body-parser, cookie-parser
- **Validation:** Joi (for request validation)

## Project Architecture

The backend follows a layered architecture for scalability, maintainability, and separation of concerns:

- **Routes:** API endpoint definitions with authentication/authorization middleware
- **Controllers:** Handle HTTP requests/responses and delegate to services
- **Services:** Business logic, validation, and database operations
- **Middleware:** Authentication, authorization, error handling, body parsing
- **Models:** Database schema definitions
- **Configs:** Environment and database pool configuration
- **Utils:** Shared utilities (JWT token generation, helpers)

## Folder Structure

```
src/
├── configs/
│   ├── database.js       # PostgreSQL pool configuration
│   └── env.js            # Environment variables
├── controllers/
│   ├── booking.controller.js
│   ├── customer.controller.js
│   ├── customerAuth.controller.js
│   ├── employee.controller.js
│   ├── employeeAuth.controller.js
│   ├── payment.controller.js
│   ├── service.controller.js
│   ├── test.controller.js
│   └── vehicle.controller.js
├── middleware/
│   ├── auth.middleware.js        # JWT verification & role-based access
│   ├── bodyParser.middleware.js  # Request body validation
│   └── error.middleware.js       # Centralized error handling
├── models/
│   ├── booking.model.js
│   ├── customer.model.js
│   ├── employee.model.js
│   ├── employeeAssigned.model.js
│   ├── employeeLeave.model.js
│   ├── employeePreference.model.js
│   ├── feedback.model.js
│   ├── payment.model.js
│   ├── schedule.model.js
│   ├── service.model.js
│   ├── servicesBooked.model.js
│   ├── vehicle.model.js
│   └── index.js
├── routes/
│   ├── booking.route.js
│   ├── customer.route.js
│   ├── customerAuth.route.js
│   ├── employee.route.js
│   ├── employeeAuth.route.js
│   ├── payment.route.js
│   ├── service.routes.js
│   ├── test.route.js
│   └── vehicle.route.js
├── services/
│   ├── booking.service.js
│   ├── customer.service.js
│   ├── customerAuth.service.js
│   ├── employee.service.js
│   ├── employeeAuth.service.js
│   ├── payment.service.js
│   ├── service.service.js
│   └── vehicle.service.js
├── scripts/
│   ├── dataClean.script.js
│   └── runClean.js
├── utils/
│   └── generateToken.util.js
└── app.js                # Express app setup & route mounting
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Create environment files for your deployment:
- `.env.development.local` (development)
- `.env.production.local` (production)

Required variables:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=washing_machine
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```

### Running the Application

**Development mode** (with nodemon auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

## API Docs (Swagger)

Interactive API documentation is available via Swagger UI in non-production environments.

- Access: http://localhost:5000/api-docs (replace `5000` with your `PORT`)
- Availability: Disabled when `NODE_ENV=production`
- Source files:
  - Base spec: [src/docs/openapi.yaml](src/docs/openapi.yaml)
  - Path specs (auto-merged): [src/docs/paths](src/docs/paths)
  - Components (schemas/responses/security): [src/docs/components](src/docs/components)
  - Loader/merger: [src/configs/swagger.js](src/configs/swagger.js)

Quick start to view docs:

```bash
npm run dev
# then open http://localhost:$PORT/api-docs (default PORT=5000)
```

Notes:
- Paths are defined as separate YAML files under `src/docs/paths` and are merged at startup.
- If your server runs on a different port than shown in the Swagger `servers` section, use your actual base URL for requests.

### Database Scripts

Clean database (removes all data, keeps schema):
```bash
npm run db:clean
```

Seed initial owner account (required for first-time setup or after cleaning database):
```bash
npm run db:seed-owner
```

**Important:** After running `db:clean`, you must run `db:seed-owner` to create an owner account. This owner can then sign in and create other employees.

**Default Owner Credentials:**
- Email: `owner@washingmachine.com`
- Password: `Owner@123`

**Security Note:** Change these credentials immediately in production environments!

## API Endpoints

All endpoints (except public service GET) require JWT authentication via `Authorization: Bearer <token>` header or `jwt` cookie.

### Authentication Routes

#### Customer Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/authcustomer/signup` | Customer registration | ❌ |
| POST | `/api/authcustomer/signin` | Customer login | ❌ |
| POST | `/api/authcustomer/signout` | Customer logout | ✅ |

#### Employee Authentication
| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/authemployee/signup` | Employee registration | ✅ | Owner |
| POST | `/api/authemployee/signin` | Employee login | ❌ | - |
| POST | `/api/authemployee/signout` | Employee logout | ✅ | Employee |

### Customer Management (Protected - Employees Only)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/customer` | Get all customers | ✅ | Employee |
| GET | `/api/customer/:cusid` | Get single customer | ✅ | Employee |
| PUT | `/api/customer/:cusid` | Update customer profile | ✅ | Employee |
| DELETE | `/api/customer/:cusid` | Delete customer | ✅ | Employee |

### Employee Management (Protected - Employees Only)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/employee` | Get all employees | ✅ | Owner |
| GET | `/api/employee/:empid` | Get single employee | ✅ | Employee |
| PUT | `/api/employee/:empid` | Update employee profile | ✅ | Employee |
| DELETE | `/api/employee/:empid` | Delete employee | ✅ | Owner |

### Vehicle Management

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/vehicle` | Get vehicles (customers see their own; managers/owners see all) | ✅ | Customer/Manager/Owner |
| GET | `/api/vehicle/:vehid` | Get vehicle by ID (customers can only see their own vehicle; employees/managers/owners can see any) | ✅ | All authenticated |
| POST | `/api/vehicle` | Create new vehicle | ✅ | Customer |
| PUT | `/api/vehicle/:vehid` | Update vehicle mileage only | ✅ | Employee |
| DELETE | `/api/vehicle/:vehid` | Delete vehicle (owner customer) | ✅ | Customer |

### Booking Management (Protected - Customers & Employees)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/booking` | Employees see all bookings; customers see their own | ✅ | Customer/Employee |
| GET | `/api/booking/:id` | Employees can view any; customers only their own booking | ✅ | Customer/Employee |
| POST | `/api/booking` | Create booking | ✅ | Customer/Employee |
| PUT | `/api/booking/:id` | Employees can update any; customers only their own booking | ✅ | Customer/Employee |
| DELETE | `/api/booking/:id` | Employees can delete any; customers only their own booking | ✅ | Customer/Employee |

### Service Management

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/service` | Get all services | ❌ | - |
| GET | `/api/service/:serviceid` | Get single service | ❌ | - |
| POST | `/api/service` | Create service | ✅ | Manager/Owner |
| PUT | `/api/service/:serviceid` | Update service | ✅ | Manager/Owner |
| DELETE | `/api/service/:serviceid` | Delete service | ✅ | Manager/Owner |

### Payment Management

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/payment` | Get all payments | ✅ | Manager/Owner |
| GET | `/api/payment/my` | Get my payments | ✅ | Customer |
| GET | `/api/payment/:paymentid` | Get single payment (customers own only; managers/owners any) | ✅ | Customer/Manager/Owner |
| POST | `/api/payment` | Create payment | ✅ | Manager/Owner |
| PUT | `/api/payment/:paymentid` | Update payment | ✅ | Manager/Owner |
| DELETE | `/api/payment/:paymentid` | Delete payment | ✅ | Manager/Owner |

## Authentication & Authorization

### Role-Based Access Control (RBAC)

The system implements a 4-tier role-based access control:

1. **Customer** - Can manage their own vehicles and bookings
2. **Employee** (normal) - Can view employee/customer data and manage bookings
3. **Manager** - Can create/update/delete services and payments, plus all employee permissions
4. **Owner** - Full system access including creating/deleting employees, plus all manager permissions

**Role Hierarchy:**
```
Owner (highest privilege)
  ↓
Manager
  ↓
Employee
  ↓
Customer (lowest privilege)
```

### Authentication Design

- Authentication routes (`/authcustomer`, `/authemployee`) handle **identity management only**
- CRUD operations on resources use **separate protected routes**
- Tokens are issued as HTTP-only cookies and via response body

### JWT Payload

**Customer Token:**
```json
{
  "id": 1,
  "role": "customer"
}
```

**Employee Token (includes emptype):**
```json
{
  "id": 1,
  "role": "employee",
  "emptype": "owner" // or "manager", "employee", etc.
}
```

### Authorization Strategy

**Middleware Stack:**
- `authMiddleware`: Verifies JWT and attaches `req.user` (id, role)
- `restrictTo(...roles)`: Checks user role against allowed roles
- Service layer: Enforces ownership/business logic checks

**Example Protected Route:**
```javascript
router.use(authMiddleware, restrictTo('employee'));
router.get('/', getAllEmployees); // Only authenticated employees
```

## Security Measures

- **Password Hashing:** bcryptjs with salt rounds
- **JWT Authentication:** Stateless token-based auth
- **HTTP-Only Cookies:** Tokens stored securely (XSS protection)
- **Role-Based Access Control (RBAC):** Granular permission enforcement
- **SQL Injection Prevention:** Parameterized queries throughout
- **Centralized Error Handling:** Consistent error response format
- **Database Validation:** Constraints, indexes, foreign keys
- **Request Validation:** Input validation at middleware and service layers

## Request/Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation completed",
  "data": { }
}
```

### Error Response
```json
{
  "status": 500,
  "message": "Something went wrong",
  "error": "Error description"
}
```

## Example Usage

### Create Payment

**Request:**
```bash
curl -X POST http://localhost:5000/api/payment \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentdate": "2026-12-25",
    "paymenttype": "cash",
    "paymentamount": 12000.00,
    "bookingid": 1
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Payment created successfully",
  "payment": {
    "paymentid": 1,
    "paymentdate": "2026-12-25",
    "paymenttype": "cash",
    "paymentamount": 12000.00,
    "bookingid": 1,
    "created_at": "2025-12-25T14:30:00Z",
    "updated_at": "2025-12-25T14:30:00Z"
  }
}
```

### Update Customer Profile

**Request:**
```bash
curl -X PUT http://localhost:5000/api/customer/1 \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "cusname": "John Updated",
    "custel": "0712345678"
  }'
```

**Response:**
```json
{
  "status": "success",
  "message": "Customer updated successfully",
  "customer": {
    "cusid": 1,
    "cusname": "John Updated",
    "cusemail": "john@example.com",
    "custel": "0712345678",
    "created_at": "2025-12-20T10:00:00Z",
    "updated_at": "2025-12-25T14:30:00Z"
  }
}
```

## Development Notes

- **Partial updates supported:** Send only the fields you want to update
- **Database transactions:** Used for multi-table operations (bookings, payments)
- **Service layer validation:** All business logic centralized
- **Dynamic query building:** Updates only modify provided fields (prevents accidental overwrites)
