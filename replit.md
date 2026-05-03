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
- `/login` — Admin/employee login
- `/check-in` — New visitor check-in
- `/appointment` — Pre-booked appointments
- `/returning` — Returning visitor flow
- `/approvals` — Public approval page
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
- Firebase Auth for OTP/biometric verification
- Seeded users: `admin@vms.com`, `admin@visitorpass.com`, `employee@visitorpass.com`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/visitor-pass run dev` — run frontend locally

## Artifacts

- `artifacts/visitor-pass/` — React + Vite frontend (served at `/`)
- `artifacts/api-server/` — Express backend (served at `/api`, `/socket.io`)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
