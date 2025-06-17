"use client"

import { useState, useEffect } from "react"
import { Header } from "@/app/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Shield,
  TestTube,
  Search,
  CheckCircle,
  AlertTriangle,
  LayoutDashboard,
  Users,
  Settings
} from "lucide-react"
import { PolicyTestModal } from "@/components/policy-management/PolicyTestModal"
import { SystemStatus } from "@/components/policy-management/SystemStatus"
import { SettingsTab } from "@/components/policy-management/SettingsTab"
import { Policy, policyAPI } from "@/lib/api"

export default function PolicyManagementPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("dashboard")
  const [testingPolicy, setTestingPolicy] = useState<Policy | null>(null)

  // Mock data - w przyszłości będzie pobierane z API
  const mockPolicies: Policy[] = [
    {
      id: "1",
      name: "RBAC Policy",
      description: "Role-Based Access Control dla eBiuro",
      content: `package rbac\n\ndefault allow = false\n\nallow {\n  user_has_role[_]\n}\n\nuser_has_role[role] {\n  role := input.user.roles[_]\n}`,
      status: "active",
      version: "1.2.0",
      tests: 15,
      testsStatus: "passed",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-20T14:30:00Z"
    },
    {
      id: "2",
      name: "KSEF Access Policy",
      description: "Kontrola dostępu do KSEF",
      content: `package ksef\n\ndefault allow = false\n\nallow {\n  input.method == "GET"\n  input.path[0] == "invoices"\n}`,
      status: "draft",
      version: "0.1.0",
      tests: 8,
      testsStatus: "pending",
      createdAt: "2024-01-22T09:15:00Z",
      updatedAt: "2024-01-22T09:15:00Z"
    }
  ]

  useEffect(() => {
    setPolicies(mockPolicies)
  }, [])

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTestPolicy = (policy: Policy) => {
    setTestingPolicy(policy)
  }

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab)
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Status systemu OPAL */}
      <SystemStatus refreshInterval={30} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Łączna liczba policy</p>
              <p className="text-2xl font-bold text-gray-900">{policies.length}</p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktywne policy</p>
              <p className="text-2xl font-bold text-gray-900">{policies.filter(p => p.status === 'active').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Testy zaliczone</p>
              <p className="text-2xl font-bold text-gray-900">{policies.filter(p => p.testsStatus === 'passed').length}</p>
            </div>
            <TestTube className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Ostatnie policy</h3>
        <div className="space-y-3">
          {policies.slice(0, 3).map((policy) => (
            <div key={policy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{policy.name}</p>
                  <p className="text-sm text-gray-600">{policy.description}</p>
                </div>
              </div>
              <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                {policy.status === 'active' ? 'Aktywna' : policy.status === 'draft' ? 'Szkic' : 'Nieaktywna'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPolicies = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zarządzanie Policy</h2>
          <p className="text-gray-600 mt-1">Policy są zarządzane przez system kontroli wersji (Git/GitHub)</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Wyszukaj policy..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Znaleziono {filteredPolicies.length} z {policies.length} policy
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Policy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wersja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Testy
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPolicies.map((policy) => (
              <tr key={policy.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">{policy.name}</div>
                      <div className="text-sm text-gray-600">{policy.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={policy.status === 'active' ? 'default' : 'secondary'}>
                    {policy.status === 'active' ? 'Aktywna' : policy.status === 'draft' ? 'Szkic' : 'Nieaktywna'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{policy.version}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">{policy.tests}</span>
                    {policy.testsStatus === 'passed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {policy.testsStatus === 'failed' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {policy.testsStatus === 'pending' && <div className="h-2 w-2 bg-yellow-400 rounded-full" />}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTestPolicy(policy)}
                      title="Testuj policy"
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPolicies.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Brak policy</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? "Nie znaleziono policy spełniających kryteria wyszukiwania." : "Policy są zarządzane przez system kontroli wersji."}
            </p>
            {!searchQuery && (
              <div className="mt-6">
                <p className="text-sm text-gray-600">
                  Aby dodać nową policy, użyj systemu Git/GitHub zgodnie z procesem CI/CD.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Header title="Policy Management" />

      <div className="flex">
        <aside className="w-[220px] min-h-[calc(100vh-64px)] border-r border-gray-200 bg-white">
          <nav className="py-4">
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${selectedTab === "dashboard" ? "bg-gray-50" : ""}`}
                  onClick={() => handleTabChange("dashboard")}
                >
                  <LayoutDashboard
                    className={`h-5 w-5 ${selectedTab === "dashboard" ? "text-green-600" : "text-gray-500"}`}
                  />
                  <span
                    className={`text-sm font-medium font-quicksand ${selectedTab === "dashboard" ? "text-green-600" : "text-gray-800"}`}
                  >
                    Pulpit
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${selectedTab === "policies" ? "bg-gray-50" : ""}`}
                  onClick={() => handleTabChange("policies")}
                >
                  <Shield className={`h-5 w-5 ${selectedTab === "policies" ? "text-green-600" : "text-gray-500"}`} />
                  <span
                    className={`text-base font-medium font-quicksand ${selectedTab === "policies" ? "text-green-600" : "text-gray-800"}`}
                  >
                    Policy
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${selectedTab === "testing" ? "bg-gray-50" : ""}`}
                  onClick={() => handleTabChange("testing")}
                >
                  <TestTube className={`h-5 w-5 ${selectedTab === "testing" ? "text-green-600" : "text-gray-500"}`} />
                  <span
                    className={`text-base font-medium font-quicksand ${selectedTab === "testing" ? "text-green-600" : "text-gray-800"}`}
                  >
                    Testowanie
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${selectedTab === "users" ? "bg-gray-50" : ""}`}
                  onClick={() => handleTabChange("users")}
                >
                  <Users className={`h-5 w-5 ${selectedTab === "users" ? "text-green-600" : "text-gray-500"}`} />
                  <span
                    className={`text-base font-medium font-quicksand ${selectedTab === "users" ? "text-green-600" : "text-gray-800"}`}
                  >
                    Użytkownicy
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${selectedTab === "settings" ? "bg-gray-50" : ""}`}
                  onClick={() => handleTabChange("settings")}
                >
                  <Settings className={`h-5 w-5 ${selectedTab === "settings" ? "text-green-600" : "text-gray-500"}`} />
                  <span
                    className={`text-base font-medium font-quicksand ${selectedTab === "settings" ? "text-green-600" : "text-gray-800"}`}
                  >
                    Ustawienia
                  </span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-8 bg-gray-50">
          {selectedTab === "dashboard" && renderDashboard()}
          {selectedTab === "policies" && renderPolicies()}
          {selectedTab === "testing" && (
            <div className="text-center py-12">
              <TestTube className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Testowanie Policy</h3>
              <p className="mt-1 text-sm text-gray-500">Ta sekcja będzie wkrótce dostępna.</p>
            </div>
          )}
          {selectedTab === "users" && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Zarządzanie użytkownikami</h3>
              <p className="mt-1 text-sm text-gray-500">Ta sekcja będzie wkrótce dostępna.</p>
            </div>
          )}
          {selectedTab === "settings" && <SettingsTab />}
        </main>
      </div>

      <PolicyTestModal
        isOpen={!!testingPolicy}
        onClose={() => setTestingPolicy(null)}
        policy={testingPolicy}
      />
    </div>
  )
} 