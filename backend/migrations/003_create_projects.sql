-- UP
DROP TABLE IF EXISTS projects CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
CREATE TYPE project_status AS ENUM ('active', 'archived', 'completed');

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'active',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    priority VARCHAR(50) DEFAULT 'medium',
    budget DECIMAL(10, 2) DEFAULT 0.00,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);


