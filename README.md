# Vacation Request System

A comprehensive vacation management system with multi-level approval workflow, organization chart, and PDF export capabilities.

![Nuxt](https://img.shields.io/badge/Nuxt-3.x-00DC82?style=flat-square&logo=nuxt.js)
![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?style=flat-square&logo=sqlite)
![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)

## Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [User Roles](#-user-roles)
- [API Reference](#-api-reference)
- [Database](#-database)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

---

## Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **Multi-level Approval** | Employee → Team Lead → Manager workflow |
| **Vacation Balance Tracking** | 30 days default + carryover from previous year |
| **Half-day Rules** | Special days (Christmas Eve, New Year's Eve, etc.) |
| **PDF Export** | Vacation overviews with balance summaries |
| **Organization Chart** | Visual company structure with PDF export |
| **Year Transition** | Automatic carryover calculation with manager review |
| **Vacation Calendar** | Team-wide calendar view with export |
| **Multi-language** | German, English, Portuguese (Brazil) |
| **Theme Switching** | Light (Business) and Dark themes |

### Role-based Access Control

```
                    +------------------+
                    |     Manager      |
                    | (Final Approval) |
                    +--------+---------+
                             |
              +--------------+--------------+
              |              |              |
     +--------+--------+  +--+---+  +-------+-------+
     |    Team Lead    |  |Office|  |   SysAdmin    |
     |(First Approval) |  |(View)|  |   (Admin)     |
     +--------+--------+  +------+  +---------------+
              |
    +---------+---------+
    |         |         |
+---+---+ +---+---+ +---+---+
|Employee| |Employee| |Employee|
+-------+ +-------+ +-------+
```

### Administrative Features (Manager)

- Company-wide vacation policies (half-days)
- Vacation carryover management
- Organization chart editing
- Team assignments
- Annual reports generation
- User management

---

## Screenshots

### Vacation Request Dashboard
```
+------------------------------------------------------------------+
|  Vacation Request System                    [DE] [EN] [PT] [User]|
+------------------------------------------------------------------+
| [My Request] [Team Lead] [Manager] [Rules] [Users] [Org] [Reports]|
+------------------------------------------------------------------+
|                                                                   |
|  +------------------+   +-------------------------------------+   |
|  | Vacation Account |   |         New Vacation Request        |   |
|  |------------------|   |-------------------------------------|   |
|  | Total:    32 days|   | From: [2026-07-15]                  |   |
|  | Used:     10 days|   | To:   [2026-07-26]                  |   |
|  | Remaining:22 days|   | Reason: [Family vacation        ]   |   |
|  | (incl. 2 carryover)|   |                                     |   |
|  +------------------+   | [Submit Request]                    |   |
|                         +-------------------------------------+   |
+------------------------------------------------------------------+
```

---

## Tech Stack

### Frontend
- **Framework:** [Nuxt 3](https://nuxt.com/) (Vue 3)
- **Language:** TypeScript
- **Styling:** CSS Custom Properties (Themes)
- **PDF Generation:** jsPDF + jsPDF-AutoTable
- **Icons:** Custom icon system

### Backend
- **Runtime:** Nitro (Nuxt Server)
- **Database:** SQLite (better-sqlite3)
- **Authentication:** Cookie-based with bcrypt

### Development
- **Package Manager:** npm
- **Linting:** ESLint
- **Build Tool:** Vite

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/vacation-system.git
cd vacation-system

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

**Default Admin Login:**
- Username: `admin`
- Password: `admin123`

---

## Installation

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vacation-system.git
   cd vacation-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**

   The SQLite database is automatically created on first run with:
   - Default admin user (admin/admin123)
   - Required tables and indexes

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NUXT_PUBLIC_APP_NAME=Vacation Request System

# Database (default: SQLite)
DATABASE_TYPE=sqlite

# For MS SQL Server (optional)
MSSQL_HOST=localhost
MSSQL_PORT=1433
MSSQL_DATABASE=vacation_db
MSSQL_USER=sa
MSSQL_PASSWORD=your_password

# For Oracle (optional)
ORACLE_USER=vacation_user
ORACLE_PASSWORD=your_password
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
```

### Vacation Settings

| Setting | Default | Location |
|---------|---------|----------|
| Vacation days per year | 30 | User creation |
| Half-day rules | Configurable | Manager → Vacation Rules |
| Carryover | Automatic | Year Transition |

---

## User Roles

### Role Comparison

| Feature | Employee | Team Lead | Manager | Office | SysAdmin |
|---------|:--------:|:---------:|:-------:|:------:|:--------:|
| Submit vacation requests | yes | yes | yes | yes | - |
| View own requests | yes | yes | yes | yes | - |
| Approve team requests | - | yes | yes | - | - |
| Final approval | - | - | yes | - | - |
| Cancel approved vacations | - | - | yes | - | - |
| View all requests | - | - | yes | yes | - |
| Manage users | - | - | yes | - | - |
| Manage half-day rules | - | - | yes | - | - |
| Year transition | - | - | yes | - | - |
| Generate reports | - | - | yes | yes | - |
| Database admin | - | - | - | - | yes |

### Default Test Users

| Username | Password | Name | Role |
|----------|----------|------|------|
| admin | admin123 | Admin User | SysAdmin |
| sos | sos | Stefan Schulz | Manager |
| meyer | office123 | Sandra Meyer | Office |
| mueller | teamleiter1 | Thomas Mueller | Team Lead |
| mustermann | password123 | Max Mustermann | Employee |

---

## API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/change-password` | POST | Change password |

### Vacation Requests

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vacation-requests` | GET | List all requests |
| `/api/vacation-requests` | POST | Create new request |
| `/api/vacation-requests/:id` | PATCH | Update request (approve/reject) |
| `/api/vacation/:id/cancel` | POST | Cancel approved vacation |

### Users

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users` | GET | List all users |
| `/api/users` | POST | Create new user |
| `/api/users/:username` | PATCH | Update user |
| `/api/users/:username/reset-password` | POST | Reset password |
| `/api/users/:username/status` | PATCH | Activate/deactivate |

### Organization

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/organization` | GET | Get org structure |
| `/api/organization/:userId` | PATCH | Update team assignment |

### Reports

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reports/annual-statistics` | GET | Annual statistics |
| `/api/reports/annual-employee-details` | GET | Employee details |

---

## Database

### Schema Overview

```
+------------------+     +----------------------+
|      users       |     |   vacation_requests  |
+------------------+     +----------------------+
| id (PK)          |<-+  | id (PK)              |
| username (UK)    |  |  | userId (FK)          |--+
| password         |  |  | displayName          |  |
| firstName        |  |  | startDate            |  |
| lastName         |  |  | endDate              |  |
| role             |  |  | reason               |  |
| vacationDays     |  |  | status               |  |
| isActive         |  |  | teamleadApprovalDate |  |
| createdAt        |  |  | managerApprovalDate  |  |
| updatedAt        |  |  | cancelReason         |  |
+------------------+  |  | createdAt            |  |
        ^             |  +----------------------+  |
        |             |                            |
        |             |  +----------------------+  |
        |             +--| vacation_exceptions  |<-+
        |                +----------------------+
        |                | id (PK)              |
        |                | vacationRequestId(FK)|
        |                | userId (FK)          |
        |                | date                 |
        |                | deduction            |
        |                | reason               |
        |                | createdBy            |
        |                +----------------------+
        |
        |  +------------------+     +------------------+
        +--| organization     |     |    carryover     |
        |  +------------------+     +------------------+
        |  | id (PK)          |     | id (PK)          |
        +--| userId (FK, UK)  |     | userId (FK)      |--+
        +--| teamleadId (FK)  |     | year             |  |
           | createdAt        |     | calculatedDays   |  |
           +------------------+     | approvedDays     |  |
                                    | reason           |  |
           +------------------+     | status           |  |
           | half_day_rules   |     | createdAt        |  |
           +------------------+     +------------------+  |
           | id (PK)          |                           |
           | date (UK)        |                           |
           | description      |<--------------------------+
           | createdAt        |
           +------------------+
```

### Database Migration

For enterprise deployments, migration scripts are available for:
- **Microsoft SQL Server** - See `docs/MIGRATION_SCRIPTS_MSSQL.sql`
- **Oracle Database** - See `docs/MIGRATION_SCRIPTS_ORACLE.sql`

Full migration guide: `docs/DATABASE_MIGRATION_GUIDE.md`

---

## Deployment

### Production Build

```bash
# Build the application
npm run build

# Preview production build locally
npm run preview

# Or start with Node.js
node .output/server/index.mjs
```

### Docker (Coming Soon)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY .output .output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### Environment Recommendations

| Environment | Database | Notes |
|-------------|----------|-------|
| Development | SQLite | Default, no setup required |
| Small Teams (<50) | SQLite | Sufficient for most use cases |
| Medium Teams | MS SQL Server | Better concurrency |
| Enterprise | Oracle | Full enterprise features |

---

## Documentation

Detailed documentation is available in the `/docs` folder:

### Technical Documentation

| Document | Description |
|----------|-------------|
| [DATABASE_MIGRATION_GUIDE.md](docs/Migration/DATABASE_MIGRATION_GUIDE.md) | Guide for migrating to MS SQL or Oracle |
| [MIGRATION_SCRIPTS_MSSQL.sql](docs/Migration/MIGRATION_SCRIPTS_MSSQL.sql) | MS SQL Server schema and procedures |
| [MIGRATION_SCRIPTS_ORACLE.sql](docs/Migration/MIGRATION_SCRIPTS_ORACLE.sql) | Oracle schema and packages |

### User Guides

| Role | Guide |
|------|-------|
| Employee | [USER_GUIDE_EMPLOYEE.md](public/docs/USER_GUIDE_EMPLOYEE.md) |
| Team Lead | [USER_GUIDE_TEAMLEAD.md](public/docs/USER_GUIDE_TEAMLEAD.md) |
| Manager | [USER_GUIDE_MANAGER.md](public/docs/USER_GUIDE_MANAGER.md) |
| Office | [USER_GUIDE_OFFICE.md](public/docs/USER_GUIDE_OFFICE.md) |
| SysAdmin | [USER_GUIDE_SYSADMIN.md](public/docs/USER_GUIDE_SYSADMIN.md) |

---

## Project Structure

```
vacation-system/
├── app/
│   ├── assets/css/
│   │   └── main.css              # Global styles
│   ├── components/
│   │   ├── VacationRequestForm.vue
│   │   ├── VacationApprovalCard.vue
│   │   ├── VacationCalendar.vue
│   │   ├── OrganizationChart.vue
│   │   ├── YearTransitionPanel.vue
│   │   └── ...
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useVacationRequests.ts
│   │   ├── useOrganization.ts
│   │   └── ...
│   ├── config/
│   │   ├── icons.ts
│   │   └── i18n/
│   │       ├── de.ts
│   │       ├── en.ts
│   │       └── pt-br.ts
│   ├── pages/
│   │   ├── index.vue
│   │   ├── login.vue
│   │   └── vacation.vue
│   └── utils/
│       ├── dateHelpers.ts
│       ├── holidays.ts
│       └── pdf.ts
├── server/
│   ├── api/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── vacation-requests/
│   │   ├── organization/
│   │   ├── carryover/
│   │   ├── half-day-rules/
│   │   ├── year-transition/
│   │   ├── reports/
│   │   └── admin/
│   ├── database/
│   │   ├── db.ts
│   │   └── types.ts
│   └── utils/
│       └── db.ts
├── docs/
│   ├── DATABASE_MIGRATION_GUIDE.md
│   ├── MIGRATION_SCRIPTS_MSSQL.sql
│   └── MIGRATION_SCRIPTS_ORACLE.sql
├── public/
│   ├── docs/
│   │   └── USER_GUIDE_*.md
│   └── Logo_*.png
├── nuxt.config.ts
├── package.json
└── README.md
```

---

## Security

### Current Implementation

- Password hashing with bcrypt (10 rounds)
- Cookie-based authentication
- Role-based access control
- Input validation on API endpoints

### Production Recommendations

- [ ] Enable HTTPS
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Set secure cookie flags
- [ ] Implement audit logging
- [ ] Regular security updates

---

## Roadmap

- [ ] Email notifications for approvals/rejections
- [ ] Calendar integration (iCal export)
- [ ] Mobile responsive design improvements
- [ ] Docker deployment support
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Automated testing suite
- [ ] Localization for additional languages

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is proprietary software. All rights reserved.

---

## Authors

- **Daniel Ertl** - Lead Developer
- **Claude (Anthropic)** - AI Assistant

---

## Acknowledgments

- [Nuxt.js](https://nuxt.com/) - The Intuitive Vue Framework
- [jsPDF](https://github.com/parallax/jsPDF) - PDF Generation
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite Driver

---

**Version:** 2.0.0
**Last Updated:** January 2026
