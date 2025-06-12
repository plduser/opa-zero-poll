package main

import rego.v1

# Test 1: Księgowy może przeglądać faktury
test_accountant_can_view_invoice if {
    allow with input as {
        "user_id": "user123",
        "tenant_id": "tenant1", 
        "action": "view_invoice"
    } with data.users as {
        "tenant1": {
            "user123": {"roles": ["accountant"]}
        }
    }
}

# Test 2: Księgowy NIE może zatwierdzać płatności
test_accountant_cannot_approve_payment if {
    not allow with input as {
        "user_id": "user123",
        "tenant_id": "tenant1",
        "action": "approve_payment"
    } with data.users as {
        "tenant1": {
            "user123": {"roles": ["accountant"]}
        }
    }
}

# Test 3: Manager może zatwierdzać płatności
test_manager_can_approve_payment if {
    allow with input as {
        "user_id": "user456",
        "tenant_id": "tenant1",
        "action": "approve_payment"
    } with data.users as {
        "tenant1": {
            "user456": {"roles": ["manager"]}
        }
    }
}

# Test 4: Admin może zarządzać użytkownikami
test_admin_can_manage_users if {
    allow with input as {
        "user_id": "user789",
        "tenant_id": "tenant1",
        "action": "manage_users"
    } with data.users as {
        "tenant1": {
            "user789": {"roles": ["admin"]}
        }
    }
}

# Test 5: Użytkownik bez roli nie może nic robić
test_no_role_denies_access if {
    not allow with input as {
        "user_id": "user000",
        "tenant_id": "tenant1",
        "action": "view_invoice"
    } with data.users as {
        "tenant1": {
            "user000": {"roles": []}
        }
    }
}

# Test 6: Nieistniejący użytkownik nie ma dostępu
test_nonexistent_user_denied if {
    not allow with input as {
        "user_id": "nonexistent",
        "tenant_id": "tenant1",
        "action": "view_invoice"
    } with data.users as {
        "tenant1": {}
    }
} 