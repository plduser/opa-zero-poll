import { 
  Home, 
  AppWindowIcon, 
  HelpCircle, 
  UserIcon, 
  Settings,
  Building2,
  Users,
  Shield,
  FileText,
  BarChart3,
  DollarSign,
  Database,
  Send,
  CreditCard,
  Package,
  TrendingUp,
  Key
} from "lucide-react"
import { MenuItem } from "@/components/app-sidebar"

// ============================================================================
// PORTAL GŁÓWNY - Menu dla stron administracyjnych
// ============================================================================
export const PORTAL_MENU: MenuItem[] = [
  {
    id: "home",
    label: "Strona główna",
    icon: Home,
    href: "/",
  },
  {
    id: "applications",
    label: "Aplikacje i usługi",
    icon: AppWindowIcon,
    href: "/aplikacje",
  },
  {
    id: "support",
    label: "Centrum wsparcia",
    icon: HelpCircle,
    href: "/support",
  },
  {
    id: "client-panel",
    label: "Panel klienta",
    icon: UserIcon,
    href: "/client",
  },

  {
    id: "settings",
    label: "Ustawienia",
    icon: Settings,
    children: [
      {
        id: "users",
        label: "Użytkownicy",
        icon: Users,
        href: "/users",
      },
      {
        id: "companies",
        label: "Firmy", 
        icon: Building2,
        href: "/firmy",
      },
      {
        id: "teams",
        label: "Zespoły",
        icon: Users,
        href: "/ustawienia/zespoly",
      },
      {
        id: "api-keys",
        label: "Klucze API",
        icon: Key,
        href: "/ustawienia/klucze-api",
      },
    ],
  },
]

// ============================================================================
// FINANSE I KSIĘGOWOŚĆ - Menu dla aplikacji FK
// ============================================================================
export const FK_MENU: MenuItem[] = [
  {
    id: "dashboard",
    label: "Pulpit",
    icon: Home,
    href: "/fk",
  },
  {
    id: "documents",
    label: "Dokumenty księgowe",
    icon: FileText,
    href: "/fk/documents",
  },
  {
    id: "reports",
    label: "Raporty",
    icon: BarChart3,
    href: "/fk/reports",
  },
  {
    id: "payments",
    label: "Rozrachunki",
    icon: DollarSign,
    href: "/fk/payments",
  },
  {
    id: "dictionaries",
    label: "Słowniki",
    icon: Database,
    href: "/fk/dictionaries",
  },
  {
    id: "settings",
    label: "Ustawienia",
    icon: Settings,
    children: [
      {
        id: "permissions",
        label: "Uprawnienia",
        icon: Shield,
        href: "/fk/permissions",
      },
      {
        id: "configuration",
        label: "Konfiguracja",
        icon: Settings,
        href: "/fk/configuration",
      },
    ],
  },
]

// ============================================================================
// KSEF - Menu dla aplikacji Krajowy System e-Faktur
// ============================================================================
export const KSEF_MENU: MenuItem[] = [
  {
    id: "dashboard",
    label: "Pulpit",
    icon: Home,
    href: "/ksef",
  },
  {
    id: "invoices",
    label: "Faktury",
    icon: FileText,
    href: "/ksef/invoices",
  },
  {
    id: "declarations",
    label: "Deklaracje",
    icon: Send,
    href: "/ksef/declarations",
  },
  {
    id: "reports",
    label: "Raporty",
    icon: BarChart3,
    href: "/ksef/reports",
  },
  {
    id: "configuration",
    label: "Konfiguracja",
    icon: Settings,
    href: "/ksef/configuration",
  },
  {
    id: "settings",
    label: "Ustawienia",
    icon: Settings,
    children: [
      {
        id: "permissions",
        label: "Uprawnienia",
        icon: Shield,
        href: "/ksef/permissions",
      },
    ],
  },
]

