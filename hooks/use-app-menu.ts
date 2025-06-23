import { usePathname } from "next/navigation"
import { getMenuConfigForPath, getActiveItemForPath } from "@/lib/menu-configs"
import { MenuItem } from "@/components/app-sidebar"

export interface UseAppMenuReturn {
  menuItems: MenuItem[]
  activeItem: string | undefined
  currentApp: string
}

/**
 * Hook automatycznie zarządzający konfiguracją menu na podstawie aktualnej ścieżki
 */
export const useAppMenu = (): UseAppMenuReturn => {
  const pathname = usePathname()
  
  const menuItems = getMenuConfigForPath(pathname)
  const activeItem = getActiveItemForPath(pathname)
  
  // Określ aktualną aplikację na podstawie ścieżki
  const getCurrentApp = (path: string): string => {
    if (path.startsWith("/fk")) return "Finanse i Księgowość"
    if (path.startsWith("/ksef")) return "KSeF"
    if (path.startsWith("/edokumenty")) return "eDokumenty"
    if (path.startsWith("/ebiuro")) return "eBiuro"
    if (path.startsWith("/policy-management")) return "Zarządzanie politykami"
    if (path.startsWith("/ustawienia")) return "Ustawienia"
    if (path === "/aplikacje") return "Aplikacje i usługi"
    if (path === "/users") return "Użytkownicy"
    if (path === "/firmy") return "Firmy"
    
    return "Portal Symfonia"
  }
  
  return {
    menuItems,
    activeItem,
    currentApp: getCurrentApp(pathname)
  }
} 