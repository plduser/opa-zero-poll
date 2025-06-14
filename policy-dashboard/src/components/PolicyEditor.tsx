import React, { useState, useEffect, useCallback } from 'react';
import { Policy, PolicyValidationResult } from '../types';
import { 
  policyAPI, 
  PolicyValidationResponse, 
  formatValidationErrors, 
  formatExecutionTime 
} from '../services/api';

interface PolicyEditorProps {
  selectedPolicy: string | null;
}

export const PolicyEditor: React.FC<PolicyEditorProps> = ({ selectedPolicy }) => {
  const [currentPolicy, setCurrentPolicy] = useState<Policy | null>(null);
  const [content, setContent] = useState('');
  const [validationResult, setValidationResult] = useState<PolicyValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Mock policy data - normally would come from API
  const mockPolicies: Policy[] = [
    {
      id: '1',
      name: 'rbac.rego',
      path: '/policies/rbac.rego',
      content: `package rbac

import future.keywords.if

default allow := false

# Allow admins to do anything
allow if {
    input.user.role == "admin"
}

# Allow users to read their own data
allow if {
    input.method == "GET"
    input.user.id == input.resource.owner_id
}

# Allow public read access to public resources
allow if {
    input.method == "GET"
    input.resource.visibility == "public"
}`,
      description: 'Role-based access control policy',
      status: 'active',
      lastModified: new Date(Date.now() - 1000 * 60 * 30),
      author: 'admin',
      version: '1.2.0',
      tags: ['rbac', 'security', 'authorization'],
    },
    {
      id: '2',
      name: 'api_access.rego',
      path: '/policies/api_access.rego',
      content: `package api.authz

import future.keywords.if
import future.keywords.in

default allow := false

# Allow access if user has valid token and required permissions
allow if {
    input.token
    token.valid
    required_permissions
}

token := {"valid": true, "sub": "user123"} if {
    input.token == "valid-jwt-token"
}

required_permissions if {
    input.method == "GET"
    input.path[0] == "api"
    input.path[1] == "v1"
}`,
      description: 'API access control policy',
      status: 'active',
      lastModified: new Date(Date.now() - 1000 * 60 * 15),
      author: 'developer',
      version: '2.1.0',
      tags: ['api', 'authorization', 'jwt'],
    },
  ];

  useEffect(() => {
    if (selectedPolicy) {
      const policy = mockPolicies.find(p => p.id === selectedPolicy);
      if (policy) {
        setCurrentPolicy(policy);
        setContent(policy.content);
        // Clear previous validation when switching policies
        setValidationResult(null);
      }
    }
  }, [selectedPolicy]);

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await policyAPI.checkHealth();
        setIsConnected(true);
      } catch (error) {
        console.error('Backend connection failed:', error);
        setIsConnected(false);
      }
    };
    
    checkConnection();
  }, []);

  // Real-time validation with debouncing
  const validatePolicy = useCallback(async () => {
    if (!content.trim()) {
      setValidationResult(null);
      return;
    }

    setIsValidating(true);
    
    try {
      const response: PolicyValidationResponse = await policyAPI.validatePolicy({
        policy_content: content,
        policy_name: currentPolicy?.name,
      });

      // Convert backend response to frontend format
      setValidationResult({
        isValid: response.valid,
        errors: response.errors.map(error => ({
          line: error.line || 0,
          column: error.column || 0,
          message: error.message,
          severity: 'error' as const,
        })),
        warnings: response.warnings.map(warning => ({
          line: warning.line || 0,
          column: warning.column || 0,
          message: warning.message,
          suggestion: `Line ${warning.line}: ${warning.message}`,
        })),
        compilationTime: response.compilation_time_ms,
      });
      
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        isValid: false,
        errors: [{
          line: 0,
          column: 0,
          message: `Validation service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error',
        }],
        warnings: [],
      });
    } finally {
      setIsValidating(false);
    }
  }, [content, currentPolicy?.name]);

  // Debounced validation on content change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content && isConnected) {
        validatePolicy();
      }
    }, 1000); // Validate after 1 second of no typing

    return () => clearTimeout(timer);
  }, [content, validatePolicy, isConnected]);

  const savePolicy = async () => {
    setIsSaving(true);
    
    try {
      // Simulate save to backend - in real app this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update current policy
      if (currentPolicy) {
        const updatedPolicy = {
          ...currentPolicy,
          content,
          lastModified: new Date(),
          version: incrementVersion(currentPolicy.version),
        };
        setCurrentPolicy(updatedPolicy);
      }
      
      alert('Policy saved successfully! 🎉');
    } catch (error) {
      alert(`Save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const incrementVersion = (version: string): string => {
    const parts = version.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  };

  if (!selectedPolicy || !currentPolicy) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">✏️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Policy Selected</h3>
          <p className="text-gray-500">
            Select a policy from the Policies tab to start editing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="text-yellow-400 mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Backend Connection Lost
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Real-time validation is disabled. Make sure the backend is running on port 8001.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Policy Editor</h2>
          <p className="text-gray-600 mt-2">
            Editing: {currentPolicy.name} v{currentPolicy.version}
            {validationResult?.compilationTime && (
              <span className="ml-2 text-sm text-gray-500">
                (validated in {formatExecutionTime(validationResult.compilationTime)})
              </span>
            )}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={validatePolicy}
            disabled={isValidating || !isConnected}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              isValidating || !isConnected
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            {isValidating ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Validating...
              </>
            ) : (
              <>
                <span className="mr-2">✅</span>
                Validate Now
              </>
            )}
          </button>
          <button
            onClick={savePolicy}
            disabled={isSaving || (validationResult ? !validationResult.isValid : false)}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              isSaving || (validationResult ? !validationResult.isValid : false)
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <span className="mr-2">💾</span>
                Save Policy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Policy Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Policy Name
            </label>
            <p className="text-sm text-gray-900">{currentPolicy.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                validationResult?.isValid === false 
                  ? 'bg-red-100 text-red-800'
                  : validationResult?.isValid 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isValidating ? (
                  <>⏳ Validating</>
                ) : validationResult?.isValid === false ? (
                  <>❌ Invalid</>
                ) : validationResult?.isValid ? (
                  <>✅ Valid</>
                ) : (
                  <>⏸️ Not validated</>
                )}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Modified
            </label>
            <p className="text-sm text-gray-900">
              {currentPolicy.lastModified.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Validation Results */}
      {validationResult && (validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Validation Results</h3>
          
          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">❌ Errors</h4>
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <pre className="text-sm text-red-700 whitespace-pre-wrap">
                  {formatValidationErrors(validationResult.errors.map(e => ({
                    message: e.message,
                    line: e.line,
                    column: e.column,
                    severity: e.severity as any
                  })))}
                </pre>
              </div>
            </div>
          )}
          
          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Warnings</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                {validationResult.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-700">
                    <strong>Line {warning.line}:</strong> {warning.message}
                    {warning.suggestion && (
                      <div className="text-yellow-600 mt-1 italic">
                        💡 {warning.suggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Code Editor */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Policy Content</h3>
          <p className="text-sm text-gray-500 mt-1">
            Edit your Rego policy below. Validation happens automatically as you type.
          </p>
        </div>
        <div className="p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full h-96 p-4 border rounded-md font-mono text-sm resize-none ${
              validationResult?.isValid === false 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : validationResult?.isValid
                ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
            placeholder="Enter your Rego policy here..."
            spellCheck={false}
          />
          <div className="mt-2 text-sm text-gray-500">
            💡 Tip: Use proper Rego syntax. Real-time validation will show errors as you type.
          </div>
        </div>
      </div>

      {/* Syntax Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">📚 Rego Syntax Help</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Basic Structure:</h4>
            <pre className="text-blue-700 bg-blue-100 p-2 rounded text-xs overflow-x-auto">
{`package example

default allow = false

allow {
    input.user.role == "admin"
}`}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Common Patterns:</h4>
            <ul className="text-blue-700 space-y-1">
              <li>• Use <code className="bg-blue-100 px-1 rounded">input</code> to access request data</li>
              <li>• Set <code className="bg-blue-100 px-1 rounded">default</code> values for safety</li>
              <li>• Use <code className="bg-blue-100 px-1 rounded">==</code> for equality checks</li>
              <li>• Group conditions with <code className="bg-blue-100 px-1 rounded">{`{}`}</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 