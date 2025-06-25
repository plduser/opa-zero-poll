#!/bin/bash

# OPA Zero Poll - Restart Script
# Autor: OPA Zero Poll Team
# Opis: Restart wszystkich lub wybranych serwisów POC

set -e

# Kolory dla output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Flagi i opcje
BACKEND_ONLY=false
REBUILD=false
CLEAN=false
VERBOSE=false

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${CYAN}🔧 $1${NC}"
}

# Sprawdź argumenty
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backend-only|-b)
                BACKEND_ONLY=true
                shift
                ;;
            --rebuild|-r)
                REBUILD=true
                shift
                ;;
            --clean|-c)
                CLEAN=true
                shift
                ;;
            --verbose|-v)
                VERBOSE=true
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
    echo "OPA Zero Poll - Restart Script"
    echo ""
    echo "Użycie: $0 [OPCJE]"
    echo ""
    echo "Opcje:"
    echo "  -b, --backend-only   Restart tylko backend serwisów (bez bazy)"
    echo "  -r, --rebuild        Rebuild kontenerów przed restartem"
    echo "  -c, --clean          Wyczyść volumes i obrazy przed restartem"
    echo "  -v, --verbose        Szczegółowy output"
    echo "  -h, --help           Pokaż tę pomoc"
    echo ""
    echo "Przykłady:"
    echo "  $0                    # Restart wszystkich serwisów"
    echo "  $0 --backend-only     # Restart bez bazy danych"
    echo "  $0 --rebuild          # Rebuild i restart"
    echo "  $0 --clean --rebuild  # Pełne czyszczenie i rebuild"
}

# Zatrzymaj serwisy
stop_services() {
    log_step "Zatrzymywanie serwisów..."
    
    if [ "$BACKEND_ONLY" = true ]; then
        log_info "Zatrzymywanie tylko backend serwisów (PostgreSQL pozostaje)"
        docker-compose stop data-provider-api provisioning-api opa-standalone opal-server opal-client redis-broadcast
    else
        log_info "Zatrzymywanie wszystkich serwisów"
        docker-compose stop
    fi
    
    log_success "Serwisy zatrzymane"
}

# Wyczyść środowisko (opcjonalnie)
clean_environment() {
    if [ "$CLEAN" = true ]; then
        log_step "Czyszczenie środowiska..."
        
        # Usuń kontener (ale zachowaj volumes jeśli nie backend-only)
        if [ "$BACKEND_ONLY" = true ]; then
            log_info "Usuwanie tylko backend kontenerów"
            docker-compose rm -f data-provider-api provisioning-api opa-standalone opal-server opal-client redis-broadcast
        else
            log_info "Usuwanie wszystkich kontenerów i volumes"
            docker-compose down -v
        fi
        
        # Wyczyść nieużywane obrazy
        log_info "Czyszczenie nieużywanych obrazów Docker"
        docker image prune -f > /dev/null 2>&1 || true
        
        log_success "Środowisko wyczyszczone"
    fi
}

# Rebuild kontenerów (opcjonalnie)
rebuild_containers() {
    if [ "$REBUILD" = true ]; then
        log_step "Rebuild kontenerów..."
        
        if [ "$BACKEND_ONLY" = true ]; then
            log_info "Rebuild tylko backend serwisów"
            if [ "$VERBOSE" = true ]; then
                docker-compose build --no-cache data-provider-api provisioning-api opa-standalone
            else
                docker-compose build --no-cache data-provider-api provisioning-api opa-standalone > /dev/null 2>&1
            fi
        else
            log_info "Rebuild wszystkich serwisów"
            if [ "$VERBOSE" = true ]; then
                docker-compose build --no-cache
            else
                docker-compose build --no-cache > /dev/null 2>&1
            fi
        fi
        
        log_success "Rebuild zakończony"
    fi
}

