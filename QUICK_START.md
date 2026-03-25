# 🚀 QUICK START GUIDE - HRIS Frontend

## ⚡ Super Cepat (3 Langkah)

### 1️⃣ Install Semua Dependencies
```bash
# Double click file ini atau run di terminal:
install-frontend.bat
```

### 2️⃣ Start Backend
```bash
cd backend
npm run dev
```

### 3️⃣ Start Frontend Apps

**Cara termudah: Double click setiap file .bat**
- `run-auth.bat` → Login page (Port 3000)
- `run-admin.bat` → Admin dashboard (Port 3001)
- `run-hr.bat` → HR dashboard (Port 3002)
- `run-finance.bat` → Finance dashboard (Port 3003)
- `run-employee.bat` → Employee dashboard (Port 3004)

**ATAU manual di terminal:**
```bash
# Terminal 1
cd frontend/apps/auth-frontend && npm run dev

# Terminal 2
cd frontend/apps/admin-frontend && npm run dev

# Terminal 3
cd frontend/apps/hr-frontend && npm run dev

# Terminal 4
cd frontend/apps/finance-frontend && npm run dev

# Terminal 5
cd frontend/apps/employee-frontend && npm run dev
```

---

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@example.com | admin123 |
| HR | hr@example.com | hr123 |
| FINANCE | finance@example.com | finance123 |
| EMPLOYEE | employee@example.com | employee123 |

---

## 🌐 URLs

| App | URL | Role |
|-----|-----|------|
| Login | http://localhost:3000 | ALL |
| Admin | http://localhost:3001/dashboard | ADMIN |
| HR | http://localhost:3002/dashboard | HR |
| Finance | http://localhost:3003/dashboard | FINANCE |
| Employee | http://localhost:3004/dashboard | EMPLOYEE |

---

## ✅ Testing Flow

1. Buka http://localhost:3000
2. Login sebagai ADMIN
3. Otomatis redirect ke http://localhost:3001/dashboard
4. Lihat dashboard admin
5. Klik "User Management" → CRUD users
6. Logout
7. Login sebagai HR → Redirect ke http://localhost:3002
8. Dan seterusnya...

---

## 📁 Struktur Fitur

### 🔵 ADMIN
- ✅ Dashboard (Total users, Total employees)
- ✅ User Management (CRUD)
  - Create user baru
  - Edit user existing
  - Delete user
  - Role: ADMIN, HR, FINANCE, EMPLOYEE

### 🟢 HR
- ✅ Dashboard (Total karyawan, Kehadiran, Cuti)
- ✅ Employee Management (CRUD)
  - NIK, Nama, Email
  - Posisi, Departemen
  - Status: AKTIF/NONAKTIF

### 🟡 FINANCE
- ✅ Dashboard Payroll
  - Total payroll amount
  - Total employees
  - Pending approvals
  - Daftar payroll (dummy)

### ⚪ EMPLOYEE
- ✅ Dashboard Attendance
  - Check-in button
  - Check-out button
  - Riwayat kehadiran

---

## 🎨 UI Features

✅ Modern sidebar navigation
✅ User profile di sidebar
✅ Logout button
✅ Responsive cards
✅ Data tables dengan search
✅ Modal forms untuk CRUD
✅ Badge untuk status
✅ Loading states
✅ Error handling

---

## 🔧 Tech Stack

- React 18 + TypeScript
- Vite (super fast build)
- React Router v6
- Axios dengan interceptors
- Pure CSS (no framework)
- JWT Authentication
- Local Storage

---

## 🚨 Common Issues

### Port already in use
Edit `vite.config.ts` di setiap app:
```typescript
server: { port: 3010 } // Ganti port
```

### Can't login
1. Backend running? Check http://localhost:5000
2. Database seed done? Run `npm run prisma:seed`
3. Clear localStorage (F12 → Application)

### Module not found
```bash
cd frontend/apps/[nama-app]
npm install
```

### CORS error
Backend perlu CORS setup untuk allow origin localhost:3000-3004

---

## 📊 API Integration

Semua apps sudah terintegrasi dengan backend:

```typescript
// services/api/index.ts
- Auto add Bearer token
- Auto handle 401 (logout)
- Error interceptor

// Example usage:
import apiClient from '../../services/api';
const users = await apiClient.get('/users');
```

---

## 🎯 Checklist Development

- [x] Auth Frontend (Login)
- [x] Admin Frontend (Dashboard + User CRUD)
- [x] HR Frontend (Dashboard + Employee CRUD)
- [x] Finance Frontend (Dashboard + Payroll)
- [x] Employee Frontend (Dashboard + Attendance)
- [x] Shared services (API, Auth, Helpers)
- [x] Auth guards per role
- [x] Logout functionality
- [x] Role-based redirect
- [x] Modern UI design
- [x] Responsive layout

---

## 📖 Documentation

Baca lengkap: [FRONTEND_README.md](FRONTEND_README.md)

---

**Happy Coding! 🎉**
