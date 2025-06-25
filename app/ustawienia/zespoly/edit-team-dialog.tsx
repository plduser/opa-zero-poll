"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Loader2, Users } from "lucide-react"
import { updateTeam, type UpdateTeamData, type Team } from "@/lib/teams-api"

interface EditTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: Team | null
  onSuccess: (team: Team, message: string) => void
  onError: (message: string) => void
}

export function EditTeamDialog({
  open,
  onOpenChange,
  team,
  onSuccess,
  onError
}: EditTeamDialogProps) {
  const [formData, setFormData] = useState<UpdateTeamData>({
    team_name: "",
    description: "",
    team_type: "functional",
    status: "active"
  })
  const [submitting, setSubmitting] = useState(false)

  // Reset form when team changes or dialog opens
  useEffect(() => {
    if (team && open) {
      setFormData({
        team_name: team.team_name,
        description: team.description || "",
        team_type: team.team_type,
        status: team.status
      })
    }
  }, [team, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!team?.team_id) {
      onError('Brak danych zespołu do edycji')
      return
    }
    
    if (!formData.team_name?.trim()) {
      onError('Nazwa zespołu jest wymagana')
      return
    }

    setSubmitting(true)
    try {
      const updateData: UpdateTeamData = {
        team_name: formData.team_name.trim(),
        description: formData.description?.trim() || undefined,
        team_type: formData.team_type,
        status: formData.status
      }

      const result = await updateTeam(team.team_id, updateData)

      if (result) {
        onSuccess(result, `Zaktualizowano zespół "${result.team_name}"`)
        onOpenChange(false)
      } else {
        onError('Nie udało się zaktualizować zespołu')
      }
    } catch (error) {
      console.error('Error updating team:', error)
      onError(error instanceof Error ? error.message : 'Błąd podczas aktualizacji zespołu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
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

  const formatStatus = (status: string) => {
    switch (status) {
      case 'active': return 'Aktywny'
      case 'inactive': return 'Nieaktywny'
      case 'archived': return 'Zarchiwizowany'
      default: return status
    }
  }

  if (!team) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Edytuj zespół
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Modyfikuj ustawienia zespołu: <strong>{team.team_name}</strong>
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
          </div>

          {/* Status zespołu */}
          <div className="space-y-2">
            <Label htmlFor="status" className="font-medium text-gray-900">
              Status zespołu
            </Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: "active" | "inactive" | "archived") => 
                setFormData(prev => ({ ...prev, status: value }))}
              disabled={submitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wybierz status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Aktywny - zespół jest w pełni operacyjny</span>
                  </div>
                </SelectItem>
                <SelectItem value="inactive">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Nieaktywny - zespół jest wstrzymany</span>
                  </div>
                </SelectItem>
                <SelectItem value="archived">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    <span>Zarchiwizowany - zespół jest zakończony</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Status wpływa na dostępność zespołu dla użytkowników
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
          </div>

          {/* Podsumowanie zmian */}
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="font-medium text-blue-900 mb-2">Podgląd zmian:</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p><strong>Nazwa:</strong> {formData.team_name || "Nie podano"}</p>
              <p><strong>Typ:</strong> {formatTeamType(formData.team_type || 'functional')}</p>
              <p><strong>Status:</strong> {formatStatus(formData.status || 'active')}</p>
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
              className="bg-blue-600 hover:bg-blue-700"
              disabled={submitting || !formData.team_name?.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Zapisz zmiany
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 