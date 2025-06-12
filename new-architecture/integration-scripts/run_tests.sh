#!/bin/bash

# OPA Zero Poll - Integration Test Runner
# Comprehensive testing script for the integration components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"
LOG_FILE="integration_tests.log"

echo -e "${BLUE}🧪 OPA Zero Poll - Integration Test Runner${NC}"
echo "=============================================="

# Function to print colored output
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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Setup Python virtual environment
setup_environment() {
    log_info "Setting up Python environment..."
    
    if [ ! -d "$VENV_DIR" ]; then
        log_info "Creating virtual environment..."
        python3 -m venv "$VENV_DIR"
    fi
    
    log_info "Activating virtual environment..."
    source "$VENV_DIR/bin/activate"
    
    log_info "Installing dependencies..."
    pip install --quiet --upgrade pip
    pip install --quiet -r requirements.txt
    
    log_success "Environment setup complete"
}

# Check if services are running
check_services() {
    log_info "Checking if all services are running..."
    
    services=(
        "http://localhost:8110/health|Data Provider API"
        "http://localhost:8010/health|Provisioning API"
        "http://localhost:8181/health|OPA Standalone"
    )
    
    all_healthy=true
    
    for service in "${services[@]}"; do
        IFS='|' read -r url name <<< "$service"
        
        if curl -s -f "$url" >/dev/null 2>&1; then
            log_success "$name is running"
        else
            log_error "$name is not running (URL: $url)"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = false ]; then
        log_error "Some services are not running. Please start them first:"
        log_info "docker-compose -f ../../docker-compose-new-arch.yml up -d"
        exit 1
    fi
    
    log_success "All services are running"
}

# Run health check test
test_health_check() {
    log_info "Running health check test..."
    
    source "$VENV_DIR/bin/activate"
    
    if python data_integration.py health >> "$LOG_FILE" 2>&1; then
        log_success "Health check test passed"
        return 0
    else
        log_error "Health check test failed"
        return 1
    fi
}

# Run data synchronization test
test_data_sync() {
    log_info "Running data synchronization test..."
    
    source "$VENV_DIR/bin/activate"
    
    if python data_integration.py sync >> "$LOG_FILE" 2>&1; then
        log_success "Data synchronization test passed"
        return 0
    else
        log_error "Data synchronization test failed"
        return 1
    fi
}

# Run end-to-end test
test_end_to_end() {
    log_info "Running end-to-end integration test..."
    
    source "$VENV_DIR/bin/activate"
    
    if python data_integration.py test >> "$LOG_FILE" 2>&1; then
        log_success "End-to-end test passed"
        return 0
    else
        log_error "End-to-end test failed"
        return 1
    fi
}

# Run monitoring test
test_monitoring() {
    log_info "Running system monitoring test..."
    
    source "$VENV_DIR/bin/activate"
    
    if python monitor.py status >> "$LOG_FILE" 2>&1; then
        log_success "System monitoring test passed"
        return 0
    else
        log_error "System monitoring test failed"
        return 1
    fi
}

# Performance test
test_performance() {
    log_info "Running performance test..."
    
    source "$VENV_DIR/bin/activate"
    
    # Test multiple rapid calls to OPA
    start_time=$(date +%s)
    
    for i in {1..10}; do
        curl -s -X POST http://localhost:8181/v1/data/rbac/allow \
             -H "Content-Type: application/json" \
             -d '{"input": {"user": "admin1", "role": "admin", "action": "read", "resource": "data"}}' \
             >/dev/null 2>&1 || {
            log_error "Performance test failed on request $i"
            return 1
        }
    done
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    log_success "Performance test passed: 10 requests in ${duration}s"
    return 0
}

# Show test results
show_results() {
    echo
    log_info "📊 Test Results Summary:"
    echo "========================"
    
    local total_tests=0
    local passed_tests=0
    
    for result in "${test_results[@]}"; do
        IFS=':' read -r test_name status <<< "$result"
        total_tests=$((total_tests + 1))
        
        if [ "$status" = "PASSED" ]; then
            log_success "$test_name: $status"
            passed_tests=$((passed_tests + 1))
        else
            log_error "$test_name: $status"
        fi
    done
    
    echo
    if [ $passed_tests -eq $total_tests ]; then
        log_success "All tests passed! ($passed_tests/$total_tests)"
        log_info "🎉 Integration is working correctly!"
    else
        log_warning "Some tests failed ($passed_tests/$total_tests passed)"
        log_info "Check $LOG_FILE for detailed error information"
    fi
}

# Main test execution
run_all_tests() {
    # Clear previous log
    > "$LOG_FILE"
    
    # Array to store test results
    test_results=()
    
    # Run each test
    tests=(
        "test_health_check:Health Check"
        "test_data_sync:Data Synchronization" 
        "test_end_to_end:End-to-End Integration"
        "test_monitoring:System Monitoring"
        "test_performance:Performance"
    )
    
    for test in "${tests[@]}"; do
        IFS=':' read -r test_function test_name <<< "$test"
        
        echo
        log_info "Running $test_name test..."
        
        if $test_function; then
            test_results+=("$test_name:PASSED")
        else
            test_results+=("$test_name:FAILED")
        fi
    done
}

# Command line interface
case "${1:-all}" in
    "setup")
        setup_environment
        ;;
    "check")
        check_services
        ;;
    "health")
        setup_environment
        check_services
        test_health_check
        ;;
    "sync")
        setup_environment
        check_services
        test_data_sync
        ;;
    "e2e"|"end-to-end")
        setup_environment
        check_services
        test_end_to_end
        ;;
    "monitor")
        setup_environment
        check_services
        test_monitoring
        ;;
    "performance"|"perf")
        setup_environment
        check_services
        test_performance
        ;;
    "all")
        setup_environment
        check_services
        run_all_tests
        show_results
        ;;
    "clean")
        log_info "Cleaning up..."
        rm -rf "$VENV_DIR"
        rm -f "$LOG_FILE"
        rm -f "data_integration.log"
        rm -f "system_monitor.log"
        log_success "Cleanup complete"
        ;;
    *)
        echo "Usage: $0 {setup|check|health|sync|e2e|monitor|performance|all|clean}"
        echo
        echo "Commands:"
        echo "  setup       - Setup Python environment and dependencies"
        echo "  check       - Check if all services are running"
        echo "  health      - Run health check test"
        echo "  sync        - Run data synchronization test"
        echo "  e2e         - Run end-to-end integration test"
        echo "  monitor     - Run system monitoring test"
        echo "  performance - Run performance test"
        echo "  all         - Run all tests (default)"
        echo "  clean       - Clean up test environment"
        exit 1
        ;;
esac 