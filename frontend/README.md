# Frontend – The Washing Machine

## Overview

This is a modern, responsive React-based frontend for a comprehensive vehicle service booking platform. It provides intuitive interfaces for customers to book services, manage vehicles, and track service history, while empowering employees and administrators with powerful tools to manage bookings, payments, incidents, leaves, and customer relationships.

**Key Features:**

- ✅ Modern UI with Tailwind CSS 4 and shadcn/ui components
- ✅ Fully responsive design (mobile-first approach)
- ✅ Secure JWT authentication with role-based access control
- ✅ Streamlined 6-step booking flow with real-time availability
- ✅ Comprehensive vehicle management system
- ✅ Integrated payment tracking and recording
- ✅ Customer feedback system
- ✅ Employee leave management system
- ✅ Incident reporting and tracking
- ✅ Advanced analytics and reporting (Daily Income, Employee Performance)
- ✅ Vehicle catalog management
- ✅ Complete test coverage with Vitest
- ✅ Full API integration with centralized service layer

## Tech Stack

- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Routing:** React Router DOM 7.11.0
- **State Management:** React Context API
- **HTTP Client:** Axios 1.13.2
- **Styling:** Tailwind CSS 4.1.18
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React 0.562.0
- **Testing:** Vitest 4.0.18 + React Testing Library 16.3.2
- **Animations:** tw-animate-css 1.4.0

## Project Architecture

The frontend follows a feature-based architecture with clear separation of concerns:

- **Features:** Feature-specific logic and UI components (auth, booking, dashboard, admin, employee)
- **Pages:** Route-level components that compose features
- **Services:** Centralized API client and data fetching logic (13 service modules)
- **Contexts:** Global state management (Authentication)
- **Components:** Reusable UI atoms (shadcn/ui) and layout wrappers
- **Styles:** Global theme and Design System definitions
- **Utils:** Helper functions and utilities

## Folder Structure

