"""
Serwis do emisji eventów do OPAL Server
"""
import asyncio
import structlog
from datetime import datetime
from typing import Dict, Any, Optional
from tenacity import retry, stop_after_attempt, wait_exponential, before_sleep_log
import httpx

from ..config import settings
from ..models import PolicyUpdateEvent, OPALEvent, EventType

logger = structlog.get_logger()

class EventEmitter:
    """Serwis odpowiedzialny za emisję eventów do OPAL Server"""
    
    def __init__(self, opal_server_url: str):
        self.opal_server_url = opal_server_url.rstrip('/')
        self.client = None
        self._webhook_endpoint = f"{self.opal_server_url}/webhook"
        self._policy_endpoint = f"{self.opal_server_url}/policy"
        
    async def __aenter__(self):
        """Async context manager entry"""
        await self._ensure_client()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()
    
    async def _ensure_client(self):
        """Upewnij się, że HTTP client jest zainicjalizowany"""
        if self.client is None:
            self.client = httpx.AsyncClient(
                timeout=httpx.Timeout(10.0),
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": f"PolicyManagementService/{settings.app_version}"
                }
            )
    
    async def close(self):
        """Zamknij HTTP client"""
        if self.client:
            await self.client.aclose()
            self.client = None
    
    @retry(
        stop=stop_after_attempt(settings.max_retries),
        wait=wait_exponential(
            multiplier=settings.retry_delay,
            max=60
        ),
        before_sleep=before_sleep_log(logger, structlog.stdlib.INFO)
    )
    async def _send_request(self, method: str, url: str, data: Dict[str, Any]) -> httpx.Response:
        """
        Wyślij request z retry logic
        
        Args:
            method: HTTP method (POST, PUT, etc.)
            url: Target URL
            data: Payload data
            
        Returns:
            httpx.Response: Response z serwera
            
        Raises:
            httpx.RequestError: W przypadku niepowodzenia wszystkich prób
        """
        await self._ensure_client()
        
        try:
            if method.upper() == "POST":
                response = await self.client.post(url, json=data)
            elif method.upper() == "PUT":
                response = await self.client.put(url, json=data)
            else:
                raise ValueError(f"Nieobsługiwana metoda HTTP: {method}")
            
            # Sprawdź status code
            if response.status_code >= 400:
                logger.warning(
                    "🔥 HTTP error podczas wysyłania eventu",
                    status_code=response.status_code,
                    response_text=response.text,
                    url=url
                )
                response.raise_for_status()
            
            logger.debug(
                "✅ Event wysłany pomyślnie",
                url=url,
                status_code=response.status_code
            )
            
            return response
            
        except httpx.RequestError as e:
            logger.error(
                "❌ Błąd połączenia podczas wysyłania eventu",
                error=str(e),
                url=url
            )
            raise
        except Exception as e:
            logger.error(
                "❌ Nieoczekiwany błąd podczas wysyłania eventu",
                error=str(e),
                url=url
            )
            raise
    
    async def emit_policy_update(
        self,
        policy_id: str,
        policy_name: str,
        source: str = "api",
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Emit policy update event do OPAL Server
        
        Args:
            policy_id: ID polityki
            policy_name: Nazwa polityki
            source: Źródło eventu (api, webhook, etc.)
            metadata: Dodatkowe metadane
            
        Returns:
            bool: True jeśli event został wysłany pomyślnie
        """
        if metadata is None:
            metadata = {}
            
        # Utwórz event
        policy_event = PolicyUpdateEvent(
            event_type=EventType.POLICY_UPDATED,
            policy_id=policy_id,
            policy_name=policy_name,
            source=source,
            metadata=metadata
        )
        
        # Utwórz payload dla OPAL
        opal_event = OPALEvent(
            data={
                "policy_id": policy_id,
                "policy_name": policy_name,
                "source": source,
                "metadata": metadata,
                "event": policy_event.dict()
            }
        )
        
        logger.info(
            "📡 Wysyłanie policy update event",
            policy_id=policy_id,
            policy_name=policy_name,
            source=source,
            opal_url=self._webhook_endpoint
        )
        
        try:
            # Spróbuj wysłać do webhook endpoint
            response = await self._send_request(
                "POST",
                self._webhook_endpoint,
                opal_event.dict()
            )
            
            logger.info(
                "✅ Policy update event wysłany pomyślnie",
                policy_id=policy_id,
                status_code=response.status_code
            )
            
            return True
            
        except Exception as e:
            logger.error(
                "❌ Nie udało się wysłać policy update event",
                policy_id=policy_id,
                error=str(e)
            )
            return False
    
    async def emit_policy_created(
        self,
        policy_id: str,
        policy_name: str,
        policy_content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Emit policy created event
        
        Args:
            policy_id: ID polityki
            policy_name: Nazwa polityki
            policy_content: Zawartość polityki
            metadata: Dodatkowe metadane
            
        Returns:
            bool: True jeśli event został wysłany pomyślnie
        """
        if metadata is None:
            metadata = {}
            
        metadata.update({
            "action": "created",
            "policy_content": policy_content
        })
        
        return await self.emit_policy_update(
            policy_id=policy_id,
            policy_name=policy_name,
            source="api",
            metadata=metadata
        )
    
    async def emit_policy_deleted(
        self,
        policy_id: str,
        policy_name: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Emit policy deleted event
        
        Args:
            policy_id: ID polityki
            policy_name: Nazwa polityki
            metadata: Dodatkowe metadane
            
        Returns:
            bool: True jeśli event został wysłany pomyślnie
        """
        if metadata is None:
            metadata = {}
            
        metadata.update({
            "action": "deleted"
        })
        
        return await self.emit_policy_update(
            policy_id=policy_id,
            policy_name=policy_name,
            source="api",
            metadata=metadata
        )
    
    async def test_connection(self) -> bool:
        """
        Test połączenia z OPAL Server
        
        Returns:
            bool: True jeśli połączenie działa
            
        Raises:
            Exception: W przypadku problemu z połączeniem
        """
        await self._ensure_client()
        
        test_urls = [
            f"{self.opal_server_url}/health",
            f"{self.opal_server_url}/",
            self._webhook_endpoint
        ]
        
        for url in test_urls:
            try:
                response = await self.client.get(url, timeout=5.0)
                if response.status_code < 400:
                    logger.info("✅ OPAL Server dostępny", url=url, status_code=response.status_code)
                    return True
            except Exception:
                continue
        
        raise ConnectionError(f"Nie można połączyć się z OPAL Server: {self.opal_server_url}")
    
    async def get_opal_status(self) -> Dict[str, Any]:
        """
        Pobierz status OPAL Server
        
        Returns:
            Dict: Status information z OPAL Server
        """
        await self._ensure_client()
        
        try:
            response = await self.client.get(f"{self.opal_server_url}/health", timeout=5.0)
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "status": "error",
                    "status_code": response.status_code,
                    "message": "OPAL Server nie odpowiada prawidłowo"
                }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Błąd połączenia z OPAL Server: {str(e)}"
            } 