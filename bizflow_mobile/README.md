# BizFlow Mobile App

Ứng dụng quản lý bán hàng cho hộ kinh doanh nhỏ, offline-first với Flutter.

## Tính năng

### 🔐 Phân quyền (RBAC)
- **Employee**: Tạo đơn, ghi nợ, xem/confirm draft orders, in hóa đơn
- **Owner**: Tất cả tính năng của Employee + quản lý sản phẩm, kho, khách hàng, báo cáo, tài khoản

### 📱 Modules chính

#### 1. Đơn hàng (Orders)
- Danh sách đơn hàng với filter (Tất cả/Chờ thanh toán/Đã thanh toán/1 phần)
- Tạo đơn hàng mới với chọn khách hàng, sản phẩm, đơn vị tính, số lượng, giảm giá
- Chi tiết đơn hàng với lịch sử thanh toán
- Draft Orders Inbox - mô phỏng AI tạo đơn nháp với local notifications
- In hóa đơn PDF và chia sẻ

#### 2. Kho hàng (Inventory) - Chỉ Owner
- Danh sách sản phẩm với search và filter theo danh mục
- Thêm/Sửa sản phẩm với nhiều đơn vị tính và giá
- Nhập kho/Điều chỉnh tồn kho
- Cảnh báo tồn kho thấp

#### 3. Khách hàng (Customers)
- Danh sách khách hàng với search và filter nợ
- Chi tiết khách hàng với lịch sử đơn hàng và thanh toán
- Ghi nhận thanh toán nợ

#### 4. Báo cáo (Reports) - Chỉ Owner
- Doanh thu theo ngày/tuần/tháng/năm
- Sản phẩm bán chạy
- Báo cáo công nợ
- Cảnh báo tồn kho thấp

### 🛠 Công nghệ
- **Flutter 3.x** với null-safety
- **State Management**: flutter_riverpod
- **Navigation**: go_router với RBAC guards
- **Database**: Drift (SQLite) + repository pattern
- **Notifications**: flutter_local_notifications (mô phỏng AI draft orders)
- **PDF**: pdf + printing + share_plus
- **UI**: Material Design 3

## Cài đặt và Chạy

### Yêu cầu
- Flutter SDK 3.x
- Android Studio / VS Code với Flutter extension

### Các bước thực hiện

1. **Install dependencies**
```bash
flutter pub get
```

2. **Generate code (Drift database)**
```bash
dart run build_runner build
```

3. **Chạy ứng dụng**
```bash
flutter run
```

## Cấu trúc thư mục

```
lib/
├── main.dart                 # Entry point
├── app.dart                  # App initialization
├── routing/
│   └── router.dart          # Go Router setup với RBAC
├── core/
│   ├── theme/               # Theme configuration
│   ├── widgets/             # Common widgets
│   └── utils/
│       ├── pdf_generator.dart    # PDF generation
│       └── notification_service.dart # Local notifications
├── data/
│   ├── db/
│   │   ├── app_db.dart          # Drift database
│   │   ├── tables.dart          # Database tables
│   │   └── migrations.dart      # Database migrations
│   ├── repositories/            # Repository pattern
│   └── seed/
│       └── seed.dart            # Mock data seeding
├── features/
│   ├── auth/
│   │   └── login_screen.dart    # Login screen
│   ├── home/
│   │   └── home_shell.dart      # Bottom navigation shell
│   ├── orders/                  # Orders module
│   ├── inventory/               # Inventory module
│   ├── customers/               # Customers module
│   └── reports/                 # Reports module
└── state/
    └── providers.dart           # Riverpod providers
```

## Database Schema

### Tables chính
- **users**: Thông tin người dùng và vai trò
- **products**: Sản phẩm với danh mục
- **product_units**: Đơn vị tính và giá cho sản phẩm
- **inventory_logs**: Lịch sử thay đổi tồn kho
- **customers**: Thông tin khách hàng
- **orders**: Đơn hàng với trạng thái và nguồn
- **order_items**: Chi tiết sản phẩm trong đơn
- **payments**: Lịch sử thanh toán

## Mock Data

App được seeded với dữ liệu mẫu:
- 3 users (1 owner, 2 employees)
- 10+ sản phẩm với nhiều đơn vị tính
- 5 khách hàng
- Lịch sử đơn hàng và thanh toán mẫu

## Sử dụng

1. **Đăng nhập**: Chọn vai trò Owner hoặc Employee
2. **Owner**: Truy cập tất cả modules
3. **Employee**: Truy cập Orders và Customers (không có Reports và Inventory management)

## Tính năng đặc biệt

### Draft Orders AI Simulation
- Nhấn nút "+" trong Draft Orders screen để mô phỏng AI tạo đơn nháp
- Local notification khi có draft order mới
- Options: Confirm/Edit/Reject draft orders

### PDF Invoice Generation
- In hóa đơn từ Order Detail screen
- Template chuyên nghiệp với thông tin cửa hàng
- Share hoặc print trực tiếp

### Offline-First
- Tất cả dữ liệu lưu local SQLite
- Không cần internet để hoạt động
- Real-time updates với local database

## Lưu ý
- Đây là version demo với mock data
- Trong production, cần thêm:
  - Authentication thực sự
  - Backend API sync
  - Backup/restore data
  - Advanced security features
