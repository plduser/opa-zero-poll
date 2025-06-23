"use client"

import { useState } from "react"
import {
  Search,
  Menu,
  MoreVertical,
  AppWindowIcon as Apps,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useAppMenu } from "@/hooks/use-app-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppSwitcher } from "@/app/components/app-switcher"
import { PortalSettingsDropdown } from "@/app/components/portal-settings-dropdown"

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { menuItems, activeItem, currentApp } = useAppMenu()

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
      <AppHeader title={currentApp || "Portal Użytkownika"} />

      {/* Menu boczne i zawartość */}
      <div className="flex">
        <AppSidebar 
          menuItems={menuItems}
          activeItem={activeItem}
        />

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
