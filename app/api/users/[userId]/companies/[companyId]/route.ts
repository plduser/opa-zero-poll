import { NextResponse } from 'next/server'

// Environment variable z fallback dla local development
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string; companyId: string }> }
) {
  try {
    const { userId, companyId } = await params

    console.log(`[API User Company DELETE] Usuwanie dostępu do firmy: user=${userId}, company=${companyId}`)
    
    // Połącz się z Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/users/${userId}/companies/${companyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.detail || errorMessage
      } catch (parseError) {
        // Ignore JSON parse error, use default message
      }
      console.log(`[API User Company DELETE] Błąd ${response.status}: ${errorMessage}`)
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`[API User Company DELETE] Usunięto dostęp do firmy:`, data)

    return NextResponse.json(data)

  } catch (error) {
    console.error('[API User Company DELETE] Błąd usuwania dostępu do firmy:', error)
    
    return NextResponse.json(
      { 
        error: 'Błąd usuwania dostępu do firmy',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 