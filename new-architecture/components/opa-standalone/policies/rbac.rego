package rbac

import rego.v1

# Default deny - security first approach
default allow := false

# Admin role can perform all actions on all resources
allow if {
	input.role == "admin"
}

# Users can read their own data
allow if {
	input.role == "user"
	input.action == "read"
	input.resource == "data"
	input.user == input.owner
}

# Users can update their own data
allow if {
	input.role == "user"
	input.action == "update"
	input.resource == "data"
	input.user == input.owner
}

# Viewers can only read data (but not modify)
allow if {
	input.role == "viewer"
	input.action == "read"
	input.resource == "data"
}

# Users can read public resources
allow if {
	input.action == "read"
	input.resource == "public"
}

# Generate reason for the decision
reason := sprintf("Role '%s' %s perform action '%s' on resource '%s'", [
	input.role,
	action_permission,
	input.action,
	input.resource
])

action_permission := "can" if allow
action_permission := "cannot" if not allow

# Additional context for debugging
context := {
	"user": input.user,
	"role": input.role,
	"action": input.action,
	"resource": input.resource,
	"owner": input.owner,
	"timestamp": time.now_ns()
} 