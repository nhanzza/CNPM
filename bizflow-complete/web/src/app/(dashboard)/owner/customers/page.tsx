'use client'

import { useEffect, useState } from 'react'
import apiClient from '@/services/api.service'
import { authService } from '@/services/auth.service'
import { settingsService } from '@/services/settings.service'
import { getTranslation, translations } from '@/config/translations'
import { Button } from '@/components/ui/Button'

interface Customer {
  id: string
  name: string
  phone: string
  address: string
  email?: string
  total_purchases?: number
  outstanding_debt?: number
}

interface CustomerForm {
  name: string
  phone: string
  address: string
  email: string
}

export default function CustomersPage() {
  // const { t } = useTranslation() // TODO: Use for translations
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customersFromApi, setCustomersFromApi] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [formData, setFormData] = useState<CustomerForm>({
    name: '',
    phone: '',
    address: '',
    email: ''
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [settings] = useState(settingsService.getSettings())
  const tKey = (key: keyof typeof translations.en) => getTranslation(settings.language, key)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    const user = authService.getCurrentUser()
    const storeId = user?.store_id || '1'
    
    try {
      setLoading(true)
      const response = await apiClient.get('/customers', {
        params: { store_id: storeId }
      })
      const data = response.data.customers || response.data || []
      if (Array.isArray(data)) {
        setCustomers(data)
        setCustomersFromApi(true)
        return
      }
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : 'Unknown error'
      console.warn('fetchCustomers fallback, using mock data. Reason:', message)
    } finally {
      setLoading(false)
    }
    
    const mockCustomers = [
      {
        id: 'CUST001',
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        email: 'a@example.com',
        address: '123 Đường A, TP HCM',
        total_purchases: 500000,
        total_debt: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'CUST002',
        name: 'Trần Thị B',
        phone: '0909876543',
        email: 'b@example.com',
        address: '456 Đường B, Hà Nội',
        total_purchases: 300000,
        total_debt: 100000,
        created_at: new Date().toISOString()
      }
    ]
    setCustomers(mockCustomers)
    setCustomersFromApi(false)
  }

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const user = authService.getCurrentUser()
    const storeId = user?.store_id || '1'
    
    try {
      await apiClient.post('/customers', {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address
      }, {
        params: { store_id: storeId }
      })
      alert(tKey('successAddCustomer'))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.warn('Customer POST failed, using optimistic local add. Reason:', message)
      
      const optimisticCustomer: Customer = {
        id: `local-${Date.now()}`,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        total_purchases: 0,
        outstanding_debt: 0
      }
      
      setCustomers([optimisticCustomer, ...customers])
      alert(tKey('successAddCustomer') + ' (Offline)')
    }
    
    setShowAddForm(false)
    setFormData({ name: '', phone: '', address: '', email: '' })
    await fetchCustomers()
  }

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm(tKey('confirmDeleteCustomer'))) return
    
    setCustomers(current => current.filter(c => c.id !== id))
    
    if (customersFromApi) {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'
      
      try {
        await apiClient.delete(`/customers/${id}`, {
          params: { store_id: storeId }
        })
        await fetchCustomers()
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.warn('Delete customer failed (UI already removed):', message)
      }
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      email: customer.email || ''
    })
    setEditingId(customer.id)
    setShowEditForm(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const user = authService.getCurrentUser()
    const storeId = user?.store_id || '1'
    
    try {
      await apiClient.put(`/customers/${editingId}`, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        email: formData.email
      }, {
        params: { store_id: storeId }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.warn('Customer PUT failed, changes may not persist. Reason:', message)
    }
    
    setShowEditForm(false)
    setEditingId(null)
    setFormData({ name: '', phone: '', address: '', email: '' })
    await fetchCustomers()
  }

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  )

  if (loading) return <div className="p-8 text-center">{tKey('loading')}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{tKey('customerManagement')}</h1>
        <Button 
          onClick={() => setShowAddForm(true)}
          size="md"
          className="rounded-full px-6 py-2.5"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">+</span>
            <span>{tKey('addCustomer')}</span>
          </span>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={tKey('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Add Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">{tKey('createNewCustomer')}</h2>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tKey('customerName')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tKey('phone')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tKey('email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tKey('address')}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  {tKey('add')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  {tKey('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{tKey('customerName')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{tKey('phone')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{tKey('address')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{tKey('totalSpent')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{tKey('debt')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{tKey('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{customer.address || '-'}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {settingsService.formatCurrency(customer.total_purchases || 0)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={(customer.outstanding_debt || 0) > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                    {settingsService.formatCurrency(customer.outstanding_debt || 0)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditCustomer(customer)}>{tKey('edit')}</Button>
                  <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteCustomer(customer.id)}>{tKey('delete')}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Customer Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">{tKey('editCustomer')}</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tKey('customerName')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tKey('phone')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tKey('email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tKey('address')}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                  {tKey('save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  {tKey('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

