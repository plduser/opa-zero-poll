"use client"

import { useState } from "react"
import { Search, CheckCircle, X, Plus, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AccessDialog } from "@/app/users/access-dialog"

export function ReportsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [isAccessGrantDialogOpen, setIsAccessGrantDialogOpen] = useState(false)
  const [accessDialogTitle, setAccessDialogTitle] = useState("")
  const [accessDialogItems, setAccessDialogItems] = useState<any[]>([])

  // Przykładowe dane raportów
  const reports = [
    {
      id: 1,
      name: "Raport sprzedaży - Maj 2023",
      type: "Sprzedaż",
      period: "Maj 2023",
      generated: "2023-05-31",
      format: "XLSX",
    },
    {
      id: 2,
      name: "Raport zakupów - Maj 2023",
      type: "Zakupy",
      period: "Maj 2023",
      generated: "2023-05-31",
      format: "XLSX",
    },
    {
      id: 3,
      name: "Zestawienie VAT - Kwiecień 2023",
      type: "VAT",
      period: "Kwiecień 2023",
      generated: "2023-05-10",
      format: "PDF",
    },
    {
      id: 4,
      name: "Raport sprzedaży - Kwiecień 2023",
      type: "Sprzedaż",
      period: "Kwiecień 2023",
      generated: "2023-04-30",
      format: "XLSX",
    },
    {
      id: 5,
      name: "Raport zakupów - Kwiecień 2023",
      type: "Zakupy",
      period: "Kwiecień 2023",
      generated: "2023-04-30",
      format: "XLSX",
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

  const filteredReports = reports.filter(
    (report) =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleManageAccess = (resource: any, type: string) => {
    setSelectedResource({ ...resource, type })
    setIsAccessDialogOpen(true)
  }

  const handleGrantAccess = () => {
    setAccessDialogTitle("Nadaj dostęp do raportów")
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
              <TableHead>Nazwa raportu</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Okres</TableHead>
              <TableHead>Data wygenerowania</TableHead>
              <TableHead>Format</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.name}</TableCell>
                <TableCell>{report.type}</TableCell>
                <TableCell>{report.period}</TableCell>
                <TableCell>{report.generated}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`
                      ${
                        report.format === "XLSX"
                          ? "bg-green-50 text-green-800 border-green-100"
                          : "bg-red-50 text-red-800 border-red-100"
                      } text-xs py-1 font-quicksand`}
                  >
                    {report.format}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleManageAccess(report, "report")}
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
            <DialogTitle className="text-xl font-bold font-quicksand">Zarządzanie uprawnieniami - Raport</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Raport: {selectedResource?.name}</h3>
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
