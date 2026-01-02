# Technical Specification

## 1. Project Structure

This section describes the complete folder structure for both the backend and frontend applications and explains the purpose of each major component.

---

## Backend Structure

backend/
├── src/
│ ├── controllers/
│ ├── routes/
│ ├── middleware/
│ ├── services/
│ ├── models/
│ ├── utils/
│ ├── config/
│ └── app.js
├── migrations/
├── seeds/
├── tests/
├── Dockerfile
├── package.json
└── .env

### Backend Folder Descriptions

- **controllers/**  
  Contains request-handling logic for each API endpoint. Controllers validate input, invoke service logic, and return consistent API responses.

- **routes/**  
  Defines API route mappings and connects endpoints to their respective controllers.

- **middleware/**  
  Contains reusable middleware such as JWT authentication, role-based authorization, tenant isolation enforcement, input validation, and error handling.

- **services/**  
  Implements core business logic, database transactions, and audit logging. This layer keeps controllers lightweight.

- **models/**  
  Defines database models and schema mappings used by the application.

- **utils/**  
  Contains helper utilities such as password hashing, JWT token generation, and reusable constants.

- **config/**  
  Handles configuration such as database connection settings and environment variable loading.

- **migrations/**  
  Contains database migration files used to create and update database schema in a controlled and versioned manner.

- **seeds/**  
  Contains seed scripts to populate the database with initial data such as super admin users, tenants, projects, and tasks.

- **tests/**  
  Includes unit and integration tests for API endpoints and business logic.

- **app.js**  
  The main application entry point that initializes middleware, routes, and starts the HTTP server.

---

## Frontend Structure
frontend/
├── src/
│ ├── components/
│ ├── pages/
│ ├── services/
│ ├── context/
│ ├── hooks/
│ ├── routes/
│ ├── utils/
│ ├── App.js
│ └── main.js
├── public/
├── Dockerfile
├── package.json
└── .env

### Frontend Folder Descriptions

- **components/**  
  Reusable UI components such as buttons, forms, modals, and navigation bars.

- **pages/**  
  Page-level components corresponding to application routes such as Login, Dashboard, Projects, and Users.

- **services/**  
  Centralized API service layer responsible for making HTTP requests to the backend using Axios or Fetch.

- **context/**  
  React context providers for managing global state such as authentication and user information.

- **hooks/**  
  Custom React hooks for reusable logic like authentication checks and API calls.

- **routes/**  
  Defines protected and public routes using React Router.

- **utils/**  
  Helper functions for form validation, token storage, and formatting.

- **App.js**  
  Root application component that sets up routing and global providers.

- **main.js**  
  Application bootstrap file.

---

## 2. Development Setup Guide

### Prerequisites

- Node.js (version 18 or higher)
- Docker and Docker Compose
- Git

---

### Environment Variables

The backend application uses environment variables for configuration. These variables are defined in a `.env` file or directly in `docker-compose.yml`.

Required variables include:

- **DB_HOST** – Database host
- **DB_PORT** – Database port
- **DB_NAME** – Database name
- **DB_USER** – Database user
- **DB_PASSWORD** – Database password
- **JWT_SECRET** – Secret key for JWT signing
- **JWT_EXPIRES_IN** – JWT expiration duration
- **PORT** – Backend server port
- **FRONTEND_URL** – Frontend URL for CORS configuration

---

### Installation Steps (Local Development)

1. Clone the repository:
git clone <repository-url>

2. Install backend dependencies:
cd backend
npm install

3. Install frontend dependencies:
cd ../frontend
npm install

---

### Running the Application Locally

#### Backend
cd backend
npm run dev

#### Frontend
cd frontend
npm start

---

### Running with Docker (Recommended)

The entire application can be started using a single command:

docker-compose up -d

This command starts the database, backend, and frontend services, runs database migrations and seed data automatically, and exposes the application on predefined ports.

---

### Running Database Migrations and Seeds

Database migrations and seed scripts are configured to run automatically when the backend service starts inside Docker. No manual commands are required during evaluation.

---

## 3. Summary

This technical specification defines the project structure and setup required to develop, run, and evaluate the Multi-Tenant SaaS Platform. By following this structure and setup process, the system remains maintainable, scalable, and aligned with production-ready best practices.
