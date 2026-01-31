'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { settingsService } from '@/services/settings.service'
import { getTranslation } from '@/config/translations'
import { useEffect, useState } from 'react'
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  MessageSquare, 
  Mic, 
  PackageSearch,
  UserCheck,
  CreditCard,
  TrendingUp,
  FileText,
  Wrench,
  Settings,
  LogOut
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [language, setLanguage] = useState('vi')

  useEffect(() => {
    // Check if user is authenticated
    const token = authService.getToken()
    if (!token) {
      router.push('/login')
    } else {
      const settings = settingsService.getSettings()
      setLanguage(settings.language)
      setIsLoading(false)
    }
  }, [])

  const handleLogout = () => {
    authService.logout()
    router.push('/login')
  }

  const isActive = (path: string) => pathname?.includes(path)

  const t = (key: keyof typeof import('@/config/translations').translations.en) =>
    getTranslation(language as 'en' | 'vi', key)

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">{t('loading')}</div>
  }

  const user = authService.getCurrentUser()
  const isOwner = user?.role === 'owner'

  const menuItems = [
    { label: t('dashboard'), path: '/owner/dashboard', iconType: 'dashboard' },
    { label: t('products'), path: '/owner/products', iconType: 'products' },
    { label: t('customers'), path: '/owner/customers', iconType: 'customers' },
    { label: t('orders'), path: '/owner/orders', iconType: 'orders' },
    ...(isOwner ? [
      { label: t('inventory'), path: '/owner/inventory', iconType: 'inventory' },
      { label: t('employees'), path: '/owner/employees', iconType: 'employees' },
      { label: t('paymentHistory'), path: '/owner/payment-history', iconType: 'payment' },
      { label: t('reportsCharts'), path: '/owner/reports-charts', iconType: 'reports' },
      { label: t('bookkeeping'), path: '/owner/bookkeeping', iconType: 'bookkeeping' },
    ] : []),
    { label: t('chatbot'), path: '/employee/chatbot', iconType: 'chatbot' },
    { label: t('voiceOrder'), path: '/employee/voice-order', iconType: 'voice' },
    ...(isOwner ? [
      { label: t('admin'), path: '/owner/admin', iconType: 'admin' },
    ] : []),
    { label: t('settings'), path: '/owner/settings', iconType: 'settings' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600">BizFlow</h1>
        </div>

        {/* Menu */}
        <nav className="mt-6 flex-1">
          {menuItems.map((item) => {
            const iconClass = `w-5 h-5 mr-3 inline-block`
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-6 py-3 text-sm font-medium transition ${
                  isActive(item.path)
                    ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.iconType === 'dashboard' && <BarChart3 className={iconClass} />}
                {item.iconType === 'products' && <Package className={iconClass} />}
                {item.iconType === 'orders' && <ShoppingCart className={iconClass} />}
                {item.iconType === 'customers' && <Users className={iconClass} />}
                {item.iconType === 'chatbot' && <MessageSquare className={iconClass} />}
                {item.iconType === 'voice' && <Mic className={iconClass} />}
                {item.iconType === 'inventory' && <PackageSearch className={iconClass} />}
                {item.iconType === 'employees' && <UserCheck className={iconClass} />}
                {item.iconType === 'payment' && <CreditCard className={iconClass} />}
                {item.iconType === 'reports' && <TrendingUp className={iconClass} />}
                {item.iconType === 'bookkeeping' && <FileText className={iconClass} />}
                {item.iconType === 'admin' && <Wrench className={iconClass} />}
                {item.iconType === 'settings' && <Settings className={iconClass} />}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
