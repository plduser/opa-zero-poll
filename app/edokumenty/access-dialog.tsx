"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface AccessDialogProps {
  title: string
  isOpen: boolean
  onClose: () => void
  resourceType: string
  resourceName?: string
}

export function AccessDialog({ title, isOpen, onClose, resourceType, resourceName }: AccessDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Przykładowe grupy
  const groups = [
    { id: 1, name: "ADMINISTRATOR", description: "Pełny dostęp do systemu" },
    { id: 2, name: "DOSTĘP DO KLIENTÓW", description: "Dostęp do modułu klientów" },
    { id: 3, name: "DOSTĘP DO SPRAW", description: "Dostęp do modułu spraw" },
    { id: 4, name: "SEKRETARIAT", description: "Uprawnienia dla sekretariatu" },
    { id: 5, name: "EDYCJA DOKUMENTÓW", description: "Możliwość edycji dokumentów" },
  ]

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Podstawowy zestaw uprawnień dla eDokumenty (prostszy niż w FK)
  const permissions = [
    { id: "read", name: "Odczyt", description: "Możliwość przeglądania zasobu" },
    { id: "edit", name: "Edycja", description: "Możliwość modyfikacji zasobu" },
    { id: "delete", name: "Usuwanie", description: "Możliwość usuwania zasobu" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-quicksand">{title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Grupy</h3>
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Wyszukaj grupę"
                className="pl-10 border-gray-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
            </div>
            <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Grupa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-gray-500">{group.description}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Poziomy dostępu</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Uprawnienie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-gray-500">{permission.description}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" className="mr-2" onClick={onClose}>
            Anuluj
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">Nadaj dostęp</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
