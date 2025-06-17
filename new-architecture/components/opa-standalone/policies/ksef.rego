package ksef

import rego.v1
import data.rbac  # Import bazowej polityki RBAC

# Główna funkcja autoryzacji dla aplikacji KSEF
default allow := false

# Główne reguły autoryzacji dla KSEF - używamy rzeczywistych danych z /acl/{tenant}

allow if {
    # Sprawdzamy czy użytkownik istnieje w rzeczywistych danych
    user_data := data.acl[input.tenant].data.users[input.user]
    
    # Ksiegowa - ma dostęp do wszystkich faktury (zakupowe i sprzedażowe)
    ksef_roles := user_data.roles.ksef
    "Ksiegowa" in ksef_roles
    input.action in ["view_invoices_purchase", "view_invoices_sales", "manage_contractors", "export_to_symfonia"]
}

allow if {
    # Handlowiec - tylko faktury sprzedażowe  
    user_data := data.acl[input.tenant].data.users[input.user]
    ksef_roles := user_data.roles.ksef
    "Handlowiec" in ksef_roles
    input.action in ["view_invoices_sales"]
}

allow if {
    # Zakupowiec - tylko faktury zakupowe
    user_data := data.acl[input.tenant].data.users[input.user]
    ksef_roles := user_data.roles.ksef
    "Zakupowiec" in ksef_roles
    input.action in ["view_invoices_purchase"]
}

allow if {
    # Administrator - pełny dostęp do wszystkiego
    user_data := data.acl[input.tenant].data.users[input.user]
    ksef_roles := user_data.roles.ksef
    "Administrator" in ksef_roles
    # Administrator może wszystko - brak ograniczeń na akcje
}

# Funkcja diagnostyczna - zwraca informacje o decyzji
decision := {
    "allow": allow,
    "user": input.user,
    "tenant": input.tenant,
    "action": input.action,
    "user_roles": user_roles_safe,
    "reason": reason
}

# Bezpieczne pobieranie ról użytkownika
user_roles_safe := roles if {
    user_data := data.acl[input.tenant].data.users[input.user]
    roles := user_data.roles.ksef
} else = [] if true

reason := "Access granted - user has required role" if allow
reason := sprintf("Access denied - user roles %v do not allow action '%s'", [user_roles_safe, input.action]) if not allow 