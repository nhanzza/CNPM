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

# USER MODEL

class User(Base):
  __tablename__ = "users"
  id = Column(Integer, primary_key=True, index=True)
  email = Column(String(255), unique=True, index=True, nullable=False)
  username = Column(String(100), unique=True, index=True, nullable=False)
  hashed_password = Column(String(255), nullable=False)
  full_name = Column(String(255), nullable=False)
  phone = Column(String(20))
  role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.EMPLOYEE)
  is_active = Column(Boolean, default=True)
  created_at = Column(DateTime, default=datetime.utcnow)
  updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
