"use client"

import { useState } from "react"
import {
  Search,
  CheckCircle,
  Home,
  Settings,
  ChevronDown,
  FileText,
  Users,
  Briefcase,
  Database,
  Lock,
  X,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  BarChart2,
  FileCheck,
  FilePlus,
  Filter,
  Download,
  Upload,
  Printer,
  CreditCard,
  DollarSign,
  Percent,
  ArrowUpRight,
  CheckSquare,
  AlertTriangle,
  ExternalLink,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/app/components/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Importuj komponent AccessDialog
import { AccessDialog } from "@/app/users/access-dialog"
// Importuj zakładki
import { PermissionsTab } from "./tabs/permissions-tab"

export default function EBiuroPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState("dashboard")

  // Dodaj stan dla dialogu nadawania dostępu
  const [isAccessGrantDialogOpen, setIsAccessGrantDialogOpen] = useState(false)
  const [accessDialogTitle, setAccessDialogTitle] = useState("")
  const [accessDialogItems, setAccessDialogItems] = useState<any[]>([])

  // Przykładowe dane dokumentów
  const documents = [
    {
      id: 1,
      name: "Faktura VAT 2023/05/001",
      type: "Faktura",
      client: "CD Projekt Red S.A.",
      date: "2023-05-10",
      status: "Zatwierdzona",
    },
    {
      id: 2,
      name: "Faktura VAT 2023/05/002",
      type: "Faktura",
      client: "Platige Image S.A.",
      date: "2023-05-12",
      status: "Robocza",
    },
    {
      id: 3,
      name: "Umowa o współpracy",
      type: "Umowa",
      client: "Techland Sp. z o.o.",
      date: "2023-04-28",
      status: "Podpisana",
    },
    {
      id: 4,
      name: "Oferta handlowa",
      type: "Oferta",
      client: "11 bit studios S.A.",
      date: "2023-05-15",
      status: "Wysłana",
    },
    {
      id: 5,
      name: "Zamówienie ZAM/2023/42",
      type: "Zamówienie",
      client: "Bloober Team S.A.",
      date: "2023-05-08",
      status: "Zrealizowane",
    },
  ]

  // Przykładowe dane klientów
  const clients = [
    {
      id: 1,
      name: "CD Projekt Red S.A.",
      nip: "7342867148",
      category: "Klient kluczowy",
      manager: "Jan Kowalski",
    },
    {
      id: 2,
      name: "Platige Image S.A.",
      nip: "5242014184",
      category: "Klient standardowy",
      manager: "Anna Wiśniewska",
    },
    {
      id: 3,
      name: "Techland Sp. z o.o.",
      nip: "9542214164",
      category: "Klient kluczowy",
      manager: "Piotr Zieliński",
    },
    {
      id: 4,
      name: "11 bit studios S.A.",
      nip: "1182017282",
      category: "Klient standardowy",
      manager: "Jan Kowalski",
    },
    {
      id: 5,
      name: "Bloober Team S.A.",
      nip: "6762385512",
      category: "Klient potencjalny",
      manager: "Anna Wiśniewska",
    },
  ]

  // Przykładowe dane spraw
  const cases = [
    {
      id: 1,
      name: "Wdrożenie systemu ERP",
      client: "CD Projekt Red S.A.",
      responsible: "Jan Kowalski",
      deadline: "2023-06-30",
      status: "W trakcie",
    },
    {
      id: 2,
      name: "Aktualizacja oprogramowania",
      client: "Platige Image S.A.",
      responsible: "Anna Wiśniewska",
      deadline: "2023-05-25",
      status: "Planowana",
    },
    {
      id: 3,
      name: "Szkolenie pracowników",
      client: "Techland Sp. z o.o.",
      responsible: "Piotr Zieliński",
      deadline: "2023-05-20",
      status: "Zakończona",
    },
    {
      id: 4,
      name: "Audyt bezpieczeństwa",
      client: "11 bit studios S.A.",
      responsible: "Jan Kowalski",
      deadline: "2023-06-15",
      status: "W trakcie",
    },
    {
      id: 5,
      name: "Migracja danych",
      client: "Bloober Team S.A.",
      responsible: "Anna Wiśniewska",
      deadline: "2023-07-10",
      status: "Planowana",
    },
  ]

  // Przykładowe dane słowników
  const dictionaries = [
    {
      id: 1,
      name: "Typy dokumentów",
      entries: 12,
      lastModified: "2023-04-15",
    },
    {
      id: 2,
      name: "Kategorie klientów",
      entries: 5,
      lastModified: "2023-03-22",
    },
    {
      id: 3,
      name: "Statusy spraw",
      entries: 8,
      lastModified: "2023-05-02",
    },
    {
      id: 4,
      name: "Działy firmy",
      entries: 10,
      lastModified: "2023-02-18",
    },
    {
      id: 5,
      name: "Stanowiska",
      entries: 15,
      lastModified: "2023-04-30",
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
      role: "Kierownik",
    },
    {
      id: 3,
      name: "Piotr Zieliński",
      email: "piotr.zielinski@nazwafirmy.pl",
      role: "Pracownik",
    },
    {
      id: 4,
      name: "Adam Nowak",
      email: "adam.nowak@nazwafirmy.pl",
      role: "Pracownik",
    },
    {
      id: 5,
      name: "Marta Lis",
      email: "marta.lis@nazwafirmy.pl",
      role: "Przeglądający",
    },
  ]

  // Przykładowe dane dokumentów księgowych
  const accountingDocuments = [
    {
      id: 1,
      number: "FV/2023/05/001",
      type: "Faktura VAT",
      client: "CD Projekt Red S.A.",
      date: "2023-05-10",
      amount: "12 500,00 zł",
      status: "Zaksięgowana",
      dueDate: "2023-05-24",
    },
    {
      id: 2,
      number: "FV/2023/05/002",
      type: "Faktura VAT",
      client: "Platige Image S.A.",
      date: "2023-05-12",
      amount: "8 750,00 zł",
      status: "Do zaksięgowania",
      dueDate: "2023-05-26",
    },
    {
      id: 3,
      number: "RK/2023/05/001",
      type: "Rachunek kosztów",
      client: "Techland Sp. z o.o.",
      date: "2023-05-08",
      amount: "3 200,00 zł",
      status: "Zaksięgowana",
      dueDate: "2023-05-22",
    },
    {
      id: 4,
      number: "WB/2023/05/001",
      type: "Wyciąg bankowy",
      client: "11 bit studios S.A.",
      date: "2023-05-15",
      amount: "15 400,00 zł",
      status: "Do weryfikacji",
      dueDate: "2023-05-29",
    },
    {
      id: 5,
      number: "KP/2023/05/001",
      type: "KP",
      client: "Bloober Team S.A.",
      date: "2023-05-05",
      amount: "1 200,00 zł",
      status: "Zaksięgowana",
      dueDate: "2023-05-19",
    },
    {
      id: 6,
      number: "FZ/2023/05/001",
      type: "Faktura zakupu",
      client: "CD Projekt Red S.A.",
      date: "2023-05-03",
      amount: "4 800,00 zł",
      status: "Zaksięgowana",
      dueDate: "2023-05-17",
    },
    {
      id: 7,
      number: "FZ/2023/05/002",
      type: "Faktura zakupu",
      client: "Platige Image S.A.",
      date: "2023-05-14",
      amount: "2 300,00 zł",
      status: "Do zaksięgowania",
      dueDate: "2023-05-28",
    },
  ]

  // Przykładowe dane rozliczeń
  const settlements = [
    {
      id: 1,
      client: "CD Projekt Red S.A.",
      period: "Kwiecień 2023",
      type: "Księgowość pełna",
      status: "Rozliczone",
      amount: "2 500,00 zł",
      paymentStatus: "Opłacone",
      paymentDate: "2023-05-10",
    },
    {
      id: 2,
      client: "Platige Image S.A.",
      period: "Kwiecień 2023",
      type: "Księgowość pełna",
      status: "Rozliczone",
      amount: "1 800,00 zł",
      paymentStatus: "Nieopłacone",
      paymentDate: "-",
    },
    {
      id: 3,
      client: "Techland Sp. z o.o.",
      period: "Kwiecień 2023",
      type: "Księgowość pełna + kadry",
      status: "Rozliczone",
      amount: "3 200,00 zł",
      paymentStatus: "Opłacone",
      paymentDate: "2023-05-08",
    },
    {
      id: 4,
      client: "11 bit studios S.A.",
      period: "Kwiecień 2023",
      type: "Księgowość uproszczona",
      status: "W trakcie",
      amount: "1 200,00 zł",
      paymentStatus: "-",
      paymentDate: "-",
    },
    {
      id: 5,
      client: "Bloober Team S.A.",
      period: "Kwiecień 2023",
      type: "Księgowość pełna",
      status: "Rozliczone",
      amount: "2 100,00 zł",
      paymentStatus: "Opłacone",
      paymentDate: "2023-05-12",
    },
  ]

  // Przykładowe dane raportów
  const reports = [
    {
      id: 1,
      name: "Zestawienie przychodów i kosztów",
      client: "CD Projekt Red S.A.",
      period: "Kwiecień 2023",
      createdAt: "2023-05-10",
      status: "Gotowy",
      type: "Finansowy",
    },
    {
      id: 2,
      name: "Raport VAT",
      client: "Platige Image S.A.",
      period: "Kwiecień 2023",
      createdAt: "2023-05-12",
      status: "Gotowy",
      type: "Podatkowy",
    },
    {
      id: 3,
      name: "Bilans próbny",
      client: "Techland Sp. z o.o.",
      period: "Kwiecień 2023",
      createdAt: "2023-05-08",
      status: "W przygotowaniu",
      type: "Finansowy",
    },
    {
      id: 4,
      name: "Raport płatności",
      client: "11 bit studios S.A.",
      period: "Kwiecień 2023",
      createdAt: "2023-05-15",
      status: "Gotowy",
      type: "Finansowy",
    },
    {
      id: 5,
      name: "Deklaracja PIT-5",
      client: "Bloober Team S.A.",
      period: "Kwiecień 2023",
      createdAt: "2023-05-05",
      status: "Gotowy",
      type: "Podatkowy",
    },
  ]

  // Przykładowe dane dokumentów przekazanych przez klientów
  const clientDocuments = [
    {
      id: 1,
      name: "Faktury sprzedażowe - kwiecień",
      client: "CD Projekt Red S.A.",
      date: "2023-05-05",
      count: 24,
      status: "Zaksięgowane",
    },
    {
      id: 2,
      name: "Faktury zakupowe - kwiecień",
      client: "CD Projekt Red S.A.",
      date: "2023-05-05",
      count: 18,
      status: "Zaksięgowane",
    },
    {
      id: 3,
      name: "Wyciągi bankowe - kwiecień",
      client: "Platige Image S.A.",
      date: "2023-05-06",
      count: 8,
      status: "W trakcie księgowania",
    },
    {
      id: 4,
      name: "Faktury sprzedażowe - kwiecień",
      client: "Techland Sp. z o.o.",
      date: "2023-05-07",
      count: 32,
      status: "Oczekujące",
    },
    {
      id: 5,
      name: "Dokumenty kadrowe - kwiecień",
      client: "11 bit studios S.A.",
      date: "2023-05-08",
      count: 5,
      status: "Zaksięgowane",
    },
  ]

  // Przykładowe dane zadań
  const tasks = [
    {
      id: 1,
      name: "Przygotowanie deklaracji VAT",
      client: "CD Projekt Red S.A.",
      deadline: "2023-05-25",
      priority: "Wysoki",
      assignedTo: "Jan Kowalski",
    },
    {
      id: 2,
      name: "Księgowanie faktur zakupowych",
      client: "Platige Image S.A.",
      deadline: "2023-05-20",
      priority: "Średni",
      assignedTo: "Anna Wiśniewska",
    },
    {
      id: 3,
      name: "Przygotowanie raportu finansowego",
      client: "Techland Sp. z o.o.",
      deadline: "2023-05-30",
      priority: "Wysoki",
      assignedTo: "Piotr Zieliński",
    },
    {
      id: 4,
      name: "Rozliczenie delegacji",
      client: "11 bit studios S.A.",
      deadline: "2023-05-18",
      priority: "Niski",
      assignedTo: "Adam Nowak",
    },
    {
      id: 5,
      name: "Przygotowanie listy płac",
      client: "Bloober Team S.A.",
      deadline: "2023-05-28",
      priority: "Średni",
      assignedTo: "Marta Lis",
    },
  ]

  // Przykładowe dane terminów
  const deadlines = [
    {
      id: 1,
      name: "Deklaracja VAT-7",
      deadline: "2023-05-25",
      daysLeft: 10,
    },
    {
      id: 2,
      name: "Zaliczka na podatek dochodowy",
      deadline: "2023-05-20",
      daysLeft: 5,
    },
    {
      id: 3,
      name: "Składki ZUS",
      deadline: "2023-05-15",
      daysLeft: 0,
    },
    {
      id: 4,
      name: "Sprawozdanie GUS",
      deadline: "2023-05-30",
      daysLeft: 15,
    },
    {
      id: 5,
      name: "Raport INTRASTAT",
      deadline: "2023-05-10",
      daysLeft: -5,
    },
  ]

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.client.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredClients = clients.filter(
    (client) => client.name.toLowerCase().includes(searchQuery.toLowerCase()) || client.nip.includes(searchQuery),
  )

  const filteredCases = cases.filter(
    (case_) =>
      case_.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.client.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredDictionaries = dictionaries.filter((dict) =>
    dict.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleManageAccess = (resource: any, type: string) => {
    setSelectedResource({ ...resource, type })
    setIsAccessDialogOpen(true)
  }

  // Dodaj funkcję obsługującą nadawanie dostępu
  const handleGrantAccess = (resourceType: string) => {
    setAccessDialogTitle(`Nadaj dostęp do ${resourceType}`)
    setAccessDialogItems(users)
    setIsAccessGrantDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Używamy komponentu Header zamiast bezpośredniego kodu nagłówka */}
      <Header title="eBiuro" />

      {/* Menu boczne i zawartość */}
      <div className="flex">
        <aside className="w-[220px] min-h-[calc(100vh-64px)] border-r border-gray-200 bg-white">
          <nav className="py-4">
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-2 px-4 py-2 ${selectedTab === "dashboard" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                  onClick={() => setSelectedTab("dashboard")}
                >
                  <Home className={`h-5 w-5 ${selectedTab === "dashboard" ? "text-green-600" : "text-gray-500"}`} />
                  <span className="text-sm font-medium font-quicksand">Pulpit</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-2 px-4 py-2 ${selectedTab === "accounting" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                  onClick={() => setSelectedTab("accounting")}
                >
                  <FileText
                    className={`h-5 w-5 ${selectedTab === "accounting" ? "text-green-600" : "text-gray-500"}`}
                  />
                  <span className="text-sm font-medium font-quicksand">Księgowość</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-2 px-4 py-2 ${selectedTab === "hr" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                  onClick={() => setSelectedTab("hr")}
                >
                  <Users className={`h-5 w-5 ${selectedTab === "hr" ? "text-green-600" : "text-gray-500"}`} />
                  <span className="text-sm font-medium font-quicksand">Kadry i płace</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-2 px-4 py-2 ${selectedTab === "settlements" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                  onClick={() => setSelectedTab("settlements")}
                >
                  <Briefcase
                    className={`h-5 w-5 ${selectedTab === "settlements" ? "text-green-600" : "text-gray-500"}`}
                  />
                  <span className="text-sm font-medium font-quicksand">Rozliczenia</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-2 px-4 py-2 ${selectedTab === "reports" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                  onClick={() => setSelectedTab("reports")}
                >
                  <Database className={`h-5 w-5 ${selectedTab === "reports" ? "text-green-600" : "text-gray-500"}`} />
                  <span className="text-sm font-medium font-quicksand">Raporty</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center justify-between px-4 py-2 ${selectedTab === "settings" || selectedTab === "permissions" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                  onClick={() => setSelectedTab(selectedTab === "settings" ? "dashboard" : "settings")}
                >
                  <div className="flex items-center gap-2">
                    <Settings
                      className={`h-5 w-5 ${selectedTab === "settings" || selectedTab === "permissions" ? "text-green-600" : "text-gray-500"}`}
                    />
                    <span className="text-sm font-medium font-quicksand">Ustawienia</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 ${selectedTab === "settings" || selectedTab === "permissions" ? "text-green-600" : "text-gray-500"}`}
                  />
                </a>
                {(selectedTab === "settings" || selectedTab === "permissions") && (
                  <ul className="pl-4 border-l-2 border-green-600 ml-4">
                    <li>
                      <a
                        href="#"
                        className={`flex items-center gap-2 px-4 py-2 ${selectedTab === "permissions" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                        onClick={() => setSelectedTab("permissions")}
                      >
                        <Shield
                          className={`h-5 w-5 ${selectedTab === "permissions" ? "text-green-600" : "text-gray-500"}`}
                        />
                        <span className="text-sm font-medium font-quicksand">Uprawnienia</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className={`flex items-center gap-2 px-4 py-2 ${selectedTab === "settings" && selectedTab !== "permissions" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                        onClick={() => setSelectedTab("settings")}
                      >
                        <Settings
                          className={`h-5 w-5 ${selectedTab === "settings" && selectedTab !== "permissions" ? "text-green-600" : "text-gray-500"}`}
                        />
                        <span className="text-sm font-medium font-quicksand">Konfiguracja</span>
                      </a>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </nav>
        </aside>

        {/* Zawartość główna */}
        <main className="flex-1 p-8">
          {showSuccessMessage && (
            <div className="flex items-start gap-4 p-4 mb-6 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-800 flex-shrink-0" />
              <div>
                <p className="font-bold text-blue-800">Zaktualizowano uprawnienia</p>
                <p className="text-sm text-blue-800">Zmiany zostały zapisane pomyślnie</p>
              </div>
              <button className="ml-auto text-blue-800" onClick={() => setShowSuccessMessage(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Pulpit */}
          {selectedTab === "dashboard" && (
            <div>
              <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
                <Home className="h-6 w-6" />
                Pulpit
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-quicksand flex items-center gap-2">
                      <FilePlus className="h-5 w-5 text-green-600" />
                      Dokumenty do zaksięgowania
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">42</div>
                    <div className="text-sm text-gray-500 mt-1">Wzrost o 8% w porównaniu z poprzednim miesiącem</div>
                    <div className="flex items-center gap-2 mt-2">
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-500">+12 dokumentów</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-quicksand flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-500" />
                      Zbliżające się terminy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">7</div>
                    <div className="text-sm text-gray-500 mt-1">W ciągu najbliższych 7 dni</div>
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-amber-500">3 wysokiego priorytetu</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-quicksand flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      Rozliczenia klientów
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">85%</div>
                    <div className="text-sm text-gray-500 mt-1">Ukończonych rozliczeń za bieżący miesiąc</div>
                    <Progress value={85} className="h-2 mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Dokumenty przekazane przez klientów */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="text-xl font-quicksand flex items-center gap-2">
                    <Upload className="h-5 w-5 text-green-600" />
                    Dokumenty przekazane przez klientów
                  </CardTitle>
                  <CardDescription>Ostatnio przekazane dokumenty oczekujące na przetworzenie</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold text-sm">Nazwa</TableHead>
                          <TableHead className="font-bold text-sm">Klient</TableHead>
                          <TableHead className="font-bold text-sm">Data przekazania</TableHead>
                          <TableHead className="font-bold text-sm">Liczba dokumentów</TableHead>
                          <TableHead className="font-bold text-sm">Status</TableHead>
                          <TableHead className="text-right font-bold text-sm">Akcje</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientDocuments.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium font-quicksand">{doc.name}</TableCell>
                            <TableCell className="font-quicksand">{doc.client}</TableCell>
                            <TableCell className="font-quicksand">{doc.date}</TableCell>
                            <TableCell className="font-quicksand">{doc.count}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`
                                  ${
                                    doc.status === "Zaksięgowane"
                                      ? "bg-green-50 text-green-800 border-green-100"
                                      : doc.status === "W trakcie księgowania"
                                        ? "bg-amber-50 text-amber-800 border-amber-100"
                                        : "bg-blue-50 text-blue-800 border-blue-100"
                                  } text-xs py-1 font-quicksand`}
                              >
                                {doc.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-8 px-2 text-green-600">
                                Przetwórz
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Zadania */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-quicksand flex items-center gap-2">
                      <CheckSquare className="h-5 w-5 text-green-600" />
                      Zadania
                    </CardTitle>
                    <CardDescription>Najbliższe zadania do wykonania</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              task.priority === "Wysoki"
                                ? "bg-red-500"
                                : task.priority === "Średni"
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="font-medium font-quicksand">{task.name}</div>
                            <div className="text-sm text-gray-500">
                              {task.client} • {task.deadline}
                            </div>
                          </div>
                          <div className="text-xs bg-gray-100 px-2 py-1 rounded">{task.assignedTo}</div>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-4 text-green-600">
                      Zobacz wszystkie zadania
                    </Button>
                  </CardContent>
                </Card>

                {/* Terminy */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-quicksand flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      Zbliżające się terminy
                    </CardTitle>
                    <CardDescription>Ważne terminy podatkowe i urzędowe</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {deadlines.slice(0, 3).map((deadline) => (
                        <div key={deadline.id} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              deadline.daysLeft < 0
                                ? "bg-red-500"
                                : deadline.daysLeft === 0
                                  ? "bg-amber-500"
                                  : deadline.daysLeft <= 5
                                    ? "bg-amber-400"
                                    : "bg-green-500"
                            }`}
                          />
                          <div className="flex-1">
                            <div className="font-medium font-quicksand">{deadline.name}</div>
                            <div className="text-sm text-gray-500">Termin: {deadline.deadline}</div>
                          </div>
                          <div
                            className={`text-xs px-2 py-1 rounded ${
                              deadline.daysLeft < 0
                                ? "bg-red-100 text-red-800"
                                : deadline.daysLeft === 0
                                  ? "bg-amber-100 text-amber-800"
                                  : deadline.daysLeft <= 5
                                    ? "bg-amber-50 text-amber-800"
                                    : "bg-green-50 text-green-800"
                            }`}
                          >
                            {deadline.daysLeft < 0
                              ? `Opóźnienie: ${Math.abs(deadline.daysLeft)} dni`
                              : deadline.daysLeft === 0
                                ? "Dzisiaj"
                                : `Za ${deadline.daysLeft} dni`}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full mt-4 text-green-600">
                      Zobacz wszystkie terminy
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Księgowość */}
          {selectedTab === "accounting" && (
            <div>
              <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
                <FileText className="h-6 w-6" />
                Księgowość
              </h1>

              <div className="flex justify-between items-center mb-6">
                <div className="relative w-[280px]">
                  <Input
                    type="text"
                    placeholder="Wyszukaj dokument"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtruj
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
                    Dodaj dokument <Plus className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold">42</div>
                    <div className="text-sm text-gray-500 text-center">Wszystkie dokumenty</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center bg-green-50">
                    <div className="text-3xl font-bold text-green-700">28</div>
                    <div className="text-sm text-green-700 text-center">Zaksięgowane</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center bg-amber-50">
                    <div className="text-3xl font-bold text-amber-700">10</div>
                    <div className="text-sm text-amber-700 text-center">Do zaksięgowania</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center bg-blue-50">
                    <div className="text-3xl font-bold text-blue-700">4</div>
                    <div className="text-sm text-blue-700 text-center">Do weryfikacji</div>
                  </CardContent>
                </Card>
              </div>

              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 p-4 text-left">
                        <Checkbox />
                      </TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">
                        <div className="flex items-center gap-2">
                          Numer dokumentu
                          <ChevronDown className="h-5 w-5 text-green-600" />
                        </div>
                      </TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Typ</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Klient</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Data</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Kwota</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Termin płatności</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Status</TableHead>
                      <TableHead className="p-4 text-right font-bold text-sm">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountingDocuments.map((doc) => (
                      <TableRow key={doc.id} className="border-t border-gray-100">
                        <TableCell className="p-4">
                          <Checkbox />
                        </TableCell>
                        <TableCell className="p-4 font-quicksand font-medium">{doc.number}</TableCell>
                        <TableCell className="p-4 font-quicksand">{doc.type}</TableCell>
                        <TableCell className="p-4 font-quicksand">{doc.client}</TableCell>
                        <TableCell className="p-4 font-quicksand">{doc.date}</TableCell>
                        <TableCell className="p-4 font-quicksand">{doc.amount}</TableCell>
                        <TableCell className="p-4 font-quicksand">{doc.dueDate}</TableCell>
                        <TableCell className="p-4 font-quicksand">
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                doc.status === "Zaksięgowana"
                                  ? "bg-green-50 text-green-800 border-green-100"
                                  : doc.status === "Do zaksięgowania"
                                    ? "bg-amber-50 text-amber-800 border-amber-100"
                                    : "bg-blue-50 text-blue-800 border-blue-100"
                              } text-xs py-1 font-quicksand`}
                          >
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Lock className="h-5 w-5 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="h-5 w-5 text-green-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">Wyświetlanie 1-7 z 42 dokumentów</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Poprzednia
                  </Button>
                  <Button variant="outline" size="sm" className="bg-green-50">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Następna
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Rozliczenia */}
          {selectedTab === "settlements" && (
            <div>
              <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
                <Briefcase className="h-6 w-6" />
                Rozliczenia
              </h1>

              <div className="flex justify-between items-center mb-6">
                <div className="relative w-[280px]">
                  <Input
                    type="text"
                    placeholder="Wyszukaj rozliczenie"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtruj
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
                    Nowe rozliczenie <Plus className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Suma rozliczeń</div>
                      <div className="text-2xl font-bold">10 800,00 zł</div>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600 opacity-80" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Opłacone</div>
                      <div className="text-2xl font-bold text-green-700">7 800,00 zł</div>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600 opacity-80" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Nieopłacone</div>
                      <div className="text-2xl font-bold text-amber-700">3 000,00 zł</div>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-amber-500 opacity-80" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Średnia wartość</div>
                      <div className="text-2xl font-bold">2 160,00 zł</div>
                    </div>
                    <Percent className="h-8 w-8 text-blue-600 opacity-80" />
                  </CardContent>
                </Card>
              </div>

              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 p-4 text-left">
                        <Checkbox />
                      </TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">
                        <div className="flex items-center gap-2">
                          Klient
                          <ChevronDown className="h-5 w-5 text-green-600" />
                        </div>
                      </TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Okres</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Typ usługi</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Status rozliczenia</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Kwota</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Status płatności</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Data płatności</TableHead>
                      <TableHead className="p-4 text-right font-bold text-sm">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settlements.map((settlement) => (
                      <TableRow key={settlement.id} className="border-t border-gray-100">
                        <TableCell className="p-4">
                          <Checkbox />
                        </TableCell>
                        <TableCell className="p-4 font-quicksand font-medium">{settlement.client}</TableCell>
                        <TableCell className="p-4 font-quicksand">{settlement.period}</TableCell>
                        <TableCell className="p-4 font-quicksand">{settlement.type}</TableCell>
                        <TableCell className="p-4 font-quicksand">
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                settlement.status === "Rozliczone"
                                  ? "bg-green-50 text-green-800 border-green-100"
                                  : "bg-amber-50 text-amber-800 border-amber-100"
                              } text-xs py-1 font-quicksand`}
                          >
                            {settlement.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-4 font-quicksand">{settlement.amount}</TableCell>
                        <TableCell className="p-4 font-quicksand">
                          <Badge
                            variant="outline"
                            className={`
                              ${
                                settlement.paymentStatus === "Opłacone"
                                  ? "bg-green-50 text-green-800 border-green-100"
                                  : settlement.paymentStatus === "Nieopłacone"
                                    ? "bg-red-50 text-red-800 border-red-100"
                                    : "bg-gray-50 text-gray-800 border-gray-100"
                              } text-xs py-1 font-quicksand`}
                          >
                            {settlement.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-4 font-quicksand">{settlement.paymentDate}</TableCell>
                        <TableCell className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <CreditCard className="h-5 w-5 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Printer className="h-5 w-5 text-green-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">Wyświetlanie 1-5 z 12 rozliczeń</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Poprzednia
                  </Button>
                  <Button variant="outline" size="sm" className="bg-green-50">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Następna
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Raporty */}
          {selectedTab === "reports" && (
            <div>
              <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
                <BarChart2 className="h-6 w-6" />
                Raporty
              </h1>

              <div className="flex justify-between items-center mb-6">
                <div className="relative w-[280px]">
                  <Input
                    type="text"
                    placeholder="Wyszukaj raport"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtruj
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
                    Nowy raport <Plus className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-green-50 pb-2">
                    <CardTitle className="text-lg font-quicksand">Raporty finansowe</CardTitle>
                    <CardDescription>Zestawienia finansowe dla klientów</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span>Zestawienie przychodów i kosztów</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span>Bilans próbny</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span>Raport płatności</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button variant="ghost" size="sm" className="text-green-600">
                      Generuj raport
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader className="bg-blue-50 pb-2">
                    <CardTitle className="text-lg font-quicksand">Raporty podatkowe</CardTitle>
                    <CardDescription>Deklaracje i zestawienia podatkowe</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>Raport VAT</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>Deklaracja PIT-5</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span>Zestawienie CIT</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      Generuj raport
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="overflow-hidden">
                  <CardHeader className="bg-amber-50 pb-2">
                    <CardTitle className="text-lg font-quicksand">Raporty analityczne</CardTitle>
                    <CardDescription>Analizy i statystyki</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-amber-600" />
                        <span>Analiza rentowności</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-amber-600" />
                        <span>Statystyki klientów</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-amber-600" />
                        <span>Prognoza przepływów</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button variant="ghost" size="sm" className="text-amber-600">
                      Generuj raport
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <h2 className="text-xl font-bold mb-4 font-quicksand">Ostatnio wygenerowane raporty</h2>

              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="p-4 text-left font-bold text-sm">
                        <div className="flex items-center gap-2">
                          Nazwa raportu
                          <ChevronDown className="h-5 w-5 text-green-600" />
                        </div>
                      </TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Klient</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Okres</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Data utworzenia</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Status</TableHead>
                      <TableHead className="p-4 text-left font-bold text-sm">Typ</TableHead>
                      <TableHead className="p-4 text-right font-bold text-sm">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id} className="border-t border-gray-100">
                        <TableCell className="p-4 font-quicksand font-medium">{report.name}</TableCell>
                        <TableCell className="p-4 font-quicksand">{report.client}</TableCell>
                        <TableCell className="p-4 font-quicksand">{report.period}</TableCell>
                        <TableCell className="p-4 font-quicksand">{report.createdAt}</TableCell>
                        <TableCell className="p-4 font-quicksand">{report.status}</TableCell>
                        <TableCell className="p-4 font-quicksand">{report.type}</TableCell>
                        <TableCell className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Download className="h-5 w-5 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Printer className="h-5 w-5 text-green-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">Wyświetlanie 1-5 z 12 raportów</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Poprzednia
                  </Button>
                  <Button variant="outline" size="sm" className="bg-green-50">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Następna
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Uprawnienia */}
          {selectedTab === "permissions" && <PermissionsTab />}

          {/* Ustawienia */}
          {selectedTab === "settings" && (
            <div>
              <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
                <Settings className="h-6 w-6" />
                Ustawienia
              </h1>

              <Tabs defaultValue="profile" className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="account">Konto</TabsTrigger>
                  <TabsTrigger value="appearance">Wygląd</TabsTrigger>
                  <TabsTrigger value="notifications">Powiadomienia</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                  <h2 className="text-lg font-medium">Profil</h2>
                  <p className="text-sm text-gray-500">Zarządzaj informacjami o swoim profilu.</p>
                </TabsContent>
                <TabsContent value="account">
                  <h2 className="text-lg font-medium">Konto</h2>
                  <p className="text-sm text-gray-500">Zmień hasło i ustawienia konta.</p>
                </TabsContent>
                <TabsContent value="appearance">
                  <h2 className="text-lg font-medium">Wygląd</h2>
                  <p className="text-sm text-gray-500">Dostosuj wygląd aplikacji.</p>
                </TabsContent>
                <TabsContent value="notifications">
                  <h2 className="text-lg font-medium">Powiadomienia</h2>
                  <p className="text-sm text-gray-500">Ustawienia powiadomień e-mail i push.</p>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>

      {/* Dialog nadawania dostępu */}
      <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uprawnienia dostępu</DialogTitle>
          </DialogHeader>
          {selectedResource && (
            <div>
              <p>
                Zarządzaj dostępem do zasobu: {selectedResource.name} ({selectedResource.type})
              </p>
              <Button
                onClick={() => {
                  setShowSuccessMessage(true)
                  setIsAccessDialogOpen(false)
                }}
              >
                Zapisz zmiany
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dodaj komponent AccessDialog */}
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
