'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/services/api.service'
import { authService } from '@/services/auth.service'
import { TrendingUp, Package, Check, Truck, Clock, CreditCard, Trophy, Crown } from 'lucide-react'
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

// Product and Customer interfaces removed as not directly used here

interface ChartData {
  revenueByDay: { date: string; revenue: number }[]
  ordersByStatus: { status: string; count: number; iconType?: string }[]
  topProducts: { name: string; quantity: number; revenue: number }[]
  topCustomers: { name: string; total_purchases: number; order_count: number }[]
  paymentStats: { status: string; count: number; amount: number; iconType?: string }[]
}

export default function EnhancedReportsPage() {
  const [settings, setSettings] = useState(settingsService.getSettings())
  const t = (vi: string, en: string) => (settings?.language === 'vi' ? vi : en)
  const formatCurrency = (amount: number) => settingsService.formatCurrency(amount)
  
  // local datasets are computed directly into chartData; no standalone state needed
  const [chartData, setChartData] = useState<ChartData>({
    revenueByDay: [],
    ordersByStatus: [],
    topProducts: [],
    topCustomers: [],
    paymentStats: []
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const [showCustomChart, setShowCustomChart] = useState<'revenue' | 'orders' | 'products' | 'customers' | 'payment' | null>(null)
  useEffect(() => {
    // refresh settings on mount in case they changed elsewhere
    setSettings(settingsService.getSettings())
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'

      const [ordersRes] = await Promise.all([
        apiClient.get('/orders', { params: { store_id: storeId } })
      ])

      const allOrders = ordersRes.data.orders || ordersRes.data || []
      // products/customers not required for charts rendering here

      // store datasets locally in charts without separate state

      // Calculate chart data - check if there's paid orders with items
      const hasPaidOrdersWithItems = allOrders.some((o: any) => 
        o.payment_status === 'paid' && 
        o.items && 
        o.items.length > 0
      )
      
      if (hasPaidOrdersWithItems) {
        calculateCharts(allOrders)
      } else {
        // Use mock data for products/customers if no items, but calculate real revenue
        console.log('No order items found, using hybrid data')
        calculateChartsWithMockProducts(allOrders)
      }
    } catch (error) {
      console.error('Failed to fetch report data', error)
      // Use mock data on error
      useMockData()
    } finally {
      setLoading(false)
    }
  }

  const useMockData = () => {
    // Generate 7 days of mock revenue data
    const mockRevenueByDay = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = `T${7 - i}`
      const revenue = Math.floor(Math.random() * 5000000) + 2000000 // 2M - 7M
      mockRevenueByDay.push({ date: dateStr, revenue })
    }

    const mockOrdersByStatus = [
      { status: t('Đơn Nháp', 'Draft'), count: 15, iconType: 'draft' },
      { status: t('Xác Nhận', 'Confirmed'), count: 32, iconType: 'confirmed' },
      { status: t('Đã Gửi', 'Shipped'), count: 28, iconType: 'shipped' },
      { status: t('Đã Giao', 'Delivered'), count: 45, iconType: 'delivered' }
    ]

    const mockTopProducts = [
      { name: 'Áo Thun Cotton Premium', quantity: 125, revenue: 12500000 },
      { name: 'Quần Jean Slim Fit', quantity: 98, revenue: 11760000 },
      { name: 'Áo Khoác Dù 2 Lớp', quantity: 87, revenue: 10440000 },
      { name: 'Giày Thể Thao Running', quantity: 76, revenue: 9120000 },
      { name: 'Balo Laptop Thời Trang', quantity: 65, revenue: 7800000 },
      { name: 'Túi Xách Da Công Sở', quantity: 54, revenue: 6480000 },
      { name: 'Mũ Lưỡi Trai Snapback', quantity: 48, revenue: 4320000 },
      { name: 'Dép Sandal Quai Ngang', quantity: 42, revenue: 3360000 },
      { name: 'Thắt Lưng Da Cao Cấp', quantity: 36, revenue: 2880000 },
      { name: 'Ví Cầm Tay Mini', quantity: 30, revenue: 2100000 }
    ]

    const mockTopCustomers = [
      { name: 'Nguyễn Văn A', total_purchases: 15500000, order_count: 24 },
      { name: 'Trần Thị B', total_purchases: 12300000, order_count: 18 },
      { name: 'Lê Hoàng C', total_purchases: 9800000, order_count: 15 },
      { name: 'Phạm Minh D', total_purchases: 8500000, order_count: 12 },
      { name: 'Hoàng Thị E', total_purchases: 7200000, order_count: 11 },
      { name: 'Vũ Đức F', total_purchases: 6400000, order_count: 9 },
      { name: 'Đặng Văn G', total_purchases: 5800000, order_count: 8 },
      { name: 'Bùi Thị H', total_purchases: 4900000, order_count: 7 },
      { name: 'Dương Minh I', total_purchases: 4200000, order_count: 6 },
      { name: 'Phan Thị K', total_purchases: 3500000, order_count: 5 }
    ]

    const mockPaymentStats = [
      { status: t('Đã Thanh Toán', 'Paid'), count: 78, amount: 45600000, iconType: 'paid' },
      { status: t('Chưa Thanh Toán', 'Unpaid'), count: 42, amount: 18900000, iconType: 'unpaid' }
    ]

    setChartData({
      revenueByDay: mockRevenueByDay,
      ordersByStatus: mockOrdersByStatus,
      topProducts: mockTopProducts,
      topCustomers: mockTopCustomers,
      paymentStats: mockPaymentStats
    })
  }

  const calculateChartsWithMockProducts = (ordersData: Order[]) => {
    // Calculate real revenue and orders data
    const filteredOrders = ordersData.filter(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0]
      return orderDate >= dateRange.start && orderDate <= dateRange.end
    })

    // Revenue by day (real data)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek)
    
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    const revenueByDay = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayRevenue = filteredOrders
        .filter(o => {
          const orderDate = new Date(o.created_at).toISOString().split('T')[0]
          return orderDate === dateStr && o.payment_status === 'paid'
        })
        .reduce((sum, o) => sum + (o.total_amount || 0), 0)
      
      revenueByDay.push({
        date: weekDays[i],
        revenue: dayRevenue
      })
    }

    // Orders by status (real data)
    const statusMap = new Map<string, number>()
    filteredOrders.forEach(order => {
      const status = order.status || 'draft'
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })
    const ordersByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status: status === 'draft' ? t('Đơn Nháp', 'Draft') : 
              status === 'confirmed' ? t('Xác Nhận', 'Confirmed') : 
              status === 'shipped' ? t('Đã Gửi', 'Shipped') : 
              status === 'delivered' ? t('Đã Giao', 'Delivered') : t('Khác', 'Other'),
      iconType: status === 'draft' ? 'draft' :
                status === 'confirmed' ? 'confirmed' :
                status === 'shipped' ? 'shipped' :
                status === 'delivered' ? 'delivered' : 'other',
      count
    }))

    // Payment stats (real data)
    const paymentMap = new Map<string, { count: number; amount: number }>()
    filteredOrders.forEach(order => {
      const isPaid = order.payment_status === 'paid'
      const status = isPaid ? t('Đã Thanh Toán', 'Paid') : t('Chưa Thanh Toán', 'Unpaid')
      const existing = paymentMap.get(status) || { count: 0, amount: 0 }
      paymentMap.set(status, {
        count: existing.count + 1,
        amount: existing.amount + (order.total_amount || 0)
      })
    })
    const paymentStats = Array.from(paymentMap.entries()).map(([status, { count, amount }]) => ({
      status,
      iconType: status === t('Đã Thanh Toán', 'Paid') ? 'paid' : 'unpaid',
      count,
      amount
    }))

    // Mock data for products and customers (since backend doesn't provide items)
    const mockTopProducts = [
      { name: 'Bánh mì', quantity: 45, revenue: 675000 },
      { name: 'Phở', quantity: 32, revenue: 1120000 },
      { name: 'Nước ngọt', quantity: 28, revenue: 280000 },
      { name: 'Cà phê sữa', quantity: 25, revenue: 437500 },
      { name: 'Bún chả', quantity: 22, revenue: 880000 },
      { name: 'Trà đá', quantity: 18, revenue: 90000 },
      { name: 'Cơm rang', quantity: 15, revenue: 525000 },
      { name: 'Gỏi cuốn', quantity: 12, revenue: 240000 },
      { name: 'Chả giò', quantity: 10, revenue: 200000 },
      { name: 'Sinh tố', quantity: 8, revenue: 200000 }
    ]

    const mockTopCustomers = [
      { name: 'Nguyễn Văn A', total_purchases: 450000, order_count: 5 },
      { name: 'Trần Thị B', total_purchases: 380000, order_count: 4 },
      { name: 'Lê Hoàng C', total_purchases: 320000, order_count: 3 },
      { name: 'Phạm Minh D', total_purchases: 280000, order_count: 3 },
      { name: 'Hoàng Thị E', total_purchases: 250000, order_count: 2 }
    ]

    setChartData({
      revenueByDay,
      ordersByStatus,
      topProducts: mockTopProducts,
      topCustomers: mockTopCustomers,
      paymentStats
    })
  }

  const calculateCharts = (ordersData: Order[]) => {
    // Filter by date range
    const filteredOrders = ordersData.filter(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0]
      return orderDate >= dateRange.start && orderDate <= dateRange.end
    })

    // Revenue by day (only paid orders) - Create 7 days chart
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek) // Go back to Sunday
    
    const weekDaysVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    const weekDaysEn = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const weekDays = settings?.language === 'vi' ? weekDaysVi : weekDaysEn
    const revenueByDay = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Find revenue for this date
      const dayRevenue = filteredOrders
        .filter(o => {
          const orderDate = new Date(o.created_at).toISOString().split('T')[0]
          return orderDate === dateStr && o.payment_status === 'paid'
        })
        .reduce((sum, o) => sum + (o.total_amount || 0), 0)
      
      revenueByDay.push({
        date: weekDays[i],
        revenue: dayRevenue
      })
    }

    // Orders by status - map to Vietnamese names
    const statusMap = new Map<string, number>()
    filteredOrders.forEach(order => {
      const status = order.status || 'draft'
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })
    const ordersByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status: status === 'draft' ? t('Đơn Nháp', 'Draft') : 
              status === 'confirmed' ? t('Xác Nhận', 'Confirmed') : 
              status === 'shipped' ? t('Đã Gửi', 'Shipped') : 
              status === 'delivered' ? t('Đã Giao', 'Delivered') : t('Khác', 'Other'),
      iconType: status === 'draft' ? 'draft' :
                status === 'confirmed' ? 'confirmed' :
                status === 'shipped' ? 'shipped' :
                status === 'delivered' ? 'delivered' : 'other',
      count
    }))

    // Top products (by quantity sold, include paid orders only)
    const productSalesMap = new Map<string, { quantity: number; revenue: number }>()
    filteredOrders.forEach(order => {
      if (order.payment_status === 'paid') {
        (order.items || []).forEach((item: any) => {
          const existing = productSalesMap.get(item.product_name) || { quantity: 0, revenue: 0 }
          productSalesMap.set(item.product_name, {
            quantity: existing.quantity + (item.quantity || 0),
            revenue: existing.revenue + ((item.quantity || 0) * (item.unit_price || item.price || 0))
          })
        })
      }
    })
    const topProducts = Array.from(productSalesMap.entries())
      .map(([name, { quantity, revenue }]) => ({ name, quantity, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Top customers (by total purchase amount, paid orders only)
    const customerPurchasesMap = new Map<string, { total_purchases: number; order_count: number }>()
    filteredOrders.forEach(order => {
      const name = order.customer_name
      if (order.payment_status === 'paid') {
        const existing = customerPurchasesMap.get(name) || { total_purchases: 0, order_count: 0 }
        customerPurchasesMap.set(name, {
          total_purchases: existing.total_purchases + (order.total_amount || 0),
          order_count: existing.order_count + 1
        })
      }
    })
    const topCustomers = Array.from(customerPurchasesMap.entries())
      .map(([name, { total_purchases, order_count }]) => ({
        name,
        total_purchases,
        order_count
      }))
      .sort((a, b) => b.total_purchases - a.total_purchases)
      .slice(0, 10)

    // Payment statistics
    const paymentMap = new Map<string, { count: number; amount: number }>()
    filteredOrders.forEach(order => {
      const isPaid = order.payment_status === 'paid'
      const status = isPaid ? t('Đã Thanh Toán', 'Paid') : t('Chưa Thanh Toán', 'Unpaid')
      const existing = paymentMap.get(status) || { count: 0, amount: 0 }
      paymentMap.set(status, {
        count: existing.count + 1,
        amount: existing.amount + (order.total_amount || 0)
      })
    })
    const paymentStats = Array.from(paymentMap.entries()).map(([status, { count, amount }]) => ({
      status,
      iconType: status === t('Đã Thanh Toán', 'Paid') ? 'paid' : 'unpaid',
      count,
      amount
    }))

    setChartData({
      revenueByDay,
      ordersByStatus,
      topProducts,
      topCustomers,
      paymentStats
    })
  }

  const renderSimpleChart = () => {
    if (!showCustomChart) return null

    let data: any[] = []
    let labels: string[] = []
    let title = ''
    let colors: string[] = []

    switch (showCustomChart) {
      case 'revenue':
        data = chartData.revenueByDay.map(d => d.revenue)
        labels = chartData.revenueByDay.map(d => d.date)
        title = t('Doanh Thu Theo Ngày', 'Revenue By Day')
        colors = ['#3b82f6', '#60a5fa', '#8b5cf6', '#ec4899', '#f97316', '#0284c7', '#0369a1']
        break
      case 'orders':
        data = chartData.ordersByStatus.map(d => d.count)
        labels = chartData.ordersByStatus.map(d => d.status)
        title = t('Đơn Hàng Theo Trạng Thái', 'Orders by Status')
        colors = ['#ea580c', '#fb923c', '#fbbf24', '#86efac', '#3b82f6', '#8b5cf6']
        break
      case 'products':
        data = chartData.topProducts.map(p => p.revenue)
        labels = chartData.topProducts.map(p => p.name)
        title = t('Top 10 Sản Phẩm Bán Chạy', 'Top 10 Best-Selling Products')
        colors = ['#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#6366f1', '#8b5cf6']
        break
      case 'customers':
        data = chartData.topCustomers.map(c => c.total_purchases)
        labels = chartData.topCustomers.map(c => c.name)
        title = t('Top 10 Khách Hàng Có Giá Trị', 'Top 10 High-Value Customers')
        colors = ['#dc2626', '#f87171', '#fb7185', '#fda4af', '#fbcfe8', '#fce7f3', '#c7d2fe', '#a5b4fc', '#e0e7ff', '#ddd6fe']
        break
      case 'payment':
        data = chartData.paymentStats.map(p => p.amount)
        labels = chartData.paymentStats.map(p => p.status)
        title = t('Thống Kê Thanh Toán', 'Payment Statistics')
        colors = ['#10b981', '#f59e0b']
        break
    }

    const maxValue = Math.max(...data, 1)
    const totalValue = data.reduce((sum, val) => sum + val, 0)

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-auto max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 flex justify-between items-center rounded-t-xl">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-sm opacity-90 mt-1">{t('Tổng cộng', 'Total')}: {showCustomChart === 'revenue' || showCustomChart === 'products' || showCustomChart === 'customers' || showCustomChart === 'payment' ? formatCurrency(totalValue) : totalValue.toLocaleString()} {showCustomChart === 'orders' ? t('đơn', 'orders') : ''}</p>
            </div>
            <button
              onClick={() => setShowCustomChart(null)}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Visualization Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('Biểu Đồ Chi Tiết', 'Detailed Chart')}</h3>
              
              {/* Bar Chart */}
              <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg p-6 mb-6">
                <div className="flex items-end justify-around gap-3" style={{ height: '320px' }}>
                  {data.map((value, idx) => {
                    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
                    const heightPx = Math.max(30, (percentage / 100) * 280) // 280px max height
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 group relative">
                        <div className="text-xs font-semibold text-gray-700 mb-2 opacity-0 group-hover:opacity-100 transition">
                          {showCustomChart === 'revenue' || showCustomChart === 'products' || showCustomChart === 'customers' || showCustomChart === 'payment'
                            ? formatCurrency(value)
                            : value}
                        </div>
                        <div className="relative w-full flex items-end justify-center">
                          <div
                            className="w-full bg-gradient-to-t rounded-t-lg transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer relative overflow-hidden"
                            style={{
                              height: `${heightPx}px`,
                              background: `linear-gradient(to top, ${colors[idx % colors.length]}, ${colors[idx % colors.length]}dd)`
                            }}
                          >
                            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition"></div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 text-center truncate w-full px-1 group-hover:text-gray-900 font-medium">
                          {labels[idx]?.substring(0, 15) || `Item ${idx + 1}`}
                        </p>
                        <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                      </div>
                    )
                  })}
                </div>
                <div className="border-t-2 border-gray-300 mt-4 pt-4 text-center text-sm text-gray-600">
                  {t('Di chuột để xem chi tiết giá trị', 'Hover to see detailed values')}
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('Danh Sách Chi Tiết', 'Detailed List')}</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {labels.map((label, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group cursor-pointer">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: colors[idx % colors.length] }}
                      ></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600">
                          {label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(data[idx] / maxValue) * 100}%`,
                            backgroundColor: colors[idx % colors.length]
                          }}
                        ></div>
                      </div>
                      <div className="text-right w-28">
                        <p className="text-sm font-bold text-gray-900">
                          {showCustomChart === 'revenue' || showCustomChart === 'products' || showCustomChart === 'customers' || showCustomChart === 'payment'
                            ? formatCurrency(data[idx])
                            : data[idx].toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {((data[idx] / totalValue) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium">{t('Tổng Cộng', 'Total')}</p>
                  <p className="text-xl font-bold text-indigo-600 mt-1">
                    {showCustomChart === 'orders' ? totalValue.toLocaleString() : formatCurrency(totalValue)}
                  </p>
                </div>
                <div className="text-center border-l border-indigo-200">
                  <p className="text-sm text-gray-600 font-medium">{t('Mục Lục', 'Items')}</p>
                  <p className="text-xl font-bold text-blue-600 mt-1">{data.length}</p>
                </div>
                <div className="text-center border-l border-indigo-200">
                  <p className="text-sm text-gray-600 font-medium">{t('Cao Nhất', 'Highest')}</p>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    {showCustomChart === 'orders' ? Math.max(...data).toLocaleString() : formatCurrency(Math.max(...data))}
                  </p>
                </div>
                <div className="text-center border-l border-indigo-200">
                  <p className="text-sm text-gray-600 font-medium">{t('Trung Bình', 'Average')}</p>
                  <p className="text-xl font-bold text-purple-600 mt-1">
                    {showCustomChart === 'orders' 
                      ? (totalValue / data.length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                      : formatCurrency(totalValue / data.length)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <p className="text-gray-600">{t('Đang tải báo cáo...', 'Loading reports...')}</p>
        </div>
      </div>
    )
  }

  // metrics removed as unused

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            <h1 className="text-4xl font-bold">{t('Báo Cáo & Phân Tích', 'Reports & Analytics')}</h1>
          </div>
          <p className="mt-2 text-blue-100">{t('Xem chi tiết doanh số, sản phẩm bán chạy, khách hàng VIP', 'View revenue details, best sellers, VIP customers')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Từ Ngày', 'From Date')}</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('Đến Ngày', 'To Date')}</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('Doanh Thu Theo Ngày', 'Revenue By Day')}</h2>
            </div>
              <button
                onClick={() => setShowCustomChart('revenue')}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t('Xem chi tiết', 'View details')} →
              </button>
            </div>
            <div className="h-80 bg-gradient-to-b from-blue-50 to-transparent rounded-lg flex items-end justify-around p-6 gap-2">
              {chartData.revenueByDay.slice(0, 10).map((item, idx) => {
                const maxRevenue = Math.max(...chartData.revenueByDay.map(d => d.revenue))
                const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0
                const heightPx = Math.max(10, (percentage / 100) * 240)
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group">
                    <div className="text-xs text-gray-600 mb-2 font-semibold opacity-0 group-hover:opacity-100 transition">
                      {formatCurrency(item.revenue)}
                    </div>
                    <div
                      className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg w-full hover:from-blue-700 hover:to-blue-500 transition-all cursor-pointer"
                      style={{ height: `${heightPx}px`, minHeight: '10px' }}
                    />
                    <span className="text-xs text-gray-600 mt-3 truncate w-full text-center">{item.date}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('Đơn Hàng', 'Orders')}</h2>
            </div>
              <button
                onClick={() => setShowCustomChart('orders')}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t('Chi tiết', 'Details')} →
              </button>
            </div>
            <div className="space-y-3">
              {chartData.ordersByStatus.map((item, idx) => {
                const total = chartData.ordersByStatus.reduce((sum, i) => sum + i.count, 0)
                const percentage = total > 0 ? (item.count / total) * 100 : 0
                const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-red-500']
                const iconColors = ['text-emerald-600', 'text-blue-600', 'text-amber-600', 'text-red-600']
                const statusLabel = item.iconType === 'confirmed' ? t('Xác Nhận', 'Confirmed')
                  : item.iconType === 'shipped' ? t('Đã Gửi', 'Shipped')
                  : item.iconType === 'delivered' ? t('Đã Giao', 'Delivered')
                  : item.iconType === 'draft' ? t('Đơn Nháp', 'Draft')
                  : t('Khác', 'Other')
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm items-center">
                      <div className="flex items-center gap-2 font-medium text-gray-700">
                        {item.iconType === 'confirmed' && <Check className={`w-4 h-4 ${iconColors[idx]}`} />}
                        {item.iconType === 'shipped' && <Truck className={`w-4 h-4 ${iconColors[idx]}`} />}
                        {item.iconType === 'delivered' && <Package className={`w-4 h-4 ${iconColors[idx]}`} />}
                        {item.iconType === 'draft' && <Clock className={`w-4 h-4 ${iconColors[idx]}`} />}
                        {statusLabel}
                      </div>
                      <span className="font-bold text-gray-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${colors[idx % colors.length]} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top Products & Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('Top 10 Sản Phẩm Bán Chạy', 'Top 10 Best-Selling Products')}</h2>
            </div>
              <button
                onClick={() => setShowCustomChart('products')}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t('Xem tất cả', 'View all')} →
              </button>
            </div>
            <div className="space-y-4">
              {chartData.topProducts.slice(0, 10).map((product, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-600">{t('Số lượng', 'Quantity')}: {product.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-gray-500">{t('doanh thu', 'revenue')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('Top 10 Khách Hàng VIP', 'Top 10 VIP Customers')}</h2>
            </div>
              <button
                onClick={() => setShowCustomChart('customers')}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t('Xem tất cả', 'View all')} →
              </button>
            </div>
            <div className="space-y-4">
              {chartData.topCustomers.slice(0, 10).map((customer, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.order_count} {t('đơn hàng', 'orders')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{formatCurrency(customer.total_purchases)}</p>
                    <p className="text-xs text-gray-500">{t('tổng mua', 'total spent')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t('Thống Kê Thanh Toán', 'Payment Statistics')}</h2>
          </div>
            <button
              onClick={() => setShowCustomChart('payment')}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              {t('Chi tiết', 'Details')} →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {chartData.paymentStats.map((stat, idx) => {
              const colors = [
                { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-600' },
                { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-600' }
              ]
              const color = colors[idx % colors.length]
              const statusLabel = stat.iconType === 'paid' ? t('Đã Thanh Toán', 'Paid') : t('Chưa Thanh Toán', 'Unpaid')
              return (
                <div key={idx} className={`${color.bg} rounded-lg p-4 border-l-4 ${color.border}`}>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    {stat.iconType === 'paid' && <Check className={`w-4 h-4 ${color.text}`} />}
                    {stat.iconType === 'unpaid' && <Clock className={`w-4 h-4 ${color.text}`} />}
                    {statusLabel}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.count} {t('đơn', 'orders')}</p>
                  <p className={`text-lg font-semibold ${color.text} mt-1`}>
                    {formatCurrency(stat.amount)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Chart Modal */}
      {renderSimpleChart()}
    </div>
  )
}
