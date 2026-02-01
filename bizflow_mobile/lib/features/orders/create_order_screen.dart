import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';
import '../../data/db/app_db.dart';
import '../../state/providers.dart';

class CreateOrderScreen extends ConsumerStatefulWidget {
  const CreateOrderScreen({super.key});

  @override
  ConsumerState<CreateOrderScreen> createState() => _CreateOrderScreenState();
}

class _CreateOrderScreenState extends ConsumerState<CreateOrderScreen> {
  final _formKey = GlobalKey<FormState>();
  final _noteController = TextEditingController();
  final _discountController = TextEditingController(text: '0');
  
  Customer? _selectedCustomer;
  String _selectedSource = 'counter';
  final List<OrderItemData> _orderItems = [];
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final customersAsync = ref.watch(customersProvider);
    final productsWithUnitsAsync = ref.watch(productsWithUnitsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tạo đơn hàng'),
        actions: [
          IconButton(
            onPressed: _isLoading ? null : _saveOrder,
            icon: _isLoading 
                ? const CircularProgressIndicator(color: Colors.white)
                : const Icon(Icons.save),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Customer Selection
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Khách hàng',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      customersAsync.when(
                        data: (customers) => DropdownButtonFormField<Customer>(
                          value: _selectedCustomer,
                          decoration: const InputDecoration(
                            hintText: 'Chọn khách hàng (tùy chọn)',
                            border: OutlineInputBorder(),
                          ),
                          items: [
                            const DropdownMenuItem(
                              value: null,
                              child: Text('Khách vãng lai'),
                            ),
                            ...customers.map((customer) => DropdownMenuItem(
                              value: customer,
                              child: Text(customer.name),
                            )),
                          ],
                          onChanged: (customer) {
                            setState(() {
                              _selectedCustomer = customer;
                            });
                          },
                        ),
                        loading: () => const Center(child: CircularProgressIndicator()),
                        error: (error, stack) => Text('Lỗi: ${error.toString()}'),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Source Selection
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Nguồn đơn hàng',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: RadioListTile<String>(
                              title: const Text('Quầy'),
                              value: 'counter',
                              groupValue: _selectedSource,
                              onChanged: (value) {
                                setState(() {
                                  _selectedSource = value!;
                                });
                              },
                            ),
                          ),
                          Expanded(
                            child: RadioListTile<String>(
                              title: const Text('Zalo'),
                              value: 'zalo',
                              groupValue: _selectedSource,
                              onChanged: (value) {
                                setState(() {
                                  _selectedSource = value!;
                                });
                              },
                            ),
                          ),
                          Expanded(
                            child: RadioListTile<String>(
                              title: const Text('Điện thoại'),
                              value: 'phone',
                              groupValue: _selectedSource,
                              onChanged: (value) {
                                setState(() {
                                  _selectedSource = value!;
                                });
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Order Items
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Sản phẩm',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          TextButton.icon(
                            onPressed: _showAddItemDialog,
                            icon: const Icon(Icons.add),
                            label: const Text('Thêm sản phẩm'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      if (_orderItems.isEmpty)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.all(16),
                            child: Text('Chưa có sản phẩm nào'),
                          ),
                        )
                      else
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: _orderItems.length,
                          itemBuilder: (context, index) {
                            final item = _orderItems[index];
                            return _buildOrderItemCard(item, index);
                          },
                        ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Discount and Note
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Giảm giá',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _discountController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          hintText: 'Nhập số tiền giảm giá',
                          border: OutlineInputBorder(),
                          suffixText: 'đ',
                        ),
                        validator: (value) {
                          if (value != null && value.isNotEmpty) {
                            final discount = double.tryParse(value);
                            if (discount == null || discount < 0) {
                              return 'Giảm giá không hợp lệ';
                            }
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Ghi chú',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      TextFormField(
                        controller: _noteController,
                        maxLines: 3,
                        decoration: const InputDecoration(
                          hintText: 'Nhập ghi chú cho đơn hàng',
                          border: OutlineInputBorder(),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Order Summary
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Tổng cộng',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Tạm tính:'),
                          Text(_formatCurrency(_calculateSubtotal())),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Giảm giá:'),
                          Text(_formatCurrency(_getDiscount())),
                        ],
                      ),
                      const Divider(),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Thành tiền:',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          Text(
                            _formatCurrency(_calculateTotal()),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOrderItemCard(OrderItemData item, int index) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        title: Text(item.product.name),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Đơn vị: ${item.unit.unitName}'),
            Text('Đơn giá: ${_formatCurrency(item.unit.price)}'),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${item.quantity} x ${_formatCurrency(item.unit.price)} = ${_formatCurrency(item.lineTotal)}',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            IconButton(
              icon: const Icon(Icons.delete, color: Colors.red),
              onPressed: () {
                setState(() {
                  _orderItems.removeAt(index);
                });
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showAddItemDialog() {
    showDialog(
      context: context,
      builder: (context) => AddItemDialog(
        onAdd: (product, unit, quantity) {
          setState(() {
            _orderItems.add(OrderItemData(
              product: product,
              unit: unit,
              quantity: quantity,
              lineTotal: quantity * unit.price,
            ));
          });
        },
      ),
    );
  }

  Future<void> _saveOrder() async {
    if (!_formKey.currentState!.validate() || _orderItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng thêm ít nhất một sản phẩm'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final orderRepo = ref.read(orderRepositoryProvider);
      final orderCode = await orderRepo.generateOrderCode();
      final totalAmount = _calculateTotal();

      final order = OrdersCompanion.insert(
        code: orderCode,
        source: _selectedSource,
        customerId: Value(_selectedCustomer?.id),
        status: const Value('pending'),
        totalAmount: Value(totalAmount),
        paidAmount: const Value(0),
        debtAmount: Value(totalAmount),
        discount: Value(_getDiscount()),
        note: Value(_noteController.text.trim()),
      );

      final orderId = await orderRepo.createOrder(order);

      // Add order items
      for (final item in _orderItems) {
        await orderRepo.addOrderItem(
          OrderItemsCompanion.insert(
            orderId: orderId,
            productId: item.product.id,
            unitId: item.unit.id,
            qty: Value(item.quantity),
            unitPrice: Value(item.unit.price),
            lineTotal: Value(item.lineTotal),
          ),
        );
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Tạo đơn hàng thành công'),
            backgroundColor: Colors.green,
          ),
        );
        context.go('/home/orders/$orderId');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi tạo đơn hàng: ${e.toString()}'),
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

  double _calculateSubtotal() {
    return _orderItems.fold(0.0, (sum, item) => sum + item.lineTotal);
  }

  double _getDiscount() {
    return double.tryParse(_discountController.text) ?? 0.0;
  }

  double _calculateTotal() {
    return (_calculateSubtotal() - _getDiscount()).clamp(0.0, double.infinity);
  }

  String _formatCurrency(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}đ';
  }

  @override
  void dispose() {
    _noteController.dispose();
    _discountController.dispose();
    super.dispose();
  }
}

class OrderItemData {
  final Product product;
  final ProductUnit unit;
  final double quantity;
  final double lineTotal;

  OrderItemData({
    required this.product,
    required this.unit,
    required this.quantity,
    required this.lineTotal,
  });
}

class AddItemDialog extends ConsumerStatefulWidget {
  final Function(Product, ProductUnit, double) onAdd;

  const AddItemDialog({super.key, required this.onAdd});

  @override
  ConsumerState<AddItemDialog> createState() => _AddItemDialogState();
}

class _AddItemDialogState extends ConsumerState<AddItemDialog> {
  Product? _selectedProduct;
  ProductUnit? _selectedUnit;
  final _quantityController = TextEditingController(text: '1');

  @override
  Widget build(BuildContext context) {
    final productsWithUnitsAsync = ref.watch(productsWithUnitsProvider);

    return AlertDialog(
      title: const Text('Thêm sản phẩm'),
      content: SizedBox(
        width: 300,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Product selection
            productsWithUnitsAsync.when(
              data: (productsWithUnits) {
                final products = productsWithUnits.map((item) => item.product).toSet().toList();
                return DropdownButtonFormField<Product>(
                  value: _selectedProduct,
                  decoration: const InputDecoration(
                    hintText: 'Chọn sản phẩm',
                    border: OutlineInputBorder(),
                  ),
                  items: products.map((product) => DropdownMenuItem(
                    value: product,
                    child: Text(product.name),
                  )).toList(),
                  onChanged: (product) {
                    setState(() {
                      _selectedProduct = product;
                      _selectedUnit = null; // Reset unit when product changes
                    });
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => Text('Lỗi: ${error.toString()}'),
            ),

            const SizedBox(height: 16),

            // Unit selection
            if (_selectedProduct != null)
              Consumer(
                builder: (context, ref, child) {
                  final unitsAsync = ref.watch(
                    productRepositoryProvider.selectAsync(
                      (repo) => repo.getUnitsForProduct(_selectedProduct!.id),
                    ),
                  );

                  return unitsAsync.when(
                    data: (units) => DropdownButtonFormField<ProductUnit>(
                      value: _selectedUnit,
                      decoration: const InputDecoration(
                        hintText: 'Chọn đơn vị',
                        border: OutlineInputBorder(),
                      ),
                      items: units.map((unit) => DropdownMenuItem(
                        value: unit,
                        child: Text('${unit.unitName} (${_formatCurrency(unit.price)})'),
                      )).toList(),
                      onChanged: (unit) {
                        setState(() {
                          _selectedUnit = unit;
                        });
                      },
                    ),
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (error, stack) => Text('Lỗi: ${error.toString()}'),
                  );
                },
              ),

            const SizedBox(height: 16),

            // Quantity
            TextFormField(
              controller: _quantityController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                hintText: 'Số lượng',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                final quantity = double.tryParse(value ?? '');
                if (quantity == null || quantity <= 0) {
                  return 'Số lượng không hợp lệ';
                }
                return null;
              },
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
          onPressed: _selectedProduct != null && _selectedUnit != null
              ? () {
                  final quantity = double.tryParse(_quantityController.text) ?? 0;
                  if (quantity > 0) {
                    widget.onAdd(_selectedProduct!, _selectedUnit!, quantity);
                    Navigator.of(context).pop();
                  }
                }
              : null,
          child: const Text('Thêm'),
        ),
      ],
    );
  }

  String _formatCurrency(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}đ';
  }

  @override
  void dispose() {
    _quantityController.dispose();
    super.dispose();
  }
}
