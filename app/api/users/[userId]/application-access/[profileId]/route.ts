import { NextResponse } from 'next/server'

// Environment variable z fallback dla local development
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string; profileId: string }> }
) {
  try {
    const { userId, profileId } = await params

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
      try {
        const errorData = await response.json()
        console.error(`[API User Application Access] Szczegóły błędu:`, errorData)
        
        return NextResponse.json(
          { 
            error: errorData.error || 'Błąd usuwania dostępu do aplikacji',
            details: errorData.details || `HTTP error! status: ${response.status}`
          },
          { status: response.status }
        )
      } catch (parseError) {
        return NextResponse.json(
          { 
            error: 'Błąd usuwania dostępu do aplikacji',
            details: `HTTP error! status: ${response.status}`
          },
          { status: response.status }
        )
      }
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