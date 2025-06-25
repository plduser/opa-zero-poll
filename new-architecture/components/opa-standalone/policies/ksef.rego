package ksef

import rego.v1
import data.rbac  # Import bazowej polityki RBAC

# Główna funkcja autoryzacji dla aplikacji KSEF
default allow := false

# Główne reguły autoryzacji dla KSEF - używamy rzeczywistych danych z /acl/{tenant}

allow if {
    # Sprawdzamy czy użytkownik istnieje w rzeczywistych danych - z poprawną strukturą
    user_data := data.acl[input.tenant].data.users[input.user]
    
    # Sprawdzamy bezpośrednio uprawnienia w permissions.ksef
    ksef_permissions := user_data.permissions.ksef
    
    # Mapowanie akcji na wymagane uprawnienia
    required_permission := action_to_permission[input.action]
    required_permission in ksef_permissions
    
    # Dodatkowa weryfikacja uprawnień do firmy (jeśli company_id jest podane)
    company_access_granted
}

# Sprawdzenie dostępu do firmy
company_access_granted if {
    # Jeśli nie ma company_id w input, pozwalamy (zachowanie wsteczne)
    not input.company_id
}

company_access_granted if {
    # Jeśli jest company_id, sprawdzamy czy użytkownik ma dostęp do tej firmy
    input.company_id
    user_data := data.acl[input.tenant].data.users[input.user]
    
    # Sprawdzamy czy użytkownik ma dostęp do tej firmy poprzez companies
    user_companies := user_data.companies
    company_found := user_companies[_]
    company_found.company_id == input.company_id
}

company_access_granted if {
    # Alternatywnie: admin ma dostęp do wszystkich firm
    input.company_id
    user_data := data.acl[input.tenant].data.users[input.user]
    ksef_roles := user_data.roles.ksef
    "Administrator" in ksef_roles
}

# Mapowanie akcji na wymagane uprawnienia KSEF
action_to_permission := {
    "view_invoices_sales": "canViewSalesInvoices",
    "view_invoices_purchase": "canViewPurchaseInvoices", 
    "create_sales_invoices": "canCreateSalesInvoices",
    "create_purchase_invoices": "canCreatePurchaseInvoices",
    "edit_sales_invoices": "canEditSalesInvoices",
    "edit_purchase_invoices": "canEditPurchaseInvoices",
    "delete_sales_invoices": "canDeleteSalesInvoices",
    "delete_purchase_invoices": "canDeletePurchaseInvoices",
    "manage_configuration": "canManageConfiguration",
    "manage_declarations": "canManageDeclarations",
    "manage_users": "canManageUsers",
    "view_reports": "canViewReports"
}

# Funkcja diagnostyczna - zwraca informacje o decyzji
decision := {
    "allow": allow,
    "user": input.user,
    "tenant": input.tenant,
    "action": input.action,
    "company_id": input.company_id,
    "user_roles": user_roles_safe,
    "user_permissions": user_permissions_safe,
    "user_companies": user_companies_safe,
    "required_permission": action_to_permission[input.action],
    "company_access": company_access_granted,
    "reason": reason
}

# Response z dodatkowymi informacjami dla debugowania
response := {
    "allow": allow,
    "user": input.user,
    "action": input.action,
    "company_id": input.company_id,
    "tenant": input.tenant,
    "user_roles": user_roles,
    "user_permissions": user_permissions,
    "required_permission": required_permission,
    "has_company_access": has_company_access,
    "reason": reason
}

# Bezpieczne pobieranie ról użytkownika
user_roles_safe := roles if {
    user_data := data.acl[input.tenant].data.users[input.user]
    roles := user_data.roles.ksef
} else = [] if true

# Bezpieczne pobieranie uprawnień użytkownika
user_permissions_safe := permissions if {
    user_data := data.acl[input.tenant].data.users[input.user]
    permissions := user_data.permissions.ksef
} else = [] if true

# Bezpieczne pobieranie firm użytkownika
user_companies_safe := companies if {
    user_data := data.acl[input.tenant].data.users[input.user]
    companies := [c.company_id | c := user_data.companies[_]]
} else = [] if true

reason := "Access granted - user has required permission and company access" if {
    allow
    company_access_granted
}

reason := "Access denied - user lacks required permission" if {
    not allow
    company_access_granted
    user_data := data.acl[input.tenant].data.users[input.user]
    ksef_permissions := user_data.permissions.ksef
    required_permission := action_to_permission[input.action]
    not required_permission in ksef_permissions
}

reason := "Access denied - no access to specified company" if {
    not company_access_granted
    input.company_id
}

reason := sprintf("Access denied - user permissions %v do not include required permission '%s'", [user_permissions_safe, action_to_permission[input.action]]) if {
    not allow
    not input.company_id
} 