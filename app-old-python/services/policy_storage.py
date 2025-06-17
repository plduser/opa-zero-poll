"""
Serwis do przechowywania policy
"""
import uuid
import structlog
from datetime import datetime
from typing import Dict, List, Optional
from ..models import Policy, PolicyCreate, PolicyUpdate, PolicyStatus

logger = structlog.get_logger()

class PolicyStorage:
    """Serwis do przechowywania policy - implementacja in-memory"""
    
    def __init__(self):
        self._policies: Dict[str, Policy] = {}
        logger.info("📋 PolicyStorage zainicjalizowany (in-memory)")
    
    async def create_policy(self, policy_data: PolicyCreate) -> Policy:
        """
        Utwórz nową politykę
        
        Args:
            policy_data: Dane nowej polityki
            
        Returns:
            Policy: Utworzona polityka
        """
        policy_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        policy = Policy(
            id=policy_id,
            name=policy_data.name,
            description=policy_data.description,
            type=policy_data.type,
            status=policy_data.status,
            content=policy_data.content,
            metadata=policy_data.metadata or {},
            created_at=now,
            updated_at=now,
            version=1
        )
        
        self._policies[policy_id] = policy
        
        logger.info(
            "✅ Polityka utworzona",
            policy_id=policy_id,
            name=policy.name,
            type=policy.type.value
        )
        
        return policy
    
    async def get_policy(self, policy_id: str) -> Optional[Policy]:
        """
        Pobierz politykę po ID
        
        Args:
            policy_id: ID polityki
            
        Returns:
            Policy lub None jeśli nie znaleziono
        """
        return self._policies.get(policy_id)
    
    async def get_policy_by_name(self, name: str) -> Optional[Policy]:
        """
        Pobierz politykę po nazwie
        
        Args:
            name: Nazwa polityki
            
        Returns:
            Policy lub None jeśli nie znaleziono
        """
        for policy in self._policies.values():
            if policy.name == name:
                return policy
        return None
    
    async def list_policies(
        self,
        status: Optional[PolicyStatus] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Policy]:
        """
        Lista polityk z opcjonalnym filtrowaniem
        
        Args:
            status: Filtruj po statusie
            limit: Maksymalna liczba wyników
            offset: Przesunięcie dla paginacji
            
        Returns:
            Lista polityk
        """
        policies = list(self._policies.values())
        
        # Filtruj po statusie
        if status:
            policies = [p for p in policies if p.status == status]
        
        # Sortuj po dacie utworzenia (najnowsze najpierw)
        policies.sort(key=lambda p: p.created_at, reverse=True)
        
        # Paginacja
        return policies[offset:offset + limit]
    
    async def update_policy(self, policy_id: str, updates: PolicyUpdate) -> Optional[Policy]:
        """
        Aktualizuj politykę
        
        Args:
            policy_id: ID polityki
            updates: Dane do aktualizacji
            
        Returns:
            Zaktualizowana polityka lub None jeśli nie znaleziono
        """
        policy = self._policies.get(policy_id)
        if not policy:
            return None
        
        # Przygotuj dane do aktualizacji
        update_data = updates.dict(exclude_unset=True)
        
        # Aktualizuj tylko podane pola
        for field, value in update_data.items():
            if hasattr(policy, field):
                setattr(policy, field, value)
        
        # Aktualizuj metadata
        policy.updated_at = datetime.utcnow()
        policy.version += 1
        
        logger.info(
            "🔄 Polityka zaktualizowana",
            policy_id=policy_id,
            name=policy.name,
            version=policy.version,
            updated_fields=list(update_data.keys())
        )
        
        return policy
    
    async def delete_policy(self, policy_id: str) -> bool:
        """
        Usuń politykę
        
        Args:
            policy_id: ID polityki
            
        Returns:
            True jeśli usunięto, False jeśli nie znaleziono
        """
        if policy_id in self._policies:
            policy = self._policies.pop(policy_id)
            logger.info(
                "🗑️ Polityka usunięta",
                policy_id=policy_id,
                name=policy.name
            )
            return True
        return False
    
    async def search_policies(self, query: str) -> List[Policy]:
        """
        Wyszukaj polityki po nazwie lub opisie
        
        Args:
            query: Szukany tekst
            
        Returns:
            Lista znalezionych polityk
        """
        query_lower = query.lower()
        results = []
        
        for policy in self._policies.values():
            # Szukaj w nazwie, opisie i content
            if (query_lower in policy.name.lower() or
                (policy.description and query_lower in policy.description.lower()) or
                query_lower in policy.content.lower()):
                results.append(policy)
        
        # Sortuj po relevance (nazwa > opis > content)
        def relevance_score(policy: Policy) -> int:
            score = 0
            if query_lower in policy.name.lower():
                score += 10
            if policy.description and query_lower in policy.description.lower():
                score += 5
            if query_lower in policy.content.lower():
                score += 1
            return score
        
        results.sort(key=relevance_score, reverse=True)
        return results
    
    async def get_statistics(self) -> Dict[str, int]:
        """
        Pobierz statystyki polityk
        
        Returns:
            Dict ze statystykami
        """
        total = len(self._policies)
        by_status = {}
        by_type = {}
        
        for policy in self._policies.values():
            # Statystyki po statusie
            status_key = policy.status.value
            by_status[status_key] = by_status.get(status_key, 0) + 1
            
            # Statystyki po typie
            type_key = policy.type.value
            by_type[type_key] = by_type.get(type_key, 0) + 1
        
        return {
            "total": total,
            "by_status": by_status,
            "by_type": by_type
        }
    
    async def export_policies(self) -> List[Dict]:
        """
        Eksportuj wszystkie polityki jako dict
        
        Returns:
            Lista polityk jako słowniki
        """
        return [policy.dict() for policy in self._policies.values()]
    
    async def import_policies(self, policies_data: List[Dict]) -> int:
        """
        Importuj polityki z listy słowników
        
        Args:
            policies_data: Lista polityk jako słowniki
            
        Returns:
            Liczba zaimportowanych polityk
        """
        imported_count = 0
        
        for policy_dict in policies_data:
            try:
                policy = Policy(**policy_dict)
                self._policies[policy.id] = policy
                imported_count += 1
                
                logger.info(
                    "📥 Polityka zaimportowana",
                    policy_id=policy.id,
                    name=policy.name
                )
                
            except Exception as e:
                logger.error(
                    "❌ Błąd podczas importu polityki",
                    error=str(e),
                    policy_data=policy_dict
                )
        
        logger.info(f"📦 Zaimportowano {imported_count} polityk")
        return imported_count 