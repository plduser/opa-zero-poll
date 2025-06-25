#!/bin/bash

# OPA Zero Poll - Skrypt weryfikacji
# Autor: OPA Zero Poll Team  
# Opis: Sprawdza czy wszystkie komponenty POC działają poprawnie

set -e

# Kolory dla output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Flagi i opcje
VERBOSE=false
DETAILED=false
TEST_TENANT=false
QUICK=false

# Liczniki wyników
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Funkcje pomocnicze
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

log_test() {
    echo -e "${CYAN}🧪 Test: $1${NC}"
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
}

# Sprawdź argumenty
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --detailed|-d)
                DETAILED=true
                shift
                ;;
            --test-tenant|-t)
                TEST_TENANT=true
                shift
                ;;
            --quick|-q)
                QUICK=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Nieznana opcja: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

show_help() {
    echo "OPA Zero Poll - Skrypt weryfikacji"
    echo ""
    echo "Użycie: $0 [OPCJE]"
    echo ""
    echo "Opcje:"
    echo "  -v, --verbose     Szczegółowy output"
    echo "  -d, --detailed    Szczegółowa diagnostyka"
    echo "  -t, --test-tenant Utwórz i przetestuj tenant"
    echo "  -q, --quick       Szybka weryfikacja (tylko health checks)"
    echo "  -h, --help        Pokaż tę pomoc"
    echo ""
    echo "Przykłady:"
    echo "  $0                    # Podstawowa weryfikacja"
    echo "  $0 --detailed         # Szczegółowa diagnostyka"
    echo "  $0 --test-tenant      # Z testowaniem tenant"
    echo "  $0 --quick            # Szybka weryfikacja"
}

