"use client"

import { useState, useEffect } from "react"
import { Search, CheckCircle, X, Plus, Lock, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { canViewPurchaseInvoices } from "@/lib/opa-api"

export function PurchaseInvoicesTab() {
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true)
      try {
        const userId = "user123" 
        const access = await canViewPurchaseInvoices(userId)
        setHasAccess(access)
      } catch (error) {
        console.error("Błąd sprawdzania uprawnień:", error)
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }
    checkAccess()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Sprawdzanie uprawnień...</div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="flex items-center space-x-2">
          <X className="h-8 w-8 text-red-500" />
          <div className="text-xl font-semibold text-gray-700">Brak dostępu</div>
        </div>
        <div className="text-gray-500">Nie masz uprawnień do przeglądania faktury zakupowe.</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">Faktury zakupowe</h2>
      </div>
      <div className="p-8 text-center text-gray-500">
        Faktury zakupowe z integracją OPA
      </div>
    </div>
  )
}
