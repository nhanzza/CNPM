"""
AI / LLM integration services for natural language order processing
Author: Refactored & expanded
Purpose:
- Extract orders from text / voice
- Retrieval-Augmented Generation (RAG)
- Automatic bookkeeping (Circular 88/2021/TT-BTC)
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
import uuid
import logging
import datetime

# ------------------------------------------------------------------
# Logging config
# ------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# Data Models
# ------------------------------------------------------------------

@dataclass
class AIConfig:
    """AI configuration"""
    openai_api_key: str = ""
    google_api_key: str = ""
    chroma_collection: str = "bizflow_products"
    language: str = "vi"


@dataclass
class OrderItem:
    product_id: str
    product_name: str
    quantity: float
    unit_price: float

    @property
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

    @property
    def total_amount(self) -> float:
        return sum(item.total_price for item in self.items)


# ------------------------------------------------------------------
# LLM SERVICE
# ------------------------------------------------------------------

class LLMService:
    """
    Large Language Model service
    Responsible for:
    - NLP order extraction
    - Speech to text
    """

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

        if not business_id:
            raise ValueError("business_id is required")

        if not text or not text.strip():
            return {
                "business_id": business_id,
                "customer_name": "",
                "items": [],
                "confidence": 0.0
            }

        logger.info("Extracting order from text: %s", text)

        # ---- MOCK NLP LOGIC (replace by OpenAI / Gemini later) ----
        items = []

        if "cà phê" in text.lower():
            items.append(
                OrderItem(
                    product_id="CF001",
                    product_name="Cà phê đen",
                    quantity=1,
                    unit_price=20000
                )
            )

        if "bánh" in text.lower():
            items.append(
                OrderItem(
                    product_id="B001",
                    product_name="Bánh ngọt",
                    quantity=2,
                    unit_price=15000
                )
            )

        order = Order(
            order_id=str(uuid.uuid4()),
            business_id=business_id,
            customer_name="Khách lẻ",
            items=items,
            confidence=0.85 if items else 0.3
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
        text = await self.speech_to_text(audio_bytes)
        return await self.extract_order_from_text(business_id, text)

    async def speech_to_text(self, audio_bytes: bytes) -> str:
        """
        Mock speech-to-text (replace by Google / Whisper)
        """
        if not audio_bytes:
            return ""

        logger.info("Converting speech to text (%d bytes)", len(audio_bytes))

        # MOCK result
        return "Cho tôi một cà phê và hai cái bánh"

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
                    "total_price": i.total_price
                }
                for i in order.items
            ],
            "total_amount": order.total_amount,
            "confidence": order.confidence,
            "created_at": order.created_at.isoformat()
        }


# ------------------------------------------------------------------
# RAG SERVICE
# ------------------------------------------------------------------

class RAGService:
    """
    Retrieval-Augmented Generation service
    """

    def __init__(self, config: AIConfig):
        self.config = config

    async def retrieve_product_info(
        self,
        business_id: str,
        query: str
    ) -> List[Dict[str, Any]]:
        """
        Retrieve related product information from vector DB
        """

        logger.info("RAG retrieve for business %s | query: %s", business_id, query)

        # MOCK retrieval result
        return [
            {
                "product_id": "CF001",
                "name": "Cà phê đen",
                "price": 20000,
                "stock": 120
            }
        ]

    async def augment_prompt(
        self,
        business_id: str,
        prompt: str
    ) -> str:
        """
        Inject retrieved knowledge into prompt
        """
        products = await self.retrieve_product_info(business_id, prompt)

        context = "\n".join(
            f"- {p['name']} (Giá: {p['price']}, Tồn: {p['stock']})"
            for p in products
        )

        augmented_prompt = f"""
        Thông tin sản phẩm liên quan:
        {context}

        Yêu cầu khách hàng:
        {prompt}
        """

        return augmented_prompt.strip()


# ------------------------------------------------------------------
# BOOKKEEPING SERVICE
# ------------------------------------------------------------------

class BookkeepingService:
    """
    Automatic bookkeeping service
    Circular 88/2021/TT-BTC compliant
    """

    async def record_sale(
        self,
        business_id: str,
        order: Dict[str, Any]
    ) -> Dict[str, Any]:

        logger.info("Recording sale for business %s", business_id)

        return {
            "business_id": business_id,
            "record_type": "REVENUE",
            "order_id": order["order_id"],
            "amount": order["total_amount"],
            "items": order["items"],
            "recorded_at": datetime.datetime.utcnow().isoformat()
        }

    async def record_debt_transaction(
        self,
        business_id: str,
        debt_id: str,
        amount: float
    ) -> Dict[str, Any]:

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
        quantity: float,
        unit_cost: float
    ) -> Dict[str, Any]:

        return {
            "business_id": business_id,
            "record_type": "INVENTORY_IMPORT",
            "product_id": product_id,
            "quantity": quantity,
            "unit_cost": unit_cost,
            "total_cost": quantity * unit_cost,
            "recorded_at": datetime.datetime.utcnow().isoformat()
        }

    async def generate_accounting_report(
        self,
        business_id: str,
        start_date: datetime.date,
        end_date: datetime.date
    ) -> Dict[str, Any]:

        logger.info(
            "Generating accounting report %s → %s",
            start_date,
            end_date
        )

        return {
            "business_id": business_id,
            "period": f"{start_date} to {end_date}",
            "revenue_ledger": [],
            "debt_ledger": [],
            "inventory_ledger": [],
            "generated_at": datetime.datetime.utcnow().isoformat()
        }

