import '../db/app_db.dart';

class CustomerRepository {
  final AppDb _db;
  
  CustomerRepository(this._db);
  
  Future<List<Customer>> getAllCustomers() async {
    return await _db.select(_db.customers).get();
  }
  
  Future<Customer?> getCustomerById(int id) async {
    final query = _db.select(_db.customers)..where((tbl) => tbl.id.equals(id));
    return await query.getSingleOrNull();
  }
  
  Future<CustomerWithOrders?> getCustomerWithOrders(int customerId) async {
    return await _db.getCustomerWithOrders(customerId);
  }
  
  Future<int> addCustomer(CustomersCompanion customer) async {
    return await _db.into(_db.customers).insert(customer);
  }
  
  Future<bool> updateCustomer(int id, CustomersCompanion customer) async {
    final query = _db.update(_db.customers)..where((tbl) => tbl.id.equals(id));
    return await query.write(customer) > 0;
  }
  
  Future<bool> deleteCustomer(int id) async {
    final query = _db.delete(_db.customers)..where((tbl) => tbl.id.equals(id));
    return await query.delete() > 0;
  }
  
  Future<bool> updateCustomerDebt(int customerId, double newDebtAmount) async {
    final query = _db.update(_db.customers)
      ..where((tbl) => tbl.id.equals(customerId));
    return await query.write(
      CustomersCompanion(totalDebtCached: Value(newDebtAmount))
    ) > 0;
  }
  
  Future<List<Customer>> searchCustomers(String query) async {
    final searchQuery = _db.select(_db.customers)
      ..where((tbl) => 
        tbl.name.contains(query) | 
        (tbl.phone.isNotNull() & tbl.phone.contains(query))
      );
    return await searchQuery.get();
  }
  
  Future<List<Customer>> getCustomersWithDebt() async {
    final query = _db.select(_db.customers)
      ..where((tbl) => tbl.totalDebtCached.isBiggerThanValue(0));
    return await query.get();
  }
  
  Future<double> getTotalOutstandingDebt() async {
    final customers = await _db.select(_db.customers).get();
    return customers.fold(0.0, (sum, customer) => sum + customer.totalDebtCached);
  }
}
