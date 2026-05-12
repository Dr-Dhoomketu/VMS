# Enterprise Visitor Management System (VMS)

## Overview
A full-stack Enterprise Visitor Management System built as a pnpm monorepo. Manages visitor check-ins, approvals, employee notifications, and administrative tasks.

## Architecture

### Monorepo Structure
- `artifacts/api-server` — Express.js backend (port 8080)
- `artifacts/visitor-pass` — React + Vite frontend (port 25678)
- `artifacts/mockup-sandbox` — UI prototyping sandbox
- `lib/api-spec` — OpenAPI 3.1 spec (source of truth)
- `lib/api-zod` — Zod schemas generated from OpenAPI spec
- `lib/api-client-react` — React Query hooks generated from OpenAPI spec
- `lib/db` — PostgreSQL layer via Drizzle ORM (for future use)

### Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Radix UI, Wouter, GSAP, Framer Motion |
| Backend | Node.js, Express 5, Socket.io, Mongoose (MongoDB), Pino logging |
| Database | MongoDB (primary, via Mongoose + in-memory fallback for dev) |
| Auth | JWT-based (bcryptjs), own login system |
| Real-time | Socket.io for host notifications |
| API Contract | OpenAPI → Orval codegen → Zod + React Query |

## Running the Project
Two workflows run in parallel:
- **Start API Server**: builds and runs the Express backend on port 8080
- **Start Frontend**: runs Vite dev server on port 25678

## Authentication
- Admin/Employee login: JWT-based, stored in `localStorage` as `token`
- Visitor OTP: Firebase Phone Auth (for phone verification during check-in)
- Test credentials:
  - Admin: `admin@visitorpass.com` / `admin123`
  - Admin: `admin@vms.com` / `password123`
  - Employee: `employee@visitorpass.com` / `employee123`

## Environment Variables / Secrets
- `MONGODB_URI` — MongoDB connection string (falls back to in-memory MongoDB if not set)
- `JWT_SECRET` — JWT signing secret (has dev fallback, required in production)
- `FAST2SMS_API_KEY` — Optional: for SMS OTP delivery via Fast2SMS
- Firebase config is hardcoded in `artifacts/visitor-pass/src/lib/firebase.ts`

## Database
- Uses MongoDB via Mongoose for all VMS data (visitors, visits, users, departments, designations)
- Auto-seeds on startup in development (departments, designations, and default users)
- In-memory MongoDB (`mongodb-memory-server`) used when `MONGODB_URI` is not set

## Key API Routes
- `POST /api/v1/auth/login` — Admin/Employee login
- `GET /api/v1/users/employees` — List employees (for visitor check-in)
- `POST /api/v1/visits/request` — New visitor request
- `GET /api/v1/visits` — List visits (protected)
- `POST /api/v1/auth/send-otp` — Send email OTP
- `POST /api/v1/auth/verify-otp` — Verify OTP
- `GET /api/healthz` — Health check

## Frontend Pages
- `/` — Landing page
- `/login` — Admin/Employee login
- `/check-in` — Visitor check-in with webcam, OTP verification
- `/appointment` — Pre-scheduled appointment form
- `/returning` — Returning visitor form
- `/approvals` — Visit approval page
- `/dashboard/*` — Protected admin dashboard (visitors, approvals, employees, departments, designations, administrators, permissions)
