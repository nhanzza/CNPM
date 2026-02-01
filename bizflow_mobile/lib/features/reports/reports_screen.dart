import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../data/db/app_db.dart';
import '../../state/providers.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen> with TickerProviderStateMixin {
  late TabController _tabController;
  String _selectedPeriod = 'month';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Period Selector
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.grey[100],
            child: Row(
              children: [
                const Text('Kỳ báo cáo:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(width: 16),
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildPeriodChip('Hôm nay', 'today'),
                        _buildPeriodChip('Tuần này', 'week'),
                        _buildPeriodChip('Tháng này', 'month'),
                        _buildPeriodChip('Tháng trước', 'last_month'),
                        _buildPeriodChip('Năm này', 'year'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Tab Bar
          TabBar(
            controller: _tabController,
            tabs: const [
              Tab(text: 'Doanh thu'),
              Tab(text: 'Sản phẩm'),
              Tab(text: 'Công nợ'),
              Tab(text: 'Tồn kho'),
            ],
          ),
          
          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildRevenueTab(),
                _buildProductsTab(),
                _buildDebtTab(),
                _buildInventoryTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPeriodChip(String label, String value) {
    final isSelected = _selectedPeriod == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _selectedPeriod = value;
          });
        },
        backgroundColor: Colors.white,
        selectedColor: Colors.blue.withOpacity(0.2),
        checkmarkColor: Colors.blue,
      ),
    );
  }

  Widget _buildRevenueTab() {
    return Consumer(
      builder: (context, ref, child) {
        final ordersAsync = ref.watch(ordersProvider);
        
        return ordersAsync.when(
          data: (orders) {
            final filteredOrders = _filterOrdersByPeriod(orders);
            final totalRevenue = filteredOrders.fold(0.0, (sum, order) => sum + order.totalAmount);
            final paidAmount = filteredOrders.fold(0.0, (sum, order) => sum + order.paidAmount);
            final debtAmount = filteredOrders.fold(0.0, (sum, order) => sum + order.debtAmount);
            
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Revenue Summary Cards
                  Row(
                    children: [
                      Expanded(child: _buildSummaryCard('Tổng doanh thu', totalRevenue, Colors.green)),
                      const SizedBox(width: 8),
                      Expanded(child: _buildSummaryCard('Đã thu', paidAmount, Colors.blue)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(child: _buildSummaryCard('Công nợ', debtAmount, Colors.red)),
                      const SizedBox(width: 8),
                      Expanded(child: _buildSummaryCard('Đơn hàng', filteredOrders.length.toDouble(), Colors.orange)),
                    ],
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Revenue Chart (Simple bar chart representation)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Biểu đồ doanh thu',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          _buildSimpleRevenueChart(filteredOrders),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Recent Orders
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Đơn hàng gần đây',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          ...filteredOrders.take(5).map((order) => _buildOrderSummary(order)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => Center(child: Text('Lỗi: ${error.toString()}')),
        );
      },
    );
  }

  Widget _buildProductsTab() {
    return Consumer(
      builder: (context, ref, child) {
        final ordersAsync = ref.watch(ordersProvider);
        final productsAsync = ref.watch(productsProvider);
        
        return ordersAsync.when(
          data: (orders) {
            final filteredOrders = _filterOrdersByPeriod(orders);
            final productSales = _calculateProductSales(filteredOrders);
            
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Top Products
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Sản phẩm bán chạy',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          if (productSales.isEmpty)
                            const Center(
                              child: Padding(
                                padding: EdgeInsets.all(16),
                                child: Text('Chưa có dữ liệu bán hàng'),
                              ),
                            )
                          else
                            ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: productSales.length,
                              itemBuilder: (context, index) {
                                final sale = productSales[index];
                                return _buildProductSaleItem(sale, index + 1);
                              },
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => Center(child: Text('Lỗi: ${error.toString()}')),
        );
      },
    );
  }

  Widget _buildDebtTab() {
    return Consumer(
      builder: (context, ref, child) {
        final customersAsync = ref.watch(customersProvider);
        
        return customersAsync.when(
          data: (customers) {
            final customersWithDebt = customers.where((c) => c.totalDebtCached > 0).toList();
            final totalDebt = customers.fold(0.0, (sum, customer) => sum + customer.totalDebtCached);
            
            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Debt Summary
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Text(
                            'Tổng công nợ',
                            style: const TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _formatCurrency(totalDebt),
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.red,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${customersWithDebt.length} khách hàng có nợ',
                            style: const TextStyle(color: Colors.grey),
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Customers with Debt
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Chi tiết công nợ',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 16),
                          if (customersWithDebt.isEmpty)
                            const Center(
                              child: Padding(
                                padding: EdgeInsets.all(16),
                                child: Text('Không có khách hàng nợ'),
                              ),
                            )
                          else
                            ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: customersWithDebt.length,
                              itemBuilder: (context, index) {
                                final customer = customersWithDebt[index];
                                return _buildCustomerDebtItem(customer);
                              },
                            ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => Center(child: Text('Lỗi: ${error.toString()}')),
        );
      },
    );
  }

  Widget _buildInventoryTab() {
    return Consumer(
      builder: (context, ref, child) {
        final productsAsync = ref.watch(productsProvider);
        
        return productsAsync.when(
          data: (products) {
            return FutureBuilder<List<ProductWithStock>>(
              future: _getProductsWithStock(products),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                
                if (!snapshot.hasData) {
                  return const Center(child: Text('Lỗi tải dữ liệu tồn kho'));
                }
                
                final productsWithStock = snapshot.data!;
                final lowStockProducts = productsWithStock.where((p) => p.currentStock < 10).toList();
                
                return SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      // Low Stock Alert
                      Card(
                        color: Colors.red.withOpacity(0.1),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.warning, color: Colors.red, size: 24),
                                  const SizedBox(width: 8),
                                  const Text(
                                    'Cảnh báo tồn kho thấp',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.red,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '${lowStockProducts.length} sản phẩm sắp hết hàng',
                                style: const TextStyle(color: Colors.red),
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 16),
                      
                      // Low Stock Products
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Sản phẩm tồn kho thấp',
                                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 16),
                              if (lowStockProducts.isEmpty)
                                const Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(16),
                                    child: Text('Tất cả sản phẩm đều đủ hàng'),
                                  ),
                                )
                              else
                                ListView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  itemCount: lowStockProducts.length,
                                  itemBuilder: (context, index) {
                                    final productWithStock = lowStockProducts[index];
                                    return _buildLowStockItem(productWithStock);
                                  },
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => Center(child: Text('Lỗi: ${error.toString()}')),
        );
      },
    );
  }

  Widget _buildSummaryCard(String title, double value, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 14, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Text(
              value % 1 == 0 ? value.toInt().toString() : value.toStringAsFixed(1),
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSimpleRevenueChart(List<Order> orders) {
    // Group orders by day for simple chart
    final Map<String, double> dailyRevenue = {};
    for (final order in orders) {
      final dayKey = DateFormat('dd/MM').format(order.createdAt);
      dailyRevenue[dayKey] = (dailyRevenue[dayKey] ?? 0) + order.totalAmount;
    }
    
    final maxRevenue = dailyRevenue.values.isEmpty ? 1.0 : dailyRevenue.values.reduce((a, b) => a > b ? a : b);
    
    return Container(
      height: 200,
      child: Column(
        children: [
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: dailyRevenue.entries.map((entry) {
                final height = (entry.value / maxRevenue) * 150;
                return Expanded(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    height: height,
                    decoration: BoxDecoration(
                      color: Colors.blue,
                      borderRadius: BorderRadius.vertical(top: Radius.circular(4)),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          _formatCurrency(entry.value),
                          style: const TextStyle(fontSize: 10, color: Colors.white),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: dailyRevenue.keys.map((day) => Expanded(
              child: Text(
                day,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 10),
              ),
            )).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderSummary(Order order) {
    return ListTile(
      title: Text(order.code),
      subtitle: Text(_formatDate(order.createdAt)),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(_formatCurrency(order.totalAmount)),
          if (order.debtAmount > 0)
            Text(
              'Nợ: ${_formatCurrency(order.debtAmount)}',
              style: const TextStyle(color: Colors.red, fontSize: 12),
            ),
        ],
      ),
    );
  }

  Widget _buildProductSaleItem(ProductSale sale, int rank) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: Colors.blue,
        child: Text(
          rank.toString(),
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      ),
      title: Text(sale.productName),
      subtitle: Text('${sale.quantity} sản phẩm'),
      trailing: Text(_formatCurrency(sale.revenue)),
    );
  }

  Widget _buildCustomerDebtItem(Customer customer) {
    return ListTile(
      title: Text(customer.name),
      subtitle: customer.phone?.isNotEmpty == true ? Text(customer.phone!) : null,
      trailing: Text(
        _formatCurrency(customer.totalDebtCached),
        style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildLowStockItem(ProductWithStock productWithStock) {
    return ListTile(
      title: Text(productWithStock.product.name),
      subtitle: Text('Danh mục: ${productWithStock.product.category}'),
      trailing: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.red.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.red),
        ),
        child: Text(
          '${productWithStock.currentStock.toStringAsFixed(1)}',
          style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  List<Order> _filterOrdersByPeriod(List<Order> orders) {
    final now = DateTime.now();
    DateTime startDate;
    
    switch (_selectedPeriod) {
      case 'today':
        startDate = DateTime(now.year, now.month, now.day);
        break;
      case 'week':
        startDate = now.subtract(Duration(days: now.weekday - 1));
        startDate = DateTime(startDate.year, startDate.month, startDate.day);
        break;
      case 'month':
        startDate = DateTime(now.year, now.month, 1);
        break;
      case 'last_month':
        final lastMonth = now.month == 1 ? 12 : now.month - 1;
        final lastMonthYear = now.month == 1 ? now.year - 1 : now.year;
        startDate = DateTime(lastMonthYear, lastMonth, 1);
        final endDate = DateTime(lastMonthYear, lastMonth + 1, 1);
        return orders.where((order) => 
          order.createdAt.isAfter(startDate) && order.createdAt.isBefore(endDate)
        ).toList();
      case 'year':
        startDate = DateTime(now.year, 1, 1);
        break;
      default:
        startDate = DateTime(now.year, now.month, 1);
    }
    
    return orders.where((order) => order.createdAt.isAfter(startDate)).toList();
  }

  List<ProductSale> _calculateProductSales(List<Order> orders) {
    final Map<int, ProductSale> sales = {};
    
    for (final order in orders) {
      // This is simplified - in real app, you'd need to fetch order items
      // For now, we'll create mock data based on orders
      final productId = (order.id % 5) + 1; // Mock product ID
      final productName = 'Sản phẩm $productId';
      
      if (sales.containsKey(productId)) {
        final existing = sales[productId]!;
        sales[productId] = ProductSale(
          productId: productId,
          productName: productName,
          quantity: existing.quantity + 1,
          revenue: existing.revenue + order.totalAmount,
        );
      } else {
        sales[productId] = ProductSale(
          productId: productId,
          productName: productName,
          quantity: 1,
          revenue: order.totalAmount,
        );
      }
    }
    
    final sortedSales = sales.values.toList();
    sortedSales.sort((a, b) => b.revenue.compareTo(a.revenue));
    
    return sortedSales.take(10).toList();
  }

  Future<List<ProductWithStock>> _getProductsWithStock(List<Product> products) async {
    final inventoryRepo = ref.read(inventoryRepositoryProvider);
    final List<ProductWithStock> result = [];
    
    for (final product in products) {
      final stock = await inventoryRepo.getCurrentStock(product.id);
      result.add(ProductWithStock(product, stock));
    }
    
    return result;
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  String _formatCurrency(double amount) {
    return '${amount.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}đ';
  }
}

class ProductSale {
  final int productId;
  final String productName;
  final int quantity;
  final double revenue;

  ProductSale({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.revenue,
  });
}

class ProductWithStock {
  final Product product;
  final double currentStock;

  ProductWithStock(this.product, this.currentStock);
}
