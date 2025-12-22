-- SUPER ADMIN
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    NULL,
    'superadmin@system.com',
    '<HASHED_PASSWORD>',
    'System Admin',
    'super_admin'
);

-- TENANT
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Demo Company',
    'demo',
    'active',
    'pro',
    25,
    15
);
