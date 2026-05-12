# VISITORPASS — Value Management System

A full-stack enterprise visitor management platform with check-in, QR codes, biometric verification, real-time notifications, and an employee dashboard.

## Run & Operate

- `pnpm --filter @workspace/visitor-pass run dev` — run the frontend (port 25678)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, shadcn/ui, Framer Motion, GSAP, wouter (routing)
- Backend: Express 5, MongoDB (Mongoose), Socket.IO for real-time events
- Auth: JWT + Firebase (OTP/phone verification)
- Realtime: Socket.IO (admin channel + per-employee channels)
- Build: esbuild (CJS bundle for API server)

## Where things live

- `artifacts/visitor-pass/` — React + Vite frontend (main web app)
- `artifacts/api-server/` — Express API server
- `artifacts/visitor-pass/src/pages/` — All pages (LandingPage, LoginPage, CheckInPage, DashboardHome, etc.)
- `artifacts/visitor-pass/src/components/` — UI components (GeoBackground, Modal, Sidebar, etc.)
- `artifacts/visitor-pass/src/lib/firebase.ts` — Firebase config (requires env vars)
- `artifacts/api-server/src/vms/` — Business logic (auth, visits, users, departments, designations, mobile)
- `artifacts/api-server/src/app.ts` — Express app + MongoDB connection + Socket.IO setup
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contracts)

## Architecture decisions

- MongoDB (Mongoose) is used instead of PostgreSQL/Drizzle — visitor management data is document-oriented
- In-memory MongoDB (mongodb-memory-server) is auto-started in development when MONGODB_URI is not set
- Firebase OTP for visitor phone verification (requires FIREBASE_* env vars)
- JWT-based auth for employee/admin login
- Socket.IO for real-time visitor approval notifications to employees

## Product

- **Landing page**: New visitor check-in, returning visitor, and pre-booking flows
- **Visitor check-in**: Camera capture, QR code generation, host notification
- **Employee portal**: JWT login, dashboard with visitors, approvals, departments, employees, designations, administrators, pre-visitors, permissions
- **Admin dashboard**: Full CRUD for all entities, approval workflow, real-time notifications

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- MongoDB runs in-memory (auto-seeded) when MONGODB_URI is not set. Set `MONGODB_URI` as a secret for persistent data.
- Firebase OTP will fail (503) until `VITE_FIREBASE_*` env vars are configured as Replit secrets.
- The frontend proxies `/api` and `/socket.io` to the API server at port 8080.
- Run `pnpm --filter @workspace/api-server run dev` first if the frontend shows API errors.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
