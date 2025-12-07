class UserRole(str, enum.Enum):
  ADMIN = "admin"
  OWNER = "owner"
  EMPLOYEE = "employee"
  
class OederStatus(str, enum.Enum):
  DRAFT = "draft"
  PENDING = "pending"
  CONFIRMED = "confirmed"
  CANCELLED = "cancelled"

class PaymentStatus(str, enum.Enum):
  PAID = "paid"
  PARTIAL = "partial"
  UNPAID = "unpaid"

class TransactionType(str, enum.Enum):
  SALE = "sale"
  STOCK_IMPORT = "stock_import"
  DEBT_PAYMENT = "debt_payment"
  DEBT_RECORD = "debt_record"

