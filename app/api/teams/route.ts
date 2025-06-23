import { NextRequest, NextResponse } from 'next/server'

// Konfiguracja połączenia z Data Provider API
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tenantId = searchParams.get('tenant_id')
  
  if (!tenantId) {
    return NextResponse.json(
      { error: 'tenant_id parameter is required' },
      { status: 400 }
    )
  }

  console.log(`[API Teams] Pobieranie zespołów dla tenanta: ${tenantId}`)

  try {
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams?tenant_id=${tenantId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API Teams] Błąd ${response.status} z Data Provider API`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Teams] Pobrano ${data.teams?.length || 0} zespołów`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API Teams] Błąd pobierania zespołów:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log(`[API Teams] Tworzenie nowego zespołu`)

  try {
    const body = await request.json()
    
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.log(`[API Teams] Błąd ${response.status} podczas tworzenia zespołu`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Teams] Utworzono zespół: ${data.team?.team_name}`)
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error(`[API Teams] Błąd tworzenia zespołu:`, error)
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
} 