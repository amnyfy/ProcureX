from abc import ABC, abstractmethod
from typing import List, Dict, Any


class GovernmentTenderSource(ABC):
    """
    Abstract base class for official government procurement portal connectors.
    Follows an adapter pattern for sources like CPPP, GeM, State portals, etc.
    """

    @property
    @abstractmethod
    def source_name(self) -> str:
        """Name of the official portal source (e.g. 'CPPP', 'GeM')."""
        pass

    @property
    @abstractmethod
    def portal_url(self) -> str:
        """Base official portal URL."""
        pass

    @abstractmethod
    def fetch_tenders(self, max_items: int = 50) -> List[Dict[str, Any]]:
        """
        Fetch active public tender listings from official portal.
        Returns normalized tender dictionaries.
        """
        pass
