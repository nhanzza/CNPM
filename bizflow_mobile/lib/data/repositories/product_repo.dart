import '../db/app_db.dart';

class ProductRepository {
  final AppDb _db;
  
  ProductRepository(this._db);
  
  Future<List<Product>> getAllProducts() async {
    return await _db.select(_db.products).get();
  }
  
  Future<List<Product>> getActiveProducts() async {
    return await (_db.select(_db.products)
      ..where((tbl) => tbl.isActive.equals(true))
    ).get();
  }
  
  Future<Product?> getProductById(int id) async {
    final query = _db.select(_db.products)..where((tbl) => tbl.id.equals(id));
    return await query.getSingleOrNull();
  }
  
  Future<List<ProductWithUnits>> getProductsWithUnits() async {
    return await _db.getProductsWithUnits();
  }
  
  Future<List<ProductUnit>> getUnitsForProduct(int productId) async {
    final query = _db.select(_db.productUnits)
      ..where((tbl) => tbl.productId.equals(productId));
    return await query.get();
  }
  
  Future<int> addProduct(ProductsCompanion product) async {
    return await _db.into(_db.products).insert(product);
  }
  
  Future<int> addProductUnit(ProductUnitsCompanion unit) async {
    return await _db.into(_db.productUnits).insert(unit);
  }
  
  Future<bool> updateProduct(int id, ProductsCompanion product) async {
    final query = _db.update(_db.products)..where((tbl) => tbl.id.equals(id));
    return await query.write(product) > 0;
  }
  
  Future<bool> deleteProduct(int id) async {
    final query = _db.delete(_db.products)..where((tbl) => tbl.id.equals(id));
    return await query.delete() > 0;
  }
  
  Future<bool> updateProductStatus(int id, bool isActive) async {
    final query = _db.update(_db.products)
      ..where((tbl) => tbl.id.equals(id));
    return await query.write(ProductsCompanion(isActive: Value(isActive))) > 0;
  }
  
  Future<List<Product>> searchProducts(String query) async {
    final searchQuery = _db.select(_db.products)
      ..where((tbl) => tbl.name.contains(query) | tbl.category.contains(query));
    return await searchQuery.get();
  }
}
