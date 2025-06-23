import { NextRequest, NextResponse } from 'next/server'

// Konfiguracja połączenia z Data Provider API
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  
  console.log(`[API Team] Pobieranie szczegółów zespołu: ${teamId}`)

  try {
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams/${teamId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API Team] Błąd ${response.status} z Data Provider API`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Team] Pobrano zespół: ${data.team?.team_name}`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API Team] Błąd pobierania zespołu:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  
  console.log(`[API Team] Aktualizacja zespołu: ${teamId}`)

  try {
    const body = await request.json()
    
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams/${teamId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.log(`[API Team] Błąd ${response.status} podczas aktualizacji zespołu`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Team] Zaktualizowano zespół: ${data.team?.team_name}`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API Team] Błąd aktualizacji zespołu:`, error)
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  
  console.log(`[API Team] Usuwanie zespołu: ${teamId}`)

  try {
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams/${teamId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API Team] Błąd ${response.status} podczas usuwania zespołu`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Team] Usunięto zespół: ${data.deleted_team?.team_name}`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API Team] Błąd usuwania zespołu:`, error)
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    )
  }
} 