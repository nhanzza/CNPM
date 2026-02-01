import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import 'package:printing/printing.dart';
import '../../data/db/app_db.dart';
import '../../state/providers.dart';
import '../../core/utils/pdf_generator.dart';

class OrderDetailScreen extends ConsumerStatefulWidget {
  final int orderId;
  
  const OrderDetailScreen({
    super.key,
    required this.orderId,
  });

  @override
  ConsumerState<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends ConsumerState<OrderDetailScreen> {
  @override
  Widget build(BuildContext context) {
    final orderWithItemsAsync = ref.watch(
      orderRepositoryProvider.selectAsync((repo) => repo.getOrderWithItems(widget.orderId))
    );

    return Scaffold(
      body: orderWithItemsAsync.when(
        data: (orderWithItems) {
          if (orderWithItems == null) {
            return const Center(
              child: Text('Không tìm thấy đơn hàng'),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Order Info Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                orderWithItems.order.code,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            _buildStatusChip(orderWithItems.order.status),
                          ],
                        ),
                        const SizedBox(height: 16),
                        _buildInfoRow('Ngày tạo:', _formatDate(orderWithItems.order.createdAt)),
                        _buildInfoRow('Nguồn:', _getSourceText(orderWithItems.order.source)),
                        if (orderWithItems.order.customerId != null)
                          _buildCustomerInfo(orderWithItems.order.customerId!),
                        if (orderWithItems.order.note?.isNotEmpty == true)
                          _buildInfoRow('Ghi chú:', orderWithItems.order.note!),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Order Items Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Chi tiết sản phẩm',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 16),
                        ...orderWithItems.items.map((item) => _buildItemRow(item)),
                        const Divider(),
                        _buildSummaryRow('Tạm tính:', _calculateSubtotal(orderWithItems.items)),
                        if (orderWithItems.order.discount > 0)
                          _buildSummaryRow('Giảm giá:', orderWithItems.order.discount),
                        const Divider(),
                        _buildSummaryRow(
                          'Thành tiền:',
                          orderWithItems.order.totalAmount,
                          isBold: true,
                        ),
                        _buildSummaryRow('Đã thanh toán:', orderWithItems.order.paidAmount),
                        _buildSummaryRow(
                          'Còn nợ:',
                          orderWithItems.order.debtAmount,
                          color: orderWithItems.order.debtAmount > 0 ? Colors.red : null,
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Payment History
                Consumer(
                  builder: (context, ref, child) {
                    final paymentsAsync = ref.watch(
                      paymentRepositoryProvider.selectAsync(
                        (repo) => repo.getPaymentsForOrder(widget.orderId),
                      ),
                    );

                    return paymentsAsync.when(
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
                      loading: () => const Center(child: CircularProgressIndicator()),
                      error: (error, stack) => Text('Lỗi: ${error.toString()}'),
                    );
                  },
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
      floatingActionButton: orderWithItemsAsync.when(
        data: (orderWithItems) {
          if (orderWithItems == null) return null;

          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Record Payment Button
              if (orderWithItems.order.debtAmount > 0)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: FloatingActionButton.extended(
                    onPressed: () => _showRecordPaymentDialog(orderWithItems.order),
                    backgroundColor: Colors.green,
                    icon: const Icon(Icons.payment, color: Colors.white),
                    label: const Text(
                      'Thanh toán',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ),

              // Action Buttons Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  // Print/Share Button
                  FloatingActionButton.extended(
                    onPressed: () => _printOrShareOrder(orderWithItems),
                    backgroundColor: Colors.blue,
                    icon: const Icon(Icons.print, color: Colors.white),
                    label: const Text(
                      'In/Chia sẻ',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            ],
          );
        },
        loading: () => null,
        error: (error, stack) => null,
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    String text;
    
    switch (status) {
      case 'pending':
        color = Colors.orange;
        text = 'Chờ thanh toán';
        break;
      case 'paid':
        color = Colors.green;
        text = 'Đã thanh toán';
        break;
      case 'partial':
        color = Colors.blue;
        text = 'Thanh toán một phần';
        break;
      default:
        color = Colors.grey;
        text = 'Không xác định';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w500,
        ),
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
            width: 100,
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

  Widget _buildCustomerInfo(int customerId) {
    return Consumer(
      builder: (context, ref, child) {
        final customerAsync = ref.watch(
          customerRepositoryProvider.selectAsync((repo) => repo.getCustomerById(customerId)),
        );

        return customerAsync.when(
          data: (customer) {
            if (customer == null) return const SizedBox.shrink();
            return _buildInfoRow('Khách hàng:', customer.name);
          },
          loading: () => const Text('Đang tải...'),
          error: (error, stack) => Text('Lỗi: ${error.toString()}'),
        );
      },
    );
  }

  Widget _buildItemRow(OrderItem item) {
    return Consumer(
      builder: (context, ref, child) {
        final productAsync = ref.watch(
          productRepositoryProvider.selectAsync((repo) => repo.getProductById(item.productId)),
        );
        final unitAsync = ref.watch(
          productRepositoryProvider.selectAsync((repo) async {
            final units = await repo.getUnitsForProduct(item.productId);
            return units.firstWhere((unit) => unit.id == item.unitId);
          }),
        );

        return productAsync.when(
          data: (product) {
            return unitAsync.when(
              data: (unit) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              product?.name ?? 'Sản phẩm',
                              style: const TextStyle(fontWeight: FontWeight.w500),
                            ),
                            Text(
                              '${item.qty} ${unit.unitName} x ${_formatCurrency(item.unitPrice)}',
                              style: const TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        _formatCurrency(item.lineTotal),
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                );
              },
              loading: () => const Text('Đang tải...'),
              error: (error, stack) => Text('Lỗi: ${error.toString()}'),
            );
          },
          loading: () => const Text('Đang tải...'),
          error: (error, stack) => Text('Lỗi: ${error.toString()}'),
        );
      },
    );
  }

  Widget _buildSummaryRow(String label, double amount, {bool isBold = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              fontSize: isBold ? 16 : 14,
            ),
          ),
          Text(
            _formatCurrency(amount),
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              fontSize: isBold ? 16 : 14,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentRow(Payment payment) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
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
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                _formatCurrency(payment.amount),
                style: const TextStyle(fontWeight: FontWeight.w500, color: Colors.green),
              ),
              Text(
                _getPaymentMethodText(payment.method),
                style: const TextStyle(color: Colors.grey, fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showRecordPaymentDialog(Order order) {
    final amountController = TextEditingController();
    final noteController = TextEditingController();
    String selectedMethod = 'cash';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Ghi nhận thanh toán'),
        content: SizedBox(
          width: 300,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Còn nợ: ${_formatCurrency(order.debtAmount)}',
                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  hintText: 'Số tiền thanh toán',
                  border: OutlineInputBorder(),
                  suffixText: 'đ',
                ),
                validator: (value) {
                  final amount = double.tryParse(value ?? '');
                  if (amount == null || amount <= 0) {
                    return 'Số tiền không hợp lệ';
                  }
                  if (amount > order.debtAmount) {
                    return 'Số tiền không được lớn hơn số nợ';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: selectedMethod,
                decoration: const InputDecoration(
                  labelText: 'Phương thức thanh toán',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'cash', child: Text('Tiền mặt')),
                  DropdownMenuItem(value: 'transfer', child: Text('Chuyển khoản')),
                  DropdownMenuItem(value: 'card', child: Text('Thẻ')),
                ],
                onChanged: (value) {
                  selectedMethod = value!;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: noteController,
                decoration: const InputDecoration(
                  hintText: 'Ghi chú (tùy chọn)',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () async {
              final amount = double.tryParse(amountController.text) ?? 0;
              if (amount > 0) {
                await _recordPayment(order.id, amount, selectedMethod, noteController.text.trim());
                Navigator.of(context).pop();
              }
            },
            child: const Text('Thanh toán'),
          ),
        ],
      ),
    );
  }

  Future<void> _recordPayment(int orderId, double amount, String method, String note) async {
    try {
      final paymentRepo = ref.read(paymentRepositoryProvider);
      await paymentRepo.recordOrderPayment(orderId, amount, method, note.isNotEmpty ? note : null);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Ghi nhận thanh toán thành công'),
            backgroundColor: Colors.green,
          ),
        );
        // Refresh the data
        ref.invalidate(orderRepositoryProvider);
        ref.invalidate(paymentRepositoryProvider);
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

  Future<void> _printOrShareOrder(OrderWithItems orderWithItems) async {
    try {
      final pdf = await PdfGenerator.generateInvoice(orderWithItems);
      
      await Printing.sharePdf(
        bytes: await pdf.save(),
        filename: 'hoadon_${orderWithItems.order.code}.pdf',
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi tạo PDF: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
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

  double _calculateSubtotal(List<OrderItem> items) {
    return items.fold(0.0, (sum, item) => sum + item.lineTotal);
  }
}
