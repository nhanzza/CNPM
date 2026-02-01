import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../features/auth/login_screen.dart';
import '../features/home/home_shell.dart';
import '../features/orders/orders_list_screen.dart';
import '../features/orders/create_order_screen.dart';
import '../features/orders/order_detail_screen.dart';
import '../features/orders/draft_orders_screen.dart';
import '../features/inventory/product_list_screen.dart';
import '../features/inventory/product_form_screen.dart';
import '../features/inventory/stock_adjust_screen.dart';
import '../features/customers/customer_list_screen.dart';
import '../features/customers/customer_detail_screen.dart';
import '../features/customers/record_payment_screen.dart';
import '../features/reports/reports_screen.dart';
import '../state/providers.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final currentUser = ref.watch(currentUserProvider);
  
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      // If not logged in, redirect to login
      if (currentUser == null && !state.location.startsWith('/login')) {
        return '/login';
      }
      
      // If logged in and trying to access login, redirect to home
      if (currentUser != null && state.location.startsWith('/login')) {
        return '/home';
      }
      
      // Check role-based access
      if (currentUser != null) {
        final isOwner = currentUser.role == 'owner';
        final path = state.location;
        
        // Owner-only routes
        if (!isOwner && (path.startsWith('/inventory') || path.startsWith('/reports'))) {
          return '/home'; // Redirect employees to home
        }
      }
      
      return null; // No redirect needed
    },
    routes: [
      // Login route
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      
      // Home shell with bottom navigation
      ShellRoute(
        builder: (context, state, child) => HomeShell(child: child),
        routes: [
          // Orders tab
          GoRoute(
            path: '/home',
            builder: (context, state) => const OrdersListScreen(),
            routes: [
              GoRoute(
                path: '/orders/create',
                builder: (context, state) => const CreateOrderScreen(),
              ),
              GoRoute(
                path: '/orders/:id',
                builder: (context, state) {
                  final orderId = int.parse(state.pathParameters['id']!);
                  return OrderDetailScreen(orderId: orderId);
                },
              ),
              GoRoute(
                path: '/drafts',
                builder: (context, state) => const DraftOrdersScreen(),
              ),
            ],
          ),
          
          // Inventory tab (Owner only)
          GoRoute(
            path: '/inventory',
            builder: (context, state) => const ProductListScreen(),
            routes: [
              GoRoute(
                path: '/products/new',
                builder: (context, state) => const ProductFormScreen(),
              ),
              GoRoute(
                path: '/products/:id',
                builder: (context, state) {
                  final productId = int.parse(state.pathParameters['id']!);
                  return ProductFormScreen(productId: productId);
                },
              ),
              GoRoute(
                path: '/stock-adjust',
                builder: (context, state) => const StockAdjustScreen(),
              ),
            ],
          ),
          
          // Customers tab
          GoRoute(
            path: '/customers',
            builder: (context, state) => const CustomerListScreen(),
            routes: [
              GoRoute(
                path: '/customers/:id',
                builder: (context, state) {
                  final customerId = int.parse(state.pathParameters['id']!);
                  return CustomerDetailScreen(customerId: customerId);
                },
              ),
              GoRoute(
                path: '/customers/:id/payment',
                builder: (context, state) {
                  final customerId = int.parse(state.pathParameters['id']!);
                  return RecordPaymentScreen(customerId: customerId);
                },
              ),
            ],
          ),
          
          // Reports tab (Owner only)
          GoRoute(
            path: '/reports',
            builder: (context, state) => const ReportsScreen(),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Page not found'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go('/home'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
});

// Navigation service for easier navigation
class NavigationService {
  static GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();
  
  static BuildContext? get context => navigatorKey.currentContext;
  
  static void go(String path) {
    context?.go(path);
  }
  
  static void push(String path) {
    context?.push(path);
  }
  
  static void pop() {
    context?.pop();
  }
}
