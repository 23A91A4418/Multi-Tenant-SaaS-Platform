TRUNCATE audit_logs, tasks, projects, users, tenants CASCADE;

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
-- 2. TENANTS
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
VALUES 
(
    gen_random_uuid(),
    'Demo Company',
    'demo',
    'active',
    'pro',
    25,
    15
),
(
    gen_random_uuid(),
    'Global Tech',
    'global',
    'active',
    'enterprise',
    100,
    50
);

--------------------------------------------------
-- 3. TENANT ADMINS
--------------------------------------------------

-- Demo Admin
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
SELECT gen_random_uuid(), id, 'admin@demo.com', '$2a$10$XfSGtAf9YXQNjZYlm/iPheaMnJxpOAjX8kJrD4PsCndSHj/WEFvEO', 'Demo Admin', 'tenant_admin', true
FROM tenants WHERE subdomain = 'demo';

-- Global Admin
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
SELECT gen_random_uuid(), id, 'admin@global.com', '$2a$10$XfSGtAf9YXQNjZYlm/iPheaMnJxpOAjX8kJrD4PsCndSHj/WEFvEO', 'Global Tech Admin', 'tenant_admin', true
FROM tenants WHERE subdomain = 'global';

--------------------------------------------------
-- 4. REGULAR USERS
--------------------------------------------------

-- Demo Users
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
SELECT gen_random_uuid(), id, 'user1@demo.com', '$2a$10$EYcu0SX6wsfyWpCsVcpKn.UNLXpxSee0O8T0/P2CST2vO9.lhevuW', 'Alice Demo', 'user', true
FROM tenants WHERE subdomain = 'demo';

INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
SELECT gen_random_uuid(), id, 'user2@demo.com', '$2a$10$EYcu0SX6wsfyWpCsVcpKn.UNLXpxSee0O8T0/P2CST2vO9.lhevuW', 'Bob Demo', 'user', true
FROM tenants WHERE subdomain = 'demo';

-- Global Users
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
SELECT gen_random_uuid(), id, 'dev1@global.com', '$2a$10$EYcu0SX6wsfyWpCsVcpKn.UNLXpxSee0O8T0/P2CST2vO9.lhevuW', 'Global Dev One', 'user', true
FROM tenants WHERE subdomain = 'global';

INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active)
SELECT gen_random_uuid(), id, 'dev2@global.com', '$2a$10$EYcu0SX6wsfyWpCsVcpKn.UNLXpxSee0O8T0/P2CST2vO9.lhevuW', 'Global Dev Two', 'user', true
FROM tenants WHERE subdomain = 'global';

--------------------------------------------------
-- 5. PROJECTS
--------------------------------------------------

-- Demo Projects
INSERT INTO projects (id, tenant_id, name, description, status, created_by)
SELECT gen_random_uuid(), t.id, 'Project Alpha', 'Main initiative for Q1', 'active', u.id
FROM tenants t JOIN users u ON u.tenant_id = t.id WHERE t.subdomain = 'demo' AND u.role = 'tenant_admin';

INSERT INTO projects (id, tenant_id, name, description, status, created_by)
SELECT gen_random_uuid(), t.id, 'Project Beta', 'Secondary support project', 'active', u.id
FROM tenants t JOIN users u ON u.tenant_id = t.id WHERE t.subdomain = 'demo' AND u.role = 'tenant_admin';

-- Global Projects
INSERT INTO projects (id, tenant_id, name, description, status, created_by)
SELECT gen_random_uuid(), t.id, 'Cloud Infrastructure', 'Migrating to multi-region', 'active', u.id
FROM tenants t JOIN users u ON u.tenant_id = t.id WHERE t.subdomain = 'global' AND u.role = 'tenant_admin';

