#!/bin/bash

# OPA Zero Poll - Automatyczny Setup Script
# Autor: OPA Zero Poll Team
# Opis: Automatyczne uruchomienie kompletnego środowiska POC

set -e  # Exit on any error

# Kolory dla output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Flagi i opcje
VERBOSE=false
CLEAN=false
WITH_PORTAL=false
SKIP_TESTS=false

# Funkcje pomocnicze
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
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --clean|-c)
                CLEAN=true
                shift
                ;;
            --with-portal|-p)
                WITH_PORTAL=true
                shift
                ;;
            --skip-tests|-s)
                SKIP_TESTS=true
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
    echo "OPA Zero Poll - Setup Script"
    echo ""
    echo "Użycie: $0 [OPCJE]"
    echo ""
    echo "Opcje:"
    echo "  -v, --verbose     Szczegółowy output"
    echo "  -c, --clean       Wyczyść kontener przed startem"
    echo "  -p, --with-portal Uruchom także Portal UI (Next.js)"
    echo "  -s, --skip-tests  Pomiń testy weryfikacyjne"
    echo "  -h, --help        Pokaż tę pomoc"
    echo ""
    echo "Przykłady:"
    echo "  $0                    # Podstawowy setup"
    echo "  $0 --verbose --clean  # Pełny setup z czyszczeniem"
    echo "  $0 --with-portal      # Setup + Portal UI"
}

# Sprawdź wymagania systemowe
check_requirements() {
    log_step "Sprawdzanie wymagań systemowych..."
    
    # Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker nie jest zainstalowany"
        log_info "Pobierz Docker Desktop z: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose nie jest zainstalowany"
        exit 1
    fi
    
    # Git
    if ! command -v git &> /dev/null; then
        log_warning "Git nie jest zainstalowany"
        log_info "Pobierz Git z: https://git-scm.com/"
    fi
    
    # curl
    if ! command -v curl &> /dev/null; then
        log_warning "curl nie jest zainstalowany"
        log_info "curl jest potrzebny do testowania API"
    fi
    
    log_success "Wszystkie wymagania spełnione"
}

# Sprawdź czy Docker działa
check_docker_running() {
    log_step "Sprawdzanie czy Docker działa..."
    
    if ! docker info &> /dev/null; then
        log_error "Docker nie jest uruchomiony"
        log_info "Uruchom Docker Desktop lub 'sudo systemctl start docker'"
        exit 1
    fi
    
    log_success "Docker działa"
}

# Automatyczna detekcja platformy
detect_platform() {
    log_step "Wykrywanie platformy..."
    
    ARCH=$(uname -m)
    OS=$(uname -s)
    
    case "$OS" in
        "Darwin")
            case "$ARCH" in
                "arm64")
                    PLATFORM="linux/arm64"
                    log_info "Wykryto: macOS Apple Silicon (M1/M2)"
                    ;;
                "x86_64")
                    PLATFORM="linux/amd64"
                    log_info "Wykryto: macOS Intel"
                    ;;
                *)
                    PLATFORM="linux/amd64"
                    log_warning "Nieznana architektura macOS, używam amd64"
                    ;;
            esac
            ;;
        "Linux")
            PLATFORM="linux/amd64"
            log_info "Wykryto: Linux"
            ;;
        "MINGW"*|"CYGWIN"*|"MSYS"*)
            PLATFORM="linux/amd64"
            log_info "Wykryto: Windows"
            ;;
        *)
            PLATFORM="linux/amd64"
            log_warning "Nieznany system operacyjny, używam linux/amd64"
            ;;
    esac
    
    log_success "Platforma: $PLATFORM"
}

