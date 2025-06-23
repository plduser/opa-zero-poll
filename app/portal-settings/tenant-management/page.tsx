'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AccountCreationWizard } from '@/components/tenant-management/AccountCreationWizard'
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Users,
  Settings,
  Activity,
  UserPlus
} from 'lucide-react'

interface Tenant {
  tenant_id: string
  tenant_name: string
  created_at: string
  status: 'active' | 'inactive'
  metadata: Record<string, any>
}

interface TenantFormData {
  tenant_id: string
  tenant_name: string
  description: string
  config: string
  status: 'active' | 'inactive'
}

const PROVISIONING_API_URL = 'http://localhost:8010'

export default function TenantManagementPage() {
  // Mock authenticated user (w przyszłości z Azure B2C/Auth0) - TEMPORARY DISABLED TO TEST NO-AUTH CASE
  // const authenticatedUser = {
  //   email: "admin@company.com",
  //   name: "Jan Kowalski",
  //   firstName: "Jan",
  //   lastName: "Kowalski"
  // }
  const authenticatedUser = undefined // Test no-auth case

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAccountWizardOpen, setIsAccountWizardOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [formData, setFormData] = useState<TenantFormData>({
    tenant_id: '',
    tenant_name: '',
    description: '',
    config: '{}',
    status: 'active'
  })

  // Pobierz listę tenantów
  const fetchTenants = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${PROVISIONING_API_URL}/tenants`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setTenants(data.tenants || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching tenants:', err)
      setError(err instanceof Error ? err.message : 'Błąd podczas pobierania tenantów')
    } finally {
      setLoading(false)
    }
  }

  // Dodaj nowego tenanta
  const addTenant = async () => {
    try {
      // Walidacja JSON
      let parsedConfig = {}
      try {
        parsedConfig = JSON.parse(formData.config)
      } catch {
        setError('Nieprawidłowy format JSON w konfiguracji')
        return
      }

      const payload = {
        tenant_id: formData.tenant_id,
        tenant_name: formData.tenant_name,
        metadata: {
          description: formData.description,
          config: parsedConfig,
          status: formData.status
        }
      }

      const response = await fetch(`${PROVISIONING_API_URL}/provision-tenant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      setSuccess('Tenant został pomyślnie dodany')
      setIsDialogOpen(false)
      resetForm()
      fetchTenants()
    } catch (err) {
      console.error('Error adding tenant:', err)
      setError(err instanceof Error ? err.message : 'Błąd podczas dodawania tenanta')
    }
  }

  // Usuń tenanta
  const deleteTenant = async (tenantId: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć tenanta ${tenantId}?`)) {
      return
    }

    try {
      const response = await fetch(`${PROVISIONING_API_URL}/tenants/${tenantId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      setSuccess('Tenant został pomyślnie usunięty')
      fetchTenants()
    } catch (err) {
      console.error('Error deleting tenant:', err)
      setError(err instanceof Error ? err.message : 'Błąd podczas usuwania tenanta')
    }
  }

  // Zmień status tenanta
  const updateTenantStatus = async (tenantId: string, newStatus: 'active' | 'inactive') => {
    try {
      const response = await fetch(`${PROVISIONING_API_URL}/tenants/${tenantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      setSuccess(`Status tenanta został zmieniony na ${newStatus}`)
      fetchTenants()
    } catch (err) {
      console.error('Error updating tenant status:', err)
      setError(err instanceof Error ? err.message : 'Błąd podczas zmiany statusu tenanta')
    }
  }

  const resetForm = () => {
    setFormData({
      tenant_id: '',
      tenant_name: '',
      description: '',
      config: '{}',
      status: 'active'
    })
    setEditingTenant(null)
  }

  const openEditDialog = (tenant: Tenant) => {
    setEditingTenant(tenant)
    setFormData({
      tenant_id: tenant.tenant_id,
      tenant_name: tenant.tenant_name,
      description: tenant.metadata?.description || '',
      config: JSON.stringify(tenant.metadata?.config || {}, null, 2),
      status: tenant.status
    })
    setIsDialogOpen(true)
  }

  // Obsługa sukcesu Account Creation Wizard
  const handleAccountCreationSuccess = (data: any) => {
    setSuccess(`Konto zostało pomyślnie utworzone dla ${data.accountData.companyName}`)
    fetchTenants() // Odśwież listę tenantów
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  // Automatyczne ukrywanie komunikatów
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zarządzanie Tenantami</h1>
          <p className="text-gray-600 mt-2">
            Dodawaj, edytuj i zarządzaj tenantami w systemie OPA Zero Poll
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchTenants} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Odśwież
          </Button>
          <Button 
            onClick={() => setIsAccountWizardOpen(true)} 
            variant="outline" 
            className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            <UserPlus className="h-4 w-4" />
            Załóż konto
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Dodaj Tenanta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTenant ? 'Edytuj Tenanta' : 'Dodaj Nowego Tenanta'}
                </DialogTitle>
                <DialogDescription>
                  {editingTenant 
                    ? 'Modyfikuj dane istniejącego tenanta' 
                    : 'Wypełnij formularz aby dodać nowego tenanta do systemu'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenant_id">Identyfikator Tenanta *</Label>
                    <Input
                      id="tenant_id"
                      value={formData.tenant_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, tenant_id: e.target.value }))}
                      placeholder="np. company-123"
                      disabled={!!editingTenant}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenant_name">Nazwa Tenanta *</Label>
                    <Input
                      id="tenant_name"
                      value={formData.tenant_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, tenant_name: e.target.value }))}
                      placeholder="np. Firma ABC Sp. z o.o."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Opis</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Opcjonalny opis tenanta"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="config">Konfiguracja (JSON)</Label>
                  <Textarea
                    id="config"
                    value={formData.config}
                    onChange={(e) => setFormData(prev => ({ ...prev, config: e.target.value }))}
                    placeholder='{"key": "value"}'
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktywny</SelectItem>
                      <SelectItem value="inactive">Nieaktywny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Anuluj
                  </Button>
                  <Button onClick={addTenant}>
                    {editingTenant ? 'Zapisz Zmiany' : 'Dodaj Tenanta'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Komunikaty */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Łączna liczba tenantów</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywni tenanci</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tenants.filter(t => t.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nieaktywni tenanci</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {tenants.filter(t => t.status === 'inactive').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista tenantów */}
      <Card>
        <CardHeader>
          <CardTitle>Lista Tenantów</CardTitle>
          <CardDescription>
            Zarządzaj istniejącymi tenantami w systemie
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Ładowanie tenantów...</span>
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brak tenantów w systemie</p>
              <p className="text-sm">Dodaj pierwszego tenanta używając przycisku powyżej</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tenants.map((tenant) => (
                <div key={tenant.tenant_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{tenant.tenant_name}</h3>
                        <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                          {tenant.status === 'active' ? 'Aktywny' : 'Nieaktywny'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">ID: {tenant.tenant_id}</p>
                      <p className="text-sm text-gray-500">
                        Utworzony: {new Date(tenant.created_at).toLocaleString('pl-PL')}
                      </p>
                      {tenant.metadata?.description && (
                        <p className="text-sm text-gray-600 mt-2">{tenant.metadata.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTenantStatus(
                          tenant.tenant_id, 
                          tenant.status === 'active' ? 'inactive' : 'active'
                        )}
                      >
                        {tenant.status === 'active' ? 'Dezaktywuj' : 'Aktywuj'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(tenant)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTenant(tenant.tenant_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Creation Wizard */}
      <AccountCreationWizard
        isOpen={isAccountWizardOpen}
        onClose={() => setIsAccountWizardOpen(false)}
        onSuccess={handleAccountCreationSuccess}
        authenticatedUser={authenticatedUser}
      />
    </div>
  )
} 