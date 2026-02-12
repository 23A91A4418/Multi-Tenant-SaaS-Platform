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

## Tenants
### Get Tenant Details
- **URL**: `/api/tenants/:tenantId`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`

## Users
### List Users
- **URL**: `/api/users`
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
        "description": "Project Description",
        "startDate": "2023-01-01",
        "endDate": "2023-12-31",
        "priority": "high",
        "budget": 5000.00
    }
    ```
- **Headers**: `Authorization: Bearer <token>`

## Tasks
### Create Task
- **URL**: `/api/projects/:projectId/tasks`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
