import '../db/app_db.dart';

class SeedData {
  static Future<void> seedDatabase(AppDb db) async {
    // Check if data already exists
    final existingUsers = await db.select(db.users).get();
    if (existingUsers.isNotEmpty) {
      print('Database already seeded');
      return;
    }

    print('Seeding database...');

    // Seed Users
    await _seedUsers(db);
    
    // Seed Products and Units
    await _seedProducts(db);
    
    // Seed Customers
    await _seedCustomers(db);
    
    // Seed initial inventory
    await _seedInventory(db);
    
    // Seed sample orders
    await _seedOrders(db);

    print('Database seeded successfully');
  }

  static Future<void> _seedUsers(AppDb db) async {
    final users = [
      UsersCompanion.insert(
        name: 'Nguyễn Văn A',
        role: 'owner',
      ),
      UsersCompanion.insert(
        name: 'Trần Thị B',
        role: 'employee',
      ),
      UsersCompanion.insert(
        name: 'Lê Văn C',
        role: 'employee',
      ),
    ];

    for (final user in users) {
      await db.into(db.users).insert(user);
    }
  }

  static Future<void> _seedProducts(AppDb db) async {
    final products = [
      // Nước giải khát
      ProductsCompanion.insert(
        name: 'Coca Cola',
        category: 'Nước giải khát',
        isActive: const Value(true),
      ),
      ProductsCompanion.insert(
        name: 'Pepsi',
        category: 'Nước giải khát',
        isActive: const Value(true),
      ),
      ProductsCompanion.insert(
        name: 'Sting',
        category: 'Nước giải khát',
        isActive: const Value(true),
      ),
      ProductsCompanion.insert(
        name: 'Nước suối La Vie',
        category: 'Nước giải khát',
        isActive: const Value(true),
      ),
      
      // Đồ ăn vặt
      ProductsCompanion.insert(
        name: 'Bim Bim Oishi',
        category: 'Đồ ăn vặt',
        isActive: const Value(true),
      ),
      ProductsCompanion.insert(
        name: 'Kẹo ChocoPie',
        category: 'Đồ ăn vặt',
        isActive: const Value(true),
      ),
      ProductsCompanion.insert(
        name: 'Bánh quy Cosy',
        category: 'Đồ ăn vặt',
        isActive: const Value(true),
      ),
      
      // Rau củ quả
      ProductsCompanion.insert(
        name: 'Cà phê',
        category: 'Rau củ quả',
        isActive: const Value(true),
      ),
      ProductsCompanion.insert(
        name: 'Cà chua',
        category: 'Rau củ quả',
        isActive: const Value(true),
      ),
      ProductsCompanion.insert(
        name: 'Dưa leo',
        category: 'Rau củ quả',
        isActive: const Value(true),
      ),
    ];

    final productIds = <int>[];
    for (final product in products) {
      final id = await db.into(db.products).insert(product);
      productIds.add(id);
    }

    // Seed Product Units
    final units = [
      // Coca Cola
      ProductUnitsCompanion.insert(
        productId: Value(productIds[0]),
        unitName: 'Lon',
        conversionRateToBase: const Value(1.0),
        price: const Value(12000),
      ),
      ProductUnitsCompanion.insert(
        productId: Value(productIds[0]),
        unitName: 'Thùng',
        conversionRateToBase: const Value(24.0),
        price: const Value(288000),
      ),
      
      // Pepsi
      ProductUnitsCompanion.insert(
        productId: Value(productIds[1]),
        unitName: 'Lon',
        conversionRateToBase: const Value(1.0),
        price: const Value(11000),
      ),
      ProductUnitsCompanion.insert(
        productId: Value(productIds[1]),
        unitName: 'Thùng',
        conversionRateToBase: const Value(24.0),
        price: const Value(264000),
      ),
      
      // Sting
      ProductUnitsCompanion.insert(
        productId: Value(productIds[2]),
        unitName: 'Chai',
        conversionRateToBase: const Value(1.0),
        price: const Value(15000),
      ),
      ProductUnitsCompanion.insert(
        productId: Value(productIds[2]),
        unitName: 'Thùng',
        conversionRateToBase: const Value(24.0),
        price: const Value(360000),
      ),
      
      // Nước suối La Vie
      ProductUnitsCompanion.insert(
        productId: Value(productIds[3]),
        unitName: 'Chai 500ml',
        conversionRateToBase: const Value(1.0),
        price: const Value(8000),
      ),
      ProductUnitsCompanion.insert(
        productId: Value(productIds[3]),
        unitName: 'Thùng',
        conversionRateToBase: const Value(24.0),
        price: const Value(192000),
      ),
      
      // Bim Bim Oishi
      ProductUnitsCompanion.insert(
        productId: Value(productIds[4]),
        unitName: 'Gói',
        conversionRateToBase: const Value(1.0),
        price: const Value(25000),
      ),
      ProductUnitsCompanion.insert(
        productId: Value(productIds[4]),
        unitName: 'Thùng',
        conversionRateToBase: const Value(12.0),
        price: const Value(300000),
      ),
      
      // Kẹo ChocoPie
      ProductUnitsCompanion.insert(
        productId: Value(productIds[5]),
        unitName: 'Hộp',
        conversionRateToBase: const Value(1.0),
        price: const Value(45000),
      ),
      
      // Bánh quy Cosy
      ProductUnitsCompanion.insert(
        productId: Value(productIds[6]),
        unitName: 'Gói',
        conversionRateToBase: const Value(1.0),
        price: const Value(20000),
      ),
      
      // Cà phê
      ProductUnitsCompanion.insert(
        productId: Value(productIds[7]),
        unitName: 'Kg',
        conversionRateToBase: const Value(1.0),
        price: const Value(80000),
      ),
      
      // Cà chua
      ProductUnitsCompanion.insert(
        productId: Value(productIds[8]),
        unitName: 'Kg',
        conversionRateToBase: const Value(1.0),
        price: const Value(25000),
      ),
      
      // Dưa leo
      ProductUnitsCompanion.insert(
        productId: Value(productIds[9]),
        unitName: 'Kg',
        conversionRateToBase: const Value(1.0),
        price: const Value(15000),
      ),
    ];

    for (final unit in units) {
      await db.into(db.productUnits).insert(unit);
    }
  }

