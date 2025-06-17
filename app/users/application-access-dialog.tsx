"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Search, Layers, User } from "lucide-react"

interface ApplicationAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function ApplicationAccessDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
  onError,
}: ApplicationAccessDialogProps) {
  const [selectedApplication, setSelectedApplication] = useState("")
  const [selectedProfile, setSelectedProfile] = useState("")
  const [applications, setApplications] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Załaduj dostępne aplikacje
  useEffect(() => {
    const loadApplications = async () => {
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

    if (open) {
      loadApplications()
    }
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

    setSubmitting(true)
    try {
      console.log('Wysyłanie zapytania API:', {
        userId: user.user_id || user.id,
        profileId: selectedProfile,
      })
      
      const response = await fetch(`/api/users/${user.user_id || user.id}/application-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: selectedProfile,
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Success result:', result)
        onSuccess(`Przyznano dostęp do aplikacji ${selectedApplication}`)
        onOpenChange(false)
        
        // Reset form
        setSelectedApplication("")
        setSelectedProfile("")
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        
        // Lepsze komunikaty dla konkretnych błędów
        let errorMessage = 'Nie udało się przyznać dostępu do aplikacji'
        if (response.status === 409) {
          errorMessage = `Użytkownik ma już dostęp do tego profilu. ${errorData.error || ''}`
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
        
        onError(errorMessage)
      }
    } catch (error) {
      console.error('Network error:', error)
      onError('Błąd podczas przyznawania dostępu do aplikacji')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSelectedApplication("")
    setSelectedProfile("")
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

        {user && (
          <div className="py-4">
            {/* Informacje o użytkowniku */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium font-quicksand">{user.name}</h4>
                <p className="text-sm text-gray-600">{user.email}</p>
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
              <div className="space-y-2">
                <Label className="text-sm font-medium font-quicksand">Profil</Label>
                <div className="relative">
                  <Select 
                    value={selectedProfile} 
                    onValueChange={setSelectedProfile} 
                    disabled={!selectedApplication || profiles.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedApplication 
                          ? "Najpierw wybierz aplikację" 
                          : profiles.length === 0 
                            ? "Brak dostępnych profili" 
                            : "Wybierz profil"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.profile_id} value={profile.profile_id}>
                          <div className="flex flex-col">
                            <span>{profile.profile_name}</span>
                            <span className="text-xs text-gray-500">{profile.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Search className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                </div>
              </div>

              {/* Podgląd wybranego profilu */}
              {selectedProfile && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-medium text-sm text-blue-800 mb-1">Wybrany profil:</h5>
                  {profiles.find(p => p.profile_id === selectedProfile) && (
                    <div>
                      <p className="text-sm text-blue-700 font-medium">
                        {profiles.find(p => p.profile_id === selectedProfile)?.profile_name}
                      </p>
                      <p className="text-xs text-blue-600">
                        {profiles.find(p => p.profile_id === selectedProfile)?.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            className="border-green-600 text-green-600 font-quicksand"
            onClick={handleClose}
            disabled={submitting}
          >
            Anuluj
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
            onClick={handleSubmit}
            disabled={!selectedApplication || !selectedProfile || submitting}
          >
            {submitting ? 'Przyznawanie...' : 'Nadaj dostęp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 