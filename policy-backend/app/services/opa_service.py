import asyncio
import json
import tempfile
import time
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

from app.core.config import settings
from app.models.policy import (
    ValidationError, 
    PolicyValidationResponse, 
    PolicyTestResponse,
    ValidationSeverity
)


class OPAService:
    """Service for interacting with OPA CLI"""
    
    def __init__(self):
        self.opa_path = settings.OPA_BINARY_PATH
        self.timeout = settings.OPA_TIMEOUT
    
    async def validate_policy(
        self, 
        policy_content: str, 
        input_data: Optional[Dict[str, Any]] = None
    ) -> PolicyValidationResponse:
        """
        Validate a Rego policy using OPA CLI
        
        Args:
            policy_content: The Rego policy code to validate
            input_data: Optional input data for testing
            
        Returns:
            PolicyValidationResponse with validation results
        """
        start_time = time.time()
        errors = []
        warnings = []
        result = None
        
        try:
            # First, validate syntax by trying to compile
            is_valid, compile_errors = await self._compile_policy(policy_content)
            errors.extend(compile_errors)
            
            # If compilation successful and input data provided, test execution
            if is_valid and input_data:
                test_result, test_errors = await self._test_policy(policy_content, input_data)
                errors.extend(test_errors)
                result = test_result
            
            compilation_time = int((time.time() - start_time) * 1000)
            
            return PolicyValidationResponse(
                valid=len([e for e in errors if e.severity == ValidationSeverity.ERROR]) == 0,
                errors=[e for e in errors if e.severity == ValidationSeverity.ERROR],
                warnings=[e for e in errors if e.severity == ValidationSeverity.WARNING],
                compilation_time_ms=compilation_time,
                result=result
            )
            
        except Exception as e:
            return PolicyValidationResponse(
                valid=False,
                errors=[ValidationError(
                    message=f"Unexpected error during validation: {str(e)}",
                    severity=ValidationSeverity.ERROR
                )],
                compilation_time_ms=int((time.time() - start_time) * 1000)
            )
    
    async def test_policy(
        self, 
        policy_content: str, 
        input_data: Dict[str, Any],
        query: str = "data"
    ) -> PolicyTestResponse:
        """
        Test a policy against input data
        
        Args:
            policy_content: The Rego policy code
            input_data: Input data for testing
            query: OPA query to execute (default: "data")
            
        Returns:
            PolicyTestResponse with test results
        """
        start_time = time.time()
        
        try:
            # First validate the policy
            validation_result = await self.validate_policy(policy_content)
            if not validation_result.valid:
                return PolicyTestResponse(
                    success=False,
                    result={},
                    execution_time_ms=int((time.time() - start_time) * 1000),
                    errors=validation_result.errors
                )
            
            # Execute the policy
            result, errors = await self._execute_policy(policy_content, input_data, query)
            
            return PolicyTestResponse(
                success=len(errors) == 0,
                result=result or {},
                execution_time_ms=int((time.time() - start_time) * 1000),
                errors=errors
            )
            
        except Exception as e:
            return PolicyTestResponse(
                success=False,
                result={},
                execution_time_ms=int((time.time() - start_time) * 1000),
                errors=[ValidationError(
                    message=f"Error executing policy: {str(e)}",
                    severity=ValidationSeverity.ERROR
                )]
            )
    
    async def _compile_policy(self, policy_content: str) -> Tuple[bool, List[ValidationError]]:
        """Compile policy to check for syntax errors"""
        errors = []
        
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.rego', delete=False) as f:
                f.write(policy_content)
                temp_path = f.name
            
            try:
                # Use OPA fmt to check syntax
                cmd = [self.opa_path, "fmt", temp_path]
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(), 
                    timeout=self.timeout
                )
                
                if process.returncode != 0:
                    error_msg = stderr.decode() if stderr else "Unknown compilation error"
                    errors.append(self._parse_opa_error(error_msg))
                    return False, errors
                
                return True, errors
                
            finally:
                Path(temp_path).unlink(missing_ok=True)
                
        except asyncio.TimeoutError:
            errors.append(ValidationError(
                message="Policy compilation timed out",
                severity=ValidationSeverity.ERROR
            ))
            return False, errors
        except Exception as e:
            errors.append(ValidationError(
                message=f"Compilation error: {str(e)}",
                severity=ValidationSeverity.ERROR
            ))
            return False, errors
    
    async def _test_policy(
        self, 
        policy_content: str, 
        input_data: Dict[str, Any]
    ) -> Tuple[Optional[Dict[str, Any]], List[ValidationError]]:
        """Test policy execution with input data"""
        return await self._execute_policy(policy_content, input_data, "data")
    
    async def _execute_policy(
        self, 
        policy_content: str, 
        input_data: Dict[str, Any],
        query: str
    ) -> Tuple[Optional[Dict[str, Any]], List[ValidationError]]:
        """Execute policy with OPA eval"""
        errors = []
        
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.rego', delete=False) as policy_file:
                policy_file.write(policy_content)
                policy_path = policy_file.name
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as input_file:
                json.dump(input_data, input_file)
                input_path = input_file.name
            
            try:
                cmd = [
                    self.opa_path, "eval",
                    "--data", policy_path,
                    "--input", input_path,
                    "--format", "json",
                    query
                ]
                
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=self.timeout
                )
                
                if process.returncode != 0:
                    error_msg = stderr.decode() if stderr else "Unknown execution error"
                    errors.append(self._parse_opa_error(error_msg))
                    return None, errors
                
                # Parse OPA output
                output = stdout.decode()
                if output.strip():
                    result = json.loads(output)
                    return result, errors
                
                return {}, errors
                
            finally:
                Path(policy_path).unlink(missing_ok=True)
                Path(input_path).unlink(missing_ok=True)
                
        except asyncio.TimeoutError:
            errors.append(ValidationError(
                message="Policy execution timed out",
                severity=ValidationSeverity.ERROR
            ))
            return None, errors
        except json.JSONDecodeError as e:
            errors.append(ValidationError(
                message=f"Failed to parse OPA output: {str(e)}",
                severity=ValidationSeverity.ERROR
            ))
            return None, errors
        except Exception as e:
            errors.append(ValidationError(
                message=f"Execution error: {str(e)}",
                severity=ValidationSeverity.ERROR
            ))
            return None, errors
    
    def _parse_opa_error(self, error_msg: str) -> ValidationError:
        """Parse OPA error message to extract line/column info"""
        # Basic error parsing - can be enhanced
        lines = error_msg.strip().split('\n')
        message = lines[0] if lines else error_msg
        
        # Try to extract line number from error message
        line_num = None
        for line in lines:
            if ':' in line and 'line' in line.lower():
                try:
                    parts = line.split(':')
                    for part in parts:
                        if part.strip().isdigit():
                            line_num = int(part.strip())
                            break
                except ValueError:
                    pass
        
        return ValidationError(
            message=message,
            line=line_num,
            severity=ValidationSeverity.ERROR
        )


# Global OPA service instance
opa_service = OPAService() 