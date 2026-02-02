"""
AI / LLM integration services for natural language order processing
---------------------------------------------------------------
- Extract order from text / voice
- Retrieval-Augmented Generation (RAG)
- Automatic bookkeeping (Circular 88/2021/TT-BTC)
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
import uuid
import datetime
import logging

# ===============================================================
# CONFIGURATION
# ===============================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AI_SERVICES")


@dataclass
class AIConfig:
    """AI configuration"""
    openai_api_key: str = ""
    google_api_key: str = ""
    chroma_collection: str = "bizflow_products"
    language: str = "vi"
    confidence_threshold: float = 0.7


# ===============================================================
# DATA MODELS
# ===============================================================

@dataclass
class OrderItem:
    product_id: str
    product_name: str
    quantity: float
    unit_price: float

    def total_price(self) -> float:
        return self.quantity * self.unit_price


@dataclass
class Order:
    order_id: str
    business_id: str
    customer_name: str
    items: List[OrderItem] = field(default_factory=list)
    confidence: float = 0.0
    created_at: datetime.datetime = field(default_factory=datetime.datetime.utcnow)

    def total_amount(self) -> float:
        return sum(item.total_price() for item in self.items)


# ===============================================================
# UTILITIES
# ===============================================================

class TextUtils:
    """Utility functions for text processing"""

    @staticmethod
    def normalize(text: str) -> str:
        return text.lower().strip()

    @staticmethod
    def contains(text: str, keyword: str) -> bool:
        return keyword.lower() in text.lower()


class ValidationUtils:
    """Validation helper"""

    @staticmethod
    def validate_business_id(business_id: str):
        if not business_id:
            raise ValueError("business_id is required")

    @staticmethod
    def validate_text(text: str):
        if not text or not text.strip():
            raise ValueError("Input text is empty")


# ===============================================================
# LLM SERVICE
# ===============================================================

class LLMService:
    """Large Language Model service"""

    def __init__(self, config: AIConfig):
        self.config = config

    async def extract_order_from_text(
        self,
        business_id: str,
        text: str
    ) -> Dict[str, Any]:
        """
        Extract structured order from natural language text
        """

        ValidationUtils.validate_business_id(business_id)

        if not text or not text.strip():
            return self._empty_result(business_id)

        normalized_text = TextUtils.normalize(text)
        logger.info("Extracting order from text: %s", normalized_text)

        items: List[OrderItem] = []

        # ---------------- MOCK NLP LOGIC ----------------

        if "cà phê" in normalized_text:
            items.append(
                OrderItem(
                    product_id="CF001",
                    product_name="Cà phê đen",
                    quantity=1,
                    unit_price=20000
                )
            )

        if "trà sữa" in normalized_text:
            items.append(
                OrderItem(
                    product_id="TS001",
                    product_name="Trà sữa truyền thống",
                    quantity=1,
                    unit_price=30000
                )
            )

        if "bánh" in normalized_text:
            items.append(
                OrderItem(
                    product_id="B001",
                    product_name="Bánh ngọt",
                    quantity=2,
                    unit_price=15000
                )
            )

        confidence = 0.9 if items else 0.2

        order = Order(
            order_id=str(uuid.uuid4()),
            business_id=business_id,
            customer_name="Khách lẻ",
            items=items,
            confidence=confidence
        )

        return self._order_to_dict(order)

    async def extract_order_from_voice(
        self,
        business_id: str,
        audio_bytes: bytes
    ) -> Dict[str, Any]:
        """
        Convert speech to text then extract order
        """
        ValidationUtils.validate_business_id(business_id)

        text = await self.speech_to_text(audio_bytes)
        return await self.extract_order_from_text(business_id, text)

    async def speech_to_text(self, audio_bytes: bytes) -> str:
        """
        Mock Speech-to-Text pipeline
        """
        if not audio_bytes:
            return ""

        logger.info("Speech-to-text: %d bytes received", len(audio_bytes))

        # MOCK RESULT
        return "Cho tôi một cà phê và hai cái bánh"

    # ---------------- INTERNAL HELPERS ----------------

    def _order_to_dict(self, order: Order) -> Dict[str, Any]:
        return {
            "order_id": order.order_id,
            "business_id": order.business_id,
            "customer_name": order.customer_name,
            "items": [
                {
                    "product_id": i.product_id,
                    "product_name": i.product_name,
                    "quantity": i.quantity,
                    "unit_price": i.unit_price,
                    "total_price": i.total_price()
                }
                for i in order.items
            ],
            "total_amount": order.total_amount(),
            "confidence": order.confidence,
            "created_at": order.created_at.isoformat()
        }

    def _empty_result(self, business_id: str) -> Dict[str, Any]:
        return {
            "business_id": business_id,
            "customer_name": "",
            "items": [],
            "confidence": 0.0
        }


# ===============================================================
# RAG SERVICE
# ===============================================================

class RAGService:
    """Retrieval-Augmented Generation service"""

    def __init__(self, config: AIConfig):
        self.config = config

    async def retrieve_product_info(
        self,
        business_id: str,
        query: str
    ) -> List[Dict[str, Any]]:
        ValidationUtils.validate_business_id(business_id)

        logger.info("RAG retrieve: %s", query)

        # MOCK VECTOR SEARCH RESULT
        return [
            {
                "product_id": "CF001",
                "name": "Cà phê đen",
                "price": 20000,
                "stock": 120,
                "similarity": 0.92
            },
            {
                "product_id": "B001",
                "name": "Bánh ngọt",
                "price": 15000,
                "stock": 50,
                "similarity": 0.81
            }
        ]

    async def augment_prompt(
        self,
        business_id: str,
        prompt: str
    ) -> str:
        products = await self.retrieve_product_info(business_id, prompt)

        context_lines = []
        for p in products:
            context_lines.append(
                f"- {p['name']} | Giá: {p['price']} | Tồn: {p['stock']}"
            )

        context = "\n".join(context_lines)

        augmented_prompt = f"""
        Thông tin sản phẩm liên quan:
        {context}

        Yêu cầu của khách hàng:
        {prompt}
        """

        return augmented_prompt.strip()


# ===============================================================
# BOOKKEEPING SERVICE
# ===============================================================

class BookkeepingService:
    """
    Automatic bookkeeping service
    Circular 88/2021/TT-BTC
    """

    async def record_sale(
        self,
        business_id: str,
        order_id: str,
        amount: float,
        items: list
    ) -> Dict[str, Any]:

        ValidationUtils.validate_business_id(business_id)

        return {
            "business_id": business_id,
            "record_type": "REVENUE",
            "order_id": order_id,
            "amount": amount,
            "items": items,
            "recorded_at": datetime.datetime.utcnow().isoformat()
        }

    async def record_debt_transaction(
        self,
        business_id: str,
        debt_id: str,
        amount: float
    ) -> Dict[str, Any]:

        ValidationUtils.validate_business_id(business_id)

        return {
            "business_id": business_id,
            "record_type": "DEBT",
            "debt_id": debt_id,
            "amount": amount,
            "recorded_at": datetime.datetime.utcnow().isoformat()
        }

    async def record_inventory_import(
        self,
        business_id: str,
        product_id: str,
        quantity: float
    ) -> Dict[str, Any]:

        ValidationUtils.validate_business_id(business_id)

        return {
            "business_id": business_id,
            "record_type": "INVENTORY_IMPORT",
            "product_id": product_id,
            "quantity": quantity,
            "recorded_at": datetime.datetime.utcnow().isoformat()
        }

    async def generate_accounting_report(
        self,
        business_id: str,
        start_date,
        end_date
    ) -> Dict[str, Any]:

        ValidationUtils.validate_business_id(business_id)

        return {
            "business_id": business_id,
            "period": f"{start_date} to {end_date}",
            "revenue_ledger": [],
            "debt_ledger": [],
            "inventory_ledger": [],
            "generated_at": datetime.datetime.utcnow().isoformat()
        }
