import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../../data/db/app_db.dart';
import '../../state/providers.dart';

class DraftOrdersScreen extends ConsumerStatefulWidget {
  const DraftOrdersScreen({super.key});

  @override
  ConsumerState<DraftOrdersScreen> createState() => _DraftOrdersScreenState();
}

class _DraftOrdersScreenState extends ConsumerState<DraftOrdersScreen> {
  final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();

  @override
  void initState() {
    super.initState();
    _initializeNotifications();
  }

  Future<void> _initializeNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    const settings = InitializationSettings(android: androidSettings, iOS: iosSettings);
    
    await _notifications.initialize(settings);
  }

  @override
  Widget build(BuildContext context) {
    final draftOrdersAsync = ref.watch(draftOrdersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Đơn nháp'),
        actions: [
          IconButton(
            onPressed: _simulateDraftOrder,
            icon: const Icon(Icons.add_alert),
            tooltip: 'Mô phỏng đơn nháp AI',
          ),
        ],
      ),
      body: draftOrdersAsync.when(
        data: (draftOrders) {
          if (draftOrders.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.drafts,
                    size: 64,
                    color: Colors.grey,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Không có đơn nháp nào',
                    style: TextStyle(fontSize: 18, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Nhấn nút + để mô phỏng đơn nháp từ AI',
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            itemCount: draftOrders.length,
            itemBuilder: (context, index) {
              final draftOrder = draftOrders[index];
              return _buildDraftOrderCard(draftOrder);
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Text('Lỗi: ${error.toString()}'),
        ),
      ),
    );
  }

  Widget _buildDraftOrderCard(Order draftOrder) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    draftOrder.code,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.orange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.orange),
                  ),
                  child: const Text(
                    'Đơn nháp',
                    style: TextStyle(
                      color: Colors.orange,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Ngày tạo: ${_formatDate(draftOrder.createdAt)}',
              style: const TextStyle(color: Colors.grey),
            ),
            Text(
              'Nguồn: ${_getSourceText(draftOrder.source)}',
              style: const TextStyle(color: Colors.grey),
            ),
            if (draftOrder.note?.isNotEmpty == true)
              Text(
                'Ghi chú: ${draftOrder.note}',
                style: const TextStyle(color: Colors.grey),
              ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Tổng: ${_formatCurrency(draftOrder.totalAmount)}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Row(
                  children: [
                    // Reject Button
                    IconButton(
                      onPressed: () => _rejectDraftOrder(draftOrder),
                      icon: const Icon(Icons.close, color: Colors.red),
                      tooltip: 'Từ chối',
                    ),
                    // Edit Button
                    IconButton(
                      onPressed: () => _editDraftOrder(draftOrder),
                      icon: const Icon(Icons.edit, color: Colors.blue),
                      tooltip: 'Chỉnh sửa',
                    ),
                    // Confirm Button
                    IconButton(
                      onPressed: () => _confirmDraftOrder(draftOrder),
                      icon: const Icon(Icons.check, color: Colors.green),
                      tooltip: 'Xác nhận',
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _simulateDraftOrder() async {
    try {
      final orderRepo = ref.read(orderRepositoryProvider);
      final orderCode = await orderRepo.generateOrderCode();
      
      // Create a mock draft order
      final draftOrder = OrdersCompanion.insert(
        code: orderCode,
        source: Value('zalo'), // Simulate Zalo order
        status: const Value('pending'),
        totalAmount: Value(150000), // Mock amount
        paidAmount: const Value(0),
        debtAmount: Value(150000),
        note: Value('Đơn hàng từ AI - Khách hàng muốn mua 2 sản phẩm'),
        isDraft: const Value(true),
      );

      final orderId = await orderRepo.createOrder(draftOrder);

      // Add mock order items
      await orderRepo.addOrderItem(
        OrderItemsCompanion.insert(
          orderId: orderId,
          productId: 1, // Mock product ID
          unitId: 1, // Mock unit ID
          qty: const Value(2),
          unitPrice: const Value(75000),
          lineTotal: const Value(150000),
        ),
      );

      // Show notification
      await _showNotification('Đơn nháp mới', 'Có đơn hàng mới từ AI cần xác nhận');

      // Refresh data
      ref.invalidate(draftOrdersProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã tạo đơn nháp mô phỏng'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _confirmDraftOrder(Order draftOrder) async {
    try {
      final orderRepo = ref.read(orderRepositoryProvider);
      await orderRepo.confirmDraftOrder(draftOrder.id);

      // Show notification
      await _showNotification('Đơn hàng đã xác nhận', 'Đơn ${draftOrder.code} đã được xác nhận');

      // Refresh data
      ref.invalidate(draftOrdersProvider);
      ref.invalidate(ordersProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã xác nhận đơn hàng'),
            backgroundColor: Colors.green,
          ),
        );
        // Navigate to order detail
        context.go('/home/orders/${draftOrder.id}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _rejectDraftOrder(Order draftOrder) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận từ chối'),
        content: Text('Bạn có chắc muốn từ chối đơn nháp ${draftOrder.code}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Từ chối'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final orderRepo = ref.read(orderRepositoryProvider);
        await orderRepo.deleteOrder(draftOrder.id);

        // Refresh data
        ref.invalidate(draftOrdersProvider);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã từ chối đơn hàng'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Lỗi: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }

  Future<void> _editDraftOrder(Order draftOrder) async {
    // For now, just navigate to create order with draft data
    // In a real app, you'd want to pre-fill the form with draft data
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tính năng chỉnh sửa đơn nháp sẽ được thêm sau'),
          backgroundColor: Colors.blue,
        ),
      );
    }
  }

  Future<void> _showNotification(String title, String body) async {
    const androidDetails = AndroidNotificationDetails(
      'draft_orders',
      'Draft Orders',
      channelDescription: 'Notifications for draft orders',
      importance: Importance.high,
      priority: Priority.high,
    );
    const iosDetails = DarwinNotificationDetails();
    const details = NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _notifications.show(
      DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title,
      body,
      details,
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}';
  }

  String _formatCurrency(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}đ';
  }

  String _getSourceText(String source) {
    switch (source) {
      case 'counter':
        return 'Quầy';
      case 'zalo':
        return 'Zalo';
      case 'phone':
        return 'Điện thoại';
      default:
        return source;
    }
  }
}
