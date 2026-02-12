# Multi-Tenant SaaS Platform

A full-stack Multi-Tenant SaaS application built using Node.js, Express, PostgreSQL, React (Vite), and Docker.  
This project demonstrates a scalable SaaS architecture with tenant-level data isolation, role-based access control, and containerized deployment.

---

## Documentation
- [API Documentation](docs/API_DOCS.md)

## Demo Video
[Watch the Demo Video](https://example.com/demo-video-placeholder)

---

## Overview

The platform supports multiple organizations (tenants) using a shared database model with strict tenant isolation.  
Each tenant manages its own users, projects, and tasks, while a super admin can oversee the system at a global level.

---

## Key Features

### Authentication and Authorization
- JWT-based authentication
- Role-Based Access Control (RBAC)
  - Super Admin
  - Tenant Admin
  - User
- Separate login flows for tenant users and super admins

### Multi-Tenancy
- Shared PostgreSQL database with shared schema
- Data isolation enforced using `tenant_id`
- No cross-tenant data access

### User Management
- Tenant admins can create, update, deactivate, and delete users
- User limits enforced per tenant

### Project Management
- Tenant admins can create, update, and delete projects
- Users can view projects assigned to their tenant

### Task Management
- Tasks can be created and assigned to users
- Task status updates supported
- Tasks are scoped to projects and tenants

### Dashboard
- Displays counts of users, projects, and tasks
- Shows recent projects and tasks
- Role-aware interface

### Docker Support
- Backend, frontend, and database fully containerized
- Single-command startup using Docker Compose

---

## Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt
- Docker

### Frontend
- React
- Vite
- Axios
- React Router

### Infrastructure
- Docker
- Docker Compose

---

## Architecture

- The frontend communicates with the backend via REST APIs.
- The backend handles authentication, authorization, tenant isolation, and business logic.
- PostgreSQL stores all tenant-scoped data.
- Docker Compose orchestrates all services.

---

## CORS Configuration

CORS is configured using an environment-based allowlist.  
Only the frontend origin is allowed, credentials are enabled, and JWT authorization headers are supported.

---

## Running the Application Using Docker

### Prerequisites
- Docker
- Docker Compose

### Steps

```bash
docker-compose up --build
