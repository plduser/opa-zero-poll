import pytest
from app.services.opa_service import opa_service
from app.models.policy import ValidationSeverity


@pytest.mark.asyncio
async def test_validate_simple_policy():
    """Test validation of a simple valid policy"""
    policy_content = """
package test

allow = true
"""
    
    result = await opa_service.validate_policy(policy_content)
    
    assert result.valid is True
    assert len(result.errors) == 0
    assert result.compilation_time_ms is not None
    assert result.compilation_time_ms > 0


@pytest.mark.asyncio
async def test_validate_invalid_policy():
    """Test validation of an invalid policy"""
    policy_content = """
package test

allow = this_will_cause_syntax_error ?
"""
    
    result = await opa_service.validate_policy(policy_content)
    
    assert result.valid is False
    assert len(result.errors) > 0
    assert result.errors[0].severity == ValidationSeverity.ERROR


@pytest.mark.asyncio
async def test_test_policy_with_input():
    """Test policy execution with input data"""
    policy_content = """
package test

allow = input.user == "admin"
"""
    
    # Test with admin user (should allow)
    result = await opa_service.test_policy(
        policy_content=policy_content,
        input_data={"user": "admin"}
    )
    
    assert result.success is True
    assert "test" in result.result["result"][0]["expressions"][0]["value"]
    assert result.result["result"][0]["expressions"][0]["value"]["test"]["allow"] is True
    
    # Test with regular user (should deny)
    result = await opa_service.test_policy(
        policy_content=policy_content,
        input_data={"user": "john"}
    )
    
    assert result.success is True
    assert result.result["result"][0]["expressions"][0]["value"]["test"]["allow"] is False


@pytest.mark.asyncio
async def test_validate_policy_with_input():
    """Test validation with input data"""
    policy_content = """
package test

allow = input.action == "read"
"""
    
    result = await opa_service.validate_policy(
        policy_content=policy_content,
        input_data={"action": "read"}
    )
    
    assert result.valid is True
    assert result.result is not None 