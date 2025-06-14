"""
REST API router dla zarządzania politykami
"""
import structlog
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query, Request
from fastapi.responses import JSONResponse

from ..models import (
    Policy,
    PolicyCreate,
    PolicyUpdate,
    PolicyStatus,
    PolicyType,
    APIResponse
)
from ..services.event_emitter import EventEmitter
from ..services.policy_storage import PolicyStorage

logger = structlog.get_logger()
router = APIRouter()

def get_services(request: Request):
    """Dependency do pobrania serwisów z app state"""
    return {
        'event_emitter': request.app.state.event_emitter,
        'policy_storage': request.app.state.policy_storage
    }

@router.get("/policies", response_model=List[Policy])
async def list_policies(
    status: Optional[PolicyStatus] = Query(None, description="Filtruj po statusie"),
    type: Optional[PolicyType] = Query(None, description="Filtruj po typie"),
    limit: int = Query(100, ge=1, le=1000, description="Maksymalna liczba wyników"),
    offset: int = Query(0, ge=0, description="Przesunięcie dla paginacji"),
    services: Dict = Depends(get_services)
):
    """
    Pobierz listę polityk z opcjonalnym filtrowaniem
    """
    policy_storage: PolicyStorage = services['policy_storage']
    
    logger.info(
        "📋 Pobieranie listy polityk",
        status=status.value if status else None,
        type=type.value if type else None,
        limit=limit,
        offset=offset
    )
    
    try:
        policies = await policy_storage.list_policies(
            status=status,
            limit=limit,
            offset=offset
        )
        
        # Dodatkowe filtrowanie po typie (PolicyStorage nie ma tej opcji)
        if type:
            policies = [p for p in policies if p.type == type]
        
        logger.info(f"✅ Zwrócono {len(policies)} polityk")
        return policies
        
    except Exception as e:
        logger.error("❌ Błąd podczas pobierania polityk", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Błąd podczas pobierania polityk"
        )

@router.get("/policies/{policy_id}", response_model=Policy)
async def get_policy(
    policy_id: str,
    services: Dict = Depends(get_services)
):
    """
    Pobierz politykę po ID
    """
    policy_storage: PolicyStorage = services['policy_storage']
    
    logger.info("🔍 Pobieranie polityki", policy_id=policy_id)
    
    policy = await policy_storage.get_policy(policy_id)
    if not policy:
        logger.warning("❌ Polityka nie znaleziona", policy_id=policy_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Polityka {policy_id} nie została znaleziona"
        )
    
    logger.info("✅ Polityka znaleziona", policy_id=policy_id, name=policy.name)
    return policy

@router.post("/policies", response_model=Policy, status_code=status.HTTP_201_CREATED)
async def create_policy(
    policy_data: PolicyCreate,
    services: Dict = Depends(get_services)
):
    """
    Utwórz nową politykę
    """
    policy_storage: PolicyStorage = services['policy_storage']
    event_emitter: EventEmitter = services['event_emitter']
    
    logger.info("➕ Tworzenie nowej polityki", name=policy_data.name, type=policy_data.type.value)
    
    try:
        # Sprawdź czy polityka o tej nazwie już istnieje
        existing_policy = await policy_storage.get_policy_by_name(policy_data.name)
        if existing_policy:
            logger.warning("❌ Polityka o tej nazwie już istnieje", name=policy_data.name)
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Polityka o nazwie '{policy_data.name}' już istnieje"
            )
        
        # Utwórz politykę
        policy = await policy_storage.create_policy(policy_data)
        
        # Emit event o utworzeniu
        await event_emitter.emit_policy_created(
            policy_id=policy.id,
            policy_name=policy.name,
            policy_content=policy.content,
            metadata={
                "type": policy.type.value,
                "status": policy.status.value,
                "version": policy.version
            }
        )
        
        logger.info("✅ Polityka utworzona", policy_id=policy.id, name=policy.name)
        return policy
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("❌ Błąd podczas tworzenia polityki", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Błąd podczas tworzenia polityki"
        )

