import { NextResponse } from 'next/server'

// Environment variable z fallback dla local development
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET() {
  try {
    console.log('[API Tenants] Pobieranie tenantów z Data Provider API...')
    
    // Połącz się z Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/tenants`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('[API Tenants] Pobrano dane:', data)

    return NextResponse.json({
      success: true,
      tenants: data.tenants || [],
      count: data.tenants?.length || 0
    })

  } catch (error) {
    console.error('[API Tenants] Błąd pobierania tenantów:', error)
    
    // Fallback do tenantów domyślnych
    const fallbackTenants = [
      { tenant_id: 'tenant125', tenant_name: 'Symfonia Sp. z o.o.' },
      { tenant_id: 'tenant200', tenant_name: 'Biuro Rachunkowe XYZ' },
    ]

    return NextResponse.json({
      success: false,
      tenants: fallbackTenants,
      count: fallbackTenants.length,
      error: 'Używam danych fallback z powodu błędu API'
    })
  }
} 