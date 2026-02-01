import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/db/app_db.dart';
import '../../state/providers.dart';

class CustomerDetailScreen extends ConsumerStatefulWidget {
  final int customerId;
  
  const CustomerDetailScreen({
    super.key,
    required this.customerId,
  });

  @override
  ConsumerState<CustomerDetailScreen> createState() => _CustomerDetailScreenState();
}

class _CustomerDetailScreenState extends ConsumerState<CustomerDetailScreen> {
  @override
  Widget build(BuildContext context) {
    final customerWithOrdersAsync = ref.watch(
      customerRepositoryProvider.selectAsync((repo) => repo.getCustomerWithOrders(widget.customerId))
    );
    final paymentsAsync = ref.watch(
      paymentRepositoryProvider.selectAsync((repo) => repo.getPaymentsForCustomer(widget.customerId))
    );

    return Scaffold(
      body: customerWithOrdersAsync.when(
        data: (customerWithOrders) {
          if (customerWithOrders == null) {
            return const Center(
              child: Text('Không tìm thấy khách hàng'),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Customer Info Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 30,
                              backgroundColor: Colors.blue,
                              child: Text(
                                customerWithOrders.customer.name.isNotEmpty
                                    ? customerWithOrders.customer.name[0].toUpperCase()
                                    : 'K',
                                style: const TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    customerWithOrders.customer.name,
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  if (customerWithOrders.customer.phone?.isNotEmpty == true)
                                    Text(
                                      customerWithOrders.customer.phone!,
                                      style: const TextStyle(color: Colors.grey),
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        if (customerWithOrders.customer.address?.isNotEmpty == true)
                          _buildInfoRow('Địa chỉ:', customerWithOrders.customer.address!),
                        _buildInfoRow('Ngày tạo:', _formatDate(customerWithOrders.customer.createdAt)),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: customerWithOrders.customer.totalDebtCached > 0
                                ? Colors.red.withOpacity(0.1)
                                : Colors.green.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: customerWithOrders.customer.totalDebtCached > 0
                                  ? Colors.red
                                  : Colors.green,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Tổng nợ hiện tại:',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                _formatCurrency(customerWithOrders.customer.totalDebtCached),
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: customerWithOrders.customer.totalDebtCached > 0
                                      ? Colors.red
                                      : Colors.green,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Payment History
                paymentsAsync.when(
                  data: (payments) {
                    if (payments.isEmpty) return const SizedBox.shrink();

                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Lịch sử thanh toán',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 16),
                            ...payments.map((payment) => _buildPaymentRow(payment)),
                          ],
                        ),
                      ),
                    );
                  },
                  loading: () => const Card(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: Center(child: CircularProgressIndicator()),
                    ),
                  ),
                  error: (error, stack) => Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Text('Lỗi tải lịch sử thanh toán: ${error.toString()}'),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Order History
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Lịch sử đơn hàng',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        if (customerWithOrders.orders.isEmpty)
                          const Center(
                            child: Padding(
                              padding: EdgeInsets.all(16),
                              child: Text('Chưa có đơn hàng nào'),
                            ),
                          )
                        else
                          ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: customerWithOrders.orders.length,
                            itemBuilder: (context, index) {
                              final order = customerWithOrders.orders[index];
                              return _buildOrderRow(order);
                            },
                          ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 100), // Space for action buttons
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Text('Lỗi: ${error.toString()}'),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: customerWithOrdersAsync.when(
        data: (customerWithOrders) {
          if (customerWithOrders == null || customerWithOrders.customer.totalDebtCached <= 0) {
            return null;
          }

          return FloatingActionButton.extended(
            onPressed: () => context.go('/customers/${widget.customerId}/payment'),
            backgroundColor: Colors.green,
            icon: const Icon(Icons.payment, color: Colors.white),
            label: const Text(
              'Thanh toán nợ',
              style: TextStyle(color: Colors.white),
            ),
          );
        },
        loading: () => null,
        error: (error, stack) => null,
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentRow(Payment payment) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.green.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.green.withOpacity(0.3)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _formatDate(payment.createdAt),
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  if (payment.note?.isNotEmpty == true)
                    Text(
                      payment.note!,
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  Text(
                    _getPaymentMethodText(payment.method),
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ],
              ),
            ),
            Text(
              _formatCurrency(payment.amount),
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.green,
                fontSize: 16,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderRow(Order order) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        onTap: () => context.go('/home/orders/${order.id}'),
        title: Row(
          children: [
            Expanded(
              child: Text(
                order.code,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            _buildStatusChip(order.status),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              'Ngày: ${_formatDate(order.createdAt)}',
              style: const TextStyle(color: Colors.grey),
            ),
            Text(
              'Nguồn: ${_getSourceText(order.source)}',
              style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Tổng: ${_formatCurrency(order.totalAmount)}',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                if (order.debtAmount > 0)
                  Text(
                    'Nợ: ${_formatCurrency(order.debtAmount)}',
                    style: const TextStyle(color: Colors.red, fontWeight: FontWeight.w500),
                  ),
              ],
            ),
          ],
        ),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    String text;
    
    switch (status) {
      case 'pending':
        color = Colors.orange;
        text = 'Chờ TT';
        break;
      case 'paid':
        color = Colors.green;
        text = 'Đã TT';
        break;
      case 'partial':
        color = Colors.blue;
        text = '1 phần';
        break;
      default:
        color = Colors.grey;
        text = 'Không xác định';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
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

  String _getPaymentMethodText(String method) {
    switch (method) {
      case 'cash':
        return 'Tiền mặt';
      case 'transfer':
        return 'Chuyển khoản';
      case 'card':
        return 'Thẻ';
      default:
        return method;
    }
  }
}
