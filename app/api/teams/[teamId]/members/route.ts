import { NextRequest, NextResponse } from 'next/server'

// Konfiguracja połączenia z Data Provider API
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  
  console.log(`[API Team Members] Pobieranie członków zespołu: ${teamId}`)

  try {
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams/${teamId}/members`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API Team Members] Błąd ${response.status} z Data Provider API`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Team Members] Pobrano ${data.members?.length || 0} członków`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API Team Members] Błąd pobierania członków zespołu:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  
  console.log(`[API Team Members] Dodawanie członka do zespołu: ${teamId}`)

  try {
    const body = await request.json()
    
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams/${teamId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.log(`[API Team Members] Błąd ${response.status} podczas dodawania członka`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Team Members] Dodano członka do zespołu: ${data.team_name}`)
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error(`[API Team Members] Błąd dodawania członka zespołu:`, error)
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 }
    )
  }
} 