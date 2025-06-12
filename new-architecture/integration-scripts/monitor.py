#!/usr/bin/env python3
"""
OPA Zero Poll - System Monitor

Continuously monitors the health and status of all system components.
Provides real-time dashboard and alerting capabilities.

Author: OPA Zero Poll Team
"""

import json
import time
import requests
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import curses
import signal
import sys

class SystemMonitor:
    """Monitor for OPA Zero Poll system components"""
    
    def __init__(self, config_file: str = "config.json"):
        with open(config_file, 'r') as f:
            self.config = json.load(f)
        
        self.services = {
            "Data Provider API": self.config["data_provider_url"],
            "Provisioning API": self.config["provisioning_url"], 
            "OPA Standalone": self.config["opa_url"]
        }
        
        self.status_history = {service: [] for service in self.services}
        self.running = True
        
        # Setup signal handler for graceful shutdown
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        self.running = False
        print("\n🛑 Shutting down monitor...")
        sys.exit(0)
    
    def check_service_health(self, service_name: str, base_url: str) -> Dict[str, any]:
        """Check health of a single service"""
        try:
            response = requests.get(f"{base_url}/health", timeout=5)
            
            status = {
                "timestamp": datetime.now(),
                "service": service_name,
                "url": base_url,
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "status_code": response.status_code,
                "response_time": response.elapsed.total_seconds(),
                "error": None
            }
            
            # Try to get additional info
            try:
                health_data = response.json()
                status["details"] = health_data
            except:
                status["details"] = {"raw_response": response.text[:100]}
                
        except requests.RequestException as e:
            status = {
                "timestamp": datetime.now(),
                "service": service_name,
                "url": base_url,
                "status": "error",
                "status_code": None,
                "response_time": None,
                "error": str(e),
                "details": None
            }
        
        return status
    
    def check_all_services(self) -> Dict[str, Dict]:
        """Check health of all services"""
        statuses = {}
        
        for service_name, base_url in self.services.items():
            status = self.check_service_health(service_name, base_url)
            statuses[service_name] = status
            
            # Keep history (last 100 entries)
            self.status_history[service_name].append(status)
            if len(self.status_history[service_name]) > 100:
                self.status_history[service_name].pop(0)
        
        return statuses
    
    def get_service_uptime(self, service_name: str, hours: int = 1) -> float:
        """Calculate service uptime percentage for the last N hours"""
        if not self.status_history[service_name]:
            return 0.0
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_statuses = [
            s for s in self.status_history[service_name] 
            if s["timestamp"] > cutoff_time
        ]
        
        if not recent_statuses:
            return 0.0
        
        healthy_count = sum(1 for s in recent_statuses if s["status"] == "healthy")
        return (healthy_count / len(recent_statuses)) * 100
    
    def test_opa_decision(self) -> Dict[str, any]:
        """Test OPA decision making capability"""
        try:
            test_input = {
                "input": {
                    "user": "admin1",
                    "role": "admin", 
                    "action": "read",
                    "resource": "data"
                }
            }
            
            response = requests.post(
                f"{self.config['opa_url']}/v1/data/rbac/allow",
                json=test_input,
                timeout=5
            )
            
            result = response.json()
            
            return {
                "timestamp": datetime.now(),
                "status": "working" if result.get("result") == True else "failed",
                "response_time": response.elapsed.total_seconds(),
                "decision": result.get("result"),
                "error": None
            }
            
        except Exception as e:
            return {
                "timestamp": datetime.now(),
                "status": "error",
                "response_time": None,
                "decision": None,
                "error": str(e)
            }
    
    def get_tenant_count(self) -> Optional[int]:
        """Get current number of tenants"""
        try:
            response = requests.get(f"{self.config['provisioning_url']}/tenants", timeout=5)
            data = response.json()
            return data.get("total_count", 0)
        except:
            return None
    
    def display_dashboard_terminal(self):
        """Display real-time dashboard in terminal"""
        print("🚀 OPA Zero Poll System Monitor")
        print("=" * 60)
        print("Press Ctrl+C to stop monitoring\n")
        
        try:
            while self.running:
                # Clear screen (simple version)
                print("\033[2J\033[H")  # ANSI clear screen and move cursor to top
                
                print("🚀 OPA Zero Poll System Monitor")
                print("=" * 60)
                print(f"Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                print()
                
                # Check all services
                statuses = self.check_all_services()
                
                # Service status table
                print("📊 Service Status:")
                print("-" * 60)
                for service_name, status in statuses.items():
                    icon = "✅" if status["status"] == "healthy" else "❌"
                    uptime = self.get_service_uptime(service_name)
                    response_time = status.get("response_time", 0) or 0
                    
                    print(f"{icon} {service_name:<20} "
                          f"Status: {status['status']:<10} "
                          f"Uptime: {uptime:5.1f}% "
                          f"Response: {response_time*1000:6.1f}ms")
                
                print()
                
                # OPA Decision Test
                opa_test = self.test_opa_decision()
                opa_icon = "✅" if opa_test["status"] == "working" else "❌"
                print(f"🧠 OPA Decision Test: {opa_icon} {opa_test['status']}")
                
                # Tenant count
                tenant_count = self.get_tenant_count()
                if tenant_count is not None:
                    print(f"🏢 Active Tenants: {tenant_count}")
                
                print()
                print("Press Ctrl+C to stop monitoring...")
                
                time.sleep(5)  # Update every 5 seconds
                
        except KeyboardInterrupt:
            self.signal_handler(None, None)
    
    def generate_status_report(self) -> Dict[str, any]:
        """Generate comprehensive status report"""
        statuses = self.check_all_services()
        opa_test = self.test_opa_decision()
        tenant_count = self.get_tenant_count()
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "overall_status": "healthy" if all(
                s["status"] == "healthy" for s in statuses.values()
            ) and opa_test["status"] == "working" else "degraded",
            "services": statuses,
            "opa_decision_test": opa_test,
            "tenant_count": tenant_count,
            "uptime_last_hour": {
                service: self.get_service_uptime(service, 1)
                for service in self.services.keys()
            }
        }
        
        return report
    
    def run_continuous_monitoring(self, interval: int = 30):
        """Run continuous monitoring and logging"""
        print(f"🔄 Starting continuous monitoring (interval: {interval}s)")
        
        while self.running:
            try:
                report = self.generate_status_report()
                
                # Log to file
                log_entry = f"{report['timestamp']} - Overall: {report['overall_status']}\n"
                with open("system_monitor.log", "a") as f:
                    f.write(log_entry)
                
                # Print status summary
                print(f"[{datetime.now().strftime('%H:%M:%S')}] "
                      f"Overall: {report['overall_status']} | "
                      f"Services: {sum(1 for s in report['services'].values() if s['status'] == 'healthy')}/{len(report['services'])} | "
                      f"OPA: {report['opa_decision_test']['status']} | "
                      f"Tenants: {report['tenant_count']}")
                
                time.sleep(interval)
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"❌ Monitoring error: {e}")
                time.sleep(5)

def main():
    """Main entry point"""
    monitor = SystemMonitor()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "status":
            report = monitor.generate_status_report()
            print(json.dumps(report, indent=2, default=str))
            
        elif command == "dashboard":
            monitor.display_dashboard_terminal()
            
        elif command == "watch":
            interval = int(sys.argv[2]) if len(sys.argv) > 2 else 30
            monitor.run_continuous_monitoring(interval)
            
        else:
            print(f"Unknown command: {command}")
            print("Usage: python monitor.py [status|dashboard|watch [interval]]")
            sys.exit(1)
    else:
        # Default: show status report
        report = monitor.generate_status_report()
        print(json.dumps(report, indent=2, default=str))

if __name__ == "__main__":
    main() 