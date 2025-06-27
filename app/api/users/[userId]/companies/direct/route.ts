import { NextResponse } from 'next/server'

// Environment variable z fallback dla local development
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    console.log(`[API User Direct Companies] Pobieranie bezpośrednio przypisanych firm dla użytkownika: ${userId}`)
    
    // Połącz się z Data Provider API - endpoint dla bezpośrednich dostępów
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/users/${userId}/companies/direct`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API User Direct Companies] Błąd ${response.status} z Data Provider API`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API User Direct Companies] Pobrano dane:`, data)

    return NextResponse.json(data)

  } catch (error) {
    console.error('[API User Direct Companies] Błąd pobierania bezpośrednich firm:', error)
    
    return NextResponse.json(
      { 
        error: 'Błąd pobierania bezpośrednich firm',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 