```
src/
├── components/
│   ├── layout/                    # Layout wrappers (Main, Dashboard)
│   ├── ui/                        # shadcn/ui base components (Button, Input, Label, etc.)
│   ├── __tests__/                 # Component tests
│   ├── EmployeeProtectedRoute.jsx # Role-based route protection
│   ├── ProtectedRoute.jsx         # Authentication protection
│   ├── Navbar.jsx                 # Main navigation
│   └── ServiceCard.jsx            # Service display component
├── features/
│   ├── admin/                     # Admin management (11 components)
│   │   ├── AllBookingsPage.jsx
│   │   ├── BookingReviewPage.jsx
│   │   ├── DailyIncomeReportPage.jsx
│   │   ├── EmployeeManagementPage.jsx
│   │   ├── EmployeePerformanceReportPage.jsx
│   │   ├── LeaveManagementPage.jsx
│   │   ├── ManageCustomersPage.jsx
│   │   ├── ManageIncidentsPage.jsx
│   │   ├── ManageServicesPage.jsx
│   │   ├── ManageVehicleCatalogPage.jsx
│   │   ├── ViewFeedbackPage.jsx
│   │   └── __tests__/             # Admin tests (5 files)
│   ├── auth/                      # Authentication (5 components)
│   │   ├── CustomerLoginPage.jsx
│   │   ├── EmployeeLoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   └── ChangePasswordPage.jsx
│   ├── booking/                   # 6-step booking flow (7 components)
│   │   ├── BookingPage.jsx
│   │   ├── ServiceSelectionPage.jsx
│   │   ├── LocationSelectionPage.jsx
│   │   ├── EmployeeSelectionPage.jsx
│   │   ├── DateTimeSelectionPage.jsx
│   │   ├── BookingConfirmationPage.jsx
│   │   ├── VehicleCard.jsx
│   │   └── __tests__/             # Booking flow tests (6 files)
│   ├── dashboard/                 # Customer dashboard (6 components)
│   │   ├── DashboardPage.jsx
│   │   ├── ScheduledBookingsPage.jsx
│   │   ├── ServiceHistoryPage.jsx
│   │   ├── PaymentHistoryPage.jsx
│   │   ├── FeedbackPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── __tests__/             # Dashboard tests (2 files)
│   ├── employee/                  # Employee portal (5 components)
│   │   ├── AssignedServicesPage.jsx
│   │   ├── ServiceDetailsPage.jsx
│   │   ├── PaymentManagementPage.jsx
│   │   ├── MyLeavesPage.jsx
│   │   └── EmployeeIncidentPage.jsx
│   ├── home/                      # Landing page (4 components)
│   │   ├── HeroSection.jsx
│   │   ├── ServicesSection.jsx
│   │   ├── PartnerSection.jsx
│   │   └── Footer.jsx
│   ├── services/                  # Service catalog (2 components)
│   └── vehicles/                  # Vehicle management (1 component)
├── pages/                         # Route-level wrappers (13 pages)
├── services/                      # API service layer (13 services)
│   ├── auth.service.js            # Authentication API
│   ├── booking.service.js         # Booking operations
│   ├── customer.service.js        # Customer operations
│   ├── employee.service.js        # Employee operations
│   ├── feedback.service.js        # Feedback management
│   ├── incident.service.js        # Incident reporting
│   ├── notification.service.js    # Notifications
│   ├── payment.service.js         # Payment processing
│   ├── report.service.js          # Analytics and reports
│   ├── scheduler.service.js       # Scheduling operations
│   ├── service.service.js         # Service catalog
│   ├── vehicle.service.js         # Vehicle management
│   └── vehicleCatalog.service.js  # Vehicle catalog
├── contexts/                      # React Contexts
│   └── AuthContext.jsx            # Authentication state
├── configs/                       # App configuration
├── lib/                           # Utility functions
├── styles/                        # Design system (index.css)
├── utils/                         # Helper utilities
├── App.jsx                        # Main router configuration
├── main.jsx                       # Application entry point
└── setupTests.js                  # Test configuration
```

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Accessible at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Output: `dist/` folder with optimized static assets

### Preview Production Build

```bash
npm run preview
```

## Testing

### Test Framework

The frontend uses **Vitest** with **React Testing Library** for comprehensive test coverage.

**Configuration:**

- Environment: jsdom
- Setup: `src/setupTests.js`
- Globals: enabled
- Mocked: localStorage, matchMedia

### Test Coverage

**14 test files** covering critical user flows:

#### Booking Flow Tests (6 files)

- `BookingPage.test.jsx` - Main booking flow entry
- `ServiceSelectionPage.test.jsx` - Service selection step
- `LocationSelectionPage.test.jsx` - Location selection step
- `EmployeeSelectionPage.test.jsx` - Employee preference step
- `DateTimeSelectionPage.test.jsx` - Date/time scheduling step
- `BookingConfirmationPage.test.jsx` - Final confirmation step

#### Dashboard Tests (2 files)

- `ScheduledBookingsPage.test.jsx` - Upcoming bookings management
- `PaymentHistoryPage.test.jsx` - Payment history display

#### Admin Tests (5 files)

- `AllBookingsPage.test.jsx` - All bookings view and filtering
- `EmployeeManagementPage.test.jsx` - Employee CRUD operations
- `LeaveManagementPage.test.jsx` - Leave management system
- `DailyIncomeReportPage.test.jsx` - Financial reporting
- `EmployeePerformanceReportPage.test.jsx` - Performance analytics

#### Component Tests (1 file)

- `App.test.jsx` - Main app routing

### Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage (if configured)
npm run test:coverage
```

### Test Files Location

All test files are colocated with their corresponding features in `__tests__/` directories:

- `src/features/booking/__tests__/`
- `src/features/dashboard/__tests__/`
- `src/features/admin/__tests__/`
- `src/components/__tests__/`

## Features Deep Dive

### Authentication System

- **Dual Portal:** Separate login flows for Customers and Employees
- **JWT-based:** Token stored in localStorage, managed via AuthContext
- **Role-Based Access:** 4 roles - Customer, Owner, Employee, Cashier
- **Protected Routes:** ProtectedRoute and EmployeeProtectedRoute components
- **Password Management:** Recovery via email, change password functionality
- **Profile Management:** Avatar upload, personal information editing

### 6-Step Booking Flow

1. **Vehicle Selection:** Select from registered vehicle fleet
2. **Service Selection:** Choose multiple services with real-time pricing and add-ons
3. **Location Selection:** Branch visit or home service
4. **Employee Preference:** Select specific experts or any available
5. **Date & Time:** Interactive calendar with slot availability
6. **Confirmation:** Review and finalize booking details

### Customer Dashboard

- **Overview:** Quick stats and upcoming appointments
- **Scheduled Bookings:** View, edit, and cancel upcoming services
- **Service History:** Past service records with details
- **Payment History:** Transaction records and receipts
- **Vehicle Management:** Add, edit, and remove vehicles
- **Feedback:** Submit service feedback and ratings
- **Profile:** Update personal information and avatar

### Employee Portal

- **Assigned Services:** View all bookings (filtered by status)
- **Service Details:** Update service status, add notes, report incidents
- **Payment Management:** Record payments (Owner/Cashier only)
- **My Leaves:** Request and track leave applications
- **Incident Reporting:** Report vehicle or service incidents

### Admin Dashboard (Owner)

#### Management

- **Employee Management:** CRUD operations, role assignment
- **Service Catalog:** Manage services, pricing, add-ons
- **Customer Database:** View and manage customer information
- **Leave Management:** Approve/reject employee leave requests
- **Vehicle Catalog:** Manage vehicle types and categories
- **Incident Management:** Review and resolve reported incidents
- **Feedback Review:** View customer feedback and ratings

#### Reports & Analytics

- **Daily Income Report:** Financial analysis with date filtering
- **Employee Performance:** Track completed services and ratings
- **Booking Review:** Overview of all system bookings

## Routing Structure

### Public Routes (7 routes)

| Path               | Component      | Description                    |
| ------------------ | -------------- | ------------------------------ |
| `/`                | Home           | Landing page with hero section |
| `/services`        | Services       | Service catalog showcase       |
| `/signup`          | Signup         | Customer registration          |
| `/login`           | CustomerLogin  | Customer authentication        |
| `/employee/login`  | EmployeeLogin  | Employee authentication        |
| `/forgot-password` | ForgotPassword | Password recovery              |
| `/*`               | NotFound       | 404 page                       |

### Protected Customer Routes (14 routes)

| Path                              | Component               | Description                 |
| --------------------------------- | ----------------------- | --------------------------- |
| `/dashboard`                      | DashboardPage           | Customer dashboard overview |
| `/dashboard/book`                 | BookingPage             | Start new booking           |
| `/dashboard/bookings`             | ScheduledBookingsPage   | Upcoming appointments       |
| `/dashboard/history`              | ServiceHistoryPage      | Past services               |
| `/dashboard/payments`             | PaymentHistoryPage      | Payment records             |
| `/dashboard/feedback`             | FeedbackPage            | Submit feedback             |
| `/dashboard/profile`              | ProfilePage             | Profile settings            |
| `/dashboard/change-password`      | ChangePasswordPage      | Change password             |
| `/dashboard/vehicles`             | VehiclesPage            | Vehicle management          |
| `/dashboard/booking/services`     | ServiceSelectionPage    | Step 1: Select services     |
| `/dashboard/booking/location`     | LocationSelectionPage   | Step 2: Choose location     |
| `/dashboard/booking/employee`     | EmployeeSelectionPage   | Step 3: Select employee     |
| `/dashboard/booking/datetime`     | DateTimeSelectionPage   | Step 4: Pick date/time      |
| `/dashboard/booking/confirmation` | BookingConfirmationPage | Step 5: Confirm booking     |

### Employee Routes (5 routes)

| Path                              | Roles             | Component             | Description               |
| --------------------------------- | ----------------- | --------------------- | ------------------------- |
| `/dashboard/employee/assigned`    | All               | AllBookingsPage       | View all bookings         |
| `/dashboard/employee/service/:id` | All               | ServiceDetailsPage    | Service details & updates |
| `/dashboard/employee/incidents`   | Employee, Cashier | EmployeeIncidentPage  | Report incidents          |
| `/dashboard/employee/payments`    | Owner, Cashier    | PaymentManagementPage | Record payments           |
| `/dashboard/employee/leaves`      | All               | MyLeavesPage          | Personal leave management |

### Admin Routes (10 routes)

| Path                                            | Roles          | Component                     | Description           |
| ----------------------------------------------- | -------------- | ----------------------------- | --------------------- |
| `/dashboard/admin/employees`                    | Owner          | EmployeeManagementPage        | Employee CRUD         |
| `/dashboard/admin/attendance`                   | Owner          | LeaveManagementPage           | Leave approvals       |
| `/dashboard/admin/services`                     | Owner          | ManageServicesPage            | Service catalog       |
| `/dashboard/admin/customers`                    | Owner, Cashier | ManageCustomersPage           | Customer database     |
| `/dashboard/admin/feedback`                     | Owner          | ViewFeedbackPage              | Customer feedback     |
| `/dashboard/admin/vehicle-catalog`              | Owner          | ManageVehicleCatalogPage      | Vehicle types         |
| `/dashboard/admin/incidents`                    | Owner          | ManageIncidentsPage           | Incident review       |
| `/dashboard/admin/reports/daily-income`         | Owner          | DailyIncomeReportPage         | Financial reports     |
| `/dashboard/admin/reports/employee-performance` | Owner          | EmployeePerformanceReportPage | Performance analytics |
| `/dashboard/admin/bookings`                     | Owner, Cashier | BookingReviewPage             | Booking overview      |

## Role-Based Access Control

The application implements **4 role types** with distinct permissions:

| Role         | Access Level  | Key Permissions                                                                |
| ------------ | ------------- | ------------------------------------------------------------------------------ |
| **Customer** | Standard User | Book services, manage vehicles, view history, submit feedback                  |
| **Employee** | Service Staff | View assigned bookings, update service status, report incidents, manage leaves |
| **Cashier**  | Payment Staff | All Employee permissions + record payments, view customers                     |
| **Owner**    | Administrator | Full system access - manage employees, services, reports, incidents, leaves    |

## Design System

### Visual Identity

The application features a premium design with a **Hot Red** theme combined with clean white/black aesthetics.

- **Primary Color:** Hot Red (`#DC2626`)
- **Typography:** Modern sans-serif (Inter/Geist via Tailwind)
- **Spacing:** Standardized Radix/Tailwind spacing system
- **Border Radius:** 0.625rem for modern rounded feel
- **Color System:** OKLCH color spaces via Tailwind 4

### UI Components

Built with **shadcn/ui** (Radix UI primitives):

- Button, Input, Label, Tabs components
- Accessible, keyboard-navigable
- Customizable via CVA (class-variance-authority)
- Consistent styling across the application

## API Services Layer

The frontend communicates with the backend via **13 specialized service modules**:

| Service                     | Purpose                                         |
| --------------------------- | ----------------------------------------------- |
| `auth.service.js`           | Authentication, login, logout, token management |
| `booking.service.js`        | Booking creation, updates, cancellation         |
| `customer.service.js`       | Customer profile operations                     |
| `employee.service.js`       | Employee operations, roster management          |
| `feedback.service.js`       | Customer feedback submission and retrieval      |
| `incident.service.js`       | Incident reporting and tracking                 |
| `notification.service.js`   | User notifications                              |
| `payment.service.js`        | Payment recording and history                   |
| `report.service.js`         | Analytics and reporting data                    |
| `scheduler.service.js`      | Availability and scheduling                     |
| `service.service.js`        | Service catalog operations                      |
| `vehicle.service.js`        | Vehicle CRUD operations                         |
| `vehicleCatalog.service.js` | Vehicle type and category management            |

All services use Axios with centralized configuration and error handling.

## Recent Additions (Since v1.1.0)

### ✅ Leave Management System

- Employee leave requests with approval workflow
- Leave balance tracking
- Admin approval/rejection interface
- Calendar integration

### ✅ Incident Reporting & Tracking

- Employee incident reporting during service
- Photo and description upload
- Admin review and resolution system
- Incident history tracking

### ✅ Reports & Analytics

- **Daily Income Report:** Revenue analysis with date range filtering
- **Employee Performance Report:** Service completion stats and ratings
- Export capabilities (planned)

### ✅ Vehicle Catalog Management

- Admin interface to manage vehicle types and categories
- Standardized vehicle classification
- Used in booking flow for vehicle selection

### ✅ Booking Review System

- Comprehensive booking overview for admins
- Multi-status filtering and search
- Quick actions for booking management

### ✅ Comprehensive Test Suite

- 14 test files covering critical flows
- Vitest with React Testing Library
- CI-ready test commands
- Mocked browser APIs (localStorage, matchMedia)

### ✅ Enhanced Profile Management

- Avatar upload and preview
- Personal information editing
- Password change functionality
- Profile completion tracking

## Code Style Guide

### General Principles

- Use functional components with hooks
- Prefer `const` over `let`
- Use arrow functions for component definitions
- Keep components under 300 lines (split if larger)
- Use descriptive variable names
- Avoid prop drilling - use Context when needed

### File Naming Conventions

- **Components:** `PascalCase.jsx`
- **Utilities:** `camelCase.js`
- **Styles:** `kebab-case.css`
- **Tests:** `ComponentName.test.jsx`

### Component Structure

```jsx
// 1. Imports
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// 2. Component definition
const ComponentName = () => {
  // 3. Hooks (state, context, navigation)
  const [state, setState] = useState();
  const navigate = useNavigate();

  // 4. Event handlers
  const handleClick = () => {};

  // 5. Side effects
  useEffect(() => {}, []);

  // 6. Render
  return <div>{/* JSX */}</div>;
};

