"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Server, 
  Users, 
  Clock, 
  Wifi, 
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"
import { policyAPI, SystemStatusResponse, HealthCheckResponse } from "@/lib/api"

interface SystemStatusProps {
  refreshInterval?: number // w sekundach, domyślnie 30
}

export function SystemStatus({ refreshInterval = 30 }: SystemStatusProps) {
  console.log('SystemStatus: Component rendering, refreshInterval:', refreshInterval)
  
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(true)

  const fetchSystemStatus = useCallback(async () => {
    try {
      console.log('SystemStatus: Starting to fetch system status...')
      setError(null)
      const status = await policyAPI.getSystemStatus()
      console.log('SystemStatus: Received status:', status)
      setSystemStatus(status)
      setLastRefresh(new Date())
      
      // Sprawdź czy jesteśmy w trybie development
      const anyHealthy = status.opalServer.status === 'healthy' || status.opaEngine.status === 'healthy'
      setIsDevelopmentMode(!anyHealthy)
    } catch (err) {
      console.error('SystemStatus: Failed to fetch system status:', err)
      setError(err instanceof Error ? err.message : 'Nieznany błąd')
      setIsDevelopmentMode(true) // Zakładamy development mode przy błędach
    } finally {
      console.log('SystemStatus: Finished fetching, setting loading to false')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log('SystemStatus: useEffect triggered, setting up fetch and interval')
    // Pierwsze pobranie danych
    fetchSystemStatus()

    // Ustawienie interwału odświeżania
    const interval = setInterval(fetchSystemStatus, refreshInterval * 1000)
    console.log('SystemStatus: Interval set for', refreshInterval, 'seconds')

    return () => {
      console.log('SystemStatus: Cleaning up interval')
      clearInterval(interval)
    }
  }, [refreshInterval, fetchSystemStatus])

  const getStatusIcon = (status: 'healthy' | 'unhealthy') => {
    return status === 'healthy' ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-red-600" />
    )
  }

  const getStatusBadge = (status: 'healthy' | 'unhealthy') => {
    return (
      <Badge 
        variant={status === 'healthy' ? 'secondary' : 'destructive'}
        className={status === 'healthy' ? 'bg-green-100 text-green-800 border-green-200' : ''}
      >
        {status === 'healthy' ? 'Działa' : 'Niedostępny'}
      </Badge>
    )
  }

  const getOverallStatusColor = (status: 'healthy' | 'degraded' | 'unhealthy') => {
    switch (status) {
      case 'healthy':
        return 'border-green-200 bg-green-50'
      case 'degraded':
        return 'border-yellow-200 bg-yellow-50'
      case 'unhealthy':
        return 'border-gray-200 bg-gray-50' // Zmienione z czerwonego na szary dla dev mode
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatResponseTime = (responseTime?: number) => {
    if (!responseTime) return 'N/A'
    return `${responseTime}ms`
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900">Status systemu</h3>
        </div>
        <div className="text-sm text-gray-500">Sprawdzanie statusu OPAL...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg border border-yellow-200 bg-yellow-50">
        <div className="flex items-center gap-3 mb-4">
          <Info className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-yellow-900">Status systemu (Development Mode)</h3>
        </div>
        <div className="text-sm text-yellow-700 mb-3">
          OPAL Server/Client niedostępne - tryb development. Policy Management działa z mock danymi.
        </div>
        <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded mb-3">
          Aby uruchomić pełny system OPAL:
          <br />1. Sprawdź czy kontenery Docker działają: <code>docker ps</code>
          <br />2. Uruchom ponownie OPAL: <code>docker-compose up opal-server opal-client</code>
        </div>
        <Button
          onClick={fetchSystemStatus}
          size="sm"
          variant="outline"
          className="text-yellow-600 border-yellow-300 hover:bg-yellow-100"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Sprawdź ponownie
        </Button>
      </div>
    )
  }

  if (!systemStatus) {
    return null
  }

  return (
    <div className={`bg-white p-6 rounded-lg border ${getOverallStatusColor(systemStatus.overallStatus)}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {systemStatus.overallStatus === 'healthy' ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : isDevelopmentMode ? (
            <Info className="h-5 w-5 text-gray-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            Status systemu {isDevelopmentMode && "(Dev Mode)"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={
            systemStatus.overallStatus === 'healthy' ? 'default' : 
            systemStatus.overallStatus === 'degraded' ? 'secondary' : 'secondary'
          }>
            {systemStatus.overallStatus === 'healthy' ? 'Wszystko działa' : 
             systemStatus.overallStatus === 'degraded' ? 'Częściowe problemy' : 
             isDevelopmentMode ? 'Development Mode' : 'Problemy'}
          </Badge>
          {lastRefresh && (
            <span className="text-xs text-gray-500">
              Ostatnie sprawdzenie: {formatTimestamp(lastRefresh.toISOString())}
            </span>
          )}
        </div>
      </div>

      {isDevelopmentMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <Info className="h-4 w-4" />
            <span className="font-medium">Tryb Development:</span>
          </div>
          <div className="text-blue-700 text-sm mt-1">
            Policy Management działa z mock danymi. Funkcje przeglądania i testowania policy są dostępne,
            ale połączenie z OPAL Server/Client jest niedostępne.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OPAL Server Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">OPAL Server</span>
            {getStatusIcon(systemStatus.opalServer.status)}
          </div>
          
          <div className="pl-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              {getStatusBadge(systemStatus.opalServer.status)}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Czas odpowiedzi:</span>
              <span className="text-sm text-gray-900">
                {formatResponseTime(systemStatus.opalServer.responseTime)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ostatnie sprawdzenie:</span>
              <span className="text-sm text-gray-900">
                {formatTimestamp(systemStatus.opalServer.timestamp)}
              </span>
            </div>
            
            {systemStatus.opalServer.error && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                {systemStatus.opalServer.error}
              </div>
            )}
          </div>
        </div>

        {/* OPA Engine Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">OPA Engine</span>
            {getStatusIcon(systemStatus.opaEngine.status)}
          </div>
          
          <div className="pl-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              {getStatusBadge(systemStatus.opaEngine.status)}
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Czas odpowiedzi:</span>
              <span className="text-sm text-gray-900">
                {formatResponseTime(systemStatus.opaEngine.responseTime)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ostatnie sprawdzenie:</span>
              <span className="text-sm text-gray-900">
                {formatTimestamp(systemStatus.opaEngine.timestamp)}
              </span>
            </div>
            
            {systemStatus.opaEngine.error && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                {systemStatus.opaEngine.error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual refresh button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Button
          onClick={fetchSystemStatus}
          size="sm"
          variant="outline"
          disabled={loading}
          className="text-gray-600"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Odśwież status
        </Button>
      </div>
    </div>
  )
} 