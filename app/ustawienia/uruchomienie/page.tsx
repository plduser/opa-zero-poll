"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, Play, CheckCircle, XCircle, Info } from "lucide-react"

export default function UruchomieniePage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initResult, setInitResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const handleInitializeDatabase = async () => {
    setIsInitializing(true)
    setInitResult(null)

    try {
      const response = await fetch('/api/admin/init-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        setInitResult({
          success: true,
          message: result.message || 'Baza danych została pomyślnie zainicjalizowana',
          details: result.details
        })
      } else {
        setInitResult({
          success: false,
          message: result.error || 'Błąd podczas inicjalizacji bazy danych'
        })
      }
    } catch (error) {
      setInitResult({
        success: false,
        message: `Błąd komunikacji z serwerem: ${error instanceof Error ? error.message : 'Nieznany błąd'}`
      })
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Uruchomienie</h1>
        <p className="text-muted-foreground">
          Narzędzia do inicjalizacji i konfiguracji systemu
        </p>
      </div>

      <div className="grid gap-6">
        {/* Inicjalizacja Bazy Danych */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Inicjalizacja Bazy Danych
            </CardTitle>
            <CardDescription>
              Uruchom skrypt inicjalizacji bazy danych PostgreSQL ze schema i danymi testowymi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleInitializeDatabase}
                disabled={isInitializing}
                className="w-auto"
              >
                {isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inicjalizacja w toku...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Uruchom Inicjalizację
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <Database className="mr-1 h-3 w-3" />
                  PostgreSQL
                </Badge>
                <Badge variant="outline">
                  <Info className="mr-1 h-3 w-3" />
                  Interoperacyjny
                </Badge>
              </div>
            </div>

            {/* Ostrzeżenie */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Uwaga:</strong> Ten skrypt utworzy tabele i doda dane testowe. 
                Użyj parametru <code>--force</code> jeśli chcesz odtworzyć istniejące tabele.
              </AlertDescription>
            </Alert>

            {/* Wynik operacji */}
            {initResult && (
              <Alert className={initResult.success ? "border-green-500" : "border-red-500"}>
                {initResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <div className="space-y-2">
                    <p className={initResult.success ? "text-green-700" : "text-red-700"}>
                      {initResult.message}
                    </p>
                    
                    {initResult.details && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <strong>Szczegóły:</strong>
                        <pre className="mt-1 text-xs overflow-x-auto">
                          {JSON.stringify(initResult.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Przyszłe narzędzia */}
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Inne Narzędzia Uruchomienia
            </CardTitle>
            <CardDescription>
              Dodatkowe narzędzia do konfiguracji systemu (będą dostępne w przyszłości)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Migracja danych z poprzedniej wersji</p>
              <p>• Konfiguracja OPAL Server/Client</p>
              <p>• Weryfikacja połączeń między komponentami</p>
              <p>• Backup i restore bazy danych</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 