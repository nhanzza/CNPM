'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/services/api.service'
import { authService } from '@/services/auth.service'
import { settingsService } from '@/services/settings.service'

interface PaymentLog {
  id: string
  order_id: string
  order_number: string
  customer_id: string
  customer_name: string
  amount: number
  old_status: string
  new_status: string
  payment_date: string
  notes?: string
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  total_amount: number
  status: string
  payment_status?: string
  created_at: string
}

export default function PaymentHistoryPage() {
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [settings] = useState(settingsService.getSettings())
  const t = (vi: string, en: string) => (settings.language === 'en' ? en : vi)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'

      const ordersRes = await apiClient.get('/orders', {
        params: { store_id: storeId }
      })

      const allOrders = ordersRes.data.orders || ordersRes.data || []

      // Generate payment logs from orders
      const logs = allOrders
        .filter((order: Order) => {
          const orderDate = new Date(order.created_at).toISOString().split('T')[0]
          return orderDate >= dateRange.startDate && orderDate <= dateRange.endDate
        })
        .map((order: Order, idx: number) => ({
          id: `log_${idx + 1}`,
          order_id: order.id,
          order_number: order.order_number,
          customer_id: '',
          customer_name: order.customer_name,
          amount: order.total_amount,
          old_status: 'pending',
          new_status: order.payment_status || 'pending',
          payment_date: order.created_at,
          notes: order.status
        }))
        .filter((log: PaymentLog) => filterStatus === 'all' || log.new_status === filterStatus)

      setPaymentLogs(logs)
    } catch (error) {
      console.error('Failed to fetch data', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'paid') {
      return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">{t('Đã Thanh Toán', 'Paid')}</span>
    } else if (status === 'pending') {
      return <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">{t('Chưa Thanh Toán', 'Unpaid')}</span>
    }
  }

  const totalPaid = paymentLogs
    .filter(log => log.new_status === 'paid')
    .reduce((sum, log) => sum + log.amount, 0)

  const totalPending = paymentLogs
    .filter(log => log.new_status === 'pending')
    .reduce((sum, log) => sum + log.amount, 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t('Lịch Sử Thanh Toán', 'Payment History')}</h1>

      {/* Date Range & Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Từ Ngày', 'From Date')}</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Đến Ngày', 'To Date')}</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Trạng Thái', 'Status')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base"
            >
              <option value="all">{t('Tất Cả', 'All')}</option>
              <option value="paid">{t('Đã Thanh Toán', 'Paid')}</option>
              <option value="pending">{t('Chưa Thanh Toán', 'Unpaid')}</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchData}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              {t('Cập Nhật', 'Update')}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
          <div className="text-sm font-medium opacity-90">{t('Đã Thanh Toán', 'Paid')}</div>
          <div className="text-3xl font-bold mt-2">{settingsService.formatCurrency(totalPaid)}</div>
          <div className="text-xs mt-2 opacity-75">{paymentLogs.filter(l => l.new_status === 'paid').length} {t('đơn', 'orders')}</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow p-6">
          <div className="text-sm font-medium opacity-90">{t('Chưa Thanh Toán', 'Unpaid')}</div>
          <div className="text-3xl font-bold mt-2">{settingsService.formatCurrency(totalPending)}</div>
          <div className="text-xs mt-2 opacity-75">{paymentLogs.filter(l => l.new_status === 'pending').length} {t('đơn', 'orders')}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
          <div className="text-sm font-medium opacity-90">{t('Tổng Cộng', 'Total')}</div>
          <div className="text-3xl font-bold mt-2">{settingsService.formatCurrency(totalPaid + totalPending)}</div>
          <div className="text-xs mt-2 opacity-75">{paymentLogs.length} {t('giao dịch', 'transactions')}</div>
        </div>
      </div>

      {/* Payment Logs Table */}
      {loading ? (
        <div className="text-center py-8">{t('Đang tải dữ liệu...', 'Loading data...')}</div>
      ) : paymentLogs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          {t('Không có giao dịch nào trong khoảng thời gian này', 'No transactions in this period')}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Mã Đơn', 'Order #')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Khách Hàng', 'Customer')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Số Tiền', 'Amount')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Trạng Thái Cũ', 'Old Status')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Trạng Thái Mới', 'New Status')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Ngày Giao Dịch', 'Transaction Date')}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">{t('Ghi Chú', 'Notes')}</th>
              </tr>
            </thead>
            <tbody>
              {paymentLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-indigo-600">{log.order_number}</td>
                  <td className="px-6 py-4 text-sm">{log.customer_name}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{settingsService.formatCurrency(log.amount)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                      {log.old_status === 'pending' ? t('Chưa TT', 'Unpaid') : t('Đã TT', 'Paid')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {getStatusBadge(log.new_status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {settingsService.formatDate(log.payment_date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
