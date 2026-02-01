import 'package:drift/drift.dart';

// Users table
@DataClassName('User')
class Users extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text()();
  TextColumn get role => text()(); // 'employee' or 'owner'
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
}

// Products table
@DataClassName('Product')
class Products extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text()();
  TextColumn get category => text()();
  BoolColumn get isActive => boolean().withDefault(const Constant(true))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
}

// Product Units table
@DataClassName('ProductUnit')
class ProductUnits extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get productId => integer().references(Products, #id)();
  TextColumn get unitName => text()();
  RealColumn get conversionRateToBase => real()(); // e.g., 1 kg = 1000 g, so rate = 1000
  RealColumn get price => real()(); // price per this unit
}

// Inventory Logs table
@DataClassName('InventoryLog')
class InventoryLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get productId => integer().references(Products, #id)();
  RealColumn get changeQtyBase => real()(); // positive for import, negative for sale/adjustment
  TextColumn get reason => text()(); // 'import', 'sale', 'adjustment'
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  TextColumn get note => text().nullable()();
}

// Customers table
@DataClassName('Customer')
class Customers extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get name => text()();
  TextColumn get phone => text().nullable()();
  TextColumn get address => text().nullable()();
  RealColumn get totalDebtCached => real().withDefault(const Constant(0))();
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
}

// Orders table
@DataClassName('Order')
class Orders extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get code => text()(); // unique order code like "ORD-20240201-001"
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  TextColumn get source => text()(); // 'counter', 'zalo', 'phone'
  IntColumn get customerId => integer().nullable().references(Customers, #id)();
  TextColumn get status => text()(); // 'pending', 'paid', 'partial'
  RealColumn get totalAmount => real()();
  RealColumn get paidAmount => real().withDefault(const Constant(0))();
  RealColumn get debtAmount => real()();
  RealColumn get discount => real().withDefault(const Constant(0))();
  TextColumn get note => text().nullable()();
  BoolColumn get isDraft => boolean().withDefault(const Constant(false))();
}

// Order Items table
@DataClassName('OrderItem')
class OrderItems extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get orderId => integer().references(Orders, #id)();
  IntColumn get productId => integer().references(Products, #id)();
  IntColumn get unitId => integer().references(ProductUnits, #id)();
  RealColumn get qty => real()();
  RealColumn get unitPrice => real()();
  RealColumn get lineTotal => real()();
}

// Payments table
@DataClassName('Payment')
class Payments extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get orderId => integer().nullable().references(Orders, #id)();
  IntColumn get customerId => integer().nullable().references(Customers, #id)();
  RealColumn get amount => real()();
  TextColumn get method => text()(); // 'cash', 'transfer', 'card'
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  TextColumn get note => text().nullable()();
}
