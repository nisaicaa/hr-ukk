# 🚀 CARA MENJALANKAN HRIS SYSTEM

## ⚡ Langkah-Langkah Running

### 1️⃣ Install Dependencies (Sekali Saja)

**Opsi A - Otomatis (Recommended):**
```bash
# Double click file ini:
install-frontend.bat
```

**Opsi B - Manual:**
```bash
# Backend
cd backend
npm install

# Auth Frontend
cd frontend/apps/auth-frontend
npm install

# Admin Frontend
cd frontend/apps/admin-frontend
npm install

# HR Frontend
cd frontend/apps/hr-frontend
npm install

# Finance Frontend
cd frontend/apps/finance-frontend
npm install

# Employee Frontend
cd frontend/apps/employee-frontend
npm install
```

---

### 2️⃣ Setup Database (Sekali Saja)

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database dengan data dummy
npm run prisma:seed
```

**User yang dibuat oleh seed:**
- admin@example.com / admin123 (ADMIN)
- hr@example.com / hr123 (HR)
- finance@example.com / finance123 (FINANCE)
- employee@example.com / employee123 (EMPLOYEE)

---

### 3️⃣ Jalankan Backend

```bash
cd backend
npm run dev
```

✅ Backend berjalan di: **http://localhost:5000**

**Cek backend sudah running:**
Buka browser: http://localhost:5000
Seharusnya muncul respons dari server.

---

### 4️⃣ Jalankan Frontend Apps

**⚡ PENTING:** Buka **5 terminal berbeda** (atau 5 PowerShell window)

#### Terminal 1 - Auth (Login Page)
```bash
cd frontend/apps/auth-frontend
npm run dev
```
✅ Buka: **http://localhost:3000**

#### Terminal 2 - Admin Dashboard
```bash
cd frontend/apps/admin-frontend
npm run dev
```
✅ Buka: **http://localhost:3001**

#### Terminal 3 - HR Dashboard
```bash
cd frontend/apps/hr-frontend
npm run dev
```
✅ Buka: **http://localhost:3002**

#### Terminal 4 - Finance Dashboard
```bash
cd frontend/apps/finance-frontend
npm run dev
```
✅ Buka: **http://localhost:3003**

#### Terminal 5 - Employee Dashboard
```bash
cd frontend/apps/employee-frontend
npm run dev
```
✅ Buka: **http://localhost:3004**

**ATAU gunakan helper scripts:**
- Double click: `run-auth.bat`
- Double click: `run-admin.bat`
- Double click: `run-hr.bat`
- Double click: `run-finance.bat`
- Double click: `run-employee.bat`

---

### 5️⃣ Testing Login

1. Buka browser: **http://localhost:3000**
2. Login dengan salah satu user:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Klik **Login**
4. Otomatis redirect ke dashboard sesuai role

---

## 📋 Checklist Sebelum Running

- [ ] Node.js sudah terinstall (v18 atau lebih baru)
- [ ] PostgreSQL/MySQL sudah running
- [ ] File `.env` di backend sudah dikonfigurasi
- [ ] Backend dependencies sudah terinstall
- [ ] Frontend dependencies sudah terinstall (semua 5 apps)
- [ ] Database sudah di-migrate dan di-seed

---

## 🔧 Troubleshooting

### Port sudah digunakan

**Masalah:** Error `EADDRINUSE` atau port conflict

**Solusi:** Edit `vite.config.ts` di app yang conflict:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3010, // Ganti dengan port lain
  },
})
```

### Cannot connect to backend

**Masalah:** Error network atau CORS

**Solusi:**
1. Pastikan backend running di port 5000
2. Cek CORS di backend sudah allow origin localhost:3000-3004

### Module not found

**Masalah:** Error `Cannot find module 'react'` atau lainnya

**Solusi:**
```bash
cd frontend/apps/[nama-app]
rm -rf node_modules package-lock.json
npm install
```

### Database error

