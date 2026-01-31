'use client'

import { useState, useEffect, useRef } from 'react'
import apiClient from '@/services/api.service'
import { authService } from '@/services/auth.service'
import { settingsService } from '@/services/settings.service'
import { FileText, Download, Plus, RefreshCw, BookOpen, Library } from 'lucide-react'

interface JournalEntry {
  id: string
  entry_date: string
  account_code: string
  account_name: string
  description: string
  debit_amount: number
  credit_amount: number
  reference_doc: string
  created_at: string
}

interface LedgerAccount {
  account_code: string
  account_name: string
  opening_balance: number
  debits: number
  credits: number
  closing_balance: number
}

interface AccountingReport {
  period: string
  total_revenue: number
  total_expenses: number
  total_debits: number
  total_credits: number
  profit_loss: number
  entries_count: number
}

const CHART_OF_ACCOUNTS_VI = {
  '1000': 'Tiền Mặt',
  '1100': 'Tiền Gửi Ngân Hàng',
  '1200': 'Hàng Tồn Kho',
  '2000': 'Nợ Phải Trả',
  '3000': 'Vốn Chủ Sở Hữu',
  '4000': 'Doanh Thu Bán Hàng',
  '5000': 'Giá Vốn Hàng Bán',
  '6000': 'Chi Phí Nhân Công',
  '6100': 'Chi Phí Vận Chuyển',
  '6200': 'Chi Phí Khác'
}

const CHART_OF_ACCOUNTS_EN = {
  '1000': 'Cash',
  '1100': 'Bank Deposits',
  '1200': 'Inventory',
  '2000': 'Accounts Payable',
  '3000': 'Owner\'s Equity',
  '4000': 'Sales Revenue',
  '5000': 'Cost of Goods Sold',
  '6000': 'Labor Expenses',
  '6100': 'Shipping Expenses',
  '6200': 'Other Expenses'
}

