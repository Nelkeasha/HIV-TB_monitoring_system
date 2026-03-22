# HIV & TB Patient Monitoring System — Backend API

A RESTful API built with **Node.js**, **TypeScript**, **Express**, **PostgreSQL**, and **Prisma** to support community-level HIV and TB patient monitoring in Rwanda. Developed as a final year project at Adventist University of Central Africa (AUCA).

---

## 📋 Author

- **Name:** IGIHOZO Nelly
- **ID:** 26740
- **Email:** igihozonelly3@gmail.com
- **University:** Adventist University of Central Africa
- **Department:** Information Technology — Software Engineering
- **Case Study:** Dream Medical Center Hospital, Kigali

---

## 🎯 Project Overview

Community Health Workers (CHWs) in Rwanda face significant challenges with paper-based patient documentation. This system modernizes patient monitoring by providing a secure, offline-capable digital platform for:

- 📝 **Patient Management** — Register, track, and manage HIV/TB patient records
- 💊 **Medication Adherence** — Monitor treatment adherence with automated low-compliance alerts
- 🏥 **Home Visit Documentation** — Record and schedule community health worker visits
- 📦 **Medication Inventory** — Track medication stock levels with expiry alerts
- 🔄 **EHR Integration** — FHIR-based data synchronization with hospital systems
- 🔐 **Role-Based Access Control** — Different system levels for CHWs, providers, and administrators

---

## 🛠️ Tech Stack

| Layer         | Technology                    |
|---------------|-------------------------------|
| **Runtime**   | Node.js (v18+)                |
| **Language**  | TypeScript                    |
| **Framework** | Express.js                    |
| **Database**  | PostgreSQL                    |
| **ORM**       | Prisma                        |
| **Auth**      | JWT (JSON Web Tokens)         |
| **API Docs**  | Swagger UI (OpenAPI 3)        |
| **Security**  | Helmet, CORS, Rate Limiting   |

---

## 📁 Project Structure
```
hiv-tb-backend/
├── prisma/
│   ├── schema.prisma          # Database models & relationships
│   └── migrations/            # Database version history
├── src/
│   ├── config/
│   │   ├── database.ts        # Prisma client initialization
│   │   ├── env.ts             # Environment variable validation
│   │   └── swagger.ts         # Swagger/OpenAPI documentation
│   ├── controllers/           # Request handlers for each module
│   │   ├── auth.controller.ts
│   │   ├── patient.controller.ts
│   │   ├── visit.controller.ts
│   │   ├── adherence.controller.ts
│   │   └── stock.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts # JWT authentication & role validation
│   │   └── error.middleware.ts
│   ├── routes/
│   │   ├── index.ts           # Route aggregation
│   │   ├── auth.routes.ts
│   │   ├── patient.routes.ts
│   │   ├── visit.routes.ts
│   │   ├── adherence.routes.ts
│   │   └── stock.routes.ts
│   ├── services/
│   │   └── fhir.service.ts    # FHIR protocol integration
│   ├── types/
│   │   ├── index.ts
│   │   └── express.d.ts       # Express request type extensions
│   ├── utils/
│   │   ├── jwt.ts             # Token generation & validation
│   │   ├── logger.ts          # Application logging
│   │   └── response.ts        # Standard response formatting
│   ├── app.ts                 # Express app configuration
│   └── server.ts              # Server entry point
├── .env.example               # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v14 or higher ([Download](https://www.postgresql.org/download/))
- **npm** v9 or higher (included with Node.js)

### Installation Steps

**1. Clone the repository**
```bash
git clone https://github.com/Nelkeasha/HIV-TB_monitoring_system.git
cd hiv-tb-backend
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and provide your configuration:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/hiv_tb_db"

# JWT Authentication (JWT_SECRET should be a strong random string)
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# External Services (Optional)
FHIR_SERVER_URL=http://localhost:8080/fhir
```

**4. Initialize the database**
```bash
npx prisma migrate dev --name init
```

This command will:
- Create the database schema
- Run all migrations
- (Optional) Generate sample data

**5. Start the development server**
```bash
npm run dev
```

The server will start at `http://localhost:3000`

---

## 📚 API Documentation

### Interactive Swagger UI

Once the server is running, open your browser and navigate to:
```
http://localhost:3000/api-docs
```

You will see the **complete, interactive Swagger UI** with:
- ✅ Full endpoint documentation with request/response examples
- ✅ Real-time API testing directly from the browser
- ✅ Automatic schema validation and error handling
- ✅ JWT authorization support — Click **Authorize** and paste your token to test protected endpoints

The Swagger documentation reflects all available endpoints across the system:
- **Authentication** — User registration, login, and profile management
- **Patients** — Patient registration, updates, and patient history
- **Home Visits** — Visit documentation and scheduling
- **Medication Adherence** — Adherence tracking and alerts
- **Stock Management** — Medication inventory and dispensing

All endpoint details, required parameters, authentication requirements, and response examples are available in the interactive Swagger documentation.

---

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication:

1. **Register** a new user at `/api/v1/auth/register`
2. **Login** at `/api/v1/auth/login` to receive a JWT token
3. **Include** the token in the `Authorization` header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN_HERE
   ```

For API testing in Swagger UI:
1. Click the **Authorize** button at the top
2. Paste your JWT token (without the "Bearer " prefix)
3. Click **Authorize** to apply the token to all requests
4. Test endpoints normally

---

## 👥 User Roles

Different roles have different permissions within the system:

| Role                | Description                                      |
|---------------------|--------------------------------------------------|
| **chw**             | Community Health Worker — field data entry and monitoring |
| **healthcare_provider** | Clinician — view patients, records, and generate reports |
| **admin**           | Full system access — manage users, data, and configurations |

---

## 🔄 Available Commands

| Command                              | Description                      |
|--------------------------------------|----------------------------------|
| `npm run dev`                        | Start development server (with hot-reload) |
| `npm run build`                      | Compile TypeScript to JavaScript |
| `npm start`                          | Start production server          |
| `npx prisma migrate dev --name <name>` | Create a new database migration |
| `npx prisma studio`                  | Open visual database browser     |
| `npx prisma generate`                | Regenerate Prisma client types   |

---

## 📋 Features

- ✅ **Secure Authentication** — JWT-based with role-based access control
- ✅ **Patient Monitoring** — Comprehensive patient record management
- ✅ **Medication Tracking** — Adherence monitoring and stock management
- ✅ **Automated Alerts** — Low adherence and low stock notifications
- ✅ **API Documentation** — Interactive Swagger UI for all endpoints
- ✅ **Data Validation** — TypeScript types and Zod/Joi validation
- ✅ **Security** — Helmet, CORS, rate limiting, and JWT protection
- ✅ **FHIR Compatibility** — Standardized health data exchange
- ✅ **Offline Support** — Designed for offline work with sync capabilities

---

## 🐛 Troubleshooting

**Database Connection Error?**
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env` matches your setup
- Create the database manually if needed

**Port Already in Use?**
- Change `PORT` in `.env` to an available port
- Or kill the process using the current port

**Prisma Client Error?**
```bash
npx prisma generate
```

**Dependencies Issue?**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📜 License

This project was developed for academic purposes at **Adventist University of Central Africa (AUCA)**, February 2026.

---

## 📞 Support & Questions

For issues, questions, or contributions, please open an issue on the GitHub repository or contact the author at **igihozonelly3@gmail.com**

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