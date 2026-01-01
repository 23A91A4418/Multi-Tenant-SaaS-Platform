-- Enable UUID generation (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--------------------------------------------------
-- 1. SUPER ADMIN (tenant_id = NULL)
--------------------------------------------------

INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    role,
    is_active
)
VALUES (
    gen_random_uuid(),
    NULL,
    'superadmin@system.com',
    '$2b$10$6dKq0zM0Y9Yy6JX1d8kE5eQ8ZJ5r8nF9pZ8MZrYQm0VqZ0n5xqY3W',
    'System Super Admin',
    'super_admin',
    true
);

-- Password for super admin: Admin@123

--------------------------------------------------
-- 2. TENANT: Demo Company
--------------------------------------------------

INSERT INTO tenants (
    id,
    name,
    subdomain,
    status,
    subscription_plan,
    max_users,
    max_projects
)
VALUES (
    gen_random_uuid(),
    'Demo Company',
    'demo',
    'active',
    'pro',
    25,
    15
);

--------------------------------------------------
-- 3. TENANT ADMIN
--------------------------------------------------

INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    role,
    is_active
)
SELECT
    gen_random_uuid(),
    t.id,
    'admin@demo.com',
    '$2b$10$K1V8b6rM0kMZJ5kzYH9FQOZp0T2W5H7J1JZJw2LJ8FZ1M9Y1J0OaW',
    'Demo Tenant Admin',
    'tenant_admin',
    true
FROM tenants t
WHERE t.subdomain = 'demo';

-- Password: Demo@123

--------------------------------------------------
-- 4. REGULAR USERS
--------------------------------------------------

INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    role,
    is_active
)
SELECT
    gen_random_uuid(),
    t.id,
    'user1@demo.com',
    '$2b$10$H2p8rYxZKZp9y1B5N7H0O5KZ0X0KZ9KX5nY9N5N8KZ7N8Y1B5N7H0',
    'Demo User One',
    'user',
    true
FROM tenants t
WHERE t.subdomain = 'demo';

INSERT INTO users (
    id,
    tenant_id,
    email,
    password_hash,
    full_name,
    role,
    is_active
)
SELECT
    gen_random_uuid(),
    t.id,
    'user2@demo.com',
    '$2b$10$H2p8rYxZKZp9y1B5N7H0O5KZ0X0KZ9KX5nY9N5N8KZ7N8Y1B5N7H0',
    'Demo User Two',
    'user',
    true
FROM tenants t
WHERE t.subdomain = 'demo';

-- Password for both users: User@123

--------------------------------------------------
-- 5. PROJECTS
--------------------------------------------------

INSERT INTO projects (
    id,
    tenant_id,
    name,
    description,
    status,
    created_by
)
SELECT
    gen_random_uuid(),
    t.id,
    'Project Alpha',
    'First demo project',
    'active',
    u.id
FROM tenants t
JOIN users u ON u.tenant_id = t.id
WHERE t.subdomain = 'demo'
  AND u.role = 'tenant_admin'
LIMIT 1;

INSERT INTO projects (
    id,
    tenant_id,
    name,
    description,
    status,
    created_by
)
SELECT
    gen_random_uuid(),
    t.id,
    'Project Beta',
    'Second demo project',
    'active',
    u.id
FROM tenants t
JOIN users u ON u.tenant_id = t.id
WHERE t.subdomain = 'demo'
  AND u.role = 'tenant_admin'
LIMIT 1;

--------------------------------------------------
-- 6. TASKS
--------------------------------------------------

INSERT INTO tasks (
    id,
    project_id,
    tenant_id,
    title,
    description,
    status,
    priority,
    assigned_to
)
SELECT
    gen_random_uuid(),
    p.id,
    p.tenant_id,
    'Initial Setup Task',
    'Setup initial project structure',
    'todo',
    'high',
    u.id
FROM projects p
JOIN users u ON u.tenant_id = p.tenant_id
WHERE p.name = 'Project Alpha'
  AND u.role = 'user'
LIMIT 1;

--------------------------------------------------
-- 7. AUDIT LOG (OPTIONAL BUT SAFE)
--------------------------------------------------

INSERT INTO audit_logs (
    id,
    tenant_id,
    user_id,
    action,
    entity_type,
    created_at
)
SELECT
    gen_random_uuid(),
    t.id,
    u.id,
    'SEED_DATA',
    'system',
    CURRENT_TIMESTAMP
FROM tenants t
JOIN users u ON u.tenant_id = t.id
WHERE t.subdomain = 'demo'
LIMIT 1;
