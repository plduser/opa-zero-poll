"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield } from "lucide-react"

interface GroupPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group?: any
  permissions?: any[]
  onSave?: () => void
}

export function GroupPermissionsDialog({
  open,
  onOpenChange,
  group,
  permissions: propPermissions,
  onSave,
}: GroupPermissionsDialogProps) {
  const [activeTab, setActiveTab] = useState("permissions")
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  // Dodajemy flagę, aby zapobiec nieskończonej pętli aktualizacji
  const [initialSetupDone, setInitialSetupDone] = useState(false)

  // Zaktualizowane uprawnienia zgodnie z matrycą
  const defaultPermissions = [
    {
      id: 1,
      name: "Zarządzanie użytkownikami",
      description: "Możliwość zarządzania użytkownikami w systemie KSEF",
    },
    {
      id: 2,
      name: "Zmiana ustawień KSEF",
      description: "Możliwość zmiany ustawień systemu KSEF",
    },
    {
      id: 3,
      name: "Zarządzanie kontrahentami",
      description: "Możliwość zarządzania kontrahentami w systemie KSEF",
    },
    {
      id: 4,
      name: "Zmiana notyfikacji KSEF",
      description: "Możliwość zmiany ustawień notyfikacji KSEF",
    },
    {
      id: 5,
      name: "Dostęp do Dane konta (pełny)",
      description: "Pełny dostęp do danych konta KSEF",
    },
    {
      id: 6,
      name: "Dane konta (widok uproszczony)",
      description: "Dostęp do uproszczonego widoku danych konta",
    },
    {
      id: 7,
      name: "Widoczność WebView",
      description: "Dostęp do widoku WebView w systemie KSEF",
    },
    {
      id: 8,
      name: "Faktury zakupowe kosztowe",
      description: "Dostęp do faktur zakupowych kosztowych",
    },
    {
      id: 9,
      name: "Faktury zakupowe handlowe",
      description: "Dostęp do faktur zakupowych handlowych",
    },
    {
      id: 10,
      name: "Pobieranie faktur do HM/FK",
      description: "Możliwość pobierania faktur do systemów HM/FK",
    },
    {
      id: 11,
      name: "Operacje na dokumentach (Sprawdź na białej liście)",
      description: "Możliwość sprawdzania dokumentów na białej liście",
    },
    {
      id: 12,
      name: "Operacje na dokumentach (Pobieranie UPO)",
      description: "Możliwość pobierania UPO dla dokumentów",
    },
    {
      id: 13,
      name: "Faktury sprzedażowe (przeglądanie)",
      description: "Dostęp do przeglądania faktur sprzedażowych",
    },
    {
      id: 14,
      name: "Wysyłanie do Symfonia sprzedaż",
      description: "Możliwość wysyłania faktur do systemu Symfonia sprzedaż",
    },
    {
      id: 15,
      name: "Zapis do pliku (XML/PDF)",
      description: "Możliwość zapisywania dokumentów do plików XML/PDF",
    },
    {
      id: 16,
      name: "Dodawanie załączników",
      description: "Możliwość dodawania załączników do dokumentów",
    },
  ]

  // Mapowanie grup na uprawnienia zgodnie z matrycą
  const groupPermissionsMap: Record<string, number[]> = {
    Księgowa: [2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    Handlowiec: [6, 11, 13, 16],
    Zakupowiec: [6, 7, 9, 10, 11, 16],
    Administrator: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    Właściciel: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    "Administrator KSEF": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    "Wystawiający faktury": [6, 7, 13, 14, 15, 16],
    "Odbierający faktury": [6, 7, 8, 9, 10, 11, 12, 15, 16],
    Przeglądający: [6, 7, 8, 9, 13],
  }

  // Używamy przekazanych danych lub domyślnych
  const permissions = propPermissions || defaultPermissions

  // Resetuj stan przy otwarciu/zamknięciu dialogu
  useEffect(() => {
    if (open) {
      setInitialSetupDone(false)
    }
  }, [open])

  // Aktualizuj wybrane wartości, gdy zmienia się grupa - tylko raz przy otwarciu dialogu
  useEffect(() => {
    if (group && open && !initialSetupDone) {
      console.log("Inicjalizacja danych grupy:", group)

      // Ustaw uprawnienia na podstawie grupy
      const permissionIds = groupPermissionsMap[group.name] || []
      setSelectedPermissions(permissionIds)

      // Oznacz, że początkowa konfiguracja została zakończona
      setInitialSetupDone(true)
    }
  }, [group, open, initialSetupDone, groupPermissionsMap])

  const handleTogglePermission = (id: number) => {
    if (selectedPermissions.includes(id)) {
      setSelectedPermissions(selectedPermissions.filter((permId) => permId !== id))
    } else {
      setSelectedPermissions([...selectedPermissions, id])
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
    onOpenChange(false)
  }

  // Jeśli group jest undefined, użyj domyślnych wartości
  const groupName = group?.name || "Grupa"
  const groupDescription = group?.description || "Brak opisu"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-quicksand">
            Zarządzanie uprawnieniami grupy: {groupName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informacje o grupie */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Nazwa grupy:</p>
                <p className="font-medium">{groupName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Opis:</p>
                <p className="text-sm">{groupDescription}</p>
              </div>
            </div>
          </div>

          {/* Zakładki dla różnych metod nadawania uprawnień */}
          <Tabs defaultValue="permissions" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 grid grid-cols-1">
              <TabsTrigger value="permissions" className="font-quicksand">
                <Shield className="h-4 w-4 mr-2" />
                Uprawnienia
              </TabsTrigger>
            </TabsList>

            <TabsContent value="permissions" className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  Uprawnienia określają, do jakich funkcji systemu grupa będzie miała dostęp.
                </p>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Wybierz</TableHead>
                        <TableHead>Uprawnienie</TableHead>
                        <TableHead>Opis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow
                          key={permission.id}
                          className={selectedPermissions.includes(permission.id) ? "bg-green-50" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => handleTogglePermission(permission.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{permission.name}</TableCell>
                          <TableCell>{permission.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand" onClick={handleSave}>
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
