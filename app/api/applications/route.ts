import { NextResponse } from 'next/server'

// Environment variable z fallback dla local development
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET() {
  try {
    console.log('[API Applications] Pobieranie aplikacji z Data Provider API...')
    
    // Połącz się z Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/applications`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('[API Applications] Pobrano dane:', data)

    return NextResponse.json(data)

  } catch (error) {
    console.error('[API Applications] Błąd pobierania aplikacji:', error)
    
    // Fallback do mockowanych danych w przypadku błędu
    const fallbackApplications = {
      database_applications: [
        {
          app_id: "ebiuro",
          app_name: "eBiuro",
          description: "System zarządzania biurem",
          profiles: [
            { profile_id: "admin", profile_name: "Administrator", description: "Pełny dostęp", is_default: false }
          ],
          status: "active"
        }
      ]
    }

    return NextResponse.json({
      success: false,
      ...fallbackApplications,
      error: 'Używam danych fallback z powodu błędu API'
    })
  }
} 