package ksef

import rego.v1

# Główna funkcja autoryzacji dla aplikacji KSEF
default allow := false

# ===== STATYCZNE DANE WBUDOWANE W POLITYKĘ =====

# Definicje ról KSEF i ich uprawnień (stałe dla wszystkich tenantów)
ksef_role_permissions := {
    "Administrator": [
        "canManageConfiguration",
        "canManageDeclarations", 
        "canManageUsers",
        "canViewReports",
        "canViewPurchaseInvoices",
        "canViewSalesInvoices",
        "canCreatePurchaseInvoices",
        "canCreateSalesInvoices",
        "canEditPurchaseInvoices",
        "canEditSalesInvoices",
        "canDeletePurchaseInvoices",
        "canDeleteSalesInvoices"
    ],
    "Wlasciciel_KA": [
        "canManageConfiguration",
        "canManageDeclarations", 
        "canManageUsers",
        "canViewReports",
        "canViewPurchaseInvoices",
        "canViewSalesInvoices",
        "canCreatePurchaseInvoices",
        "canCreateSalesInvoices",
        "canEditPurchaseInvoices",
        "canEditSalesInvoices",
        "canDeletePurchaseInvoices",
        "canDeleteSalesInvoices"
    ],
    "Księgowa": [
        "canViewPurchaseInvoices",
        "canViewSalesInvoices", 
        "canCreatePurchaseInvoices",
        "canCreateSalesInvoices",
        "canEditPurchaseInvoices",
        "canEditSalesInvoices",
        "canViewReports"
    ],
    "Handlowiec": [
        "canCreateSalesInvoices",
        "canEditSalesInvoices",
        "canViewSalesInvoices"
    ],
    "Zakupowiec": [
        "canViewPurchaseInvoices",
        "canCreatePurchaseInvoices",
        "canEditPurchaseInvoices",
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
    "create_invoices_sale": "canCreateSalesInvoices",
    "create_invoices_purchase": "canCreatePurchaseInvoices",
    "edit_invoices_sale": "canEditSalesInvoices",
    "edit_invoices_purchase": "canEditPurchaseInvoices",
    "delete_invoices_sale": "canDeleteSalesInvoices",
    "delete_invoices_purchase": "canDeletePurchaseInvoices",
    "manage_configuration": "canManageConfiguration",
    "manage_declarations": "canManageDeclarations",
    "manage_users": "canManageUsers",
    "view_reports": "canViewReports"
}

# ===== GŁÓWNE REGUŁY AUTORYZACJI =====

# Model 1: Autoryzacja oparta na rolach (RBAC)
allow_rbac if {
    # Pobieramy dane użytkownika z ACL
    user_data := data.acl[input.tenant].data.users[input.user]
    
    # Sprawdzamy czy użytkownik ma role w aplikacji KSEF
    user_ksef_roles := user_data.roles.ksef
    some role_name in user_ksef_roles
    
    # Pobieramy uprawnienia tej roli ze statycznych danych
    role_permissions := ksef_role_permissions[role_name]
    
    # Sprawdzamy czy rola ma wymagane uprawnienie dla tej akcji
    required_permission := action_to_permission[input.action]
    required_permission in role_permissions
    
    # Sprawdzamy dostęp do firmy (jeśli wymagany)
    company_access_granted
}

# Model 2: Autoryzacja oparta na zespołach (ReBAC)
allow_rebac if {
    # Sprawdzamy czy użytkownik jest członkiem zespołu z dostępem do firmy
    user_in_team_with_company_access
    
    # Sprawdzamy czy zespół ma dostęp aplikacyjny do KSEF
    team_has_ksef_access
    
    # Dla zespołów używamy podstawowych uprawnień (można rozszerzyć)
    basic_team_permission_granted
}

# Główna reguła autoryzacji (OR logic)
allow if { allow_rbac }
allow if { allow_rebac }

# ===== SPRAWDZANIE DOSTĘPU DO FIRM =====

# Brak company_id = dostęp uniwersalny
company_access_granted if {
    not input.company_id
}

# Model 1: Bezpośredni dostęp użytkownika do firmy
company_access_granted if {
    input.company_id
    user_data := data.acl[input.tenant].data.users[input.user]
    
    # Sprawdzamy bezpośredni dostęp przez user_companies
    some user_company in data.acl[input.tenant].data.user_companies
    user_company.user_id == input.user
    user_company.company_id == input.company_id
}

# Model 1: Administrator i Właściciel mają dostęp do wszystkich firm
company_access_granted if {
    input.company_id
    user_data := data.acl[input.tenant].data.users[input.user]
    
    # Sprawdzamy czy ma rolę Administrator lub Wlasciciel_KA w KSEF
    user_ksef_roles := user_data.roles.ksef
    some role_name in user_ksef_roles
    role_name in ["Administrator", "Wlasciciel_KA"]
}

# Model 2: Dostęp przez zespół
company_access_granted if {
    input.company_id
    user_in_team_with_company_access
}

# ===== MODEL 2: FUNKCJE POMOCNICZE ZESPOŁOWE =====

# Sprawdza czy użytkownik jest w zespole z dostępem do firmy
user_in_team_with_company_access if {
    input.company_id
    
    # Znajdź zespoły użytkownika
    some team_membership in data.acl[input.tenant].data.team_memberships
    team_membership.user_id == input.user
    team_id := team_membership.team_id
    
    # Sprawdź czy zespół ma dostęp do firmy
    some team_company in data.acl[input.tenant].data.team_companies
    team_company.team_id == team_id
    team_company.company_id == input.company_id
}

# Sprawdza czy zespół ma dostęp do aplikacji KSEF (obecnie zakładamy że tak)
team_has_ksef_access if {
    # Dla uproszczenia - wszystkie zespoły mają dostęp do KSEF
    # Można rozszerzyć o sprawdzanie team_applications w przyszłości
    true
}

# Podstawowe uprawnienia zespołowe (można dostosować)
basic_team_permission_granted if {
    # Członkowie zespołów mają podstawowe uprawnienia do przeglądania
    input.action in ["view_invoices_sales", "view_invoices_purchase", "view_reports"]
}

# ===== FUNKCJE DIAGNOSTYCZNE (UPROSZCZONE) =====

# Sprawdza czy użytkownik istnieje
user_exists if {
    data.acl[input.tenant].data.users[input.user]
}

# Pobiera role użytkownika w KSEF  
user_ksef_roles := roles if {
    user_data := data.acl[input.tenant].data.users[input.user]
    roles := user_data.roles.ksef
} else = [] 