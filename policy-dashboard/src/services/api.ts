// API configuration and types
const API_BASE_URL = 'http://localhost:8001/api/v1';

// Request types matching backend models
export interface PolicyValidationRequest {
  policy_content: string;
  input_data?: Record<string, any>;
  policy_name?: string;
}

export interface PolicyTestRequest {
  policy_content: string;
  input_data: Record<string, any>;
  query?: string;
}

// Response types matching backend models
export interface ValidationError {
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface PolicyValidationResponse {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  compilation_time_ms?: number;
  result?: Record<string, any>;
}

export interface PolicyTestResponse {
  success: boolean;
  result: Record<string, any>;
  execution_time_ms: number;
  errors: ValidationError[];
}

export interface HealthCheckResponse {
  status: string;
  opa_available: boolean;
  opa_path: string;
  timestamp: string;
}

// API service class
class PolicyAPI {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Validate a Rego policy
  async validatePolicy(request: PolicyValidationRequest): Promise<PolicyValidationResponse> {
    return this.request<PolicyValidationResponse>('/policy/validate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Test a policy against input data
  async testPolicy(request: PolicyTestRequest): Promise<PolicyTestResponse> {
    return this.request<PolicyTestResponse>('/policy/test', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Check OPA health status
  async checkHealth(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('/policy/health');
  }

  // Check API health
  async checkAPIHealth(): Promise<{ status: string; service: string; version: string }> {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    return response.json();
  }
}

// Export singleton instance
export const policyAPI = new PolicyAPI();

// Utility functions for React components
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors
    .map(error => {
      const lineInfo = error.line ? ` (line ${error.line})` : '';
      return `${error.severity.toUpperCase()}: ${error.message}${lineInfo}`;
    })
    .join('\n');
};

export const extractPolicyResult = (result: Record<string, any>): any => {
  // Extract actual policy result from OPA response structure
  if (result?.result?.[0]?.expressions?.[0]?.value) {
    return result.result[0].expressions[0].value;
  }
  return result;
};

export const formatExecutionTime = (timeMs: number): string => {
  if (timeMs < 1000) {
    return `${timeMs}ms`;
  }
  return `${(timeMs / 1000).toFixed(2)}s`;
}; 