"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Users, CheckCircle, Loader2, Info } from "lucide-react"
import { addTeamCompany } from "@/lib/teams-api"
import { fetchCompaniesForUsers, type Company } from "@/lib/users-api"
import { useUserContext } from "@/hooks/use-user-context"

interface TeamCompanyAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  teamName: string
  existingCompanies: string[] // company_ids to exclude
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function TeamCompanyAccessDialog({ 
  open, 
  onOpenChange, 
  teamId,
  teamName,
  existingCompanies,
  onSuccess, 
  onError 
}: TeamCompanyAccessDialogProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [selectedAccessType] = useState<'view' | 'edit' | 'manage' | 'admin'>('manage') // Domyślnie manage
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Pobierz kontekst tenanta
  const { tenantId, isLoading: isContextLoading } = useUserContext()

  // Załaduj firmy przy otwarciu dialogu
  useEffect(() => {
    if (open && !isContextLoading && tenantId) {
      loadCompanies()
      // Reset state when dialog opens
      setSelectedCompany("")
    }
  }, [open, tenantId, isContextLoading])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      console.log('Loading companies...')
      
      const companiesData = await fetchCompaniesForUsers(tenantId || undefined)
      console.log('Companies loaded:', companiesData)
      
      // Filtruj firmy już przypisane do zespołu
      const availableCompanies = companiesData.filter(company => 
        !existingCompanies.includes(company.company_id)
      )
      
      setCompanies(availableCompanies)
    } catch (error) {
      console.error('Error loading companies:', error)
      onError('Nie udało się załadować listy firm')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedCompany) {
      onError('Wybierz firmę')
      return
    }

    try {
      setIsSubmitting(true)
      console.log('Assigning company access to team:', {
        teamId,
        companyId: selectedCompany,
        accessType: selectedAccessType
      })

      const success = await addTeamCompany(teamId, {
        company_id: selectedCompany,
        access_type: selectedAccessType
      })
      
      if (success) {
        const selectedCompanyData = companies.find(c => c.company_id === selectedCompany)
        onSuccess(`Nadano zespołowi dostęp do firmy ${selectedCompanyData?.company_name || selectedCompany}`)
        onOpenChange(false)
      } else {
        onError('Nie udało się nadać dostępu do firmy')
      }
    } catch (error) {
      console.error('Error assigning company access:', error)
      onError(error instanceof Error ? error.message : 'Nie udało się nadać dostępu do firmy')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAccessTypeLabel = (accessType: string) => {
    switch (accessType) {
      case 'view': return 'Odczyt'
      case 'edit': return 'Edycja'
      case 'manage': return 'Zarządzanie'
      case 'admin': return 'Pełne uprawnienia'
      default: return accessType
    }
  }

  const canSubmit = selectedCompany && !isSubmitting && !loading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-quicksand flex items-center gap-2">
            <Building2 className="h-6 w-6 text-green-600" />
            Nadaj dostęp do firmy
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informacje o zespole */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-quicksand">{teamName}</h3>
              <p className="text-gray-600 font-quicksand">Zespół</p>
            </div>
          </div>

          {(loading || isContextLoading) ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600 font-quicksand">
                {isContextLoading ? "Ładowanie kontekstu..." : "Ładowanie firm..."}
              </p>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak dostępnych firm</h3>
              <p className="text-gray-600">Wszystkie firmy są już przypisane do zespołu lub nie ma żadnych firm w systemie.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Wybór firmy */}
              <div className="space-y-2">
                <label className="text-sm font-medium font-quicksand">Firma</label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wybierz firmę" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.company_id} value={company.company_id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{company.company_name}</span>
                          {company.nip && (
                            <span className="text-sm text-gray-500">NIP: {company.nip}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              

              {/* Podsumowanie */}
              {selectedCompany && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 font-quicksand">Podsumowanie</h4>
                                             <p className="text-sm text-blue-700 font-quicksand">
                         Zespół <strong>{teamName}</strong> otrzyma dostęp do firmy{" "}
                         <strong>{companies.find(c => c.company_id === selectedCompany)?.company_name}</strong>
                       </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="font-quicksand"
          >
            Anuluj
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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