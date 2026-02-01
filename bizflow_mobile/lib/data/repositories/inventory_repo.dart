import '../db/app_db.dart';

class InventoryRepository {
  final AppDb _db;
  
  InventoryRepository(this._db);
  
  Future<List<InventoryLog>> getAllLogs() async {
    return await (_db.select(_db.inventoryLogs)
      ..orderBy([(tbl) => OrderingTerm(expression: tbl.createdAt, mode: OrderingMode.desc)])
    ).get();
  }
  
  Future<List<InventoryLog>> getLogsForProduct(int productId) async {
    final query = _db.select(_db.inventoryLogs)
      ..where((tbl) => tbl.productId.equals(productId))
      ..orderBy([(tbl) => OrderingTerm(expression: tbl.createdAt, mode: OrderingMode.desc)]);
    return await query.get();
  }
  
  Future<int> addInventoryLog(InventoryLogsCompanion log) async {
    return await _db.into(_db.inventoryLogs).insert(log);
  }
  
  Future<bool> stockImport(int productId, double quantity, String note) async {
    return await _db.transaction(() async {
      // Add inventory log
      await _db.into(_db.inventoryLogs).insert(
        InventoryLogsCompanion(
          productId: Value(productId),
          changeQtyBase: Value(quantity),
          reason: Value('import'),
          note: Value(note),
        ),
      );
      return true;
    });
  }
  
  Future<bool> stockAdjustment(int productId, double quantity, String note) async {
    return await _db.transaction(() async {
      // Add inventory log
      await _db.into(_db.inventoryLogs).insert(
        InventoryLogsCompanion(
          productId: Value(productId),
          changeQtyBase: Value(quantity), // negative for reduction
          reason: Value('adjustment'),
          note: Value(note),
        ),
      );
      return true;
    });
  }
  
  Future<double> getCurrentStock(int productId) async {
    final logs = await getLogsForProduct(productId);
    return logs.fold(0.0, (sum, log) => sum + log.changeQtyBase);
  }
  
  Future<List<ProductWithStock>> getLowStockProducts(double threshold) async {
    final products = await _db.select(_db.products).get();
    final List<ProductWithStock> result = [];
    
    for (final product in products) {
      final stock = await getCurrentStock(product.id);
      if (stock < threshold) {
        result.add(ProductWithStock(product, stock));
      }
    }
    
    return result;
  }
}

class ProductWithStock {
  final Product product;
  final double currentStock;
  
  ProductWithStock(this.product, this.currentStock);
}
