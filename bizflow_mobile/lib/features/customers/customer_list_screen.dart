import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/db/app_db.dart';
import '../../state/providers.dart';

class CustomerListScreen extends ConsumerStatefulWidget {
  const CustomerListScreen({super.key});

  @override
  ConsumerState<CustomerListScreen> createState() => _CustomerListScreenState();
}

class _CustomerListScreenState extends ConsumerState<CustomerListScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _filterType = 'all';

  @override
  Widget build(BuildContext context) {
    final customersAsync = ref.watch(customersProvider);
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
                    hintText: 'Tìm kiếm khách hàng...',
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
                
                // Filter chips
                Row(
                  children: [
                    const Text('Lọc: ', style: TextStyle(fontWeight: FontWeight.bold)),
                    Expanded(
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _buildFilterChip('Tất cả', 'all'),
                            _buildFilterChip('Có nợ', 'debt'),
                            _buildFilterChip('Không nợ', 'no_debt'),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Customers List
          Expanded(
            child: customersAsync.when(
              data: (customers) {
                // Filter customers
                var filteredCustomers = customers.where((customer) {
                  // Type filter
                  if (_filterType == 'debt' && customer.totalDebtCached <= 0) {
                    return false;
                  }
                  if (_filterType == 'no_debt' && customer.totalDebtCached > 0) {
                    return false;
                  }
                  
                  // Search filter
                  if (searchQuery.isNotEmpty) {
                    return customer.name.toLowerCase().contains(searchQuery) ||
                           (customer.phone?.toLowerCase().contains(searchQuery) ?? false) ||
                           (customer.address?.toLowerCase().contains(searchQuery) ?? false);
                  }
                  
                  return true;
                }).toList();

                if (filteredCustomers.isEmpty) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.people, size: 64, color: Colors.grey),
                        SizedBox(height: 16),
                        Text(
                          'Không có khách hàng nào',
                          style: TextStyle(fontSize: 18, color: Colors.grey),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: filteredCustomers.length,
                  itemBuilder: (context, index) {
                    final customer = filteredCustomers[index];
                    return _buildCustomerCard(customer);
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

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _filterType == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _filterType = value;
          });
        },
        backgroundColor: Colors.white,
        selectedColor: Colors.blue.withOpacity(0.2),
        checkmarkColor: Colors.blue,
      ),
    );
  }

  Widget _buildCustomerCard(Customer customer) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        onTap: () => context.go('/customers/${customer.id}'),
        title: Row(
          children: [
            Expanded(
              child: Text(
                customer.name,
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            if (customer.totalDebtCached > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red),
                ),
                child: Text(
                  'Nợ',
                  style: TextStyle(
                    color: Colors.red,
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
            if (customer.phone?.isNotEmpty == true)
              Text(
                'Điện thoại: ${customer.phone}',
                style: const TextStyle(color: Colors.grey),
              ),
            if (customer.address?.isNotEmpty == true)
              Text(
                'Địa chỉ: ${customer.address}',
                style: const TextStyle(color: Colors.grey),
              ),
            Text(
              'Ngày tạo: ${_formatDate(customer.createdAt)}',
              style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Tổng nợ:',
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
                Text(
                  _formatCurrency(customer.totalDebtCached),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: customer.totalDebtCached > 0 ? Colors.red : Colors.green,
                  ),
                ),
              ],
            ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (value) {
            switch (value) {
              case 'payment':
                context.go('/customers/${customer.id}/payment');
                break;
              case 'detail':
                context.go('/customers/${customer.id}');
                break;
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'detail',
              child: Row(
                children: [
                  Icon(Icons.info, color: Colors.blue),
                  SizedBox(width: 8),
                  Text('Chi tiết'),
                ],
              ),
            ),
            if (customer.totalDebtCached > 0)
              const PopupMenuItem(
                value: 'payment',
                child: Row(
                  children: [
                    Icon(Icons.payment, color: Colors.green),
                    SizedBox(width: 8),
                    Text('Thanh toán nợ'),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
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

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
