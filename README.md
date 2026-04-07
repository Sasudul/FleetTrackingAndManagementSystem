# Fleet Tracking & Management System

A full-stack Fleet Tracking & Management System built with a modern web frontend and a secure backend API. The project combines a **React + TypeScript (Vite)** frontend with a **Spring Boot (Java 17, Maven)** backend and a **PostgreSQL** database. It is designed to support fleet operations and real-time/interactive map-based workflows (Google Maps APIs).

> Repo: `Sasudul/FleetTrackingAndManagementSystem`

---

## Tech Stack

### Frontend
- **React (TypeScript)** with **Vite**
- **React Router**
- **Axios**
- **Tailwind CSS**
- JWT utilities: **jwt-decode**
- Icons: **lucide-react**

### Backend
- **Spring Boot** (Maven)
- **Spring Web (WebMVC)**
- **Spring Data JPA**
- **Spring Security**
- **Validation**
- **JWT (jjwt)**
- **PostgreSQL driver**

### Database
- **PostgreSQL**
- SQL seed/schema file: `backend/fleet_db.sql`

---

## Repository Structure

```text
.
├── backend/
│   ├── fleet-tracking/        # Spring Boot backend (Maven)
│   └── fleet_db.sql           # PostgreSQL SQL script
└── frontend/                  # React + TypeScript (Vite) frontend
```

---

## Getting Started

### Prerequisites
- **Node.js + npm** (for the frontend)
- **Java 17** (for the backend)
- **PostgreSQL** (for the database)

---

## Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Common scripts:
- `npm run dev` – start the dev server
- `npm run build` – build for production
- `npm run preview` – preview the production build
- `npm run lint` – run ESLint

---

## Backend Setup (Spring Boot)

```bash
cd backend/fleet-tracking
./mvnw spring-boot:run
```

On Windows:
```bash
cd backend/fleet-tracking
mvnw.cmd spring-boot:run
```

Build a JAR:
```bash
cd backend/fleet-tracking
./mvnw clean package
```

---

## Database Setup (PostgreSQL)

1. Create a PostgreSQL database (example name: `fleet_db`).
2. Run the SQL script:

```bash
psql -U <username> -d <database_name> -f backend/fleet_db.sql
```

3. Configure your backend database connection (typically in `application.properties` / `application.yml`) with your database URL, username, and password.

---

## Authentication

The backend uses **Spring Security** and **JWT** for authentication. The frontend includes JWT decoding to support authenticated sessions.

---

## Configuration Notes

This project may require configuration values such as:
- Database credentials (PostgreSQL)
- JWT secret / signing configuration
- Google Maps API key (for map features)

Recommended approach:
- Store secrets in environment variables and/or local config files that are **not committed** to Git.
