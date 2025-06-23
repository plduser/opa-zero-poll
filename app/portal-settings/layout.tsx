"use client"

import { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useAppMenu } from "@/hooks/use-app-menu"

interface PortalSettingsLayoutProps {
  children: ReactNode
}

export default function PortalSettingsLayout({ children }: PortalSettingsLayoutProps) {
  const { menuItems, activeItem, currentApp } = useAppMenu()

  return (
    <div className="min-h-screen bg-white">
      <AppHeader title={currentApp || "Ustawienia Portalu"} />

      <div className="flex">
        <AppSidebar 
          menuItems={menuItems}
          activeItem={activeItem}
        />
        
        <main className="flex-1 p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
} 