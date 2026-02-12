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
    '$2a$10$1eenunBqxQpmYs2MrUUPS.hDmc3vXFVULgyq4q4mQ65nvyp6VdloS',
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
    '$2a$10$XfSGtAf9YXQNjZYlm/iPheaMnJxpOAjX8kJrD4PsCndSHj/WEFvEO',
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
    '$2a$10$EYcu0SX6wsfyWpCsVcpKn.UNLXpxSee0O8T0/P2CST2vO9.lhevuW',
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
    '$2a$10$EYcu0SX6wsfyWpCsVcpKn.UNLXpxSee0O8T0/P2CST2vO9.lhevuW',
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
    'Marketing Campaign Q1',
    'Q1 2026 Marketing Strategy and Execution',
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
    'Website Redesign',
    'Overhaul of corporate website',
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
    'Mobile App Launch',
    'Launch Android and iOS apps',
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
    'Draft Social Media Plan',
    'Create content calendar for Q1',
    'in_progress',
    'high',
    u.id
FROM projects p
JOIN users u ON u.tenant_id = p.tenant_id
WHERE p.name = 'Marketing Campaign Q1'
  AND u.email = 'user1@demo.com'
LIMIT 1;

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
    'Design Home Page Mockups',
    'Figma designs for new home page',
    'todo',
    'medium',
    u.id
FROM projects p
JOIN users u ON u.tenant_id = p.tenant_id
WHERE p.name = 'Website Redesign'
  AND u.email = 'user2@demo.com'
LIMIT 1;

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
    'App Store Submission',
    'Prepare assets for Apple App Store',
    'todo',
    'high',
    u.id
FROM projects p
JOIN users u ON u.tenant_id = p.tenant_id
WHERE p.name = 'Mobile App Launch'
  AND u.email = 'admin@demo.com'
LIMIT 1;

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
    'Backend API Integration',
    'Integrate login APIs with mobile app',
    'completed',
    'high',
    u.id
FROM projects p
JOIN users u ON u.tenant_id = p.tenant_id
WHERE p.name = 'Mobile App Launch'
  AND u.email = 'user1@demo.com'
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
