"use client"

import { useState } from "react"
import {
  CheckCircle,
  Home,
  Settings,
  ChevronDown,
  FileText,
  Lock,
  FileSpreadsheet,
  DollarSign,
  Database,
  X,
  Users,
  User,
  Shield,
  Menu,
  BookOpen,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Link from "next/link"
import { AppSwitcher } from "@/app/components/app-switcher"
import { UsersTab } from "./tabs/users-tab"
import { GroupsTab } from "./tabs/groups-tab"
import { ProfilesTab } from "./tabs/profiles-tab"
import { PermissionDefinitionsTab } from "./tabs/permission-definitions-tab"

export default function FkPermissionsPage() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [activeTab, setActiveTab] = useState("users")
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(true)

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
            <span className="text-lg font-medium font-quicksand ml-4">Finanse i Księgowość</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <select className="flex items-center gap-2 px-4 py-2 border rounded-md font-quicksand appearance-none cursor-pointer pr-10">
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
                <Link href="/fk" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <Home className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Pulpit</span>
                </Link>
              </li>
              <li>
                <Link href="/fk" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Dokumenty księgowe</span>
                </Link>
              </li>
              <li>
                <Link href="/fk" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <FileSpreadsheet className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Raporty</span>
                </Link>
              </li>
              <li>
                <Link href="/fk" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Rozrachunki</span>
                </Link>
              </li>
              <li>
                <Link href="/fk" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <Database className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Słowniki</span>
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center justify-between px-6 py-3 bg-gray-50"
                  onClick={(e) => {
                    e.preventDefault()
                    setIsSettingsMenuOpen(!isSettingsMenuOpen)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-green-600" />
                    <span className="text-base font-medium font-quicksand text-green-600">Ustawienia</span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-green-600 ${isSettingsMenuOpen ? "transform rotate-180" : ""}`}
                  />
                </a>
                <ul className={`pl-4 border-l-2 border-green-600 ml-4 ${isSettingsMenuOpen ? "block" : "hidden"}`}>
                  <li>
                    <Link href="/fk/permissions" className="flex items-center gap-3 px-6 py-3 bg-gray-50">
                      <Lock className="h-5 w-5 text-green-600" />
                      <span className="text-base font-medium text-green-600 font-quicksand">Uprawnienia</span>
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
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
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
            <Lock className="h-6 w-6" />
            Zarządzanie uprawnieniami
          </h1>

          {showSuccessMessage && (
            <div className="flex items-start gap-4 p-4 mb-6 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-800 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-800">Zaktualizowano uprawnienia</p>
                <p className="text-sm text-green-800">Zmiany zostały zapisane pomyślnie</p>
              </div>
              <button className="ml-auto text-green-800" onClick={() => setShowSuccessMessage(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border-b border-gray-200 w-full justify-start rounded-none p-0 h-auto">
              <TabsTrigger
                value="users"
                className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none rounded-none px-6 py-3 font-quicksand"
              >
                <User className="h-5 w-5 mr-2" />
                Użytkownicy
              </TabsTrigger>
              <TabsTrigger
                value="groups"
                className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none rounded-none px-6 py-3 font-quicksand"
              >
                <Users className="h-5 w-5 mr-2" />
                Grupy
              </TabsTrigger>
              <TabsTrigger
                value="profiles"
                className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none rounded-none px-6 py-3 font-quicksand"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="permissions"
                className="data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-600 data-[state=active]:shadow-none rounded-none px-6 py-3 font-quicksand"
              >
                <Shield className="h-5 w-5 mr-2" />
                Definicje uprawnień
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6 p-0">
              <UsersTab onSuccess={() => setShowSuccessMessage(true)} />
            </TabsContent>

            <TabsContent value="groups" className="mt-6 p-0">
              <GroupsTab onSuccess={() => setShowSuccessMessage(true)} />
            </TabsContent>

            <TabsContent value="profiles" className="mt-6 p-0">
              <ProfilesTab onSuccess={() => setShowSuccessMessage(true)} />
            </TabsContent>

            <TabsContent value="permissions" className="mt-6 p-0">
              <PermissionDefinitionsTab onSuccess={() => setShowSuccessMessage(true)} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
