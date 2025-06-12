package main

import rego.v1

# Domyślnie odrzucamy wszystkie żądania
default allow := false

# Pozwalamy jeśli użytkownik ma odpowiednią rolę dla akcji
allow if {
    some required_role in roles_for_action[input.action]
    user_has_role(input.user_id, input.tenant_id, required_role)
}

# Mapowanie akcji na wymagane role
roles_for_action := {
    "view_invoice": ["accountant", "manager"],
    "approve_payment": ["manager"],
    "manage_users": ["admin"],
    "view_reports": ["accountant", "manager", "admin"]
}

# Sprawdza czy użytkownik ma daną rolę w tenancie
user_has_role(user_id, tenant_id, role) if {
    role in data.users[tenant_id][user_id].roles
} 