export default function CircularBookkeeping() {
  const [settings, setSettings] = useState(settingsService.getSettings())
  const t = (vi: string, en: string) => (settings?.language === 'vi' ? vi : en)
  const formatCurrency = (amount: number) => settingsService.formatCurrency(amount)
  const formatDate = (dateStr: string) => settingsService.formatDate(dateStr)
  const CHART_OF_ACCOUNTS = settings?.language === 'vi' ? CHART_OF_ACCOUNTS_VI : CHART_OF_ACCOUNTS_EN

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([])
  const [reports, setReports] = useState<AccountingReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEntryForm, setShowEntryForm] = useState(false)
  const entryCountRef = useRef(0)
  const [dateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const [newEntry, setNewEntry] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    account_code: '',
    description: '',
    debit_amount: 0,
    credit_amount: 0,
    reference_doc: ''
  })

  useEffect(() => {
    setSettings(settingsService.getSettings())
    fetchData()
  }, [])

  useEffect(() => {
    generateReport()
  }, [journalEntries])

  const fetchData = async () => {
    setLoading(true)
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'

      // Get orders data
      const ordersRes = await apiClient.get('/orders', { params: { store_id: storeId } })
      const orders = ordersRes.data.orders || []

      // Get products data
      const productsRes = await apiClient.get('/products', { params: { store_id: storeId } })
      const products = productsRes.data.products || []

      // Generate journal entries from orders
      const entries: JournalEntry[] = []

      orders.forEach((order: any) => {
        if (order.payment_status === 'paid') {
          // Revenue entry
          entries.push({
            id: `entry_${order.id}_1`,
            entry_date: order.created_at || new Date().toISOString(),
            account_code: '1000',
            account_name: CHART_OF_ACCOUNTS['1000'],
            description: t(`Bán hàng - ĐH ${order.order_number}`, `Sale - Order ${order.order_number}`),
            debit_amount: order.total_amount,
            credit_amount: 0,
            reference_doc: order.order_number,
            created_at: order.created_at || new Date().toISOString()
          })

          entries.push({
            id: `entry_${order.id}_2`,
            entry_date: order.created_at || new Date().toISOString(),
            account_code: '4000',
            account_name: CHART_OF_ACCOUNTS['4000'],
            description: t(`Doanh thu từ ĐH ${order.order_number}`, `Revenue from Order ${order.order_number}`),
            debit_amount: 0,
            credit_amount: order.total_amount,
            reference_doc: order.order_number,
            created_at: order.created_at || new Date().toISOString()
          })

          // Cost of goods sold
          const costOfGoods = (order.items || []).reduce((sum: number, item: any) => {
            const product = products.find((p: any) => p.id === item.product_id)
            return sum + (product ? product.price * 0.6 * item.quantity : 0)
          }, 0)

          if (costOfGoods > 0) {
            entries.push({
              id: `entry_${order.id}_3`,
              entry_date: order.created_at || new Date().toISOString(),
              account_code: '5000',
              account_name: CHART_OF_ACCOUNTS['5000'],
              description: t(`COGS - ĐH ${order.order_number}`, `COGS - Order ${order.order_number}`),
              debit_amount: costOfGoods,
              credit_amount: 0,
              reference_doc: order.order_number,
              created_at: order.created_at || new Date().toISOString()
            })

            entries.push({
              id: `entry_${order.id}_4`,
              entry_date: order.created_at || new Date().toISOString(),
              account_code: '1200',
              account_name: CHART_OF_ACCOUNTS['1200'],
              description: t(`Xuất kho - ĐH ${order.order_number}`, `Inventory out - Order ${order.order_number}`),
              debit_amount: 0,
              credit_amount: costOfGoods,
              reference_doc: order.order_number,
              created_at: order.created_at || new Date().toISOString()
            })
          }
        }
      })

      setJournalEntries(entries)

      // Calculate ledger accounts
      const accounts: {[key: string]: LedgerAccount} = {}

      Object.entries(CHART_OF_ACCOUNTS).forEach(([code, name]) => {
        accounts[code] = {
          account_code: code,
          account_name: name as string,
          opening_balance: 0,
          debits: 0,
          credits: 0,
          closing_balance: 0
        }
      })

      entries.forEach(entry => {
        if (accounts[entry.account_code]) {
          accounts[entry.account_code].debits += entry.debit_amount
          accounts[entry.account_code].credits += entry.credit_amount
        }
      })

      Object.values(accounts).forEach(account => {
        account.closing_balance = account.opening_balance + account.debits - account.credits
      })

      setLedgerAccounts(Object.values(accounts))
    } catch (error) {
      console.error('Failed to fetch bookkeeping data', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = () => {
    const totalDebits = journalEntries.reduce((sum, e) => sum + e.debit_amount, 0)
    const totalCredits = journalEntries.reduce((sum, e) => sum + e.credit_amount, 0)

    const revenue = journalEntries
      .filter(e => e.account_code === '4000')
      .reduce((sum, e) => sum + e.credit_amount, 0)

    const expenses = journalEntries
      .filter(e => e.account_code === '5000')
      .reduce((sum, e) => sum + e.debit_amount, 0)

    const report: AccountingReport = {
      period: `${t('Từ', 'From')} ${dateRange.start} ${t('đến', 'to')} ${dateRange.end}`,
      total_revenue: revenue,
      total_expenses: expenses,
      total_debits: totalDebits,
      total_credits: totalCredits,
      profit_loss: revenue - expenses,
      entries_count: journalEntries.length
    }

    setReports(report)
  }

  const handleAddEntry = async () => {
    if (!newEntry.account_code || (!newEntry.debit_amount && !newEntry.credit_amount)) {
      alert(t('Vui lòng điền đầy đủ thông tin', 'Please fill in all required information'))
      return
    }

    const entry: JournalEntry = {
      id: `entry_${entryCountRef.current++}`,
      entry_date: newEntry.entry_date,
      account_code: newEntry.account_code,
      account_name: CHART_OF_ACCOUNTS[newEntry.account_code as keyof typeof CHART_OF_ACCOUNTS] || '',
      description: newEntry.description,
      debit_amount: newEntry.debit_amount,
      credit_amount: newEntry.credit_amount,
      reference_doc: newEntry.reference_doc,
      created_at: new Date().toISOString()
    }

    setJournalEntries([entry, ...journalEntries])
    setNewEntry({
      entry_date: new Date().toISOString().split('T')[0],
      account_code: '',
      description: '',
      debit_amount: 0,
      credit_amount: 0,
      reference_doc: ''
    })
    setShowEntryForm(false)
    alert(t('Thêm chứng từ thành công!', 'Entry added successfully!'))
  }

  const exportToCSV = () => {
    let csv = `${t('Ngày Chứng Từ', 'Entry Date')},${t('Mã TK', 'Account Code')},${t('Tên Tài Khoản', 'Account Name')},${t('Diễn Giải', 'Description')},${t('Nợ', 'Debit')},${t('Có', 'Credit')},${t('Chứng Từ Tham Chiếu', 'Reference Doc')}\n`

    journalEntries.forEach(entry => {
      csv += `${entry.entry_date},"${entry.account_code}","${entry.account_name}","${entry.description}",${entry.debit_amount},${entry.credit_amount},"${entry.reference_doc}"\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${t('nhật_ký', 'journal_entries')}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return <div className="p-6 text-center">{t('Đang tải dữ liệu kế toán...', 'Loading accounting data...')}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold">{t('Hệ Thống Kế Toán Thông Tư 88', 'Circular 88 Accounting System')}</h1>
        </div>
          <p className="mt-2 text-blue-100">{t('Quản lý sổ nhật ký, sổ cái và báo cáo tài chính', 'Manage journal entries, ledgers, and financial reports')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Report Summary */}
        {reports && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 font-medium">{t('Doanh Thu', 'Revenue')}</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(reports.total_revenue)}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow p-6">
              <p className="text-sm opacity-90 font-medium">{t('Chi Phí', 'Expenses')}</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(reports.total_expenses)}</p>
            </div>

            <div className={`bg-gradient-to-br ${reports.profit_loss >= 0 ? 'from-blue-500 to-blue-600' : 'from-red-500 to-red-600'} text-white rounded-lg shadow p-6`}>
              <p className="text-sm opacity-90 font-medium">{t('Lợi Nhuận / Lỗ', 'Profit / Loss')}</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(reports.profit_loss)}</p>
            </div>
          </div>
        )}

        {/* Add Entry Form */}
        {showEntryForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">{t('Thêm Chứng Từ Mới', 'Add New Entry')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Ngày Chứng Từ', 'Entry Date')}</label>
                <input
                  type="date"
                  value={newEntry.entry_date}
                  onChange={(e) => setNewEntry({ ...newEntry, entry_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Tài Khoản', 'Account')}</label>
                <select
                  value={newEntry.account_code}
                  onChange={(e) => setNewEntry({ ...newEntry, account_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">{t('Chọn tài khoản...', 'Select account...')}</option>
                  {Object.entries(CHART_OF_ACCOUNTS).map(([code, name]) => (
                    <option key={code} value={code}>{code} - {name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Diễn Giải', 'Description')}</label>
                <input
                  type="text"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  placeholder={t('Nội dung ghi chép', 'Entry details')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Nợ', 'Debit')}</label>
                <input
                  type="number"
                  value={newEntry.debit_amount}
                  onChange={(e) => setNewEntry({ ...newEntry, debit_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Có', 'Credit')}</label>
                <input
                  type="number"
                  value={newEntry.credit_amount}
                  onChange={(e) => setNewEntry({ ...newEntry, credit_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Chứng Từ Tham Chiếu', 'Reference Doc')}</label>
                <input
                  type="text"
                  value={newEntry.reference_doc}
                  onChange={(e) => setNewEntry({ ...newEntry, reference_doc: e.target.value })}
                  placeholder={t('VD: ĐH-001, CT-2024...', 'E.g., ORD-001, DOC-2024...')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAddEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {t('Thêm Chứng Từ', 'Add Entry')}
              </button>
              <button
                onClick={() => setShowEntryForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                {t('Hủy', 'Cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setShowEntryForm(!showEntryForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('Thêm Chứng Từ', 'Add Entry')}
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('Xuất CSV', 'Export CSV')}
          </button>
          <button
            onClick={generateReport}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('Cập Nhật Báo Cáo', 'Update Report')}
          </button>
        </div>

        {/* Journal Entries */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            {t('Sổ Nhật Ký Tổng Hợp', 'General Journal')} ({journalEntries.length})
          </h2>
          {journalEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('Ngày', 'Date')}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('Mã TK', 'Account Code')}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('Tên Tài Khoản', 'Account Name')}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('Diễn Giải', 'Description')}</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">{t('Nợ', 'Debit')}</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">{t('Có', 'Credit')}</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('Chứng Từ', 'Reference')}</th>
                  </tr>
                </thead>
                <tbody>
                  {journalEntries.slice(0, 50).map(entry => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{formatDate(entry.entry_date)}</td>
                      <td className="px-4 py-3 font-semibold">{entry.account_code}</td>
                      <td className="px-4 py-3">{entry.account_name}</td>
                      <td className="px-4 py-3 text-gray-600">{entry.description}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">
                        {entry.debit_amount > 0 ? formatCurrency(entry.debit_amount) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        {entry.credit_amount > 0 ? formatCurrency(entry.credit_amount) : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{entry.reference_doc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">{t('Chưa có chứng từ nào', 'No entries yet')}</p>
          )}
        </div>

        {/* Ledger Accounts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Library className="w-6 h-6 text-indigo-600" />
            {t('Sổ Cái Tổng Hợp', 'General Ledger')}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('Mã TK', 'Account Code')}</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{t('Tên Tài Khoản', 'Account Name')}</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">{t('SD Đầu Kỳ', 'Opening Balance')}</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">{t('Nợ', 'Debit')}</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">{t('Có', 'Credit')}</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">{t('SD Cuối Kỳ', 'Closing Balance')}</th>
                </tr>
              </thead>
              <tbody>
                {ledgerAccounts.map(account => (
                  <tr key={account.account_code} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{account.account_code}</td>
                    <td className="px-4 py-3">{account.account_name}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(account.opening_balance)}</td>
                    <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                      {account.debits > 0 ? formatCurrency(account.debits) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-semibold">
                      {account.credits > 0 ? formatCurrency(account.credits) : '-'}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${account.closing_balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                      {formatCurrency(account.closing_balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
