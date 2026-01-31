"""Validation utilities and validators"""
import re
from typing import Optional
from ..application.exceptions import ValidationException


class Validators:
    """Common validators"""
    
    @staticmethod
    def validate_email(email: str) -> str:
        """Validate email format"""
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if not re.match(email_regex, email):
            raise ValidationException(
                "Invalid email format",
                detail={"field": "email", "value": email}
            )
        
        return email
    
    @staticmethod
    def validate_password(password: str, min_length: int = 6) -> str:
        """Validate password strength"""
        if len(password) < min_length:
            raise ValidationException(
                f"Password must be at least {min_length} characters long",
                detail={"field": "password", "min_length": min_length}
            )
        
        return password
    
    @staticmethod
    def validate_phone(phone: str) -> str:
        """Validate Vietnamese phone number"""
        # Simple validation: 10-11 digits, starting with 0 or +84
        phone_regex = r'^(\+84|0)[0-9]{8,10}$'
        
        if not re.match(phone_regex, phone):
            raise ValidationException(
                "Invalid phone number format",
                detail={"field": "phone", "value": phone}
            )
        
        return phone
    
    @staticmethod
    def validate_positive_number(value: float, field_name: str = "value") -> float:
        """Validate positive number"""
        if value <= 0:
            raise ValidationException(
                f"{field_name} must be positive",
                detail={"field": field_name, "value": value}
            )
        
        return value
    
    @staticmethod
    def validate_non_negative_number(value: float, field_name: str = "value") -> float:
        """Validate non-negative number"""
        if value < 0:
            raise ValidationException(
                f"{field_name} must be non-negative",
                detail={"field": field_name, "value": value}
            )
        
        return value
    
    @staticmethod
    def validate_string_length(
        value: str,
        min_length: int = 0,
        max_length: int = 255,
        field_name: str = "value"
    ) -> str:
        """Validate string length"""
        if len(value) < min_length or len(value) > max_length:
            raise ValidationException(
                f"{field_name} length must be between {min_length} and {max_length}",
                detail={
                    "field": field_name,
                    "length": len(value),
                    "min": min_length,
                    "max": max_length
                }
            )
        
        return value
    
    @staticmethod
    def validate_not_empty(value: Optional[str], field_name: str = "value") -> str:
        """Validate string is not empty"""
        if not value or not value.strip():
            raise ValidationException(
                f"{field_name} cannot be empty",
                detail={"field": field_name}
            )
        
        return value.strip()
    
    @staticmethod
    def validate_integer(value: int, field_name: str = "value") -> int:
        """Validate integer"""
        try:
            return int(value)
        except (ValueError, TypeError):
            raise ValidationException(
                f"{field_name} must be an integer",
                detail={"field": field_name, "value": value}
            )
    
    @staticmethod
    def validate_in_choices(
        value: str,
        choices: list,
        field_name: str = "value"
    ) -> str:
        """Validate value is in choices"""
        if value not in choices:
            raise ValidationException(
                f"{field_name} must be one of: {', '.join(choices)}",
                detail={"field": field_name, "value": value, "choices": choices}
            )
        
        return value


class ProductValidator:
    """Product-specific validators"""
    
    @staticmethod
    def validate_create(name: str, price: float, cost: float) -> dict:
        """Validate product creation data"""
        name = Validators.validate_not_empty(name, "name")
        name = Validators.validate_string_length(name, 1, 255, "name")
        
        price = Validators.validate_positive_number(price, "price")
        cost = Validators.validate_non_negative_number(cost, "cost")
        
        if cost > price:
            raise ValidationException(
                "Cost cannot be greater than price",
                detail={"cost": cost, "price": price}
            )
        
        return {"name": name, "price": price, "cost": cost}


class OrderValidator:
    """Order-specific validators"""
    
    @staticmethod
    def validate_create(customer_name: str, items: list) -> dict:
        """Validate order creation data"""
        customer_name = Validators.validate_not_empty(customer_name, "customer_name")
        
        if not items or len(items) == 0:
            raise ValidationException(
                "Order must have at least one item",
                detail={"field": "items"}
            )
        
        return {"customer_name": customer_name, "items": items}
    
    @staticmethod
    def validate_item(product_id: str, quantity: int, unit_price: float) -> dict:
        """Validate order item"""
        product_id = Validators.validate_not_empty(product_id, "product_id")
        quantity = Validators.validate_positive_number(quantity, "quantity")
        unit_price = Validators.validate_non_negative_number(unit_price, "unit_price")
        
        return {
            "product_id": product_id,
            "quantity": quantity,
            "unit_price": unit_price
        }
