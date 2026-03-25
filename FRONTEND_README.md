# HRIS Frontend - Human Resource Information System

Sistem HRIS dengan arsitektur monorepo frontend yang terdiri dari 5 aplikasi berbeda berdasarkan role pengguna.

## 📁 Struktur Project

```
frontend/
├── apps/
│   ├── auth-frontend/       # Port 3000 - Halaman Login
│   ├── admin-frontend/      # Port 3001 - Dashboard Admin
│   ├── hr-frontend/         # Port 3002 - Dashboard HR
│   ├── finance-frontend/    # Port 3003 - Dashboard Finance
│   └── employee-frontend/   # Port 3004 - Dashboard Employee
│
└── services/                # Shared services untuk semua apps
    ├── api/                 # HTTP client dengan axios
    ├── config/              
    ├── constant/            # Konstanta global
    ├── handler/             # Error handlers
    ├── helper/              # Helper functions (auth, format, validation)
    └── lang/                # Internationalization
```

## 🚀 Cara Menjalankan

### 1. Install Dependencies

Setiap aplikasi perlu install dependencies secara terpisah:

```bash
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

### 2. Jalankan Backend

Pastikan backend sudah berjalan di `http://localhost:5000`

```bash
cd backend
npm run dev
```

### 3. Jalankan Frontend Apps

Buka 5 terminal berbeda untuk menjalankan setiap aplikasi:

**Terminal 1 - Auth (Login):**
```bash
cd frontend/apps/auth-frontend
npm run dev
# Buka: http://localhost:3000
```

**Terminal 2 - Admin:**
```bash
cd frontend/apps/admin-frontend
npm run dev
# Buka: http://localhost:3001
```

**Terminal 3 - HR:**
```bash
cd frontend/apps/hr-frontend
npm run dev
# Buka: http://localhost:3002
```

**Terminal 4 - Finance:**
```bash
cd frontend/apps/finance-frontend
npm run dev
# Buka: http://localhost:3003
```

**Terminal 5 - Employee:**
```bash
cd frontend/apps/employee-frontend
npm run dev
# Buka: http://localhost:3004
```

## 🔐 Alur Login & Authentication

### 1. Login (auth-frontend)
- User membuka `http://localhost:3000`
- Input email/username dan password
- Klik Login
- System mengirim POST request ke `/auth/login`

### 2. Redirect Berdasarkan Role
Setelah login berhasil, user akan di-redirect otomatis:

| Role | Redirect URL | Port |
|------|-------------|------|
| ADMIN | http://localhost:3001/dashboard | 3001 |
| HR | http://localhost:3002/dashboard | 3002 |
| FINANCE | http://localhost:3003/dashboard | 3003 |
| EMPLOYEE | http://localhost:3004/dashboard | 3004 |

### 3. Auth Guard
Setiap dashboard memiliki AuthGuard yang:
- ✅ Memeriksa token di localStorage
- ✅ Validasi role user
- ❌ Redirect ke login jika tidak valid

## 📱 Fitur Per Role

### 🔵 ADMIN (Port 3001)
**Menu:**
- Dashboard
- User Management

**Fitur:**
- ✅ Lihat summary total user & employee
- ✅ CRUD User (Create, Read, Update, Delete)
- ✅ Manage role user (ADMIN, HR, FINANCE, EMPLOYEE)

### 🟢 HR (Port 3002)
**Menu:**
- Dashboard
- Employee Management

**Fitur:**
- ✅ Lihat summary karyawan
- ✅ CRUD Employee
- ✅ Kelola data: NIK, Nama, Email, Posisi, Departemen, Status
- 📊 Dummy data: Kehadiran hari ini, Pengajuan cuti

### 🟡 FINANCE (Port 3003)
**Menu:**
- Dashboard

**Fitur:**
- ✅ Summary total payroll
- ✅ Total karyawan
- 📊 Dummy: Daftar payroll approval

### ⚪ EMPLOYEE (Port 3004)
**Menu:**
- Dashboard

**Fitur:**
- ✅ Check-in / Check-out kehadiran
- ✅ Lihat riwayat kehadiran
- 📊 Dummy: History attendance

## 🛠️ Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Styling**: Pure CSS (CSS Modules style)
- **State Management**: React Hooks (useState, useEffect)

## 🎨 Design System

### Colors
```css
--primary-color: #2563eb     /* Blue - Primary actions */
--success-color: #10b981     /* Green - Success states */
--warning-color: #f59e0b     /* Orange - Warnings */
--danger-color: #ef4444      /* Red - Errors/Delete */
--text-primary: #1f2937      /* Dark gray - Main text */
--text-secondary: #6b7280    /* Medium gray - Secondary text */
```

### Components
- **Sidebar**: Fixed navigation dengan user info
- **Cards**: White background, rounded corners, shadow
- **Tables**: Responsive, hover effects
- **Buttons**: Primary, Secondary, Danger variants
- **Badges**: Role dan status indicators
- **Modal**: Overlay untuk forms

