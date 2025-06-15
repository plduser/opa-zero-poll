from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any

from app.models.policy import (
    PolicyValidationRequest,
    PolicyValidationResponse,
    PolicyTestRequest,
    PolicyTestResponse
)
from app.services.opa_service import opa_service

router = APIRouter()


@router.post("/validate", response_model=PolicyValidationResponse)
async def validate_policy(request: PolicyValidationRequest):
    """
    Validate a Rego policy using OPA CLI
    
    This endpoint compiles the policy and optionally tests it with input data
    to provide real-time validation feedback for the Policy Editor.
    """
    try:
        result = await opa_service.validate_policy(
            policy_content=request.policy_content,
            input_data=request.input_data
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Validation service error: {str(e)}"
        )


@router.post("/test", response_model=PolicyTestResponse)
async def test_policy(request: PolicyTestRequest):
    """
    Test a policy against input data
    
    This endpoint executes the policy with provided input data
    and returns the evaluation results for the Policy Tester.
    """
    try:
        result = await opa_service.test_policy(
            policy_content=request.policy_content,
            input_data=request.input_data,
            query=request.query
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Policy testing service error: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    Health check endpoint to verify OPA availability
    """
    try:
        # Test with a simple valid policy
        test_policy = """
package test

allow = true
"""
        result = await opa_service.validate_policy(test_policy)
        
        return {
            "status": "healthy",
            "opa_available": result.valid,
            "opa_path": opa_service.opa_path,
            "timestamp": "2025-06-13T12:00:00Z"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"OPA service unavailable: {str(e)}"
        ) 