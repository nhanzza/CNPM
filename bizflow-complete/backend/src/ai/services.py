"""AI/LLM integration services for natural language order processing"""

from dataclasses import dataclass
from typing import List, Dict


@dataclass
class AIConfig:
    """AI configuration"""
    openai_api_key: str = ""
    google_api_key: str = ""
    chroma_collection: str = "bizflow_products"


class LLMService:
    """Large Language Model service"""

    def __init__(self, config: AIConfig):
        self.config = config

    async def extract_order_from_text(self, business_id: str, text: str) -> Dict:
        return {
            "business_id": business_id,
            "customer_name": "",
            "items": [],
            "confidence": 0.0
        }

    async def extract_order_from_voice(self, business_id: str, audio_bytes: bytes) -> Dict:
        text = await self.speech_to_text(audio_bytes)
        return await self.extract_order_from_text(business_id, text)

    async def speech_to_text(self, audio_bytes: bytes) -> str:
        return ""


class RAGService:
    """Retrieval-Augmented Generation service"""

    def __init__(self, config: AIConfig):
        self.config = config

    async def retrieve_product_info(self, business_id: str, query: str) -> List[Dict]:
        return []

    async def augment_prompt(self, business_id: str, prompt: str) -> str:
        _ = await self.retrieve_product_info(business_id, prompt)
        return prompt


class BookkeepingService:
    """Automatic bookkeeping service (Circular 88/2021/TT-BTC)"""

    async def record_sale(
        self,
        business_id: str,
        order_id: str,
        amount: float,
        items: list
    ) -> Dict:
        return {
            "business_id": business_id,
            "record_type": "revenue",
            "order_id": order_id,
            "amount": amount,
            "items": items
        }

    async def record_debt_transaction(
        self,
        business_id: str,
        debt_id: str,
        amount: float
    ) -> Dict:
        return {
            "business_id": business_id,
            "record_type": "debt",
            "debt_id": debt_id,
            "amount": amount
        }

    async def record_inventory_import(
        self,
        business_id: str,
        product_id: str,
        quantity: float
    ) -> Dict:
        return {
            "business_id": business_id,
            "record_type": "inventory_import",
            "product_id": product_id,
            "quantity": quantity
        }

    async def generate_accounting_report(
        self,
        business_id: str,
        start_date,
        end_date
    ) -> Dict:
        return {
            "business_id": business_id,
            "period": f"{start_date} to {end_date}",
            "revenue_ledger": [],
            "debt_ledger": [],
            "inventory_ledger": []
        }

