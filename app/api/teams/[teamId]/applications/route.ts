import { NextRequest, NextResponse } from 'next/server'

// Konfiguracja połączenia z Data Provider API
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  
  console.log(`[API Team Applications] Pobieranie aplikacji zespołu: ${teamId}`)

  try {
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams/${teamId}/applications`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API Team Applications] Błąd ${response.status} z Data Provider API`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Team Applications] Pobrano ${data.applications?.length || 0} aplikacji`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API Team Applications] Błąd pobierania aplikacji zespołu:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch team applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  
  console.log(`[API Team Applications] Dodawanie aplikacji do zespołu: ${teamId}`)

  try {
    const body = await request.json()
    console.log(`[API Team Applications] Otrzymane dane:`, JSON.stringify(body, null, 2))
    console.log(`[API Team Applications] Typy danych:`, {
      app_id: typeof body.app_id,
      role_name: typeof body.role_name
    })
    
    // Sprawdź czy dane są poprawne
    if (!body.app_id || !body.role_name) {
      console.error(`[API Team Applications] Brakujące pola:`, {
        app_id: body.app_id,
        role_name: body.role_name
      })
      return NextResponse.json(
        { error: 'app_id and role_name are required' },
        { status: 400 }
      )
    }
    
    console.log(`[API Team Applications] Wywołanie Data Provider API: ${DATA_PROVIDER_API_URL}/api/teams/${teamId}/applications`)
    
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams/${teamId}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log(`[API Team Applications] Odpowiedź Data Provider API:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[API Team Applications] Błąd ${response.status} z Data Provider API:`, errorText)
      return NextResponse.json(
        { error: `Data Provider API error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`[API Team Applications] Sukces - dodano aplikację:`, JSON.stringify(data, null, 2))
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error(`[API Team Applications] Exception podczas dodawania aplikacji:`, error)
    return NextResponse.json(
      { error: `Internal error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  const { searchParams } = new URL(request.url)
  const appId = searchParams.get('app_id')
  const roleName = searchParams.get('role_name')
  
  console.log(`[API Team Applications] Usuwanie aplikacji z zespołu: ${teamId}, app_id: ${appId}, role: ${roleName}`)

  try {
    if (!appId || !roleName) {
      return NextResponse.json(
        { error: 'app_id and role_name parameters are required' },
        { status: 400 }
      )
    }
    
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams/${teamId}/applications?app_id=${appId}&role_name=${roleName}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API Team Applications] Błąd ${response.status} podczas usuwania aplikacji`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Team Applications] Usunięto aplikację z zespołu`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API Team Applications] Błąd usuwania aplikacji zespołu:`, error)
    return NextResponse.json(
      { error: 'Failed to remove team application' },
      { status: 500 }
    )
  }
} 