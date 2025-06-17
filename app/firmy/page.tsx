"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  CheckCircle,
  Edit,
  Trash2,
  Home,
  AppWindowIcon as Apps,
  HelpCircle,
  UserIcon,
  Settings,
  ChevronDown,
  Menu,
  Building2,
  User,
  Info,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchCompanies, transformApiCompanyToPortalCompany, type Company } from "@/lib/api"

export default function CompaniesPage() {
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
    tenant_id: 'tenant-1125948988-1750065356019' // Domyślny tenant_id
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
      try {
        setLoading(true)
        setError(null)
        console.log('🔄 Starting to fetch companies...')
        
        // Tymczasowy test z prostym fetch
        const response = await fetch('http://localhost:8110/api/companies')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('✅ Fetched data:', data)
        
        // Używamy prostej transformacji na razie
        const companies = data.companies || []
        const simpleCompanies = companies.slice(0, 5).map((company: any, index: number) => ({
          id: index + 1,
          company_id: company.company_id,
          name: company.company_name,
          code: company.company_code, 
          nip: company.nip || 'Brak NIP',
          address: 'Brak danych adresowych',
          tenant: company.tenant_id,
          description: company.description,
          users: company.users_count || 0,
          isDemo: false,
          status: company.status === 'active',
          created: company.created_at,
          activeServices: []
        }))
        
        console.log('✅ Transformed companies:', simpleCompanies)
        setCompanies(simpleCompanies)
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
  }, [])

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
          tenant_id: 'tenant-1125948988-1750065356019'
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
      {/* Nagłówek */}
      <header className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <button className="p-1">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <img src="/symfonia-logo.png" alt="Symfonia" className="h-10 relative top-[5px]" />
            <span className="text-lg font-medium font-quicksand ml-4">Portal Użytkownika</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <select className="flex items-center gap-2 px-4 py-2 border rounded-md font-quicksand appearance-none cursor-pointer pr-10">
              <option>ECM3 Jacek Paszek</option>
              <option>CD Projekt Red S.A.</option>
              <option>Platige Image S.A.</option>
              <option>Techland Sp. z o.o.</option>
              <option>11 bit studios S.A.</option>
              <option>Bloober Team S.A.</option>
            </select>
            <ChevronDown className="h-5 w-5 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <button className="p-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                fill="#000000"
              />
              <path
                d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
                fill="#000000"
              />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-800">
            JP
          </div>
        </div>
      </header>

      {/* Menu boczne i zawartość */}
      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-64px)] border-r border-gray-200 bg-white">
          <nav className="py-4">
            <ul className="space-y-1">
              <li>
                <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <Home className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium text-gray-800 font-quicksand">Strona główna</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <Apps className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium text-gray-800 font-quicksand">Aplikacje i usługi</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <HelpCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium text-gray-800 font-quicksand">Centrum wsparcia</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium text-gray-800 font-quicksand">Panel klienta</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center justify-between px-6 py-3 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-green-600" />
                    <span className="text-base font-medium text-green-600 font-quicksand">Ustawienia</span>
                  </div>
                  <ChevronDown className="h-5 w-5 text-green-600" />
                </a>
                <ul className="pl-6 border-l-2 border-green-600 ml-6">
                  <li>
                    <a href="#" className="flex items-center gap-3 px-6 py-2 bg-gray-50">
                      <span className="text-base font-medium text-green-600 font-quicksand">Firmy</span>
                    </a>
                  </li>
                  <li>
                    <a href="/" className="flex items-center gap-3 px-6 py-2 hover:bg-gray-50">
                      <span className="text-base font-medium font-quicksand text-gray-800">Użytkownicy</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-3 px-6 py-2 hover:bg-gray-50">
                      <span className="text-base font-medium text-gray-800 font-quicksand">Klucze API</span>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Zawartość główna */}
        <main className="flex-1 p-8">
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
