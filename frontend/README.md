# Frontend — Technical Reference

## Overview

The frontend is a single-page application built with React 19 and Vite 7, serving three distinct user portals within a single bundle: a public-facing marketing site, a customer self-service dashboard, and a combined employee/owner management portal. Routing, authentication state, and API communication are managed entirely on the client.

The application connects to the backend via a centralised Axios service layer, maintains a real-time WebSocket subscription for push notifications, and renders map-based location picking backed by the Google Maps JavaScript API.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Routing](#routing)
5. [Authentication and Session Management](#authentication-and-session-management)
6. [State Management](#state-management)
7. [Service Layer](#service-layer)
8. [Feature Domains](#feature-domains)
9. [Component Library](#component-library)
10. [Performance Optimizations](#performance-optimizations)
11. [Build and Configuration](#build-and-configuration)
12. [Environment Variables](#environment-variables)
13. [Running the Application](#running-the-application)
14. [Testing](#testing)

---

## Architecture

```
Browser (HTTP/2 + Gzip)
    │
    └── React Application (Vite Splitting)
            │
            ├── AuthProvider (Context)
            │       └── localStorage token persistence
            │
            ├── NotificationProvider (Context)
            │       └── Socket.io client (authenticated)
            │
            └── React Router (Async / Lazy)
                    ├── MainLayout      → Public Pages (Lazy)
                    ├── AuthLayout      → Security Internal (Lazy)
                    └── DashboardLayout → Dashboards (Lazy)
                            ├── ProtectedRoute      (customers only)
                            └── EmployeeProtectedRoute (role-gated)

Optimized Delivery:
    Component → Vite manualChunks → Parallel Vendor Loading → Browser Cache Hit
```

All routing is client-side. The Nginx reverse proxy is configured with `try_files $uri $uri/ /index.html` to ensure direct URL access and browser refresh work correctly for all routes.

---

## Technology Stack

| Category | Technology | Version |
|---|---|---|
| Framework | React | ^19.2.0 |
| Build tool | Vite + @vitejs/plugin-react | ^7.2.4 |
| Language | JavaScript (ESM) | — |
| Routing | React Router DOM | ^7.11.0 |
| Styling | Tailwind CSS v4 | ^4.1.18 |
| UI components | Radix UI (headless primitives) | Various |
| Component utilities | class-variance-authority, clsx, tailwind-merge | — |
| Icons | Lucide React | ^0.562.0 |
| HTTP client | Axios | ^1.13.2 |
| Forms | React Hook Form | ^7.71.1 |
| Date utilities | date-fns | ^4.1.0 |
| Toast notifications | Sonner | ^2.0.7 |
| Maps | @vis.gl/react-google-maps | ^1.7.1 |
| Real-time | Socket.io client | ^4.8.3 |
| Production | Vite manualChunks | 7.x Splitting |
| Performance | React.lazy() | Route-based |
| Testing | Vitest + React Testing Library | ^4.0.18 / ^16.3.2 |
| Test DOM | jsdom | ^27.4.0 |

Tailwind CSS v4 is integrated directly as a Vite plugin (`@tailwindcss/vite`), not via the PostCSS transform used in prior versions.

---

## Project Structure

```
frontend/
├── Dockerfile                   # Multi-stage build: Node build → Nginx serve
├── nginx.http.conf              # Nginx config used before SSL cert exists
├── nginx.https.conf             # Nginx config with SSL + /api proxy
├── docker-entrypoint.sh         # Auto-selects nginx config at container start
├── vite.config.js               # Vite config: @ alias, Tailwind plugin, Vitest
├── package.json
│
└── src/
    ├── main.jsx                 # React DOM root mount + BrowserRouter
    ├── App.jsx                  # Route tree definition (all 35+ routes)
    ├── setupTests.js            # Vitest global test setup
    │
    ├── assets/                  # Static images (partner logos, brand assets)
    ├── styles/                  # Global CSS (Tailwind base)
    │
    ├── configs/
    │   └── env.js               # VITE_ env var exports + derived constants
    │
    ├── contexts/
    │   ├── AuthContext.jsx      # Auth state, login/logout, role derivation
    │   ├── NotificationContext.jsx  # Socket.io connection + notification state
    │   └── PageHeaderContext.jsx    # Dynamic page title/subtitle per route
    │
    ├── hooks/
    │   └── useAxios.js          # Axios instance with auth header injection
    │
    ├── lib/
    │   └── utils.js             # cn() utility (clsx + tailwind-merge)
    │
    ├── services/                # API service modules (18 files)
    ├── utils/                   # Shared utility functions
    │
    ├── components/
    │   ├── layout/
    │   │   ├── MainLayout.jsx       # Public layout with Navbar
    │   │   ├── AuthLayout.jsx       # Clean auth page wrapper
    │   │   └── DashboardLayout.jsx  # Sidebar + header for authenticated users
    │   ├── common/              # Shared components (LocationPicker, etc.)
    │   ├── ui/                  # Radix-based primitive components
    │   ├── ProtectedRoute.jsx       # Customer auth guard
    │   └── EmployeeProtectedRoute.jsx # Employee role guard (allowedRoles[])
    │
    ├── pages/                   # Top-level page components (14 files)
    │
    └── features/                # Feature-domain components (8 domains)
        ├── admin/               # 12 admin management pages (owner only)
        ├── auth/                # Auth flow components
        ├── booking/             # 5-step booking wizard components
        ├── dashboard/           # Customer dashboard views
        ├── employee/            # Employee portal views
        ├── home/                # Landing page sections
        ├── services/            # Public service catalog
        └── vehicles/            # Vehicle management components
```

---

## Routing

All routes are defined in `App.jsx` and organised into three layout zones:

### Public — `MainLayout` (Navbar visible)

| Path | Component | Access |
|---|---|---|
| `/` | Home | Public |
| `/services` | Services | Public |
| `/marketplace` | Marketplace | Public |
| `/*` | NotFound | Public |

### Authentication — `AuthLayout` (no Navbar)

| Path | Component |
|---|---|
| `/signup` | Signup |
| `/login` | CustomerLogin |
| `/employee-login` | EmployeeLogin |
| `/forgot-password` | ForgotPassword |
| `/banned` | BannedPage |

### Dashboard — `DashboardLayout` (sidebar navigation)

#### Customer Routes (ProtectedRoute)

| Path | Component |
|---|---|
| `/dashboard` | Dashboard |
| `/dashboard/book` | Booking (vehicle selection) |
| `/dashboard/booking/services` | ServiceSelectionPage (main package selection) |
| `/dashboard/booking/addons` | AddonsSelectionPage (optional add-ons) |
| `/dashboard/booking/location` | LocationSelectionPage |
| `/dashboard/booking/employee` | EmployeeSelectionPage |
| `/dashboard/booking/datetime` | DateTimeSelectionPage |
| `/dashboard/booking/confirmation` | BookingConfirmationPage |
| `/dashboard/bookings` | ScheduledBookingsPage |
| `/dashboard/history` | ServiceHistoryPage |
| `/dashboard/payments` | PaymentHistoryPage |
| `/dashboard/feedback` | Feedback |
| `/dashboard/profile` | ProfilePage |
| `/dashboard/change-password` | ChangePasswordPage |
| `/dashboard/vehicles` | Vehicles |
| `/dashboard/notifications` | NotificationsPage |

#### Employee Routes (EmployeeProtectedRoute)

| Path | Component | Roles |
|---|---|---|
| `/dashboard/employee/assigned` | AllBookingsPage | owner, employee, cashier |
| `/dashboard/employee/service/:id` | ServiceDetailsPage | owner, employee, cashier |
| `/dashboard/employee/incidents` | EmployeeIncidentPage | employee, cashier |
| `/dashboard/employee/payments` | PaymentManagementPage | owner, cashier |
| `/dashboard/employee/leaves` | MyLeavesPage | owner, employee, cashier |

#### Admin Routes (EmployeeProtectedRoute — owner only unless noted)

| Path | Component | Roles |
|---|---|---|
| `/dashboard/admin/employees` | EmployeeManagementPage | owner |
| `/dashboard/admin/attendance` | LeaveManagementPage | owner |
| `/dashboard/admin/services` | ManageServicesPage | owner |
| `/dashboard/admin/holidays` | SystemHolidaysPage | owner |
| `/dashboard/admin/customers` | ManageCustomersPage | owner, cashier |
| `/dashboard/admin/feedback` | ViewFeedbackPage | owner |
| `/dashboard/admin/vehicle-catalog` | ManageVehicleCatalogPage | owner |
| `/dashboard/admin/incidents` | ManageIncidentsPage | owner |
| `/dashboard/admin/advertisements` | ManageAdvertisementsPage | owner |
| `/dashboard/admin/bookings` | BookingReviewPage | owner, cashier |
| `/dashboard/admin/reports/daily-income` | DailyIncomeReportPage | owner |
| `/dashboard/admin/reports/employee-performance` | EmployeePerformanceReportPage | owner |
| `/dashboard/admin/settings/pricing` | OwnerPricingPage | owner |

---

## Authentication and Session Management

Session state is managed in `AuthContext`. Tokens and user data are persisted to `localStorage` and restored on mount.

### Initialization Flow

```
App mount
    └── AuthContext.useEffect
            ├── Read token + user from localStorage
            ├── userType === "customer"
            │       └── Restore from localStorage directly
            └── userType === "employee"
                    └── getEmployeeMe() → fetch live record from DB
                            ├── Success → update localStorage + state (ensures role changes take effect)
                            └── Failure → fall back to stored data (token still valid)
```

Employee sessions always verify against the database on page load. This ensures that role changes made by the owner take effect at the employee's next refresh, without requiring a forced logout.

### Derived Role Flags

`AuthContext` exposes computed boolean flags consumed throughout the component tree:

| Flag | Condition |
|---|---|
| `isCustomer` | `userType === "customer"` |
| `isEmployee` | `userType === "employee"` |
| `isAdmin` | `isAdmin` flag from employee record |
| `isOwner` | `isEmployee && (emptype === "owner" \|\| isAdmin)` |
| `isCashier` | `isEmployee && emptype === "cashier \|\| owner \|\| isAdmin"` |
| `isStaff` | `isEmployee` |

### Route Guards

**`ProtectedRoute`** — redirects unauthenticated users to `/login`.

**`EmployeeProtectedRoute`** — accepts an `allowedRoles` prop (e.g., `["owner", "cashier"]`) and redirects to the appropriate login if the user's `emptype` is not in the list.

---

## State Management

No external state management library is used. State is managed through:

| Mechanism | Used For |
|---|---|
| `AuthContext` | User identity, authentication status, role flags |
| `NotificationContext` | Socket.io connection lifecycle, unread notification count |
| `PageHeaderContext` | Dynamic page title and subtitle for the dashboard header |
| Component `useState` | Local UI state (form values, modal open/close, loading flags) |
| React Hook Form | Form state, validation, and submission per form |

---

## Service Layer

All backend communication is centralised in `src/services/`. Each module exports async functions that wrap Axios calls. Components import service functions directly; there is no shared store or action/reducer pattern.

The base URL is set from `VITE_API_BASE_URL` at build time. In production this is a relative path (`/api`) so Nginx routes it to the backend container.

| Service Module | Responsibility |
|---|---|
| `auth.service.js` | Signup, signin, signout, forgot/reset password for both user types |
| `booking.service.js` | Create booking, fetch by customer, cancel, status updates |
| `vehicle.service.js` | CRUD for customer-registered vehicles |
| `vehicleCatalog.service.js` | Fetch vehicle type taxonomy |
| `service.service.js` | Fetch service catalog, manage services (admin) |
| `employee.service.js` | CRUD for employee accounts (admin) |
| `customer.service.js` | Customer profile, avatar upload, admin customer management |
| `payment.service.js` | Payment history, record payment (cashier) |
| `feedback.service.js` | Submit rating/review, fetch feedback (admin) |
| `scheduler.service.js` | Fetch available time slots |
| `report.service.js` | Daily income report, employee performance report |
| `incident.service.js` | File incident, fetch incidents |
| `notification.service.js` | Fetch notifications, mark as read |
| `advertisement.service.js` | Fetch and manage homepage ads |
| `charges.service.js` | Fetch and update travel charge configuration |
| `settings.service.js` | Read and write system-level settings |
| `systemHoliday.service.js` | Manage non-working days |
| `dependent.service.js` | Employee dependent/emergency contact management |

---

## Feature Domains

### Booking (6-Step Wizard)

A sequential wizard spread across six routes under `/dashboard/booking/*`. Each step stores partial booking state in component state passed forward via navigation state or fetched from the booking record.

```
/dashboard/book             → Vehicle selection
    └── /booking/services   → Service package selection (radio: select 1)
        └── /booking/addons → Optional add-ons selection (checkbox: select many)
            └── /booking/location → Map-based location picker (Google Maps + distance validation)
                └── /booking/employee → Preferred employee selection
                    └── /booking/datetime → Date and time slot selection
                        └── /booking/confirmation → Review + submit
```

### Admin (12 pages, owner-only unless noted)

Full CRUD management interfaces for: employees, services, vehicle catalog, customers (owner + cashier), bookings overview (owner + cashier), leave approvals, incidents, advertisements, system holidays, and two analytics reports (daily income, employee performance).

### Employee Portal

Service queue view showing assigned bookings with status update controls. Detailed service view per booking with customer, vehicle, and location details. Payment recording (cashier role). Leave request management. Incident filing.

### Customer Dashboard

Booking initiation, active booking tracking, service history, payment history, feedback submission, vehicle management, profile editing with avatar upload, and in-app notifications.

### Home (Landing Page)

Marketing sections rendered as isolated components: hero, services overview, partner logos, and call-to-action blocks. Highlights include the **Advertisement Marketplace**, a public directory where community partners can be promoted or submit their own "Post Your Ad" requests.

---

## Component Library

Base UI components live in `src/components/ui/` and are built on Radix UI headless primitives. The `cn()` utility (clsx + tailwind-merge) is used for conditional class composition throughout.

Radix primitives in use:

- `AlertDialog` — confirmation dialogs
- `Label` — accessible form labels
- `ScrollArea` — custom scrollable containers
- `Separator` — horizontal/vertical dividers
- `Slot` — polymorphic component pattern (used by Button)
- `Tabs` — tabbed navigation panels

Common components (`src/components/common/`) include:

- `LocationPicker` — Google Maps picker with driving distance validation via Routes API, Haversine fallback
- `ScrollToTop` — resets scroll position on route change
- Layout components (`MainLayout`, `AuthLayout`, `DashboardLayout`)

---

## Performance Optimizations

The application is engineered for "A" grade performance on Lighthouse and slow mobile networks.

- **Route-Based Lazy Loading**: All 30+ pages are wrapped in `React.lazy()` and `<Suspense>`. Users only download the JavaScript for the specific page they are viewing.
- **Vite Manual Chunking**: Shared libraries are split into dedicated vendor files (`vendor-react`, `vendor-ui`, `vendor-maps`). This allows the browser to cache 90% of the application code long-term.
- **Image Off-screen Deferral**: Every secondary image uses native `loading="lazy"` to prevent bandwidth contention during initial page load.
- **HTTP/2 Parallelism**: Optimized to work with Nginx's HTTP/2 multiplexing for concurrent asset delivery.

---

## Build and Configuration

### Vite Configuration

```
Plugins:  @tailwindcss/vite, @vitejs/plugin-react
Alias:    @ → ./src  (e.g., @/services/auth.service.js)
Dev port: 5173
Test env: jsdom (via Vitest)
```

### Production Build

The Dockerfile uses a two-stage build:

1. **Build stage** — Node 20 Alpine installs dependencies, receives `VITE_API_BASE_URL` and `VITE_GOOGLE_MAPS_API_KEY` as build arguments, runs `vite build`. Environment values are baked into the bundle at this point.
2. **Serve stage** — Nginx Alpine copies the `dist/` output and both nginx configs. The custom `docker-entrypoint.sh` selects the HTTP or HTTPS config at container start based on whether the Let's Encrypt certificate exists at `/etc/letsencrypt/live/washingmachine.truegate.live/fullchain.pem`.

---

## Environment Variables

Variables must be prefixed with `VITE_` to be exposed by Vite to client-side code. They are read via `import.meta.env` and centralised in `src/configs/env.js`.

| Variable | Description | Required |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL (e.g., `/api` or `https://domain.com/api`) | Yes |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key | Yes (for maps/booking) |
| `VITE_MAX_BOOKING_RADIUS_KM` | Maximum service radius in km (default: 30) | No |

In production, `VITE_API_BASE_URL` is set to `/api` (relative). Nginx on the frontend container proxies all `/api/*` requests to the backend container over the internal Docker network — no cross-origin requests are made.

`IMAGE_BASE_URL` is derived automatically by stripping `/api` from `API_BASE_URL` and is used to construct full URLs for user-uploaded assets served from the backend's `/uploads` endpoint.

---

## Running the Application

### Development

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:5500/api in .env
# Set VITE_GOOGLE_MAPS_API_KEY=your_key in .env
npm run dev
```

The Vite dev server starts at `http://localhost:5173`. The backend must be running separately for API calls to succeed.

### Production

The production image is built and deployed automatically by the GitLab CI/CD pipeline. To build manually:

```bash
docker build \
  --build-arg VITE_API_BASE_URL=/api \
  --build-arg VITE_GOOGLE_MAPS_API_KEY=your_key \
  -t frontend:latest .
```

The resulting image is served by Nginx. Routing, SSL, and API proxying are handled by the Nginx configuration selected at container startup.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production bundle to `dist/` |
| `npm run preview` | Serve the production bundle locally |
| `npm run lint` | Run ESLint across the codebase |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once (CI mode) |

---

## Testing

Tests run with **Vitest** using **React Testing Library** in a jsdom environment. The setup file (`src/setupTests.js`) applies `@testing-library/jest-dom` matchers globally.

```bash
npm run test:run
```

Test files reside alongside the features they test or in a dedicated `__tests__` directory within the feature domain. The Vitest configuration is embedded in `vite.config.js` under the `test` key, keeping a single source of truth for build and test tooling.
