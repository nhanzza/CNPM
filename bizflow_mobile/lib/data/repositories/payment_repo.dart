import '../db/app_db.dart';

class PaymentRepository {
  final AppDb _db;
  
  PaymentRepository(this._db);
  
  Future<List<Payment>> getAllPayments() async {
    return await (_db.select(_db.payments)
      ..orderBy([(tbl) => OrderingTerm(expression: tbl.createdAt, mode: OrderingMode.desc)])
    ).get();
  }
  
  Future<List<Payment>> getPaymentsForOrder(int orderId) async {
    final query = _db.select(_db.payments)
      ..where((tbl) => tbl.orderId.equals(orderId))
      ..orderBy([(tbl) => OrderingTerm(expression: tbl.createdAt, mode: OrderingMode.desc)]);
    return await query.get();
  }
  
  Future<List<Payment>> getPaymentsForCustomer(int customerId) async {
    final query = _db.select(_db.payments)
      ..where((tbl) => tbl.customerId.equals(customerId))
      ..orderBy([(tbl) => OrderingTerm(expression: tbl.createdAt, mode: OrderingMode.desc)]);
    return await query.get();
  }
  
  Future<int> addPayment(PaymentsCompanion payment) async {
    return await _db.into(_db.payments).insert(payment);
  }
  
  Future<bool> recordOrderPayment(int orderId, double amount, String method, String? note) async {
    return await _db.transaction(() async {
      // Add payment record
      await _db.into(_db.payments).insert(
        PaymentsCompanion(
          orderId: Value(orderId),
          amount: Value(amount),
          method: Value(method),
          note: Value(note),
        ),
      );
      
      // Update order payment amounts
      final order = await (_db.select(_db.orders)
        ..where((tbl) => tbl.id.equals(orderId))
      ).getSingle();
      
      final newPaidAmount = order.paidAmount + amount;
      final newDebtAmount = order.debtAmount - amount;
      final newStatus = newDebtAmount <= 0 ? 'paid' : 'partial';
      
      await (_db.update(_db.orders)
        ..where((tbl) => tbl.id.equals(orderId))
      ).write(
        OrdersCompanion(
          paidAmount: Value(newPaidAmount),
          debtAmount: Value(newDebtAmount),
          status: Value(newStatus),
        ),
      );
      
      return true;
    });
  }
  
  Future<bool> recordCustomerDebtPayment(int customerId, double amount, String method, String? note) async {
    return await _db.transaction(() async {
      // Add payment record
      await _db.into(_db.payments).insert(
        PaymentsCompanion(
          customerId: Value(customerId),
          amount: Value(amount),
          method: Value(method),
          note: Value(note),
        ),
      );
      
      // Update customer debt
      final customer = await (_db.select(_db.customers)
        ..where((tbl) => tbl.id.equals(customerId))
      ).getSingle();
      
      final newDebtAmount = customer.totalDebtCached - amount;
      
      await (_db.update(_db.customers)
        ..where((tbl) => tbl.id.equals(customerId))
      ).write(
        CustomersCompanion(
          totalDebtCached: Value(newDebtAmount),
        ),
      );
      
      return true;
    });
  }
  
  Future<double> getTotalPaymentsForOrder(int orderId) async {
    final payments = await getPaymentsForOrder(orderId);
    return payments.fold(0.0, (sum, payment) => sum + payment.amount);
  }
  
  Future<double> getTotalPaymentsForCustomer(int customerId) async {
    final payments = await getPaymentsForCustomer(customerId);
    return payments.fold(0.0, (sum, payment) => sum + payment.amount);
  }
}
