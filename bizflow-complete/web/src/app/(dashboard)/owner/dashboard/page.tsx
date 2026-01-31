'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import apiClient from '@/services/api.service'
import { authService } from '@/services/auth.service'
import { settingsService } from '@/services/settings.service'
import { getTranslation, translations } from '@/config/translations'
import { 
  Smile, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  Check, 
  Truck, 
  Clock, 
  AlertCircle, 
  CreditCard,
  Bell,
  Wallet,
  ClipboardList
} from 'lucide-react'

export default function OwnerDashboard() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [settings] = useState(settingsService.getSettings())
  const t = (key: keyof typeof translations.en) => getTranslation(settings.language, key)
  const formatDate = (dateStr: string) => settingsService.formatDate(dateStr)
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalDebt: 0,
    weekGrowthRevenue: 12,
    weekGrowthOrders: 5,
    weekGrowthCustomers: 8,
    weekGrowthDebt: -3,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [orderStats, setOrderStats] = useState({ delivered: 0, shipped: 0, pending: 0, total: 0 })
  const [alerts, setAlerts] = useState<{ type: string; count: number; messageKey: string; color: string; iconType: string }[]>([])
  const [quickStats, setQuickStats] = useState({ todayRevenue: 0, todayOrders: 0, pendingPayments: 0, totalProducts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const calculateAlertsAndStats = (orders: any[], customers?: any[]) => {
    // Calculate order statistics by status
    const stats = {
      delivered: orders.filter(o => o.status === 'delivered').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      pending: orders.filter(o => o.status === 'pending' || o.status === 'draft').length,
      total: orders.length
    }
    setOrderStats(stats)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Calculate alerts
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'draft').length
    const unpaidOrders = orders.filter(o => o.payment_status === 'unpaid' || o.payment_status === 'pending').length
    const delayedOrders = orders.filter(o => {
      if (o.status === 'shipped') {
        const createdDate = new Date(o.created_at)
        const daysDiff = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff > 3 // Đơn đang giao quá 3 ngày
      }
      return false
    }).length
    
    const totalDebt = customers?.reduce((sum: number, c: any) => sum + (c.outstanding_debt || 0), 0) || 0
    const hasDebt = totalDebt > 0
    
    const alertsList = []
    if (pendingOrders > 0) {
      alertsList.push({ type: 'pending', count: pendingOrders, messageKey: 'pendingOrders', color: 'yellow', iconType: 'clock' })
    }
    if (unpaidOrders > 0) {
      alertsList.push({ type: 'unpaid', count: unpaidOrders, messageKey: 'unpaidOrders', color: 'red', iconType: 'credit-card' })
    }
    if (delayedOrders > 0) {
      alertsList.push({ type: 'delayed', count: delayedOrders, messageKey: 'delayedOrders', color: 'orange', iconType: 'alert-circle' })
    }
    if (hasDebt) {
      alertsList.push({ type: 'debt', count: Math.round(totalDebt / 1000000), messageKey: 'debtAmount', color: 'amber', iconType: 'wallet' })
    }
    
    if (alertsList.length === 0) {
      alertsList.push({ type: 'ok', count: 0, messageKey: 'allGood', color: 'green', iconType: 'check' })
    }
    
    setAlerts(alertsList)
    
    // Calculate quick stats
    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.created_at)
      orderDate.setHours(0, 0, 0, 0)
      return orderDate.getTime() === today.getTime()
    })
    
    const todayRevenue = todayOrders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)
    
    const pendingPayments = orders
      .filter(o => o.payment_status === 'unpaid' || o.payment_status === 'pending')
      .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)
    
    setQuickStats({
      todayRevenue,
      todayOrders: todayOrders.length,
      pendingPayments,
      totalProducts: orders.length // Sẽ update khi có API products
    })
  }

  const fetchDashboardData = async () => {
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'
      
      try {
        const [ordersRes, customersRes] = await Promise.all([
          apiClient.get('/orders', { params: { store_id: storeId } }),
          apiClient.get('/customers', { params: { store_id: storeId } })
        ])
        
        const orders = ordersRes.data.orders || ordersRes.data || []
        const customers = customersRes.data.customers || customersRes.data || []
        
        const totalRevenue = orders
          .filter((o: any) => o.payment_status === 'paid')
          .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0)
        
        const totalOrders = orders.length
        const totalCustomers = new Set(orders.map((o: any) => o.customer_name)).size
        const totalDebt = customers.reduce((sum: number, c: any) => sum + (c.outstanding_debt || 0), 0)
        
        setMetrics({
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalDebt,
          weekGrowthRevenue: 12,
          weekGrowthOrders: 5,
          weekGrowthCustomers: 8,
          weekGrowthDebt: -3,
        })
        
        setRecentOrders(orders.slice(0, 5))
        calculateAlertsAndStats(orders, customers)
      } catch (apiError) {
        console.warn('Using mock data:', apiError)
        setMetrics({
          totalRevenue: 15000000,
          totalOrders: 245,
          totalCustomers: 1205,
          totalDebt: 3500000,
          weekGrowthRevenue: 12,
          weekGrowthOrders: 5,
          weekGrowthCustomers: 8,
          weekGrowthDebt: -3,
        })
        
        const mockOrders = [
          { id: 'ORD-001', order_number: 'ORD-001', customer_name: 'Nguyễn Văn A', status: 'delivered', payment_status: 'paid', total_amount: 40000, created_at: '2026-01-21T10:30:00' },
          { id: 'ORD-002', order_number: 'ORD-002', customer_name: 'Trần Thị B', status: 'delivered', payment_status: 'paid', total_amount: 35000, created_at: '2026-01-21T09:15:00' },
          { id: 'ORD-003', order_number: 'ORD-003', customer_name: 'Lê Văn C', status: 'shipped', payment_status: 'pending', total_amount: 50000, created_at: '2026-01-18T14:20:00' },
          { id: 'ORD-004', order_number: 'ORD-004', customer_name: 'Phạm Thị D', status: 'pending', payment_status: 'unpaid', total_amount: 25000, created_at: new Date().toISOString() },
        ]
        const mockCustomers = [
          { id: 1, name: 'Nguyễn Văn A', outstanding_debt: 500000 },
          { id: 2, name: 'Trần Thị B', outstanding_debt: 0 },
        ]
        setRecentOrders(mockOrders)
        calculateAlertsAndStats(mockOrders, mockCustomers)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-600">{t('loadingData')}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Smile className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">
              {t('welcomeMessage')}, {user?.full_name}!
            </h1>
          </div>
          <p className="text-blue-100 mt-2 text-lg">{t('store')}: <span className="font-semibold">{user?.store_name}</span></p>
          <p className="text-blue-100 mt-1 text-sm">{t('date')}: {formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards - Interactive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Revenue Card */}
          <div
            onClick={() => router.push('/owner/reports-charts')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border-t-4 border-emerald-500 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t('todayRevenue')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{settingsService.formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 p-3 rounded-lg group-hover:from-emerald-200 group-hover:to-emerald-100 transition">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className={`flex items-center gap-2 ${metrics.weekGrowthRevenue >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <span className="text-sm font-semibold">
                {metrics.weekGrowthRevenue >= 0 ? '↑' : '↓'} {Math.abs(metrics.weekGrowthRevenue)}%
              </span>
              <span className="text-xs text-gray-500">{t('weekGrowth')}</span>
            </div>
          </div>

          {/* Orders Card */}
          <div
            onClick={() => router.push('/owner/orders')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border-t-4 border-blue-500 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t('totalOrders')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalOrders}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-3 rounded-lg group-hover:from-blue-200 group-hover:to-blue-100 transition">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className={`flex items-center gap-2 ${metrics.weekGrowthOrders >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <span className="text-sm font-semibold">
                {metrics.weekGrowthOrders >= 0 ? '↑' : '↓'} {Math.abs(metrics.weekGrowthOrders)}%
              </span>
              <span className="text-xs text-gray-500">{t('weekGrowth')}</span>
            </div>
          </div>

          {/* Customers Card */}
          <div
            onClick={() => router.push('/owner/customers')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border-t-4 border-purple-500 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t('totalCustomers')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalCustomers}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-3 rounded-lg group-hover:from-purple-200 group-hover:to-purple-100 transition">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className={`flex items-center gap-2 ${metrics.weekGrowthCustomers >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <span className="text-sm font-semibold">
                {metrics.weekGrowthCustomers >= 0 ? '↑' : '↓'} {Math.abs(metrics.weekGrowthCustomers)}%
              </span>
              <span className="text-xs text-gray-500">{t('weekGrowth')}</span>
            </div>
          </div>

          {/* Debt Card */}
          <div
            onClick={() => router.push('/owner/customers')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transform transition-all duration-300 border-t-4 border-amber-500 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t('outstandingDebt')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{(metrics.totalDebt / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-gradient-to-br from-amber-100 to-amber-50 p-3 rounded-lg group-hover:from-amber-200 group-hover:to-amber-100 transition">
                <Wallet className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">{t('requiresProcessing')}</span>
              <span className="text-xs text-gray-500">{t('fromCustomers')}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Widget 1: Order Status Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('orderStatus')}</h2>
            </div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => router.push('/owner/orders')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
              >
                {t('viewAll')} →
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:shadow-md transition cursor-pointer" onClick={() => router.push('/owner/orders')}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{t('delivered')}</p>
                    <p className="text-2xl font-bold text-gray-900">{orderStats.delivered}</p>
                  </div>
                </div>
                <div className="text-sm text-green-600 font-semibold">
                  {orderStats.total > 0 ? Math.round((orderStats.delivered / orderStats.total) * 100) : 0}%
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200 hover:shadow-md transition cursor-pointer" onClick={() => router.push('/owner/orders')}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Truck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{t('shippedOrders')}</p>
                    <p className="text-2xl font-bold text-gray-900">{orderStats.shipped}</p>
                  </div>
                </div>
                <div className="text-sm text-blue-600 font-semibold">
                  {orderStats.total > 0 ? Math.round((orderStats.shipped / orderStats.total) * 100) : 0}%
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200 hover:shadow-md transition cursor-pointer" onClick={() => router.push('/owner/orders')}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{t('pendingConfirm')}</p>
                    <p className="text-2xl font-bold text-gray-900">{orderStats.pending}</p>
                  </div>
                </div>
                <div className="text-sm text-yellow-600 font-semibold">
                  {orderStats.total > 0 ? Math.round((orderStats.pending / orderStats.total) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Widget 2: Quick Stats (đổi từ vị trí 3) */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('quickStats')}</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">{t('todayRevenue')}</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">
                      {(quickStats.todayRevenue / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">{t('todayOrders')}</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">{quickStats.todayOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                    <Package className="w-7 h-7 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">{t('pendingPayments')}</p>
                    <p className="text-2xl font-bold text-amber-700 mt-1">
                      {(quickStats.pendingPayments / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full flex items-center justify-center">
                    <Clock className="w-7 h-7 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 3: Alerts & Warnings (đổi từ vị trí 2) */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('needsAction')}</h2>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse ml-auto"></div>
            </div>
            <div className="space-y-3">
              {alerts.map((alert, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition hover:shadow-md ${
                    alert.color === 'yellow' ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100' :
                    alert.color === 'red' ? 'bg-red-50 border-red-300 hover:bg-red-100' :
                    alert.color === 'orange' ? 'bg-orange-50 border-orange-300 hover:bg-orange-100' :
                    alert.color === 'amber' ? 'bg-amber-50 border-amber-300 hover:bg-amber-100' :
                    'bg-green-50 border-green-300 hover:bg-green-100'
                  }`}
                  onClick={() => {
                    if (alert.type === 'pending' || alert.type === 'unpaid' || alert.type === 'delayed') {
                      router.push('/owner/orders')
                    } else if (alert.type === 'debt') {
                      router.push('/owner/customers')
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      alert.color === 'yellow' ? 'bg-yellow-200' :
                      alert.color === 'red' ? 'bg-red-200' :
                      alert.color === 'orange' ? 'bg-orange-200' :
                      alert.color === 'amber' ? 'bg-amber-200' :
                      'bg-green-200'
                    }`}>
                      {alert.iconType === 'clock' && <Clock className={`w-6 h-6 ${
                        alert.color === 'yellow' ? 'text-yellow-700' : 'text-gray-700'
                      }`} />}
                      {alert.iconType === 'credit-card' && <CreditCard className={`w-6 h-6 ${
                        alert.color === 'red' ? 'text-red-700' : 'text-gray-700'
                      }`} />}
                      {alert.iconType === 'alert-circle' && <AlertCircle className={`w-6 h-6 ${
                        alert.color === 'orange' ? 'text-orange-700' : 'text-gray-700'
                      }`} />}
                      {alert.iconType === 'wallet' && <Wallet className={`w-6 h-6 ${
                        alert.color === 'amber' ? 'text-amber-700' : 'text-gray-700'
                      }`} />}
                      {alert.iconType === 'check' && <Check className={`w-6 h-6 ${
                        alert.color === 'green' ? 'text-green-700' : 'text-gray-700'
                      }`} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t(alert.messageKey as keyof typeof translations.en)}</p>
                      {alert.count > 0 && alert.type !== 'ok' && (
                        <p className="text-xs text-gray-600 mt-1">{t('clickToView')}</p>
                      )}
                    </div>
                  </div>
                  {alert.count > 0 && alert.type !== 'ok' && (
                    <div className={`text-2xl font-bold ${
                      alert.color === 'yellow' ? 'text-yellow-700' :
                      alert.color === 'red' ? 'text-red-700' :
                      alert.color === 'orange' ? 'text-orange-700' :
                      alert.color === 'amber' ? 'text-amber-700' :
                      'text-green-700'
                    }`}>
                      {alert.count}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-400 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('recentOrders')}</h2>
            </div>
              <button
                onClick={() => router.push('/owner/orders')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
              >
                {t('viewAll')} →
              </button>
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('orderCode')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('customerName')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('statusLabel')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('totalAmount')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('createdDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y hover:bg-gray-50 transition">
              {recentOrders.length > 0 ? recentOrders.map((order, idx) => (
                <tr key={idx} className="hover:bg-indigo-50 transition cursor-pointer" onClick={() => router.push('/owner/orders')}>
                  <td className="px-6 py-4 text-sm font-bold text-indigo-600">{order.order_number || `ORD-${order.id}`}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'delivered' && <Check className="w-3.5 h-3.5" />}
                      {order.status === 'shipped' && <Truck className="w-3.5 h-3.5" />}
                      {order.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                      {order.status === 'delivered' ? t('delivered') :
                       order.status === 'shipped' ? t('shipping') :
                       order.status === 'pending' ? t('pending') :
                       t('draft')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{settingsService.formatCurrency(order.total_amount || 0)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {t('noRecentOrders')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
