import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../state/providers.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo and Title
              const Icon(
                Icons.store,
                size: 80,
                color: Colors.blue,
              ),
              const SizedBox(height: 16),
              const Text(
                'BizFlow',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
                textAlign: TextAlign.center,
              ),
              const Text(
                'Quản lý bán hàng cho hộ kinh doanh',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 48),
              
              // Login as Employee
              ElevatedButton(
                onPressed: _isLoading ? null : () => _loginAsEmployee(),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Đăng nhập với vai trò Nhân viên',
                        style: TextStyle(fontSize: 16),
                      ),
              ),
              const SizedBox(height: 16),
              
              // Login as Owner
              ElevatedButton(
                onPressed: _isLoading ? null : () => _loginAsOwner(),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'Đăng nhập với vai trò Chủ cửa hàng',
                        style: TextStyle(fontSize: 16),
                      ),
              ),
              const SizedBox(height: 32),
              
              // Info text
              const Text(
                'Lưu ý: Đây là phiên bản demo\nChọn vai trò để tiếp tục',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _loginAsEmployee() async {
    setState(() => _isLoading = true);
    
    try {
      // Mock login - get first employee user
      final authRepo = ref.read(authRepositoryProvider);
      final users = await authRepo.getAllUsers();
      
      final employeeUser = users.firstWhere(
        (user) => user.role == 'employee',
        orElse: () => users.isNotEmpty ? users.first : throw Exception('No users found'),
      );
      
      ref.read(currentUserProvider.notifier).state = employeeUser;
      
      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi đăng nhập: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _loginAsOwner() async {
    setState(() => _isLoading = true);
    
    try {
      // Mock login - get first owner user
      final authRepo = ref.read(authRepositoryProvider);
      final users = await authRepo.getAllUsers();
      
      final ownerUser = users.firstWhere(
        (user) => user.role == 'owner',
        orElse: () => users.isNotEmpty ? users.first : throw Exception('No users found'),
      );
      
      ref.read(currentUserProvider.notifier).state = ownerUser;
      
      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi đăng nhập: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
}
