"use client"

import { useState } from "react"
import { Search, CheckCircle, X, Plus, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AccessDialog } from "@/app/users/access-dialog"
import { DocumentAccessDialog } from "../document-access-dialog"

export function InvoicesTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [isAccessGrantDialogOpen, setIsAccessGrantDialogOpen] = useState(false)
  const [accessDialogTitle, setAccessDialogTitle] = useState("")
  const [accessDialogItems, setAccessDialogItems] = useState<any[]>([])

  const [isDocumentAccessDialogOpen, setIsDocumentAccessDialogOpen] = useState(false)

  // Przykładowe dane faktur
  const invoices = [
    {
      id: 1,
      number: "FV/2023/05/001",
      issuer: "CD Projekt Red S.A.",
      recipient: "Platige Image S.A.",
      date: "2023-05-10",
      amount: "12 500,00 PLN",
      status: "Wysłana",
    },
    {
      id: 2,
      number: "FV/2023/05/002",
      issuer: "Platige Image S.A.",
      recipient: "CD Projekt Red S.A.",
      date: "2023-05-12",
      amount: "8 750,00 PLN",
      status: "Odebrana",
    },
    {
      id: 3,
      number: "FV/2023/04/015",
      issuer: "Techland Sp. z o.o.",
      recipient: "CD Projekt Red S.A.",
      date: "2023-04-28",
      amount: "15 200,00 PLN",
      status: "Zatwierdzona",
    },
    {
      id: 4,
      number: "FV/2023/05/003",
      issuer: "CD Projekt Red S.A.",
      recipient: "11 bit studios S.A.",
      date: "2023-05-15",
      amount: "9 300,00 PLN",
      status: "Robocza",
    },
    {
      id: 5,
      number: "FV/2023/05/004",
      issuer: "Bloober Team S.A.",
      recipient: "CD Projekt Red S.A.",
      date: "2023-05-08",
      amount: "6 800,00 PLN",
      status: "Odrzucona",
    },
  ]

  // Przykładowe dane użytkowników
  const users = [
    {
      id: 1,
      name: "Jan Kowalski",
      email: "jan.kowalski@nazwafirmy.pl",
      role: "Administrator",
    },
    {
      id: 2,
      name: "Anna Wiśniewska",
      email: "anna.wisniewska@nazwafirmy.pl",
      role: "Wystawiający",
    },
    {
      id: 3,
      name: "Piotr Zieliński",
      email: "piotr.zielinski@nazwafirmy.pl",
      role: "Zatwierdzający",
    },
    {
      id: 4,
      name: "Adam Nowak",
      email: "adam.nowak@nazwafirmy.pl",
      role: "Pełny dostęp",
    },
    {
      id: 5,
      name: "Marta Lis",
      email: "marta.lis@nazwafirmy.pl",
      role: "Przeglądający",
    },
  ]

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.recipient.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleManageAccess = (resource: any) => {
    setSelectedResource({ ...resource, type: "invoice" })
    setIsDocumentAccessDialogOpen(true)
  }

  const handleGrantAccess = () => {
    setAccessDialogTitle("Nadaj dostęp do faktur")
    setAccessDialogItems(users)
    setIsAccessGrantDialogOpen(true)
  }

  return (
    <div>
      {showSuccessMessage && (
        <div className="flex items-start gap-4 p-4 mb-6 bg-purple-50 border border-purple-200 rounded-lg">
          <CheckCircle className="h-6 w-6 text-purple-800 flex-shrink-0" />
          <div>
            <p className="font-bold text-purple-800">Zaktualizowano uprawnienia</p>
            <p className="text-sm text-purple-800">Zmiany zostały zapisane pomyślnie</p>
          </div>
          <button className="ml-auto text-purple-800" onClick={() => setShowSuccessMessage(false)}>
            <X className="h-5 w-5" />
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
            className="pl-10 border-gray-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
        </div>
        <Button onClick={handleGrantAccess} className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
          Nadaj dostęp <Plus className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numer faktury</TableHead>
              <TableHead>Wystawca</TableHead>
              <TableHead>Odbiorca</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Kwota</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.number}</TableCell>
                <TableCell>{invoice.issuer}</TableCell>
                <TableCell>{invoice.recipient}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`
                      ${
                        invoice.status === "Wysłana"
                          ? "bg-blue-50 text-blue-800 border-blue-100"
                          : invoice.status === "Odebrana"
                            ? "bg-green-50 text-green-800 border-green-100"
                            : invoice.status === "Zatwierdzona"
                              ? "bg-purple-50 text-purple-800 border-purple-100"
                              : invoice.status === "Robocza"
                                ? "bg-amber-50 text-amber-800 border-amber-100"
                                : "bg-red-50 text-red-800 border-red-100"
                      } text-xs py-1 font-quicksand`}
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleManageAccess(invoice)}
                    className="text-green-600"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog zarządzania uprawnieniami */}
      <AccessDialog
        open={isAccessGrantDialogOpen}
        onOpenChange={setIsAccessGrantDialogOpen}
        title={accessDialogTitle}
        items={accessDialogItems}
        onSave={() => {
          setShowSuccessMessage(true)
          setTimeout(() => setShowSuccessMessage(false), 5000)
        }}
      />

      {/* Dialog dostępu do dokumentu */}
      <DocumentAccessDialog
        open={isDocumentAccessDialogOpen}
        onOpenChange={setIsDocumentAccessDialogOpen}
        document={selectedResource}
        onSave={() => {
          setShowSuccessMessage(true)
          setTimeout(() => setShowSuccessMessage(false), 5000)
        }}
      />
    </div>
  )
}
