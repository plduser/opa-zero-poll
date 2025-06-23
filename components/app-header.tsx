"use client"

import { Menu, ChevronDown } from "lucide-react"
import { AppSwitcher } from "@/app/components/app-switcher"
import { PortalSettingsDropdown } from "@/app/components/portal-settings-dropdown"

interface AppHeaderProps {
  title: string
  showCompanySelector?: boolean
  companies?: { value: string; label: string }[]
  selectedCompany?: string
  onCompanyChange?: (company: string) => void
}

export const AppHeader = ({ 
  title, 
  showCompanySelector = true,
  companies = [
    { value: "cd-projekt-red", label: "CD Projekt Red S.A." },
    { value: "platige-image", label: "Platige Image S.A." },
    { value: "techland", label: "Techland Sp. z o.o." },
    { value: "11-bit-studios", label: "11 bit studios S.A." },
    { value: "bloober-team", label: "Bloober Team S.A." },
  ],
  selectedCompany = "cd-projekt-red",
  onCompanyChange
}: AppHeaderProps) => {
  return (
    <header className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-4">
        <button className="p-1">
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center">
          <img src="/symfonia-logo.png" alt="Symfonia" className="h-10 relative top-[5px]" />
          <span className="text-lg font-medium font-quicksand ml-4">{title}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {showCompanySelector && (
          <div className="relative">
            <select 
              className="flex items-center gap-2 px-4 py-2 border rounded-md font-quicksand appearance-none cursor-pointer pr-10"
              value={selectedCompany}
              onChange={(e) => onCompanyChange?.(e.target.value)}
            >
              {companies.map((company) => (
                <option key={company.value} value={company.value}>
                  {company.label}
                </option>
              ))}
            </select>
            <ChevronDown className="h-5 w-5 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        )}
        <PortalSettingsDropdown />
        <AppSwitcher />
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-800">
          JP
        </div>
      </div>
    </header>
  )
} 