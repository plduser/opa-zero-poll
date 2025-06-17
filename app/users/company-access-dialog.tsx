"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Info, CheckCircle } from "lucide-react"
import { assignCompanyToUser, fetchCompaniesForUsers, type Company } from "@/lib/users-api"

interface CompanyAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    user_id?: string
    name: string
    email: string
  }
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function CompanyAccessDialog({ 
  open, 
  onOpenChange, 
  user, 
  onSuccess, 
  onError 
}: CompanyAccessDialogProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Załaduj aplikacje i profile przy otwarciu dialogu
  useEffect(() => {
    if (open) {
      loadCompanies()
      // Reset state when dialog opens
      setSelectedCompany("")
    }
  }, [open])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      console.log('Loading companies...')
      
      const companiesData = await fetchCompaniesForUsers()
      console.log('Companies loaded:', companiesData)
      
      setCompanies(companiesData)
    } catch (error) {
      console.error('Error loading companies:', error)
      onError('Nie udało się załadować listy firm')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!user.user_id || !selectedCompany) {
      onError('Wszystkie pola są wymagane')
      return
    }

    try {
      setIsSubmitting(true)
      console.log('Assigning company access:', {
        userId: user.user_id,
        companyId: selectedCompany
      })

      const success = await assignCompanyToUser(user.user_id, selectedCompany)
      
      if (success) {
        const selectedCompanyData = companies.find(c => c.company_id === selectedCompany)
        onSuccess(`Przypisano dostęp do firmy ${selectedCompanyData?.company_name || selectedCompany}`)
        onOpenChange(false)
      } else {
        onError('Nie udało się przypisać dostępu do firmy')
      }
    } catch (error) {
      console.error('Error assigning company access:', error)
      onError(error instanceof Error ? error.message : 'Nie udało się przypisać dostępu do firmy')
    } finally {
      setIsSubmitting(false)
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
          {/* Informacje o użytkowniku */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-lg font-bold text-green-800">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-lg font-quicksand">{user.name}</h3>
              <p className="text-gray-600 font-quicksand">{user.email}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600 font-quicksand">Ładowanie firm...</p>
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

              {selectedCompany && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 font-quicksand">Informacja</h4>
                      <p className="text-sm text-blue-700 font-quicksand">
                        Użytkownik otrzyma dostęp do wybranej firmy. 
                        Dostęp będzie obowiązywał do momentu jego odebrania.
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
                Przypisywanie...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Przypisz dostęp
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 