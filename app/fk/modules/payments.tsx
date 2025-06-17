"use client"

import type React from "react"

import { DollarSign, Search, Filter, Download, Plus, Receipt, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"

interface PaymentsProps {
  formatAmount: (amount: number) => string
  formatDate: (dateString: string) => string
  renderPaymentStatus: (status: string, daysOverdue: number) => React.ReactNode
}

export function Payments({ formatAmount, formatDate, renderPaymentStatus }: PaymentsProps) {
  const [selectedPaymentType, setSelectedPaymentType] = useState("receivables")

  // Przykładowe dane dla Rozrachunków
  const payments = [
    {
      id: 1,
      type: "receivable",
      number: "NAL/2023/05/001",
      contractor: "Techland Sp. z o.o.",
      amount: 15375.0,
      dueDate: "2023-05-29",
      status: "Niezapłacona",
      documentRef: "FV/2023/05/123",
      daysOverdue: 0,
    },
    {
      id: 2,
      type: "receivable",
      number: "NAL/2023/05/002",
      contractor: "11 bit studios S.A.",
      amount: 22755.0,
      dueDate: "2023-05-30",
      status: "Niezapłacona",
      documentRef: "FV/2023/05/124",
      daysOverdue: 0,
    },
    {
      id: 3,
      type: "receivable",
      number: "NAL/2023/04/015",
      contractor: "Bloober Team S.A.",
      amount: 8500.0,
      dueDate: "2023-04-30",
      status: "Przeterminowana",
      documentRef: "FV/2023/04/098",
      daysOverdue: 15,
    },
    {
      id: 4,
      type: "payable",
      number: "ZOB/2023/05/001",
      contractor: "Platige Image S.A.",
      amount: 10763.12,
      dueDate: "2023-05-28",
      status: "Niezapłacona",
      documentRef: "FZ/2023/05/087",
      daysOverdue: 0,
    },
    {
      id: 5,
      type: "payable",
      number: "ZOB/2023/05/002",
      contractor: "Bloober Team S.A.",
      amount: 6458.42,
      dueDate: "2023-05-29",
      status: "Niezapłacona",
      documentRef: "FZ/2023/05/088",
      daysOverdue: 0,
    },
    {
      id: 6,
      type: "payable",
      number: "ZOB/2023/04/012",
      contractor: "CD Projekt Red S.A.",
      amount: 12500.0,
      dueDate: "2023-04-25",
      status: "Zapłacona",
      documentRef: "FZ/2023/04/075",
      daysOverdue: 0,
      paymentDate: "2023-04-24",
    },
    {
      id: 7,
      type: "receivable",
      number: "NAL/2023/04/010",
      contractor: "Techland Sp. z o.o.",
      amount: 18500.0,
      dueDate: "2023-04-28",
      status: "Zapłacona",
      documentRef: "FV/2023/04/085",
      daysOverdue: 0,
      paymentDate: "2023-04-27",
    },
  ]

  // Filtrowanie płatności według typu
  const filteredPayments = payments.filter(
    (payment) => selectedPaymentType === "all" || payment.type === selectedPaymentType,
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
        <DollarSign className="h-6 w-6" />
        Rozrachunki
      </h1>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 flex flex-wrap gap-4 items-center justify-between border-b">
          <div className="flex items-center gap-4">
            <div className="relative w-[280px]">
              <Input type="text" placeholder="Wyszukaj rozrachunek" className="pl-10 border-gray-300" />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Typ:</span>
              <select
                className="border rounded-md px-3 py-1.5 text-sm"
                value={selectedPaymentType}
                onChange={(e) => setSelectedPaymentType(e.target.value)}
              >
                <option value="all">Wszystkie</option>
                <option value="receivable">Należności</option>
                <option value="payable">Zobowiązania</option>
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
              Nowa płatność <Plus className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numer</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Kontrahent</TableHead>
                <TableHead>Kwota</TableHead>
                <TableHead>Termin płatności</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dokument źródłowy</TableHead>
                <TableHead>Data zapłaty</TableHead>
                <TableHead className="w-[100px]">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.number}</TableCell>
                  <TableCell>{payment.type === "receivable" ? "Należność" : "Zobowiązanie"}</TableCell>
                  <TableCell>{payment.contractor}</TableCell>
                  <TableCell>{formatAmount(payment.amount)}</TableCell>
                  <TableCell>{formatDate(payment.dueDate)}</TableCell>
                  <TableCell>{renderPaymentStatus(payment.status, payment.daysOverdue)}</TableCell>
                  <TableCell>{payment.documentRef}</TableCell>
                  <TableCell>{payment.paymentDate ? formatDate(payment.paymentDate) : "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Receipt className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <CreditCard className="h-4 w-4" />
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
            Wyświetlanie 1-{filteredPayments.length} z {payments.length} rozrachunków
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
