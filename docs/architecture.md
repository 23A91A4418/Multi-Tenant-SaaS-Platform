# System Architecture Document

## 1. System Architecture Overview

The Multi-Tenant SaaS Platform follows a **three-tier architecture** consisting of a frontend client, a backend API server, and a relational database. This architecture ensures separation of concerns, scalability, and maintainability.

Users interact with the system through a web browser. All requests are first handled by the frontend application, which is responsible for rendering the user interface, managing client-side routing, and handling authentication state.

The frontend communicates with the backend API server using RESTful HTTP requests. The backend server implements authentication, authorization, tenant isolation, business logic, and data validation. JSON Web Tokens (JWT) are used to authenticate requests and to identify the user, tenant, and role.

The backend communicates with a PostgreSQL database for persistent storage. All tenant-specific data is isolated using a `tenant_id` column at the database level. Super admin users are an exception and have `tenant_id` set to NULL.

The backend also exposes a health check endpoint used to verify application readiness and database connectivity. This endpoint is used by Docker health checks and automated evaluation scripts.

### System Architecture Diagram

A high-level system architecture diagram illustrating the interaction between the browser, frontend, backend, authentication flow, and database is provided below.

**Diagram location:**  
docs/images/system-architecture.png

---

## 2. Database Schema Design

The system uses a **shared database with shared schema** multi-tenancy model. All tenants share the same database and tables, while data isolation is enforced using a mandatory `tenant_id` column on all tenant-owned entities.

### Core Tables

- **tenants**
  - Stores organization-level information such as name, subdomain, status, subscription plan, and resource limits.
- **users**
  - Stores user accounts associated with tenants.
  - Supports roles: `super_admin`, `tenant_admin`, and `user`.
  - Super admin users have `tenant_id = NULL`.
- **projects**
  - Stores projects created within a tenant.
  - Linked to the user who created the project.
- **tasks**
  - Stores tasks associated with projects.
  - Supports assignment, priority, due dates, and status tracking.
- **audit_logs**
  - Stores records of all critical actions performed in the system for auditing and security purposes.

### Relationships and Constraints

- All tenant-owned tables include a `tenant_id` foreign key referencing `tenants.id`.
- Foreign key constraints are used to maintain referential integrity.
- Cascading deletes are applied where appropriate.
- Indexes are created on `tenant_id` columns to optimize query performance.
- Composite unique constraints are used where required (e.g., email uniqueness per tenant).

### Database ERD

An Entity Relationship Diagram (ERD) showing all tables, relationships, foreign keys, indexes, and tenant isolation columns is provided below.

**Diagram location:**  
docs/images/database-erd.png

---

## 3. API Architecture

The backend exposes a set of RESTful APIs organized by functional modules. All APIs return a consistent response structure and enforce authentication and authorization at the API level.

### Authentication APIs

| Method | Endpoint | Auth Required | Role |
|------|--------|--------------|------|
| POST | /api/auth/register-tenant | No | Public |
| POST | /api/auth/login | No | Public |
| GET | /api/auth/me | Yes | All authenticated users |
| POST | /api/auth/logout | Yes | All authenticated users |

---

### Tenant Management APIs

| Method | Endpoint | Auth Required | Role |
|------|--------|--------------|------|
| GET | /api/tenants/:tenantId | Yes | Tenant user or super_admin |
| PUT | /api/tenants/:tenantId | Yes | tenant_admin (limited), super_admin |
| GET | /api/tenants | Yes | super_admin only |

---

### User Management APIs

| Method | Endpoint | Auth Required | Role |
|------|--------|--------------|------|
| POST | /api/tenants/:tenantId/users | Yes | tenant_admin |
| GET | /api/tenants/:tenantId/users | Yes | Tenant users |
| PUT | /api/users/:userId | Yes | tenant_admin or self |
| DELETE | /api/users/:userId | Yes | tenant_admin |

---

### Project Management APIs

| Method | Endpoint | Auth Required | Role |
|------|--------|--------------|------|
| POST | /api/projects | Yes | Tenant users |
| GET | /api/projects | Yes | Tenant users |
| PUT | /api/projects/:projectId | Yes | tenant_admin or creator |
| DELETE | /api/projects/:projectId | Yes | tenant_admin or creator |

---

### Task Management APIs

| Method | Endpoint | Auth Required | Role |
|------|--------|--------------|------|
| POST | /api/projects/:projectId/tasks | Yes | Tenant users |
| GET | /api/projects/:projectId/tasks | Yes | Tenant users |
| PATCH | /api/tasks/:taskId/status | Yes | Tenant users |
| PUT | /api/tasks/:taskId | Yes | Tenant users |

---

## 4. Tenant Isolation and Security Enforcement

Tenant isolation is enforced at multiple layers:

- JWT tokens include `tenantId` and `role`.
- Middleware automatically filters all database queries using the tenant ID.
- Client-provided tenant IDs are never trusted.
- Super admin access bypasses tenant filtering only where explicitly allowed.

This layered enforcement ensures strong data isolation and prevents unauthorized cross-tenant access.

---

## 5. Health Check Architecture

The backend exposes a health check endpoint:
GET /api/health

This endpoint verifies:
- Backend service availability
- Database connectivity
- Completion of migrations and seed data loading

It returns a successful response only when the system is fully ready, enabling reliable Docker health checks and automated evaluation.

---

## 6. Summary

This architecture ensures scalability, security, and maintainability for a production-ready multi-tenant SaaS platform. By combining a clean separation of concerns, strict tenant isolation, and role-based access control, the system meets all functional and non-functional requirements defined for the project.
