# MedCore — Backend Foundation

MedCore is a medical education platform backend built with **NestJS**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**.

---

## 🏗 Foundation Architecture

* **Framework**: NestJS (v11) with TypeScript
* **ORM**: Prisma ORM (v6)
* **Database**: PostgreSQL
* **Environment Validation**: `class-validator` & `@nestjs/config`
* **Global Error Handling**: Custom `AllExceptionsFilter` structured JSON response
* **Core Models Initialized**:
  * `User` (`users`)
  * `StudentProfile` (`student_profiles`)
  * `Subject` (`subjects`)
  * `Topic` (`topics`)

---

## 📁 Project Structure

```
MedCore/
├── prisma/
│   ├── schema.prisma               # Initial database schema
│   └── migrations/
│       └── 0_init/
│           └── migration.sql       # Initial PostgreSQL SQL migration
├── src/
│   ├── common/
│   │   └── filters/
│   │       └── all-exceptions.filter.ts   # Global exception handler
│   ├── config/
│   │   └── env.validation.ts             # Environment variable validation
│   ├── modules/
│   │   └── health/                       # App & DB Health Check endpoint
│   ├── prisma/
│   │   ├── prisma.service.ts             # Lifecycle-managed Prisma client
│   │   └── prisma.module.ts              # Global Prisma module
│   ├── app.module.ts                     # Root NestJS module
│   └── main.ts                           # Application bootstrap
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Setup & Getting Started

### 1. Prerequisites
* Node.js (v18+)
* PostgreSQL Database instance

### 2. Environment Setup
Copy the example environment file and configure your local PostgreSQL connection string:

```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/medcore_db?schema=public"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Migration
Generate Prisma Client:
```bash
npx prisma generate
```

Apply database migrations to your PostgreSQL database:
```bash
npx prisma migrate dev
```

### 5. Running the Application

**Development Mode:**
```bash
npm run start:dev
```

**Production Build:**
```bash
npm run build
npm run start:prod
```

### 6. Verify Health Endpoint
Once started, visit `http://localhost:3000/health`:
```json
{
  "status": "ok",
  "timestamp": "2026-08-25T09:45:00.000Z",
  "service": "MedCore Backend API",
  "database": "connected"
}
```
