import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/db/app_db.dart';
import '../data/repositories/auth_repo.dart';
import '../data/repositories/product_repo.dart';
import '../data/repositories/inventory_repo.dart';
import '../data/repositories/customer_repo.dart';
import '../data/repositories/order_repo.dart';
import '../data/repositories/payment_repo.dart';

// Database provider
final dbProvider = Provider<AppDb>((ref) => AppDb());

// Repository providers
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.read(dbProvider));
});

final productRepositoryProvider = Provider<ProductRepository>((ref) {
  return ProductRepository(ref.read(dbProvider));
});

final inventoryRepositoryProvider = Provider<InventoryRepository>((ref) {
  return InventoryRepository(ref.read(dbProvider));
});

final customerRepositoryProvider = Provider<CustomerRepository>((ref) {
  return CustomerRepository(ref.read(dbProvider));
});

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  return OrderRepository(ref.read(dbProvider));
});

final paymentRepositoryProvider = Provider<PaymentRepository>((ref) {
  return PaymentRepository(ref.read(dbProvider));
});

// Authentication state
final currentUserProvider = StateProvider<User?>((ref) => null);

// Role-based access providers
final isOwnerProvider = Provider<bool>((ref) {
  final user = ref.watch(currentUserProvider);
  return user?.role == 'owner';
});

final isEmployeeProvider = Provider<bool>((ref) {
  final user = ref.watch(currentUserProvider);
  return user?.role == 'employee';
});

// Data providers
final productsProvider = FutureProvider<List<Product>>((ref) async {
  return await ref.read(productRepositoryProvider).getActiveProducts();
});

final productsWithUnitsProvider = FutureProvider<List<ProductWithUnits>>((ref) async {
  return await ref.read(productRepositoryProvider).getProductsWithUnits();
});

final customersProvider = FutureProvider<List<Customer>>((ref) async {
  return await ref.read(customerRepositoryProvider).getAllCustomers();
});

final ordersProvider = FutureProvider<List<Order>>((ref) async {
  return await ref.read(orderRepositoryProvider).getAllOrders();
});

final draftOrdersProvider = FutureProvider<List<Order>>((ref) async {
  return await ref.read(orderRepositoryProvider).getDraftOrders();
});

final paymentsProvider = FutureProvider<List<Payment>>((ref) async {
  return await ref.read(paymentRepositoryProvider).getAllPayments();
});

final inventoryLogsProvider = FutureProvider<List<InventoryLog>>((ref) async {
  return await ref.read(inventoryRepositoryProvider).getAllLogs();
});

// Filter providers
final orderStatusFilterProvider = StateProvider<String>((ref) => 'all');
final customerSearchProvider = StateProvider<String>((ref) => '');
final productSearchProvider = StateProvider<String>((ref) => '');
