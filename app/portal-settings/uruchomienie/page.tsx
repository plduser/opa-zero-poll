"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Loader2, Database, Play, CheckCircle, XCircle, Info, 
  Building, Users, Briefcase, Building2, Calculator, Globe 
} from "lucide-react"

interface SeedResult {
  success: boolean
  message: string
  details?: any
}

interface TenantSeedState {
  [key: string]: {
    isSeeding: boolean
    result: SeedResult | null
  }
}

export default function UruchomieniePage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initResult, setInitResult] = useState<SeedResult | null>(null)
  const [tenantSeeds, setTenantSeeds] = useState<TenantSeedState>({})

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

  const handleSeedTenant = async (tenantType: string, tenantId: string) => {
    setTenantSeeds(prev => ({
      ...prev,
      [tenantType]: { isSeeding: true, result: null }
    }))

    try {
      const response = await fetch('/api/admin/seed-tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenantType, tenantId })
      })

      const result = await response.json()

      setTenantSeeds(prev => ({
        ...prev,
        [tenantType]: {
          isSeeding: false,
          result: {
            success: response.ok,
            message: result.message || (response.ok ? 'Tenant został pomyślnie utworzony' : 'Błąd podczas tworzenia tenanta'),
            details: result.details
          }
        }
      }))
    } catch (error) {
      setTenantSeeds(prev => ({
        ...prev,
        [tenantType]: {
          isSeeding: false,
          result: {
            success: false,
            message: `Błąd komunikacji z serwerem: ${error instanceof Error ? error.message : 'Nieznany błąd'}`
          }
        }
      }))
    }
  }

  const tenantConfigs = [
    {
      type: 'mikro',
      id: 'tenant_mikro',
      title: 'MIKRO Firma',
      description: 'Jednoosobowa działalność gospodarcza',
      icon: Building,
      stats: '1 firma • 1 użytkownik',
      details: 'Mikroprzedsiębiorca z podstawowymi aplikacjami księgowymi',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      type: 'mala',
      id: 'tenant_mala',
      title: 'MAŁA Firma',
      description: 'Małe przedsiębiorstwo z zespołem',
      icon: Users,
      stats: '1 firma • 10 użytkowników',
      details: 'Różne funkcje: księgowość, kadry, sprzedaż, administracja',
      color: 'bg-green-50 border-green-200'
    },
    {
      type: 'duza',
      id: 'tenant_duza',
      title: 'DUŻA Firma',
      description: 'Duże przedsiębiorstwo z zespołami funkcjonalnymi',
      icon: Building2,
      stats: '1 firma • 50 użytkowników',
      details: 'Zespoły: Księgowość, Kadry, Sales&Marketing, Zarząd',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      type: 'grupa',
      id: 'tenant_grupa',
      title: 'GRUPA Kapitałowa',
      description: 'Holding z centrum usług wspólnych',
      icon: Globe,
      stats: '5 firm • 60 użytkowników',
      details: 'CUW + spółki córki z dedykowanymi zespołami zarządczymi',
      color: 'bg-orange-50 border-orange-200'
    },
    {
      type: 'biuro_male',
      id: 'tenant_biuro_male',
      title: 'MAŁE Biuro Rachunkowe',
      description: 'Zewnętrzne biuro księgowe',
      icon: Calculator,
      stats: '40 firm • 7 użytkowników',
      details: 'Zespoły specjalistyczne: Zarząd, Księgowi, HR',
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      type: 'biuro_duze',
      id: 'tenant_biuro_duze',
      title: 'DUŻE Biuro Rachunkowe',
      description: 'Duże biuro obsługujące mikro firmy i spółki',
      icon: Briefcase,
      stats: '200 firm • 30 użytkowników',
      details: '150 mikro firm + 50 spółek, 5 zespołów specjalistycznych',
      color: 'bg-red-50 border-red-200'
    }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Uruchomienie</h1>
        <p className="text-muted-foreground">
          Narzędzia do inicjalizacji i konfiguracji systemu
        </p>
      </div>

      {/* Alert o stanie funkcji */}
      <Alert className="border-yellow-200 bg-yellow-50">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>🚧 Funkcja w rozwoju:</strong> Seedowanie tenantów jest częściowo zaimplementowane. 
          Niektóre typy tenantów mogą wymagać dodatkowych skryptów Python do pełnej konfiguracji 
          (np. <code>setup_tenant_biuro_duze_infrastructure.py</code>). 
          Zobacz dokumentację w <code>docs/SEED-TENANT-PRD.md</code> dla szczegółów.
        </AlertDescription>
      </Alert>

      {/* ETAP 1: Inicjalizacja podstawowa */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Etap 1: Inicjalizacja Podstawowa</h2>
          <p className="text-sm text-muted-foreground">
            Utwórz podstawową strukturę bazy danych i dane inicjalne (tenant125 - Symfonia)
          </p>
        </div>

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
                  Bazowy seed
                </Badge>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Uwaga:</strong> Ten skrypt utworzy tabele i doda dane testowe. 
                Użyj parametru <code>--force</code> jeśli chcesz odtworzyć istniejące tabele.
              </AlertDescription>
            </Alert>

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
      </div>

      <Separator />

      {/* ETAP 2: Seedowanie tenantów biznesowych */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Etap 2: Seedowanie Tenantów Biznesowych</h2>
          <p className="text-sm text-muted-foreground">
            Utwórz testowe tenanci odzwierciedlające różne typy organizacji (każdy można seedować niezależnie)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tenantConfigs.map((config) => {
            const seedState = tenantSeeds[config.type]
            const isSeeding = seedState?.isSeeding || false
            const result = seedState?.result

            return (
              <Card key={config.type} className={`${config.color} transition-all hover:shadow-md`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <config.icon className="h-5 w-5" />
                    {config.title}
                  </CardTitle>
                  <CardDescription>
                    {config.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {config.stats}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config.details}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleSeedTenant(config.type, config.id)}
                    disabled={isSeeding}
                    className="w-full"
                    variant="outline"
                  >
                    {isSeeding ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Seedowanie...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Utwórz {config.title}
                      </>
                    )}
                  </Button>

                  {result && (
                    <Alert className={`${result.success ? "border-green-500" : "border-red-500"} mt-2`}>
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription>
                        <p className={`text-xs ${result.success ? "text-green-700" : "text-red-700"}`}>
                          {result.message}
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Przyszłe narzędzia */}
      <Separator />
      
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
  )
} 