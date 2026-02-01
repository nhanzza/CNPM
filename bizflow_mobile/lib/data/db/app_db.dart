import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'tables.dart';

part 'app_db.g.dart';

@DriftDatabase(tables: [
  Users,
  Products,
  ProductUnits,
  InventoryLogs,
  Customers,
  Orders,
  OrderItems,
  Payments,
])
class AppDb extends _$AppDb {
  AppDb() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  // Custom queries and methods can be added here
  
  // Get products with their units
  Future<List<ProductWithUnits>> getProductsWithUnits() {
    final query = select(products).join([
      innerJoin(productUnits, productUnits.productId.equalsExp(products.id)),
    ]);
    
    return query.map((row) {
      final product = row.readTable(products);
      final unit = row.readTable(productUnits);
      return ProductWithUnits(product, unit);
    }).get();
  }

  // Get order with items
  Future<OrderWithItems?> getOrderWithItems(int orderId) async {
    final orderQuery = select(orders)..where((tbl) => tbl.id.equals(orderId));
    final order = await orderQuery.getSingleOrNull();
    
    if (order == null) return null;
    
    final itemsQuery = select(orderItems)
      ..where((tbl) => tbl.orderId.equals(orderId));
    final items = await itemsQuery.get();
    
    return OrderWithItems(order, items);
  }

  // Get customer with order history
  Future<CustomerWithOrders?> getCustomerWithOrders(int customerId) async {
    final customerQuery = select(customers)..where((tbl) => tbl.id.equals(customerId));
    final customer = await customerQuery.getSingleOrNull();
    
    if (customer == null) return null;
    
    final ordersQuery = select(orders)
      ..where((tbl) => tbl.customerId.equals(customerId))
      ..orderBy([(tbl) => OrderingTerm(expression: tbl.createdAt, mode: OrderingMode.desc)]);
    final customerOrders = await ordersQuery.get();
    
    return CustomerWithOrders(customer, customerOrders);
  }

  // Get draft orders
  Future<List<Order>> getDraftOrders() {
    return (select(orders)..where((tbl) => tbl.isDraft.equals(true))).get();
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'bizflow.db'));
    return NativeDatabase(file);
  });
}

// Helper classes for joined queries
class ProductWithUnits {
  final Product product;
  final ProductUnit unit;
  
  ProductWithUnits(this.product, this.unit);
}

class OrderWithItems {
  final Order order;
  final List<OrderItem> items;
  
  OrderWithItems(this.order, this.items);
}

class CustomerWithOrders {
  final Customer customer;
  final List<Order> orders;
  
  CustomerWithOrders(this.customer, this.orders);
}
