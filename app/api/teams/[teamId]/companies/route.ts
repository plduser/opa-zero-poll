import { NextRequest, NextResponse } from 'next/server'

// Konfiguracja połączenia z Data Provider API
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  
  console.log(`[API Team Companies] Pobieranie firm zespołu: ${teamId}`)

  try {
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams/${teamId}/companies`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API Team Companies] Błąd ${response.status} z Data Provider API`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Team Companies] Pobrano ${data.companies?.length || 0} firm`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API Team Companies] Błąd pobierania firm zespołu:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch team companies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  
  console.log(`[API Team Companies] Dodawanie firmy do zespołu: ${teamId}`)

  try {
    const body = await request.json()
    console.log(`[API Team Companies] Dane firmy:`, body)
    
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams/${teamId}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.log(`[API Team Companies] Błąd ${response.status} podczas dodawania firmy`)
      const errorText = await response.text()
      console.log(`[API Team Companies] Szczegóły błędu:`, errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Team Companies] Dodano firmę do zespołu:`, data)
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error(`[API Team Companies] Błąd dodawania firmy zespołu:`, error)
    return NextResponse.json(
      { error: 'Failed to add team company' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  const { searchParams } = new URL(request.url)
  const companyId = searchParams.get('company_id')
  
  console.log(`[API Team Companies] Usuwanie firmy z zespołu: ${teamId}, company_id: ${companyId}`)

  try {
    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id parameter is required' },
        { status: 400 }
      )
    }
    
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams/${teamId}/companies?company_id=${companyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API Team Companies] Błąd ${response.status} podczas usuwania firmy`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Team Companies] Usunięto firmę z zespołu`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API Team Companies] Błąd usuwania firmy zespołu:`, error)
    return NextResponse.json(
      { error: 'Failed to remove team company' },
      { status: 500 }
    )
  }
} 