@router.put("/policies/{policy_id}", response_model=Policy)
async def update_policy(
    policy_id: str,
    updates: PolicyUpdate,
    services: Dict = Depends(get_services)
):
    """
    Aktualizuj politykę
    """
    policy_storage: PolicyStorage = services['policy_storage']
    event_emitter: EventEmitter = services['event_emitter']
    
    logger.info("🔄 Aktualizacja polityki", policy_id=policy_id)
    
    try:
        # Sprawdź czy polityka istnieje
        existing_policy = await policy_storage.get_policy(policy_id)
        if not existing_policy:
            logger.warning("❌ Polityka nie znaleziona", policy_id=policy_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Polityka {policy_id} nie została znaleziona"
            )
        
        # Sprawdź konflikt nazw (jeśli nazwa się zmienia)
        if updates.name and updates.name != existing_policy.name:
            conflicting_policy = await policy_storage.get_policy_by_name(updates.name)
            if conflicting_policy and conflicting_policy.id != policy_id:
                logger.warning(
                    "❌ Konflikt nazwy polityki",
                    new_name=updates.name,
                    existing_id=conflicting_policy.id
                )
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Polityka o nazwie '{updates.name}' już istnieje"
                )
        
        # Aktualizuj politykę
        updated_policy = await policy_storage.update_policy(policy_id, updates)
        
        # Emit event o aktualizacji
        await event_emitter.emit_policy_update(
            policy_id=updated_policy.id,
            policy_name=updated_policy.name,
            source="api",
            metadata={
                "action": "updated",
                "version": updated_policy.version,
                "updated_fields": list(updates.dict(exclude_unset=True).keys())
            }
        )
        
        logger.info("✅ Polityka zaktualizowana", policy_id=policy_id, version=updated_policy.version)
        return updated_policy
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("❌ Błąd podczas aktualizacji polityki", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Błąd podczas aktualizacji polityki"
        )

@router.delete("/policies/{policy_id}", response_model=APIResponse)
async def delete_policy(
    policy_id: str,
    services: Dict = Depends(get_services)
):
    """
    Usuń politykę
    """
    policy_storage: PolicyStorage = services['policy_storage']
    event_emitter: EventEmitter = services['event_emitter']
    
    logger.info("🗑️ Usuwanie polityki", policy_id=policy_id)
    
    try:
        # Pobierz politykę przed usunięciem (dla eventu)
        policy = await policy_storage.get_policy(policy_id)
        if not policy:
            logger.warning("❌ Polityka nie znaleziona", policy_id=policy_id)
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Polityka {policy_id} nie została znaleziona"
            )
        
        # Usuń politykę
        deleted = await policy_storage.delete_policy(policy_id)
        
        if deleted:
            # Emit event o usunięciu
            await event_emitter.emit_policy_deleted(
                policy_id=policy.id,
                policy_name=policy.name,
                metadata={
                    "type": policy.type.value,
                    "version": policy.version
                }
            )
            
            logger.info("✅ Polityka usunięta", policy_id=policy_id, name=policy.name)
            return APIResponse(
                success=True,
                message=f"Polityka '{policy.name}' została usunięta",
                data={"policy_id": policy_id}
            )
        else:
            logger.error("❌ Nie udało się usunąć polityki", policy_id=policy_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Nie udało się usunąć polityki"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error("❌ Błąd podczas usuwania polityki", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Błąd podczas usuwania polityki"
        )

@router.get("/policies/search", response_model=List[Policy])
async def search_policies(
    q: str = Query(..., min_length=2, description="Szukany tekst (min. 2 znaki)"),
    services: Dict = Depends(get_services)
):
    """
    Wyszukaj polityki po nazwie, opisie lub zawartości
    """
    policy_storage: PolicyStorage = services['policy_storage']
    
    logger.info("🔍 Wyszukiwanie polityk", query=q)
    
    try:
        results = await policy_storage.search_policies(q)
        
        logger.info(f"✅ Znaleziono {len(results)} polityk", query=q)
        return results
        
    except Exception as e:
        logger.error("❌ Błąd podczas wyszukiwania polityk", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Błąd podczas wyszukiwania polityk"
        )

