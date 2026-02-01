import '../db/app_db.dart';

class AuthRepository {
  final AppDb _db;
  
  AuthRepository(this._db);
  
  Future<User?> login(String username, String password) async {
    // Mock authentication - in real app, validate against actual credentials
    // For now, return first user (mock data will be seeded)
    final users = await (_db.select(_db.users)..limit(1)).get();
    return users.isNotEmpty ? users.first : null;
  }
  
  Future<User?> getCurrentUser(int userId) async {
    final userQuery = _db.select(_db.users)..where((tbl) => tbl.id.equals(userId));
    return await userQuery.getSingleOrNull();
  }
  
  Future<List<User>> getAllUsers() async {
    return await _db.select(_db.users).get();
  }
  
  Future<bool> isOwner(int userId) async {
    final user = await getCurrentUser(userId);
    return user?.role == 'owner';
  }
  
  Future<bool> isEmployee(int userId) async {
    final user = await getCurrentUser(userId);
    return user?.role == 'employee';
  }
}
