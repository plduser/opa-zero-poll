"use client"

import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"

interface SidebarItemProps {
  icon: ReactNode
  label: string
  isActive?: boolean
  isExpanded?: boolean
  hasSubmenu?: boolean
  onClick?: () => void
}

export function SidebarItem({ icon, label, isActive, isExpanded, hasSubmenu, onClick }: SidebarItemProps) {
  return (
    <a
      href="#"
      className={`flex items-center gap-2 px-4 py-2 ${isActive ? "bg-gray-50" : "hover:bg-gray-50"}`}
      onClick={onClick}
    >
      <div className={`${isActive ? "text-green-600" : "text-gray-500"}`}>{icon}</div>
      <span className={`text-sm font-medium font-quicksand ${isActive ? "text-green-600" : "text-gray-800"}`}>
        {label}
      </span>
      {hasSubmenu && <ChevronDown className={`h-4 w-4 ml-auto ${isActive ? "text-green-600" : "text-gray-500"}`} />}
    </a>
  )
}

interface SidebarSubmenuItemProps {
  label: string
  isActive?: boolean
}

export function SidebarSubmenuItem({ label, isActive }: SidebarSubmenuItemProps) {
  return (
    <a href="#" className={`flex items-center gap-2 px-4 py-2 ${isActive ? "bg-gray-50" : "hover:bg-gray-50"}`}>
      <span className={`text-sm font-medium font-quicksand ${isActive ? "text-green-600" : "text-gray-800"}`}>
        {label}
      </span>
    </a>
  )
}

interface SidebarProps {
  title: string
  icon: string
  children: ReactNode
}

export function Sidebar({ title, icon, children }: SidebarProps) {
  return (
    <div className="w-56 bg-white border-r border-gray-200">
      <div className="p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold mr-2">
            {icon}
          </div>
          <span className="text-sm font-medium font-quicksand">{title}</span>
        </div>
      </div>
      <ul className="space-y-1 py-2">{children}</ul>
    </div>
  )
}