# Test HTTP endpoint
test_endpoint() {
    local url="$1"
    local name="$2"
    local expected_status="${3:-200}"
    
    log_test "$name ($url)"
    
    if [ "$VERBOSE" = true ]; then
        echo "   Sprawdzanie: $url"
    fi
    
    local response=$(curl -s -w "%{http_code}" -o /dev/null "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        log_success "$name działa (HTTP $response)"
        return 0
    else
        log_error "$name nie działa (HTTP $response, oczekiwano $expected_status)"
        return 1
    fi
}

# Test JSON endpoint
test_json_endpoint() {
    local url="$1"
    local name="$2"
    local expected_field="$3"
    
    log_test "$name JSON API ($url)"
    
    local response=$(curl -s "$url" 2>/dev/null || echo "{}")
    
    if [ "$VERBOSE" = true ]; then
        echo "   Response: $response"
    fi
    
    if echo "$response" | jq -e ".$expected_field" > /dev/null 2>&1; then
        log_success "$name JSON API działa"
        return 0
    else
        log_error "$name JSON API nie zwraca poprawnych danych"
        if [ "$DETAILED" = true ]; then
            echo "   Otrzymana odpowiedź: $response"
        fi
        return 1
    fi
}

# Sprawdź status kontenerów
check_containers() {
    echo ""
    echo "🐳 Sprawdzanie kontenerów Docker..."
    echo "=================================="
    
    local containers=("postgres-db" "data-provider-api" "provisioning-api" "opa-standalone" "redis-broadcast" "opal-server" "opal-client")
    
    for container in "${containers[@]}"; do
        log_test "Kontener $container"
        
        local status=$(docker-compose ps --format "table {{.Service}}\t{{.Status}}" | grep "$container" | awk '{print $2}' 2>/dev/null || echo "Not Found")
        
        if [[ "$status" =~ "Up" ]]; then
            log_success "Kontener $container uruchomiony"
        else
            log_error "Kontener $container nie działa (Status: $status)"
        fi
    done
    
    if [ "$DETAILED" = true ]; then
        echo ""
        echo "📊 Szczegółowy status kontenerów:"
        docker-compose ps
    fi
}

# Sprawdź health checks
check_health_endpoints() {
    echo ""
    echo "🏥 Sprawdzanie Health Checks..."
    echo "==============================="
    
    test_endpoint "http://localhost:8110/health" "Data Provider API"
    test_endpoint "http://localhost:8010/health" "Provisioning API"
    test_endpoint "http://localhost:8181/health" "OPA Engine"
    test_endpoint "http://localhost:7002/healthcheck" "OPAL Server"
    test_endpoint "http://localhost:7000/healthcheck" "OPAL Client"
    
    if [ "$QUICK" = true ]; then
        return 0
    fi
}

# Sprawdź dostępność bazy danych
check_database() {
    echo ""
    echo "🗄️  Sprawdzanie bazy danych..."
    echo "============================="
    
    log_test "Połączenie z PostgreSQL"
    
    if docker exec postgres-db psql -U opa_user -d opa_zero_poll -c "SELECT 1" > /dev/null 2>&1; then
        log_success "PostgreSQL działa"
    else
        log_error "PostgreSQL nie działa"
        return 1
    fi
    
    if [ "$DETAILED" = true ]; then
        log_test "Sprawdzanie struktur tabel"
        
        local table_count=$(docker exec postgres-db psql -U opa_user -d opa_zero_poll -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null | tr -d ' ')
        
        if [ "$table_count" -gt 10 ]; then
            log_success "Baza danych ma $table_count tabel"
        else
            log_error "Baza danych ma tylko $table_count tabel (oczekiwano >10)"
        fi
    fi
}

# Sprawdź API endpoints
check_api_endpoints() {
    echo ""
    echo "🌐 Sprawdzanie API Endpoints..."
    echo "==============================="
    
    # Basic API tests
    test_endpoint "http://localhost:8110/tenants" "Data Provider - Lista tenant"
    test_endpoint "http://localhost:8010/tenants" "Provisioning - Lista tenant"
    test_endpoint "http://localhost:8181/v1/data" "OPA - Data endpoint"
    
    if [ "$DETAILED" = true ]; then
        echo ""
        echo "📋 Szczegółowe API responses:"
        
        log_info "Data Provider tenants:"
        curl -s "http://localhost:8110/tenants" 2>/dev/null | jq . 2>/dev/null || echo "  (Brak danych lub błąd JSON)"
        
        log_info "OPA data structure:"
        curl -s "http://localhost:8181/v1/data" 2>/dev/null | jq . 2>/dev/null || echo "  (Brak danych lub błąd JSON)"
    fi
}

# Test OPAL komunikacji
check_opal_communication() {
    echo ""
    echo "🔄 Sprawdzanie komunikacji OPAL..."
    echo "=================================="
    
    log_test "OPAL Server policy sync"
    
    # Sprawdź czy OPAL Server odpowiada
    if curl -s -f "http://localhost:7002/policy" > /dev/null 2>&1; then
        log_success "OPAL Server policy endpoint działa"
    else
        log_error "OPAL Server policy endpoint nie działa"
    fi
    
    log_test "OPAL Client status"
    
    if curl -s -f "http://localhost:7000/policy/data" > /dev/null 2>&1; then
        log_success "OPAL Client data endpoint działa"
    else
        log_error "OPAL Client data endpoint nie działa"
    fi
    
    if [ "$DETAILED" = true ]; then
        echo ""
        echo "📊 OPAL Server stats:"
        curl -s "http://localhost:7002/statistics" 2>/dev/null | jq . 2>/dev/null || echo "  (Niedostępne)"
        
        echo ""
        echo "📊 OPAL Client stats:"
        curl -s "http://localhost:7000/statistics" 2>/dev/null | jq . 2>/dev/null || echo "  (Niedostępne)"
    fi
}

# Test tworzenia tenant
test_tenant_creation() {
    if [ "$TEST_TENANT" != true ]; then
        return 0
    fi
    
    echo ""
    echo "🏢 Test tworzenia tenant..."
    echo "==========================="
    
    local tenant_id="test_verify_$(date +%s)"
    local tenant_name="Test Verify Tenant"
    local admin_email="admin@verify.test"
    local admin_name="Test Administrator"
    
    log_test "Tworzenie tenant: $tenant_id"
    
    # Utwórz tenant
    local create_response=$(curl -s -X POST "http://localhost:8010/provision-tenant" \
        -H "Content-Type: application/json" \
        -d "{
            \"tenant_id\": \"$tenant_id\",
            \"tenant_name\": \"$tenant_name\",
            \"admin_email\": \"$admin_email\",
            \"admin_name\": \"$admin_name\"
        }" 2>/dev/null)
    
    if echo "$create_response" | grep -q "success\|created\|201" 2>/dev/null; then
        log_success "Tenant utworzony pomyślnie"
    else
        log_error "Błąd tworzenia tenant"
        if [ "$VERBOSE" = true ]; then
            echo "   Response: $create_response"
        fi
        return 1
    fi
    
    # Sprawdź czy tenant jest widoczny
    sleep 3  # Czekaj na synchronizację
    
    log_test "Sprawdzanie widoczności tenant w Data Provider"
    
    if curl -s "http://localhost:8110/tenants" | grep -q "$tenant_id" 2>/dev/null; then
        log_success "Tenant widoczny w Data Provider API"
    else
        log_error "Tenant nie jest widoczny w Data Provider API"
    fi
    
    log_test "Sprawdzanie synchronizacji z OPA"
    
    if curl -s "http://localhost:8181/v1/data/acl/$tenant_id" | grep -q "$tenant_id\|user" 2>/dev/null; then
        log_success "Tenant zsynchronizowany z OPA"
    else
        log_error "Tenant nie jest zsynchronizowany z OPA"
    fi
    
    # Test autoryzacji
    log_test "Test autoryzacji administratora"
    
    local auth_response=$(curl -s "http://localhost:8181/v1/data/rbac/allow" \
        -H "Content-Type: application/json" \
        -d "{
            \"input\": {
                \"user\": \"admin_$tenant_id\",
                \"action\": \"manage_users\",
                \"resource\": \"portal\",
                \"tenant\": \"$tenant_id\"
            }
        }" 2>/dev/null)
    
    if echo "$auth_response" | grep -q '"result": *true' 2>/dev/null; then
        log_success "Autoryzacja administratora działa"
    else
        log_error "Autoryzacja administratora nie działa"
        if [ "$VERBOSE" = true ]; then
            echo "   Auth response: $auth_response"
        fi
    fi
    
    # Cleanup (opcjonalnie)
    if [ "$DETAILED" = true ]; then
        log_info "Test tenant $tenant_id pozostawiony do inspekcji"
    fi
}