# Konfiguruj docker-compose.yml dla odpowiedniej platformy
configure_platform() {
    log_step "Konfigurowanie platformy w docker-compose.yml..."
    
    # Backup oryginalnego pliku
    if [ ! -f "docker-compose.yml.backup" ]; then
        cp docker-compose.yml docker-compose.yml.backup
        log_info "Utworzono backup: docker-compose.yml.backup"
    fi
    
    # Zamień platformę w pliku
    if [[ "$PLATFORM" == "linux/amd64" ]]; then
        sed -i.tmp 's/platform: linux\/arm64/platform: linux\/amd64/g' docker-compose.yml
        log_info "Skonfigurowano dla platform x86_64/amd64"
    else
        sed -i.tmp 's/platform: linux\/amd64/platform: linux\/arm64/g' docker-compose.yml
        log_info "Skonfigurowano dla platform ARM64"
    fi
    
    # Usuń tymczasowy plik
    rm -f docker-compose.yml.tmp
    
    log_success "Platforma skonfigurowana"
}

# Sprawdź dostępność portów
check_ports() {
    log_step "Sprawdzanie dostępności portów..."
    
    PORTS=(3000 5432 6380 7000 7002 8010 8110 8181)
    OCCUPIED_PORTS=()
    
    for port in "${PORTS[@]}"; do
        if command -v lsof &> /dev/null; then
            if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
                OCCUPIED_PORTS+=($port)
            fi
        elif command -v netstat &> /dev/null; then
            if netstat -an | grep ":$port.*LISTEN" >/dev/null ; then
                OCCUPIED_PORTS+=($port)
            fi
        fi
    done
    
    if [ ${#OCCUPIED_PORTS[@]} -gt 0 ]; then
        log_warning "Zajęte porty: ${OCCUPIED_PORTS[*]}"
        log_info "Zatrzymaj procesy na tych portach lub użyj --clean"
        
        if [ "$CLEAN" = true ]; then
            log_step "Czyszczenie zajętych portów..."
            for port in "${OCCUPIED_PORTS[@]}"; do
                if command -v lsof &> /dev/null; then
                    lsof -ti:$port | xargs kill -9 2>/dev/null || true
                fi
            done
            log_success "Porty wyczyszczone"
        fi
    else
        log_success "Wszystkie porty dostępne"
    fi
}

# Wyczyść środowisko (opcjonalnie)
clean_environment() {
    if [ "$CLEAN" = true ]; then
        log_step "Czyszczenie środowiska Docker..."
        
        docker-compose down -v 2>/dev/null || true
        docker system prune -f 2>/dev/null || true
        
        log_success "Środowisko wyczyszczone"
    fi
}

# Uruchom kontener
start_containers() {
    log_step "Uruchamianie kontenerów Docker..."
    
    if [ "$VERBOSE" = true ]; then
        docker-compose up -d
    else
        docker-compose up -d > /dev/null 2>&1
    fi
    
    log_success "Kontener uruchomione"
}

# Czekaj na health checks
wait_for_services() {
    log_step "Oczekiwanie na uruchomienie serwisów..."
    
    SERVICES=("postgres-db" "data-provider-api" "provisioning-api" "opa-standalone" "redis-broadcast" "opal-server" "opal-client")
    MAX_WAIT=120  # 2 minuty
    WAIT_TIME=0
    
    while [ $WAIT_TIME -lt $MAX_WAIT ]; do
        ALL_HEALTHY=true
        
        for service in "${SERVICES[@]}"; do
            STATUS=$(docker-compose ps --format "table {{.Service}}\t{{.Status}}" | grep "$service" | awk '{print $2}')
            if [[ ! "$STATUS" =~ "Up" ]]; then
                ALL_HEALTHY=false
                break
            fi
        done
        
        if [ "$ALL_HEALTHY" = true ]; then
            log_success "Wszystkie serwisy uruchomione"
            return 0
        fi
        
        echo -n "."
        sleep 5
        WAIT_TIME=$((WAIT_TIME + 5))
    done
    
    echo ""
    log_error "Timeout: Nie wszystkie serwisy uruchomiły się w czasie"
    docker-compose ps
    return 1
}

# Wykonaj podstawowe testy
run_basic_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        log_info "Pomijanie testów (--skip-tests)"
        return 0
    fi
    
    log_step "Wykonywanie podstawowych testów..."
    
    # Test health endpoints
    ENDPOINTS=(
        "http://localhost:8110/health"
        "http://localhost:8010/health"
        "http://localhost:8181/health"
        "http://localhost:7002/healthcheck"
        "http://localhost:7000/healthcheck"
    )
    
    for endpoint in "${ENDPOINTS[@]}"; do
        if curl -s -f "$endpoint" > /dev/null; then
            log_success "✓ $(echo $endpoint | cut -d'/' -f3)"
        else
            log_error "✗ $(echo $endpoint | cut -d'/' -f3)"
            return 1
        fi
    done
    
    log_success "Wszystkie testy health check przeszły"
}

# Uruchom Portal UI (opcjonalnie)
start_portal() {
    if [ "$WITH_PORTAL" = true ]; then
        log_step "Uruchamianie Portal UI..."
        
        # Sprawdź czy Node.js jest zainstalowany
        if ! command -v npm &> /dev/null; then
            log_warning "npm nie jest zainstalowany - pomijanie Portal UI"
            log_info "Zainstaluj Node.js z: https://nodejs.org/"
            return 1
        fi
        
        # Zainstaluj zależności jeśli nie istnieją
        if [ ! -d "node_modules" ]; then
            log_info "Instalowanie zależności Node.js..."
            npm install > /dev/null 2>&1
        fi
        
        # Uruchom w tle
        log_info "Uruchamianie Next.js dev server..."
        npm run dev > /dev/null 2>&1 &
        
        # Zapisz PID
        echo $! > .portal.pid
        
        # Czekaj chwilę na uruchomienie
        sleep 5
        
        if curl -s -f "http://localhost:3000" > /dev/null; then
            log_success "Portal UI uruchomiony na http://localhost:3000"
        else
            log_warning "Portal UI może nie być jeszcze gotowy"
            log_info "Sprawdź http://localhost:3000 za chwilę"
        fi
    fi
}

# Pokaż podsumowanie
show_summary() {
    echo ""
    echo "🎉 Setup zakończony pomyślnie!"
    echo ""
    echo "📊 Status serwisów:"
    docker-compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "🌐 Dostępne endpointy:"
    echo "  • Data Provider API:  http://localhost:8110"
    echo "  • Provisioning API:   http://localhost:8010"
    echo "  • OPA Engine:         http://localhost:8181"
    echo "  • OPAL Server:        http://localhost:7002"
    echo "  • OPAL Client:        http://localhost:7000"
    
    if [ "$WITH_PORTAL" = true ]; then
        echo "  • Portal UI:          http://localhost:3000"
    fi
    
    echo ""
    echo "📋 Następne kroki:"
    echo "  1. Uruchom weryfikację: ./scripts/verify.sh"
    echo "  2. Utwórz tenant: curl -X POST http://localhost:8010/provision-tenant \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"tenant_id\": \"demo123\", \"tenant_name\": \"Demo Company\", \"admin_email\": \"admin@demo.com\", \"admin_name\": \"Jan Kowalski\"}'"
    echo "  3. Sprawdź dokumentację: docs/QUICK_START.md"
    
    if [ "$WITH_PORTAL" = true ]; then
        echo ""
        echo "🛑 Aby zatrzymać Portal UI:"
        echo "  kill \$(cat .portal.pid) && rm .portal.pid"
    fi
    
    echo ""
}

# Główna funkcja
main() {
    echo "🚀 OPA Zero Poll - Automatyczny Setup"
    echo "=====================================]"
    echo ""
    
    parse_args "$@"
    
    check_requirements
    check_docker_running
    detect_platform
    configure_platform
    check_ports
    clean_environment
    start_containers
    wait_for_services
    run_basic_tests
    start_portal
    show_summary
    
    log_success "🎯 Setup zakończony pomyślnie!"
}

# Obsługa sygnałów
trap 'log_error "Setup przerwany"; exit 1' INT TERM

# Uruchom main jeśli skrypt jest wykonywany bezpośrednio
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 