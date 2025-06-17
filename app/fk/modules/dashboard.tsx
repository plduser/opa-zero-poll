"use client"

import type React from "react"

import {
  Home,
  ArrowUpRight,
  TrendingUp,
  PieChart,
  FileText,
  Clock,
  Settings,
  FilePlus,
  FileSpreadsheet,
  CreditCard,
  Building,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface DashboardProps {
  setSelectedModule: (module: string) => void
  formatAmount: (amount: number) => string
  formatDate: (dateString: string) => string
  renderDocumentStatus: (status: string) => React.ReactNode
}

export function Dashboard({ setSelectedModule, formatAmount, formatDate, renderDocumentStatus }: DashboardProps) {
  // Przykładowe dane dla Pulpitu
  const financialSummary = {
    income: 1250000.45,
    expenses: 876543.21,
    balance: 373457.24,
    previousMonthIncome: 1150000.0,
    previousMonthExpenses: 820000.0,
    incomeChange: 8.7,
    expensesChange: 6.9,
  }

  const recentDocuments = [
    { id: "FV/2023/05/123", type: "Faktura sprzedaży", date: "2023-05-15", amount: 12500.0, status: "Zaksięgowana" },
    { id: "FZ/2023/05/087", type: "Faktura zakupu", date: "2023-05-14", amount: 8750.5, status: "Do zatwierdzenia" },
    { id: "PK/2023/05/045", type: "Polecenie księgowania", date: "2023-05-13", amount: 5000.0, status: "Zatwierdzona" },
    { id: "WB/2023/05/012", type: "Wyciąg bankowy", date: "2023-05-12", amount: 35000.0, status: "Zaksięgowany" },
    { id: "KP/2023/05/034", type: "Kasa przyjmie", date: "2023-05-11", amount: 1200.0, status: "Zaksięgowana" },
  ]

  const pendingTasks = [
    { id: 1, name: "Zatwierdzenie faktur zakupu", count: 12, deadline: "2023-05-20", priority: "Wysoki" },
    { id: 2, name: "Rozliczenie delegacji", count: 5, deadline: "2023-05-25", priority: "Średni" },
    { id: 3, name: "Przygotowanie raportu miesięcznego", count: 1, deadline: "2023-05-31", priority: "Wysoki" },
    { id: 4, name: "Weryfikacja not księgowych", count: 8, deadline: "2023-05-22", priority: "Niski" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
        <Home className="h-6 w-6" />
        Pulpit
      </h1>

      {/* Podsumowanie finansowe */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
              Przychody
            </CardTitle>
            <CardDescription>Bieżący miesiąc</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(financialSummary.income)}</div>
            <div className="flex items-center mt-2">
              <Badge
                className={`${
                  financialSummary.incomeChange > 0
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }`}
              >
                {financialSummary.incomeChange > 0 ? "+" : ""}
                {financialSummary.incomeChange}%
              </Badge>
              <span className="text-sm text-gray-500 ml-2">vs poprzedni miesiąc</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
              Koszty
            </CardTitle>
            <CardDescription>Bieżący miesiąc</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(financialSummary.expenses)}</div>
            <div className="flex items-center mt-2">
              <Badge
                className={`${
                  financialSummary.expensesChange < 0
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-red-100 text-red-800 border-red-200"
                }`}
              >
                {financialSummary.expensesChange > 0 ? "+" : ""}
                {financialSummary.expensesChange}%
              </Badge>
              <span className="text-sm text-gray-500 ml-2">vs poprzedni miesiąc</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-600" />
              Saldo
            </CardTitle>
            <CardDescription>Bieżący miesiąc</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(financialSummary.balance)}</div>
            <div className="flex items-center mt-2">
              <Progress value={(financialSummary.balance / financialSummary.income) * 100} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ostatnie dokumenty i zadania */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Ostatnie dokumenty
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numer</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Kwota</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.id}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{formatDate(doc.date)}</TableCell>
                    <TableCell>{formatAmount(doc.amount)}</TableCell>
                    <TableCell>{renderDocumentStatus(doc.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="border-t p-4 flex justify-center">
            <Button variant="outline" className="w-full" onClick={() => setSelectedModule("documents")}>
              Zobacz wszystkie dokumenty
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Zadania do wykonania
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zadanie</TableHead>
                  <TableHead>Ilość</TableHead>
                  <TableHead>Termin</TableHead>
                  <TableHead>Priorytet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>{task.count}</TableCell>
                    <TableCell>{formatDate(task.deadline)}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          task.priority === "Wysoki"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : task.priority === "Średni"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-blue-100 text-blue-800 border-blue-200"
                        }`}
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="border-t p-4 flex justify-center">
            <Button variant="outline" className="w-full">
              Zobacz wszystkie zadania
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Skróty do najczęściej używanych funkcji */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            Szybkie akcje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => setSelectedModule("documents")}
            >
              <FilePlus className="h-6 w-6 text-green-600" />
              <span>Nowy dokument</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => setSelectedModule("reports")}
            >
              <FileSpreadsheet className="h-6 w-6 text-green-600" />
              <span>Nowy raport</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => setSelectedModule("payments")}
            >
              <CreditCard className="h-6 w-6 text-green-600" />
              <span>Płatności</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => setSelectedModule("dictionaries")}
            >
              <Building className="h-6 w-6 text-green-600" />
              <span>Kontrahenci</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