# Uruchom serwisy
start_services() {
    log_step "Uruchamianie serwisów..."
    
    if [ "$BACKEND_ONLY" = true ]; then
        log_info "Uruchamianie backend serwisów"
        if [ "$VERBOSE" = true ]; then
            docker-compose up -d data-provider-api provisioning-api opa-standalone opal-server opal-client redis-broadcast
        else
            docker-compose up -d data-provider-api provisioning-api opa-standalone opal-server opal-client redis-broadcast > /dev/null 2>&1
        fi
    else
        log_info "Uruchamianie wszystkich serwisów"
        if [ "$VERBOSE" = true ]; then
            docker-compose up -d
        else
            docker-compose up -d > /dev/null 2>&1
        fi
    fi
    
    log_success "Serwisy uruchomione"
}

# Czekaj na ready state
wait_for_ready() {
    log_step "Oczekiwanie na gotowość serwisów..."
    
    local max_wait=60
    local wait_time=0
    
    while [ $wait_time -lt $max_wait ]; do
        # Test podstawowego endpoint
        if curl -s -f "http://localhost:8110/health" > /dev/null 2>&1; then
            log_success "Serwisy gotowe"
            return 0
        fi
        
        echo -n "."
        sleep 3
        wait_time=$((wait_time + 3))
    done
    
    echo ""
    log_warning "Timeout: Serwisy mogą nie być jeszcze w pełni gotowe"
    log_info "Sprawdź status: docker-compose ps"
    return 1
}

# Pokaż status
show_status() {
    echo ""
    echo "📊 Status serwisów po restart:"
    echo "=============================="
    
    docker-compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "🏥 Health check endpoints:"
    
    local endpoints=(
        "http://localhost:8110/health|Data Provider API"
        "http://localhost:8010/health|Provisioning API"
        "http://localhost:8181/health|OPA Engine"
        "http://localhost:7002/healthcheck|OPAL Server"
        "http://localhost:7000/healthcheck|OPAL Client"
    )
    
    for endpoint_pair in "${endpoints[@]}"; do
        local url=$(echo "$endpoint_pair" | cut -d'|' -f1)
        local name=$(echo "$endpoint_pair" | cut -d'|' -f2)
        
        if curl -s -f "$url" > /dev/null 2>&1; then
            echo "  ✅ $name"
        else
            echo "  ❌ $name"
        fi
    done
}

# Sprawdź Portal UI
check_portal() {
    echo ""
    echo "🌐 Portal UI:"
    
    if pgrep -f "next" > /dev/null 2>&1; then
        if curl -s -f "http://localhost:3000" > /dev/null 2>&1; then
            echo "  ✅ Portal UI działa (http://localhost:3000)"
        else
            echo "  ⚠️  Portal UI uruchomiony ale nie odpowiada"
        fi
    else
        echo "  ℹ️  Portal UI nie jest uruchomiony"
        echo "     Uruchom: npm run dev"
    fi
}

# Główna funkcja
main() {
    echo "🔄 OPA Zero Poll - Restart"
    echo "=========================="
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
    
    # Informacje o tym co robimy
    if [ "$BACKEND_ONLY" = true ]; then
        log_info "Restart backend serwisów (PostgreSQL pozostaje uruchomiony)"
    else
        log_info "Restart wszystkich serwisów"
    fi
    
    if [ "$CLEAN" = true ]; then
        log_warning "Czyszczenie środowiska włączone"
    fi
    
    if [ "$REBUILD" = true ]; then
        log_warning "Rebuild kontenerów włączony"
    fi
    
    echo ""
    
    # Wykonaj restart
    stop_services
    clean_environment  
    rebuild_containers
    start_services
    wait_for_ready
    show_status
    check_portal
    
    echo ""
    log_success "🎯 Restart zakończony pomyślnie!"
    
    echo ""
    echo "📋 Następne kroki:"
    echo "  • Sprawdź weryfikację: ./scripts/verify.sh"
    echo "  • Przetestuj tenant: curl -X POST http://localhost:8010/provision-tenant ..."
    echo "  • Uruchom Portal UI: npm run dev (jeśli potrzebne)"
}

# Obsługa sygnałów
trap 'log_error "Restart przerwany"; exit 1' INT TERM

# Uruchom main jeśli skrypt jest wykonywany bezpośrednio
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 