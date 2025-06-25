"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2, Users } from "lucide-react"
import { createTeam, type CreateTeamData, type Team } from "@/lib/teams-api"

interface CreateTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  onSuccess: (team: Team, message: string) => void
  onError: (message: string) => void
}

export function CreateTeamDialog({
  open,
  onOpenChange,
  tenantId,
  onSuccess,
  onError
}: CreateTeamDialogProps) {
  const [formData, setFormData] = useState<CreateTeamData>({
    team_name: "",
    tenant_id: tenantId,
    description: "",
    team_type: "functional"
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.team_name.trim()) {
      onError('Nazwa zespołu jest wymagana')
      return
    }

    setSubmitting(true)
    try {
      const result = await createTeam({
        ...formData,
        team_name: formData.team_name.trim(),
        description: formData.description?.trim() || undefined
      })

      if (result) {
        onSuccess(result, `Utworzono zespół "${result.team_name}"`)
        resetForm()
        onOpenChange(false)
      } else {
        onError('Nie udało się utworzyć zespołu')
      }
    } catch (error) {
      console.error('Error creating team:', error)
      onError(error instanceof Error ? error.message : 'Błąd podczas tworzenia zespołu')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      team_name: "",
      tenant_id: tenantId,
      description: "",
      team_type: "functional"
    })
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const formatTeamType = (type: string) => {
    switch (type) {
      case 'functional': return 'Funkcjonalny'
      case 'project': return 'Projektowy'
      case 'department': return 'Departament'
      case 'external': return 'Zewnętrzny'
      default: return type
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Utwórz nowy zespół
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Utwórz nowy zespół do zarządzania grupą użytkowników
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nazwa zespołu */}
          <div className="space-y-2">
            <Label htmlFor="team_name" className="font-medium text-gray-900">
              Nazwa zespołu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="team_name"
              type="text"
              placeholder="np. Zespół Księgowości, Dział IT, Projekt Alpha..."
              value={formData.team_name}
              onChange={(e) => setFormData(prev => ({ ...prev, team_name: e.target.value }))}
              className="w-full"
              disabled={submitting}
              required
            />
          </div>

          {/* Typ zespołu */}
          <div className="space-y-2">
            <Label htmlFor="team_type" className="font-medium text-gray-900">
              Typ zespołu
            </Label>
                         <Select 
               value={formData.team_type} 
               onValueChange={(value: "functional" | "project" | "department" | "external") => 
                 setFormData(prev => ({ ...prev, team_type: value }))}
               disabled={submitting}
             >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wybierz typ zespołu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="functional">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>Funkcjonalny - stały zespół organizacyjny</span>
                  </div>
                </SelectItem>
                <SelectItem value="project">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span>Projektowy - zespół do konkretnego projektu</span>
                  </div>
                </SelectItem>
                <SelectItem value="department">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>Departament - duża jednostka organizacyjna</span>
                  </div>
                </SelectItem>
                                 <SelectItem value="external">
                   <div className="flex items-center gap-2">
                     <Users className="h-4 w-4 text-orange-600" />
                     <span>Zewnętrzny - zespół czasowy</span>
                   </div>
                 </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Typ określa charakter zespołu i może wpływać na dostępne opcje zarządzania
            </p>
          </div>

          {/* Opis zespołu */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium text-gray-900">
              Opis zespołu
            </Label>
            <Textarea
              id="description"
              placeholder="Opisz cel i zadania zespołu..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full"
              rows={3}
              disabled={submitting}
            />
            <p className="text-xs text-gray-500">
              Opcjonalny opis pomoże innym zrozumieć cel i zakres odpowiedzialności zespołu
            </p>
          </div>

          {/* Podsumowanie */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="font-medium text-gray-900 mb-2">Podsumowanie:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Nazwa:</strong> {formData.team_name || "Nie podano"}</p>
              <p><strong>Typ:</strong> {formatTeamType(formData.team_type || 'functional')}</p>
              <p><strong>Opis:</strong> {formData.description || "Brak opisu"}</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={submitting}
            >
              Anuluj
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={submitting || !formData.team_name.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tworzenie...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Utwórz zespół
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 