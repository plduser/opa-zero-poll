import { NextResponse } from 'next/server'

// Environment variable z fallback dla local development
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    console.log(`[API User Companies] Pobieranie dostępów do firm dla użytkownika: ${userId}`)
    
    // Połącz się z Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/users/${userId}/companies`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API User Companies] Błąd ${response.status} z Data Provider API`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API User Companies] Pobrano dane:`, data)

    return NextResponse.json(data)

  } catch (error) {
    console.error('[API User Companies] Błąd pobierania dostępów do firm:', error)
    
    return NextResponse.json(
      { 
        error: 'Błąd pobierania dostępów do firm',
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
    
    console.log(`[API User Companies] Przypisywanie firmy do użytkownika: user=${userId}`, body)
    
    // Połącz się z Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/users/${userId}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.log(`[API User Companies] Błąd ${response.status} podczas przypisywania`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API User Companies] Przypisano firmę:`, data)

    return NextResponse.json(data)

  } catch (error) {
    console.error('[API User Companies] Błąd przypisywania firmy:', error)
    
    return NextResponse.json(
      { 
        error: 'Błąd przypisywania firmy',
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
    const companyId = url.searchParams.get('companyId')
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Brak parametru companyId' },
        { status: 400 }
      )
    }

    console.log(`[API User Companies] Usuwanie dostępu do firmy: user=${userId}, company=${companyId}`)
    
    // Połącz się z Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/users/${userId}/companies/${companyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API User Companies] Błąd ${response.status} podczas usuwania`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API User Companies] Usunięto dostęp do firmy:`, data)

    return NextResponse.json(data)

  } catch (error) {
    console.error('[API User Companies] Błąd usuwania dostępu do firmy:', error)
    
    return NextResponse.json(
      { 
        error: 'Błąd usuwania dostępu do firmy',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 