@router.get("/policies/statistics")
async def get_statistics(
    services: Dict = Depends(get_services)
):
    """
    Pobierz statystyki polityk
    """
    policy_storage: PolicyStorage = services['policy_storage']
    
    logger.info("📊 Pobieranie statystyk polityk")
    
    try:
        stats = await policy_storage.get_statistics()
        
        logger.info("✅ Statystyki pobrane", total=stats["total"])
        return stats
        
    except Exception as e:
        logger.error("❌ Błąd podczas pobierania statystyk", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Błąd podczas pobierania statystyk"
        )

@router.post("/policies/import", response_model=APIResponse)
async def import_policies(
    policies_data: List[Dict],
    services: Dict = Depends(get_services)
):
    """
    Importuj polityki z listy
    """
    policy_storage: PolicyStorage = services['policy_storage']
    
    logger.info("📥 Import polityk", count=len(policies_data))
    
    try:
        imported_count = await policy_storage.import_policies(policies_data)
        
        logger.info("✅ Import zakończony", imported=imported_count, total=len(policies_data))
        return APIResponse(
            success=True,
            message=f"Zaimportowano {imported_count} z {len(policies_data)} polityk",
            data={"imported": imported_count, "total": len(policies_data)}
        )
        
    except Exception as e:
        logger.error("❌ Błąd podczas importu polityk", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Błąd podczas importu polityk"
        )

@router.get("/policies/export")
async def export_policies(
    services: Dict = Depends(get_services)
):
    """
    Eksportuj wszystkie polityki
    """
    policy_storage: PolicyStorage = services['policy_storage']
    
    logger.info("📤 Eksport polityk")
    
    try:
        policies = await policy_storage.export_policies()
        
        logger.info("✅ Eksport zakończony", count=len(policies))
        return {
            "success": True,
            "count": len(policies),
            "policies": policies
        }
        
    except Exception as e:
        logger.error("❌ Błąd podczas eksportu polityk", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Błąd podczas eksportu polityk"
        )

@router.post("/policies/bulk-update", response_model=APIResponse)
async def bulk_update_policies(
    policy_ids: List[str],
    updates: PolicyUpdate,
    services: Dict = Depends(get_services)
):
    """
    Masowa aktualizacja polityk
    """
    policy_storage: PolicyStorage = services['policy_storage']
    event_emitter: EventEmitter = services['event_emitter']
    
    logger.info("🔄 Masowa aktualizacja polityk", count=len(policy_ids))
    
    try:
        updated_count = 0
        errors = []
        
        for policy_id in policy_ids:
            try:
                updated_policy = await policy_storage.update_policy(policy_id, updates)
                if updated_policy:
                    # Emit event dla każdej zaktualizowanej polityki
                    await event_emitter.emit_policy_update(
                        policy_id=updated_policy.id,
                        policy_name=updated_policy.name,
                        source="api_bulk",
                        metadata={
                            "action": "bulk_updated",
                            "version": updated_policy.version
                        }
                    )
                    updated_count += 1
                else:
                    errors.append(f"Polityka {policy_id} nie znaleziona")
            except Exception as e:
                errors.append(f"Błąd dla {policy_id}: {str(e)}")
        
        logger.info("✅ Masowa aktualizacja zakończona", updated=updated_count, errors=len(errors))
        
        return APIResponse(
            success=len(errors) == 0,
            message=f"Zaktualizowano {updated_count} z {len(policy_ids)} polityk",
            data={
                "updated": updated_count,
                "total": len(policy_ids),
                "errors": errors
            }
        )
        
    except Exception as e:
        logger.error("❌ Błąd podczas masowej aktualizacji", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Błąd podczas masowej aktualizacji"
        )