"use client"

import { useState } from "react"
import { Search, CheckCircle, X, Plus, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AccessDialog } from "@/app/users/access-dialog"

export function DeclarationsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [isAccessGrantDialogOpen, setIsAccessGrantDialogOpen] = useState(false)
  const [accessDialogTitle, setAccessDialogTitle] = useState("")
  const [accessDialogItems, setAccessDialogItems] = useState<any[]>([])

  // Przykładowe dane deklaracji
  const declarations = [
    {
      id: 1,
      name: "JPK_V7M - Kwiecień 2023",
      type: "JPK_V7M",
      period: "Kwiecień 2023",
      submitted: "2023-05-25",
      status: "Złożona",
    },
    {
      id: 2,
      name: "JPK_V7M - Marzec 2023",
      type: "JPK_V7M",
      period: "Marzec 2023",
      submitted: "2023-04-25",
      status: "Złożona",
    },
    {
      id: 3,
      name: "JPK_V7M - Luty 2023",
      type: "JPK_V7M",
      period: "Luty 2023",
      submitted: "2023-03-25",
      status: "Złożona",
    },
    {
      id: 4,
      name: "JPK_V7M - Maj 2023",
      type: "JPK_V7M",
      period: "Maj 2023",
      submitted: "-",
      status: "Robocza",
    },
    {
      id: 5,
      name: "CIT-8 - 2022",
      type: "CIT-8",
      period: "2022",
      submitted: "2023-03-31",
      status: "Złożona",
    },
  ]

  // Przykładowe dane użytkowników
  const users = [
    {
      id: 1,
      name: "Jan Kowalski",
      email: "jan.kowalski@nazwafirmy.pl",
      role: "Administrator",
    },
    {
      id: 2,
      name: "Anna Wiśniewska",
      email: "anna.wisniewska@nazwafirmy.pl",
      role: "Wystawiający",
    },
    {
      id: 3,
      name: "Piotr Zieliński",
      email: "piotr.zielinski@nazwafirmy.pl",
      role: "Zatwierdzający",
    },
    {
      id: 4,
      name: "Adam Nowak",
      email: "adam.nowak@nazwafirmy.pl",
      role: "Pełny dostęp",
    },
    {
      id: 5,
      name: "Marta Lis",
      email: "marta.lis@nazwafirmy.pl",
      role: "Przeglądający",
    },
  ]

  const filteredDeclarations = declarations.filter(
    (declaration) =>
      declaration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      declaration.type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleManageAccess = (resource: any, type: string) => {
    setSelectedResource({ ...resource, type })
    setIsAccessDialogOpen(true)
  }

  const handleGrantAccess = () => {
    setAccessDialogTitle("Nadaj dostęp do deklaracji")
    setAccessDialogItems(users)
    setIsAccessGrantDialogOpen(true)
  }

  return (
    <div>
      {showSuccessMessage && (
        <div className="flex items-start gap-4 p-4 mb-6 bg-purple-50 border border-purple-200 rounded-lg">
          <CheckCircle className="h-6 w-6 text-purple-800 flex-shrink-0" />
          <div>
            <p className="font-bold text-purple-800">Zaktualizowano uprawnienia</p>
            <p className="text-sm text-purple-800">Zmiany zostały zapisane pomyślnie</p>
          </div>
          <button className="ml-auto text-purple-800" onClick={() => setShowSuccessMessage(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="relative w-[280px]">
          <Input
            type="text"
            placeholder="Wyszukaj na liście"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
        </div>
        <Button onClick={handleGrantAccess} className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
          Nadaj dostęp <Plus className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa deklaracji</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Okres</TableHead>
              <TableHead>Data złożenia</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeclarations.map((declaration) => (
              <TableRow key={declaration.id}>
                <TableCell className="font-medium">{declaration.name}</TableCell>
                <TableCell>{declaration.type}</TableCell>
                <TableCell>{declaration.period}</TableCell>
                <TableCell>{declaration.submitted}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`
                      ${
                        declaration.status === "Złożona"
                          ? "bg-green-50 text-green-800 border-green-100"
                          : "bg-amber-50 text-amber-800 border-amber-100"
                      } text-xs py-1 font-quicksand`}
                  >
                    {declaration.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleManageAccess(declaration, "declaration")}
                    className="text-green-600"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog zarządzania uprawnieniami */}
      <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-quicksand">
              Zarządzanie uprawnieniami - Deklaracja
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Deklaracja: {selectedResource?.name}</h3>
              <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
                <Plus className="h-4 w-4 mr-2" /> Nadaj dostęp
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Użytkownik</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Poziom dostępu</TableHead>
                    <TableHead>Data nadania</TableHead>
                    <TableHead>Nadane przez</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Jan Kowalski</TableCell>
                    <TableCell>jan.kowalski@nazwafirmy.pl</TableCell>
                    <TableCell>
                      <select
                        className="w-full h-9 px-3 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                        defaultValue="manage"
                      >
                        <option value="read">Odczyt</option>
                        <option value="write">Zapis</option>
                        <option value="manage">Zarządzanie</option>
                      </select>
                    </TableCell>
                    <TableCell>2023-05-10</TableCell>
                    <TableCell>Administrator</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                        Usuń
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Anna Wiśniewska</TableCell>
                    <TableCell>anna.wisniewska@nazwafirmy.pl</TableCell>
                    <TableCell>
                      <select
                        className="w-full h-9 px-3 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                        defaultValue="write"
                      >
                        <option value="read">Odczyt</option>
                        <option value="write">Zapis</option>
                        <option value="manage">Zarządzanie</option>
                      </select>
                    </TableCell>
                    <TableCell>2023-05-08</TableCell>
                    <TableCell>Administrator</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                        Usuń
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAccessDialogOpen(false)}>
              Anuluj
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
              onClick={() => {
                setShowSuccessMessage(true)
                setIsAccessDialogOpen(false)
                setTimeout(() => setShowSuccessMessage(false), 5000)
              }}
            >
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dodaj komponent AccessDialog na końcu komponentu */}
      <AccessDialog
        open={isAccessGrantDialogOpen}
        onOpenChange={setIsAccessGrantDialogOpen}
        title={accessDialogTitle}
        items={accessDialogItems}
        onSave={() => {
          setShowSuccessMessage(true)
          setTimeout(() => setShowSuccessMessage(false), 5000)
        }}
      />
    </div>
  )
}