// ============================================================================
// eDOKUMENTY - Menu dla aplikacji elektronicznego obiegu dokumentów
// ============================================================================
export const EDOKUMENTY_MENU: MenuItem[] = [
  {
    id: "dashboard",
    label: "Pulpit",
    icon: Home,
    href: "/edokumenty",
  },
  {
    id: "documents",
    label: "Dokumenty",
    icon: FileText,
    href: "/edokumenty/documents",
  },
  {
    id: "workflows",
    label: "Procesy",
    icon: TrendingUp,
    href: "/edokumenty/workflows",
  },
  {
    id: "archive",
    label: "Archiwum",
    icon: Database,
    href: "/edokumenty/archive",
  },
  {
    id: "settings",
    label: "Ustawienia",
    icon: Settings,
    children: [
      {
        id: "permissions",
        label: "Uprawnienia",
        icon: Shield,
        href: "/edokumenty/permissions",
      },
      {
        id: "groups",
        label: "Grupy",
        icon: Users,
        href: "/edokumenty/groups",
      },
      {
        id: "profiles",
        label: "Profile",
        icon: UserIcon,
        href: "/edokumenty/profiles",
      },
    ],
  },
]

// ============================================================================
// eBIURO - Menu dla aplikacji biura rachunkowego
// ============================================================================
export const EBIURO_MENU: MenuItem[] = [
  {
    id: "dashboard",
    label: "Pulpit",
    icon: Home,
    href: "/ebiuro",
  },
  {
    id: "accounting",
    label: "Księgowość",
    icon: FileText,
    href: "/ebiuro/accounting",
  },
  {
    id: "invoicing",
    label: "Fakturowanie", 
    icon: CreditCard,
    href: "/ebiuro/invoicing",
  },
  {
    id: "hr",
    label: "Kadry i płace",
    icon: Users,
    href: "/ebiuro/hr",
  },
  {
    id: "assets",
    label: "Środki trwałe",
    icon: Package,
    href: "/ebiuro/assets",
  },
  {
    id: "settings",
    label: "Ustawienia",
    icon: Settings,
    children: [
      {
        id: "permissions",
        label: "Uprawnienia",
        icon: Shield,
        href: "/ebiuro/permissions",
      },
    ],
  },
]

// ============================================================================
// POLICY MANAGEMENT - Menu dla zarządzania politykami OPA
// ============================================================================
export const POLICY_MANAGEMENT_MENU: MenuItem[] = [
  {
    id: "dashboard",
    label: "Pulpit",
    icon: Home,
    href: "/policy-management",
  },
  {
    id: "policies",
    label: "Polityki",
    icon: Shield,
    href: "/policy-management/policies",
  },
  {
    id: "validation",
    label: "Walidacja",
    icon: FileText,
    href: "/policy-management/validation",
  },
  {
    id: "testing",
    label: "Testowanie",
    icon: BarChart3,
    href: "/policy-management/testing",
  },
  {
    id: "history",
    label: "Historia",
    icon: Database,
    href: "/policy-management/history",
  },
]

// ============================================================================
// HELPER FUNCTIONS - Funkcje pomocnicze do wyboru odpowiedniej konfiguracji
// ============================================================================

/**
 * Zwraca odpowiednią konfigurację menu na podstawie ścieżki URL
 */
export const getMenuConfigForPath = (pathname: string): MenuItem[] => {
  if (pathname.startsWith("/fk")) return FK_MENU
  if (pathname.startsWith("/ksef")) return KSEF_MENU
  if (pathname.startsWith("/edokumenty")) return EDOKUMENTY_MENU
  if (pathname.startsWith("/ebiuro")) return EBIURO_MENU
  if (pathname.startsWith("/policy-management")) return POLICY_MANAGEMENT_MENU
  
  // Domyślnie zwracamy menu portalu głównego
  return PORTAL_MENU
}

/**
 * Zwraca aktywny element menu na podstawie ścieżki URL
 */
export const getActiveItemForPath = (pathname: string): string | undefined => {
  // Portal główny
  if (pathname === "/aplikacje") return "applications"
  if (pathname === "/users") return "users"
  if (pathname === "/firmy") return "companies"
  if (pathname.startsWith("/ustawienia/zespoly")) return "teams"
  if (pathname.startsWith("/ustawienia/klucze-api")) return "api-keys"
  
  // Aplikacje
  if (pathname === "/fk") return "dashboard"
  if (pathname.startsWith("/fk/permissions")) return "permissions"
  if (pathname === "/ksef") return "dashboard"
  if (pathname === "/edokumenty") return "dashboard"
  if (pathname === "/ebiuro") return "dashboard"
  if (pathname === "/policy-management") return "dashboard"
  
  return undefined
} 