"""Application Layer - Business Logic Services"""
from typing import Optional, List
from datetime import datetime
from ..domain.entities import Order, OrderStatus, Debt, Customer


class OrderService:
    """Order management service"""
    
    async def create_order(self, business_id: str, employee_id: str,
                          customer_name: str, items: list, 
                          is_credit: bool = False,
                          customer_id: Optional[str] = None) -> Order:
        """Create new order"""
        order = Order(
            business_id=business_id,
            employee_id=employee_id,
            customer_id=customer_id,
            customer_name=customer_name,
            is_credit=is_credit,
            status=OrderStatus.DRAFT
        )
        
        total = 0
        for item_data in items:
            subtotal = item_data.get('unit_price', 0) * item_data.get('quantity', 0)
            order.items.append({
                'product_id': item_data.get('product_id'),
                'product_name': item_data.get('product_name'),
                'quantity': item_data.get('quantity'),
                'unit': item_data.get('unit'),
                'unit_price': item_data.get('unit_price'),
                'subtotal': subtotal
            })
            total += subtotal
        
        order.total_amount = total
        return order
    
    async def confirm_order(self, order: Order) -> Order:
        """Confirm order"""
        order.status = OrderStatus.CONFIRMED
        order.updated_at = datetime.now()
        return order
    
    async def get_daily_revenue(self, orders: List[Order]) -> float:
        """Calculate daily revenue"""
        return sum(o.total_amount for o in orders if o.status == OrderStatus.COMPLETED)


class DebtService:
    """Debt management service"""
    
    async def record_debt(self, customer: Customer, order_id: str, 
                         amount: float) -> Debt:
        """Record customer debt"""
        debt = Debt(
            business_id=customer.business_id,
            customer_id=customer.id,
            order_id=order_id,
            amount=amount,
            remaining_debt=amount
        )
        
        customer.outstanding_debt += amount
        return debt
    
    async def pay_debt(self, debt: Debt, payment_amount: float) -> Debt:
        """Record debt payment"""
        if payment_amount > 0:
            debt.remaining_debt -= payment_amount
            if debt.remaining_debt <= 0:
                debt.is_paid = True
                debt.paid_date = datetime.now()
                debt.remaining_debt = 0
        return debt


class ReportService:
    """Analytics and reporting service"""
    
    async def calculate_analytics(self, orders: List[Order], 
                                 customers: List[Customer],
                                 debts: List[Debt]) -> dict:
        """Calculate business analytics"""
        completed_orders = [o for o in orders if o.status == OrderStatus.COMPLETED]
        total_revenue = sum(o.total_amount for o in completed_orders)
        avg_order = total_revenue / len(completed_orders) if completed_orders else 0
        outstanding_debt = sum(d.remaining_debt for d in debts if not d.is_paid)
        
        return {
            'total_revenue': total_revenue,
            'total_orders': len(completed_orders),
            'total_customers': len(customers),
            'outstanding_debt': outstanding_debt,
            'average_order_value': avg_order
        }
    
    async def get_top_sellers(self, orders: List[Order]) -> List[dict]:
        """Get top-selling products"""
        product_sales = {}
        for order in orders:
            for item in order.items:
                if item['product_id'] not in product_sales:
                    product_sales[item['product_id']] = {
                        'name': item['product_name'],
                        'quantity': 0,
                        'revenue': 0
                    }
                product_sales[item['product_id']]['quantity'] += item['quantity']
                product_sales[item['product_id']]['revenue'] += item['subtotal']
        
        return sorted(product_sales.values(), key=lambda x: x['revenue'], reverse=True)[:10]


class AIOrderService:
    """AI-powered order service"""
    
    async def create_draft_from_text(self, business_id: str, 
                                     text_input: str) -> dict:
        """Convert natural language to draft order"""
        # TODO: Implement LLM integration (OpenAI/Gemini + ChromaDB)
        return {
            'customer_name': '',
            'items': [],
            'total_amount': 0.0,
            'confidence': 0.0
        }
    
    async def create_draft_from_voice(self, business_id: str,
                                     audio_data: bytes) -> dict:
        """Convert voice to draft order"""
        # TODO: Implement speech-to-text + LLM
        return {
            'customer_name': '',
            'items': [],
            'total_amount': 0.0,
            'confidence': 0.0
        }
