"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Bell, Calendar, CheckCircle2, Clock, FileText, FileWarning, MoreHorizontal, Users } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function DashboardTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pulpit</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Kalendarz
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            Powiadomienia
          </Button>
        </div>
      </div>

      {/* Alerty i powiadomienia */}
      <Alert className="bg-amber-50 border-amber-200">
        <FileWarning className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Dokumenty oczekujące na przetworzenie</AlertTitle>
        <AlertDescription className="text-amber-700">
          15 nowych dokumentów zostało przekazanych przez klientów w ciągu ostatnich 24 godzin.
          <Button variant="link" className="p-0 h-auto text-amber-700 font-medium">
            Przejdź do dokumentów
          </Button>
        </AlertDescription>
      </Alert>

      {/* Statystyki */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dokumenty do przetworzenia</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43</div>
            <p className="text-xs text-muted-foreground">+12% w porównaniu do poprzedniego tygodnia</p>
            <Progress value={43} className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Deklaracje do złożenia</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Najbliższy termin: 20.05.2025</p>
            <Progress value={75} className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktywni klienci</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">+2 nowych w tym miesiącu</p>
            <Progress value={85} className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Zadania do wykonania</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">5 zadań przeterminowanych</p>
            <Progress value={65} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Dokumenty przekazane przez klientów */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Dokumenty przekazane przez klientów</CardTitle>
            <CardDescription>Ostatnio przekazane dokumenty oczekujące na przetworzenie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  client: "Firma ABC Sp. z o.o.",
                  avatar: "ABC",
                  documents: 12,
                  date: "12.05.2025",
                  priority: "Wysoki",
                  priorityColor: "bg-red-100 text-red-800",
                },
                {
                  client: "Jan Kowalski - Usługi",
                  avatar: "JK",
                  documents: 8,
                  date: "11.05.2025",
                  priority: "Średni",
                  priorityColor: "bg-amber-100 text-amber-800",
                },
                {
                  client: "Sklep Internetowy XYZ",
                  avatar: "XYZ",
                  documents: 15,
                  date: "10.05.2025",
                  priority: "Niski",
                  priorityColor: "bg-green-100 text-green-800",
                },
                {
                  client: "Restauracja Pod Lipą",
                  avatar: "PL",
                  documents: 5,
                  date: "09.05.2025",
                  priority: "Średni",
                  priorityColor: "bg-amber-100 text-amber-800",
                },
                {
                  client: "Gabinet Stomatologiczny Uśmiech",
                  avatar: "GS",
                  documents: 3,
                  date: "08.05.2025",
                  priority: "Niski",
                  priorityColor: "bg-green-100 text-green-800",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{item.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{item.client}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.documents} dokumentów • {item.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={item.priorityColor}>
                      {item.priority}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Zobacz wszystkie dokumenty
            </Button>
          </CardContent>
        </Card>

        {/* Nadchodzące terminy */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Nadchodzące terminy</CardTitle>
            <CardDescription>Najbliższe terminy deklaracji i rozliczeń</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "VAT-7",
                  client: "Firma ABC Sp. z o.o.",
                  date: "25.05.2025",
                  daysLeft: 13,
                  status: "W przygotowaniu",
                },
                {
                  title: "PIT-5",
                  client: "Jan Kowalski - Usługi",
                  date: "20.05.2025",
                  daysLeft: 8,
                  status: "Nie rozpoczęto",
                },
                {
                  title: "CIT-8",
                  client: "Sklep Internetowy XYZ",
                  date: "31.05.2025",
                  daysLeft: 19,
                  status: "W przygotowaniu",
                },
                {
                  title: "ZUS DRA",
                  client: "Restauracja Pod Lipą",
                  date: "15.05.2025",
                  daysLeft: 3,
                  status: "Gotowe do wysyłki",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{item.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.date}</p>
                    <p className={`text-sm ${item.daysLeft <= 5 ? "text-red-600" : "text-muted-foreground"}`}>
                      {item.daysLeft} dni pozostało
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Zobacz wszystkie terminy
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Aktywność i zadania */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Ostatnia aktywność</CardTitle>
            <CardDescription>Ostatnie działania w systemie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Dodano nowe dokumenty",
                  user: "Anna Nowak",
                  time: "Dzisiaj, 10:23",
                },
                {
                  action: "Zaksięgowano faktury",
                  user: "Piotr Wiśniewski",
                  time: "Dzisiaj, 09:15",
                },
                {
                  action: "Wysłano deklarację VAT-7",
                  user: "Magdalena Kowalska",
                  time: "Wczoraj, 15:42",
                },
                {
                  action: "Dodano nowego klienta",
                  user: "Jan Nowak",
                  time: "Wczoraj, 11:30",
                },
                {
                  action: "Zaktualizowano dane firmy",
                  user: "Anna Nowak",
                  time: "11.05.2025, 14:20",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium">{item.action}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.user} • {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Zadania do wykonania</CardTitle>
            <CardDescription>Lista zadań przypisanych do Ciebie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  task: "Przygotować deklarację VAT-7 dla Firma ABC",
                  deadline: "20.05.2025",
                  priority: "Wysoki",
                  priorityColor: "bg-red-100 text-red-800",
                },
                {
                  task: "Zaksięgować faktury za kwiecień - Jan Kowalski",
                  deadline: "15.05.2025",
                  priority: "Średni",
                  priorityColor: "bg-amber-100 text-amber-800",
                },
                {
                  task: "Przygotować raport finansowy - Sklep XYZ",
                  deadline: "25.05.2025",
                  priority: "Niski",
                  priorityColor: "bg-green-100 text-green-800",
                },
                {
                  task: "Uzgodnić saldo z klientem - Restauracja Pod Lipą",
                  deadline: "18.05.2025",
                  priority: "Średni",
                  priorityColor: "bg-amber-100 text-amber-800",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.task}</p>
                      <p className="text-sm text-muted-foreground">Termin: {item.deadline}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={item.priorityColor}>
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Zobacz wszystkie zadania
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
