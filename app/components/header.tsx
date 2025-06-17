"use client"

import { Menu, ChevronDown, Settings, User } from "lucide-react"
import { useState, useEffect } from "react"
import { AppSwitcher } from "./app-switcher"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
}

// Fallback użytkownicy dla sytuacji gdy API nie działa
const fallbackUsers = [
  { id: "user123", name: "Jan Kowalski", email: "jan.kowalski@firmowa.pl", initials: "JK", role: "ksiegowa" },
  { id: "user456", name: "Anna Nowak", email: "anna.nowak@firmowa.pl", initials: "AN", role: "handlowiec" },
  { id: "user789", name: "Piotr Zieliński", email: "piotr.zielinski@firmowa.pl", initials: "PZ", role: "administrator" },
]

export function Header({ title }: HeaderProps) {
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(fallbackUsers[0]) // Domyślna wartość dla SSR
  const [users, setUsers] = useState(fallbackUsers) // Stan dla prawdziwych użytkowników
  const [isClient, setIsClient] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  // Pobierz prawdziwych użytkowników z API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('[Header] Pobieranie użytkowników z API...')
        const response = await fetch('/api/users')
        const data = await response.json()
        
        if (data.success && data.users?.length > 0) {
          console.log('[Header] Pobrano prawdziwych użytkowników:', data.users)
          setUsers(data.users)
          
          // Jeśli aktualny użytkownik nie istnieje w nowej liście, ustaw pierwszego
          const currentStored = localStorage.getItem('currentUser')
          if (currentStored) {
            const storedUser = JSON.parse(currentStored)
            const existingUser = data.users.find((u: any) => u.id === storedUser.id)
            if (existingUser) {
              setCurrentUser(existingUser)
            } else {
              setCurrentUser(data.users[0])
              localStorage.setItem('currentUser', JSON.stringify(data.users[0]))
            }
          } else {
            setCurrentUser(data.users[0])
            localStorage.setItem('currentUser', JSON.stringify(data.users[0]))
          }
        } else {
          console.log('[Header] Brak użytkowników z API, używam fallback')
        }
      } catch (error) {
        console.error('[Header] Błąd pobierania użytkowników:', error)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  // Ładuj dane z localStorage tylko po stronie klienta
  useEffect(() => {
    setIsClient(true)
    const stored = localStorage.getItem('currentUser')
    if (stored && !isLoadingUsers) {
      try {
        const storedUser = JSON.parse(stored)
        // Sprawdź czy użytkownik istnieje w aktualnej liście
        const existingUser = users.find(u => u.id === storedUser.id)
        if (existingUser) {
          setCurrentUser(existingUser)
        }
      } catch (e) {
        console.error('Błąd parsowania użytkownika z localStorage:', e)
      }
    }
  }, [users, isLoadingUsers])

  const handleUserChange = (user: typeof fallbackUsers[0]) => {
    setCurrentUser(user)
    setIsUserDialogOpen(false)
    
    // Zapisz wybranego użytkownika w localStorage
    localStorage.setItem('currentUser', JSON.stringify(user))
    
    // Tutaj w przyszłości zostanie dodane faktyczne przelogowanie Auth0
    window.location.reload() // Odświeżenie strony dla zastosowania nowych uprawnień
  }

  return (
    <>
      <header className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <button className="p-1">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <img src="/symfonia-logo.png" alt="Symfonia" className="h-10 relative top-[3px]" />
            <span className="text-lg font-medium font-quicksand ml-4">{title}</span>
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
          <button 
            onClick={() => setIsUserDialogOpen(true)}
            className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-800 hover:bg-green-200 transition-colors"
            title={`${currentUser.name} (${currentUser.role})`}
          >
            {currentUser.initials}
          </button>
        </div>
      </header>

      {/* Dialog wyboru użytkownika */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Wybierz użytkownika</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                  currentUser.id === user.id ? "border-green-500 bg-green-50" : "border-gray-200"
                }`}
                onClick={() => handleUserChange(user)}
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-800">
                  {user.initials}
                </div>
                <div className="flex-1">
                  <div className="font-medium font-quicksand">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-xs text-gray-400">{user.role}</div>
                </div>
                {currentUser.id === user.id && (
                  <div className="text-green-600 text-sm font-medium">Aktualny</div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Anuluj
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
