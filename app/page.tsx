"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type UserType = {
  id: number
  name: string
  email: string
  phone: string
  companies: number
  permissions: string
  profiles: Array<{ app: string; name: string }>
  status: boolean
}

export default function UsersPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/aplikacje")
  }, [router])

  const [searchQuery, setSearchQuery] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [isAddAppAccessDialogOpen, setIsAddAppAccessDialogOpen] = useState(false)
  const [isAddCompanyAccessDialogOpen, setIsAddCompanyAccessDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<string>("")
  const [selectedProfile, setSelectedProfile] = useState<string>("")

  // Przykładowe dane użytkowników
  const users = [
    {
      id: 1,
      name: "Jan Kowalski",
      email: "jan.kowalski@nazwafirmy.pl",
      phone: "+48 500 500 500",
      companies: 2,
      permissions: "Administrator",
      profiles: [
        { app: "eBiuro", name: "Administrator" },
        { app: "KSEF", name: "Pełny dostęp" },
        { app: "eDeklaracje", name: "Edytor" },
      ],
      status: true,
    },
    {
      id: 2,
      name: "Adam Nowak",
      email: "adam.nowak@nazwafirmy.pl",
      phone: "-",
      companies: 0,
      permissions: "Użytkownik",
      profiles: [{ app: "eBiuro", name: "Użytkownik" }],
      status: false,
    },
    {
      id: 3,
      name: "Anna Wiśniewska",
      email: "anna.wisniewska@nazwafirmy.pl",
      phone: "+48 600 600 600",
      companies: 3,
      permissions: "Użytkownik",
      profiles: [
        { app: "eBiuro", name: "Użytkownik" },
        { app: "KSEF", name: "Przeglądający" },
        { app: "eDokumenty", name: "Edytor" },
      ],
      status: true,
    },
    {
      id: 4,
      name: "Piotr Zieliński",
      email: "piotr.zielinski@nazwafirmy.pl",
      phone: "+48 700 700 700",
      companies: 1,
      permissions: "Administrator",
      profiles: [
        { app: "eBiuro", name: "Administrator" },
        { app: "KSEF", name: "Pełny dostęp" },
        { app: "eDeklaracje", name: "Administrator" },
      ],
      status: true,
    },
  ]

  // Przykładowe dane aplikacji i profili
  const applications = [
    {
      id: "ebiuro",
      name: "eBiuro",
      profiles: ["Administrator", "Kierownik", "Pracownik", "Przeglądający"],
    },
    {
      id: "ksef",
      name: "KSEF",
      profiles: ["Administrator", "Pełny dostęp", "Wystawiający", "Zatwierdzający", "Przeglądający"],
    },
    {
      id: "edokumenty",
      name: "eDokumenty",
      profiles: [
        "Administrator",
        "Zarząd",
        "Księgowa",
        "Główna Księgowa",
        "Sekretariat",
        "Użytkownik",
        "Przeglądający",
      ],
    },
    {
      id: "edeklaracje",
      name: "eDeklaracje",
      profiles: ["Administrator", "Księgowa", "Główna Księgowa", "Kadrowy", "Przeglądający"],
    },
    {
      id: "eplace",
      name: "ePłace",
      profiles: ["Administrator", "Kadrowy", "Księgowy", "Główny Księgowy", "Przeglądający"],
    },
    {
      id: "fk",
      name: "Finanse i Księgowość",
      profiles: ["Administrator", "Księgowy", "Główny Księgowy", "Właściciel", "Przeglądający"],
    },
    {
      id: "handel",
      name: "Handel",
      profiles: ["Administrator", "Kierownik", "Sprzedawca", "Magazynier", "Przeglądający"],
    },
    {
      id: "hr",
      name: "HR",
      profiles: ["Administrator", "Kierownik HR", "Specjalista HR", "Rekruter", "Przeglądający"],
    },
  ]

  // Przykładowe dane firm
  const companies = [
    {
      id: 1,
      name: "CD Projekt Red S.A.",
      nip: "7342867148",
    },
    {
      id: 2,
      name: "Platige Image S.A.",
      nip: "5242014184",
    },
    {
      id: 3,
      name: "Techland Sp. z o.o.",
      nip: "9542214164",
    },
    {
      id: 4,
      name: "11 bit studios S.A.",
      nip: "1182017282",
    },
    {
      id: 5,
      name: "Bloober Team S.A.",
      nip: "6762385512",
    },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddUser = () => {
    setIsAddUserDialogOpen(false)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 5000)
  }

  const handleManagePermissions = (user: UserType) => {
    setSelectedUser(user)
    setIsPermissionsDialogOpen(true)
  }

  const handleAddAppAccess = () => {
    setIsAddAppAccessDialogOpen(true)
  }

  const handleAddCompanyAccess = () => {
    setIsAddCompanyAccessDialogOpen(true)
  }

  const handleApplicationChange = (value: string) => {
    setSelectedApplication(value)
    setSelectedProfile("")
  }

  return null
}
