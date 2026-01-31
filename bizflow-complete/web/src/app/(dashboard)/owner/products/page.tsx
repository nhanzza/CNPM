'use client'

import { useEffect, useState } from 'react'
import apiClient from '@/services/api.service'
import { Button } from '@/components/ui/Button'
import { authService } from '@/services/auth.service'
import { useTranslation } from '@/hooks/useTranslation'
import { settingsService } from '@/services/settings.service'

interface Product {
  id: string
  business_id: string
  name: string
  sku: string
  category: string
  price: number
  cost: number
  description?: string
  barcode?: string
  is_active: boolean
  created_at: string
  quantity_in_stock: number
  unit_of_measure: string
  min_quantity_alert: number
}

export default function ProductsPage() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    cost: '',
    quantity_in_stock: '',
    unit_of_measure: 'cái',
    min_quantity_alert: '',
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const user = authService.getCurrentUser()
    const storeId = user?.store_id || '1'

    try {
      const response = await apiClient.get('/products', {
        params: { store_id: storeId }
      })
      const data = response.data.products || response.data || []
      
      // Apply optimistic quantity updates from localStorage (for inventory imports)
      const optimisticUpdates = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('productQuantityUpdates') || '{}')
        : {}
      
      const updatedProducts = Array.isArray(data) 
        ? data.map((p: Product) => ({
            ...p,
            quantity_in_stock: optimisticUpdates[p.id] !== undefined 
              ? optimisticUpdates[p.id] 
              : p.quantity_in_stock
          }))
        : []
      
      setProducts(updatedProducts)
      return
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.warn('fetchProducts fallback, using mock data. Reason:', message)
    } finally {
      // always clear loading even when using fallback
      setLoading(false)
    }

    const mockProducts = [
      {
        id: 'prod_001',
        name: 'Nước lọc 1.5L',
        sku: 'NL-1.5L',
        category: 'Thức uống',
        description: 'Nước lọc tinh khiết',
        price: 15000,
        cost: 10000,
        quantity_in_stock: 5000,
        unit_of_measure: 'chai',
        min_quantity_alert: 100,
        store_id: storeId,
        created_at: new Date().toISOString(),
        business_id: '1',
        is_active: true
      },
      {
        id: 'prod_002',
        name: 'Bánh mì',
        sku: 'BM-001',
        category: 'Bánh',
        description: 'Bánh mì tươi hàng ngày',
        price: 25000,
        cost: 15000,
        quantity_in_stock: 50,
        unit_of_measure: 'chiếc',
        min_quantity_alert: 10,
        store_id: storeId,
        created_at: new Date().toISOString(),
        business_id: '1',
        is_active: true
      },
      {
        id: 'prod_003',
        name: 'Phở',
        sku: 'PHO-001',
        category: 'Ăn liền',
        description: 'Phở bò tươi ngon',
        price: 50000,
        cost: 30000,
        quantity_in_stock: 30,
        unit_of_measure: 'bát',
        min_quantity_alert: 5,
        store_id: storeId,
        created_at: new Date().toISOString(),
        business_id: '1',
        is_active: true
      },
      {
        id: 'prod_004',
        name: 'Nước ngọt',
        sku: 'NN-001',
        category: 'Thức uống',
        description: 'Nước ngọt mát lạnh',
        price: 10000,
        cost: 6000,
        quantity_in_stock: 100,
        unit_of_measure: 'lon',
        min_quantity_alert: 20,
        store_id: storeId,
        created_at: new Date().toISOString(),
        business_id: '1',
        is_active: true
      },
      {
        id: 'prod_005',
        name: 'Cà phê',
        sku: 'CF-001',
        category: 'Thức uống',
        description: 'Cà phê đen đậm đà',
        price: 20000,
        cost: 12000,
        quantity_in_stock: 40,
        unit_of_measure: 'ly',
        min_quantity_alert: 10,
        store_id: storeId,
        created_at: new Date().toISOString(),
        business_id: '1',
        is_active: true
      },
    ]
    setProducts(mockProducts)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm(t('confirmDelete'))) return
    
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'
      
      await apiClient.delete(`/products/${productId}`, {
        params: { store_id: storeId }
      })
      fetchProducts()
      alert(t('successDelete'))
    } catch (error: any) {
      console.error('Delete error:', error.response?.status, error.message)
      alert(t('errorDeleteProduct') + (error.response?.data?.detail || error.message))
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price.toString(),
      cost: product.cost.toString(),
      quantity_in_stock: (product.quantity_in_stock || 0).toString(),
      unit_of_measure: product.unit_of_measure || 'cái',
      min_quantity_alert: (product.min_quantity_alert || 0).toString(),
    })
    setShowEditForm(true)
  }

  const handleSaveEdit = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault()
    if (!editingId) return

    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'
      
      await apiClient.put(`/products/${editingId}`, {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        quantity_in_stock: parseFloat(formData.quantity_in_stock) || 0,
        unit_of_measure: formData.unit_of_measure,
        min_quantity_alert: parseFloat(formData.min_quantity_alert) || 0,
      }, {
        params: { store_id: storeId }
      })
      setShowEditForm(false)
      setEditingId(null)
      fetchProducts()
      alert(t('successEdit'))
    } catch (error) {
      console.error('Failed to update product', error)
      alert(t('errorEditProduct') + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleAddProduct = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault()
    console.log('handleAddProduct called', formData)
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'
      
      await apiClient.post('/products', {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        quantity_in_stock: parseFloat(formData.quantity_in_stock) || 0,
        unit_of_measure: formData.unit_of_measure,
        min_quantity_alert: parseFloat(formData.min_quantity_alert) || 0,
      }, {
        params: { store_id: storeId }
      })
      setFormData({
        name: '',
        sku: '',
        category: '',
        price: '',
        cost: '',
        quantity_in_stock: '',
        unit_of_measure: 'cái',
        min_quantity_alert: '',
      })
      setShowAddForm(false)
      fetchProducts()
      alert(t('successAdd'))
    } catch (error) {
      console.error('Failed to add product', error)
      alert(t('errorAddProduct') + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className="p-8 text-center">{t('loading')}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('productManagement')}</h1>
        <Button 
          onClick={() => setShowAddForm(true)}
          size="md"
          className="rounded-full px-6 py-2.5"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">+</span>
            <span>{t('addProduct')}</span>
          </span>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t('search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      {/* Add Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-8 space-y-4">
            <h2 className="text-3xl font-bold mb-6">{t('createNewProduct')}</h2>
            <div className="space-y-4 max-h-[75vh] overflow-y-auto">
              <input type="text" placeholder={t('productName')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" required />
              <input type="text" placeholder={t('sku')} value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" required />
              <input type="text" placeholder={t('category')} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" required />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder={t('price')} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" required />
                <input type="number" placeholder={t('cost')} value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" required />
              </div>
              <div className="border-t-2 pt-4 mt-4">
                <p className="text-lg font-bold mb-4">{t('inventorySection')}</p>
                <div className="space-y-3">
                  <input type="number" placeholder={t('stockQuantity')} value={formData.quantity_in_stock} onChange={(e) => setFormData({ ...formData, quantity_in_stock: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" />
                  <input type="text" placeholder={t('unitOfMeasure')} value={formData.unit_of_measure} onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" />
                  <input type="number" placeholder={t('minQuantityAlert')} value={formData.min_quantity_alert} onChange={(e) => setFormData({ ...formData, min_quantity_alert: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" />
                </div>
              </div>
              <div className="flex gap-3 justify-end border-t-2 pt-6 mt-6">
                <button onClick={() => setShowAddForm(false)} className="px-6 py-3 text-base font-medium border-2 border-gray-400 rounded-lg hover:bg-gray-100">{t('cancel')}</button>
                <button onClick={handleAddProduct} className="px-8 py-3 text-base font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ {t('addProduct')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-8 space-y-4">
            <h2 className="text-3xl font-bold mb-6">{t('editProduct')}</h2>
            <div className="space-y-4 max-h-[75vh] overflow-y-auto">
              <input type="text" placeholder={t('productName')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" required />
              <input type="text" placeholder={t('sku')} value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" required />
              <input type="text" placeholder={t('category')} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" required />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder={t('price')} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" required />
                <input type="number" placeholder={t('cost')} value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" required />
              </div>
              <div className="border-t-2 pt-4 mt-4">
                <p className="text-lg font-bold mb-4">{t('inventorySection')}</p>
                <div className="space-y-3">
                  <input type="number" placeholder={t('stockQuantity')} value={formData.quantity_in_stock} onChange={(e) => setFormData({ ...formData, quantity_in_stock: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" />
                  <input type="text" placeholder={t('unitOfMeasure')} value={formData.unit_of_measure} onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" />
                  <input type="number" placeholder={t('minQuantityAlert')} value={formData.min_quantity_alert} onChange={(e) => setFormData({ ...formData, min_quantity_alert: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base" />
                </div>
              </div>
              <div className="flex gap-3 justify-end border-t-2 pt-6 mt-6">
                <button onClick={() => setShowEditForm(false)} className="px-6 py-3 text-base font-medium border-2 border-gray-400 rounded-lg hover:bg-gray-100">{t('cancel')}</button>
                <button onClick={handleSaveEdit} className="px-8 py-3 text-base font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700">{t('save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('productName')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('sku')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('category')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('price')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('cost')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('stock')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {settingsService.formatCurrency(product.price)}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  {settingsService.formatCurrency(product.cost)}
                </td>
                <td className={`px-6 py-4 text-sm font-semibold ${product.quantity_in_stock < product.min_quantity_alert ? 'text-red-600' : 'text-green-600'}`}>
                  {product.quantity_in_stock} {product.unit_of_measure}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditProduct(product)}
                  >
                    {t('edit')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    {t('delete')}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
