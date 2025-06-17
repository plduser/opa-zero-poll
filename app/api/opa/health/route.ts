import { NextResponse } from 'next/server'

// Environment variable z fallback dla local development
const OPA_BASE_URL = process.env.OPA_BASE_URL || 'http://localhost:8181'

export async function GET() {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  try {
    // Sprawdź czy OPA odpowiada
    const healthResponse = await fetch(`${OPA_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(3000), // 3s timeout
    })

    const responseTime = Date.now() - startTime

    if (!healthResponse.ok) {
      return NextResponse.json({
        status: 'unhealthy',
        timestamp,
        error: `HTTP ${healthResponse.status}: ${healthResponse.statusText}`,
        responseTime,
      })
    }

    // Sprawdź dodatkowo czy OPA ma załadowane dane
    try {
      const dataResponse = await fetch(`${OPA_BASE_URL}/v1/data`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000), // 2s timeout
      })
      
      const hasData = dataResponse.ok && dataResponse.status === 200
      
      return NextResponse.json({
        status: 'healthy',
        timestamp,
        responseTime,
        error: hasData ? undefined : 'OPA działa, ale brak danych',
      })
    } catch (dataError) {
      // OPA działa, ale nie można sprawdzić danych
      return NextResponse.json({
        status: 'healthy',
        timestamp,
        responseTime,
        error: 'OPA działa (nie można sprawdzić danych)',
      })
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.warn('OPA Engine health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp,
      error: error instanceof Error ? error.message : 'Connection timeout',
      responseTime,
    })
  }
} 