"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  Server,
  Activity,
  Download,
  TestTube,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  Save,
  RotateCcw
} from "lucide-react"
import { policyAPI } from "@/lib/api"

interface OpalConfig {
  serverUrl: string
  clientUrl: string
  healthCheckInterval: number
  connectionTimeout: number
}

interface StatusHistoryEntry {
  timestamp: string
  serverStatus: 'online' | 'offline'
  clientStatus: 'online' | 'offline'
  serverResponseTime?: number
  clientResponseTime?: number
  error?: string
}

interface LogEntry {
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
  source: 'server' | 'client' | 'system'
}

const DEFAULT_CONFIG: OpalConfig = {
  serverUrl: 'http://localhost:7002',
  clientUrl: 'http://localhost:7001',
  healthCheckInterval: 30,
  connectionTimeout: 5000
}

export function SettingsTab() {
  const [config, setConfig] = useState<OpalConfig>(DEFAULT_CONFIG)
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [lastTestResult, setLastTestResult] = useState<{
    server?: { status: string; responseTime?: number; error?: string }
    client?: { status: string; responseTime?: number; error?: string }
  }>({})
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all')
  const [logSearch, setLogSearch] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)

  // Dodawanie wpisu do logów
  const addLog = (level: LogEntry['level'], source: LogEntry['source'], message: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message
    }
    
    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 1000) // Ograniczenie do 1000 wpisów
      localStorage.setItem('opal-logs', JSON.stringify(updated))
      return updated
    })
  }

  // Ładowanie konfiguracji z localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('opal-config')
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig))
      } catch (error) {
        console.error('Błąd podczas ładowania konfiguracji:', error)
        addLog('error', 'system', 'Błąd podczas ładowania konfiguracji z localStorage')
      }
    }

    const savedHistory = localStorage.getItem('opal-status-history')
    if (savedHistory) {
      try {
        setStatusHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Błąd podczas ładowania historii:', error)
      }
    }

    const savedLogs = localStorage.getItem('opal-logs')
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs))
      } catch (error) {
        console.error('Błąd podczas ładowania logów:', error)
      }
    }
  }, [])

  // Zapisywanie konfiguracji do localStorage
  const saveConfig = () => {
    try {
      localStorage.setItem('opal-config', JSON.stringify(config))
      addLog('info', 'system', 'Konfiguracja została zapisana')
    } catch (error) {
      console.error('Błąd podczas zapisywania konfiguracji:', error)
      addLog('error', 'system', 'Błąd podczas zapisywania konfiguracji')
    }
  }

  // Resetowanie konfiguracji do domyślnej
  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG)
    addLog('info', 'system', 'Konfiguracja została zresetowana do wartości domyślnych')
  }

  // Dodawanie wpisu do historii statusu
  const addStatusHistory = (entry: Omit<StatusHistoryEntry, 'timestamp'>) => {
    const newEntry: StatusHistoryEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    }
    
    setStatusHistory(prev => {
      const updated = [newEntry, ...prev].slice(0, 100) // Ograniczenie do 100 wpisów
      localStorage.setItem('opal-status-history', JSON.stringify(updated))
      return updated
    })
  }

  // Testowanie połączenia
  const testConnection = async () => {
    setIsTestingConnection(true)
    addLog('info', 'system', 'Rozpoczęcie testu połączenia...')

    try {
      const startTime = Date.now()
      
      // Test OPAL Server
      let serverResult: { status: string; responseTime?: number; error?: string } = { status: 'offline' }
      try {
        const serverResponse = await policyAPI.healthCheckOpalServer()
        const serverResponseTime = Date.now() - startTime
        serverResult = {
          status: serverResponse.status === 'healthy' ? 'online' : 'offline',
          responseTime: serverResponseTime
        }
        addLog('info', 'server', `OPAL Server odpowiedział w ${serverResponseTime}ms`)
      } catch (error) {
        serverResult = {
          status: 'offline',
          error: error instanceof Error ? error.message : 'Nieznany błąd'
        }
        addLog('error', 'server', `Błąd połączenia z OPAL Server: ${serverResult.error}`)
      }

      // Test OPAL Client
      let clientResult: { status: string; responseTime?: number; error?: string } = { status: 'offline' }
      try {
        const clientStartTime = Date.now()
        const clientResponse = await policyAPI.healthCheckOpalClients()
        const clientResponseTime = Date.now() - clientStartTime
        clientResult = {
          status: clientResponse.status === 'healthy' ? 'online' : 'offline',
          responseTime: clientResponseTime
        }
        addLog('info', 'client', `OPAL Client odpowiedział w ${clientResponseTime}ms`)
      } catch (error) {
        clientResult = {
          status: 'offline',
          error: error instanceof Error ? error.message : 'Nieznany błąd'
        }
        addLog('error', 'client', `Błąd połączenia z OPAL Client: ${clientResult.error}`)
      }

      setLastTestResult({ server: serverResult, client: clientResult })

      // Dodanie do historii
      addStatusHistory({
        serverStatus: serverResult.status === 'online' ? 'online' : 'offline',
        clientStatus: clientResult.status === 'online' ? 'online' : 'offline',
        serverResponseTime: serverResult.responseTime,
        clientResponseTime: clientResult.responseTime,
        error: serverResult.error || clientResult.error
      })

    } catch (error) {
      addLog('error', 'system', `Błąd podczas testu połączenia: ${error instanceof Error ? error.message : 'Nieznany błąd'}`)
    } finally {
      setIsTestingConnection(false)
    }
  }

  // Filtrowanie logów
  const filteredLogs = logs.filter(log => {
    const matchesFilter = logFilter === 'all' || log.level === logFilter
    const matchesSearch = logSearch === '' || 
      log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.source.toLowerCase().includes(logSearch.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Czyszczenie logów
  const clearLogs = () => {
    setLogs([])
    localStorage.removeItem('opal-logs')
    addLog('info', 'system', 'Logi zostały wyczyszczone')
  }

  // Eksport logów
  const exportLogs = (format: 'json' | 'csv') => {
    try {
      let content: string
      let filename: string
      let mimeType: string

      if (format === 'json') {
        content = JSON.stringify({
          exportDate: new Date().toISOString(),
          config,
          logs: filteredLogs,
          statusHistory
        }, null, 2)
        filename = `opal-logs-${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
      } else {
        const csvHeader = 'Timestamp,Level,Source,Message\n'
        const csvRows = filteredLogs.map(log => 
          `"${log.timestamp}","${log.level}","${log.source}","${log.message.replace(/"/g, '""')}"`
        ).join('\n')
        content = csvHeader + csvRows
        filename = `opal-logs-${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      addLog('info', 'system', `Logi zostały wyeksportowane jako ${format.toUpperCase()}`)
    } catch (error) {
      addLog('error', 'system', `Błąd podczas eksportu logów: ${error instanceof Error ? error.message : 'Nieznany błąd'}`)
    }
  }

  // Obliczanie uptime
  const calculateUptime = () => {
    if (statusHistory.length === 0) return { server: 0, client: 0 }

    const last24h = statusHistory.filter(entry => 
      new Date(entry.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    )

    if (last24h.length === 0) return { server: 0, client: 0 }

    const serverUptime = (last24h.filter(entry => entry.serverStatus === 'online').length / last24h.length) * 100
    const clientUptime = (last24h.filter(entry => entry.clientStatus === 'online').length / last24h.length) * 100

    return { server: Math.round(serverUptime), client: Math.round(clientUptime) }
  }

  const uptime = calculateUptime()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Ustawienia systemu OPAL</h2>
      </div>

      <Tabs defaultValue="configuration" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="configuration">Konfiguracja</TabsTrigger>
          <TabsTrigger value="status">Historia statusu</TabsTrigger>
          <TabsTrigger value="logs">Logi połączeń</TabsTrigger>
          <TabsTrigger value="testing">Narzędzia testowe</TabsTrigger>
          <TabsTrigger value="export">Eksport danych</TabsTrigger>
        </TabsList>

        {/* Konfiguracja OPAL */}
        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Konfiguracja endpointów OPAL
              </CardTitle>
              <CardDescription>
                Skonfiguruj adresy URL dla OPAL Server i Client oraz parametry połączenia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serverUrl">OPAL Server URL</Label>
                  <Input
                    id="serverUrl"
                    value={config.serverUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, serverUrl: e.target.value }))}
                    placeholder="http://localhost:7002"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientUrl">OPAL Client URL</Label>
                  <Input
                    id="clientUrl"
                    value={config.clientUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, clientUrl: e.target.value }))}
                    placeholder="http://localhost:7001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interval">Interwał sprawdzania (sekundy)</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="5"
                    max="300"
                    value={config.healthCheckInterval}
                    onChange={(e) => setConfig(prev => ({ ...prev, healthCheckInterval: parseInt(e.target.value) || 30 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout połączenia (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="1000"
                    max="30000"
                    value={config.connectionTimeout}
                    onChange={(e) => setConfig(prev => ({ ...prev, connectionTimeout: parseInt(e.target.value) || 5000 }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveConfig} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Zapisz konfigurację
                </Button>
                <Button variant="outline" onClick={resetConfig} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Resetuj do domyślnych
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historia statusu */}
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Historia statusu systemu
              </CardTitle>
              <CardDescription>
                Przegląd statusu OPAL Server i Client z ostatnich 24 godzin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">OPAL Server Uptime</p>
                      <p className="text-2xl font-bold text-green-900">{uptime.server}%</p>
                    </div>
                    <Server className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">OPAL Client Uptime</p>
                      <p className="text-2xl font-bold text-blue-900">{uptime.client}%</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Ostatnie zdarzenia</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {statusHistory.slice(0, 20).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(entry.timestamp).toLocaleString('pl-PL')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={entry.serverStatus === 'online' ? 'default' : 'destructive'}>
                          Server: {entry.serverStatus}
                        </Badge>
                        <Badge variant={entry.clientStatus === 'online' ? 'default' : 'destructive'}>
                          Client: {entry.clientStatus}
                        </Badge>
                        {entry.serverResponseTime && (
                          <span className="text-xs text-gray-500">{entry.serverResponseTime}ms</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {statusHistory.length === 0 && (
                    <p className="text-center text-gray-500 py-4">Brak danych historycznych</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logi połączeń */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Logi połączeń
              </CardTitle>
              <CardDescription>
                Szczegółowe logi połączeń z systemem OPAL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Szukaj w logach..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={logFilter} onValueChange={(value: any) => setLogFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtruj poziom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Ostrzeżenia</SelectItem>
                    <SelectItem value="error">Błędy</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={autoScroll}
                    onCheckedChange={setAutoScroll}
                  />
                  <Label>Auto-scroll</Label>
                </div>
                <Button variant="outline" onClick={clearLogs} className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Wyczyść
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-1 bg-gray-50 p-4 rounded-lg font-mono text-sm">
                {filteredLogs.map((log, index) => (
                  <div key={index} className={`flex items-start gap-2 ${
                    log.level === 'error' ? 'text-red-600' :
                    log.level === 'warning' ? 'text-yellow-600' :
                    'text-gray-700'
                  }`}>
                    <span className="text-gray-500 text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString('pl-PL')}
                    </span>
                    <Badge variant={
                      log.level === 'error' ? 'destructive' :
                      log.level === 'warning' ? 'secondary' :
                      'default'
                    } className="text-xs">
                      {log.level.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {log.source}
                    </Badge>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Brak logów do wyświetlenia</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Narzędzia testowe */}
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Narzędzia testowe
              </CardTitle>
              <CardDescription>
                Manualne testowanie połączeń i walidacja endpointów
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={testConnection} 
                  disabled={isTestingConnection}
                  className="flex items-center gap-2"
                >
                  {isTestingConnection ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                  {isTestingConnection ? 'Testowanie...' : 'Testuj połączenie'}
                </Button>
              </div>

              {Object.keys(lastTestResult).length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Wyniki ostatniego testu</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lastTestResult.server && (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Server className="h-4 w-4" />
                          <span className="font-medium">OPAL Server</span>
                          {lastTestResult.server.status === 'online' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Status: <Badge variant={lastTestResult.server.status === 'online' ? 'default' : 'destructive'}>
                            {lastTestResult.server.status}
                          </Badge>
                        </p>
                        {lastTestResult.server.responseTime && (
                          <p className="text-sm text-gray-600">
                            Czas odpowiedzi: {lastTestResult.server.responseTime}ms
                          </p>
                        )}
                        {lastTestResult.server.error && (
                          <p className="text-sm text-red-600">
                            Błąd: {lastTestResult.server.error}
                          </p>
                        )}
                      </div>
                    )}

                    {lastTestResult.client && (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4" />
                          <span className="font-medium">OPAL Client</span>
                          {lastTestResult.client.status === 'online' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Status: <Badge variant={lastTestResult.client.status === 'online' ? 'default' : 'destructive'}>
                            {lastTestResult.client.status}
                          </Badge>
                        </p>
                        {lastTestResult.client.responseTime && (
                          <p className="text-sm text-gray-600">
                            Czas odpowiedzi: {lastTestResult.client.responseTime}ms
                          </p>
                        )}
                        {lastTestResult.client.error && (
                          <p className="text-sm text-red-600">
                            Błąd: {lastTestResult.client.error}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Eksport danych */}
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Eksport danych systemu
              </CardTitle>
              <CardDescription>
                Eksportuj logi, konfigurację i historię statusu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Eksport logów</h4>
                  <p className="text-sm text-gray-600">
                    Eksportuj przefiltrowane logi w wybranym formacie
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => exportLogs('json')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      JSON
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => exportLogs('csv')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      CSV
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Statystyki</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Łączna liczba logów: {logs.length}</p>
                    <p>Przefiltrowane logi: {filteredLogs.length}</p>
                    <p>Historia statusu: {statusHistory.length} wpisów</p>
                    <p>Ostatni test: {lastTestResult.server || lastTestResult.client ? 'Dostępny' : 'Brak danych'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}