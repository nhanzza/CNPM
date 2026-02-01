import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/db/app_db.dart';
import '../../state/providers.dart';

class ProductListScreen extends ConsumerStatefulWidget {
  const ProductListScreen({super.key});

  @override
  ConsumerState<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends ConsumerState<ProductListScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'Tất cả';

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productsProvider);
    final searchQuery = _searchController.text.toLowerCase();

    return Scaffold(
      body: Column(
        children: [
          // Search and Filter Section
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.grey[100],
            child: Column(
              children: [
                // Search bar
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Tìm kiếm sản phẩm...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                  ),
                  onChanged: (value) {
                    setState(() {});
                  },
                ),
                const SizedBox(height: 12),
                
                // Category filter
                Consumer(
                  builder: (context, ref, child) {
                    final productsAsync = ref.watch(productsProvider);
                    return productsAsync.when(
                      data: (products) {
                        final categories = ['Tất cả', ...products.map((p) => p.category).toSet().toList()];
                        
                        return SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: categories.map((category) {
                              return Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: FilterChip(
                                  label: Text(category),
                                  selected: _selectedCategory == category,
                                  onSelected: (selected) {
                                    setState(() {
                                      _selectedCategory = category;
                                    });
                                  },
                                  backgroundColor: Colors.white,
                                  selectedColor: Colors.blue.withOpacity(0.2),
                                  checkmarkColor: Colors.blue,
                                ),
                              );
                            }).toList(),
                          ),
                        );
                      },
                      loading: () => const SizedBox.shrink(),
                      error: (error, stack) => const SizedBox.shrink(),
                    );
                  },
                ),
              ],
            ),
          ),
          
          // Products List
          Expanded(
            child: productsAsync.when(
              data: (products) {
                // Filter products
                var filteredProducts = products.where((product) {
                  // Category filter
                  if (_selectedCategory != 'Tất cả' && product.category != _selectedCategory) {
                    return false;
                  }
                  
                  // Search filter
                  if (searchQuery.isNotEmpty) {
                    return product.name.toLowerCase().contains(searchQuery) ||
                           product.category.toLowerCase().contains(searchQuery);
                  }
                  
                  return true;
                }).toList();

                if (filteredProducts.isEmpty) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.inventory, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text(
                          'Không có sản phẩm nào',
                          style: TextStyle(fontSize: 18, color: Colors.grey),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: filteredProducts.length,
                  itemBuilder: (context, index) {
                    final product = filteredProducts[index];
                    return _buildProductCard(product);
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, stack) => Center(
                child: Text('Lỗi: ${error.toString()}'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductCard(Product product) {
    return Consumer(
      builder: (context, ref, child) {
        final unitsAsync = ref.watch(
          productRepositoryProvider.selectAsync(
            (repo) => repo.getUnitsForProduct(product.id),
          ),
        );
        final stockAsync = ref.watch(
          inventoryRepositoryProvider.selectAsync(
            (repo) => repo.getCurrentStock(product.id),
          ),
        );

        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: ListTile(
            onTap: () => context.go('/inventory/products/${product.id}'),
            title: Row(
              children: [
                Expanded(
                  child: Text(
                    product.name,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: product.isActive ? Colors.green.withOpacity(0.1) : Colors.grey.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: product.isActive ? Colors.green : Colors.grey,
                    ),
                  ),
                  child: Text(
                    product.isActive ? 'Hoạt động' : 'Ngừng',
                    style: TextStyle(
                      color: product.isActive ? Colors.green : Colors.grey,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text(
                  'Danh mục: ${product.category}',
                  style: const TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 4),
                unitsAsync.when(
                  data: (units) => Text(
                    'Đơn vị: ${units.map((u) => u.unitName).join(', ')}',
                    style: const TextStyle(color: Colors.grey),
                  ),
                  loading: () => const Text('Đang tải đơn vị...', style: TextStyle(color: Colors.grey)),
                  error: (error, stack) => const Text('Lỗi tải đơn vị', style: TextStyle(color: Colors.red)),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    stockAsync.when(
                      data: (stock) => Row(
                        children: [
                          const Icon(Icons.inventory_2, size: 16, color: Colors.blue),
                          const SizedBox(width: 4),
                          Text(
                            'Tồn kho: ${stock.toStringAsFixed(2)}',
                            style: const TextStyle(
                              color: Colors.blue,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      loading: () => const Text('Đang tải tồn kho...'),
                      error: (error, stack) => const Text('Lỗi tải tồn kho'),
                    ),
                    const Spacer(),
                    unitsAsync.when(
                      data: (units) => Text(
                        'Giá: ${_formatCurrency(units.first.price)}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                      loading: () => const SizedBox.shrink(),
                      error: (error, stack) => const SizedBox.shrink(),
                    ),
                  ],
                ),
              ],
            ),
            trailing: PopupMenuButton<String>(
              onSelected: (value) {
                switch (value) {
                  case 'edit':
                    context.go('/inventory/products/${product.id}');
                    break;
                  case 'toggle_status':
                    _toggleProductStatus(product);
                    break;
                  case 'stock_adjust':
                    _showStockAdjustDialog(product);
                    break;
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'edit',
                  child: Row(
                    children: [
                      Icon(Icons.edit, color: Colors.blue),
                      SizedBox(width: 8),
                      Text('Chỉnh sửa'),
                    ],
                  ),
                ),
                PopupMenuItem(
                  value: 'toggle_status',
                  child: Row(
                    children: [
                      Icon(
                        product.isActive ? Icons.block : Icons.check_circle,
                        color: product.isActive ? Colors.red : Colors.green,
                      ),
                      const SizedBox(width: 8),
                      Text(product.isActive ? 'Ngừng hoạt động' : 'Kích hoạt'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'stock_adjust',
                  child: Row(
                    children: [
                      Icon(Icons.tune, color: Colors.orange),
                      SizedBox(width: 8),
                      Text('Điều chỉnh kho'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _toggleProductStatus(Product product) async {
    try {
      final productRepo = ref.read(productRepositoryProvider);
      await productRepo.updateProductStatus(product.id, !product.isActive);
      
      // Refresh data
      ref.invalidate(productsProvider);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${product.isActive ? 'Ngừng' : 'Kích hoạt'} sản phẩm thành công'),
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

  void _showStockAdjustDialog(Product product) {
    final quantityController = TextEditingController();
    final noteController = TextEditingController();
    String adjustmentType = 'import';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Điều chỉnh kho - ${product.name}'),
        content: SizedBox(
          width: 300,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RadioListTile<String>(
                title: const Text('Nhập kho'),
                value: 'import',
                groupValue: adjustmentType,
                onChanged: (value) {
                  adjustmentType = value!;
                  Navigator.of(context).pop();
                  _showStockAdjustDialog(product);
                },
              ),
              RadioListTile<String>(
                title: const Text('Xuất kho/Điều chỉnh'),
                value: 'adjustment',
                groupValue: adjustmentType,
                onChanged: (value) {
                  adjustmentType = value!;
                  Navigator.of(context).pop();
                  _showStockAdjustDialog(product);
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: quantityController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: adjustmentType == 'import' ? 'Số lượng nhập' : 'Số lượng điều chỉnh',
                  border: const OutlineInputBorder(),
                  suffixText: product.category.contains('kg') || product.category.contains('lít') ? 'kg/lít' : 'cái',
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
                controller: noteController,
                decoration: const InputDecoration(
                  hintText: 'Ghi chú',
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
              final quantity = double.tryParse(quantityController.text) ?? 0;
              if (quantity > 0) {
                await _adjustStock(product.id, quantity, adjustmentType, noteController.text.trim());
                Navigator.of(context).pop();
              }
            },
            child: Text(adjustmentType == 'import' ? 'Nhập kho' : 'Điều chỉnh'),
          ),
        ],
      ),
    );
  }

  Future<void> _adjustStock(int productId, double quantity, String type, String note) async {
    try {
      final inventoryRepo = ref.read(inventoryRepositoryProvider);
      
      if (type == 'import') {
        await inventoryRepo.stockImport(productId, quantity, note);
      } else {
        await inventoryRepo.stockAdjustment(productId, -quantity, note);
      }
      
      // Refresh data
      ref.invalidate(inventoryLogsProvider);
      ref.invalidate(productsProvider);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${type == 'import' ? 'Nhập kho' : 'Điều chỉnh'} thành công'),
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

  String _formatCurrency(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}đ';
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
