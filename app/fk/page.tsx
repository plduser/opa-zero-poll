"use client"

import { useState } from "react"
import { Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppSwitcher } from "@/app/components/app-switcher"
import { PortalSettingsDropdown } from "@/app/components/portal-settings-dropdown"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useAppMenu } from "@/hooks/use-app-menu"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Users } from "lucide-react"
import { Search } from "lucide-react"

// Import module components
import { Dashboard } from "./modules/dashboard"
import { Documents } from "./modules/documents"
import { Reports } from "./modules/reports"
import { Payments } from "./modules/payments"
import { Dictionaries } from "./modules/dictionaries"

export default function FkPage() {
  const [selectedModule, setSelectedModule] = useState("dashboard")
  const [selectedDictionary, setSelectedDictionary] = useState<string | null>(null)
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { menuItems, activeItem, currentApp } = useAppMenu()

  // Przykładowe grupy dla dialogu nadawania dostępu
  const groups = [
    { id: 1, name: "ADMINISTRATORZY FK", description: "Grupa administratorów systemu FK" },
    { id: 2, name: "KSIĘGOWI", description: "Grupa księgowych" },
    { id: 3, name: "KADRY I PŁACE", description: "Grupa pracowników kadr i płac" },
    { id: 4, name: "ROZRACHUNKI", description: "Grupa zajmująca się rozrachunkami" },
    { id: 5, name: "RAPORTY FINANSOWE", description: "Grupa zajmująca się raportami finansowymi" },
  ]

  const users = [
    { id: 1, name: "Jan Kowalski", email: "jan.kowalski@example.com" },
    { id: 2, name: "Anna Nowak", email: "anna.nowak@example.com" },
    { id: 3, name: "Piotr Wiśniewski", email: "piotr.wisniewski@example.com" },
    { id: 4, name: "Magdalena Dąbrowska", email: "magdalena.dabrowska@example.com" },
    { id: 5, name: "Tomasz Lewandowski", email: "tomasz.lewandowski@example.com" },
  ]

  const permissions = [
    {
      id: "edit_dictionary",
      name: "Edycja słownika",
      description:
        "Umożliwia modyfikację nazwy i skrótu słownika oraz edycję ustawień domyślnego, proponowanego i pustego elementu",
    },
    {
      id: "delete_dictionary",
      name: "Usuwanie słownika",
      description: "Umożliwia usunięcie słownika z całą jego zawartością",
    },
    {
      id: "edit_attributes",
      name: "Edycja atrybutów",
      description:
        "Umożliwia dodawanie, edycję oraz usuwanie atrybutów dodatkowych Słownika, jak i atrybutów dodatkowych elementów tego słownika",
    },
    {
      id: "change_activity",
      name: "Zmiana aktywności",
      description: "Daje możliwość zmiany aktywności słownika i elementów tego słownika",
    },
    {
      id: "edit_elements",
      name: "Edycja elementów",
      description: "Umożliwia edycję nazw i skrótów elementów wybranego słownika",
    },
    {
      id: "add_elements",
      name: "Dodawanie elementów",
      description: "Umożliwia dodawanie nowych elementów do słownika",
    },
    { id: "delete_elements", name: "Usuwanie elementów", description: "Umożliwia usuwanie elementów ze słownika" },
    {
      id: "share_dictionary",
      name: "Udostępnianie słownika",
      description: "Daje możliwość udostępniania słownika innym użytkownikom",
    },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleGrantAccess = (dictionaryId: string) => {
    setSelectedDictionary(dictionaryId)
    setIsAccessDialogOpen(true)
  }

  // Formatowanie kwoty
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Formatowanie daty
  const formatDate = (dateString: string) => {
    if (dateString === "-") return "-"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pl-PL").format(date)
  }

  // Renderowanie statusu dokumentu
  const renderDocumentStatus = (status: string) => {
    switch (status) {
      case "Zaksięgowana":
      case "Zaksięgowany":
      case "Zatwierdzona":
      case "Zatwierdzony":
        return <Badge className="bg-green-100 text-green-800 border-green-200">{status}</Badge>
      case "Do zatwierdzenia":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>
      case "Wystawiona":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{status}</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  // Renderowanie statusu płatności
  const renderPaymentStatus = (status: string, daysOverdue: number) => {
    switch (status) {
      case "Zapłacona":
        return <Badge className="bg-green-100 text-green-800 border-green-200">{status}</Badge>
      case "Niezapłacona":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>
      case "Przeterminowana":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            {status} ({daysOverdue} dni)
          </Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

    return (
    <div className="min-h-screen bg-white">
      <AppHeader title={currentApp} />

      {/* Menu boczne i zawartość - teraz sidebar zaczyna się pod nagłówkiem */}
      <div className="flex">
        <AppSidebar 
          menuItems={menuItems}
          activeItem={activeItem}
          onItemClick={(item) => {
            // Obsługa kliknięć w menu dla działania single-page application
            if (item.id === "dashboard") setSelectedModule("dashboard")
            else if (item.id === "documents") setSelectedModule("documents")
            else if (item.id === "reports") setSelectedModule("reports")
            else if (item.id === "payments") setSelectedModule("payments")
            else if (item.id === "dictionaries") setSelectedModule("dictionaries")
          }}
        />

        {/* Zawartość główna */}
        <main className="flex-1 p-8 bg-gray-50">
          {selectedModule === "dashboard" && (
            <Dashboard
              setSelectedModule={setSelectedModule}
              formatAmount={formatAmount}
              formatDate={formatDate}
              renderDocumentStatus={renderDocumentStatus}
            />
          )}

          {selectedModule === "documents" && (
            <Documents
              formatAmount={formatAmount}
              formatDate={formatDate}
              renderDocumentStatus={renderDocumentStatus}
            />
          )}

          {selectedModule === "reports" && (
            <Reports formatDate={formatDate} renderDocumentStatus={renderDocumentStatus} />
          )}

          {selectedModule === "payments" && (
            <Payments formatAmount={formatAmount} formatDate={formatDate} renderPaymentStatus={renderPaymentStatus} />
          )}

          {selectedModule === "dictionaries" && <Dictionaries handleGrantAccess={handleGrantAccess} />}
        </main>
      </div>

      {/* Dialog nadawania dostępu */}
      <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Nadaj dostęp do słownika {selectedDictionary}</DialogTitle>
            <DialogDescription>Wybierz użytkowników, grupy i uprawnienia, które chcesz im nadać.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users" className="font-quicksand">
                <User className="h-4 w-4 mr-2" />
                Użytkownicy
              </TabsTrigger>
              <TabsTrigger value="groups" className="font-quicksand">
                <Users className="h-4 w-4 mr-2" />
                Grupy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Użytkownicy</h3>
                  <div className="relative mb-4">
                    <Input
                      type="text"
                      placeholder="Wyszukaj użytkownika"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-300"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                  </div>
                  <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox />
                          </TableHead>
                          <TableHead>Użytkownik</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Uprawnienia</h3>
                  <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox />
                          </TableHead>
                          <TableHead>Uprawnienie</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {permissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{permission.name}</div>
                                <div className="text-sm text-gray-500">{permission.description}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="groups">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Grupy</h3>
                  <div className="relative mb-4">
                    <Input
                      type="text"
                      placeholder="Wyszukaj grupę"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-300"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                  </div>
                  <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox />
                          </TableHead>
                          <TableHead>Grupa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGroups.map((group) => (
                          <TableRow key={group.id}>
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{group.name}</div>
                                <div className="text-sm text-gray-500">{group.description}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Uprawnienia</h3>
                  <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox />
                          </TableHead>
                          <TableHead>Uprawnienie</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {permissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{permission.name}</div>
                                <div className="text-sm text-gray-500">{permission.description}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAccessDialogOpen(false)}>
              Anuluj
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">Nadaj dostęp</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
