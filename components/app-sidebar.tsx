"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronDown, LucideIcon } from "lucide-react"

export interface MenuItem {
  id: string
  label: string
  icon: LucideIcon
  href?: string
  children?: MenuItem[]
  badge?: string
  description?: string
}

export interface SidebarProps {
  menuItems: MenuItem[]
  activeItem?: string
  className?: string
  onItemClick?: (item: MenuItem) => void
}

interface SidebarItemProps {
  item: MenuItem
  isActive: boolean
  isExpanded?: boolean
  onToggle?: () => void
  level?: number
}

const SidebarItem = ({ item, isActive, isExpanded = false, onToggle, level = 0 }: SidebarItemProps) => {
  const pathname = usePathname()
  const hasChildren = item.children && item.children.length > 0
  const isChildActive = item.children?.some(child => pathname === child.href)
  const shouldExpand = isExpanded || isChildActive

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault()
      onToggle?.()
    }
  }

  const baseClasses = "flex items-center gap-3 px-6 py-3 text-base font-medium font-quicksand transition-colors"
  const activeClasses = isActive || isChildActive ? "bg-gray-50" : "hover:bg-gray-50"
  const textClasses = isActive || isChildActive ? "text-green-600" : "text-gray-800"
  const iconClasses = isActive || isChildActive ? "text-green-600" : "text-gray-500"

  return (
    <li>
      {item.href && !hasChildren ? (
        <Link href={item.href} className={cn(baseClasses, activeClasses)}>
          <item.icon className={cn("h-5 w-5", iconClasses)} />
          <span className={textClasses}>{item.label}</span>
          {item.badge && (
            <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className={cn(baseClasses, activeClasses, "w-full justify-between")}
        >
          <div className="flex items-center gap-3">
            <item.icon className={cn("h-5 w-5", iconClasses)} />
            <span className={textClasses}>{item.label}</span>
          </div>
          {hasChildren && (
            <ChevronDown
              className={cn(
                "h-5 w-5 transition-transform",
                shouldExpand ? "transform rotate-180 text-green-600" : "text-gray-500"
              )}
            />
          )}
        </button>
      )}

      {/* Sub-menu */}
      {hasChildren && shouldExpand && (
        <ul className="pl-6 border-l-2 border-green-600 ml-6">
          {item.children?.map((child) => {
            const isChildItemActive = pathname === child.href
            return (
              <li key={child.id}>
                <Link
                  href={child.href || "#"}
                  className={cn(
                    "flex items-center gap-3 px-6 py-2 text-base font-medium font-quicksand transition-colors",
                    isChildItemActive ? "bg-gray-50" : "hover:bg-gray-50"
                  )}
                >
                  <span className={isChildItemActive ? "text-green-600" : "text-gray-800"}>
                    {child.label}
                  </span>
                  {child.badge && (
                    <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {child.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}

export const AppSidebar = ({ menuItems, activeItem, className, onItemClick }: SidebarProps) => {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const pathname = usePathname()

  // Auto-expand menus that contain active items
  const toggleMenu = (itemId: string) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedMenus(newExpanded)
  }

  // Check if menu should be expanded (has active child)
  const shouldExpandMenu = (item: MenuItem) => {
    if (expandedMenus.has(item.id)) return true
    return item.children?.some(child => pathname === child.href) || false
  }

  return (
    <aside className={cn("w-64 min-h-[calc(100vh-64px)] border-r border-gray-200 bg-white", className)}>
      <nav className="py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={activeItem === item.id || pathname === item.href}
              isExpanded={shouldExpandMenu(item)}
              onToggle={() => {
                toggleMenu(item.id)
                onItemClick?.(item)
              }}
            />
          ))}
        </ul>
      </nav>
    </aside>
  )
} 