"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Layers, Users, CheckCircle, Loader2, Info } from "lucide-react"
import { addTeamApplication } from "@/lib/teams-api"

interface TeamApplicationAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  teamName: string
  existingApplications: string[] // app_id + role_name combinations to exclude
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function TeamApplicationAccessDialog({
  open,
  onOpenChange,
  teamId,
  teamName,
  existingApplications,
  onSuccess,
  onError,
}: TeamApplicationAccessDialogProps) {
  const [selectedApplication, setSelectedApplication] = useState("")
  const [selectedProfile, setSelectedProfile] = useState("")
  const [applications, setApplications] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Załaduj dostępne aplikacje
  useEffect(() => {
    const loadApplications = async () => {
      if (!open) return
      
      try {
        setLoading(true)
        const response = await fetch('/api/applications')
        const data = await response.json()
        setApplications(data.database_applications || [])
      } catch (error) {
        console.error('Błąd ładowania aplikacji:', error)
        onError('Nie udało się załadować listy aplikacji')
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [open, onError])

  // Załaduj profile dla wybranej aplikacji
  useEffect(() => {
    const loadProfiles = async () => {
      if (!selectedApplication) {
        setProfiles([])
        return
      }

      try {
        const response = await fetch('/api/profiles')
        const data = await response.json()
        
        // Znajdź app_id dla wybranej aplikacji
        const selectedApp = applications.find(app => app.app_name === selectedApplication)
        const appId = selectedApp ? selectedApp.app_id : selectedApplication.toLowerCase()
        
        // Filtruj profile dla wybranej aplikacji
        const filteredProfiles = data.profiles.filter((profile: any) =>
          profile.applications.includes(appId)
        )
        setProfiles(filteredProfiles)
      } catch (error) {
        console.error('Błąd ładowania profili:', error)
        onError('Nie udało się załadować listy profili')
      }
    }

    loadProfiles()
  }, [selectedApplication, applications, onError])

  const handleApplicationChange = (value: string) => {
    setSelectedApplication(value)
    setSelectedProfile("")
  }

  const handleSubmit = async () => {
    if (!selectedApplication || !selectedProfile) {
      onError('Wybierz aplikację i profil')
      return
    }

    // Znajdź app_id dla wybranej aplikacji
    const selectedApp = applications.find(app => app.app_name === selectedApplication)
    const appId = selectedApp ? selectedApp.app_id : selectedApplication.toLowerCase()

    setSubmitting(true)
    try {
      console.log('Wysyłanie zapytania API:', {
        teamId,
        appId,
        roleName: selectedProfile,
      })
      
      // Znajdź profile_name na podstawie wybranego profile_id
      const selectedProfileData = profiles.find(p => p.profile_id === selectedProfile)
      const profileName = selectedProfileData?.profile_name

      if (!profileName) {
        onError('Nie znaleziono nazwy profilu')
        return
      }

      const result = await addTeamApplication(teamId, {
        app_id: appId,
        role_name: profileName
      })

      if (result.success) {
        onSuccess(`Nadano zespołowi dostęp do aplikacji ${selectedApplication}`)
        resetDialog()
        onOpenChange(false)
      } else {
        console.error('Szczegóły błędu:', result.error)
        onError(result.error || 'Nie udało się nadać dostępu do aplikacji')
      }
    } catch (error) {
      console.error('Network error:', error)
      onError('Błąd podczas nadawania dostępu do aplikacji')
    } finally {
      setSubmitting(false)
    }
  }

  const resetDialog = () => {
    setSelectedApplication("")
    setSelectedProfile("")
  }

  const handleClose = () => {
    onOpenChange(false)
    resetDialog()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-quicksand flex items-center gap-2">
            <Layers className="h-5 w-5 text-green-600" />
            Nadaj dostęp do aplikacji
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Informacje o zespole */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium font-quicksand">{teamName}</h4>
              <p className="text-sm text-gray-600">Zespół</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Wybór aplikacji */}
            <div className="space-y-2">
              <Label className="text-sm font-medium font-quicksand">Aplikacja</Label>
              <div className="relative">
                <Select 
                  value={selectedApplication} 
                  onValueChange={handleApplicationChange}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Ładowanie..." : "Wybierz aplikację"} />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map((app, index) => (
                      <SelectItem key={`${app.app_id}-${index}`} value={app.app_name}>
                        {app.app_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Search className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
              </div>
            </div>

            {/* Wybór profilu */}
            {selectedApplication && (
              <div className="space-y-2">
                <Label className="text-sm font-medium font-quicksand">Profil/Rola</Label>
                <Select 
                  value={selectedProfile} 
                  onValueChange={setSelectedProfile}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz profil" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.profile_id} value={profile.profile_id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{profile.profile_name}</span>
                          <span className="text-sm text-gray-500">{profile.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Podsumowanie */}
            {selectedApplication && selectedProfile && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800 font-quicksand">Podsumowanie</h4>
                    <p className="text-sm text-green-700 font-quicksand">
                      Zespół <strong>{teamName}</strong> otrzyma dostęp do aplikacji{" "}
                      <strong>{selectedApplication}</strong> z profilem{" "}
                      <strong>{profiles.find(p => p.profile_id === selectedProfile)?.profile_name}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="font-quicksand"
          >
            Anuluj
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedApplication || !selectedProfile || submitting}
            className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Nadawanie...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Nadaj dostęp
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 