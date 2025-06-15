# Enhanced Model 1 Data Structure
# Zawiera roles per application, permissions per application, companies access i companies catalog

ENHANCED_ACL_DATA = {
    "tenant1": {
        "tenant_id": "tenant1",
        "tenant_name": "Test Company 1", 
        "users": [
            {
                "user_id": "user1",
                "username": "admin_user",
                # Enhanced Model 1: Roles per application
                "roles": {
                    "fk": ["fk_admin"],
                    "hr": ["hr_admin"],
                    "crm": ["crm_admin"]
                },
                # Enhanced Model 1: Permissions per application
                "permissions": {
                    "fk": ["view_entry", "edit_entry", "delete_entry", "manage_accounts", "generate_reports", "approve_entries"],
                    "hr": ["view_profile", "edit_profile", "delete_profile", "manage_contracts", "manage_salaries", "generate_hr_reports"],
                    "crm": ["view_client", "edit_client", "delete_client", "manage_deals", "generate_crm_reports", "manage_pipelines"]
                },
                # Enhanced Model 1: Companies access (minimal format - tylko GUID)
                "companies": ["company1", "company2"]
            },
            {
                "user_id": "user2", 
                "username": "regular_user",
                # Enhanced Model 1: Roles per application
                "roles": {
                    "fk": ["fk_editor"],
                    "hr": ["hr_viewer"]
                },
                # Enhanced Model 1: Permissions per application
                "permissions": {
                    "fk": ["view_entry", "edit_entry", "generate_reports"],
                    "hr": ["view_profile", "view_contract"]
                },
                # Enhanced Model 1: Companies access (minimal format - tylko GUID)
                "companies": ["company1"]
            },
            {
                "user_id": "user3",
                "username": "viewer_user",
                # Enhanced Model 1: Roles per application
                "roles": {
                    "fk": ["fk_viewer"]
                },
                # Enhanced Model 1: Permissions per application
                "permissions": {
                    "fk": ["view_entry", "generate_basic_reports"]
                },
                # Enhanced Model 1: Companies access (minimal format - tylko GUID)
                "companies": ["company2"]
            }
        ],
        # Enhanced Model 1: Role definitions per application
        "roles": {
            "fk": {
                "fk_admin": ["view_entry", "edit_entry", "delete_entry", "manage_accounts", "generate_reports", "approve_entries", "manage_chart_of_accounts"],
                "fk_editor": ["view_entry", "edit_entry", "generate_reports", "create_invoices", "edit_invoices"],
                "fk_viewer": ["view_entry", "generate_basic_reports", "view_invoices"]
            },
            "hr": {
                "hr_admin": ["view_profile", "edit_profile", "delete_profile", "manage_contracts", "manage_salaries", "generate_hr_reports", "manage_vacation_requests"],
                "hr_editor": ["view_profile", "edit_profile", "edit_contract", "generate_hr_reports", "manage_vacation_requests"],
                "hr_viewer": ["view_profile", "view_contract", "view_organizational_structure"]
            },
            "crm": {
                "crm_admin": ["view_client", "edit_client", "delete_client", "manage_deals", "generate_crm_reports", "manage_pipelines", "access_analytics"],
                "crm_editor": ["view_client", "edit_client", "manage_deals", "generate_crm_reports", "manage_activities"],
                "crm_viewer": ["view_client", "view_deals", "view_activities", "generate_basic_crm_reports"]
            }
        },
        # Enhanced Model 1: Companies catalog (minimal format - tylko GUID)
        "companies": ["company1", "company2"]
    },
    "tenant2": {
        "tenant_id": "tenant2",
        "tenant_name": "Test Company 2",
        "users": [
            {
                "user_id": "user4",
                "username": "hr_specialist", 
                # Enhanced Model 1: Roles per application
                "roles": {
                    "hr": ["hr_editor"]
                },
                # Enhanced Model 1: Permissions per application
                "permissions": {
                    "hr": ["view_profile", "edit_profile", "edit_contract", "generate_hr_reports"]
                },
                # Enhanced Model 1: Companies access (minimal format - tylko GUID)
                "companies": ["company3"]
            }
        ],
        # Enhanced Model 1: Role definitions per application
        "roles": {
            "hr": {
                "hr_editor": ["view_profile", "edit_profile", "edit_contract", "generate_hr_reports", "manage_vacation_requests"],
                "hr_viewer": ["view_profile", "view_contract"]
            }
        },
        # Enhanced Model 1: Companies catalog (minimal format - tylko GUID)
        "companies": ["company3"]
    }
} 