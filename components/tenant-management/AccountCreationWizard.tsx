'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  User,
  FileText
} from 'lucide-react'

interface UserProfile {
  firstName: string
  lastName: string
  phone: string
  email: string
}

interface AccountData {
  nip: string
  companyName: string
  isAccountingOffice: boolean
}

interface AccountCreationData {
  userProfile: UserProfile
  accountData: AccountData
}

interface AuthenticatedUser {
  email: string
  name: string
  firstName?: string
  lastName?: string
}

interface AccountCreationWizardProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: AccountCreationData) => void
  authenticatedUser?: AuthenticatedUser // Dane z Azure B2C/Auth0
}

const PROVISIONING_API_URL = 'http://localhost:8010'

export function AccountCreationWizard({ isOpen, onClose, onSuccess, authenticatedUser }: AccountCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: authenticatedUser?.firstName || '',
    lastName: authenticatedUser?.lastName || '',
    phone: '',
    email: authenticatedUser?.email || ''
  })
  
  const [accountData, setAccountData] = useState<AccountData>({
    nip: '',
    companyName: '',
    isAccountingOffice: false
  })

  const totalSteps = 3

  // Walidacja NIP (podstawowa)
  const validateNIP = (nip: string): boolean => {
    const cleanNip = nip.replace(/\D/g, '')
    return cleanNip.length === 10
  }

  // Walidacja kroku 1
  const validateStep1 = (): boolean => {
    return userProfile.firstName.trim() !== '' && 
           userProfile.lastName.trim() !== '' && 
           userProfile.email.trim() !== '' &&
           userProfile.email.includes('@')
  }

  // Walidacja kroku 2
  const validateStep2 = (): boolean => {
    return validateNIP(accountData.nip) && accountData.companyName.trim() !== ''
  }

  // Generowanie tenant ID na podstawie NIP
  const generateTenantId = (nip: string): string => {
    const cleanNip = nip.replace(/\D/g, '')
    return `tenant-${cleanNip}-${Date.now()}`
  }

  // Sprawdzenie czy użytkownik ma aktywną sesję Auth0/Symfonia I
  const hasAuth0Session = (): boolean => {
    // W przyszłości to będzie sprawdzać prawdziwą sesję Auth0
    // Na razie sprawdzamy czy authenticatedUser jest przekazany z zewnątrz
    return !!authenticatedUser?.email
  }

  // Generowanie emaila dla użytkownika
  const getAdminEmail = (): string => {
    return userProfile.email || `${userProfile.firstName.toLowerCase()}.${userProfile.lastName.toLowerCase()}.${Date.now()}@example.com`
  }

  // Przejście do następnego kroku
  const nextStep = () => {
    setError(null)
    
    if (currentStep === 1 && !validateStep1()) {
      setError('Proszę wypełnić wymagane pola: Imię, Nazwisko i Email')
      return
    }
    
    if (currentStep === 2 && !validateStep2()) {
      setError('Proszę wypełnić poprawnie NIP (10 cyfr) i nazwę firmy')
      return
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Powrót do poprzedniego kroku
  const prevStep = () => {
    setError(null)
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Finalizacja tworzenia konta
  const createAccount = async () => {
    setLoading(true)
    setError(null)

    try {
      const tenantId = generateTenantId(accountData.nip)
      
      const payload = {
        tenant_id: tenantId,
        tenant_name: accountData.companyName,
        admin_email: getAdminEmail(),
        admin_name: authenticatedUser?.name || `${userProfile.firstName} ${userProfile.lastName}`,
        metadata: {
          userProfile: {
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            phone: userProfile.phone
          },
          accountData: {
            nip: accountData.nip,
            companyName: accountData.companyName,
            isAccountingOffice: accountData.isAccountingOffice
          },
          createdBy: 'account-creation-wizard',
          createdAt: new Date().toISOString()
        }
      }

      const response = await fetch(`${PROVISIONING_API_URL}/provision-tenant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch {
          // Jeśli nie można sparsować JSON, użyj status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // Wywołaj callback sukcesu
      onSuccess({
        userProfile,
        accountData
      })

      // Reset formularza
      resetForm()
      onClose()

    } catch (err) {
      console.error('Error creating account:', err)
      setError(err instanceof Error ? err.message : 'Błąd podczas tworzenia konta')
    } finally {
      setLoading(false)
    }
  }

  // Reset formularza
  const resetForm = () => {
    setCurrentStep(1)
    setUserProfile({ firstName: '', lastName: '', phone: '', email: '' })
    setAccountData({ nip: '', companyName: '', isAccountingOffice: false })
    setError(null)
  }

  // Obsługa zamknięcia
  const handleClose = () => {
    resetForm()
    onClose()
  }

  // Formatowanie NIP podczas wpisywania
  const handleNipChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    if (cleanValue.length <= 10) {
      setAccountData(prev => ({ ...prev, nip: cleanValue }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Witaj w Portalu Użytkownika!
          </DialogTitle>
          <DialogDescription className="text-center">
            Cieszymy się, że dołączyłeś do Portalu Użytkownika! Ponieważ logujesz się po raz pierwszy, 
            prosimy o uzupełnienie poniższych danych, aby rozpocząć korzystanie z naszych produktów.
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep >= step 
                      ? 'bg-green-600 text-white' 
                      : currentStep === step 
                        ? 'bg-green-100 text-green-600 border-2 border-green-600'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {currentStep > step ? <CheckCircle className="h-5 w-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-green-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center space-x-8 text-sm">
            <span className={currentStep >= 1 ? 'text-green-600 font-medium' : 'text-gray-500'}>
              Profil użytkownika
            </span>
            <span className={currentStep >= 2 ? 'text-green-600 font-medium' : 'text-gray-500'}>
              Konto
            </span>
            <span className={currentStep >= 3 ? 'text-green-600 font-medium' : 'text-gray-500'}>
              Podsumowanie
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Profil użytkownika */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Imię *</Label>
                <Input
                  id="firstName"
                  value={userProfile.firstName}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Podaj imię"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nazwisko *</Label>
                <Input
                  id="lastName"
                  value={userProfile.lastName}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Podaj nazwisko"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email">Email *</Label>
                  {!hasAuth0Session() && (
                    <button 
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => window.open('https://symfonia.pl', '_blank')}
                    >
                      Załóż Symfonia I
                    </button>
                  )}
                </div>
                <Input
                  id="email"
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Podaj adres email"
                />
                {hasAuth0Session() ? (
                  <p className="text-xs text-green-600">✓ Email pochodzący z uwierzytelnienia Symfonia I</p>
                ) : (
                  <p className="text-xs text-gray-500">Wpisz email lub skorzystaj z "Załóż Symfonia I" aby automatycznie uzupełnić dane</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={userProfile.phone}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Podaj numer telefonu"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={nextStep} className="bg-green-600 hover:bg-green-700">
                Dalej
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Konto */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAccountingOffice"
                  checked={accountData.isAccountingOffice}
                  onCheckedChange={(checked) => 
                    setAccountData(prev => ({ ...prev, isAccountingOffice: checked as boolean }))
                  }
                />
                <Label htmlFor="isAccountingOffice" className="text-sm">
                  Prowadzę biuro rachunkowe
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nip">NIP *</Label>
                <Input
                  id="nip"
                  value={accountData.nip}
                  onChange={(e) => handleNipChange(e.target.value)}
                  placeholder="Podaj NIP"
                  maxLength={10}
                />
                <p className="text-xs text-gray-500">Format: 10 cyfr bez kresek</p>
              </div>

              <Button variant="outline" className="w-full" disabled>
                Pobierz dane z GUS
              </Button>

              <div className="space-y-2">
                <Label htmlFor="companyName">Konto / Główna firma *</Label>
                <Input
                  id="companyName"
                  value={accountData.companyName}
                  onChange={(e) => setAccountData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Podaj nazwę konta"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Wstecz
              </Button>
              <Button onClick={nextStep} className="bg-green-600 hover:bg-green-700">
                Dalej
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Podsumowanie */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-6">
              {/* Profil użytkownika */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profil użytkownika</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Imię:</span>
                    <span className="font-medium">{userProfile.firstName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nazwisko:</span>
                    <span className="font-medium">{userProfile.lastName}</span>
                  </div>
                  {userProfile.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefon:</span>
                      <span className="font-medium">{userProfile.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email rejestracji:</span>
                    <span className="font-medium text-blue-600">
                      {userProfile.email}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Konto */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Konto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prowadzę biuro rachunkowe:</span>
                    <span className="font-medium">{accountData.isAccountingOffice ? 'Tak' : 'Nie'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">NIP:</span>
                    <span className="font-medium">{accountData.nip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Konto / Główna firma:</span>
                    <span className="font-medium">{accountData.companyName}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={prevStep} disabled={loading}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Wstecz
              </Button>
              <Button 
                onClick={createAccount} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Zapisywanie...' : 'Zapisz'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 