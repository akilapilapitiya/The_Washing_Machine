# Frontend – The Washing Machine

## Overview

This is a modern, responsive React-based frontend for a vehicle service booking platform. It provides intuitive interfaces for customers to book services, manage vehicles, and track service history, while empowering employees with tools to manage bookings, payments, and customer relationships.

**Key Features:**

-  Modern UI with Tailwind CSS and shadcn/ui components
-  Fully responsive design (mobile-first approach)
-  Secure authentication with role-based access control (Customer/Employee)
-  Streamlined 6-step booking flow with real-time availability
-  Comprehensive vehicle management
-  Integrated payment history and recording
-  Feedback system for customer satisfaction
-  Specialized employee portal for service management
-  Full API integration with centralized service layer

## Tech Stack

- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Routing:** React Router DOM 7.11.0
- **State & Data:** Axios 1.13.2, React Context API
- **Styling:** Tailwind CSS 4.1.18
- **UI Components:** shadcn/ui (Radix UI primitives), Lucide React 0.562.0
- **Animations:** tw-animate-css 1.4.0

## Project Architecture

The frontend follows a feature-based architecture with clear separation of concerns:

- **Features:** Feature-specific logic and UI components (auth, booking, dashboard, etc.)
- **Pages:** Route-level components that compose features
- **Services:** Centralized API client and data fetching logic
- **Contexts:** Global state management (Authentication)
- **Components:** Reusable UI atoms (shadcn/ui) and layout wrappers
- **Styles:** Global theme and Design System definitions

## Folder Structure

```
src/
├── components/
│   ├── layout/                # Layout wrappers (Main, Dashboard)
│   ├── ui/                    # shadcn/ui base components
│   └── ...                    # Shared components (Navbar, Sidebar)
├── features/
│   ├── admin/                 # Admin management (Employees, Services, Customers)
│   ├── auth/                  # Auth logic and pages
│   ├── booking/               # 6-step booking flow implementation
│   ├── dashboard/             # Customer dashboard features
│   ├── employee/              # Employee portal features
│   ├── home/                  # Landing page components (Hero, Footer)
│   ├── services/              # Service catalog components
│   └── vehicles/              # Vehicle management components
├── pages/                     # Route-level wrappers
├── services/                  # API service layer (auth, booking, payment, etc.)
├── contexts/                  # React Contexts (AuthContext)
├── configs/                   # App configuration
├── lib/                       # Utility functions (cn helper)
├── styles/                    # Design system (index.css)
├── App.jsx                    # Main router configuration
└── main.jsx                   # Application entry point
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

## Features Deep Dive

### Authentication System

- Dual portal for Customers and Employees
- JWT-based authentication via `AuthContext`
- Protected routes for secure access
- Password recovery and profile management

### 6-Step Booking Flow

1. **Vehicle Selection:** Select from your registered fleet
2. **Service Selection:** Choose multiple services with real-time pricing
3. **Location Selection:** Choose between branch visit or home service
4. **Employee Preference:** Select specific experts or any available
5. **Date & Time:** Interactive calendar with slot availability
6. **Confirmation:** Review and finalize booking details

### Role-Based Dashboards

- **Customer:** Manage bookings, vehicles, payments, and feedback
- **Employee:** Track assigned services, update status, and record payments
- **Admin:** Full control over employee roster, service catalog, and customer base

## Design System

### Visual Identity

The application uses a premium "Hot Red" theme (#DC2626) combined with a clean white/black aesthetic.

- **Primary Color:** Hot Red (`#DC2626`)
- **Typography:** Modern sans-serif (Inter/Geist recommended via tailwind)
- **Spacing:** Standardized Radix/Tailwind spacing system
- **Radius:** 0.625rem for a modern, rounded feel

### Tailwind 4 Integration

Leveraging Tailwind 4's new engine with OKLCH color spaces for vibrant, consistent colors.

## Routing Structure

### Public Routes

- `/` - Landing Page
- `/services` - Service Catalog
- `/login` - Customer Login
- `/employee/login` - Employee Login
- `/signup` - Registration

### Protected Dashboard Routes (`/dashboard/*`)

- `/bookings` - Upcoming Appointments
- `/book` - New Booking Flow
- `/vehicles` - Fleet Management
- `/history` - Service History
- `/payments` - Payment Records
- `/feedback` - Customer Feedback
- `/profile` - Profile Settings

### Employee/Admin Routes (`/dashboard/*`)

- `/employee/assigned` - Service Queue
- `/employee/payments` - Payment Recording
- `/admin/employees` - Team Management
- `/admin/services` - Catalog Management
- `/admin/customers` - Customer Database

---

**Last Updated:** January 25, 2026
**Version:** 1.1.0
**Status:** Feature Complete & Integrated

### Code Style

- Use functional components with hooks
- Prefer `const` over `let`
- Use arrow functions for component definitions
- Keep components under 300 lines (split if larger)
- Use descriptive variable names

### File Naming

- Components: `PascalCase.jsx`
- Utilities: `camelCase.js`
- Styles: `kebab-case.css`
- Types: `PascalCase.tsx`

### Component Structure

```jsx
// 1. Imports
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Mock data (temporary)
const mockData = [];

// 3. Component definition
const ComponentName = () => {
  // 4. State
  const [state, setState] = useState();

  // 5. Handlers
  const handleClick = () => {};

  // 6. Effects
  useEffect(() => {}, []);

  // 7. Render
  return <div>{/* JSX */}</div>;
};

// 8. Export
export default ComponentName;
```

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

### TypeScript Errors

```bash
# If tsconfig issues persist
npm install -D typescript @types/react @types/react-dom
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Performance Optimization

-  Vite for fast HMR and optimized builds
-  Code splitting via React Router
-  Lazy loading ready for images
-  CSS purging with Tailwind
-  Optimized bundle size (~200KB gzipped)

## Accessibility

-  Semantic HTML elements
-  ARIA labels where needed
-  Keyboard navigation support
-  Focus visible styles
-  Color contrast compliance

## Testing (Recommended Setup)

```bash
# Install testing libraries
npm install -D vitest @testing-library/react @testing-library/jest-dom
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

Upload contents of `dist/` folder to any static hosting service.

## License

This project is proprietary software. All rights reserved.

## Support

For issues or questions, contact the development team.

---

**Last Updated:** December 30, 2025  
**Version:** 1.0.0  
**Status:** Production Ready (Awaiting Backend Integration)
