package ksef

import rego.v1

# Główna funkcja autoryzacji dla aplikacji KSEF
default allow := false

# ===== STATYCZNE DANE WBUDOWANE W POLITYKĘ =====

# Definicje ról KSEF i ich uprawnień (stałe dla wszystkich tenantów)
ksef_role_permissions := {
    "Administrator": [
        "canViewSalesInvoices",
        "canViewPurchaseInvoices", 
        "canCreateSalesInvoices",
        "canCreatePurchaseInvoices",
        "canEditSalesInvoices",
        "canEditPurchaseInvoices",
        "canDeleteSalesInvoices", 
        "canDeletePurchaseInvoices",
        "canViewReports",
        "canManageConfiguration",
        "canManageUsers"
    ],
    "Wlasciciel_KA": [
        "canViewSalesInvoices",
        "canViewPurchaseInvoices", 
        "canCreateSalesInvoices",
        "canCreatePurchaseInvoices",
        "canEditSalesInvoices",
        "canEditPurchaseInvoices",
        "canDeleteSalesInvoices", 
        "canDeletePurchaseInvoices",
        "canViewReports",
        "canManageConfiguration",
        "canManageUsers"
    ],
    "Handlowiec": [
        "canViewSalesInvoices",
        "canCreateSalesInvoices",
        "canEditSalesInvoices",
        "canViewReports"
    ],
    "Księgowa": [
        "canViewPurchaseInvoices",
        "canCreatePurchaseInvoices", 
        "canEditPurchaseInvoices",
        "canViewReports"
    ],
    "Zakupowiec": [
        "canViewPurchaseInvoices",
        "canCreatePurchaseInvoices",
        "canViewReports"
    ],
    "Specjalista": [
        "canViewPurchaseInvoices",
        "canViewSalesInvoices",
        "canViewReports"
    ]
}

# Mapowanie akcji na wymagane uprawnienia
action_to_permission := {
    "view_invoices_sales": "canViewSalesInvoices",
    "view_invoices_purchase": "canViewPurchaseInvoices", 
    "create_invoices_sales": "canCreateSalesInvoices",
    "create_invoices_purchase": "canCreatePurchaseInvoices",
    "edit_invoices_sales": "canEditSalesInvoices",
    "edit_invoices_purchase": "canEditPurchaseInvoices",
    "delete_invoices_sales": "canDeleteSalesInvoices",
    "delete_invoices_purchase": "canDeletePurchaseInvoices",
    "view_reports": "canViewReports",
    "manage_configuration": "canManageConfiguration",
    "manage_users": "canManageUsers"
}

# ===== GŁÓWNE REGUŁY AUTORYZACJI =====

# Model 1: Autoryzacja oparta na rolach (RBAC)
allow_rbac if {
    # Pobieramy dane użytkownika z ACL
    user_data := data.acl[input.tenant].data.users[input.user]
    
    # Sprawdzamy czy użytkownik ma role w aplikacji KSEF (używamy role_assignments)
    some assignment in user_data.role_assignments
    assignment.app_id == "ksef"
    role_name := assignment.role_name
    
    # Pobieramy uprawnienia tej roli ze statycznych danych
    role_permissions := ksef_role_permissions[role_name]
    
    # Sprawdzamy czy rola ma wymagane uprawnienie dla tej akcji
    required_permission := action_to_permission[input.action]
    required_permission in role_permissions
    
    # Sprawdzamy dostęp do firmy (jeśli wymagany)
    company_access_granted
}

# Model 2: Autoryzacja oparta na zespołach (ReBAC) - UŻYWA NOWYCH DANYCH team_roles
allow_rebac if {
    # Sprawdzamy czy użytkownik ma dostęp przez zespół
    team_has_ksef_access
    company_access_granted
}

# Główna reguła autoryzacji (OR logic)
allow if { allow_rbac }
allow if { allow_rebac }

# ===== SPRAWDZANIE DOSTĘPU DO FIRM =====

# Brak company_id = dostęp uniwersalny dla uprawnień globalnych
company_access_granted if {
    not input.company_id
}

# Z company_id = sprawdzamy dostęp do konkretnej firmy
company_access_granted if {
    input.company_id
    user_data := data.acl[input.tenant].data.users[input.user]
    
    # Sprawdzamy czy użytkownik ma rolę Administrator lub Wlasciciel_KA (dostęp do wszystkich firm)
    some assignment in user_data.role_assignments
    assignment.app_id == "ksef"
    assignment.role_name in ["Administrator", "Wlasciciel_KA"]
}

# Model 1 (RBAC): dostęp przez bezpośrednie przypisanie firmy do użytkownika
company_access_granted if {
    input.company_id
    
    # Sprawdzamy czy użytkownik ma bezpośredni dostęp do firmy
    some user_company in data.acl[input.tenant].data.user_companies
    user_company.user_id == input.user
    user_company.company_id == input.company_id
}

company_access_granted if {
    input.company_id
    
    # Model 2 (ReBAC): dostęp przez zespoły
    team_company_access
}

# ===== MODEL 2: AUTORYZACJA ZESPOŁOWA (ReBAC) =====

team_has_ksef_access if {
    # Znajdź zespoły użytkownika
    user_teams := {team_id | 
        some membership in data.acl[input.tenant].data.team_memberships
        membership.user_id == input.user
        team_id := membership.team_id
    }
    
    # Sprawdź czy któryś zespół ma role KSEF w nowych danych team_roles
    some team_id in user_teams
    some team_role in data.acl[input.tenant].data.team_roles
    team_role.team_id == team_id
    team_role.app_id == "ksef"
    
    # Pobieramy uprawnienia tej roli ze statycznych danych
    role_permissions := ksef_role_permissions[team_role.role_name]
    
    # Sprawdzamy czy rola ma wymagane uprawnienie dla tej akcji
    required_permission := action_to_permission[input.action]
    required_permission in role_permissions
}

team_company_access if {
    input.company_id
    
    # Znajdź zespoły użytkownika  
    user_teams := {team_id |
        some membership in data.acl[input.tenant].data.team_memberships
        membership.user_id == input.user
        team_id := membership.team_id
    }
    
    # Sprawdź czy któryś zespół ma dostęp do tej firmy
    some team_id in user_teams
    some team_company in data.acl[input.tenant].data.team_companies
    team_company.team_id == team_id
    team_company.company_id == input.company_id
}

# ===== FUNKCJE DIAGNOSTYCZNE =====

# Pobiera role użytkownika w KSEF  
user_ksef_roles := roles if {
    user_data := data.acl[input.tenant].data.users[input.user]
    roles := [assignment.role_name | 
        some assignment in user_data.role_assignments
        assignment.app_id == "ksef"
    ]
} else = [] 

# Pobiera role użytkownika w KSEF przez zespoły (ReBAC)
user_team_ksef_roles := roles if {
    # Znajdź zespoły użytkownika
    user_teams := {team_id | 
        some membership in data.acl[input.tenant].data.team_memberships
        membership.user_id == input.user
        team_id := membership.team_id
    }
    
    # Zbierz role KSEF z zespołów
    roles := [sprintf("%s (zespół: %s)", [team_role.role_name, team_role.team_name]) | 
        some team_id in user_teams
        some team_role in data.acl[input.tenant].data.team_roles
        team_role.team_id == team_id
        team_role.app_id == "ksef"
    ]
} else = [] 