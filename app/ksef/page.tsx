"use client"

import { useState, useEffect } from "react"
import {
  Search,
  CheckCircle,
  Settings,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileBarChart,
  X,
  Plus,
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/app/components/header"
import Link from "next/link"

// Importuj komponenty
import { AccessDialog } from "@/app/users/access-dialog"
import { InvoicesTab } from "./tabs/invoices-tab"
import { PurchaseInvoicesTab } from "./tabs/purchase-invoices-tab"
import { SalesInvoicesTab } from "./tabs/sales-invoices-tab"
import { ReportsTab } from "./tabs/reports-tab"
import { KsefDashboard } from "./modules/dashboard"
import { canViewPurchaseInvoices, canViewSalesInvoices } from "@/lib/opa-api"

export default function KSEFPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState("dashboard") // Zmieniono domyślną zakładkę na dashboard

  // Dodaj stan dla dialogu nadawania dostępu
  const [isAccessGrantDialogOpen, setIsAccessGrantDialogOpen] = useState(false)
  const [accessDialogTitle, setAccessDialogTitle] = useState("")
  const [accessDialogItems, setAccessDialogItems] = useState<any[]>([])

  // Stan dla uprawnień OPA
  const [permissions, setPermissions] = useState({
    canViewPurchase: false,
    canViewSales: false,
    isLoading: true
  })

  // Sprawdzanie uprawnień OPA przy ładowaniu komponentu
  useEffect(() => {
    console.log("[KSEF] useEffect uruchomiony - sprawdzanie uprawnień...")
    console.log("[KSEF] Obecny stan permissions:", permissions)
    if (typeof window === 'undefined') {
      console.log("[KSEF] Window undefined - działamy po stronie serwera")
      return
    }
    const checkPermissions = async () => {
      try {
                 // Pobierz aktualnego użytkownika z localStorage
         let userId = "user123" // Domyślnie Jan Kowalski (księgowa)
        
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('currentUser')
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser)
              userId = user.id
            } catch (e) {
              console.error('Błąd parsowania użytkownika z localStorage:', e)
            }
          }
        }
        
        console.log('Sprawdzanie uprawnień dla użytkownika:', userId)
        
        const [purchaseAccess, salesAccess] = await Promise.all([
          canViewPurchaseInvoices(userId),
          canViewSalesInvoices(userId)
        ])
        
        console.log(`[KSEF] Sprawdzanie uprawnień dla użytkownika: ${userId}`)
        console.log(`[KSEF] Dostęp do faktur zakupu: ${purchaseAccess}`)
        console.log(`[KSEF] Dostęp do faktur sprzedaży: ${salesAccess}`)
        
        console.log(`[KSEF] Ustawianie nowych uprawnień:`, {
          canViewPurchase: purchaseAccess,
          canViewSales: salesAccess,
          isLoading: false
        })
        
        setPermissions({
          canViewPurchase: purchaseAccess,
          canViewSales: salesAccess,
          isLoading: false
        })
      } catch (error) {
        console.error("Błąd sprawdzania uprawnień OPA:", error)
        setPermissions({
          canViewPurchase: false,
          canViewSales: false,
          isLoading: false
        })
      }
    }
    
    checkPermissions()
  }, [])

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
      role: "Wystawiający",
    },
    {
      id: 3,
      name: "Piotr Zieliński",
      email: "piotr.zielinski@nazwafirmy.pl",
      role: "Zatwierdzający",
    },
    {
      id: 4,
      name: "Adam Nowak",
      email: "adam.nowak@nazwafirmy.pl",
      role: "Pełny dostęp",
    },
    {
      id: 5,
      name: "Marta Lis",
      email: "marta.lis@nazwafirmy.pl",
      role: "Przeglądający",
    },
  ]

  // Dodaj funkcję obsługującą nadawanie dostępu
  const handleGrantAccess = (resourceType: string) => {
    setAccessDialogTitle(`Nadaj dostęp do ${resourceType}`)
    setAccessDialogItems(users)
    setIsAccessGrantDialogOpen(true)
  }

  // Funkcja do zmiany zakładki
  const handleTabChange = (tab: string) => {
    console.log(`Zmiana zakładki na: ${tab}`)
    setSelectedTab(tab)
  }

  // Funkcja do obsługi kliknięcia na wyłączone zakładki
  const handleDisabledTabClick = (tabName: string) => {
    console.log(`Kliknięto na wyłączoną zakładkę: ${tabName}`)
    // Możliwość pokazania komunikatu lub przekierowania do uprawnień
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Używamy komponentu Header zamiast bezpośredniego kodu nagłówka */}
      <Header title="KSEF" />

      {/* Menu boczne i zawartość */}
      <div className="flex">
        <aside className="w-[220px] min-h-[calc(100vh-64px)] border-r border-gray-200 bg-white">
          <nav className="py-4">
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${selectedTab === "dashboard" ? "bg-gray-50" : ""}`}
                  onClick={() => handleTabChange("dashboard")}
                >
                  <LayoutDashboard
                    className={`h-5 w-5 ${selectedTab === "dashboard" ? "text-green-600" : "text-gray-500"}`}
                  />
                  <span
                    className={`text-sm font-medium font-quicksand ${selectedTab === "dashboard" ? "text-green-600" : "text-gray-800"}`}
                  >
                    Pulpit
                  </span>
                </a>
              </li>
              
              {/* Faktury zakupowe */}
              <li>
                <a
                  href="#"
                  title={!permissions.isLoading && !permissions.canViewPurchase ? "Brak dostępu" : ""}
                  className={`flex items-center gap-2 px-4 py-2 ${
                    permissions.isLoading 
                      ? "cursor-wait opacity-50" 
                      : permissions.canViewPurchase 
                        ? `hover:bg-gray-50 ${selectedTab === "purchase-invoices" ? "bg-gray-50" : ""}`
                        : "cursor-not-allowed opacity-50"
                  }`}
                  onClick={() => 
                    permissions.isLoading 
                      ? undefined
                      : permissions.canViewPurchase 
                        ? handleTabChange("purchase-invoices")
                        : handleDisabledTabClick("Faktury zakupu")
                  }
                >
                  <ShoppingCart className={`h-5 w-5 ${
                    permissions.isLoading 
                      ? "text-gray-400" 
                      : permissions.canViewPurchase 
                        ? (selectedTab === "purchase-invoices" ? "text-green-600" : "text-gray-500")
                        : "text-gray-400"
                  }`} />
                  <span
                    className={`text-base font-medium font-quicksand ${
                      permissions.isLoading 
                        ? "text-gray-400" 
                        : permissions.canViewPurchase 
                          ? (selectedTab === "purchase-invoices" ? "text-green-600" : "text-gray-800")
                          : "text-gray-400"
                    }`}
                  >
                    Faktury zakupu
                  </span>
                </a>
              </li>
              
              {/* Faktury sprzedażowe */}
              <li>
                <a
                  href="#"
                  title={!permissions.isLoading && !permissions.canViewSales ? "Brak dostępu" : ""}
                  className={`flex items-center gap-2 px-4 py-2 ${
                    permissions.isLoading 
                      ? "cursor-wait opacity-50" 
                      : permissions.canViewSales 
                        ? `hover:bg-gray-50 ${selectedTab === "sales-invoices" ? "bg-gray-50" : ""}`
                        : "cursor-not-allowed opacity-50"
                  }`}
                  onClick={() => 
                    permissions.isLoading 
                      ? undefined
                      : permissions.canViewSales 
                        ? handleTabChange("sales-invoices")
                        : handleDisabledTabClick("Faktury sprzedaży")
                  }
                >
                  <DollarSign className={`h-5 w-5 ${
                    permissions.isLoading 
                      ? "text-gray-400" 
                      : permissions.canViewSales 
                        ? (selectedTab === "sales-invoices" ? "text-green-600" : "text-gray-500")
                        : "text-gray-400"
                  }`} />
                  <span
                    className={`text-base font-medium font-quicksand ${
                      permissions.isLoading 
                        ? "text-gray-400" 
                        : permissions.canViewSales 
                          ? (selectedTab === "sales-invoices" ? "text-green-600" : "text-gray-800")
                          : "text-gray-400"
                    }`}
                  >
                    Faktury sprzedaży
                  </span>
                </a>
              </li>
              
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${selectedTab === "reports" ? "bg-gray-50" : ""}`}
                  onClick={() => handleTabChange("reports")}
                >
                  <FileSpreadsheet
                    className={`h-5 w-5 ${selectedTab === "reports" ? "text-green-600" : "text-gray-500"}`}
                  />
                  <span
                    className={`text-base font-medium font-quicksand ${selectedTab === "reports" ? "text-green-600" : "text-gray-800"}`}
                  >
                    Raporty
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-50 ${selectedTab === "declarations" ? "bg-gray-50" : ""}`}
                  onClick={() => handleTabChange("declarations")}
                >
                  <FileBarChart
                    className={`h-5 w-5 ${selectedTab === "declarations" ? "text-green-600" : "text-gray-500"}`}
                  />
                  <span
                    className={`text-base font-medium font-quicksand ${selectedTab === "declarations" ? "text-green-600" : "text-gray-800"}`}
                  >
                    Deklaracje
                  </span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <span className="text-base font-medium font-quicksand text-gray-800">Ustawienia</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </a>
                <ul className="pl-4 border-l-2 border-green-600 ml-4">
                  <li>
                    <Link href="/ksef/permissions" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                      <span className="text-base font-medium font-quicksand text-gray-800">Uprawnienia</span>
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                      <span className="text-base font-medium font-quicksand text-gray-800">Konfiguracja</span>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Zawartość główna */}
        <main className="flex-1 p-8">
          {showSuccessMessage && (
            <div className="flex items-start gap-4 p-4 mb-6 bg-purple-50 border border-purple-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-800 flex-shrink-0" />
              <div>
                <p className="font-bold text-purple-800">Zaktualizowano uprawnienia</p>
                <p className="text-sm text-purple-800">Zmiany zostały zapisane pomyślnie</p>
              </div>
              <button className="ml-auto text-purple-800" onClick={() => setShowSuccessMessage(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Wyświetl odpowiednią zakładkę */}
          {selectedTab === "dashboard" && <KsefDashboard />}

          {selectedTab === "purchase-invoices" && <PurchaseInvoicesTab />}
          
          {selectedTab === "sales-invoices" && <SalesInvoicesTab />}

          {selectedTab === "reports" && <ReportsTab />}

          {selectedTab === "declarations" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-[280px]">
                  <Input
                    type="text"
                    placeholder="Wyszukaj na liście"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                </div>
                <Button
                  onClick={() => handleGrantAccess("deklaracji")}
                  className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
                >
                  Nadaj dostęp <Plus className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="p-8 text-center text-gray-500">Zawartość zakładki Deklaracje</div>
            </div>
          )}

          {/* Stopka */}
          <footer className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
            <div className="flex justify-between items-center">
              <div>Wersja systemu: 2.5.0</div>
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
          </footer>
        </main>
      </div>

      {/* Dodaj komponent AccessDialog na końcu komponentu */}
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
