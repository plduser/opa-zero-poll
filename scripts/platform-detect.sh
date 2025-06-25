#!/bin/bash

# OPA Zero Poll - Platform Detection Script
# Autor: OPA Zero Poll Team
# Opis: Automatyczna detekcja i konfiguracja platformy Docker

set -e

# Kolory dla output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Wykryj platformę
detect_platform() {
    echo "🔍 Wykrywanie platformy..."
    echo "========================="
    echo ""
    
    ARCH=$(uname -m)
    OS=$(uname -s)
    
    log_info "Architektura: $ARCH"
    log_info "System: $OS"
    
    case "$OS" in
        "Darwin")
            case "$ARCH" in
                "arm64")
                    PLATFORM="linux/arm64"
                    DESCRIPTION="macOS Apple Silicon (M1/M2/M3)"
                    ;;
                "x86_64")
                    PLATFORM="linux/amd64"
                    DESCRIPTION="macOS Intel"
                    ;;
                *)
                    PLATFORM="linux/amd64"
                    DESCRIPTION="macOS (nieznana architektura - domyślnie amd64)"
                    log_warning "Nieznana architektura macOS: $ARCH"
                    ;;
            esac
            ;;
        "Linux")
            case "$ARCH" in
                "aarch64"|"arm64")
                    PLATFORM="linux/arm64"
                    DESCRIPTION="Linux ARM64"
                    ;;
                "x86_64"|"amd64")
                    PLATFORM="linux/amd64"
                    DESCRIPTION="Linux x86_64"
                    ;;
                *)
                    PLATFORM="linux/amd64"
                    DESCRIPTION="Linux (nieznana architektura - domyślnie amd64)"
                    log_warning "Nieznana architektura Linux: $ARCH"
                    ;;
            esac
            ;;
        "MINGW"*|"CYGWIN"*|"MSYS"*)
            PLATFORM="linux/amd64"
            DESCRIPTION="Windows (Git Bash/WSL)"
            ;;
        *)
            PLATFORM="linux/amd64"
            DESCRIPTION="Nieznany system (domyślnie linux/amd64)"
            log_warning "Nieznany system operacyjny: $OS"
            ;;
    esac
    
    echo ""
    log_success "Wykryta platforma: $DESCRIPTION"
    log_info "Docker platform: $PLATFORM"
    
    return 0
}

# Konfiguruj docker-compose.yml
configure_docker_compose() {
    echo ""
    echo "🔧 Konfigurowanie docker-compose.yml..."
    echo "======================================="
    
    if [ ! -f "docker-compose.yml" ]; then
        log_error "Nie znaleziono docker-compose.yml"
        log_info "Upewnij się, że jesteś w głównym katalogu projektu"
        return 1
    fi
    
    # Backup oryginalnego pliku (tylko przy pierwszym użyciu)
    if [ ! -f "docker-compose.yml.backup" ]; then
        cp docker-compose.yml docker-compose.yml.backup
        log_info "Utworzono backup: docker-compose.yml.backup"
    fi
    
    # Sprawdź obecną konfigurację
    CURRENT_PLATFORM=$(grep "platform:" docker-compose.yml | head -1 | sed 's/.*platform: *//' | tr -d ' ')
    
    if [ "$CURRENT_PLATFORM" = "$PLATFORM" ]; then
        log_success "Platforma już poprawnie skonfigurowana ($PLATFORM)"
        return 0
    fi
    
    log_info "Zmiana z '$CURRENT_PLATFORM' na '$PLATFORM'"
    
    # Zamień platformę w pliku
    if [[ "$PLATFORM" == "linux/arm64" ]]; then
        sed -i.tmp 's/platform: linux\/amd64/platform: linux\/arm64/g' docker-compose.yml
        log_info "Skonfigurowano dla ARM64"
    else
        sed -i.tmp 's/platform: linux\/arm64/platform: linux\/amd64/g' docker-compose.yml
        log_info "Skonfigurowano dla x86_64/amd64"
    fi
    
    # Usuń tymczasowy plik
    rm -f docker-compose.yml.tmp
    
    log_success "Platforma skonfigurowana: $PLATFORM"
}

# Pokaż instrukcje
show_instructions() {
    echo ""
    echo "📋 Następne kroki"
    echo "================="
    echo ""
    echo "1. 🚀 Uruchom POC:"
    echo "   ./scripts/setup.sh"
    echo ""
    echo "2. ✅ Sprawdź czy działa:"
    echo "   ./scripts/verify.sh"
    echo ""
    echo "3. 🌐 (Opcjonalnie) uruchom Portal UI:"
    echo "   npm install && npm run dev"
    echo ""
    echo "4. 📝 Więcej informacji:"
    echo "   docs/QUICK_START.md"
    echo ""
}

# Główna funkcja
main() {
    echo "🔍 OPA Zero Poll - Platform Detection"
    echo "====================================="
    echo ""
    
    detect_platform
    configure_docker_compose
    show_instructions
    
    log_success "Platforma skonfigurowana pomyślnie!"
}

# Sprawdź argumenty
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "OPA Zero Poll - Platform Detection Script"
    echo ""
    echo "Automatycznie wykrywa platformę (macOS, Linux, Windows)"
    echo "i konfiguruje docker-compose.yml dla odpowiedniej architektury."
    echo ""
    echo "Użycie: $0"
    echo ""
    echo "Obsługiwane platformy:"
    echo "  • macOS Apple Silicon (M1/M2/M3) → linux/arm64"
    echo "  • macOS Intel                   → linux/amd64"
    echo "  • Linux ARM64                   → linux/arm64"
    echo "  • Linux x86_64                  → linux/amd64"
    echo "  • Windows (Git Bash/WSL)       → linux/amd64"
    echo ""
    echo "Przykład:"
    echo "  $0                    # Wykryj i skonfiguruj platformę"
    echo ""
    exit 0
fi

# Uruchom main
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 