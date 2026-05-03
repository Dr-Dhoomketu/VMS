# VISITORPASS — Visitor Management System

## Project Overview

A full-stack enterprise Visitor Management System (VMS) migrated from Next.js/Vercel to Vite + React in the Replit pnpm monorepo. Features real-time visitor approvals, QR digital gate passes, webcam capture, Socket.IO live updates, and a full admin dashboard.

---

## Architecture

### Monorepo Structure
```
artifacts/
  visitor-pass/     — React + Vite frontend (port 25678, preview path /)
  api-server/       — Express + MongoDB backend (port 8080, preview path /api)
lib/
  db/               — Drizzle/PostgreSQL shared lib (unused by VMS, kept for platform)
  api-zod/          — Shared Zod schemas
```

### Frontend (`artifacts/visitor-pass`)
- **Framework**: React 18 + Vite 7 + TypeScript
- **Routing**: wouter (base `/`)
- **Styling**: Tailwind CSS v4 + custom VMS design system
- **Animations**: GSAP + @gsap/react + ScrollTrigger
- **Webcam**: react-webcam + react-easy-crop
- **Sockets**: socket.io-client
- **API base**: Empty string `''` (proxied via Vite `/api/*` → backend)

### Backend (`artifacts/api-server`)
- **Framework**: Express 5 + TypeScript
- **Database**: MongoDB via Mongoose (MONGODB_URI secret required)
- **Auth**: JWT (HS256, 30-day tokens), stored as `Bearer` in Authorization header
- **Sockets**: Socket.IO on `/socket.io` path, rooms: `admin_channel`, `employee_<id>`
- **File uploads**: Multer → `public/uploads/` directory
- **Build**: esbuild bundled to `dist/index.mjs`

---

## VMS Routes

### Public Routes (no auth)
- `POST /api/v1/visits/request` — submit a visitor check-in (multipart/form-data with optional webcamImage)
- `GET  /api/v1/visits/history?phone=XXX` — look up visitor by phone (returning visitors)
- `GET  /api/v1/users/employees` — list employees for form dropdowns

### Protected Routes (JWT Bearer token required)
- `POST /api/v1/auth/login` — login (returns token)
- `GET  /api/v1/auth/me` — current user
- `GET  /api/v1/visits` — all visits with optional filters (Admin only)
- `GET  /api/v1/visits/pending` — pending approvals
- `GET  /api/v1/visits/approved` — approved visits with gate pass data
- `GET  /api/v1/visits/stats` — dashboard stats (Admin only)
- `PUT  /api/v1/visits/:id/status` — approve/reject a visit
- `POST /api/v1/visits/:id/checkout` — check out a visitor
- `GET/POST/PUT/DELETE /api/v1/departments` — department CRUD
- `GET/POST/PUT/DELETE /api/v1/designations` — designation CRUD
- `GET/POST/PUT/DELETE /api/v1/users` — user/employee CRUD (Admin only)

---

## Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | LandingPage | Hero with GSAP animations, SecurityCharacter SVG (eye tracking), GreekSkyline SVG, HowItWorks animated diagram |
| `/login` | LoginPage | Split-panel employee login |
| `/check-in` | CheckInPage | 3-step: details → webcam/photo → success |
| `/appointment` | AppointmentPage | Pre-schedule a visit |
| `/returning` | ReturningPage | Phone lookup for returning visitors |
| `/approvals` | ApprovalsPage | Public approval status page |
| `/dashboard` | DashboardHome | Stats cards + recent visits table |
| `/dashboard/approvals` | DashboardApprovals | Pending queue + digital gate passes |
| `/dashboard/visitors` | DashboardVisitor | Full visitor log with filters |
| `/dashboard/departments` | DashboardDepartment | Department CRUD |
| `/dashboard/employees` | DashboardEmployee | Employee CRUD |
| `/dashboard/designations` | DashboardDesignation | Designation CRUD |
| `/dashboard/administrators` | DashboardAdministrator | Admin account CRUD |
| `/dashboard/pre-visitors` | DashboardPreVisitor | Pre-scheduled appointments |

---

## Key Files

### Frontend
- `artifacts/visitor-pass/src/App.tsx` — router with all routes + ProtectedRoute guard
- `artifacts/visitor-pass/src/lib/api.ts` — `API_URL` export (empty string, proxied)
- `artifacts/visitor-pass/src/utils/socket.ts` — Socket.IO client + connectSocket helper
- `artifacts/visitor-pass/src/components/Sidebar.tsx` — dashboard sidebar navigation
- `artifacts/visitor-pass/src/components/Modal.tsx` — reusable modal
- `artifacts/visitor-pass/src/index.css` — VMS design system (Tailwind + custom classes)
- `artifacts/visitor-pass/vite.config.ts` — Vite config with `/api`, `/public/uploads`, `/socket.io` proxies

### Backend
- `artifacts/api-server/src/vms/models.ts` — Mongoose models (Visitor, Visit, VmsUser, Department, Designation)
- `artifacts/api-server/src/vms/auth.ts` — JWT auth routes + `protect`/`authorize` middleware
- `artifacts/api-server/src/vms/visits.ts` — all visit routes (request, pending, approved, status, checkout, stats)
- `artifacts/api-server/src/vms/users.ts` — user/employee CRUD routes
- `artifacts/api-server/src/vms/departments.ts` — department CRUD
- `artifacts/api-server/src/vms/designations.ts` — designation CRUD
- `artifacts/api-server/src/vms/seed.ts` — database seeder (run once to create defaults)
- `artifacts/api-server/src/app.ts` — Express app + Socket.IO setup + MongoDB connect
- `artifacts/api-server/src/routes/index.ts` — route registration for all VMS routes

---

## Environment Variables / Secrets

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `MONGODB_URI` | Secret | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret | Optional | JWT signing secret (has fallback) |
| `VITE_API_URL` | Env | Optional | Override API base URL (defaults to empty = proxied) |

---

## Default Credentials (seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@visitorpass.com | admin123 |
| Employee | employee@visitorpass.com | employee123 |

Run seed: `cd artifacts/api-server && pnpm exec tsx src/vms/seed.ts`

---

## Design System Classes (index.css)

| Class | Usage |
|-------|-------|
| `.btn-primary` / `.btn-vp-primary` | Primary CTA buttons (dark navy) |
| `.btn-vp-secondary` | Secondary outlined button |
| `.vp-card` | Standard white card with border + shadow |
| `.vp-card-feature` | Feature card with hover lift |
| `.vp-section-card` | Form section card |
| `.vp-caption` | Uppercase tracking caption text |
| `.vp-label` | Form field label |
| `.dark-table-container` / `.dark-table` | Dashboard data table |
| `.badge` / `.badge-approved` / `.badge-pending` / `.badge-rejected` / `.badge-checkedout` | Status badges |
| `.fade-up` | GSAP fade-up animation target |
| `.float-badge` / `.float-anim` | Floating animation elements |
| `.dot-bg` / `.column-bg` / `.vp-nav` | Background patterns |

---

## Vite Proxy (dev only)

```
/api         → http://localhost:8080
/public/uploads → http://localhost:8080
/socket.io   → http://localhost:8080 (ws: true)
```
