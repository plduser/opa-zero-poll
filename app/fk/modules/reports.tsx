"use client"

import type React from "react"

import { BarChart3, Search, Filter, Download, Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"

interface ReportsProps {
  formatDate: (dateString: string) => string
  renderDocumentStatus: (status: string) => React.ReactNode
}

export function Reports({ formatDate, renderDocumentStatus }: ReportsProps) {
  const [selectedReportType, setSelectedReportType] = useState("financial")

  // Przykładowe dane dla Raportów
  const reports = [
    {
      id: 1,
      name: "Rachunek zysków i strat",
      type: "financial",
      period: "Q1 2023",
      createdAt: "2023-04-15",
      createdBy: "Jan Kowalski",
      status: "Zatwierdzony",
      description: "Kwartalny rachunek zysków i strat",
    },
    {
      id: 2,
      name: "Bilans",
      type: "financial",
      period: "Q1 2023",
      createdAt: "2023-04-15",
      createdBy: "Jan Kowalski",
      status: "Zatwierdzony",
      description: "Kwartalny bilans",
    },
    {
      id: 3,
      name: "Przepływy pieniężne",
      type: "financial",
      period: "Q1 2023",
      createdAt: "2023-04-16",
      createdBy: "Anna Nowak",
      status: "Zatwierdzony",
      description: "Kwartalne przepływy pieniężne",
    },
    {
      id: 4,
      name: "Analiza sprzedaży",
      type: "sales",
      period: "Kwiecień 2023",
      createdAt: "2023-05-05",
      createdBy: "Piotr Wiśniewski",
      status: "Roboczy",
      description: "Miesięczna analiza sprzedaży",
    },
    {
      id: 5,
      name: "Analiza kosztów",
      type: "costs",
      period: "Kwiecień 2023",
      createdAt: "2023-05-06",
      createdBy: "Magdalena Dąbrowska",
      status: "Roboczy",
      description: "Miesięczna analiza kosztów",
    },
    {
      id: 6,
      name: "Raport podatkowy VAT",
      type: "tax",
      period: "Kwiecień 2023",
      createdAt: "2023-05-10",
      createdBy: "Jan Kowalski",
      status: "Zatwierdzony",
      description: "Miesięczny raport VAT",
    },
    {
      id: 7,
      name: "Raport podatkowy CIT",
      type: "tax",
      period: "Q1 2023",
      createdAt: "2023-04-20",
      createdBy: "Jan Kowalski",
      status: "Zatwierdzony",
      description: "Kwartalny raport CIT",
    },
  ]

  // Filtrowanie raportów według typu
  const filteredReports = reports.filter((report) => selectedReportType === "all" || report.type === selectedReportType)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
        <BarChart3 className="h-6 w-6" />
        Raporty
      </h1>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 flex flex-wrap gap-4 items-center justify-between border-b">
          <div className="flex items-center gap-4">
            <div className="relative w-[280px]">
              <Input type="text" placeholder="Wyszukaj raport" className="pl-10 border-gray-300" />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Typ:</span>
              <select
                className="border rounded-md px-3 py-1.5 text-sm"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
              >
                <option value="all">Wszystkie</option>
                <option value="financial">Finansowe</option>
                <option value="sales">Sprzedażowe</option>
                <option value="costs">Kosztowe</option>
                <option value="tax">Podatkowe</option>
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
              Nowy raport <Plus className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nazwa</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Okres</TableHead>
                <TableHead>Data utworzenia</TableHead>
                <TableHead>Utworzony przez</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Opis</TableHead>
                <TableHead className="w-[100px]">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>
                    {report.type === "financial"
                      ? "Finansowy"
                      : report.type === "sales"
                        ? "Sprzedażowy"
                        : report.type === "costs"
                          ? "Kosztowy"
                          : "Podatkowy"}
                  </TableCell>
                  <TableCell>{report.period}</TableCell>
                  <TableCell>{formatDate(report.createdAt)}</TableCell>
                  <TableCell>{report.createdBy}</TableCell>
                  <TableCell>{renderDocumentStatus(report.status)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{report.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Wyświetlanie 1-{filteredReports.length} z {reports.length} raportów
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Poprzednia
            </Button>
            <Button variant="outline" size="sm" className="bg-gray-50">
              1
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
