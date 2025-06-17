import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  console.log('[API Init Database] Rozpoczęcie inicjalizacji bazy danych')

  try {
    // Pobranie parametrów z body (opcjonalne)
    const body = await request.json().catch(() => ({}))
    const { force = false, dryRun = false } = body

    // Ścieżka do skryptu inicjalizacji
    const scriptPath = path.join(process.cwd(), 'scripts', 'init-database.py')
    
    // Przygotuj argumenty dla skryptu
    const args = ['init-database.py']
    
    if (force) {
      args.push('--force')
    }
    
    if (dryRun) {
      args.push('--dry-run')
    }

    console.log(`[API Init Database] Uruchamianie skryptu: python3 ${args.join(' ')}`)

    // Uruchom skrypt Python
    const result = await new Promise<{
      success: boolean
      output: string
      error: string
    }>((resolve) => {
      const childProcess = spawn('python3', args, {
        cwd: path.join(process.cwd(), 'scripts'),
        env: {
          ...process.env,
          // Przekaż zmienne środowiskowe dla bazy danych
          DB_HOST: process.env.DB_HOST || process.env.PGHOST || 'localhost',
          DB_PORT: process.env.DB_PORT || process.env.PGPORT || '5432',
          DB_USER: process.env.DB_USER || process.env.PGUSER || 'opa_user',
          DB_PASSWORD: process.env.DB_PASSWORD || process.env.PGPASSWORD || 'opa_password',
          DB_NAME: process.env.DB_NAME || process.env.PGDATABASE || 'opa_zero_poll',
          DATABASE_URL: process.env.DATABASE_URL,
        }
      })

      let output = ''
      let error = ''

      childProcess.stdout.on('data', (data) => {
        const message = data.toString()
        output += message
        console.log(`[Init Script] ${message.trim()}`)
      })

      childProcess.stderr.on('data', (data) => {
        const message = data.toString()
        error += message
        console.error(`[Init Script Error] ${message.trim()}`)
      })

      childProcess.on('close', (code) => {
        console.log(`[API Init Database] Skrypt zakończony z kodem: ${code}`)
        resolve({
          success: code === 0,
          output,
          error
        })
      })

      // Timeout po 5 minutach
      setTimeout(() => {
        childProcess.kill()
        resolve({
          success: false,
          output,
          error: error + '\nTimeout: Proces został przerwany po 5 minutach'
        })
      }, 5 * 60 * 1000)
    })

    if (result.success) {
      // Parsuj statystyki ze skryptu jeśli dostępne
      const statsMatch = result.output.match(/• Tenants: (\d+)[\s\S]*• Użytkownicy: (\d+)[\s\S]*• Aplikacje: (\d+)/)
      const stats = statsMatch ? {
        tenants: parseInt(statsMatch[1]),
        users: parseInt(statsMatch[2]),
        applications: parseInt(statsMatch[3])
      } : null

      return NextResponse.json({
        success: true,
        message: 'Baza danych została pomyślnie zainicjalizowana',
        details: {
          output: result.output,
          stats,
          force,
          dryRun
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Błąd podczas inicjalizacji bazy danych',
        details: {
          output: result.output,
          error: result.error,
          force,
          dryRun
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('[API Init Database] Błąd:', error)
    
    return NextResponse.json({
      success: false,
      error: `Błąd serwera: ${error instanceof Error ? error.message : 'Nieznany błąd'}`,
      details: {
        type: 'server_error',
        message: error instanceof Error ? error.message : 'Nieznany błąd'
      }
    }, { status: 500 })
  }
} 