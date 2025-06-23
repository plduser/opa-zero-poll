"use client"

import { useState } from "react"
import { Shield, Key, Lock, Eye, Settings, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
export default function SecuritySettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [auditLogEnabled, setAuditLogEnabled] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState("60")

  return (
    <div className="space-y-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Bezpieczeństwo Portalu</h1>
          </div>
          <p className="text-gray-600">
            Zarządzaj ustawieniami bezpieczeństwa dla całego portalu Symfonia
          </p>
        </div>

        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="authentication">Uwierzytelnianie</TabsTrigger>
            <TabsTrigger value="audit">Logi Audytu</TabsTrigger>
            <TabsTrigger value="sessions">Sesje</TabsTrigger>
            <TabsTrigger value="policies">Polityki</TabsTrigger>
          </TabsList>

          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Uwierzytelnianie dwuskładnikowe (2FA)
                </CardTitle>
                <CardDescription>
                  Włącz dodatkowe zabezpieczenie dla wszystkich użytkowników portalu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="2fa">Wymagaj 2FA dla wszystkich użytkowników</Label>
                    <p className="text-sm text-gray-500">
                      Użytkownicy będą musieli skonfigurować aplikację autentykującą
                    </p>
                  </div>
                  <Switch 
                    id="2fa"
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>
                
                {twoFactorEnabled && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Włączenie 2FA wymusi na wszystkich użytkownikach skonfigurowanie aplikacji autentykującej przy następnym logowaniu.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Polityki haseł</CardTitle>
                <CardDescription>
                  Ustaw wymagania dotyczące złożoności haseł
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-length">Minimalna długość hasła</Label>
                    <Input id="min-length" type="number" defaultValue="8" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-history">Historia haseł</Label>
                    <Input id="password-history" type="number" defaultValue="5" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="require-uppercase" defaultChecked />
                    <Label htmlFor="require-uppercase">Wymagaj wielkich liter</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="require-numbers" defaultChecked />
                    <Label htmlFor="require-numbers">Wymagaj cyfr</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="require-special" defaultChecked />
                    <Label htmlFor="require-special">Wymagaj znaków specjalnych</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Logowanie zdarzeń
                </CardTitle>
                <CardDescription>
                  Konfiguruj rejestrowanie działań w systemie
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="audit-log">Włącz logi audytu</Label>
                    <p className="text-sm text-gray-500">
                      Rejestruj wszystkie działania użytkowników w systemie
                    </p>
                  </div>
                  <Switch 
                    id="audit-log"
                    checked={auditLogEnabled}
                    onCheckedChange={setAuditLogEnabled}
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="log-logins" defaultChecked />
                    <Label htmlFor="log-logins">Logowania i wylogowania</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="log-data-access" defaultChecked />
                    <Label htmlFor="log-data-access">Dostęp do danych</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="log-admin-actions" defaultChecked />
                    <Label htmlFor="log-admin-actions">Działania administracyjne</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="log-failed-attempts" defaultChecked />
                    <Label htmlFor="log-failed-attempts">Nieudane próby logowania</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Zarządzanie sesjami
                </CardTitle>
                <CardDescription>
                  Kontroluj jak długo użytkownicy pozostają zalogowani
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Timeout sesji (minuty)</Label>
                  <Input 
                    id="session-timeout" 
                    type="number" 
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    Sesje będą automatycznie wygasać po okresie nieaktywności
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="concurrent-sessions" />
                  <Label htmlFor="concurrent-sessions">Ogranicz do jednej sesji na użytkownika</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Polityki bezpieczeństwa
                </CardTitle>
                <CardDescription>
                  Zaawansowane ustawienia polityk bezpieczeństwa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="ip-whitelist" />
                    <Label htmlFor="ip-whitelist">Ograniczenia IP (whitelist)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="geo-blocking" />
                    <Label htmlFor="geo-blocking">Blokowanie geolokacyjne</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="device-trust" defaultChecked />
                    <Label htmlFor="device-trust">Zarządzanie zaufanymi urządzeniami</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-8">
          <Button variant="outline">Anuluj</Button>
          <Button>Zapisz ustawienia</Button>
        </div>
    </div>
  )
}