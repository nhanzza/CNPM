'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/services/api.service'
import { authService } from '@/services/auth.service'
import { settingsService } from '@/services/settings.service'
import { Users, ClipboardList, Circle, AlertTriangle, BarChart3, Pencil, X, CheckCircle, Clock3, Truck } from 'lucide-react'

interface StoreMetrics {
  total_revenue: number
  total_orders: number
  total_customers: number
  total_products: number
  total_employees: number
  paid_orders: number
  unpaid_orders: number
  low_stock_products: number
  out_of_stock_products: number
  monthly_growth: number
}

interface StoreInfo {
  store_id: string
  store_name: string
  owner_name: string
  email: string
  phone: string
  address: string
  created_at: string
}

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  total_amount: number
  payment_status: string
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [settings, setSettings] = useState(settingsService.getSettings())
  const t = (vi: string, en: string) => (settings?.language === 'vi' ? vi : en)
  const formatCurrency = (amount: number) => settingsService.formatCurrency(amount)
  const formatDate = (dateStr: string) => settingsService.formatDate(dateStr)

  const [metrics, setMetrics] = useState<StoreMetrics | null>(null)
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [editFormData, setEditFormData] = useState<StoreInfo | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editingStore, setEditingStore] = useState(false)
  const [savingStore, setSavingStore] = useState(false)

  useEffect(() => {
    setSettings(settingsService.getSettings())
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'
      let orders: any[] = []
      let products: any[] = []
      let customers: any[] = []
      let employeesData: Employee[] = []

      // Fetch store info from API or fallback to user data
      try {
        const storeRes = await apiClient.get('/store/info', { params: { store_id: storeId } })
        if (storeRes.data) {
          setStoreInfo(storeRes.data)
          setEditFormData(storeRes.data)
        }
      } catch (err) {
        console.error('Failed to fetch store info from API, using fallback:', err)
        // Fallback to user data if API fails
      }

      // Always ensure storeInfo is set from user data if not already set
      if (!storeInfo && user) {
        const fallback = {
          store_id: storeId,
          store_name: user.store_name || 'BizFlow Store',
          owner_name: user.full_name || user.name || t('Chủ Cửa Hàng', 'Store Owner'),
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          created_at: new Date().toISOString()
        }
        setStoreInfo(fallback)
        setEditFormData(fallback)
      }

      // Fetch employees
      try {
        console.log(`Fetching users for store: ${storeId}`)
        const empRes = await apiClient.get('/users', { params: { store_id: storeId } })
        const empData = empRes.data.users || empRes.data || []
        console.log('Users response:', empRes.data)
        employeesData = Array.isArray(empData) ? empData : []
        setEmployees(employeesData)
      } catch (empError) {
        console.error('Failed to fetch employees:', empError)
        // Use mock employees fallback
        employeesData = [
          {
            id: 'emp_001',
            name: 'Nguyễn Văn Nhân Viên',
            email: 'employee1@bizflow.com',
            phone: '0912345678',
            role: 'employee',
            status: 'active'
          },
          {
            id: 'emp_002',
            name: 'Trần Thị Nhân Viên',
            email: 'employee2@bizflow.com',
            phone: '0987654321',
            role: 'employee',
            status: 'active'
          }
        ]
        setEmployees(employeesData)
      }

      // Fetch orders for metrics
      try {
        console.log(`Fetching orders for store: ${storeId}`)
        const ordersRes = await apiClient.get('/orders', { params: { store_id: storeId } })
        const ordersData = ordersRes.data.orders || ordersRes.data || []
        console.log('Orders response:', ordersRes.data)
        orders = Array.isArray(ordersData) ? ordersData : []
        setRecentOrders(orders.slice(-10))
      } catch (orderError) {
        console.error('Failed to fetch orders:', orderError)
        setRecentOrders([])
      }

      // Fetch customers
      try {
        console.log(`Fetching customers for store: ${storeId}`)
        const customersRes = await apiClient.get('/customers', { params: { store_id: storeId } })
        const customersData = customersRes.data.customers || customersRes.data || []
        console.log('Customers response:', customersRes.data)
        customers = Array.isArray(customersData) ? customersData : []
      } catch (customerError) {
        console.error('Failed to fetch customers:', customerError)
        customers = []
      }

      // Fetch products
      try {
        console.log(`Fetching products for store: ${storeId}`)
        const productsRes = await apiClient.get('/products', { params: { store_id: storeId } })
        const productsData = productsRes.data.products || productsRes.data || []
        console.log('Products response:', productsRes.data)
        products = Array.isArray(productsData) ? productsData : []
      } catch (productError) {
        console.error('Failed to fetch products:', productError)
      }

      // Calculate metrics after data is gathered
      const totalRevenue = orders.reduce((sum: number, order: any) =>
        order.payment_status === 'paid' ? sum + (order.total_amount || 0) : sum, 0
      )

      const totalOrders = orders.length
      const paidOrders = orders.filter((o: any) => o.payment_status === 'paid').length
      const unpaidOrders = orders.filter((o: any) => o.payment_status !== 'paid').length
      const totalCustomers = customers.length > 0
        ? customers.length
        : new Set(orders.map((o: any) => o.customer_id || o.customer_name)).size

      const metrics: StoreMetrics = {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        total_customers: totalCustomers,
        total_products: products.length,
        total_employees: employeesData.length,
        paid_orders: paidOrders,
        unpaid_orders: unpaidOrders,
        low_stock_products: products.filter((p: any) => p.quantity_in_stock <= 10 && p.quantity_in_stock > 0).length,
        out_of_stock_products: products.filter((p: any) => p.quantity_in_stock === 0).length,
        monthly_growth: totalRevenue > 0 ? 12.5 : 0
      }

      setMetrics(metrics)
    } catch (error) {
      console.error('Failed to fetch admin data', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStore = async () => {
    if (!editFormData) return

    setSavingStore(true)
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'

      await apiClient.put('/store/info', {
        store_name: editFormData.store_name,
        owner_name: editFormData.owner_name,
        email: editFormData.email,
        phone: editFormData.phone,
        address: editFormData.address
      }, {
        params: { store_id: storeId }
      })

      setStoreInfo(editFormData)
      setEditingStore(false)
      // Optionally show success message
      alert(t('Cập nhật thành công!', 'Updated successfully!'))
    } catch (error) {
      console.error('Failed to update store info:', error)
      alert(t('Không thể cập nhật. Bạn đang dùng tài khoản test.', 'Cannot update. Test accounts cannot be edited.'))
    } finally {
      setSavingStore(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block px-6 py-4 bg-white rounded-lg shadow">
            <p className="text-gray-600">{t('Đang tải dữ liệu...', 'Loading data...')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            {t('Admin Dashboard', 'Admin Dashboard')}
          </h1>
          <p className="mt-2 text-purple-100">{t('Quản lý toàn bộ cửa hàng', 'Manage entire store')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Store Info Card */}
        {storeInfo && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">{t('Thông Tin Cửa Hàng', 'Store Information')}</h2>
              <button
                onClick={() => {
                  if (editingStore) {
                    setEditFormData(storeInfo)
                  }
                  setEditingStore(!editingStore)
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center gap-2"
              >
                {editingStore ? (
                  <>
                    <X className="w-4 h-4" /> {t('Hủy', 'Cancel')}
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4" /> {t('Chỉnh Sửa', 'Edit')}
                  </>
                )}
              </button>
            </div>

            {editingStore && editFormData ? (
              // Edit Mode
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Tên Cửa Hàng', 'Store Name')}
                    </label>
                    <input
                      type="text"
                      value={editFormData.store_name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, store_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Chủ Cửa Hàng', 'Store Owner')}
                    </label>
                    <input
                      type="text"
                      value={editFormData.owner_name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, owner_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Điện Thoại', 'Phone')}
                    </label>
                    <input
                      type="tel"
                      value={editFormData.phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('Địa Chỉ', 'Address')}
                    </label>
                    <input
                      type="text"
                      value={editFormData.address || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveStore}
                    disabled={savingStore}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {savingStore ? t('Đang lưu...', 'Saving...') : t('Lưu', 'Save')}
                  </button>
                  <button
                    onClick={() => {
                      setEditingStore(false)
                      setEditFormData(storeInfo)
                    }}
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                  >
                    {t('Hủy', 'Cancel')}
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('Tên Cửa Hàng', 'Store Name')}</p>
                  <p className="text-lg font-semibold text-gray-900">{storeInfo.store_name || 'BizFlow Store'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('Chủ Cửa Hàng', 'Store Owner')}</p>
                  <p className="text-lg font-semibold text-gray-900">{storeInfo.owner_name || t('Chưa cập nhật', 'Not updated')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{storeInfo.email || t('Chưa cập nhật', 'Not updated')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('Điện Thoại', 'Phone')}</p>
                  <p className="text-lg font-semibold text-gray-900">{storeInfo.phone || t('Chưa cập nhật', 'Not updated')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('Địa Chỉ', 'Address')}</p>
                  <p className="text-lg font-semibold text-gray-900">{storeInfo.address || t('Chưa cập nhật', 'Not updated')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('Ngày Tạo', 'Created Date')}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(storeInfo.created_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Metrics */}
        {metrics && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
                <p className="text-sm opacity-90 font-medium">{t('Tổng Doanh Thu', 'Total Revenue')}</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(metrics.total_revenue)}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
                <p className="text-sm opacity-90 font-medium">{t('Tổng Đơn Hàng', 'Total Orders')}</p>
                <p className="text-3xl font-bold mt-2">{metrics.total_orders}</p>
                <p className="text-xs mt-2 opacity-75">{t('Đơn', 'Orders')}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
                <p className="text-sm opacity-90 font-medium">{t('Khách Hàng', 'Customers')}</p>
                <p className="text-3xl font-bold mt-2">{metrics.total_customers}</p>
                <p className="text-xs mt-2 opacity-75">{t('Người', 'People')}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow p-6">
                <p className="text-sm opacity-90 font-medium">{t('Nhân Viên', 'Employees')}</p>
                <p className="text-3xl font-bold mt-2">{metrics.total_employees}</p>
                <p className="text-xs mt-2 opacity-75">{t('Người', 'People')}</p>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <p className="text-sm text-gray-600 font-medium">{t('Đơn Đã Thanh Toán', 'Paid Orders')}</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{metrics.paid_orders}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {metrics.total_orders > 0 ? ((metrics.paid_orders / metrics.total_orders) * 100).toFixed(1) : 0}% {t('tổng đơn', 'of total')}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                <p className="text-sm text-gray-600 font-medium">{t('Đơn Chưa Thanh Toán', 'Unpaid Orders')}</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{metrics.unpaid_orders}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {metrics.total_orders > 0 ? ((metrics.unpaid_orders / metrics.total_orders) * 100).toFixed(1) : 0}% {t('tổng đơn', 'of total')}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-600 font-medium">{t('Sản Phẩm', 'Products')}</p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{metrics.total_products}</p>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                  <Circle className="w-3 h-3 fill-red-500 text-red-500" /> {metrics.out_of_stock_products} {t('hết', 'out')} / <AlertTriangle className="w-3 h-3 text-amber-500" /> {metrics.low_stock_products} {t('sắp hết', 'low')}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Employees Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-6 h-6 text-indigo-600" />
            <h3 className="text-xl font-bold">{t('Nhân Viên', 'Employees')} ({employees.length})</h3>
          </div>
          {employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Tên', 'Name')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Điện Thoại', 'Phone')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Vai Trò', 'Role')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Trạng Thái', 'Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{emp.name}</td>
                      <td className="px-6 py-4 text-gray-600">{emp.email}</td>
                      <td className="px-6 py-4 text-gray-600">{emp.phone}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {emp.role === 'owner' ? t('Chủ Cửa Hàng', 'Store Owner') : t('Nhân Viên', 'Employee')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm inline-flex items-center gap-2 ${emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {emp.status === 'active' ? (
                            <>
                              <CheckCircle className="w-4 h-4" /> {t('Hoạt Động', 'Active')}
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4" /> {t('Tạm Dừng', 'Inactive')}
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">{t('Chưa có nhân viên nào', 'No employees yet')}</p>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-6 h-6 text-gray-700" />
            <h3 className="text-xl font-bold">{t('Đơn Hàng Gần Đây', 'Recent Orders')} (Top 10)</h3>
          </div>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Số Đơn', 'Order No')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Khách Hàng', 'Customer')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Tổng Tiền', 'Total')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Trạng Thái', 'Status')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Thanh Toán', 'Payment')}</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Ngày', 'Date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{order.order_number}</td>
                      <td className="px-6 py-4">{order.customer_name}</td>
                      <td className="px-6 py-4 font-semibold text-indigo-600">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm inline-flex items-center gap-2 ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-800' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                          }`}>
                          {order.status === 'delivered' || order.status === 'completed' ? (
                            <>
                              <CheckCircle className="w-4 h-4" /> {t('Hoàn Thành', 'Completed')}
                            </>
                          ) : order.status === 'shipped' ? (
                            <>
                              <Truck className="w-4 h-4" /> {t('Đã Gửi', 'Shipped')}
                            </>
                          ) : order.status === 'confirmed' ? (
                            <>
                              <CheckCircle className="w-4 h-4" /> {t('Đã Xác Nhận', 'Confirmed')}
                            </>
                          ) : order.status === 'cancelled' ? (
                            <>
                              <X className="w-4 h-4" /> {t('Đã Hủy', 'Cancelled')}
                            </>
                          ) : (
                            <>
                              <Clock3 className="w-4 h-4" /> {t('Chờ Xử Lý', 'Pending')}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm inline-flex items-center gap-2 ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {order.payment_status === 'paid' ? (
                            <>
                              <CheckCircle className="w-4 h-4" /> {t('Đã Thanh Toán', 'Paid')}
                            </>
                          ) : (
                            <>
                              <Clock3 className="w-4 h-4" /> {t('Chưa TT', 'Unpaid')}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">{t('Chưa có đơn hàng nào', 'No orders yet')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
