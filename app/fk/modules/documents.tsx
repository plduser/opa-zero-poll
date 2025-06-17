"use client"

import type React from "react"

import { FileText, Search, Filter, Download, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

interface DocumentsProps {
  formatAmount: (amount: number) => string
  formatDate: (dateString: string) => string
  renderDocumentStatus: (status: string) => React.ReactNode
}

export function Documents({ formatAmount, formatDate, renderDocumentStatus }: DocumentsProps) {
  const [selectedDocumentType, setSelectedDocumentType] = useState("all")

  // Przykładowe dane dla Dokumentów księgowych
  const documents = [
    {
      id: "FV/2023/05/123",
      type: "Faktura sprzedaży",
      number: "FV/2023/05/123",
      date: "2023-05-15",
      dueDate: "2023-05-29",
      contractor: "Techland Sp. z o.o.",
      amount: 12500.0,
      tax: 2875.0,
      total: 15375.0,
      status: "Zaksięgowana",
      description: "Usługi programistyczne - maj 2023",
    },
    {
      id: "FZ/2023/05/087",
      type: "Faktura zakupu",
      number: "FZ/2023/05/087",
      date: "2023-05-14",
      dueDate: "2023-05-28",
      contractor: "Platige Image S.A.",
      amount: 8750.5,
      tax: 2012.62,
      total: 10763.12,
      status: "Do zatwierdzenia",
      description: "Licencje oprogramowania - roczne",
    },
    {
      id: "PK/2023/05/045",
      type: "Polecenie księgowania",
      number: "PK/2023/05/045",
      date: "2023-05-13",
      dueDate: "-",
      contractor: "-",
      amount: 5000.0,
      tax: 0.0,
      total: 5000.0,
      status: "Zatwierdzona",
      description: "Korekta amortyzacji środków trwałych",
    },
    {
      id: "WB/2023/05/012",
      type: "Wyciąg bankowy",
      number: "WB/2023/05/012",
      date: "2023-05-12",
      dueDate: "-",
      contractor: "Bank Pekao S.A.",
      amount: 35000.0,
      tax: 0.0,
      total: 35000.0,
      status: "Zaksięgowany",
      description: "Wyciąg bankowy za okres 01-10.05.2023",
    },
    {
      id: "KP/2023/05/034",
      type: "Kasa przyjmie",
      number: "KP/2023/05/034",
      date: "2023-05-11",
      dueDate: "-",
      contractor: "Jan Nowak",
      amount: 1200.0,
      tax: 0.0,
      total: 1200.0,
      status: "Zaksięgowana",
      description: "Zwrot zaliczki",
    },
    {
      id: "FV/2023/05/124",
      type: "Faktura sprzedaży",
      number: "FV/2023/05/124",
      date: "2023-05-16",
      dueDate: "2023-05-30",
      contractor: "11 bit studios S.A.",
      amount: 18500.0,
      tax: 4255.0,
      total: 22755.0,
      status: "Wystawiona",
      description: "Usługi konsultingowe - maj 2023",
    },
    {
      id: "FZ/2023/05/088",
      type: "Faktura zakupu",
      number: "FZ/2023/05/088",
      date: "2023-05-15",
      dueDate: "2023-05-29",
      contractor: "Bloober Team S.A.",
      amount: 5250.75,
      tax: 1207.67,
      total: 6458.42,
      status: "Do zatwierdzenia",
      description: "Materiały biurowe",
    },
  ]

  // Filtrowanie dokumentów według typu
  const filteredDocuments = documents.filter(
    (doc) => selectedDocumentType === "all" || doc.type.toLowerCase().includes(selectedDocumentType.toLowerCase()),
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
        <FileText className="h-6 w-6" />
        Dokumenty księgowe
      </h1>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 flex flex-wrap gap-4 items-center justify-between border-b">
          <div className="flex items-center gap-4">
            <div className="relative w-[280px]">
              <Input type="text" placeholder="Wyszukaj dokument" className="pl-10 border-gray-300" />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Typ:</span>
              <select
                className="border rounded-md px-3 py-1.5 text-sm"
                value={selectedDocumentType}
                onChange={(e) => setSelectedDocumentType(e.target.value)}
              >
                <option value="all">Wszystkie</option>
                <option value="faktura sprzedaży">Faktury sprzedaży</option>
                <option value="faktura zakupu">Faktury zakupu</option>
                <option value="polecenie">Polecenia księgowania</option>
                <option value="wyciąg">Wyciągi bankowe</option>
                <option value="kasa">Dokumenty kasowe</option>
              </select>
            </div>

            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filtry
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Eksport
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
              Nowy dokument <Plus className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox />
                </TableHead>
                <TableHead>Numer</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Termin płatności</TableHead>
                <TableHead>Kontrahent</TableHead>
                <TableHead>Netto</TableHead>
                <TableHead>VAT</TableHead>
                <TableHead>Brutto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Opis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className="font-medium">{doc.number}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{formatDate(doc.date)}</TableCell>
                  <TableCell>{formatDate(doc.dueDate)}</TableCell>
                  <TableCell>{doc.contractor}</TableCell>
                  <TableCell>{formatAmount(doc.amount)}</TableCell>
                  <TableCell>{formatAmount(doc.tax)}</TableCell>
                  <TableCell>{formatAmount(doc.total)}</TableCell>
                  <TableCell>{renderDocumentStatus(doc.status)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{doc.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Wyświetlanie 1-{filteredDocuments.length} z {documents.length} dokumentów
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Poprzednia
            </Button>
            <Button variant="outline" size="sm" className="bg-gray-50">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              Następna
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