  static Future<void> _seedCustomers(AppDb db) async {
    final customers = [
      CustomersCompanion.insert(
        name: 'Khách hàng A',
        phone: const Value('0901234567'),
        address: const Value('123 Nguyễn Huệ, Q1, TP.HCM'),
        totalDebtCached: const Value(0),
      ),
      CustomersCompanion.insert(
        name: 'Khách hàng B',
        phone: const Value('0912345678'),
        address: const Value('456 Lê Lợi, Q1, TP.HCM'),
        totalDebtCached: const Value(150000),
      ),
      CustomersCompanion.insert(
        name: 'Cửa hàng Tiện lợi X',
        phone: const Value('0923456789'),
        address: const Value('789 Đồng Khởi, Q1, TP.HCM'),
        totalDebtCached: const Value(500000),
      ),
      CustomersCompanion.insert(
        name: 'Quán Cafe Y',
        phone: const Value('0934567890'),
        address: const Value('321 Võ Văn Tần, Q3, TP.HCM'),
        totalDebtCached: const Value(0),
      ),
      CustomersCompanion.insert(
        name: 'Khách vãng lai',
        phone: const Value(''),
        address: const Value(''),
        totalDebtCached: const Value(0),
      ),
    ];

    for (final customer in customers) {
      await db.into(db.customers).insert(customer);
    }
  }

  static Future<void> _seedInventory(AppDb db) async {
    final inventoryLogs = [
      // Coca Cola
      InventoryLogsCompanion.insert(
        productId: const Value(1),
        changeQtyBase: const Value(240), // 10 thùng
        reason: 'import',
        note: const Value('Nhập kho ban đầu'),
      ),
      
      // Pepsi
      InventoryLogsCompanion.insert(
        productId: const Value(2),
        changeQtyBase: const Value(240), // 10 thùng
        reason: 'import',
        note: const Value('Nhập kho ban đầu'),
      ),
      
      // Sting
      InventoryLogsCompanion.insert(
        productId: const Value(3),
        changeQtyBase: const Value(120), // 5 thùng
        reason: 'import',
        note: const Value('Nhập kho ban đầu'),
      ),
      
      // Nước suối La Vie
      InventoryLogsCompanion.insert(
        productId: const Value(4),
        changeQtyBase: const Value(480), // 20 thùng
        reason: 'import',
        note: const Value('Nhập kho ban đầu'),
      ),
      
      // Bim Bim Oishi
      InventoryLogsCompanion.insert(
        productId: const Value(5),
        changeQtyBase: const Value(120), // 10 thùng
        reason: 'import',
        note: const Value('Nhập kho ban đầu'),
      ),
      
      // Kẹo ChocoPie
      InventoryLogsCompanion.insert(
        productId: const Value(6),
        changeQtyBase: const Value(24), // 24 hộp
        reason: 'import',
        note: const Value('Nhập kho ban đầu'),
      ),
      
      // Bánh quy Cosy
      InventoryLogsCompanion.insert(
        productId: const Value(7),
        changeQtyBase: const Value(100), // 100 gói
        reason: 'import',
        note: const Value('Nhập kho ban đầu'),
      ),
      
      // Cà phê
      InventoryLogsCompanion.insert(
        productId: const Value(8),
        changeQtyBase: const Value(50), // 50kg
        reason: 'import',
        note: const Value('Nhập kho ban đầu'),
      ),
      
      // Cà chua
      InventoryLogsCompanion.insert(
        productId: const Value(9),
        changeQtyBase: const Value(30), // 30kg
        reason: 'import',
        note: const Value('Nhập kho ban đầu'),
      ),
      
      // Dưa leo
      InventoryLogsCompanion.insert(
        productId: const Value(10),
        changeQtyBase: const Value(20), // 20kg
        reason: 'import',
        note: const Value('Nhập kho ban đầu'),
      ),
    ];

    for (final log in inventoryLogs) {
      await db.into(db.inventoryLogs).insert(log);
    }
  }

