"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  CheckCircle,
  Edit,
  Trash2,
  Building2,
  User,
  Info,
  AlertTriangle,
  Loader2,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchCompanies, transformApiCompanyToPortalCompany, type Company } from "@/lib/companies-api"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useAppMenu } from "@/hooks/use-app-menu"
import { useUserContext } from "@/hooks/use-user-context"

export default function CompaniesPage() {
  const { menuItems, activeItem, currentApp } = useAppMenu()
  const { tenantId, isLoading: isContextLoading } = useUserContext()
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false)
  const [isManageAccessDialogOpen, setIsManageAccessDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<CompanyType | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  
  // State dla formularza dodawania firmy
  const [newCompany, setNewCompany] = useState({
    company_name: '',
    nip: '',
    company_code: '',
    description: '',
    tenant_id: tenantId || 'tenant125' // Tenant_id z kontekstu
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // State dla edycji firmy
  const [isEditCompanyDialogOpen, setIsEditCompanyDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<any>(null)
  const [editCompanyData, setEditCompanyData] = useState({
    company_name: '',
    nip: '',
    company_code: '',
    description: ''
  })

  // Ładowanie danych z API przy mount komponenta
  useEffect(() => {
    const loadCompanies = async () => {
      if (isContextLoading || !tenantId) return
      
      try {
        setLoading(true)
        setError(null)
        console.log(`🔄 Ładowanie firm dla tenant: ${tenantId}`)
        
        // Używamy dedykowanej funkcji API z tenant_id z kontekstu
        const companiesData = await fetchCompanies(tenantId)
        console.log('✅ Fetched data:', companiesData)
        
        // Transformujemy dane używając dedykowanej funkcji
        const transformedCompanies = companiesData.map((company, index) => 
          transformApiCompanyToPortalCompany(company, index)
        )
        
        console.log('✅ Transformed companies:', transformedCompanies)
        setCompanies(transformedCompanies)
      } catch (err) {
        console.error('❌ Error loading companies:', err)
        setError('Nie udało się załadować listy firm')
        // Fallback do statycznych danych w przypadku błędu
        setCompanies([
          {
            id: 1,
            name: "CD Projekt Red S.A.",
            code: "7342867148",
            nip: "734-286-71-48",
            tenant: "tenant_1",
            description: "Jagiellońska 74, 03-301 Warszawa",
            users: 1,
            status: true,
            created: "2024-01-01",
          },
        ])
      } finally {
        console.log('🏁 Loading finished')
        setLoading(false)
      }
    }

    loadCompanies()
  }, [tenantId, isContextLoading])

  // Przykładowe dane użytkowników (pozostają statyczne na razie)
  const users = [
    {
      id: 1,
      name: "Jan Kowalski",
      email: "jan.kowalski@nazwafirmy.pl",
      hasAccess: true,
    },
    {
      id: 2,
      name: "Adam Nowak",
      email: "adam.nowak@nazwafirmy.pl",
      hasAccess: false,
    },
    {
      id: 3,
      name: "Anna Wiśniewska",
      email: "anna.wisniewska@nazwafirmy.pl",
      hasAccess: true,
    },
    {
      id: 4,
      name: "Piotr Zieliński",
      email: "piotr.zielinski@nazwafirmy.pl",
      hasAccess: false,
    },
  ]

  const filteredCompanies = companies.filter(
    (company) =>
      company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.code?.includes(searchQuery) ||
      company.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.tenant?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddCompany = async () => {
    // Walidacja podstawowych pól
    if (!newCompany.company_name.trim()) {
      alert('Nazwa firmy jest wymagana')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('http://localhost:8110/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: newCompany.tenant_id,
          company_name: newCompany.company_name,
          company_code: newCompany.company_code || `COMP-${Date.now()}`, // Generuj kod jeśli nie podano
          nip: newCompany.nip || null,
          description: newCompany.description || null
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Firma dodana:', data)
        
        // Resetuj formularz
        setNewCompany({
          company_name: '',
          nip: '',
          company_code: '',
          description: '',
          tenant_id: tenantId || 'tenant125'
        })
        
        // Zamknij dialog i pokaż sukces
        setIsAddCompanyDialogOpen(false)
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 5000)
        
        // Odśwież listę firm
        window.location.reload() // Proste rozwiązanie na razie
      } else {
        const errorData = await response.json()
        console.error('❌ Błąd dodawania firmy:', errorData)
        alert(`Błąd: ${errorData.error || 'Nie udało się dodać firmy'}`)
      }
    } catch (err) {
      console.error('❌ Błąd sieci:', err)
      alert('Błąd połączenia. Spróbuj ponownie.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleManageAccess = (company: CompanyType) => {
    setSelectedCompany(company)
    setIsManageAccessDialogOpen(true)
  }

  const handleEditCompany = (company: any) => {
    console.log('🔍 Editing company:', company)
    setEditingCompany(company)
    setEditCompanyData({
      company_name: company.name || '',
      nip: company.nip || '',
      company_code: company.code || '',
      description: company.description || ''
    })
    setIsEditCompanyDialogOpen(true)
  }

  const saveEditCompany = async () => {
    // Walidacja podstawowych pól
    if (!editCompanyData.company_name.trim()) {
      alert('Nazwa firmy jest wymagana')
      return
    }
    
    if (!editingCompany) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`http://localhost:8110/api/companies/${editingCompany.company_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: editCompanyData.company_name,
          company_code: editCompanyData.company_code || null,
          nip: editCompanyData.nip || null,
          description: editCompanyData.description || null
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Firma zaktualizowana:', data)
        
        // Zamknij dialog i pokaż sukces
        setIsEditCompanyDialogOpen(false)
        setEditingCompany(null)
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 5000)
        
        // Odśwież listę firm
        window.location.reload() // Proste rozwiązanie na razie
      } else {
        const errorData = await response.json()
        console.error('❌ Błąd edycji firmy:', errorData)
        alert(`Błąd: ${errorData.error || 'Nie udało się zaktualizować firmy'}`)
      }
    } catch (err) {
      console.error('❌ Błąd sieci:', err)
      alert('Błąd połączenia. Spróbuj ponownie.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-gray-600 font-quicksand">Ładowanie firm...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <p className="text-red-600 font-quicksand">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-green-600 hover:bg-green-700"
          >
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader title={currentApp} />

      {/* Menu boczne i zawartość */}
      <div className="flex">
        <AppSidebar 
          menuItems={menuItems}
          activeItem={activeItem}
        />

        {/* Zawartość główna */}
        <main className="flex-1 p-8 bg-gray-50">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
            <Building2 className="h-6 w-6" />
            Firmy
          </h1>

          {showSuccessMessage && (
            <div className="flex items-start gap-4 p-4 mb-6 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-800 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-800 font-quicksand">Dodano firmę</p>
                <p className="text-sm text-green-800 font-quicksand">Techland Sp. z o.o.</p>
              </div>
              <button className="ml-auto text-green-800" onClick={() => setShowSuccessMessage(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                    fill="#26590E"
                  />
                </svg>
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div className="relative w-[280px]">
              <Input
                type="text"
                placeholder="Wyszukaj na liście"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 font-quicksand"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
            </div>
            <Button
              onClick={() => setIsAddCompanyDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
            >
              Dodaj firmę <Plus className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Tabela firm */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 p-4 text-left">
                    <Checkbox />
                  </th>
                  <th className="p-4 text-left font-bold text-sm font-quicksand">
                    <div className="flex items-center gap-2">
                      Nazwa
                      <ChevronDown className="h-5 w-5 text-green-600" />
                    </div>
                  </th>
                  <th className="p-4 text-left font-bold text-sm font-quicksand">
                    <div className="flex items-center gap-2">
                      NIP
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </th>
                  <th className="p-4 text-left font-bold text-sm font-quicksand">
                    <div className="flex items-center gap-2">
                      Adres
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </th>
                  <th className="p-4 text-left font-bold text-sm font-quicksand">Użytkownicy</th>
                  <th className="p-4 text-left font-bold text-sm font-quicksand">
                    <div className="flex items-center gap-2">
                      Firma DEMO MF
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </th>
                  <th className="p-4 text-right font-bold text-sm font-quicksand">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-t border-gray-100">
                    <td className="p-4">
                      <Checkbox />
                    </td>
                    <td className="p-4 font-quicksand">{company.name}</td>
                    <td className="p-4 font-quicksand">
                      <div className="flex items-center gap-2">
                        {company.nip && company.nip.startsWith("7") ? (
                          <Info className="h-4 w-4 text-blue-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        )}
                        {company.nip || 'Brak NIP'}
                      </div>
                    </td>
                    <td className="p-4 font-quicksand">{company.address}</td>
                    <td className="p-4 font-quicksand">{company.users}</td>
                    <td className="p-4 font-quicksand">{company.isDemo ? "Tak" : "Nie"}</td>
                    <td className="p-4 font-quicksand">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleManageAccess(company)}>
                          <User className="h-5 w-5 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditCompany(company)}>
                          <Edit className="h-5 w-5 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-5 w-5 text-green-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stopka */}
          <footer className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500 font-quicksand">
            <div className="flex justify-between items-center">
              <div>Wersja systemu: 3.0.0</div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-gray-700">
                  Regulamin
                </a>
                <a href="#" className="hover:text-gray-700">
                  Polityka prywatności i cookies
                </a>
                <a href="#" className="hover:text-gray-700">
                  Dokumentacja online
                </a>
                <a href="#" className="hover:text-gray-700">
                  Kontakt
                </a>
              </div>
            </div>
            <div className="mt-2">
              <p>
                Ta strona jest chroniona przez reCAPTCHA. Obowiązują{" "}
                <a href="#" className="text-green-600 hover:underline">
                  Polityka Prywatności
                </a>{" "}
                i{" "}
                <a href="#" className="text-green-600 hover:underline">
                  Warunki korzystania
                </a>{" "}
                z usługi Google.
              </p>
            </div>
          </footer>
        </main>
      </div>

      {/* Dialog dodawania firmy */}
      <Dialog open={isAddCompanyDialogOpen} onOpenChange={setIsAddCompanyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-quicksand">Dodaj firmę</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual" className="font-quicksand">
                  Wprowadź ręcznie
                </TabsTrigger>
                <TabsTrigger value="gus" className="font-quicksand">
                  Pobierz z GUS
                </TabsTrigger>
              </TabsList>
              <TabsContent value="manual" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium font-quicksand">Nazwa firmy *</label>
                  <Input 
                    placeholder="Wprowadź nazwę firmy" 
                    className="font-quicksand"
                    value={newCompany.company_name}
                    onChange={(e) => setNewCompany(prev => ({...prev, company_name: e.target.value}))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium font-quicksand">Kod firmy</label>
                  <Input 
                    placeholder="Automatycznie wygenerowany" 
                    className="font-quicksand"
                    value={newCompany.company_code}
                    onChange={(e) => setNewCompany(prev => ({...prev, company_code: e.target.value}))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium font-quicksand">NIP</label>
                  <Input 
                    placeholder="Wprowadź NIP" 
                    className="font-quicksand"
                    value={newCompany.nip}
                    onChange={(e) => setNewCompany(prev => ({...prev, nip: e.target.value}))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium font-quicksand">Opis</label>
                  <Input 
                    placeholder="Wprowadź opis firmy" 
                    className="font-quicksand"
                    value={newCompany.description}
                    onChange={(e) => setNewCompany(prev => ({...prev, description: e.target.value}))}
                    disabled={isSubmitting}
                  />
                </div>
              </TabsContent>
              <TabsContent value="gus" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium font-quicksand">NIP</label>
                  <div className="flex gap-2">
                    <Input placeholder="Wprowadź NIP" className="flex-1 font-quicksand" />
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">Pobierz</Button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 font-quicksand">
                    Wprowadź NIP firmy i kliknij "Pobierz", aby automatycznie uzupełnić dane firmy z rejestru GUS.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              className="border-green-600 text-green-600 font-quicksand"
              onClick={() => {
                setIsAddCompanyDialogOpen(false)
                // Resetuj formularz po anulowaniu
                setNewCompany({
                  company_name: '',
                  nip: '',
                  company_code: '',
                  description: '',
                  tenant_id: 'tenant-1125948988-1750065356019'
                })
              }}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white font-quicksand" 
              onClick={handleAddCompany}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Dodawanie...' : 'Dodaj'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog zarządzania dostępem */}
      <Dialog open={isManageAccessDialogOpen} onOpenChange={setIsManageAccessDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-quicksand">Zarządzanie dostępem do firmy</DialogTitle>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Building2 className="h-10 w-10 text-green-600" />
                <div>
                  <h3 className="font-bold text-lg font-quicksand">{selectedCompany.name}</h3>
                  <p className="text-gray-600 font-quicksand">NIP: {selectedCompany.nip}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg font-quicksand">Użytkownicy z dostępem do firmy</h3>
                  <div className="relative w-[280px]">
                    <Input placeholder="Wyszukaj użytkownika" className="pl-10 font-quicksand" />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left font-bold text-sm font-quicksand">Użytkownik</th>
                        <th className="p-4 text-left font-bold text-sm font-quicksand">Email</th>
                        <th className="p-4 text-center font-bold text-sm font-quicksand">Dostęp</th>
                        <th className="p-4 text-right font-bold text-sm font-quicksand">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t border-gray-100">
                          <td className="p-4 font-quicksand">{user.name}</td>
                          <td className="p-4 font-quicksand">{user.email}</td>
                          <td className="p-4 text-center font-quicksand">
                            <Checkbox checked={user.hasAccess} />
                          </td>
                          <td className="p-4 font-quicksand">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-5 w-5 text-green-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
                    Dodaj użytkownika <Plus className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
              onClick={() => setIsManageAccessDialogOpen(false)}
            >
              Zamknij
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog edycji firmy */}
      <Dialog open={isEditCompanyDialogOpen} onOpenChange={setIsEditCompanyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-quicksand">Edytuj firmę</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium font-quicksand">Nazwa firmy *</label>
                <Input 
                  placeholder="Wprowadź nazwę firmy" 
                  className="font-quicksand"
                  value={editCompanyData.company_name}
                  onChange={(e) => setEditCompanyData(prev => ({...prev, company_name: e.target.value}))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium font-quicksand">Kod firmy</label>
                <Input 
                  placeholder="Kod firmy" 
                  className="font-quicksand"
                  value={editCompanyData.company_code}
                  onChange={(e) => setEditCompanyData(prev => ({...prev, company_code: e.target.value}))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium font-quicksand">NIP</label>
                <Input 
                  placeholder="Wprowadź NIP" 
                  className="font-quicksand"
                  value={editCompanyData.nip}
                  onChange={(e) => setEditCompanyData(prev => ({...prev, nip: e.target.value}))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium font-quicksand">Opis</label>
                <Input 
                  placeholder="Wprowadź opis firmy" 
                  className="font-quicksand"
                  value={editCompanyData.description}
                  onChange={(e) => setEditCompanyData(prev => ({...prev, description: e.target.value}))}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              className="border-green-600 text-green-600 font-quicksand"
              onClick={() => {
                setIsEditCompanyDialogOpen(false)
                setEditingCompany(null)
              }}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white font-quicksand" 
              onClick={saveEditCompany}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Typy
type CompanyType = {
  id: number
  name: string
  nip: string
  address: string
  users: number
  isDemo: boolean
  activeServices: string[]
}
