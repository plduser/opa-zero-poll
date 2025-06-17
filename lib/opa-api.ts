// OPA API - komunikacja z Open Policy Agent przez Next.js API proxy
const OPA_PROXY_URL = '/api/opa'

export interface OPAInput {
  user: string
  tenant: string
  action: string
  resource?: string
}

export interface OPADecision {
  allow: boolean
  user: string
  action: string
  resource?: string
  user_roles: string[]
  reason: string
}

export interface OPAResponse {
  result: OPADecision
}

// Debug state dla konsoli OPA
export interface OPADebugEntry {
  timestamp: string
  input: OPAInput
  response: OPAResponse
  duration: number
}

// Stan debugowania OPA
let opaDebugEntries: OPADebugEntry[] = []
let debugCallbacks: ((entries: OPADebugEntry[]) => void)[] = []

// Funkcja sprawdzająca uprawnienia w OPA dla KSEF
export async function checkKSEFPermission(input: OPAInput): Promise<OPADecision> {
  const startTime = Date.now()
  
  try {
    console.log('🔍 OPA Request:', input)
    
    const response = await fetch(OPA_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: input
      }),
    })

    if (!response.ok) {
      throw new Error(`OPA HTTP error! status: ${response.status}`)
    }

    const data: OPAResponse = await response.json()
    const duration = Date.now() - startTime
    
    console.log('✅ OPA Response:', data.result)
    
    // Dodaj do debug log
    const debugEntry: OPADebugEntry = {
      timestamp: new Date().toISOString(),
      input,
      response: data,
      duration
    }
    
    opaDebugEntries.push(debugEntry)
    
    // Ogranicz historie do ostatnich 50 wpisów
    if (opaDebugEntries.length > 50) {
      opaDebugEntries = opaDebugEntries.slice(-50)
    }
    
    // Powiadom callback'i o nowym wpisie
    debugCallbacks.forEach(callback => callback(opaDebugEntries))
    
    return data.result
  } catch (error) {
    console.error('❌ OPA Error:', error)
    
    const duration = Date.now() - startTime
    const errorEntry: OPADebugEntry = {
      timestamp: new Date().toISOString(),
      input,
      response: {
        result: {
          allow: false,
          user: input.user,
          action: input.action,
          resource: input.resource,
          user_roles: [],
          reason: `OPA Error: ${error}`
        }
      },
      duration
    }
    
    opaDebugEntries.push(errorEntry)
    debugCallbacks.forEach(callback => callback(opaDebugEntries))
    
    // W przypadku błędu OPA, odrzucamy dostęp
    
          return {
        allow: false,
        user: input.user,
        action: input.action,
        resource: input.resource,
        user_roles: [],
        reason: `OPA connection error: ${error}`
      }
  }
}

// Funkcje pomocnicze dla konkretnych uprawnień KSEF
export async function canViewPurchaseInvoices(userId: string, tenantId: string = "tenant1"): Promise<boolean> {
  console.log(`[canViewPurchaseInvoices] Sprawdzanie dla userId: ${userId}`)
  const decision = await checkKSEFPermission({
    user: userId,
    tenant: tenantId,
    action: "view_invoices_purchase"
  })
  console.log(`[canViewPurchaseInvoices] Decyzja OPA:`, decision)
  const result = decision?.allow || false
  console.log(`[canViewPurchaseInvoices] Zwracany rezultat: ${result}`)
  return result
}

export async function canViewSalesInvoices(userId: string, tenantId: string = "tenant1"): Promise<boolean> {
  console.log(`[canViewSalesInvoices] Sprawdzanie dla userId: ${userId}`)
  const decision = await checkKSEFPermission({
    user: userId,
    tenant: tenantId,
    action: "view_invoices_sales"
  })
  console.log(`[canViewSalesInvoices] Decyzja OPA:`, decision)
  const result = decision?.allow || false
  console.log(`[canViewSalesInvoices] Zwracany rezultat: ${result}`)
  return result
}

export async function canExportToSymfonia(userId: string, tenantId: string = "tenant1"): Promise<boolean> {
  const decision = await checkKSEFPermission({
    user: userId,
    tenant: tenantId,
    action: "export_to_symfonia"
  })
  return decision?.allow || false
}

// Debug funkcje
export function getOPADebugEntries(): OPADebugEntry[] {
  return [...opaDebugEntries]
}

export function clearOPADebugEntries(): void {
  opaDebugEntries = []
  debugCallbacks.forEach(callback => callback(opaDebugEntries))
}

export function subscribeToOPADebug(callback: (entries: OPADebugEntry[]) => void): () => void {
  debugCallbacks.push(callback)
  
  // Zwróć funkcję do usunięcia subskrypcji
  return () => {
    const index = debugCallbacks.indexOf(callback)
    if (index > -1) {
      debugCallbacks.splice(index, 1)
    }
  }
}

// Funkcja do kopiowania debug informacji do schowka
export function copyOPADebugToClipboard(): string {
  const debugData = {
    timestamp: new Date().toISOString(),
    entries: opaDebugEntries,
    summary: {
      total_requests: opaDebugEntries.length,
      allowed_requests: opaDebugEntries.filter(e => e.response.result.allow).length,
      denied_requests: opaDebugEntries.filter(e => !e.response.result.allow).length,
      average_duration: opaDebugEntries.length > 0 
        ? Math.round(opaDebugEntries.reduce((sum, e) => sum + e.duration, 0) / opaDebugEntries.length)
        : 0
    }
  }
  
  const jsonData = JSON.stringify(debugData, null, 2)
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(jsonData)
  }
  
  return jsonData
} 