## 🔑 User Credentials (Setelah Seed)

Backend seed akan membuat user default:

```javascript
// Admin
Email: admin@example.com
Password: admin123

// HR
Email: hr@example.com
Password: hr123

// Finance
Email: finance@example.com
Password: finance123

// Employee
Email: employee@example.com
Password: employee123
```

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - Login user

### Users (Admin only)
- `GET /users` - Get all users
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Employees (HR only)
- `GET /employees` - Get all employees
- `POST /employees` - Create employee
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

## 🔒 Security

1. **JWT Token**: Disimpan di localStorage
2. **Axios Interceptor**: Otomatis menambahkan Bearer token
3. **Auth Guard**: Validasi setiap route
4. **Role Check**: Pastikan user sesuai role
5. **Auto Logout**: Jika token invalid (401)

## 📂 Shared Services

### API Client (`services/api/index.ts`)
```typescript
import apiClient from '../services/api';
const response = await apiClient.get('/users');
```

### Auth Helper (`services/helper/auth.ts`)
```typescript
import { getUser, logout, isAuthenticated } from '../services/helper/auth';
const user = getUser();
const isAuth = isAuthenticated();
logout();
```

### Format Helper (`services/helper/format.ts`)
```typescript
import { formatDate, formatCurrency } from '../services/helper/format';
const date = formatDate('2026-02-05'); // "5 Februari 2026"
const money = formatCurrency(5000000); // "Rp 5.000.000,00"
```

## 🚨 Troubleshooting

### Port sudah digunakan
Jika port conflict, edit `vite.config.ts`:
```typescript
server: {
  port: 3005, // Ganti port
}
```

### CORS Error
Pastikan backend memiliki CORS middleware:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', ...]
}));
```

### Auth tidak berfungsi
1. Cek localStorage ada token atau tidak (F12 → Application → Local Storage)
2. Cek backend berjalan di port 5000
3. Cek API endpoint `/auth/login` response

### Module not found
```bash
cd frontend/apps/[app-name]
rm -rf node_modules package-lock.json
npm install
```

## 📝 Development Tips

1. **Hot Reload**: Semua apps support HMR (Hot Module Replacement)
2. **Console Logs**: Buka DevTools untuk debug
3. **Network Tab**: Monitor API calls
4. **React DevTools**: Install extension untuk debug state

## 🎯 Next Steps (Optional)

1. **Styling**: 
   - Tambah Tailwind CSS
   - Atau gunakan UI library (MUI, Ant Design)

2. **State Management**:
   - Zustand (sudah ada di admin)
   - Redux Toolkit
   - React Query untuk data fetching

3. **Features**:
   - Real-time attendance dengan WebSocket
   - Upload foto profile
   - Export data ke Excel
   - Print payslip
   - Dark mode toggle

4. **Testing**:
   - Vitest untuk unit testing
   - Cypress untuk E2E testing

## 📚 Folder Structure Detail

```
auth-frontend/
├── src/
│   ├── App.tsx              # Login page
│   ├── App.css              # Login styles
│   └── main.tsx             # Entry point

admin-frontend/
├── src/
│   ├── components/
│   │   ├── AuthGuard.tsx    # Route protection
│   │   ├── Layout.tsx       # Main layout
│   │   └── Sidebar.tsx      # Navigation
│   ├── pages/
│   │   ├── Dashboard.tsx    # Admin dashboard
│   │   └── UserManagement.tsx # CRUD users
│   └── App.tsx              # Router setup

hr-frontend/
├── src/
│   ├── components/
│   │   ├── AuthGuard.tsx
│   │   ├── Layout.tsx
│   │   └── Sidebar.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   └── EmployeeManagement.tsx
│   └── App.tsx

finance-frontend/
├── src/
│   ├── components/
│   │   ├── AuthGuard.tsx
│   │   ├── Layout.tsx
│   │   └── Sidebar.tsx
│   ├── pages/
│   │   └── Dashboard.tsx
│   └── App.tsx

employee-frontend/
├── src/
│   ├── components/
│   │   ├── AuthGuard.tsx
│   │   ├── Layout.tsx
│   │   └── Sidebar.tsx
│   ├── pages/
│   │   └── Dashboard.tsx    # Attendance
│   └── App.tsx
```

## 🤝 Contributing

Untuk menambah fitur baru:
1. Buat komponen di folder `components/`
2. Buat page di folder `pages/`
3. Tambahkan route di `App.tsx`
4. Update sidebar menu jika perlu

## 📞 Support

Jika ada error atau pertanyaan:
1. Cek console browser (F12)
2. Cek terminal yang running apps
3. Cek backend logs
4. Review dokumentasi API

---

**Selamat menggunakan HRIS System! 🎉**
