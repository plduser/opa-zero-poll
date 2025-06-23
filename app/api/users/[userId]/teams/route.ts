import { NextRequest, NextResponse } from 'next/server'

// Konfiguracja połączenia z Data Provider API
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenant_id')
  
  console.log(`[API User Teams] Pobieranie zespołów użytkownika: ${userId}`)

  try {
    // Buduj URL z opcjonalnym tenant_id
    const url = tenantId 
      ? `${DATA_PROVIDER_API_URL}/api/users/${userId}/teams?tenant_id=${tenantId}`
      : `${DATA_PROVIDER_API_URL}/api/users/${userId}/teams`
    
    // Przekieruj do Data Provider API
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API User Teams] Błąd ${response.status} z Data Provider API`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API User Teams] Pobrano ${data.teams?.length || 0} zespołów dla użytkownika`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API User Teams] Błąd pobierania zespołów użytkownika:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch user teams' },
      { status: 500 }
    )
  }
} 