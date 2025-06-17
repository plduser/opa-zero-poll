"use client"

import { useState } from "react"
import { Lock, Unlock, Trash2, Info, Check, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { AddPermissionsDialog } from "./add-permissions-dialog"
import { PermissionsHistoryDialog } from "./permissions-history-dialog"
import type { PermissionChangeRecord } from "./types/permissions-history"

interface DocumentAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: any
  onSave: () => void
}

export function DocumentAccessDialog({ open, onOpenChange, document, onSave }: DocumentAccessDialogProps) {
  const [isConfidential, setIsConfidential] = useState(false)
  const [showAddPermissionsDialog, setShowAddPermissionsDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [permissionChanges, setPermissionChanges] = useState<PermissionChangeRecord[]>([])

  // Przykładowe dane użytkowników i grup z uprawnieniami
  const [permissionEntries, setPermissionEntries] = useState([
    {
      id: 1,
      type: "user",
      name: "Król Marcin",
      position: "Kierownik ds. Inżynierii Oprogramowania",
      avatar: "/diverse-user-avatars.png",
      read: true,
      write: true,
      manage: false,
    },
    {
      id: 2,
      type: "user",
      name: "Paszek Jacek",
      position: "Product Manager",
      avatar: "/diverse-user-avatars.png",
      read: true,
      write: true,
      manage: true,
    },
    {
      id: 3,
      type: "group",
      name: "CASH_MANAGEMENT",
      position: "Grupa",
      avatar: "",
      read: true,
      write: true,
      manage: false,
    },
  ])

  // Funkcja do rejestrowania zmian uprawnień
  const logPermissionChange = (
    userId: number,
    userName: string,
    userType: "user" | "group",
    changeType: "add" | "remove" | "modify",
    permissionType: "read" | "write" | "manage",
    oldValue: boolean,
    newValue: boolean,
  ) => {
    const newChange: PermissionChangeRecord = {
      id: Date.now().toString(),
      documentId: document?.id || "unknown",
      documentName: document?.number || document?.name || "Dokument",
      documentType: document?.type || "unknown",
      userId: userId.toString(),
      userName,
      userType,
      changeType,
      permissionType,
      oldValue,
      newValue,
      changedBy: "Administrator", // W rzeczywistej aplikacji byłby to zalogowany użytkownik
      changedAt: new Date(),
    }

    setPermissionChanges((prev) => [...prev, newChange])

    // W rzeczywistej aplikacji tutaj byłoby wywołanie API do zapisania zmiany
    console.log("Zarejestrowano zmianę uprawnień:", newChange)
  }

  const handlePermissionChange = (id: number, permission: "read" | "write" | "manage", value: boolean) => {
    setPermissionEntries((entries) =>
      entries.map((entry) => {
        if (entry.id === id) {
          // Rejestruj zmianę
          logPermissionChange(
            entry.id,
            entry.name,
            entry.type as "user" | "group",
            "modify",
            permission,
            entry[permission],
            value,
          )
          return { ...entry, [permission]: value }
        }
        return entry
      }),
    )
  }

  const handleRemovePermission = (id: number) => {
    const entry = permissionEntries.find((e) => e.id === id)
    if (entry) {
      // Rejestruj usunięcie wszystkich uprawnień
      if (entry.read) {
        logPermissionChange(entry.id, entry.name, entry.type as "user" | "group", "remove", "read", true, false)
      }
      if (entry.write) {
        logPermissionChange(entry.id, entry.name, entry.type as "user" | "group", "remove", "write", true, false)
      }
      if (entry.manage) {
        logPermissionChange(entry.id, entry.name, entry.type as "user" | "group", "remove", "manage", true, false)
      }
    }

    setPermissionEntries((entries) => entries.filter((entry) => entry.id !== id))
  }

  const handleAddPermissions = (newEntries: any[]) => {
    // Sprawdź, czy nie dodajemy duplikatów
    const newUniqueEntries = newEntries.filter(
      (newEntry) => !permissionEntries.some((entry) => entry.id === newEntry.id),
    )

    // Rejestruj dodanie nowych uprawnień
    newUniqueEntries.forEach((entry) => {
      if (entry.read) {
        logPermissionChange(entry.id, entry.name, entry.type as "user" | "group", "add", "read", false, true)
      }
      if (entry.write) {
        logPermissionChange(entry.id, entry.name, entry.type as "user" | "group", "add", "write", false, true)
      }
      if (entry.manage) {
        logPermissionChange(entry.id, entry.name, entry.type as "user" | "group", "add", "manage", false, true)
      }
    })

    setPermissionEntries([...permissionEntries, ...newUniqueEntries])
  }

  const handleSave = () => {
    // W rzeczywistej aplikacji tutaj byłoby wywołanie API do zapisania zmian
    onSave()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Dostęp do dokumentu</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informacje o twórcy i poufności */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/diverse-user-avatars.png" alt="Jacek Paszek" />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">Utworzono przez</h3>
                <p className="text-lg">Jacek Paszek</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  {isConfidential ? (
                    <Lock className="h-8 w-8 text-green-600" />
                  ) : (
                    <Unlock className="h-8 w-8 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Poufny:</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{isConfidential ? "TAK" : "NIE"}</span>
                    <Switch
                      checked={isConfidential}
                      onCheckedChange={setIsConfidential}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Uprawnienia do dokumentu */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Uprawnienia do dokumentu</h3>

              <button
                className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                onClick={() => setShowHistoryDialog(true)}
              >
                <History className="h-4 w-4" />
                Historia zmian
              </button>
            </div>

            <div className="flex justify-between items-center mb-4">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowAddPermissionsDialog(true)}
              >
                UPRAWNIJ
              </Button>

              <div className="flex items-center gap-2">
                <div className="grid grid-cols-3 gap-4 p-2 w-[300px]">
                  <div className="text-center">Odczyt</div>
                  <div className="text-center">Zapis</div>
                  <div className="text-center">Zarządzanie</div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Info className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Lista użytkowników i grup z uprawnieniami */}
            <div className="space-y-4">
              {permissionEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-4">
                    {entry.type === "user" ? (
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={entry.avatar || "/diverse-user-avatars.png"} alt={entry.name} />
                        <AvatarFallback>{entry.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-12 w-12 bg-gray-200">
                        <AvatarFallback className="text-gray-600">{entry.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <h4 className="font-semibold">{entry.name}</h4>
                      <p className="text-sm text-gray-500">{entry.position}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="grid grid-cols-3 gap-4 w-[300px]">
                      {/* Przycisk Odczyt */}
                      <div className="flex justify-center">
                        <div
                          className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer
                            ${entry.read ? "bg-green-600 border-green-600 text-white" : "border-gray-300 text-transparent"}`}
                          onClick={() => handlePermissionChange(entry.id, "read", !entry.read)}
                        >
                          <Check className="h-5 w-5" />
                        </div>
                      </div>

                      {/* Przycisk Zapis */}
                      <div className="flex justify-center">
                        <div
                          className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer
                            ${entry.write ? "bg-green-600 border-green-600 text-white" : "border-gray-300 text-transparent"}`}
                          onClick={() => handlePermissionChange(entry.id, "write", !entry.write)}
                        >
                          <Check className="h-5 w-5" />
                        </div>
                      </div>

                      {/* Przycisk Zarządzanie */}
                      <div className="flex justify-center">
                        <div
                          className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer
                            ${entry.manage ? "bg-green-600 border-green-600 text-white" : "border-gray-300 text-transparent"}`}
                          onClick={() => handlePermissionChange(entry.id, "manage", !entry.manage)}
                        >
                          <Check className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-600 ml-4"
                      onClick={() => handleRemovePermission(entry.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
            Zapisz zmiany
          </Button>
        </DialogFooter>

        {/* Dialog dodawania uprawnień */}
        <AddPermissionsDialog
          open={showAddPermissionsDialog}
          onOpenChange={setShowAddPermissionsDialog}
          onAdd={handleAddPermissions}
        />

        {/* Dialog historii zmian uprawnień */}
        <PermissionsHistoryDialog
          open={showHistoryDialog}
          onOpenChange={setShowHistoryDialog}
          documentId={document?.id}
          documentName={document?.number || document?.name}
        />
      </DialogContent>
    </Dialog>
  )
}