**Masalah:** Prisma error atau connection refused

**Solusi:**
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Login redirect error

**Masalah:** Setelah login tidak redirect atau error 401

**Solusi:**
1. Clear localStorage browser (F12 → Application → Local Storage → Clear)
2. Pastikan backend seed sudah dijalankan
3. Cek backend logs untuk error

---

## 📱 URL Reference

| Service | URL | Port | Keterangan |
|---------|-----|------|------------|
| Backend API | http://localhost:5000 | 5000 | REST API |
| Login Page | http://localhost:3000 | 3000 | Auth Frontend |
| Admin Dashboard | http://localhost:3001 | 3001 | Admin Only |
| HR Dashboard | http://localhost:3002 | 3002 | HR Only |
| Finance Dashboard | http://localhost:3003 | 3003 | Finance Only |
| Employee Dashboard | http://localhost:3004 | 3004 | Employee Only |

---

## 🎯 Testing Workflow

### Test Admin
1. Login dengan `admin@example.com` / `admin123`
2. Redirect ke http://localhost:3001/dashboard
3. Lihat Dashboard (Total Users, Total Employees)
4. Klik **User Management**
5. Test CRUD:
   - Create user baru
   - Edit user existing
   - Delete user
6. Logout

### Test HR
1. Login dengan `hr@example.com` / `hr123`
2. Redirect ke http://localhost:3002/dashboard
3. Lihat Dashboard (Total Karyawan, Kehadiran, Cuti)
4. Klik **Employee Management**
5. Test CRUD:
   - Create employee baru (NIK, Nama, Email, Posisi, Departemen)
   - Edit employee
   - Delete employee
6. Logout

### Test Finance
1. Login dengan `finance@example.com` / `finance123`
2. Redirect ke http://localhost:3003/dashboard
3. Lihat Payroll Summary
4. Lihat tabel payroll approval
5. Logout

### Test Employee
1. Login dengan `employee@example.com` / `employee123`
2. Redirect ke http://localhost:3004/dashboard
3. Klik **Check-in**
4. Lihat success message
5. Klik **Check-out** (enabled setelah check-in)
6. Lihat riwayat kehadiran
7. Logout

---

## 💡 Tips Development

### Hot Reload
Semua apps sudah support HMR (Hot Module Replacement). Perubahan code akan langsung terlihat tanpa refresh manual.

### Debug
- **Frontend:** Buka DevTools (F12) → Console
- **Backend:** Lihat terminal yang running `npm run dev`
- **Network:** DevTools → Network tab untuk monitor API calls

### Multiple Browsers
Untuk testing simultan:
- Chrome: Login sebagai Admin
- Firefox: Login sebagai HR
- Edge: Login sebagai Employee

---

## 📊 System Requirements

- Node.js: v18+ (recommended v20)
- npm: v9+
- RAM: Minimal 4GB (8GB recommended untuk run semua apps)
- Browser: Chrome, Firefox, Safari, Edge (latest)
- Database: PostgreSQL 14+ atau MySQL 8+

---

## 🚦 Status Check

Setelah semua berjalan, cek:

✅ Backend: http://localhost:5000 (API response)
✅ Auth: http://localhost:3000 (Login page tampil)
✅ Admin: http://localhost:3001 (Redirect ke login jika belum login)
✅ HR: http://localhost:3002 (Redirect ke login jika belum login)
✅ Finance: http://localhost:3003 (Redirect ke login jika belum login)
✅ Employee: http://localhost:3004 (Redirect ke login jika belum login)

Jika semua ✅, sistem siap digunakan! 🎉

---

## 📞 Need Help?

Baca dokumentasi lengkap:
- [README.md](README.md) - Overview
- [QUICK_START.md](QUICK_START.md) - Quick start guide
- [FRONTEND_README.md](FRONTEND_README.md) - Frontend documentation
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Completion summary

---

**Selamat menggunakan HRIS System! 💼✨**
