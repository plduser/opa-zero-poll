"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, AlertTriangle, TestTube, Code, Play, Beaker, Info } from "lucide-react";
import { Policy, policyAPI } from "@/lib/api";

interface PolicyTestModalProps {
  policy: Policy | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PolicyTestModal({ policy, isOpen, onClose }: PolicyTestModalProps) {
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDevelopmentMode] = useState(true); // Założenie: tryb development

  // Generowanie przykładowych danych na podstawie typu policy
  const generateSampleData = (policyName: string) => {
    const sampleData: Record<string, any> = {
      "RBAC Policy": {
        user: {
          id: "user_1750141671",
          roles: ["admin", "user"],
          permissions: ["read", "write", "delete"]
        },
        resource: "documents",
        action: "read",
        tenant: "tenant1"
      },
      "KSEF Access Policy": {
        user: "user_1750141671",
        tenant: "tenant1",
        action: "view_invoices_purchase"
      },
      default: {
        user: {
          id: "test_user",
          roles: ["user"]
        },
        action: "read",
        resource: "test_resource",
        tenant: "tenant1"
      }
    };

    return sampleData[policyName] || sampleData.default;
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      setTestResult(null);
      setError(null);
    }
  };

  const handleTest = async () => {
    if (!policy) return;

    setIsLoading(true);
    setError(null);

    try {
      let inputData;
      try {
        inputData = JSON.parse(testInput);
      } catch (parseError) {
        throw new Error("Nieprawidłowy format JSON w danych testowych");
      }

      if (isDevelopmentMode) {
        // Mock response dla development mode
        const mockResult = {
          result: Math.random() > 0.3, // 70% szans na pozytywny rezultat
          allowed: Math.random() > 0.3,
          decision: {
            allow: Math.random() > 0.3,
            user: inputData.user || inputData.user?.id || "test_user",
            action: inputData.action || "test_action",
            user_roles: inputData.user?.roles || ["user"],
            reason: Math.random() > 0.3 
              ? "Access granted - user has required role" 
              : "Access denied - insufficient permissions"
          },
          errors: []
        };

        // Symulacja opóźnienia API
        await new Promise(resolve => setTimeout(resolve, 800));
        setTestResult(mockResult);
      } else {
        // Próba komunikacji z rzeczywistym API
        const result = await policyAPI.testPolicy({
          policy: policy.content,
          input: inputData
        });
        setTestResult(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nieznany błąd podczas testowania");
    } finally {
      setIsLoading(false);
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(testInput);
      setTestInput(JSON.stringify(parsed, null, 2));
    } catch (err) {
      setError("Nieprawidłowy format JSON");
    }
  };

  const loadSampleData = () => {
    const sampleData = generateSampleData(policy?.name || "");
    setTestInput(JSON.stringify(sampleData, null, 2));
    setError(null);
  };

  if (!policy) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Testowanie Policy: {policy.name}
          </DialogTitle>
          <DialogDescription>
            Przetestuj policy z różnymi danymi wejściowymi
          </DialogDescription>
        </DialogHeader>

        {isDevelopmentMode && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <Info className="h-4 w-4" />
              <span className="font-medium">Tryb Development</span>
            </div>
            <div className="text-blue-700 text-sm mt-1">
              Policy testuje się z mock danymi. W produkcji test wykonałby się na rzeczywistym OPA engine.
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Policy Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Informacje o Policy</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <Badge variant={policy.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                  {policy.status === 'active' ? 'Aktywna' : 'Nieaktywna'}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Wersja:</span>
                <span className="ml-2 font-mono">{policy.version}</span>
              </div>
            </div>
          </div>

          {/* Test Input */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Dane testowe (JSON)</h4>
              <div className="flex gap-2">
                <Button
                  onClick={loadSampleData}
                  size="sm"
                  variant="outline"
                  className="text-sm"
                >
                  <Beaker className="h-4 w-4 mr-1" />
                  Załaduj przykład
                </Button>
                <Button
                  onClick={formatJSON}
                  size="sm"
                  variant="outline"
                  className="text-sm"
                >
                  <Code className="h-4 w-4 mr-1" />
                  Formatuj JSON
                </Button>
              </div>
            </div>
            <textarea
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Wprowadź dane testowe w formacie JSON..."
              className="w-full h-48 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Test Button */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {isDevelopmentMode && (
                <span className="text-blue-600">🧪 Mock testing mode - symulowane wyniki</span>
              )}
            </div>
            <Button
              onClick={handleTest}
              disabled={isLoading || !testInput.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testowanie...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Uruchom test
                </>
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Błąd</span>
              </div>
              <div className="text-red-700 text-sm mt-1">{error}</div>
            </div>
          )}

          {/* Test Results */}
          {testResult && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Wynik testu</h4>
              
              {/* Decision Summary */}
              <div className="flex items-center gap-3 mb-4">
                {testResult.result || testResult.decision?.allow ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <div className="font-medium text-lg">
                    {testResult.result || testResult.decision?.allow ? 'DOZWOLONE' : 'ODRZUCONE'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testResult.decision?.reason || 'Brak szczegółów decyzji'}
                  </div>
                </div>
              </div>

              {/* Decision Details */}
              {testResult.decision && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Szczegóły decyzji</h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Użytkownik:</span>
                      <span className="ml-2 font-mono">
                        {typeof testResult.decision.user === 'object' 
                          ? JSON.stringify(testResult.decision.user) 
                          : testResult.decision.user}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Akcja:</span>
                      <span className="ml-2 font-mono">
                        {typeof testResult.decision.action === 'object' 
                          ? JSON.stringify(testResult.decision.action) 
                          : testResult.decision.action}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Role użytkownika:</span>
                      <span className="ml-2 font-mono">
                        {Array.isArray(testResult.decision.user_roles) 
                          ? testResult.decision.user_roles.join(', ') 
                          : typeof testResult.decision.user_roles === 'object'
                          ? JSON.stringify(testResult.decision.user_roles)
                          : testResult.decision.user_roles || 'Brak ról'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw Response (Debug) */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Szczegółowa odpowiedź (debug)
                </summary>
                <pre className="mt-2 p-3 bg-gray-900 text-green-400 text-xs rounded-lg overflow-x-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 