import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../state/providers.dart';

class HomeShell extends ConsumerStatefulWidget {
  final Widget child;
  
  const HomeShell({
    super.key,
    required this.child,
  });

  @override
  ConsumerState<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends ConsumerState<HomeShell> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final currentUser = ref.watch(currentUserProvider);
    final isOwner = ref.watch(isOwnerProvider);

    // Define navigation items based on user role
    final List<NavigationItem> navigationItems = [
      NavigationItem(
        icon: Icons.receipt_long,
        label: 'Đơn hàng',
        route: '/home',
      ),
      if (isOwner) ...[
        NavigationItem(
          icon: Icons.inventory,
          label: 'Kho hàng',
          route: '/inventory',
        ),
      ],
      NavigationItem(
        icon: Icons.people,
        label: 'Khách hàng',
        route: '/customers',
      ),
      if (isOwner) ...[
        NavigationItem(
          icon: Icons.analytics,
          label: 'Báo cáo',
          route: '/reports',
        ),
      ],
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(_getAppBarTitle()),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          // User info
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Row(
              children: [
                Icon(
                  isOwner ? Icons.admin_panel_settings : Icons.person,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  currentUser?.name ?? 'User',
                  style: const TextStyle(fontSize: 14),
                ),
              ],
            ),
          ),
        ],
      ),
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
          context.go(navigationItems[index].route);
        },
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey,
        items: navigationItems.asMap().entries.map((entry) {
          final index = entry.key;
          final item = entry.value;
          return BottomNavigationBarItem(
            icon: Icon(item.icon),
            label: item.label,
          );
        }).toList(),
      ),
      floatingActionButton: _buildFloatingActionButton(),
    );
  }

  String _getAppBarTitle() {
    final location = GoRouter.of(context).location;
    
    if (location.startsWith('/home') && !location.contains('/orders/')) {
      return 'Đơn hàng';
    } else if (location.contains('/orders/create')) {
      return 'Tạo đơn hàng';
    } else if (location.contains('/orders/')) {
      return 'Chi tiết đơn hàng';
    } else if (location.contains('/drafts')) {
      return 'Đơn nháp';
    } else if (location.startsWith('/inventory')) {
      if (location.contains('/products/new') || location.contains('/products/')) {
        return 'Sản phẩm';
      } else if (location.contains('/stock-adjust')) {
        return 'Điều chỉnh kho';
      }
      return 'Kho hàng';
    } else if (location.startsWith('/customers')) {
      if (location.contains('/customers/') && !location.contains('/payment')) {
        return 'Chi tiết khách hàng';
      } else if (location.contains('/payment')) {
        return 'Thanh toán';
      }
      return 'Khách hàng';
    } else if (location.startsWith('/reports')) {
      return 'Báo cáo';
    }
    
    return 'BizFlow';
  }

  Widget? _buildFloatingActionButton() {
    final location = GoRouter.of(context).location;
    final isOwner = ref.watch(isOwnerProvider);
    
    // Show FAB for orders list
    if (location == '/home') {
      return FloatingActionButton(
        onPressed: () => context.go('/home/orders/create'),
        backgroundColor: Colors.green,
        child: const Icon(Icons.add, color: Colors.white),
      );
    }
    
    // Show FAB for inventory list (owner only)
    if (isOwner && location == '/inventory') {
      return FloatingActionButton(
        onPressed: () => context.go('/inventory/products/new'),
        backgroundColor: Colors.blue,
        child: const Icon(Icons.add, color: Colors.white),
      );
    }
    
    // Show FAB for customers list
    if (location == '/customers') {
      return FloatingActionButton(
        onPressed: () {
          // TODO: Implement add customer
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Tính năng thêm khách hàng sẽ được thêm sau')),
          );
        },
        backgroundColor: Colors.orange,
        child: const Icon(Icons.add, color: Colors.white),
      );
    }
    
    return null;
  }
}

class NavigationItem {
  final IconData icon;
  final String label;
  final String route;

  NavigationItem({
    required this.icon,
    required this.label,
    required this.route,
  });
}
