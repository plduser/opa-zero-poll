-- PostgreSQL Schema for OPA Zero Poll - Model 2 (RBAC + REBAC)
-- Multi-tenant authorization system with role-based and relationship-based access control

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

-- Tenants - podstawowa encja dla multi-tenancy
CREATE TABLE tenants (
    tenant_id VARCHAR(255) PRIMARY KEY,
    tenant_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users - użytkownicy systemu (globalni, nie per-tenant)
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Applications - aplikacje w systemie (fk, hr, crm, etc.)
CREATE TABLE applications (
    app_id VARCHAR(255) PRIMARY KEY,
    app_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies - firmy w ramach tenantów
CREATE TABLE companies (
    company_id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_code VARCHAR(100),
    description TEXT,
    parent_company_id VARCHAR(255) REFERENCES companies(company_id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, company_code)
);

-- ============================================================================
-- RBAC ENTITIES
-- ============================================================================

-- Roles - role w aplikacjach
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id VARCHAR(255) NOT NULL REFERENCES applications(app_id) ON DELETE CASCADE,
    role_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(app_id, role_name)
);

-- Permissions - uprawnienia w aplikacjach
CREATE TABLE permissions (
    permission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id VARCHAR(255) NOT NULL REFERENCES applications(app_id) ON DELETE CASCADE,
    permission_name VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(255),
    action VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(app_id, permission_name)
);

-- Role_Permissions - przypisania uprawnień do ról
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by VARCHAR(255),
    
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================================
-- USER ASSIGNMENTS
-- ============================================================================

-- User_Roles - przypisania ról użytkownikom w aplikacjach
CREATE TABLE user_roles (
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    PRIMARY KEY (user_id, role_id, tenant_id)
);

-- User_Access - dostęp użytkowników do firm
CREATE TABLE user_access (
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    company_id VARCHAR(255) NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    access_type VARCHAR(50) DEFAULT 'direct' CHECK (access_type IN ('direct', 'inherited', 'team')),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    PRIMARY KEY (user_id, company_id, tenant_id)
);

-- ============================================================================
-- REBAC ENTITIES (Teams)
-- ============================================================================

-- Teams - zespoły użytkowników
CREATE TABLE teams (
    team_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    team_name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_team_id UUID REFERENCES teams(team_id) ON DELETE SET NULL,
    team_type VARCHAR(50) DEFAULT 'functional' CHECK (team_type IN ('functional', 'project', 'department', 'external')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, team_name)
);

-- Team_Memberships - członkostwo w zespołach
CREATE TABLE team_memberships (
    user_id VARCHAR(255) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    role_in_team VARCHAR(50) DEFAULT 'member' CHECK (role_in_team IN ('member', 'lead', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    joined_by VARCHAR(255),
    
    PRIMARY KEY (user_id, team_id)
);

-- Team_Roles - role zespołowe w aplikacjach
CREATE TABLE team_roles (
    team_id UUID NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(255),
    
    PRIMARY KEY (team_id, role_id)
);

-- Team_Companies - firmy obsługiwane przez zespoły
CREATE TABLE team_companies (
    team_id UUID NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    company_id VARCHAR(255) NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    access_type VARCHAR(50) DEFAULT 'manage' CHECK (access_type IN ('view', 'edit', 'manage', 'admin')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(255),
    
    PRIMARY KEY (team_id, company_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Multi-tenancy indexes
CREATE INDEX idx_companies_tenant_id ON companies(tenant_id);
CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX idx_user_access_tenant_id ON user_access(tenant_id);
CREATE INDEX idx_teams_tenant_id ON teams(tenant_id);

-- User lookup indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_access_user_id ON user_access(user_id);
CREATE INDEX idx_team_memberships_user_id ON team_memberships(user_id);

-- Role and permission indexes
CREATE INDEX idx_roles_app_id ON roles(app_id);
CREATE INDEX idx_permissions_app_id ON permissions(app_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Team relationship indexes
CREATE INDEX idx_teams_parent_team_id ON teams(parent_team_id);
CREATE INDEX idx_team_roles_team_id ON team_roles(team_id);
CREATE INDEX idx_team_companies_team_id ON team_companies(team_id);

-- Company hierarchy index
CREATE INDEX idx_companies_parent_company_id ON companies(parent_company_id);

-- Status and active record indexes
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_teams_status ON teams(status);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: User effective permissions (direct + team-based)
CREATE VIEW user_effective_permissions AS
WITH user_direct_permissions AS (
    -- Direct role assignments
    SELECT 
        ur.user_id,
        ur.tenant_id,
        r.app_id,
        r.role_name,
        p.permission_name,
        'direct' as source_type,
        NULL as source_id
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.role_id
    JOIN role_permissions rp ON r.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.permission_id
),
user_team_permissions AS (
    -- Team-based role assignments
    SELECT 
        tm.user_id,
        t.tenant_id,
        r.app_id,
        r.role_name,
        p.permission_name,
        'team' as source_type,
        t.team_id::text as source_id
    FROM team_memberships tm
    JOIN teams t ON tm.team_id = t.team_id
    JOIN team_roles tr ON t.team_id = tr.team_id
    JOIN roles r ON tr.role_id = r.role_id
    JOIN role_permissions rp ON r.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.permission_id
)
SELECT * FROM user_direct_permissions
UNION ALL
SELECT * FROM user_team_permissions;

-- View: User effective company access (direct + team-based)
CREATE VIEW user_effective_access AS
WITH user_direct_access AS (
    -- Direct company access
    SELECT 
        ua.user_id,
        ua.tenant_id,
        ua.company_id,
        c.company_name,
        'direct' as source_type,
        NULL as source_id
    FROM user_access ua
    JOIN companies c ON ua.company_id = c.company_id
),
user_team_access AS (
    -- Team-based company access
    SELECT 
        tm.user_id,
        t.tenant_id,
        tc.company_id,
        c.company_name,
        'team' as source_type,
        t.team_id::text as source_id
    FROM team_memberships tm
    JOIN teams t ON tm.team_id = t.team_id
    JOIN team_companies tc ON t.team_id = tc.team_id
    JOIN companies c ON tc.company_id = c.company_id
)
SELECT * FROM user_direct_access
UNION ALL
SELECT * FROM user_team_access;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE tenants IS 'Multi-tenant isolation - each tenant represents a separate organization';
COMMENT ON TABLE users IS 'Global users that can have access to multiple tenants';
COMMENT ON TABLE applications IS 'Applications in the system (fk, hr, crm, etc.)';
COMMENT ON TABLE companies IS 'Companies within tenants - the resources users get access to';
COMMENT ON TABLE roles IS 'Application-specific roles (fk_admin, hr_viewer, etc.)';
COMMENT ON TABLE permissions IS 'Granular permissions within applications';
COMMENT ON TABLE user_roles IS 'Direct role assignments to users within tenants';
COMMENT ON TABLE user_access IS 'Direct company access assignments to users';
COMMENT ON TABLE teams IS 'Teams for REBAC-style group management';
COMMENT ON TABLE team_memberships IS 'User membership in teams';
COMMENT ON TABLE team_roles IS 'Role assignments to teams (inherited by members)';
COMMENT ON TABLE team_companies IS 'Company access assignments to teams (inherited by members)';

COMMENT ON VIEW user_effective_permissions IS 'Unified view of user permissions from direct roles and team memberships';
COMMENT ON VIEW user_effective_access IS 'Unified view of user company access from direct assignments and team memberships'; 