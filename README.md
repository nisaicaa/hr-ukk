# HR-UKK (Human Resource Management System)

HR-UKK adalah aplikasi Human Resource Management System (HRIS) yang berfokus
pada pengelolaan data karyawan dan proses HR dasar dengan sistem role-based access.

Project ini dibuat sebagai aplikasi HR standalone dan tidak mencakup modul
Finance atau ERP lainnya (kecuali payroll dashboard sebagai dummy).

Repository ini menggunakan pendekatan monorepo untuk mengelola backend dan
frontend dalam satu project.

---

## 🚀 Quick Start

### Super Cepat (3 Langkah):
1. **Install dependencies**: Double click `install-frontend.bat`
2. **Start backend**: `cd backend && npm run dev`
3. **Start frontends**: Double click semua file `run-*.bat`

Baca detail: [QUICK_START.md](QUICK_START.md)

---

## Tech Stack

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL / MySQL
- JWT Authentication
- TypeScript

### Frontend (Monorepo - 5 Apps)
- React 18 + TypeScript
- Vite (Build tool)
- React Router v6
- Axios (HTTP client)
- Pure CSS (Modern UI)

---

## 📁 Struktur Repository

```
HR-UKK/
├─ backend/
│  ├─ prisma/
│  │  ├─ schema.prisma
│  │  ├─ seed.ts
│  │  └─ migrations/
│  └─ src/
│     ├─ controllers/
│     ├─ middlewares/
│     ├─ routes/
│     ├─ service/
│     ├─ utils/
│     ├─ app.ts
│     └─ server.ts
│
├─ frontend/
│  ├─ apps/
│  │  ├─ auth-frontend/       # Port 3000 - Login
│  │  ├─ admin-frontend/      # Port 3001 - Admin Dashboard
│  │  ├─ hr-frontend/         # Port 3002 - HR Dashboard
│  │  ├─ finance-frontend/    # Port 3003 - Finance Dashboard
│  │  └─ employee-frontend/   # Port 3004 - Employee Dashboard
│  │
│  └─ services/               # Shared utilities
│     ├─ api/
│     ├─ helper/
│     ├─ handler/
│     ├─ constant/
│     └─ lang/
│
├─ install-frontend.bat       # Auto install all apps
├─ run-auth.bat              # Run login app
├─ run-admin.bat             # Run admin app
├─ run-hr.bat                # Run HR app
├─ run-finance.bat           # Run finance app
├─ run-employee.bat          # Run employee app
│
├─ QUICK_START.md            # Quick start guide
├─ FRONTEND_README.md        # Detailed frontend docs
└─ ARCHITECTURE.md           # System architecture
```
│     ├─ api/
│     ├─ config/
│     ├─ constant/
│     ├─ handler/
│     ├─ helper/
│     └─ lang/
│
├─ README.md
└─ .env.example

---

## Requirement

Pastikan sudah terinstall:
- Node.js >= 18
- npm
- Database (PostgreSQL atau MySQL)

---

## Backend Setup

### 1. Masuk ke folder backend
cd backend

### 2. Install dependency
npm install


### 3. Setup environment
Copy file environment:
cp .env.example .env

Isi konfigurasi database di file `.env`, contoh:
DATABASE_URL="postgresql://postgres:anisa252502@localhost:5432/hr_ukk"
PORT=7000


---

## Database Migration (Prisma)

### 1. Generate Prisma Client
npx prisma generate


### 2. Jalankan migration


npx prisma migrate dev --name init


Perintah ini akan:
- Membuat tabel sesuai schema.prisma
- Menyimpan file migration
- Mengupdate database

---

## Database Seeding

### Jalankan seed data


npx prisma db seed


Seed data biasanya berisi:
- User Admin HR
- User HR Staff
- Master Department
- Master Position
- Data Employee dummy

File seed dapat disesuaikan di:


backend/prisma/seed.ts


---

## Menjalankan Backend



npm run dev


Backend akan berjalan di:


http://localhost:3001


---

## Frontend Setup

### 1. Masuk ke folder frontend


cd frontend


### 2. Install dependency


npm install


---

## Menjalankan Frontend

Setiap frontend dijalankan terpisah berdasarkan role.

### Admin HR


cd frontend/apps/admin-frontend
npm run dev


### HR Staff


cd frontend/apps/hr-frontend
npm run dev


### Employee


cd frontend/apps/employee-frontend
npm run dev


Akses frontend melalui browser sesuai port masing-masing aplikasi
(misal http://localhost:3000).

---

## Authentication & Authorization

- Authentication dibuat sederhana
- Role-based access:
  - Admin HR
  - HR Staff
  - Employee
- Tidak menggunakan identity service terpisah

---

## Development Flow

1. Jalankan database
2. Jalankan migration
3. Jalankan seed
4. Jalankan backend
5. Jalankan frontend sesuai role

---

## Catatan

Project ini hanya berfokus pada modul HR.
Modul lain seperti Finance atau ERP tidak termasuk dalam scope project.

---

## Lisensi

Project ini digunakan untuk kebutuhan pembelajaran / UKK