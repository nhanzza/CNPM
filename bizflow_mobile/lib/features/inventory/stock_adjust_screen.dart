import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/db/app_db.dart';
import '../../state/providers.dart';

class StockAdjustScreen extends ConsumerStatefulWidget {
  const StockAdjustScreen({super.key});

  @override
  ConsumerState<StockAdjustScreen> createState() => _StockAdjustScreenState();
}

class _StockAdjustScreenState extends ConsumerState<StockAdjustScreen> {
  final _formKey = GlobalKey<FormState>();
  final _noteController = TextEditingController();
  
  Product? _selectedProduct;
  String _adjustmentType = 'import';
  final _quantityController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Điều chỉnh kho'),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Selection
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Chọn sản phẩm',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      productsAsync.when(
                        data: (products) => DropdownButtonFormField<Product>(
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
                            });
                          },
                          validator: (value) {
                            if (value == null) {
                              return 'Vui lòng chọn sản phẩm';
                            }
                            return null;
                          },
                        ),
                        loading: () => const Center(child: CircularProgressIndicator()),
                        error: (error, stack) => Text('Lỗi: ${error.toString()}'),
                      ),
                      
                      if (_selectedProduct != null) ...[
                        const SizedBox(height: 16),
                        Consumer(
                          builder: (context, ref, child) {
                            final stockAsync = ref.watch(
                              inventoryRepositoryProvider.selectAsync(
                                (repo) => repo.getCurrentStock(_selectedProduct!.id),
                              ),
                            );
                            
                            return stockAsync.when(
                              data: (stock) => Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.blue.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.blue),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.inventory_2, color: Colors.blue),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Tồn kho hiện tại: ${stock.toStringAsFixed(2)}',
                                      style: const TextStyle(
                                        color: Colors.blue,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              loading: () => const Text('Đang tải tồn kho...'),
                              error: (error, stack) => Text('Lỗi: ${error.toString()}'),
                            );
                          },
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Adjustment Type
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Loại điều chỉnh',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      RadioListTile<String>(
                        title: const Text('Nhập kho'),
                        subtitle: const Text('Tăng số lượng tồn kho'),
                        value: 'import',
                        groupValue: _adjustmentType,
                        onChanged: (value) {
                          setState(() {
                            _adjustmentType = value!;
                          });
                        },
                      ),
                      RadioListTile<String>(
                        title: const Text('Xuất kho'),
                        subtitle: const Text('Giảm số lượng tồn kho'),
                        value: 'adjustment',
                        groupValue: _adjustmentType,
                        onChanged: (value) {
                          setState(() {
                            _adjustmentType = value!;
                          });
                        },
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Quantity and Note
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${_adjustmentType == 'import' ? 'Nhập' : 'Xuất'} kho',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _quantityController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Số lượng',
                          border: const OutlineInputBorder(),
                          hintText: 'Nhập số lượng ${_adjustmentType == 'import' ? 'nhập' : 'xuất'} kho',
                          suffixText: _getUnitSuffix(),
                        ),
                        validator: (value) {
                          final quantity = double.tryParse(value ?? '');
                          if (quantity == null || quantity <= 0) {
                            return 'Số lượng không hợp lệ';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _noteController,
                        maxLines: 3,
                        decoration: InputDecoration(
                          labelText: 'Ghi chú',
                          border: const OutlineInputBorder(),
                          hintText: 'Lý do ${_adjustmentType == 'import' ? 'nhập' : 'xuất'} kho',
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Vui lòng nhập ghi chú';
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 100), // Space for save button
            ],
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _isLoading ? null : _saveAdjustment,
        backgroundColor: _adjustmentType == 'import' ? Colors.green : Colors.orange,
        icon: _isLoading 
            ? const CircularProgressIndicator(color: Colors.white)
            : Icon(_adjustmentType == 'import' ? Icons.download : Icons.upload, color: Colors.white),
        label: Text(
          _adjustmentType == 'import' ? 'Nhập kho' : 'Xuất kho',
          style: const TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  String _getUnitSuffix() {
    if (_selectedProduct == null) return '';
    
    // Simple unit detection based on category
    final category = _selectedProduct!.category.toLowerCase();
    if (category.contains('kg') || category.contains('nặng')) return 'kg';
    if (category.contains('lít') || category.contains('chất lỏng')) return 'lít';
    return 'cái';
  }

  Future<void> _saveAdjustment() async {
    if (!_formKey.currentState!.validate() || _selectedProduct == null) {
      return;
    }

    setState(() => _isLoading = true);

    try {
      final inventoryRepo = ref.read(inventoryRepositoryProvider);
      final quantity = double.tryParse(_quantityController.text) ?? 0;
      final note = _noteController.text.trim();

      if (_adjustmentType == 'import') {
        await inventoryRepo.stockImport(
          _selectedProduct!.id,
          quantity,
          note,
        );
      } else {
        await inventoryRepo.stockAdjustment(
          _selectedProduct!.id,
          -quantity, // Negative for reduction
          note,
        );
      }

      // Refresh data
      ref.invalidate(inventoryLogsProvider);
      ref.invalidate(productsProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${_adjustmentType == 'import' ? 'Nhập kho' : 'Xuất kho'} thành công'),
            backgroundColor: Colors.green,
          ),
        );
        
        // Clear form
        _formKey.currentState?.reset();
        _quantityController.clear();
        _noteController.clear();
        setState(() {
          _selectedProduct = null;
        });
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

  @override
  void dispose() {
    _noteController.dispose();
    _quantityController.dispose();
    super.dispose();
  }
}
