"use client"

import { useState } from "react"
import { Settings, Building2, Database, Shield, ChevronRight } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function PortalSettingsDropdown() {
  const portalSettings = [
    {
      title: "Zarządzanie Dzierżawcami",
      href: "/portal-settings/tenant-management",
      icon: Building2,
      description: "Tworzenie i zarządzanie dzierżawcami"
    },
    {
      title: "Uruchomienie",
      href: "/portal-settings/uruchomienie", 
      icon: Database,
      description: "Inicjalizacja i konfiguracja systemu"
    },
    {
      title: "Bezpieczeństwo",
      href: "/portal-settings/bezpieczenstwo",
      icon: Shield,
      description: "Ustawienia bezpieczeństwa i uprawnień"
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="p-1">
          <Settings className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Ustawienia Portalu
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {portalSettings.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              href={item.href}
              className="flex items-center gap-3 px-2 py-2 cursor-pointer"
            >
              <item.icon className="h-4 w-4 text-gray-500" />
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 