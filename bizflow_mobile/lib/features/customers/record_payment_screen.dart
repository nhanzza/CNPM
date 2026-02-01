import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../state/providers.dart';

class RecordPaymentScreen extends ConsumerStatefulWidget {
  final int customerId;
  
  const RecordPaymentScreen({
    super.key,
    required this.customerId,
  });

  @override
  ConsumerState<RecordPaymentScreen> createState() => _RecordPaymentScreenState();
}

class _RecordPaymentScreenState extends ConsumerState<RecordPaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();
  String _selectedMethod = 'cash';
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final customerAsync = ref.watch(
      customerRepositoryProvider.selectAsync((repo) => repo.getCustomerById(widget.customerId))
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Thanh toán nợ'),
      ),
      body: customerAsync.when(
        data: (customer) {
          if (customer == null) {
            return const Center(
              child: Text('Không tìm thấy khách hàng'),
            );
          }

          return Form(
            key: _formKey,
            child: SingleChildScrollView(
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
                                radius: 20,
                                backgroundColor: Colors.blue,
                                child: Text(
                                  customer.name.isNotEmpty
                                      ? customer.name[0].toUpperCase()
                                      : 'K',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      customer.name,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    if (customer.phone?.isNotEmpty == true)
                                      Text(
                                        customer.phone!,
                                        style: const TextStyle(color: Colors.grey),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.red.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.red),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Số nợ hiện tại:',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  _formatCurrency(customer.totalDebtCached),
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.red,
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

                  // Payment Form
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Thông tin thanh toán',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _amountController,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              labelText: 'Số tiền thanh toán',
                              border: const OutlineInputBorder(),
                              hintText: 'Nhập số tiền muốn thanh toán',
                              suffixText: 'đ',
                              prefixIcon: const Icon(Icons.money),
                            ),
                            validator: (value) {
                              final amount = double.tryParse(value ?? '');
                              if (amount == null || amount <= 0) {
                                return 'Số tiền không hợp lệ';
                              }
                              if (amount > customer.totalDebtCached) {
                                return 'Số tiền không được lớn hơn số nợ';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          DropdownButtonFormField<String>(
                            value: _selectedMethod,
                            decoration: const InputDecoration(
                              labelText: 'Phương thức thanh toán',
                              border: OutlineInputBorder(),
                              prefixIcon: Icon(Icons.payment),
                            ),
                            items: const [
                              DropdownMenuItem(value: 'cash', child: Text('Tiền mặt')),
                              DropdownMenuItem(value: 'transfer', child: Text('Chuyển khoản')),
                              DropdownMenuItem(value: 'card', child: Text('Thẻ tín dụng')),
                            ],
                            onChanged: (value) {
                              setState(() {
                                _selectedMethod = value!;
                              });
                            },
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _noteController,
                            maxLines: 3,
                            decoration: const InputDecoration(
                              labelText: 'Ghi chú (tùy chọn)',
                              border: OutlineInputBorder(),
                              hintText: 'Nhập ghi chú cho giao dịch',
                              prefixIcon: Icon(Icons.note),
                            ),
                          ),
                          const SizedBox(height: 16),
                          
                          // Quick amount buttons
                          const Text(
                            'Thanh toán nhanh:',
                            style: TextStyle(fontWeight: FontWeight.w500),
                          ),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            children: [
                              _buildQuickAmountButton(customer.totalDebtCached, 'Trả hết'),
                              if (customer.totalDebtCached >= 100000)
                                _buildQuickAmountButton(100000, '100k'),
                              if (customer.totalDebtCached >= 500000)
                                _buildQuickAmountButton(500000, '500k'),
                              if (customer.totalDebtCached >= 1000000)
                                _buildQuickAmountButton(1000000, '1tr'),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 100), // Space for save button
                ],
              ),
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Text('Lỗi: ${error.toString()}'),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _isLoading ? null : _savePayment,
        backgroundColor: Colors.green,
        icon: _isLoading 
            ? const CircularProgressIndicator(color: Colors.white)
            : const Icon(Icons.check, color: Colors.white),
        label: const Text(
          'Xác nhận thanh toán',
          style: TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildQuickAmountButton(double amount, String label) {
    return ElevatedButton(
      onPressed: () {
        _amountController.text = amount.toStringAsFixed(0);
      },
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.blue.withOpacity(0.1),
        foregroundColor: Colors.blue,
        side: BorderSide(color: Colors.blue),
      ),
      child: Text(label),
    );
  }

  Future<void> _savePayment() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isLoading = true);

    try {
      final paymentRepo = ref.read(paymentRepositoryProvider);
      final amount = double.tryParse(_amountController.text) ?? 0;
      final note = _noteController.text.trim();

      await paymentRepo.recordCustomerDebtPayment(
        widget.customerId,
        amount,
        _selectedMethod,
        note.isNotEmpty ? note : null,
      );

      // Refresh data
      ref.invalidate(customerRepositoryProvider);
      ref.invalidate(paymentRepositoryProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Thanh toán thành công: ${_formatCurrency(amount)}'),
            backgroundColor: Colors.green,
          ),
        );
        context.pop();
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
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  String _formatCurrency(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}đ';
  }

  @override
  void dispose() {
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }
}
