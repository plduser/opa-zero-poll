import React, { useState, useEffect } from 'react';
import { TestCase, TestResult, PolicyTest } from '../types';
import { 
  policyAPI, 
  PolicyTestResponse, 
  extractPolicyResult, 
  formatExecutionTime 
} from '../services/api';

export const PolicyTester: React.FC = () => {
  const [selectedPolicy, setSelectedPolicy] = useState('rbac.rego');
  const [inputData, setInputData] = useState(`{
  "user": {
    "id": "user123",
    "role": "admin",
    "email": "admin@example.com"
  },
  "method": "GET",
  "path": ["users", "user123"],
  "resource": {
    "owner_id": "user123",
    "visibility": "private"
  }
}`);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [testError, setTestError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // Mock policies with actual Rego content
  const availablePolicies = [
    {
      name: 'rbac.rego',
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
}`
    },
    {
      name: 'api_access.rego',
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
}`
    }
  ];

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

  const runTest = async () => {
    setIsRunning(true);
    setTestError(null);
    setExecutionTime(null);
    
    try {
      // Parse input data
      let parsedInput;
      try {
        parsedInput = JSON.parse(inputData);
      } catch (parseError) {
        throw new Error(`Invalid JSON input: ${parseError instanceof Error ? parseError.message : 'Parse error'}`);
      }

      // Get selected policy content
      const selectedPolicyData = availablePolicies.find(p => p.name === selectedPolicy);
      if (!selectedPolicyData) {
        throw new Error('Selected policy not found');
      }

      // Call backend API to test policy
      const response: PolicyTestResponse = await policyAPI.testPolicy({
        policy_content: selectedPolicyData.content,
        input_data: parsedInput,
        query: 'data' // Get all results
      });

      setExecutionTime(response.execution_time_ms);

      if (!response.success) {
        setTestError(response.errors.map(e => e.message).join(', ') || 'Test execution failed');
        setTestResults([]);
        return;
      }

      // Extract and format results
      const extractedResult = extractPolicyResult(response.result);
      
      // Convert to display format
      const formattedResults = [{
        query: 'Policy Evaluation',
        result: extractedResult,
        success: true,
        executionTime: response.execution_time_ms
      }];

      setTestResults(formattedResults);
      
    } catch (error) {
      console.error('Test execution error:', error);
      setTestError(error instanceof Error ? error.message : 'Unknown error occurred');
      setTestResults([]);
    } finally {
      setIsRunning(false);
    }
  };

  const predefinedTests = [
    {
      name: 'Admin Access Test',
      description: 'Test admin user access to all resources',
      input: {
        user: { id: 'admin1', role: 'admin' },
        method: 'GET',
        resource: { visibility: 'private' }
      }
    },
    {
      name: 'User Own Data Test',
      description: 'Test user access to their own data',
      input: {
        user: { id: 'user123', role: 'user' },
        method: 'GET',
        resource: { owner_id: 'user123', visibility: 'private' }
      }
    },
    {
      name: 'Public Resource Test',
      description: 'Test access to public resources',
      input: {
        user: { id: 'user456', role: 'user' },
        method: 'GET',
        resource: { visibility: 'public' }
      }
    },
    {
      name: 'API Token Test',
      description: 'Test API access with JWT token',
      input: {
        token: 'valid-jwt-token',
        method: 'GET',
        path: ['api', 'v1', 'users']
      }
    }
  ];

  const loadPredefinedTest = (test: any) => {
    setInputData(JSON.stringify(test.input, null, 2));
  };

  const formatResultValue = (value: any): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Policy Tester</h2>
        <p className="text-gray-600 mt-2">
          Test your OPA policies with custom input data and see results in real-time
        </p>
      </div>

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
                Policy testing is disabled. Make sure the backend is running on port 8001.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Configuration */}
        <div className="space-y-6">
          {/* Policy Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Test Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="policy" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Policy
                </label>
                <select
                  id="policy"
                  value={selectedPolicy}
                  onChange={(e) => setSelectedPolicy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {availablePolicies.map((policy) => (
                    <option key={policy.name} value={policy.name}>
                      {policy.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="input" className="block text-sm font-medium text-gray-700">
                    Input Data (JSON)
                  </label>
                  <button
                    onClick={runTest}
                    disabled={isRunning || !isConnected}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      isRunning || !isConnected
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Running Test...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🧪</span>
                        Run Test
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  id="input"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                  placeholder="Enter JSON input data for testing..."
                />
                <div className="mt-2 text-sm text-gray-500">
                  💡 Tip: Enter valid JSON data that matches your policy's expected input structure
                </div>
              </div>
            </div>
          </div>

          {/* Predefined Tests */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Predefined Test Cases</h3>
            <div className="space-y-3">
              {predefinedTests.map((test, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => loadPredefinedTest(test)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{test.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{test.description}</p>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700 text-sm">
                      Load →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Test Results */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Test Results
                {executionTime && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({formatExecutionTime(executionTime)})
                  </span>
                )}
              </h3>
            </div>
            <div className="p-6">
              {testError ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">❌</div>
                  <h4 className="text-lg font-medium text-red-800 mb-2">Test Failed</h4>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <pre className="text-sm text-red-700 whitespace-pre-wrap">
                      {testError}
                    </pre>
                  </div>
                </div>
              ) : testResults.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🧪</div>
                  <p className="text-gray-500">No test results yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Configure your input data and click "Run Test" to see results
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {result.query}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {result.success ? '✅ Success' : '❌ Failed'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatExecutionTime(result.executionTime)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded p-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Result:</h5>
                        <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
                          {formatResultValue(result.result)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Policy Preview */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Policy Preview</h3>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {selectedPolicy}
                </h4>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                  {availablePolicies.find(p => p.name === selectedPolicy)?.content || 'Policy content not found'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 