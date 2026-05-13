# Visitor Management System (VMS)

A full-stack enterprise visitor management system with real-time check-in, biometric verification, QR codes, and host notifications.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/visitor-pass run dev` — run the frontend (port 25678)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `MONGODB_URI` — MongoDB connection string (falls back to in-memory MongoDB if not set)
- Optional env: `FRONTEND_URL` — allowed CORS origin(s), comma-separated
- Optional env: `JWT_SECRET` — JWT signing secret
- Optional env: `EMAIL_*` — nodemailer email config

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifacts/visitor-pass), Tailwind CSS, shadcn/ui, GSAP animations
- API: Express 5 + Socket.io (artifacts/api-server)
- DB: MongoDB + Mongoose (in-memory for dev via mongodb-memory-server)
- Auth: JWT + bcrypt
- Real-time: Socket.io for live visitor notifications
- QR codes: qrcode library
- Camera: react-webcam for visitor photo capture

## Where things live

- `artifacts/visitor-pass/src/pages/` — route pages (React Router via wouter)
- `artifacts/visitor-pass/src/components/` — shared UI components
- `artifacts/api-server/src/vms/` — VMS business logic (models, routes handlers)
- `artifacts/api-server/src/routes/` — Express route registration
- `artifacts/api-server/src/middlewares/` — auth & other middleware

## Architecture decisions

- MongoDB with in-memory fallback for dev (no DATABASE_URL needed to run locally)
- Socket.io path `/socket.io` in dev, `/api/socket.io` in production
- JWT auth stored in localStorage on the frontend
- Rate limiting on public visitor and auth endpoints

## Product

- Landing page with new visitor check-in, returning visitor, and pre-book flows
- Employee portal with dashboard, visitor management, approvals
- Admin panel with full user/department/designation management
- QR-code based visitor passes
- Real-time notifications to hosts when visitors arrive

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Socket.io path differs between dev (`/socket.io`) and production (`/api/socket.io`)
- In dev, MongoDB runs in-memory and is auto-seeded with sample departments, designations, and users
- Default admin: admin@vms.com / admin@visitorpass.com; default employee: it@vms.com, hr@vms.com

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
