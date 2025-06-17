"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Shield } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface PermissionDefinition {
  id: number
  name: string
  description: string
  module: string
  isDefault: boolean
}

interface PermissionDefinitionsTabProps {
  onSuccess: () => void
}

export function PermissionDefinitionsTab({ onSuccess }: PermissionDefinitionsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

  const permissionDefinitions: PermissionDefinition[] = [
    // Dokumenty księgowe
    {
      id: 1,
      name: "Przeglądanie dokumentów",
      description: "Możliwość przeglądania dokumentów księgowych",
      module: "Dokumenty księgowe",
      isDefault: true,
    },
    {
      id: 2,
      name: "Tworzenie dokumentów",
      description: "Możliwość tworzenia nowych dokumentów księgowych",
      module: "Dokumenty księgowe",
      isDefault: false,
    },
    {
      id: 3,
      name: "Edycja dokumentów",
      description: "Możliwość edycji istniejących dokumentów księgowych",
      module: "Dokumenty księgowe",
      isDefault: false,
    },
    {
      id: 4,
      name: "Zatwierdzanie dokumentów",
      description: "Możliwość zatwierdzania dokumentów księgowych",
      module: "Dokumenty księgowe",
      isDefault: false,
    },
    {
      id: 5,
      name: "Księgowanie dokumentów",
      description: "Możliwość księgowania dokumentów",
      module: "Dokumenty księgowe",
      isDefault: false,
    },
    {
      id: 6,
      name: "Anulowanie dokumentów",
      description: "Możliwość anulowania dokumentów księgowych",
      module: "Dokumenty księgowe",
      isDefault: false,
    },
    // Raporty
    {
      id: 7,
      name: "Przeglądanie raportów",
      description: "Możliwość przeglądania raportów finansowych",
      module: "Raporty",
      isDefault: true,
    },
    {
      id: 8,
      name: "Tworzenie raportów",
      description: "Możliwość tworzenia nowych raportów",
      module: "Raporty",
      isDefault: false,
    },
    {
      id: 9,
      name: "Eksport raportów",
      description: "Możliwość eksportowania raportów do różnych formatów",
      module: "Raporty",
      isDefault: false,
    },
    {
      id: 10,
      name: "Zatwierdzanie raportów",
      description: "Możliwość zatwierdzania raportów finansowych",
      module: "Raporty",
      isDefault: false,
    },
    // Rozrachunki
    {
      id: 11,
      name: "Przeglądanie rozrachunków",
      description: "Możliwość przeglądania rozrachunków",
      module: "Rozrachunki",
      isDefault: true,
    },
    {
      id: 12,
      name: "Tworzenie płatności",
      description: "Możliwość tworzenia nowych płatności",
      module: "Rozrachunki",
      isDefault: false,
    },
    {
      id: 13,
      name: "Rozliczanie płatności",
      description: "Możliwość rozliczania płatności",
      module: "Rozrachunki",
      isDefault: false,
    },
    {
      id: 14,
      name: "Windykacja",
      description: "Dostęp do funkcji windykacji należności",
      module: "Rozrachunki",
      isDefault: false,
    },
    // Słowniki
    {
      id: 15,
      name: "Przeglądanie słowników",
      description: "Możliwość przeglądania słowników",
      module: "Słowniki",
      isDefault: true,
    },
    {
      id: 16,
      name: "Edycja słowników",
      description: "Możliwość edycji słowników",
      module: "Słowniki",
      isDefault: false,
    },
    {
      id: 17,
      name: "Zarządzanie kontrahentami",
      description: "Możliwość zarządzania kontrahentami",
      module: "Słowniki",
      isDefault: false,
    },
    {
      id: 18,
      name: "Zarządzanie planem kont",
      description: "Możliwość zarządzania planem kont",
      module: "Słowniki",
      isDefault: false,
    },
    // Konfiguracja
    {
      id: 19,
      name: "Ustawienia systemu",
      description: "Dostęp do ustawień systemu",
      module: "Konfiguracja",
      isDefault: false,
    },
    {
      id: 20,
      name: "Zarządzanie okresami obrachunkowymi",
      description: "Możliwość zarządzania okresami obrachunkowymi",
      module: "Konfiguracja",
      isDefault: false,
    },
    {
      id: 21,
      name: "Zamknięcie roku",
      description: "Możliwość wykonania operacji zamknięcia roku",
      module: "Konfiguracja",
      isDefault: false,
    },
    // Deklaracje
    {
      id: 22,
      name: "Przeglądanie deklaracji",
      description: "Możliwość przeglądania deklaracji podatkowych",
      module: "Deklaracje",
      isDefault: true,
    },
    {
      id: 23,
      name: "Tworzenie deklaracji",
      description: "Możliwość tworzenia nowych deklaracji podatkowych",
      module: "Deklaracje",
      isDefault: false,
    },
    {
      id: 24,
      name: "Wysyłanie deklaracji",
      description: "Możliwość wysyłania deklaracji podatkowych",
      module: "Deklaracje",
      isDefault: false,
    },
  ]

  const modules = Array.from(new Set(permissionDefinitions.map((p) => p.module)))

  const filteredPermissions = permissionDefinitions.filter(
    (permission) =>
      (selectedModule === null || permission.module === selectedModule) &&
      (permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permission.module.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative w-[320px]">
            <Input
              type="text"
              placeholder="Wyszukaj uprawnienie"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Moduł:</span>
            <select
              className="border rounded-md px-3 py-1.5 text-sm"
              value={selectedModule || ""}
              onChange={(e) => setSelectedModule(e.target.value || null)}
            >
              <option value="">Wszystkie</option>
              {modules.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
          Dodaj uprawnienie <Plus className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Uprawnienie</TableHead>
              <TableHead>Opis</TableHead>
              <TableHead>Moduł</TableHead>
              <TableHead>Domyślne</TableHead>
              <TableHead className="w-[120px]">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{permission.name}</span>
                  </div>
                </TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell>{permission.module}</TableCell>
                <TableCell>
                  <Checkbox checked={permission.isDefault} disabled />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
