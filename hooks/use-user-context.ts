import { useState, useEffect } from 'react'

export interface UserContext {
  userId: string | null
  tenantId: string | null
  userName: string | null
  userEmail: string | null
  isLoading: boolean
}

// Hook do pobierania kontekstu użytkownika z localStorage
export function useUserContext(): UserContext {
  const [context, setContext] = useState<UserContext>({
    userId: null,
    tenantId: null,
    userName: null,
    userEmail: null,
    isLoading: true
  })

  useEffect(() => {
    const updateContext = () => {
      try {
        // Pobierz użytkownika z localStorage
        const storedUser = localStorage.getItem('currentUser')
        const storedUserId = localStorage.getItem('currentUserId')
        
        // Debug logs removed - useUserContext working correctly
        
        let userId = storedUserId || null
        let tenantId = 'tenant125' // domyślny fallback
        let userName = null
        let userEmail = null

        if (storedUser) {
          const user = JSON.parse(storedUser)
          userId = user.id || userId
          tenantId = user.tenant_id || tenantId
          userName = user.name || user.full_name || null
          userEmail = user.email || null
        }

        const finalContext = {
          userId,
          tenantId,
          userName,
          userEmail,
          isLoading: false
        }

        setContext(finalContext)
      } catch (error) {
        console.error('Błąd parsowania kontekstu użytkownika:', error)
        // Fallback do domyślnych wartości
        setContext({
          userId: 'user42',
          tenantId: 'tenant125',
          userName: null,
          userEmail: null,
          isLoading: false
        })
      }
    }

    // Aktualizuj przy mount
    updateContext()

    // Nasłuchuj zmian w localStorage
    const handleStorageChange = () => updateContext()
    
    // Nasłuchuj custom events z Header (zmiana użytkownika)
    const handleUserChange = () => updateContext()

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userChanged', handleUserChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userChanged', handleUserChange)
    }
  }, [])

  return context
} 