import { NextRequest, NextResponse } from 'next/server'

const OPA_BASE_URL = 'http://localhost:8181'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🔄 [API Proxy] Przekazywanie zapytania do OPA:', body)
    
    const opaResponse = await fetch(`${OPA_BASE_URL}/v1/data/ksef/allow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!opaResponse.ok) {
      throw new Error(`OPA HTTP error! status: ${opaResponse.status}`)
    }

    const data = await opaResponse.json()
    
    console.log('✅ [API Proxy] Odpowiedź z OPA:', data)
    
    const transformedResponse = {
      result: {
        allow: data.result,
        user: body.input.user,
        action: body.input.action,
        company_id: body.input.company_id,
        user_roles: [],
        reason: data.result ? "Access granted" : "Access denied"
      }
    }
    
    return NextResponse.json(transformedResponse)
  } catch (error) {
    console.error('❌ [API Proxy] Błąd komunikacji z OPA:', error)
    
    return NextResponse.json(
      { 
        result: {
          allow: false,
          user: '',
          action: '',
          user_roles: [],
          reason: `Proxy error: ${error}`
        }
      },
      { status: 500 }
    )
  }
} 