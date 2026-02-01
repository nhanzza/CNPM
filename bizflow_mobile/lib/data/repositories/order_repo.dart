import '../db/app_db.dart';

class OrderRepository {
  final AppDb _db;
  
  OrderRepository(this._db);
  
  Future<List<Order>> getAllOrders() async {
    return await (_db.select(_db.orders)
      ..orderBy([(tbl) => OrderingTerm(expression: tbl.createdAt, mode: OrderingMode.desc)])
    ).get();
  }
  
  Future<List<Order>> getOrdersByStatus(String status) async {
    final query = _db.select(_db.orders)
      ..where((tbl) => tbl.status.equals(status))
      ..orderBy([(tbl) => OrderingTerm(expression: tbl.createdAt, mode: OrderingMode.desc)]);
    return await query.get();
  }
  
  Future<List<Order>> getDraftOrders() async {
    return await _db.getDraftOrders();
  }
  
  Future<Order?> getOrderById(int id) async {
    final query = _db.select(_db.orders)..where((tbl) => tbl.id.equals(id));
    return await query.getSingleOrNull();
  }
  
  Future<OrderWithItems?> getOrderWithItems(int orderId) async {
    return await _db.getOrderWithItems(orderId);
  }
  
  Future<int> createOrder(OrdersCompanion order) async {
    return await _db.into(_db.orders).insert(order);
  }
  
  Future<int> addOrderItem(OrderItemsCompanion item) async {
    return await _db.into(_db.orderItems).insert(item);
  }
  
  Future<bool> updateOrder(int id, OrdersCompanion order) async {
    final query = _db.update(_db.orders)..where((tbl) => tbl.id.equals(id));
    return await query.write(order) > 0;
  }
  
  Future<bool> deleteOrder(int id) async {
    return await _db.transaction(() async {
      // Delete order items first
      await (_db.delete(_db.orderItems)
        ..where((tbl) => tbl.orderId.equals(id))
      ).delete();
      
      // Delete order
      final query = _db.delete(_db.orders)..where((tbl) => tbl.id.equals(id));
      return await query.delete() > 0;
    });
  }
  
  Future<bool> confirmDraftOrder(int orderId) async {
    final query = _db.update(_db.orders)
      ..where((tbl) => tbl.id.equals(orderId));
    return await query.write(
      OrdersCompanion(isDraft: Value(false))
    ) > 0;
  }
  
  Future<bool> updateOrderStatus(int orderId, String status) async {
    final query = _db.update(_db.orders)
      ..where((tbl) => tbl.id.equals(orderId));
    return await query.write(
      OrdersCompanion(status: Value(status))
    ) > 0;
  }
  
  Future<String> generateOrderCode() async {
    final now = DateTime.now();
    final dateStr = '${now.year}${now.month.toString().padLeft(2, '0')}${now.day.toString().padLeft(2, '0')}';
    
    // Get count of orders for today
    final todayStart = DateTime(now.year, now.month, now.day);
    final todayEnd = todayStart.add(const Duration(days: 1));
    
    final countQuery = _db.selectOnly(_db.orders)
      ..addColumns([_db.orders.id.count()])
      ..where(_db.orders.createdAt.isBetweenValues(todayStart, todayEnd));
    
    final result = await countQuery.getSingle();
    final count = result.read(_db.orders.id.count()) ?? 0;
    
    return 'ORD-$dateStr-${(count + 1).toString().padLeft(3, '0')}';
  }
  
  Future<List<Order>> searchOrders(String query) async {
    final searchQuery = _db.select(_db.orders)
      ..where((tbl) => tbl.code.contains(query))
      ..orderBy([(tbl) => OrderingTerm(expression: tbl.createdAt, mode: OrderingMode.desc)]);
    return await searchQuery.get();
  }
  
  Future<List<Order>> getOrdersByCustomer(int customerId) async {
    final query = _db.select(_db.orders)
      ..where((tbl) => tbl.customerId.equals(customerId))
      ..orderBy([(tbl) => OrderingTerm(expression: tbl.createdAt, mode: OrderingMode.desc)]);
    return await query.get();
  }
}
