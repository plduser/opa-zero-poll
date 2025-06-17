import { NextResponse } from 'next/server'

// Environment variable z fallback dla local development
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenant = searchParams.get('tenant')
    
    let url = `${DATA_PROVIDER_API_URL}/api/companies`
    if (tenant) {
      url += `?tenant=${encodeURIComponent(tenant)}`
    }
    
    console.log(`[API Companies] Pobieranie firm: ${url}`)
    
    // Połącz się z Data Provider API
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API Companies] Błąd ${response.status} z Data Provider API`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Companies] Pobrano ${data.companies?.length || 0} firm`)

    return NextResponse.json(data)

  } catch (error) {
    console.error('[API Companies] Błąd pobierania firm:', error)
    
    return NextResponse.json(
      { 
        error: 'Błąd pobierania firm',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 