// 7. Export
export default ComponentName;
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Performance Optimization

- ✅ Vite for fast HMR and optimized builds
- ✅ Code splitting via React Router lazy loading
- ✅ CSS purging with Tailwind (unused styles removed)
- ✅ Optimized bundle size (~200KB gzipped)
- ✅ Asset optimization (images, fonts)

## Accessibility

- ✅ Semantic HTML elements
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Focus visible styles
- ✅ Color contrast compliance (WCAG AA)
- ✅ Screen reader friendly

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
npx kill-port 5173

# Or use a different port
npm run dev -- --port 3000
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Test Failures

```bash
# Clear test cache
npm run test:run -- --clearCache

# Run specific test file
npm test -- BookingPage.test.jsx
```

## Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` folder with optimized static assets

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Deploy to Static Host

Upload contents of `dist/` folder to any static hosting service (AWS S3, GitHub Pages, etc.)

### Environment Variables

Ensure production environment has:

```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## Contributing Guidelines

### Before You Commit

1. Run linter: `npm run lint`
2. Run tests: `npm run test:run`
3. Build successfully: `npm run build`
4. Follow code style guide

### Creating New Features

1. Create feature branch
2. Add feature components to appropriate `/features` directory
3. Create corresponding test files in `__tests__`
4. Update routing in `App.jsx` if needed
5. Add API service if needed in `/services`
6. Test thoroughly before PR

## License

This project is proprietary software. All rights reserved.

## Support

For issues or questions, contact the development team.

---

**Last Updated:** January 28, 2026  
**Version:** 1.2.0  
**Status:** Production Ready with Comprehensive Testing