  static Future<void> _seedOrders(AppDb db) async {
    // Sample orders
    final orders = [
      OrdersCompanion.insert(
        code: const Value('ORD-20260201-001'),
        source: const Value('counter'),
        customerId: const Value(1),
        status: const Value('paid'),
        totalAmount: const Value(37000),
        paidAmount: const Value(37000),
        debtAmount: const Value(0),
        discount: const Value(0),
        note: const Value('Khách mua tại quầy'),
        isDraft: const Value(false),
      ),
      OrdersCompanion.insert(
        code: const Value('ORD-20260201-002'),
        source: const Value('zalo'),
        customerId: const Value(2),
        status: const Value('partial'),
        totalAmount: const Value(150000),
        paidAmount: const Value(100000),
        debtAmount: const Value(50000),
        discount: const Value(0),
        note: const Value('Đơn hàng Zalo, giao tận nơi'),
        isDraft: const Value(false),
      ),
      OrdersCompanion.insert(
        code: const Value('ORD-20260201-003'),
        source: const Value('phone'),
        customerId: const Value(3),
        status: const Value('pending'),
        totalAmount: const Value(750000),
        paidAmount: const Value(0),
        debtAmount: const Value(750000),
        discount: const Value(50000),
        note: const Value('Đơn hàng sỉ, giảm giá 50k'),
        isDraft: const Value(false),
      ),
    ];

    final orderIds = <int>[];
    for (final order in orders) {
      final id = await db.into(db.orders).insert(order);
      orderIds.add(id);
    }

    // Seed Order Items
    final orderItems = [
      // Order 1 items
      OrderItemsCompanion.insert(
        orderId: Value(orderIds[0]),
        productId: const Value(1),
        unitId: const Value(1),
        qty: const Value(1),
        unitPrice: const Value(12000),
        lineTotal: const Value(12000),
      ),
      OrderItemsCompanion.insert(
        orderId: Value(orderIds[0]),
        productId: const Value(2),
        unitId: const Value(3),
        qty: const Value(1),
        unitPrice: const Value(11000),
        lineTotal: const Value(11000),
      ),
      OrderItemsCompanion.insert(
        orderId: Value(orderIds[0]),
        productId: const Value(4),
        unitId: const Value(7),
        qty: const Value(1),
        unitPrice: const Value(8000),
        lineTotal: const Value(8000),
      ),
      OrderItemsCompanion.insert(
        orderId: Value(orderIds[0]),
        productId: const Value(5),
        unitId: const Value(9),
        qty: const Value(1),
        unitPrice: const Value(25000),
        lineTotal: const Value(25000),
      ),
      
      // Order 2 items
      OrderItemsCompanion.insert(
        orderId: Value(orderIds[1]),
        productId: const Value(1),
        unitId: const Value(2),
        qty: const Value(1),
        unitPrice: const Value(288000),
        lineTotal: const Value(288000),
      ),
      
      // Order 3 items
      OrderItemsCompanion.insert(
        orderId: Value(orderIds[2]),
        productId: const Value(2),
        unitId: const Value(4),
        qty: const Value(2),
        unitPrice: const Value(264000),
        lineTotal: const Value(528000),
      ),
      OrderItemsCompanion.insert(
        orderId: Value(orderIds[2]),
        productId: const Value(3),
        unitId: const Value(6),
        qty: const Value(1),
        unitPrice: const Value(360000),
        lineTotal: const Value(360000),
      ),
    ];

    for (final item in orderItems) {
      await db.into(db.orderItems).insert(item);
    }

    // Seed Payments
    final payments = [
      PaymentsCompanion.insert(
        orderId: Value(orderIds[0]),
        amount: const Value(37000),
        method: const Value('cash'),
        note: const Value('Thanh toán tại quầy'),
      ),
      PaymentsCompanion.insert(
        orderId: Value(orderIds[1]),
        amount: const Value(100000),
        method: const Value('transfer'),
        note: const Value('Chuyển khoản ZaloPay'),
      ),
    ];

    for (final payment in payments) {
      await db.into(db.payments).insert(payment);
    }
  }
}
