"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus } from "lucide-react"

interface GrantAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: number
  userName: string
  userEmail: string
  onSave: () => void
}

export function GrantAccessDialog({ open, onOpenChange, userId, userName, userEmail, onSave }: GrantAccessDialogProps) {
  const [selectedApplication, setSelectedApplication] = useState<string>("")
  const [selectedProfile, setSelectedProfile] = useState<string>("")
  const [availableProfiles, setAvailableProfiles] = useState<any[]>([])

  // Przykładowe aplikacje
  const applications = [
    { id: "ebiuro", name: "eBiuro" },
    { id: "ksef", name: "KSEF" },
    { id: "edokumenty", name: "eDokumenty" },
    { id: "edeklaracje", name: "eDeklaracje" },
    { id: "eplace", name: "ePłace" },
    { id: "fk", name: "Finanse i Księgowość" },
    { id: "handel", name: "Handel" },
  ]

  // Profile dla różnych aplikacji
  const applicationProfiles = {
    ebiuro: [
      { id: 1, name: "Administrator", description: "Pełne uprawnienia administracyjne" },
      { id: 2, name: "Kierownik", description: "Uprawnienia zarządcze" },
      { id: 3, name: "Pracownik", description: "Podstawowe uprawnienia operacyjne" },
      { id: 4, name: "Przeglądający", description: "Tylko przeglądanie danych" },
    ],
    ksef: [
      {
        id: 1,
        name: "Księgowa",
        description: "Dostęp do pełnej funkcjonalności faktur, bez zarządzania użytkownikami",
      },
      { id: 2, name: "Handlowiec", description: "Dostęp do faktur sprzedażowych i podstawowych funkcji" },
      { id: 3, name: "Zakupowiec", description: "Dostęp do faktur zakupowych i podstawowych funkcji" },
      { id: 4, name: "Administrator", description: "Pełne uprawnienia administracyjne do systemu KSEF" },
      { id: 5, name: "Właściciel", description: "Pełny dostęp do wszystkich funkcji systemu KSEF" },
    ],
    edokumenty: [
      { id: 1, name: "Administrator", description: "Pełne uprawnienia administracyjne" },
      { id: 2, name: "Zarząd", description: "Uprawnienia zarządcze" },
      { id: 3, name: "Księgowa", description: "Uprawnienia księgowe" },
      { id: 4, name: "Główna Księgowa", description: "Rozszerzone uprawnienia księgowe" },
      { id: 5, name: "Sekretariat", description: "Uprawnienia sekretariatu" },
      { id: 6, name: "Użytkownik", description: "Podstawowe uprawnienia" },
      { id: 7, name: "Przeglądający", description: "Tylko przeglądanie" },
    ],
    // Pozostałe aplikacje...
  }

  // Aktualizacja dostępnych profili po zmianie aplikacji
  useEffect(() => {
    if (selectedApplication && applicationProfiles[selectedApplication as keyof typeof applicationProfiles]) {
      setAvailableProfiles(applicationProfiles[selectedApplication as keyof typeof applicationProfiles])
      setSelectedProfile("")
    } else {
      setAvailableProfiles([])
      setSelectedProfile("")
    }
  }, [selectedApplication])

  const handleSave = () => {
    // Tutaj logika zapisywania dostępu
    console.log(
      `Nadano dostęp użytkownikowi ${userName} (${userEmail}) do aplikacji ${selectedApplication} z profilem ${selectedProfile}`,
    )
    onSave()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-quicksand">Nadaj dostęp do aplikacji</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informacja o użytkowniku */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Użytkownik:</h3>
            <p className="font-bold">{userName}</p>
            <p className="text-gray-600">{userEmail}</p>
          </div>

          {/* Wybór aplikacji */}
          <div className="space-y-2">
            <label className="text-sm font-medium font-quicksand">Aplikacja</label>
            <Select value={selectedApplication} onValueChange={setSelectedApplication}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wybierz aplikację" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((app) => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wybór profilu */}
          <div className="space-y-2">
            <label className="text-sm font-medium font-quicksand">Profil</label>
            <Select value={selectedProfile} onValueChange={setSelectedProfile} disabled={!selectedApplication}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wybierz profil" />
              </SelectTrigger>
              <SelectContent>
                {availableProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id.toString()}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Opis wybranego profilu */}
          {selectedProfile && (
            <div className="p-3 bg-gray-50 rounded border">
              <h4 className="font-medium">Opis profilu:</h4>
              <p className="text-sm text-gray-600">
                {availableProfiles.find((p) => p.id.toString() === selectedProfile)?.description}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
            onClick={handleSave}
            disabled={!selectedApplication || !selectedProfile}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nadaj dostęp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
