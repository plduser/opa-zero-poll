"use client"

import { useState } from "react"
import { Key, Plus, Copy, Eye, EyeOff, Trash2, MoreVertical, CheckCircle } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useAppMenu } from "@/hooks/use-app-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  createdAt: string
  lastUsed: string | null
  status: "active" | "disabled"
}

export default function ApiKeysPage() {
  const { menuItems, activeItem, currentApp } = useAppMenu()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [newKeyName, setNewKeyName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production API",
      key: "sk_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567",
      permissions: ["read:users", "write:users", "read:companies"],
      createdAt: "2024-01-15",
      lastUsed: "2024-01-20",
      status: "active"
    },
    {
      id: "2", 
      name: "Development API",
      key: "sk_test_zyx987wvu654tsr321qpo098nml765kji432hgf109edc876ba543",
      permissions: ["read:users", "read:companies"],
      createdAt: "2024-01-10",
      lastUsed: null,
      status: "disabled"
    }
  ])

  const availablePermissions = [
    { id: "read:users", label: "Odczyt użytkowników", description: "Wyświetlanie listy i szczegółów użytkowników" },
    { id: "write:users", label: "Zapis użytkowników", description: "Tworzenie i edycja użytkowników" },
    { id: "read:companies", label: "Odczyt firm", description: "Wyświetlanie listy i szczegółów firm" },
    { id: "write:companies", label: "Zapis firm", description: "Tworzenie i edycja firm" },
    { id: "read:teams", label: "Odczyt zespołów", description: "Wyświetlanie listy i szczegółów zespołów" },
    { id: "write:teams", label: "Zapis zespołów", description: "Tworzenie i edycja zespołów" },
    { id: "admin", label: "Administrator", description: "Pełny dostęp do wszystkich zasobów" }
  ]

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId)
    } else {
      newVisible.add(keyId)
    }
    setVisibleKeys(newVisible)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Skopiowano!",
      description: "Klucz API został skopiowany do schowka.",
    })
  }

  const maskKey = (key: string) => {
    return key.substring(0, 12) + "..." + key.substring(key.length - 4)
  }

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_live_${Math.random().toString(36).substr(2, 50)}`,
      permissions: selectedPermissions,
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: null,
      status: "active"
    }

    setApiKeys([...apiKeys, newKey])
    setNewKeyName("")
    setSelectedPermissions([])
    setIsCreateDialogOpen(false)
    
    toast({
      title: "Klucz API utworzony!",
      description: "Nowy klucz API został pomyślnie utworzony.",
    })
  }

  const deleteKey = (keyId: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== keyId))
    toast({
      title: "Klucz usunięty",
      description: "Klucz API został trwale usunięty.",
      variant: "destructive"
    })
  }

  const toggleKeyStatus = (keyId: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === keyId 
        ? { ...key, status: key.status === "active" ? "disabled" : "active" }
        : key
    ))
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader title={currentApp} />
      
      <div className="flex">
        <AppSidebar menuItems={menuItems} activeItem={activeItem} />
        
        <main className="flex-1 p-8 bg-gray-50">
          <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Key className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Klucze API</h1>
            </div>
            <p className="text-gray-600">
              Zarządzaj kluczami API dla dostępu do zasobów tenanta
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Utwórz klucz API
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Utwórz nowy klucz API</DialogTitle>
                <DialogDescription>
                  Nadaj nazwę kluczowi i wybierz uprawnienia
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Nazwa klucza</Label>
                  <Input
                    id="key-name"
                    placeholder="np. Production API"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Uprawnienia</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availablePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, permission.id])
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(p => p !== permission.id))
                            }
                          }}
                          className="mt-1"
                        />
                        <div>
                          <Label htmlFor={permission.id} className="text-sm font-medium">
                            {permission.label}
                          </Label>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Anuluj
                </Button>
                <Button onClick={handleCreateKey} disabled={!newKeyName.trim() || selectedPermissions.length === 0}>
                  Utwórz klucz
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktywne klucze API</CardTitle>
          <CardDescription>
            Lista wszystkich kluczy API dla Twojego tenanta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>Klucz</TableHead>
                <TableHead>Uprawnienia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ostatnie użycie</TableHead>
                <TableHead>Utworzono</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {apiKey.permissions.map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission.replace(":", ": ")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={apiKey.status === "active" ? "default" : "secondary"}
                      className={apiKey.status === "active" ? "bg-green-100 text-green-800" : ""}
                    >
                      {apiKey.status === "active" ? "Aktywny" : "Wyłączony"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {apiKey.lastUsed ? (
                      <span className="text-sm text-gray-600">{apiKey.lastUsed}</span>
                    ) : (
                      <span className="text-sm text-gray-400">Nigdy</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{apiKey.createdAt}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleKeyStatus(apiKey.id)}>
                          {apiKey.status === "active" ? "Wyłącz" : "Włącz"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteKey(apiKey.id)}
                          className="text-red-600"
                        >
                          Usuń
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </main>
      </div>
    </div>
  )
} 