# Sprawdź Portal UI (jeśli działa)
check_portal_ui() {
    echo ""
    echo "🌐 Sprawdzanie Portal UI..."
    echo "==========================="
    
    log_test "Portal UI (Next.js)"
    
    if curl -s -f "http://localhost:3000" > /dev/null 2>&1; then
        log_success "Portal UI działa na http://localhost:3000"
        
        if [ "$DETAILED" = true ]; then
            # Sprawdź czy to rzeczywiście Next.js
            local response=$(curl -s "http://localhost:3000" 2>/dev/null)
            if echo "$response" | grep -qi "next.js\|react\|symfonia" 2>/dev/null; then
                log_success "Portal UI to aplikacja Next.js/React"
            else
                log_warning "Portal UI działa, ale może nie być aplikacją Next.js"
            fi
        fi
    else
        log_warning "Portal UI nie działa na porcie 3000"
        log_info "To normalne jeśli nie uruchomiłeś 'npm run dev'"
    fi
}

# Sprawdź logi na błędy
check_logs_for_errors() {
    if [ "$DETAILED" != true ]; then
        return 0
    fi
    
    echo ""
    echo "📝 Sprawdzanie logów na błędy..."
    echo "==============================="
    
    local services=("data-provider-api" "provisioning-api" "opa-standalone" "opal-server" "opal-client")
    
    for service in "${services[@]}"; do
        log_test "Analiza logów: $service"
        
        local error_count=$(docker-compose logs "$service" --tail=100 2>/dev/null | grep -i "error\|exception\|failed" | wc -l | tr -d ' ')
        
        if [ "$error_count" -eq 0 ]; then
            log_success "$service - brak błędów w logach"
        elif [ "$error_count" -le 3 ]; then
            log_warning "$service - $error_count błędów w logach (akceptowalne)"
        else
            log_error "$service - $error_count błędów w logach"
            
            if [ "$VERBOSE" = true ]; then
                echo "   Ostatnie błędy:"
                docker-compose logs "$service" --tail=20 2>/dev/null | grep -i "error\|exception\|failed" | tail -3
            fi
        fi
    done
}

