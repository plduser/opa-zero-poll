package ksef

import rego.v1
import data.rbac  # Import bazowej polityki RBAC

# Główna funkcja autoryzacji dla aplikacji KSEF
default allow := false

# Główne reguły autoryzacji dla KSEF - bazują na rolach użytkowników zgodnych z model2

allow if {
    # ksiegowa - ma dostęp do wszystkich faktury (zakupowe i sprzedażowe)
    "ksiegowa" in data.users.users[input.tenant][input.user].roles
    input.action in ["view_invoices_purchase", "view_invoices_sales", "manage_contractors", "export_to_symfonia"]
}

allow if {
    # handlowiec - tylko faktury sprzedażowe  
    "handlowiec" in data.users.users[input.tenant][input.user].roles
    input.action in ["view_invoices_sales"]
}

allow if {
    # zakupowiec - tylko faktury zakupowe
    "zakupowiec" in data.users.users[input.tenant][input.user].roles
    input.action in ["view_invoices_purchase"]
}

allow if {
    # administrator - pełny dostęp do wszystkiego
    "administrator" in data.users.users[input.tenant][input.user].roles
    # Administrator może wszystko - brak ograniczeń na akcje
}

# Funkcja diagnostyczna - zwraca informacje o decyzji
decision := {
    "allow": allow,
    "user": input.user,
    "tenant": input.tenant,
    "action": input.action,
    "user_roles": data.users.users[input.tenant][input.user].roles,
    "reason": reason
}

reason := "Access granted - user has required role" if allow
reason := sprintf("Access denied - user roles %v do not allow action '%s'", [data.users.users[input.tenant][input.user].roles, input.action]) if not allow 