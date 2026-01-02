# Research Document

## 1. Multi-Tenancy Architecture Analysis

### Introduction

Multi-tenancy is a fundamental architectural pattern used in Software-as-a-Service (SaaS) applications, where a single application instance serves multiple organizations (tenants) while ensuring strict data isolation, security, and performance. Choosing the correct multi-tenancy approach is critical because it affects scalability, operational complexity, cost, and the overall security posture of the system. This section analyzes three commonly used multi-tenancy architectures and justifies the approach selected for this project.

---

### Approach 1: Shared Database with Shared Schema (Tenant ID Column)

In the shared database with shared schema approach, all tenants use the same database and the same set of tables. Each table contains a `tenant_id` column that identifies which tenant owns a particular record. All queries must explicitly filter data using this `tenant_id`.

**Advantages**
- Highly cost-effective, as only one database instance is required
- Simplifies infrastructure management and deployment
- Easy to scale horizontally to support many tenants
- Centralized schema management and migrations
- Commonly used in early and mid-stage SaaS products

**Disadvantages**
- Risk of data leakage if tenant filtering is not enforced correctly
- Requires strict discipline in backend query design
- Tenant-specific backups and restores are more complex
- Regulatory compliance can be harder in strict isolation scenarios

This approach relies heavily on application-level enforcement of data isolation, making secure coding practices and middleware enforcement essential.

---

### Approach 2: Shared Database with Separate Schema per Tenant

In this approach, all tenants share a single database instance, but each tenant has its own dedicated schema within that database. Each schema contains its own set of tables.

**Advantages**
- Better data isolation compared to shared schema
- Easier tenant-level backup and restore
- Reduced risk of cross-tenant data access
- Allows partial tenant-specific customization

**Disadvantages**
- Increased operational complexity as tenant count grows
- Database migrations must be applied to multiple schemas
- Automation becomes harder during tenant onboarding
- Database performance may degrade with many schemas

This approach is suitable for SaaS platforms with a moderate number of tenants where isolation requirements are stronger than basic shared-schema models.

---

### Approach 3: Separate Database per Tenant

In the separate database per tenant approach, each tenant has its own dedicated database. The application dynamically connects to the correct database based on the tenant context.

**Advantages**
- Strongest possible data isolation
- Simplified regulatory compliance and auditing
- Independent scaling, backup, and restore per tenant
- Clear separation of tenant data at infrastructure level

**Disadvantages**
- High infrastructure and operational cost
- Complex DevOps and monitoring requirements
- Difficult to scale to a large number of tenants
- Requires advanced database orchestration and connection pooling

This model is typically used in enterprise SaaS platforms or highly regulated industries such as finance and healthcare.

---

### Comparison Table

| Criteria | Shared DB + Shared Schema | Shared DB + Separate Schema | Separate Database |
|--------|---------------------------|-----------------------------|-------------------|
| Cost | Low | Medium | High |
| Scalability | High | Medium | Low |
| Data Isolation | Medium | High | Very High |
| Operational Complexity | Low | Medium | High |
| Tenant Count Support | Very High | Medium | Low |
| Backup Granularity | Low | Medium | High |

---

### Chosen Approach and Justification

This project adopts the **Shared Database with Shared Schema** approach using a mandatory `tenant_id` column for all tenant-owned data.

**Justification**
- Best balance between scalability, cost efficiency, and simplicity
- Ideal for containerized, Docker-based deployments
- Supports a large number of tenants with minimal overhead
- Simplifies automated evaluation and CI/CD pipelines
- Data isolation is enforced using backend middleware and JWT-based tenant identification

Strict tenant isolation is ensured by:
- Never trusting client-provided tenant IDs
- Deriving tenant context from JWT tokens
- Enforcing tenant filters in every database query
- Applying database-level constraints and indexes

This approach aligns well with modern SaaS best practices and the project’s functional requirements.

---

## 2. Technology Stack Justification

### Backend Framework

The backend is built using **Node.js with Express.js**. Node.js provides a non-blocking, event-driven architecture that is well-suited for building scalable REST APIs. Express.js offers a lightweight framework with strong middleware support.

**Why chosen**
- Excellent performance for concurrent API requests
- Mature ecosystem and community support
- Easy integration with JWT authentication and RBAC
- Works well with Dockerized environments

**Alternatives considered**
- Django: heavier framework with slower iteration speed
- Spring Boot: more boilerplate and higher complexity for this scope

---

### Frontend Framework

The frontend is developed using **React.js**, a component-based JavaScript library for building user interfaces.

**Why chosen**
- Reusable component architecture
- Strong ecosystem for routing and API integration
- Suitable for building role-based dashboards
- Widely adopted in production SaaS systems

**Alternatives considered**
- Angular: steeper learning curve and heavier framework
- Vue.js: smaller ecosystem for large SaaS applications

---

### Database

**PostgreSQL** is used as the relational database.

**Why chosen**
- Strong ACID compliance
- Excellent support for foreign keys and constraints
- Reliable transaction handling
- Native support for UUIDs and indexing

**Alternatives considered**
- MySQL: weaker advanced constraint handling
- MongoDB: less suitable for relational multi-tenant data

---

### Authentication

**JWT (JSON Web Tokens)** are used for authentication.

**Why chosen**
- Stateless authentication model
- No server-side session storage required
- Scales well across distributed systems
- Explicit token expiration control

**Alternatives considered**
- Server-side sessions: harder to scale
- OAuth-only flows: unnecessary complexity for this project

---

### Deployment and Containerization

**Docker and Docker Compose** are used for deployment.

**Why chosen**
- Environment consistency across machines
- One-command deployment
- Simplifies evaluation and CI/CD workflows

**Alternatives considered**
- Virtual machines: heavier and slower
- Kubernetes: excessive complexity for this scope

---

## 3. Security Considerations

### Tenant Data Isolation

Every tenant-owned record includes a `tenant_id`. All database queries are filtered using the tenant ID extracted from the authenticated JWT token. Client-supplied tenant IDs are never trusted, preventing cross-tenant data access.

---

### Authentication and Authorization

Authentication is implemented using JWT tokens with a fixed expiration of 24 hours. Authorization is enforced through role-based access control (RBAC), ensuring that users can only access endpoints permitted by their role.

---

### Password Security

Passwords are securely hashed using **bcrypt** with salting before being stored in the database. Plain text passwords are never stored, logged, or transmitted after initial submission.

---

### API Security

The backend enforces:
- Input validation on all endpoints
- Proper HTTP status codes
- Consistent error response formats
- CORS restrictions allowing only the frontend origin

---

### Audit Logging and Traceability

All critical operations such as creating, updating, and deleting users, projects, and tasks are recorded in an `audit_logs` table. This provides traceability, supports security audits, and helps detect unauthorized or suspicious activities.

---

### Summary

By combining strict tenant isolation, secure authentication, robust authorization, encrypted password storage, and audit logging, the system achieves a strong security posture suitable for a production-ready multi-tenant SaaS application.
