# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: MongoDB (Mongoose) — uses in-memory MongoDB for dev if MONGODB_URI is not set
- **Validation**: Zod (`zod/v4`)
- **Build**: esbuild (ESM bundle)
- **Frontend**: React + Vite + TailwindCSS v4 + Wouter routing

## Application: VISITORPASS

A Visitor Management System (VMS) for enterprises. Handles visitor check-ins, approvals, employee/department management.

### Routes (Frontend)
- `/` — Landing page
- `/login` — Admin/employee login (left panel always visible with VISITORPASS branding)
- `/check-in` — New visitor check-in (phone + email OTP, blink detection, checkout time)
- `/appointment` — Pre-booked appointments (webcam+blink detection, no file upload)
- `/returning` — Returning visitor flow
- `/approvals` — Public approval page
- `/video` — Animated explainer video (4-scene, 45-sec, visitor journey)
- `/dashboard/*` — Admin dashboard (requires auth)

### API (Backend - Express)
- `POST /api/v1/auth/login` — Login (JWT)
- `GET/POST /api/v1/visits/*` — Visitor management
- `GET/POST /api/v1/users/*` — User management
- `GET/POST /api/v1/departments/*` — Departments
- `GET/POST /api/v1/designations/*` — Designations
- WebSocket at `/socket.io` for real-time notifications

### Auth
- JWT tokens stored in `localStorage`
- Firebase Auth for phone OTP verification on new visitor check-in
- Backend email OTP via `POST /api/v1/auth/send-otp` + `POST /api/v1/auth/verify-otp` (in-memory store, optional SMTP)
- Seeded users: `admin@vms.com`, `admin@visitorpass.com`, `employee@visitorpass.com`

### Recent Changes (Session)
- **Login page**: Left panel now always visible (hidden only on mobile); floating cards enlarged (150×178px); VTS INFOSOFT logo enlarged
- **CheckInPage**: Dual OTP (phone via Firebase + email via backend); checkout time picker added in Step 2
- **AppointmentPage**: File upload removed; replaced with webcam + blink detection liveness check
- **Sidebar**: Logo enlarged from 30px → 46px height
- **Video**: 4-scene animated explainer at `/video` (office arrival → QR email → scan → entry → VISITORPASS logo)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/visitor-pass run dev` — run frontend locally

## Artifacts

- `artifacts/visitor-pass/` — React + Vite frontend (served at `/`)
- `artifacts/api-server/` — Express backend (served at `/api`, `/socket.io`)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
