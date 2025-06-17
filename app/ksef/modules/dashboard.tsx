"use client"

import { useState } from "react"
import {
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  Info,
  Download,
  Upload,
  PlusCircle,
  RefreshCw,
  Bell,
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export function KsefDashboard() {
  const [period, setPeriod] = useState("month")
  const [lastSync, setLastSync] = useState("15 minut temu")

  // Dane statystyczne
  const stats = {
    day: {
      sent: 12,
      received: 8,
      rejected: 1,
      draft: 3,
      pending: 2,
      totalValue: "45 678,90 PLN",
      avgValue: "3 806,58 PLN",
    },
    week: {
      sent: 68,
      received: 42,
      rejected: 3,
      draft: 15,
      pending: 7,
      totalValue: "287 456,78 PLN",
      avgValue: "4 227,31 PLN",
    },
    month: {
      sent: 245,
      received: 187,
      rejected: 8,
      draft: 32,
      pending: 15,
      totalValue: "1 245 678,90 PLN",
      avgValue: "4 268,58 PLN",
    },
  }

  const currentStats = stats[period as keyof typeof stats]

  // Dane o limitach
  const limits = {
    monthly: {
      used: 432,
      total: 1000,
      percentage: 43.2,
    },
    storage: {
      used: 1.7,
      total: 5,
      percentage: 34,
    },
  }

  // Dane o nadchodzących płatnościach
  const upcomingPayments = [
    {
      id: 1,
      number: "FV/2023/05/002",
      company: "Platige Image S.A.",
      amount: "8 750,00 PLN",
      dueDate: "2023-05-26",
      status: "urgent", // termin za mniej niż 3 dni
    },
    {
      id: 2,
      number: "FV/2023/04/015",
      company: "Techland Sp. z o.o.",
      amount: "15 200,00 PLN",
      dueDate: "2023-05-28",
      status: "upcoming", // termin za mniej niż 7 dni
    },
    {
      id: 3,
      number: "FV/2023/05/004",
      company: "Bloober Team S.A.",
      amount: "6 800,00 PLN",
      dueDate: "2023-06-07",
      status: "normal", // termin za więcej niż 7 dni
    },
  ]

  // Dane o powiadomieniach
  const notifications = [
    {
      id: 1,
      type: "info",
      title: "Nowa wersja struktury FA(2)",
      description: "Dostępna od 01.06.2023",
      time: "2 godziny temu",
    },
    {
      id: 2,
      type: "success",
      title: "Faktura FV/2023/05/001 została odebrana",
      description: "Odbiorca: CD Projekt Red S.A.",
      time: "15 minut temu",
    },
    {
      id: 3,
      type: "warning",
      title: "Zbliża się termin złożenia JPK_V7M",
      description: "Pozostało 5 dni",
      time: "1 dzień temu",
    },
    {
      id: 4,
      type: "error",
      title: "Błąd walidacji faktury FV/2023/05/008",
      description: "Nieprawidłowy format numeru NIP",
      time: "3 godziny temu",
    },
  ]

  // Dane o statusie systemu KSeF
  const ksefStatus = {
    status: "operational", // operational, degraded, maintenance, outage
    lastChecked: "2023-05-15 14:30",
    uptime: "99.8%",
    plannedMaintenance: {
      scheduled: true,
      date: "2023-05-20",
      time: "22:00 - 02:00",
      description: "Aktualizacja systemu do wersji 2.5",
    },
  }

  return (
    <div className="space-y-6">
      {/* Nagłówek z informacją o ostatniej synchronizacji */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2 font-quicksand">Pulpit KSeF</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Ostatnia synchronizacja: {lastSync}</span>
          <Button variant="ghost" size="icon" onClick={() => setLastSync("Teraz")}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Wybór okresu */}
      <div className="flex justify-end">
        <Tabs defaultValue="month" value={period} onValueChange={setPeriod} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day">Dzień</TabsTrigger>
            <TabsTrigger value="week">Tydzień</TabsTrigger>
            <TabsTrigger value="month">Miesiąc</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Główne statystyki */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-green-500" />
              Faktury wysłane
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{currentStats.sent}</div>
            <p className="text-sm text-gray-500 mt-1">
              {period === "day" ? "Dzisiaj" : period === "week" ? "Ostatnie 7 dni" : "Ostatnie 30 dni"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-blue-500" />
              Faktury odebrane
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{currentStats.received}</div>
            <p className="text-sm text-gray-500 mt-1">
              {period === "day" ? "Dzisiaj" : period === "week" ? "Ostatnie 7 dni" : "Ostatnie 30 dni"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Oczekujące
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{currentStats.pending}</div>
            <p className="text-sm text-gray-500 mt-1">Faktury do wysłania</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Odrzucone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{currentStats.rejected}</div>
            <p className="text-sm text-gray-500 mt-1">Wymagają uwagi</p>
          </CardContent>
        </Card>
      </div>

      {/* Druga sekcja - statystyki i limity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Statystyki {period === "day" ? "dnia" : period === "week" ? "tygodnia" : "miesiąca"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Łączna liczba faktur</span>
              <span className="font-bold">{currentStats.sent + currentStats.received}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Łączna wartość</span>
              <span className="font-bold">{currentStats.totalValue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Średnia wartość faktury</span>
              <span className="font-bold">{currentStats.avgValue}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Wykorzystanie limitu miesięcznego</span>
              <span className="font-bold">{limits.monthly.percentage}%</span>
            </div>
            <Progress value={limits.monthly.percentage} className="h-2" />
            <div className="text-xs text-gray-500 text-right">
              {limits.monthly.used} z {limits.monthly.total} dokumentów
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Wykorzystanie przestrzeni</span>
              <span className="font-bold">{limits.storage.percentage}%</span>
            </div>
            <Progress value={limits.storage.percentage} className="h-2" />
            <div className="text-xs text-gray-500 text-right">
              {limits.storage.used} GB z {limits.storage.total} GB
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Status systemu KSeF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  ksefStatus.status === "operational"
                    ? "bg-green-500"
                    : ksefStatus.status === "degraded"
                      ? "bg-amber-500"
                      : ksefStatus.status === "maintenance"
                        ? "bg-blue-500"
                        : "bg-red-500"
                }`}
              ></div>
              <span className="font-medium">
                {ksefStatus.status === "operational"
                  ? "System działa poprawnie"
                  : ksefStatus.status === "degraded"
                    ? "Obniżona wydajność systemu"
                    : ksefStatus.status === "maintenance"
                      ? "Prace konserwacyjne"
                      : "Awaria systemu"}
              </span>
            </div>

            <div className="text-sm text-gray-500">Ostatnie sprawdzenie: {ksefStatus.lastChecked}</div>

            <div className="text-sm">
              Dostępność systemu: <span className="font-medium">{ksefStatus.uptime}</span>
            </div>

            {ksefStatus.plannedMaintenance.scheduled && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                <div className="font-medium text-blue-800 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Planowane prace konserwacyjne
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  {ksefStatus.plannedMaintenance.date}, {ksefStatus.plannedMaintenance.time}
                </div>
                <div className="text-sm text-blue-700">{ksefStatus.plannedMaintenance.description}</div>
              </div>
            )}

            <div className="mt-4">
              <h3 className="font-medium mb-2">Najnowsze aktualizacje</h3>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-500">15.05.2023</span> - Aktualizacja struktury logicznej FA(2)
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">10.05.2023</span> - Nowe API dla integratorów (v2.3)
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">05.05.2023</span> - Rozszerzenie funkcjonalności raportowania
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trzecia sekcja - nadchodzące płatności i powiadomienia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Nadchodzące płatności</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {upcomingPayments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between p-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{payment.number}</p>
                    <p className="text-sm text-gray-500">{payment.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{payment.amount}</p>
                    <p
                      className={`text-sm ${
                        payment.status === "urgent"
                          ? "text-red-500"
                          : payment.status === "upcoming"
                            ? "text-amber-500"
                            : "text-green-500"
                      }`}
                    >
                      Termin: {payment.dueDate}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Zobacz wszystkie płatności
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Powiadomienia</CardTitle>
            <Badge variant="outline" className="font-normal">
              {notifications.length} nowych
            </Badge>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 rounded-md ${
                    notification.type === "info"
                      ? "bg-blue-50"
                      : notification.type === "success"
                        ? "bg-green-50"
                        : notification.type === "warning"
                          ? "bg-amber-50"
                          : "bg-red-50"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {notification.type === "info" && <Info className={`h-5 w-5 text-blue-500`} />}
                    {notification.type === "success" && <CheckCircle className={`h-5 w-5 text-green-500`} />}
                    {notification.type === "warning" && <Clock className={`h-5 w-5 text-amber-500`} />}
                    {notification.type === "error" && <XCircle className={`h-5 w-5 text-red-500`} />}
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        notification.type === "info"
                          ? "text-blue-800"
                          : notification.type === "success"
                            ? "text-green-800"
                            : notification.type === "warning"
                              ? "text-amber-800"
                              : "text-red-800"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p
                      className={`text-sm ${
                        notification.type === "info"
                          ? "text-blue-700"
                          : notification.type === "success"
                            ? "text-green-700"
                            : notification.type === "warning"
                              ? "text-amber-700"
                              : "text-red-700"
                      }`}
                    >
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Zobacz wszystkie powiadomienia
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Czwarta sekcja - szybkie akcje */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Szybkie akcje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button className="flex flex-col items-center justify-center h-24 space-y-2">
              <PlusCircle className="h-6 w-6" />
              <span>Nowa faktura</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-24 space-y-2">
              <Upload className="h-6 w-6" />
              <span>Wyślij fakturę</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-24 space-y-2">
              <Download className="h-6 w-6" />
              <span>Pobierz fakturę</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-24 space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>Generuj raport</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-24 space-y-2">
              <FileText className="h-6 w-6" />
              <span>Deklaracje</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-24 space-y-2">
              <Bell className="h-6 w-6" />
              <span>Powiadomienia</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