# Pokaż podsumowanie
show_summary() {
    echo ""
    echo "📊 Podsumowanie weryfikacji"
    echo "============================"
    echo ""
    
    local success_rate=0
    if [ $TESTS_TOTAL -gt 0 ]; then
        success_rate=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    fi
    
    echo "🧪 Testy wykonane: $TESTS_TOTAL"
    echo "✅ Testy pomyślne: $TESTS_PASSED"
    echo "❌ Testy nieudane: $TESTS_FAILED"
    echo "📈 Wskaźnik sukcesu: $success_rate%"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 Wszystkie testy przeszły pomyślnie!${NC}"
        echo -e "${GREEN}✅ POC OPA Zero Poll działa poprawnie${NC}"
        echo ""
        echo "🚀 Możesz teraz:"
        echo "  • Otworzyć Portal UI: http://localhost:3000"
        echo "  • Utworzyć tenant: curl -X POST http://localhost:8010/provision-tenant ..."
        echo "  • Sprawdzić dokumentację: docs/QUICK_START.md"
        
        return 0
    elif [ $success_rate -ge 80 ]; then
        echo -e "${YELLOW}⚠️  Większość testów przeszła ($success_rate%)${NC}"
        echo -e "${YELLOW}✅ POC prawdopodobnie działa, ale są drobne problemy${NC}"
        
        return 1
    else
        echo -e "${RED}❌ Zbyt wiele testów nieudanych ($success_rate%)${NC}"
        echo -e "${RED}🚨 POC wymaga naprawy${NC}"
        echo ""
        echo "🔧 Spróbuj:"
        echo "  • Restart: docker-compose restart"
        echo "  • Rebuild: docker-compose build --no-cache && docker-compose up -d"
        echo "  • Szczegółowe logi: docker-compose logs --tail=100"
        
        return 2
    fi
}

# Główna funkcja
main() {
    echo "🔍 OPA Zero Poll - Weryfikacja POC"
    echo "===================================="
    echo ""
    
    parse_args "$@"
    
    # Sprawdź czy Docker działa
    if ! docker info &> /dev/null; then
        log_error "Docker nie jest uruchomiony"
        exit 1
    fi
    
    # Sprawdź czy mamy docker-compose.yml
    if [ ! -f "docker-compose.yml" ]; then
        log_error "Nie znaleziono docker-compose.yml"
        log_info "Upewnij się, że jesteś w głównym katalogu projektu"
        exit 1
    fi
    
    # Wykonaj testy
    check_containers
    check_health_endpoints
    
    if [ "$QUICK" != true ]; then
        check_database
        check_api_endpoints
        check_opal_communication
        test_tenant_creation
        check_portal_ui
        check_logs_for_errors
    fi
    
    # Pokaż wyniki
    show_summary
    return $?
}

# Obsługa sygnałów
trap 'log_error "Weryfikacja przerwana"; exit 1' INT TERM

# Uruchom main jeśli skrypt jest wykonywany bezpośrednio
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 