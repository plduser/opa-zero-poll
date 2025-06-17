"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Download, Clock, User, ArrowUpDown } from "lucide-react"
import type { PermissionChangeRecord } from "./types/permissions-history"

interface PermissionsHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId?: string
  documentName?: string
}

export function PermissionsHistoryDialog({
  open,
  onOpenChange,
  documentId,
  documentName,
}: PermissionsHistoryDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [sortField, setSortField] = useState<keyof PermissionChangeRecord>("changedAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [historyRecords, setHistoryRecords] = useState<PermissionChangeRecord[]>([])

  // Symulacja pobierania danych z API
  useEffect(() => {
    // W rzeczywistej aplikacji tutaj byłoby wywołanie API
    const mockData: PermissionChangeRecord[] = [
      {
        id: "1",
        documentId: documentId || "doc1",
        documentName: documentName || "FV/2023/05/001",
        documentType: "invoice",
        userId: "user1",
        userName: "Jan Kowalski",
        userType: "user",
        changeType: "add",
        permissionType: "read",
        oldValue: false,
        newValue: true,
        changedBy: "Administrator",
        changedAt: new Date(2023, 4, 15, 10, 30),
      },
      {
        id: "2",
        documentId: documentId || "doc1",
        documentName: documentName || "FV/2023/05/001",
        documentType: "invoice",
        userId: "user1",
        userName: "Jan Kowalski",
        userType: "user",
        changeType: "modify",
        permissionType: "write",
        oldValue: false,
        newValue: true,
        changedBy: "Administrator",
        changedAt: new Date(2023, 4, 15, 10, 35),
      },
      {
        id: "3",
        documentId: documentId || "doc1",
        documentName: documentName || "FV/2023/05/001",
        documentType: "invoice",
        userId: "group1",
        userName: "CASH_MANAGEMENT",
        userType: "group",
        changeType: "add",
        permissionType: "read",
        oldValue: false,
        newValue: true,
        changedBy: "Administrator",
        changedAt: new Date(2023, 4, 16, 9, 15),
      },
      {
        id: "4",
        documentId: documentId || "doc1",
        documentName: documentName || "FV/2023/05/001",
        documentType: "invoice",
        userId: "user2",
        userName: "Anna Wiśniewska",
        userType: "user",
        changeType: "add",
        permissionType: "manage",
        oldValue: false,
        newValue: true,
        changedBy: "Jan Kowalski",
        changedAt: new Date(2023, 4, 17, 14, 20),
      },
      {
        id: "5",
        documentId: documentId || "doc1",
        documentName: documentName || "FV/2023/05/001",
        documentType: "invoice",
        userId: "user2",
        userName: "Anna Wiśniewska",
        userType: "user",
        changeType: "remove",
        permissionType: "manage",
        oldValue: true,
        newValue: false,
        changedBy: "Jan Kowalski",
        changedAt: new Date(2023, 4, 18, 11, 45),
      },
    ]

    setHistoryRecords(mockData)
  }, [documentId, documentName])

  // Filtrowanie i sortowanie rekordów
  const filteredAndSortedRecords = historyRecords
    .filter((record) => {
      // Filtrowanie po wyszukiwaniu
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        record.userName.toLowerCase().includes(searchLower) ||
        record.changedBy.toLowerCase().includes(searchLower) ||
        record.permissionType.toLowerCase().includes(searchLower) ||
        record.changeType.toLowerCase().includes(searchLower)

      // Filtrowanie po dacie
      const matchesDate = dateFilter ? format(record.changedAt, "yyyy-MM-dd") === dateFilter : true

      return matchesSearch && matchesDate
    })
    .sort((a, b) => {
      // Sortowanie
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })

  // Funkcja do zmiany sortowania
  const handleSort = (field: keyof PermissionChangeRecord) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Funkcja do formatowania daty
  const formatDate = (date: Date) => {
    return format(date, "dd MMM yyyy, HH:mm", { locale: pl })
  }

  // Funkcja do eksportu historii do CSV
  const exportToCSV = () => {
    const headers = ["Data zmiany", "Użytkownik/Grupa", "Typ zmiany", "Uprawnienie", "Zmienione przez"]

    const rows = filteredAndSortedRecords.map((record) => [
      formatDate(record.changedAt),
      record.userName,
      record.changeType === "add" ? "Dodanie" : record.changeType === "remove" ? "Usunięcie" : "Modyfikacja",
      record.permissionType === "read" ? "Odczyt" : record.permissionType === "write" ? "Zapis" : "Zarządzanie",
      record.changedBy,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `historia_uprawnien_${documentName || "dokumentu"}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Historia zmian uprawnień {documentName ? `- ${documentName}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtry i wyszukiwanie */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative w-[280px]">
              <Input
                type="text"
                placeholder="Wyszukaj w historii"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-40"
                />
              </div>

              <Button variant="outline" className="flex items-center gap-2" onClick={exportToCSV}>
                <Download className="h-4 w-4" />
                Eksportuj CSV
              </Button>
            </div>
          </div>

          {/* Tabela historii */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] cursor-pointer" onClick={() => handleSort("changedAt")}>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Data zmiany
                      {sortField === "changedAt" && <ArrowUpDown className="h-4 w-4 ml-1" />}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("userName")}>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Użytkownik/Grupa
                      {sortField === "userName" && <ArrowUpDown className="h-4 w-4 ml-1" />}
                    </div>
                  </TableHead>
                  <TableHead>Typ zmiany</TableHead>
                  <TableHead>Uprawnienie</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("changedBy")}>
                    <div className="flex items-center gap-1">
                      Zmienione przez
                      {sortField === "changedBy" && <ArrowUpDown className="h-4 w-4 ml-1" />}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedRecords.length > 0 ? (
                  filteredAndSortedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{formatDate(record.changedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {record.userName}
                          <Badge variant="outline" className="bg-gray-100">
                            {record.userType === "user" ? "Użytkownik" : "Grupa"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                            ${
                              record.changeType === "add"
                                ? "bg-green-50 text-green-800 border-green-100"
                                : record.changeType === "remove"
                                  ? "bg-red-50 text-red-800 border-red-100"
                                  : "bg-blue-50 text-blue-800 border-blue-100"
                            }
                          `}
                        >
                          {record.changeType === "add"
                            ? "Dodanie"
                            : record.changeType === "remove"
                              ? "Usunięcie"
                              : "Modyfikacja"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                            ${
                              record.permissionType === "read"
                                ? "bg-purple-50 text-purple-800 border-purple-100"
                                : record.permissionType === "write"
                                  ? "bg-amber-50 text-amber-800 border-amber-100"
                                  : "bg-indigo-50 text-indigo-800 border-indigo-100"
                            }
                          `}
                        >
                          {record.permissionType === "read"
                            ? "Odczyt"
                            : record.permissionType === "write"
                              ? "Zapis"
                              : "Zarządzanie"}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.changedBy}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                      Brak wyników dla podanych kryteriów wyszukiwania
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zamknij
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
