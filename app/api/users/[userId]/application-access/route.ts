import { NextResponse } from 'next/server'

// Environment variable z fallback dla local development
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    console.log(`[API User Application Access] Pobieranie dostępów do aplikacji dla użytkownika: ${userId}`)
    
    // Połącz się z Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/users/${userId}/application-access`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API User Application Access] Błąd ${response.status} z Data Provider API`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API User Application Access] Pobrano dane:`, data)

    return NextResponse.json(data)

  } catch (error) {
    console.error('[API User Application Access] Błąd pobierania dostępów do aplikacji:', error)
    
    return NextResponse.json(
      { 
        error: 'Błąd pobierania dostępów do aplikacji',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const body = await request.json()
    
    console.log(`[API User Application Access] Przydzielanie dostępu do aplikacji: user=${userId}, profile=${body.profile_id}`)
    
    // Połącz się z Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/users/${userId}/application-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile_id: body.profile_id,
        assigned_by: 'portal_admin'
      }),
    })

    if (!response.ok) {
      console.log(`[API User Application Access] Błąd ${response.status} podczas przydzielania`)
      try {
        const errorData = await response.json()
        console.error(`[API User Application Access] Szczegóły błędu:`, errorData)
        
        // Przekaż konkretny błąd i status z Data Provider API
        return NextResponse.json(
          { 
            error: errorData.error || 'Błąd przydzielania dostępu do aplikacji',
            details: errorData.details || `HTTP error! status: ${response.status}`
          },
          { status: response.status }
        )
      } catch (parseError) {
        // Jeśli nie można sparsować odpowiedzi błędu
        return NextResponse.json(
          { 
            error: 'Błąd przydzielania dostępu do aplikacji',
            details: `HTTP error! status: ${response.status}`
          },
          { status: response.status }
        )
      }
    }

    const data = await response.json()
    console.log(`[API User Application Access] Przydzielono dostęp:`, data)

    return NextResponse.json(data)

  } catch (error) {
    console.error('[API User Application Access] Błąd przydzielania dostępu do aplikacji:', error)
    
    return NextResponse.json(
      { 
        error: 'Błąd połączenia z serwerem',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const url = new URL(request.url)
    const profileId = url.searchParams.get('profileId')
    
    if (!profileId) {
      return NextResponse.json(
        { error: 'Brak parametru profileId' },
        { status: 400 }
      )
    }

    console.log(`[API User Application Access] Usuwanie dostępu do aplikacji: user=${userId}, profile=${profileId}`)
    
    // Połącz się z Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/users/${userId}/application-access/${profileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API User Application Access] Błąd ${response.status} podczas usuwania`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API User Application Access] Usunięto dostęp:`, data)

    return NextResponse.json(data)

  } catch (error) {
    console.error('[API User Application Access] Błąd usuwania dostępu do aplikacji:', error)
    
    return NextResponse.json(
      { 
        error: 'Błąd usuwania dostępu do aplikacji',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 