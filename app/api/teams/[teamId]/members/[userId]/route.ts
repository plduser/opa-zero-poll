import { NextRequest, NextResponse } from 'next/server'

// Konfiguracja połączenia z Data Provider API
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ teamId: string; userId: string }> }
) {
  const { teamId, userId } = await params
  
  console.log(`[API Team Member] Usuwanie członka ${userId} z zespołu ${teamId}`)

  try {
    // Przekieruj do Data Provider API
    const response = await fetch(`${DATA_PROVIDER_API_URL}/api/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.log(`[API Team Member] Błąd ${response.status} podczas usuwania członka`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[API Team Member] Usunięto członka ${data.removed_member?.full_name} z zespołu`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API Team Member] Błąd usuwania członka zespołu:`, error)
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
} 