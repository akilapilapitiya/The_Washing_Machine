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
- ✅ **Telegram Bot Integration:** Receive job notifications, view details, and update status directly from Telegram

### Business Administration

- ✅ **Employee Management:** Full CRUD operations, role assignment (Owner, Employee, Cashier)
- ✅ **Service Catalog:** Pricing management, add-ons, active/inactive status, and **Promotional Offers**
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
- ✅ **Comprehensive Testing:** 11 backend + 14 frontend test suites
- ✅ **API Documentation:** Interactive Swagger/OpenAPI documentation
- ✅ **Security Hardening:** Rate limiting, Helmet.js, CORS, input validation
- ✅ **Containerized Infrastructure:** One-command setup for Database and Redis via Docker Compose

## 🛠️ Technology Stack

### Backend (Node.js + Express)

| Category                | Technologies                                          |
| ----------------------- | ----------------------------------------------------- |
| **Runtime & Framework** | Node.js 18+, Express.js ~4.16.1                       |
| **Database**            | PostgreSQL ^8.16.3 with connection pooling            |
| **Messaging & Cache**   | **Redis** (for Telegram linking and caching)          |
| **Authentication**      | JWT (jsonwebtoken ^9.0.3), bcryptjs ^3.0.3            |
| **Validation**          | Joi ^18.0.2                                           |
| **Security**            | Helmet ^8.1.0, CORS ^2.8.5, express-rate-limit ^8.2.1 |
| **Email**               | Nodemailer ^7.0.12                                    |
| **Bot Integration**     | **Node Telegram Bot API** ^0.66.0                     |
| **Testing**             | Jest ^29.7.0, Supertest ^7.0.0                        |
| **Documentation**       | Swagger UI Express ^5.0.1, YAMLJS ^0.3.0              |
| **Infrastructure**      | **Docker & Docker Compose**                           |

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

## � Quick Start

### Prerequisites

- **Node.js** v18+
- **Docker & Docker Compose** (Recommended for DB/Redis)
- **npm** package manager

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd The_Washing_Machine
```

#### 2. Infrastructure Setup (Docker)

Start the PostgreSQL and Redis containers:

```bash
docker-compose up -d
```

#### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env.development.local
# Update DB_PASSWORD and add TELEGRAM_BOT_TOKEN
nano .env.development.local
```

#### 4. Database Initialization

```bash
# Reset database schema and seed default owner
npm run db:reset:seed
```

#### 5. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

## 🧪 Testing

### Backend Testing (Jest + Supertest)

```bash
cd backend
npm test
```

**Test Coverage:**
- Authentication, Bookings, Vehicles, Services, Payments, Feedback, Profile, and **Notifications**.

## 🆕 Recent Additions (v1.4.0)

### Infrastructure & Core
- ✅ **Docker Integration**: Simplified setup with Docker Compose for Postgres and Redis.
- ✅ **Model-Driven Schema**: Unified database synchronization from model definitions.
- ✅ **Redis Support**: Implemented for stateful bot interactions and future performance gains.

### Features
- ✅ **Telegram Bot**: Real-time job notifications and status management for employees.
- ✅ **Service Offers**: Support for promotional pricing and snapshotting prices at booking time.
- ✅ **Travel Logistics**: Dynamic travel cost and duration calculation integrated into the booking flow.

## 📄 License

This project is proprietary software. All rights reserved.

---

**Version:** 1.4.0  
**Last Updated:** February 26, 2026  
**Status:** Production Ready with Containerized Utilities
