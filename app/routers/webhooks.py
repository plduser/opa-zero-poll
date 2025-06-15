"""
Router obsługujący GitHub webhooks
"""
import hashlib
import hmac
import json
import structlog
from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException, status, Depends
from fastapi.responses import JSONResponse

from ..config import settings
from ..models import (
    GitHubPushEvent, 
    GitHubPullRequestEvent, 
    WebhookResponse, 
    EventType
)
from ..services.event_emitter import EventEmitter
from ..services.policy_storage import PolicyStorage

logger = structlog.get_logger()
router = APIRouter()

def verify_github_signature(payload: bytes, signature: str, secret: str) -> bool:
    """
    Weryfikacja sygnatury GitHub webhook
    
    Args:
        payload: Raw payload z GitHub
        signature: Sygnatura z headera X-Hub-Signature-256
        secret: Secret key skonfigurowany w GitHub
    
    Returns:
        bool: True jeśli sygnatura jest prawidłowa
    """
    if not secret:
        logger.warning("🔐 Brak webhook secret - pomijam weryfikację sygnatury")
        return True
    
    if not signature:
        return False
    
    # GitHub używa SHA-256 i prefixu 'sha256='
    if not signature.startswith('sha256='):
        return False
    
    expected_signature = 'sha256=' + hmac.new(
        secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

def get_services(request: Request):
    """Dependency do pobrania serwisów z app state"""
    return {
        'event_emitter': request.app.state.event_emitter,
        'policy_storage': request.app.state.policy_storage
    }

async def process_policy_files(commits: list, event_emitter: EventEmitter, source: str = "github_webhook") -> int:
    """
    Przetwórz pliki policy z commitów
    
    Args:
        commits: Lista commitów z GitHub
        event_emitter: Serwis do emisji eventów
        source: Źródło eventu
    
    Returns:
        int: Liczba przetworzonych plików policy
    """
    policy_extensions = {'.rego', '.policy', '.pol'}
    processed_count = 0
    
    for commit in commits:
        policy_files = []
        
        # Sprawdź dodane, zmodyfikowane i usunięte pliki
        all_files = commit.get('added', []) + commit.get('modified', []) + commit.get('removed', [])
        
        for file_path in all_files:
            # Sprawdź czy to plik policy
            if any(file_path.lower().endswith(ext) for ext in policy_extensions):
                policy_files.append(file_path)
        
        if policy_files:
            logger.info(
                "📋 Znaleziono pliki policy w commit",
                commit_id=commit.get('id', 'unknown')[:8],
                files=policy_files,
                message=commit.get('message', 'No message')
            )
            
            # Emit event dla każdego pliku policy
            for policy_file in policy_files:
                try:
                    await event_emitter.emit_policy_update(
                        policy_id=policy_file,
                        policy_name=policy_file.split('/')[-1],  # Tylko nazwa pliku
                        source=source,
                        metadata={
                            'commit_id': commit.get('id'),
                            'commit_message': commit.get('message'),
                            'file_path': policy_file,
                            'author': commit.get('author', {}).get('name', 'unknown')
                        }
                    )
                    processed_count += 1
                except Exception as e:
                    logger.error(
                        "❌ Błąd podczas emisji eventu dla pliku policy",
                        file=policy_file,
                        error=str(e)
                    )
    
    return processed_count

@router.post("/github", response_model=WebhookResponse)
async def github_webhook(
    request: Request, 
    services: Dict = Depends(get_services)
):
    """
    Endpoint obsługujący GitHub webhooks
    
    Obsługuje eventy:
    - push: Zmiany w repozytorium (dodanie/modyfikacja/usunięcie plików policy)
    - pull_request: Pull requesty (może wpływać na policy)
    """
    event_emitter: EventEmitter = services['event_emitter']
    policy_storage: PolicyStorage = services['policy_storage']
    
    # Pobranie headerów
    signature = request.headers.get('X-Hub-Signature-256')
    event_type = request.headers.get('X-GitHub-Event')
    delivery_id = request.headers.get('X-GitHub-Delivery')
    
    logger.info(
        "📥 GitHub webhook otrzymany",
        event_type=event_type,
        delivery_id=delivery_id,
        has_signature=bool(signature)
    )
    
    # Pobranie raw payload
    try:
        payload_bytes = await request.body()
        payload = json.loads(payload_bytes.decode('utf-8'))
    except Exception as e:
        logger.error("❌ Błąd podczas parsowania payload", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload format"
        )
    
    # Weryfikacja sygnatury
    if not verify_github_signature(payload_bytes, signature, settings.github_webhook_secret):
        logger.warning("🔒 Nieprawidłowa sygnatura webhook", delivery_id=delivery_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook signature"
        )
    
    processed_files = 0
    event_processed = False
    
    try:
        if event_type == 'push':
            # Obsługa push event
            push_event = GitHubPushEvent(**payload)
            
            logger.info(
                "🔀 Przetwarzanie push event",
                ref=push_event.ref,
                commits_count=len(push_event.commits),
                repository=push_event.repository.get('full_name', 'unknown')
            )
            
            # Przetwórz tylko jeśli to push do głównej gałęzi
            if push_event.ref in ['refs/heads/main', 'refs/heads/master']:
                processed_files = await process_policy_files(
                    push_event.commits,
                    event_emitter,
                    source="github_push"
                )
                event_processed = True
            else:
                logger.info("⏭️ Ignorowanie push do gałęzi", ref=push_event.ref)
        
        elif event_type == 'pull_request':
            # Obsługa pull request event
            pr_event = GitHubPullRequestEvent(**payload)
            
            logger.info(
                "📬 Przetwarzanie pull request event",
                action=pr_event.action,
                pr_number=pr_event.number,
                repository=pr_event.repository.get('full_name', 'unknown')
            )
            
            # Przetwórz tylko przy merged/closed
            if pr_event.action in ['closed'] and pr_event.pull_request.get('merged', False):
                # W rzeczywistej implementacji można by pobrać pliki z PR
                logger.info("✅ PR został zmergowany - sprawdzanie policy files")
                event_processed = True
            else:
                logger.info("⏭️ Ignorowanie PR action", action=pr_event.action)
        
        else:
            logger.info("⏭️ Nieobsługiwany typ eventu", event_type=event_type)
        
        # Logowanie wyników
        if event_processed:
            if processed_files > 0:
                logger.info(
                    "✅ Webhook przetworzony pomyślnie",
                    event_type=event_type,
                    files_processed=processed_files
                )
            else:
                logger.info("✅ Webhook przetworzony - brak plików policy")
        
        return WebhookResponse(
            processed=event_processed,
            message=f"Processed {event_type} event with {processed_files} policy files",
            event_id=delivery_id
        )
    
    except Exception as e:
        logger.error(
            "❌ Błąd podczas przetwarzania webhook",
            event_type=event_type,
            delivery_id=delivery_id,
            error=str(e)
        )
        
        return WebhookResponse(
            processed=False,
            message=f"Error processing {event_type} event: {str(e)}",
            event_id=delivery_id
        )

@router.get("/github/test")
async def test_github_webhook():
    """Test endpoint dla webhook GitHub"""
    return {
        "status": "ok",
        "message": "GitHub webhook endpoint is ready",
        "webhook_url": f"{settings.github_webhook_path}",
        "signature_verification": bool(settings.github_webhook_secret)
    } 