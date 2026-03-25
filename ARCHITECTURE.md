# 🏗️ HRIS Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HRIS FRONTEND APPS                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    🔐 AUTH FLOW (Login System)                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. User buka → http://localhost:3000 (auth-frontend)               │
│                                                                       │
│  2. Input credentials → POST /auth/login                             │
│                                                                       │
│  3. Backend validate → Return { token, user: { role } }              │
│                                                                       │
│  4. Save to localStorage:                                            │
│     - token: "eyJhbGc..."                                            │
│     - user: { id, username, email, role }                            │
│                                                                       │
│  5. Redirect based on ROLE:                                          │
│                                                                       │
│     ADMIN ────→ http://localhost:3001/dashboard                      │
│     HR ───────→ http://localhost:3002/dashboard                      │
│     FINANCE ──→ http://localhost:3003/dashboard                      │
│     EMPLOYEE ─→ http://localhost:3004/dashboard                      │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    📱 FRONTEND ARCHITECTURE                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │                   5 INDEPENDENT APPS                     │       │
│   │                                                          │       │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │       │
│   │  │   AUTH   │  │  ADMIN   │  │    HR    │             │       │
│   │  │  :3000   │  │  :3001   │  │  :3002   │             │       │
│   │  └──────────┘  └──────────┘  └──────────┘             │       │
│   │                                                          │       │
│   │  ┌──────────┐  ┌──────────┐                            │       │
│   │  │ FINANCE  │  │ EMPLOYEE │                            │       │
│   │  │  :3003   │  │  :3004   │                            │       │
│   │  └──────────┘  └──────────┘                            │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                       │
│                           ↓ ↓ ↓                                      │
│                                                                       │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │              SHARED SERVICES (Monorepo)                  │       │
│   │                                                          │       │
│   │  ┌────────┐  ┌────────┐  ┌─────────┐  ┌────────┐      │       │
│   │  │  API   │  │  Auth  │  │ Format  │  │ Error  │      │       │
│   │  │ Client │  │ Helper │  │ Helper  │  │Handler │      │       │
│   │  └────────┘  └────────┘  └─────────┘  └────────┘      │       │
│   │                                                          │       │
│   │  ┌─────────────┐  ┌──────────────┐                     │       │
│   │  │  Constants  │  │ Validation   │                     │       │
│   │  └─────────────┘  └──────────────┘                     │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                       │
│                           ↓ ↓ ↓                                      │
│                                                                       │
│   ┌─────────────────────────────────────────────────────────┐       │
│   │                BACKEND API (:5000)                       │       │
│   │                                                          │       │
│   │  POST   /auth/login                                     │       │
│   │  GET    /users          (Admin only)                    │       │
│   │  POST   /users          (Admin only)                    │       │
│   │  PUT    /users/:id      (Admin only)                    │       │
│   │  DELETE /users/:id      (Admin only)                    │       │
│   │  GET    /employees      (HR only)                       │       │
│   │  POST   /employees      (HR only)                       │       │
│   │  PUT    /employees/:id  (HR only)                       │       │
│   │  DELETE /employees/:id  (HR only)                       │       │
│   └─────────────────────────────────────────────────────────┘       │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    🎨 COMPONENT ARCHITECTURE                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Each Dashboard App (Admin/HR/Finance/Employee):                    │
│                                                                       │
│   App.tsx (Router)                                                   │
│      │                                                               │
│      ├─→ <AuthGuard>                                                │
│      │      │                                                        │
│      │      ├─→ Check token exists                                  │
│      │      ├─→ Validate role                                       │
│      │      └─→ Redirect to login if invalid                        │
│      │                                                               │
│      └─→ <Layout>                                                   │
│             │                                                        │
│             ├─→ <Sidebar>                                           │
│             │      ├─→ Logo & Title                                 │
│             │      ├─→ Navigation Menu                              │
│             │      └─→ User Info & Logout                           │
│             │                                                        │
│             └─→ <Outlet> (Pages)                                    │
│                    ├─→ Dashboard                                     │
│                    ├─→ User Management (Admin)                      │
│                    ├─→ Employee Management (HR)                     │
│                    └─→ etc...                                        │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    🔒 SECURITY LAYERS                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Layer 1: Login Page                                                │
│   └─→ Validate credentials                                          │
│                                                                       │
│   Layer 2: JWT Token                                                 │
│   └─→ Stored in localStorage                                        │
│                                                                       │
│   Layer 3: Axios Interceptor                                         │
│   └─→ Auto add "Authorization: Bearer {token}"                      │
│                                                                       │
│   Layer 4: AuthGuard Component                                       │
│   └─→ Check token & role before rendering                           │
│                                                                       │
│   Layer 5: Backend Middleware                                        │
│   └─→ Verify JWT & check permissions                                │
│                                                                       │
│   Layer 6: Auto Logout                                               │
│   └─→ If 401 response, clear localStorage & redirect                │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    📊 DATA FLOW EXAMPLE                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Admin wants to create a new user:                                  │
│                                                                       │
│   1. Admin opens User Management page                                │
│      ↓                                                               │
│   2. Click "Tambah User" button                                      │
│      ↓                                                               │
│   3. Modal form appears                                              │
│      ↓                                                               │
│   4. Fill: username, email, password, role                           │
│      ↓                                                               │
│   5. Click "Simpan"                                                  │
│      ↓                                                               │
│   6. Frontend: POST /users with form data                            │
│      ↓                                                               │
│   7. Axios adds: "Authorization: Bearer {token}"                     │
│      ↓                                                               │
│   8. Backend validates JWT & role                                    │
│      ↓                                                               │
│   9. Backend creates user in database                                │
│      ↓                                                               │
│   10. Return success response                                        │
│      ↓                                                               │
│   11. Frontend refreshes user list                                   │
│      ↓                                                               │
│   12. Show success message                                           │
│      ↓                                                               │
│   13. Close modal                                                    │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    🎯 FEATURES MATRIX                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Feature              │ Admin │  HR  │ Finance │ Employee           │
│   ────────────────────┼───────┼──────┼─────────┼──────────          │
│   Dashboard            │   ✅   │  ✅  │   ✅    │   ✅              │
│   User Management      │   ✅   │  ❌  │   ❌    │   ❌              │
│   Employee Management  │   ❌   │  ✅  │   ❌    │   ❌              │
│   Payroll View         │   ❌   │  ❌  │   ✅    │   ❌              │
│   Attendance Check     │   ❌   │  ❌  │   ❌    │   ✅              │
│   View All Users       │   ✅   │  ❌  │   ❌    │   ❌              │
│   View All Employees   │   ✅   │  ✅  │   ✅    │   ❌              │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    🚀 DEPLOYMENT READY                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Each app can be deployed independently:                            │
│                                                                       │
│   npm run build                                                      │
│   └─→ Creates optimized production build in /dist                    │
│                                                                       │
│   Deploy options:                                                    │
│   • Vercel (recommended for Vite apps)                               │
│   • Netlify                                                          │
│   • AWS S3 + CloudFront                                              │
│   • Docker containers                                                │
│   • Traditional web servers (nginx, apache)                          │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
