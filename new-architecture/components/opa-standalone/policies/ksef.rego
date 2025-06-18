package ksef

import rego.v1
import data.rbac  # Import bazowej polityki RBAC

# Główna funkcja autoryzacji dla aplikacji KSEF
default allow := false

# Główne reguły autoryzacji dla KSEF - używamy rzeczywistych danych z /acl/{tenant}

allow if {
    # Sprawdzamy czy użytkownik istnieje w rzeczywistych danych
    user_data := data.acl[input.tenant].users[input.user]
    
    # Sprawdzamy bezpośrednio uprawnienia w permissions.ksef
    ksef_permissions := user_data.permissions.ksef
    
    # Mapowanie akcji na wymagane uprawnienia
    required_permission := action_to_permission[input.action]
    required_permission in ksef_permissions
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
    "user_roles": user_roles_safe,
    "user_permissions": user_permissions_safe,
    "required_permission": action_to_permission[input.action],
    "reason": reason
}

# Bezpieczne pobieranie ról użytkownika
user_roles_safe := roles if {
    user_data := data.acl[input.tenant].users[input.user]
    roles := user_data.roles.ksef
} else = [] if true

# Bezpieczne pobieranie uprawnień użytkownika
user_permissions_safe := permissions if {
    user_data := data.acl[input.tenant].users[input.user]
    permissions := user_data.permissions.ksef
} else = [] if true

reason := "Access granted - user has required permission" if allow
reason := sprintf("Access denied - user permissions %v do not include required permission '%s'", [user_permissions_safe, action_to_permission[input.action]]) if not allow 