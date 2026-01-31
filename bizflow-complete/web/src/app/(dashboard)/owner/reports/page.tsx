'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/services/api.service'
import { authService } from '@/services/auth.service'
import { settingsService } from '@/services/settings.service'

interface Order {
  id: string
  order_number: string
  customer_name: string
  total_amount: number
  status: string
  payment_status?: string
  created_at: string
  items?: any[]
}

interface Product {
  id: string
  name: string
  price: number
  quantity_in_stock: number
  sku: string
}

interface Customer {
  id: string
  name: string
  phone?: string
  total_purchases?: number
}

interface ReportMetrics {
  total_revenue: number
  total_orders: number
  paid_orders: number
  unpaid_orders: number
  average_order_value: number
  total_customers: number
  total_inventory_value: number
  total_outstanding_debt: number
}

export default function ReportsPage() {
  const settings = settingsService.getSettings()
  const t = (vi: string, en: string) => (settings?.language === 'vi' ? vi : en)
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchAllData()
  }, [dateRange])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'

      // Fetch orders, products, customers
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        apiClient.get('/orders', { params: { store_id: storeId } }),
        apiClient.get('/products', { params: { store_id: storeId } }),
        apiClient.get('/customers', { params: { store_id: storeId } })
      ])

      const allOrders = ordersRes.data.orders || ordersRes.data || []
      const allProducts = productsRes.data.products || productsRes.data || []
      const allCustomers = customersRes.data.customers || customersRes.data || []

      // Filter orders by date range
      const filteredOrders = allOrders.filter((order: Order) => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0]
        return orderDate >= dateRange.startDate && orderDate <= dateRange.endDate
      })

      setOrders(filteredOrders)
      setProducts(allProducts)
      setCustomers(allCustomers)

      // Calculate metrics
      calculateMetrics(filteredOrders, allProducts, allCustomers)
    } catch (error) {
      console.error('Failed to fetch report data', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMetrics = (ordersData: Order[], productsData: Product[], customersData: Customer[]) => {
    // Revenue & Orders
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    const totalOrders = ordersData.length
    const paidOrders = ordersData.filter(o => o.payment_status === 'paid').length
    const unpaidOrders = totalOrders - paidOrders
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Customers
    const totalCustomers = customersData.length

    // Inventory
    const totalInventoryValue = productsData.reduce((sum, p) => {
      const price = parseFloat(String(p.price || 0))
      const qty = parseFloat(String(p.quantity_in_stock || 0))
      return sum + (isNaN(price) || isNaN(qty) ? 0 : price * qty)
    }, 0)

    setMetrics({
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      paid_orders: paidOrders,
      unpaid_orders: unpaidOrders,
      average_order_value: averageOrderValue,
      total_customers: totalCustomers,
      total_inventory_value: totalInventoryValue,
      total_outstanding_debt: 0
    })
  }

  const topProducts = products
    .map(p => {
      const totalSold = orders.reduce((sum, order) => {
        const item = order.items?.find(i => i.product_id === p.id)
        return sum + (item?.quantity || 0)
      }, 0)
      return {
        ...p,
        totalSold,
        revenue: (totalSold * p.price)
      }
    })
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5)

  const topCustomers = customers
    .map(c => ({
      ...c,
      orderCount: orders.filter(o => o.customer_name === c.name).length
    }))
    .sort((a, b) => (b.total_purchases || 0) - (a.total_purchases || 0))
    .slice(0, 5)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Báo Cáo & Thống Kê</h1>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ Ngày</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến Ngày</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchAllData}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Cập Nhật Báo Cáo
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {loading ? (
        <div className="text-center py-8">Đang tải dữ liệu...</div>
      ) : metrics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Revenue */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
              <div className="text-sm font-medium opacity-90">{t('Doanh Thu', 'Revenue')}</div>
              <div className="text-3xl font-bold mt-2">{metrics.total_revenue.toLocaleString()} ₫</div>
              <div className="text-xs mt-2 opacity-75">{t('Từ', 'From')} {orders.length} {t('đơn hàng', 'orders')}</div>
            </div>

            {/* Orders */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
              <div className="text-sm font-medium opacity-90">{t('Đơn Hàng', 'Orders')}</div>
              <div className="text-3xl font-bold mt-2">{metrics.total_orders}</div>
              <div className="text-xs mt-2 opacity-75">{metrics.paid_orders} {t('đã thanh toán', 'paid')}</div>
            </div>

            {/* Average Order Value */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
              <div className="text-sm font-medium opacity-90">{t('Giá Trung Bình', 'Average Price')}</div>
              <div className="text-3xl font-bold mt-2">{metrics.average_order_value.toLocaleString()} ₫</div>
              <div className="text-xs mt-2 opacity-75">{t('Mỗi đơn hàng', 'Per order')}</div>
            </div>

            {/* Inventory Value */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow p-6">
              <div className="text-sm font-medium opacity-90">{t('Giá Trị Tồn Kho', 'Inventory Value')}</div>
              <div className="text-3xl font-bold mt-2">{isNaN(metrics.total_inventory_value) ? '0' : metrics.total_inventory_value.toLocaleString()} ₫</div>
              <div className="text-xs mt-2 opacity-75">{products.length} {t('sản phẩm', 'products')}</div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Customers */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">{t('Khách Hàng', 'Customers')}</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">{metrics.total_customers}</div>
                </div>
                <div className="text-4xl text-blue-100">👥</div>
              </div>
            </div>

            {/* Unpaid Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">{t('Chưa Thanh Toán', 'Unpaid')}</div>
                  <div className="text-2xl font-bold text-red-600 mt-1">{metrics.unpaid_orders}</div>
                </div>
                <div className="text-4xl text-red-100">⚠️</div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Sản Phẩm Bán Chạy</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Sản Phẩm</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Số Lượng Bán</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Doanh Thu</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tồn Kho</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-sm">{product.totalSold}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">{product.revenue.toLocaleString()} ₫</td>
                      <td className="px-6 py-4 text-sm">{product.quantity_in_stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Khách Hàng Hàng Đầu</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Khách Hàng</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Số Điện Thoại</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tổng Mua</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Số Đơn</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{customer.name}</td>
                      <td className="px-6 py-4 text-sm">{customer.phone || '-'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{(customer.total_purchases || 0).toLocaleString()} ₫</td>
                      <td className="px-6 py-4 text-sm">{customer.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

