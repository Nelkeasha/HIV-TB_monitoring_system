# HIV & TB Patient Monitoring System — Backend API

A RESTful API built with Node.js, TypeScript, Express, PostgreSQL and Prisma to support community-level HIV and TB patient monitoring in Rwanda. Developed as a final year project at Adventist University of Central Africa (AUCA).

---

## Author

- **Name:** IGIHOZO Nelly
- **ID:** 26740
- **Email:** igihozonelly3@gmail.com
- **University:** Adventist University of Central Africa
- **Department:** Information Technology — Software Engineering
- **Case Study:** Dream Medical Center Hospital, Kigali

---

## Project Overview

Community Health Workers (CHWs) in Rwanda rely heavily on paper-based documentation when monitoring HIV and TB patients at the community level. This system replaces that manual process with a secure, offline-capable digital platform that enables:

- Real-time patient registration and history management
- Medication adherence tracking with automated alerts
- Home visit documentation and scheduling
- CHW medication stock management
- FHIR-based data synchronization with hospital EHR systems

---

## Tech Stack

| Layer         | Technology              |
|---------------|-------------------------|
| Runtime       | Node.js                 |
| Language      | TypeScript              |
| Framework     | Express.js              |
| Database      | PostgreSQL               |
| ORM           | Prisma                  |
| Auth          | JWT (JSON Web Tokens)   |
| API Docs      | Swagger UI (OpenAPI 3)  |
| FHIR Server   | HAPI FHIR               |

---

## Project Structure
```
hiv-tb-backend/
├── prisma/
│   └── schema.prisma          # Database models
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client
│   │   ├── env.ts             # Environment variables
│   │   └── swagger.ts         # Swagger configuration
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── patient.controller.ts
│   │   ├── visit.controller.ts
│   │   ├── adherence.controller.ts
│   │   └── stock.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT + role guard
│   │   └── error.middleware.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── patient.routes.ts
│   │   ├── visit.routes.ts
│   │   ├── adherence.routes.ts
│   │   └── stock.routes.ts
│   ├── services/
│   │   └── fhir.service.ts    # FHIR integration
│   ├── types/
│   │   ├── index.ts
│   │   └── express.d.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── logger.ts
│   │   └── response.ts
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- PostgreSQL v14 or higher
- npm v9 or higher

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/hiv-tb-backend.git
cd hiv-tb-backend
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env
```

Open `.env` and fill in your values:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/hiv_tb_db"
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
FHIR_SERVER_URL=http://localhost:8080/fhir
```

**4. Run database migrations**
```bash
npx prisma migrate dev --name init
```

**5. Start the development server**
```bash
npm run dev
```

---

## API Documentation

Once the server is running, open your browser at:
```
http://localhost:3000/api-docs
```

You will see the full interactive Swagger UI. Click **Authorize** and paste your JWT token to test protected endpoints.

---

## API Endpoints

### Auth
| Method | Endpoint               | Description            | Access  |
|--------|------------------------|------------------------|---------|
| POST   | /api/v1/auth/register  | Register a new user    | Public  |
| POST   | /api/v1/auth/login     | Login and get token    | Public  |
| GET    | /api/v1/auth/profile   | Get current profile    | All     |

### Patients
| Method | Endpoint               | Description            | Access          |
|--------|------------------------|------------------------|-----------------|
| POST   | /api/v1/patients       | Register a patient     | CHW, Admin      |
| GET    | /api/v1/patients       | List all patients      | All             |
| GET    | /api/v1/patients/:id   | Get one patient        | All             |
| PUT    | /api/v1/patients/:id   | Update patient         | CHW, Admin      |
| DELETE | /api/v1/patients/:id   | Deactivate patient     | Admin           |

### Visits
| Method | Endpoint                          | Description          | Access     |
|--------|-----------------------------------|----------------------|------------|
| POST   | /api/v1/visits                    | Record a visit       | CHW        |
| GET    | /api/v1/visits/patient/:id        | Get patient visits   | All        |
| GET    | /api/v1/visits/:id                | Get one visit        | All        |
| PUT    | /api/v1/visits/:id                | Update a visit       | CHW, Admin |

### Adherence
| Method | Endpoint                          | Description          | Access     |
|--------|-----------------------------------|----------------------|------------|
| POST   | /api/v1/adherence                 | Record adherence     | CHW        |
| GET    | /api/v1/adherence/alerts          | Get low adherence    | All        |
| GET    | /api/v1/adherence/patient/:id     | Get patient history  | All        |

### Stock
| Method | Endpoint                          | Description          | Access     |
|--------|-----------------------------------|----------------------|------------|
| POST   | /api/v1/stock                     | Add medication       | CHW        |
| GET    | /api/v1/stock                     | Get my stock         | CHW, Admin |
| PUT    | /api/v1/stock/:id                 | Update stock         | CHW        |
| PATCH  | /api/v1/stock/:id/dispense        | Dispense medication  | CHW        |
| DELETE | /api/v1/stock/:id                 | Delete stock item    | CHW, Admin |

---

## User Roles

| Role                | Description                                      |
|---------------------|--------------------------------------------------|
| chw                 | Community Health Worker — field data entry       |
| healthcare_provider | Clinician — view patients and reports            |
| admin               | Full system access and management                |

---

## Adherence Alerts

The system automatically calculates adherence percentage and flags patients:

| Level    | Percentage  | Action                        |
|----------|-------------|-------------------------------|
| Good     | 95% – 100%  | No action needed              |
| Warning  | 50% – 94%   | Schedule follow-up visit      |
| Critical | Below 50%   | Immediate intervention needed |

---

## Available Scripts

| Script          | Description                        |
|-----------------|------------------------------------|
| npm run dev     | Start development server           |
| npm run build   | Compile TypeScript to JavaScript   |
| npm run start   | Run compiled production server     |

---

## Prisma Commands

| Command                              | Description                    |
|--------------------------------------|--------------------------------|
| npx prisma migrate dev --name init   | Run migrations                 |
| npx prisma studio                    | Open visual database browser   |
| npx prisma generate                  | Regenerate Prisma client       |

---

## License

This project was developed for academic purposes at Adventist University of Central Africa (AUCA), February 2026.