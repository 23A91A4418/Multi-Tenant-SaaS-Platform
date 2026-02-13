# API Documentation

## Authentication
### Register Tenant
- **URL**: `/api/auth/register-tenant`
- **Method**: `POST`
- **Body**:
    ```json
    {
        "tenantName": "Example Corp",
        "subdomain": "example",
        "adminEmail": "admin@example.com",
        "adminPassword": "password123",
        "adminFullName": "Admin User"
    }
    ```
- **Success Response**: `201 Created`

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
    ```json
    {
        "email": "admin@example.com",
        "password": "password123",
        "tenantSubdomain": "example"
    }
    ```
- **Success Response**: `200 OK` (returns JWT token)

### Get Current User
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response**: `200 OK`

### Super Admin Login
- **URL**: `/api/auth/super-admin/login`
- **Method**: `POST`
- **Body**:
    ```json
    {
        "email": "superadmin@system.com",
        "password": "Admin@123"
    }
    ```
- **Success Response**: `200 OK` (returns JWT token for super_admin)

## Tenants
### List All Tenants (Super Admin Only)
- **URL**: `/api/tenants`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

### Get Tenant Details
- **URL**: `/api/tenants/:tenantId`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

### Update Tenant (Name Only)
- **URL**: `/api/tenants/:tenantId`
- **Method**: `PUT`
- **Body**: `{ "name": "Updated Name" }`
- **Headers**: `Authorization: Bearer <token>`

## Users
### Add User to Tenant
- **URL**: `/api/tenants/:tenantId/users`
- **Method**: `POST`
- **Body**:
    ```json
    {
        "email": "user@example.com",
        "password": "password123",
        "fullName": "New User",
        "role": "user"
    }
    ```
- **Headers**: `Authorization: Bearer <token>`

### List Users in Tenant
- **URL**: `/api/tenants/:tenantId/users`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

## Projects
### Create Project
- **URL**: `/api/projects`
- **Method**: `POST`
- **Body**:
    ```json
    {
        "name": "New Project",
        "description": "Project Description"
    }
    ```
- **Headers**: `Authorization: Bearer <token>`

### List Projects
- **URL**: `/api/projects`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

## Tasks
### Create Task
- **URL**: `/api/projects/:projectId/tasks`
- **Method**: `POST`
- **Body**:
    ```json
    {
        "title": "New Task",
        "description": "Task description",
        "priority": "medium"
    }
    ```
- **Headers**: `Authorization: Bearer <token>`

### Patch Task Status
- **URL**: `/api/tasks/:taskId/status`
- **Method**: `PATCH`
- **Body**: `{ "status": "completed" }`
- **Headers**: `Authorization: Bearer <token>`
