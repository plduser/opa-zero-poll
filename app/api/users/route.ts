import { NextResponse } from 'next/server'

// Environment variable z fallback dla local development
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function GET() {
  try {
    console.log('[API Users] Pobieranie użytkowników z Data Provider API...')
    
    // Połącz się z Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/users/for-portal`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('[API Users] Pobrano dane:', data)

    // Przetwórz dane na format używany przez frontend
    const users = data.users?.map((user: any) => ({
      id: user.id || user.user_id,
      name: user.full_name || user.name || 'Nieznany użytkownik',
      email: user.email || '',
      initials: user.initials || (user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'NU'),
      role: user.role || 'użytkownik',
      tenants: user.tenants || [],
      status: user.status || 'active'
    })).filter((user: any) => user.status === 'active') || []

    console.log('[API Users] Przetworzeni użytkownicy:', users)

    return NextResponse.json({
      success: true,
      users,
      count: users.length
    })

  } catch (error) {
    console.error('[API Users] Błąd pobierania użytkowników:', error)
    
    // Fallback do mockowanych danych w przypadku błędu
    const fallbackUsers = [
      { id: "user123", name: "Jan Kowalski", email: "jan.kowalski@firmowa.pl", initials: "JK", role: "ksiegowa", status: "active" },
      { id: "user456", name: "Anna Nowak", email: "anna.nowak@firmowa.pl", initials: "AN", role: "handlowiec", status: "active" },
      { id: "user789", name: "Piotr Zieliński", email: "piotr.zielinski@firmowa.pl", initials: "PZ", role: "administrator", status: "active" },
    ]

    return NextResponse.json({
      success: false,
      users: fallbackUsers,
      count: fallbackUsers.length,
      error: 'Używam danych fallback z powodu błędu API'
    })
  }
} 