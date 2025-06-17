"use client"

import { useState } from "react"
import {
  Search,
  Home,
  AppWindowIcon as Apps,
  HelpCircle,
  UserIcon,
  Settings,
  ChevronDown,
  Menu,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppSwitcher } from "@/app/components/app-switcher"

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Lista aplikacji
  const applications = [
    {
      id: "ebiuro",
      name: "Symfonia eBiuro",
      shortName: "eB",
      description:
        "Wszystko, czego potrzebuje mała firma lub biuro rachunkowe, w jednym systemie: KPiR, ryczałt, fakturowanie, środki trwałe, OCR oraz proste kadry i płace.",
      color: "#2563EB",
      url: "/ebiuro",
      status: "available",
      actions: [{ type: "open", label: "Otwórz" }],
    },
    {
      id: "ksef",
      name: "Symfonia KSEF",
      shortName: "KS",
      description: "Kompleksowe rozwiązanie do obsługi faktur ustrukturyzowanych w ramach Krajowego Systemu e-Faktur.",
      color: "#2563EB",
      url: "/ksef",
      status: "available",
      actions: [{ type: "open", label: "Otwórz" }],
    },
    {
      id: "edokumenty",
      name: "Symfonia eDokumenty",
      shortName: "eD",
      description: "Elektroniczny obieg dokumentów, archiwizacja i zarządzanie procesami biznesowymi.",
      color: "#009A00",
      url: "/edokumenty",
      status: "available",
      actions: [{ type: "open", label: "Otwórz" }],
    },
    {
      id: "policy-management",
      name: "Policy Management",
      shortName: "PM",
      description: "Zarządzanie politykami bezpieczeństwa Open Policy Agent (OPA) z graficznym interfejsem użytkownika.",
      color: "#16A34A",
      url: "/policy-management",
      status: "available",
      actions: [{ type: "open", label: "Otwórz" }],
    },
    {
      id: "edeklaracje",
      name: "Symfonia eDeklaracje w Chmurze",
      shortName: "eD",
      description: "Wygodna w obsłudze aplikacja do wysyłania elektronicznych deklaracji.",
      color: "#2563EB",
      url: "/edeklaracje",
      status: "trial",
      actions: [
        { type: "buy", label: "Kup" },
        { type: "try", label: "Wypróbuj" },
      ],
    },
    {
      id: "eplace",
      name: "Symfonia ePłace",
      shortName: "eP",
      description: "Szybka i prosta obsługa najważniejszych procesów kadrowo-płacowych.",
      color: "#F59E0B",
      url: "/eplace",
      status: "trial",
      actions: [{ type: "open", label: "Otwórz" }],
    },
    {
      id: "fk",
      name: "Symfonia Finanse i Księgowość w Chmurze",
      shortName: "FK",
      description: "Kompletne rozwiązanie do prowadzenia ksiąg rachunkowych.",
      color: "#2563EB",
      url: "/fk",
      status: "trial",
      actions: [
        { type: "buy", label: "Kup" },
        { type: "try", label: "Wypróbuj" },
      ],
    },
    {
      id: "handel",
      name: "Symfonia Handel w Chmurze",
      shortName: "H",
      description:
        "Program do obsługi magazynu i sprzedaży w wielu kanałach, wyposażony we wszystkie narzędzia niezbędne do zarządzania procesami handlowymi.",
      color: "#9333EA",
      url: "/handel",
      status: "trial",
      actions: [
        { type: "buy", label: "Kup" },
        { type: "try", label: "Wypróbuj" },
      ],
    },
    {
      id: "windykacja",
      name: "Windykacja",
      shortName: "W",
      description: "Szybka i skuteczna windykacja należności, którą zlecisz online jednym kliknięciem.",
      color: "#B91C1C",
      url: "/windykacja",
      status: "available",
      actions: [{ type: "open", label: "Otwórz" }],
    },
  ]

  const filteredApplications = applications.filter(
    (app) =>
      (activeTab === "all" ||
        (activeTab === "my" && app.status === "available") ||
        (activeTab === "discover" && app.status === "trial")) &&
      (app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Nagłówek */}
      <header className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <button className="p-1">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <img src="/symfonia-logo.png" alt="Symfonia" className="h-10 relative top-[5px]" />
            <span className="text-lg font-medium font-quicksand ml-4">Portal Użytkownika</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <select className="flex items-center gap-2 px-4 py-2 border rounded-md font-quicksand appearance-none cursor-pointer pr-10">
              <option>ECM3 Jacek Paszek</option>
              <option>CD Projekt Red S.A.</option>
              <option>Platige Image S.A.</option>
              <option>Techland Sp. z o.o.</option>
              <option>11 bit studios S.A.</option>
              <option>Bloober Team S.A.</option>
            </select>
            <ChevronDown className="h-5 w-5 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <button className="p-1">
            <Settings className="h-6 w-6" />
          </button>
          <AppSwitcher />
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-800">
            JP
          </div>
        </div>
      </header>

      {/* Menu boczne i zawartość */}
      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-64px)] border-r border-gray-200 bg-white">
          <nav className="py-4">
            <ul className="space-y-1">
              <li>
                <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <Home className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Strona główna</span>
                </a>
              </li>
              <li>
                <a href="/aplikacje" className="flex items-center gap-3 px-6 py-3 bg-gray-50">
                  <Apps className="h-5 w-5 text-green-600" />
                  <span className="text-base font-medium font-quicksand text-green-600">Aplikacje i usługi</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <HelpCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Centrum wsparcia</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Panel klienta</span>
                </a>
              </li>
              <li>
                <a href="/tenant-management" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <Settings className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Zarządzanie Tenantami</span>
                </a>
              </li>
              <li>
                <button
                  onClick={() => {
                    const settingsMenu = document.getElementById("settings-submenu")
                    if (settingsMenu) {
                      settingsMenu.classList.toggle("hidden")
                    }
                  }}
                  className="flex items-center justify-between w-full px-6 py-3 hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <span className="text-base font-medium font-quicksand text-gray-800">Ustawienia</span>
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </button>
                <ul id="settings-submenu" className="pl-6 border-l-2 border-gray-200 ml-6 hidden">
                  <li>
                    <a href="/users" className="flex items-center gap-3 px-6 py-2 hover:bg-gray-50">
                      <span className="text-base font-medium text-gray-800 font-quicksand">Użytkownicy</span>
                    </a>
                  </li>
                  <li>
                    <a href="/firmy" className="flex items-center gap-3 px-6 py-2 hover:bg-gray-50">
                      <span className="text-base font-medium font-quicksand text-gray-800">Firmy</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-3 px-6 py-2 hover:bg-gray-50">
                      <span className="text-base font-medium text-gray-800 font-quicksand">Klucze API</span>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Zawartość główna */}
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
            <Apps className="h-6 w-6" />
            Aplikacje i usługi
          </h1>

          <div className="mb-6">
            <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100 p-1 rounded-lg">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-white data-[state=active]:text-green-600 rounded-md px-4 py-2 flex items-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Wszystkie aplikacje
                </TabsTrigger>
                <TabsTrigger
                  value="my"
                  className="data-[state=active]:bg-white data-[state=active]:text-green-600 rounded-md px-4 py-2 flex items-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Moje aplikacje
                </TabsTrigger>
                <TabsTrigger
                  value="discover"
                  className="data-[state=active]:bg-white data-[state=active]:text-green-600 rounded-md px-4 py-2 flex items-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 8V12L15 15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Odkryj nowe aplikacje
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="relative w-[280px]">
              <Input
                type="text"
                placeholder="Wyszukaj aplikację"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: app.color }}
                      >
                        {app.shortName}
                      </div>
                      <h3 className="text-lg font-medium font-quicksand">{app.name}</h3>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-6 font-quicksand min-h-[80px]">{app.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      {app.actions.some((a) => a.type === "buy") && (
                        <Button
                          variant="outline"
                          className="mr-2 border-green-600 text-green-600 hover:bg-green-50 font-quicksand"
                          onClick={() => (window.location.href = app.url)}
                        >
                          Kup
                        </Button>
                      )}
                    </div>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
                      onClick={() => (window.location.href = app.url)}
                    >
                      {app.actions.find((a) => a.type === "try") ? "Wypróbuj" : "Otwórz"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stopka */}
          <footer className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
            <div className="flex justify-between items-center">
              <div>Wersja systemu: 3.0.0</div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-gray-700">
                  Regulamin
                </a>
                <a href="#" className="hover:text-gray-700">
                  Polityka prywatności i cookies
                </a>
                <a href="#" className="hover:text-gray-700">
                  Dokumentacja online
                </a>
                <a href="#" className="hover:text-gray-700">
                  Kontakt
                </a>
              </div>
            </div>
            <div className="mt-2">
              <p>
                Ta strona jest chroniona przez reCAPTCHA. Obowiązują{" "}
                <a href="#" className="text-green-600 hover:underline">
                  Polityka Prywatności
                </a>{" "}
                i{" "}
                <a href="#" className="text-green-600 hover:underline">
                  Warunki korzystania
                </a>{" "}
                z usługi Google.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
