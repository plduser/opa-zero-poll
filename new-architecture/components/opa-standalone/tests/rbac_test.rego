package rbac

import rego.v1

# Test admin access - should allow all actions
test_admin_can_do_everything if {
	allow with input as {
		"user": "admin1",
		"role": "admin",
		"action": "read",
		"resource": "data"
	}
}

test_admin_can_write if {
	allow with input as {
		"user": "admin1", 
		"role": "admin",
		"action": "write",
		"resource": "sensitive"
	}
}

test_admin_can_delete if {
	allow with input as {
		"user": "admin1",
		"role": "admin", 
		"action": "delete",
		"resource": "anything"
	}
}

# Test user access to own data
test_user_can_read_own_data if {
	allow with input as {
		"user": "user1",
		"role": "user",
		"action": "read", 
		"resource": "data",
		"owner": "user1"
	}
}

test_user_can_update_own_data if {
	allow with input as {
		"user": "user1",
		"role": "user",
		"action": "update",
		"resource": "data",
		"owner": "user1"
	}
}

# Test user cannot access other's data
test_user_cannot_read_others_data if {
	not allow with input as {
		"user": "user1",
		"role": "user",
		"action": "read",
		"resource": "data", 
		"owner": "user2"
	}
}

test_user_cannot_delete_data if {
	not allow with input as {
		"user": "user1",
		"role": "user",
		"action": "delete",
		"resource": "data",
		"owner": "user1"
	}
}

# Test viewer access
test_viewer_can_read_data if {
	allow with input as {
		"user": "viewer1",
		"role": "viewer",
		"action": "read",
		"resource": "data"
	}
}

test_viewer_cannot_write_data if {
	not allow with input as {
		"user": "viewer1",
		"role": "viewer", 
		"action": "write",
		"resource": "data"
	}
}

test_viewer_cannot_update_data if {
	not allow with input as {
		"user": "viewer1",
		"role": "viewer",
		"action": "update", 
		"resource": "data"
	}
}

# Test public resource access
test_anyone_can_read_public if {
	allow with input as {
		"user": "anyone",
		"role": "guest",
		"action": "read",
		"resource": "public"
	}
}

test_user_can_read_public if {
	allow with input as {
		"user": "user1",
		"role": "user", 
		"action": "read",
		"resource": "public"
	}
}

# Test default deny
test_no_role_denies_access if {
	not allow with input as {
		"user": "user1",
		"action": "read",
		"resource": "data"
	}
}

test_unknown_role_denies_access if {
	not allow with input as {
		"user": "user1",
		"role": "unknown",
		"action": "read", 
		"resource": "data"
	}
}

# Test reason generation
test_reason_generation_allow if {
	reason == "Role 'admin' can perform action 'read' on resource 'data'" with input as {
		"user": "admin1",
		"role": "admin",
		"action": "read",
		"resource": "data"
	}
}

test_reason_generation_deny if {
	reason == "Role 'user' cannot perform action 'delete' on resource 'data'" with input as {
		"user": "user1", 
		"role": "user",
		"action": "delete",
		"resource": "data",
		"owner": "user2"
	}
} 