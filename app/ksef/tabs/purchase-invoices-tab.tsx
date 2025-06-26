"use client"

import { useState, useEffect } from "react"
import { Search, CheckCircle, X, Plus, Lock, ShoppingCart, ChevronDown, Eye, Edit, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { canViewPurchaseInvoices } from "@/lib/opa-api"

interface PurchaseInvoicesTabProps {
  userId: string
  tenantId: string
  companyId?: string
}

// Mockowe dane faktur zakupu - styl Symfonia
const mockPurchaseInvoices = [
  {
    id: "FK/2024/12/078",
    supplier: "Microsoft Ireland Operations Limited",
    supplierNip: "IE6388047V",
    amount: 15840.00,
    currency: "PLN",
    receiveDate: "2024-12-16",
    dueDate: "2024-12-30",
    status: "potwierdzona",
    ksefStatus: "przyjeta",
    description: "Licencje Microsoft 365 Business - roczna subskrypcja"
  },
  {
    id: "FK/2024/12/079",
    supplier: "Dell Technologies Sp. z o.o.",
    supplierNip: "5213180845",
    amount: 28900.00,
    currency: "PLN",
    receiveDate: "2024-12-17",
    dueDate: "2024-12-31",
    status: "opłacona", 
    ksefStatus: "przyjeta",
    description: "Serwery Dell PowerEdge - modernizacja infrastruktury"
  },
  {
    id: "FK/2024/12/080",
    supplier: "Orange Polska S.A.",
    supplierNip: "5260002282",
    amount: 3420.00,
    currency: "PLN",
    receiveDate: "2024-12-18",
    dueDate: "2025-01-01",
    status: "opłacona",
    ksefStatus: "przyjeta", 
    description: "Usługi telekomunikacyjne - grudzień 2024"
  },
  {
    id: "FK/2024/12/081",
    supplier: "Adobe Systems Software Ireland Limited",
    supplierNip: "IE4751556G",
    amount: 8760.00,
    currency: "PLN",
    receiveDate: "2024-12-19",
    dueDate: "2025-01-02",
    status: "do sprawdzenia",
    ksefStatus: "oczekuje",
    description: "Adobe Creative Cloud - licencje zespołowe"
  },
  {
    id: "FK/2024/12/082",
    supplier: "Biuro Rachunkowe EXPERT Sp. z o.o.",
    supplierNip: "6762289411",
    amount: 1200.00,
    currency: "PLN",
    receiveDate: "2024-12-20",
    dueDate: "2025-01-03",
    status: "potwierdzona",
    ksefStatus: "nie wysłana",
    description: "Usługi księgowe - obsługa kadrowo-płacowa"
  },
  {
    id: "FK/2024/12/083",
    supplier: "Energa Operator S.A.",
    supplierNip: "6490018253",
    amount: 4567.89,
    currency: "PLN",
    receiveDate: "2024-12-21",
    dueDate: "2025-01-04",
    status: "opłacona",
    ksefStatus: "przyjeta",
    description: "Energia elektryczna - grudzień 2024"
  }
]

export function PurchaseInvoicesTab({ userId, tenantId, companyId }: PurchaseInvoicesTabProps) {
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const itemsPerPage = 8

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true)
      try {
        console.log(`[PurchaseInvoicesTab] Sprawdzam dostęp dla userId=${userId}, tenantId=${tenantId}, companyId=${companyId}`)
        const access = await canViewPurchaseInvoices(userId, tenantId, companyId)
        console.log(`[PurchaseInvoicesTab] Wynik autoryzacji:`, access)
        setHasAccess(access)
      } catch (error) {
        console.error("[PurchaseInvoicesTab] Błąd sprawdzania dostępu:", error)
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId && tenantId) {
      checkAccess()
    }
  }, [userId, tenantId, companyId])

  // Filtrowanie i paginacja
  const filteredInvoices = mockPurchaseInvoices.filter(invoice =>
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(currentInvoices.map(invoice => invoice.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id])
    } else {
      setSelectedItems(selectedItems.filter(item => item !== id))
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "opłacona": return "bg-green-100 text-green-800"
      case "potwierdzona": return "bg-blue-100 text-blue-800"
      case "do sprawdzenia": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getKsefBadgeColor = (ksefStatus: string) => {
    switch (ksefStatus) {
      case "przyjeta": return "bg-green-100 text-green-800"
      case "oczekuje": return "bg-yellow-100 text-yellow-800"
      case "nie wysłana": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Sprawdzam uprawnienia...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Lock className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak dostępu</h3>
        <p className="text-gray-600 mb-4">
          Nie masz uprawnień do przeglądania faktur zakupu w wybranej firmie.
        </p>
        <p className="text-sm text-gray-500">
          Skontaktuj się z administratorem w celu uzyskania dostępu.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Header z wyszukiwaniem i przyciskiem dodawania - styl Symfonia */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Wyszukaj na liście"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj fakturę
        </Button>
      </div>

      {/* Tabela w stylu Symfonia */}
      <div className="w-full bg-white rounded-lg border">
        {/* Header tabeli - szary styl Symfonia */}
        <div className="bg-gray-50 border-b grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-600">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={selectedItems.length === currentInvoices.length && currentInvoices.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300"
            />
          </div>
          <div className="col-span-2 flex items-center cursor-pointer hover:text-gray-900">
            Numer <ChevronDown className="h-4 w-4 ml-1" />
          </div>
          <div className="col-span-2 flex items-center cursor-pointer hover:text-gray-900">
            Dostawca <ChevronDown className="h-4 w-4 ml-1" />
          </div>
          <div className="col-span-1 flex items-center cursor-pointer hover:text-gray-900">
            NIP <ChevronDown className="h-4 w-4 ml-1" />
          </div>
          <div className="col-span-1 flex items-center cursor-pointer hover:text-gray-900">
            Kwota <ChevronDown className="h-4 w-4 ml-1" />
          </div>
          <div className="col-span-1 flex items-center cursor-pointer hover:text-gray-900">
            Data <ChevronDown className="h-4 w-4 ml-1" />
          </div>
          <div className="col-span-1 flex items-center cursor-pointer hover:text-gray-900">
            Status <ChevronDown className="h-4 w-4 ml-1" />
          </div>
          <div className="col-span-1 flex items-center cursor-pointer hover:text-gray-900">
            KSeF <ChevronDown className="h-4 w-4 ml-1" />
          </div>
          <div className="col-span-2 flex items-center">
            Akcje
          </div>
        </div>

        {/* Wiersze tabeli */}
        <div className="divide-y divide-gray-200">
          {currentInvoices.map((invoice) => (
            <div key={invoice.id} className="grid grid-cols-12 gap-4 px-4 py-4 text-sm hover:bg-gray-50">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(invoice.id)}
                  onChange={(e) => handleSelectItem(invoice.id, e.target.checked)}
                  className="rounded border-gray-300"
                />
              </div>
              <div className="col-span-2 flex items-center font-medium text-gray-900">
                {invoice.id}
              </div>
              <div className="col-span-2 flex items-center text-gray-600">
                {invoice.supplier}
              </div>
              <div className="col-span-1 flex items-center text-gray-600 font-mono text-xs">
                {invoice.supplierNip}
              </div>
              <div className="col-span-1 flex items-center font-medium">
                {invoice.amount.toLocaleString('pl-PL', { 
                  style: 'currency', 
                  currency: invoice.currency 
                })}
              </div>
              <div className="col-span-1 flex items-center text-gray-600">
                {invoice.receiveDate}
              </div>
              <div className="col-span-1 flex items-center">
                <Badge className={`text-xs ${getStatusBadgeColor(invoice.status)}`}>
                  {invoice.status}
                </Badge>
              </div>
              <div className="col-span-1 flex items-center">
                <Badge className={`text-xs ${getKsefBadgeColor(invoice.ksefStatus)}`}>
                  {invoice.ksefStatus}
                </Badge>
              </div>
              <div className="col-span-2 flex items-center space-x-1">
                <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-green-300 text-green-600 hover:bg-green-50">
                  <Eye className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-green-300 text-green-600 hover:bg-green-50">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-green-300 text-green-600 hover:bg-green-50">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Paginacja w stylu Symfonia */}
        <div className="flex items-center justify-between border-t bg-white px-4 py-3">
          <div className="flex items-center space-x-2">
            <select className="rounded border-gray-300 text-sm">
              <option value="8">8</option>
              <option value="16">16</option>
              <option value="32">32</option>
            </select>
            <span className="text-sm text-gray-700">Wyników na stronę</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              {filteredInvoices.length} faktur
            </span>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                ‹
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 p-0 ${
                    currentPage === page 
                      ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                ›
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
