import { NextResponse } from 'next/server'

// Environment variable z fallback dla local development
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const application = searchParams.get('application')
    
    let url = `${DATA_PROVIDER_API_URL}/api/profiles`
    if (application) {
      url += `?application=${encodeURIComponent(application)}`
    }
    
    console.log(`[API Profiles] Pobieranie profili: ${url}`)
    
    // Połącz się z Data Provider API
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API Profiles] Błąd ${response.status} z Data Provider API`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Profiles] Pobrano ${data.profiles?.length || 0} profili`)

    return NextResponse.json(data)

  } catch (error) {
    console.error('[API Profiles] Błąd pobierania profili:', error)
    
    return NextResponse.json(
      { 
        error: 'Błąd pobierania profili',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 