INSERT INTO projects (id, tenant_id, name, description, status, created_by)
SELECT gen_random_uuid(), t.id, 'Data Warehouse', 'Snowflake implementation', 'active', u.id
FROM tenants t JOIN users u ON u.tenant_id = t.id WHERE t.subdomain = 'global' AND u.role = 'tenant_admin';

--------------------------------------------------
-- 6. TASKS
--------------------------------------------------

-- Demo Tasks
INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to)
SELECT gen_random_uuid(), p.id, p.tenant_id, 'Setup Repository', 'Create git repo and boilerplate', 'completed', 'high', u.id
FROM projects p JOIN users u ON u.tenant_id = p.tenant_id WHERE p.name = 'Project Alpha' AND u.email = 'user1@demo.com';

INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to)
SELECT gen_random_uuid(), p.id, p.tenant_id, 'Fix UI Bugs', 'Review login styling issues', 'in_progress', 'medium', u.id
FROM projects p JOIN users u ON u.tenant_id = p.tenant_id WHERE p.name = 'Project Alpha' AND u.email = 'user2@demo.com';

INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to)
SELECT gen_random_uuid(), p.id, p.tenant_id, 'Database Backup', 'Setup automated daily backups', 'todo', 'low', u.id
FROM projects p JOIN users u ON u.tenant_id = p.tenant_id WHERE p.name = 'Project Beta' AND u.email = 'user1@demo.com';

-- Global Tasks
INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to)
SELECT gen_random_uuid(), p.id, p.tenant_id, 'Provision AWS VPC', 'Setup networking and subnets', 'completed', 'high', u.id
FROM projects p JOIN users u ON u.tenant_id = p.tenant_id WHERE p.name = 'Cloud Infrastructure' AND u.email = 'dev1@global.com';

INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to)
SELECT gen_random_uuid(), p.id, p.tenant_id, 'ETL Job Setup', 'Configure Kafka producers', 'todo', 'high', u.id
FROM projects p JOIN users u ON u.tenant_id = p.tenant_id WHERE p.name = 'Data Warehouse' AND u.email = 'dev2@global.com';

INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to)
SELECT gen_random_uuid(), p.id, p.tenant_id, 'Security Hardening', 'Audit IAM roles and policies', 'in_progress', 'high', u.id
FROM projects p JOIN users u ON u.tenant_id = p.tenant_id WHERE p.name = 'Cloud Infrastructure' AND u.email = 'admin@global.com';

INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to)
SELECT gen_random_uuid(), p.id, p.tenant_id, 'Database Migration', 'Move data to Snowflake', 'todo', 'medium', u.id
FROM projects p JOIN users u ON u.tenant_id = p.tenant_id WHERE p.name = 'Data Warehouse' AND u.email = 'dev1@global.com';

-- More Demo Tasks
INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to)
SELECT gen_random_uuid(), p.id, p.tenant_id, 'Finalize Branding', 'Approve project logo and colors', 'completed', 'medium', u.id
FROM projects p JOIN users u ON u.tenant_id = p.tenant_id WHERE p.name = 'Project Alpha' AND u.email = 'admin@demo.com';

INSERT INTO tasks (id, project_id, tenant_id, title, description, status, priority, assigned_to)
SELECT gen_random_uuid(), p.id, p.tenant_id, 'User Feedback Loop', 'Collect initial user feedback', 'in_progress', 'low', u.id
FROM projects p JOIN users u ON u.tenant_id = p.tenant_id WHERE p.name = 'Project Beta' AND u.email = 'user2@demo.com';

--------------------------------------------------
-- 7. AUDIT LOGS
--------------------------------------------------

INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type)
SELECT gen_random_uuid(), id, NULL, 'SYSTEM_STARTUP', 'system' FROM tenants WHERE subdomain = 'demo';

INSERT INTO audit_logs (id, tenant_id, user_id, action, entity_type)
SELECT gen_random_uuid(), id, NULL, 'ENTERPRISE_SETUP', 'system' FROM tenants WHERE subdomain = 'global';
