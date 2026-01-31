'use client'

import { useEffect, useState, Fragment } from 'react'
import apiClient from '@/services/api.service'
import { authService } from '@/services/auth.service'
import { settingsService } from '@/services/settings.service'
import { getTranslation, translations } from '@/config/translations'
import { Button } from '@/components/ui/Button'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  quantity_in_stock: number
  unit_of_measure: string
  min_quantity_alert: number
}

interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  outstanding_debt?: number
}

interface OrderItem {
  product_id: string
  product_name?: string
  quantity: number
  unit: string
  price?: number
  unit_price?: number
  subtotal?: number
}

interface Order {
  id: string
  order_number: string
  customer_id?: string
  customer_name: string
  total_amount: number
  status: string
  created_at: string
  note?: string
  payment_status?: string
  payment_method?: string
  items?: OrderItem[]
}

interface OrderForm {
  customer_id: string
  customer_name: string
  status: string
  note: string
  payment_status?: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [ordersFromApi, setOrdersFromApi] = useState(false)
  const [formData, setFormData] = useState<OrderForm>({
    customer_id: '',
    customer_name: '',
    status: 'pending',
    payment_status: 'pending',
    note: '',
    items: []
  })
  const [editFormData, setEditFormData] = useState<OrderForm>({
    customer_id: '',
    customer_name: '',
    status: 'pending',
    payment_status: 'pending',
    note: '',
    items: []
  })
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const settings = settingsService.getSettings()
  // Support both legacy translation keys and direct vi/en strings
  const t = (vi: string, en?: string) => {
    if (en !== undefined) return settings?.language === 'vi' ? vi : en
    return getTranslation(settings.language, vi as keyof typeof translations.en)
  }

  useEffect(() => {
    fetchOrders()
    fetchProducts()
    fetchCustomers()
  }, [filterStatus])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'
      
      // Try to fetch from API first
      try {
        const response = await apiClient.get('/orders', {
          params: { store_id: storeId }
        })
        const data = response.data.orders || response.data || []
        if (Array.isArray(data)) {
          setOrders(data)
          setOrdersFromApi(true)
          return
        }
      } catch (apiError) {
        console.log('API fetch failed, using mock data:', apiError)
      }
      
      // Fallback to mock data if API fails
      const mockOrders = [
        {
          id: 'ORD001',
          order_number: '#001',
          customer_name: 'Nguyễn Văn A',
          items: [
            { product_id: 'prod_002', product_name: 'Bánh mì', quantity: 2, unit_price: 15000, unit: 'cái' },
            { product_id: 'prod_004', product_name: 'Nước ngọt', quantity: 1, unit_price: 10000, unit: 'chai' }
          ],
          total_amount: 40000,
          status: 'pending',
          created_at: new Date().toISOString()
        },
        {
          id: 'ORD002',
          order_number: '#002',
          customer_name: 'Trần Thị B',
          items: [
            { product_id: 'prod_003', product_name: 'Phở', quantity: 1, unit_price: 35000, unit: 'tô' }
          ],
          total_amount: 35000,
          status: 'completed',
          created_at: new Date().toISOString()
        }
      ]
      setOrders(mockOrders)
      setOrdersFromApi(false)
    } catch (error) {
      console.error('Failed to fetch orders', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
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
        
        if (Array.isArray(data)) {
          const updatedProducts = data.map((p: Product) => ({
            ...p,
            quantity_in_stock: optimisticUpdates[p.id] !== undefined 
              ? optimisticUpdates[p.id] 
              : p.quantity_in_stock
          }))
          setProducts(updatedProducts)
          return
        }
      } catch (apiError) {
        const message = apiError instanceof Error ? apiError.message : 'Unknown error'
        console.warn('fetchProducts fallback, using mock data. Reason:', message)
      }
      
      const mockProducts = [
        { id: 'prod_001', name: 'Nước lọc 1.5L', sku: 'NL-1.5L', price: 15000, quantity_in_stock: 5000, unit_of_measure: 'chai', min_quantity_alert: 100 },
        { id: 'prod_002', name: 'Bánh mì', sku: 'BM-001', price: 25000, quantity_in_stock: 50, unit_of_measure: 'chiếc', min_quantity_alert: 10 },
        { id: 'prod_003', name: 'Phở', sku: 'PHO-001', price: 50000, quantity_in_stock: 30, unit_of_measure: 'bát', min_quantity_alert: 5 },
        { id: 'prod_004', name: 'Nước ngọt', sku: 'NN-001', price: 10000, quantity_in_stock: 100, unit_of_measure: 'lon', min_quantity_alert: 20 },
        { id: 'prod_005', name: 'Cà phê', sku: 'CF-001', price: 20000, quantity_in_stock: 40, unit_of_measure: 'ly', min_quantity_alert: 8 }
      ]
      setProducts(mockProducts)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.warn('fetchProducts fallback (outer catch). Reason:', message)
    }
  }

  const fetchCustomers = async () => {
    const user = authService.getCurrentUser()
    const storeId = user?.store_id || '1'

    try {
      const response = await apiClient.get('/customers', {
        params: { store_id: storeId }
      })
      const data = response.data.customers || response.data || []
      setCustomers(Array.isArray(data) ? data : [])
      return
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.warn('fetchCustomers fallback, using mock data. Reason:', message)
    }

    const mockCustomers = [
      {
        id: 'cust_001',
        store_id: storeId,
        name: 'Nguyễn Văn A',
        phone: '0912345678',
        email: 'a@gmail.com',
        address: '123 Đường ABC, TP HCM',
        type: 'individual',
        total_purchases: 9000000,
        created_at: '2024-01-01',
        total_debt: 0
      },
      {
        id: 'cust_002',
        store_id: storeId,
        name: 'Trần Thị B',
        phone: '0987654321',
        email: 'b@gmail.com',
        address: '456 Đường XYZ, TP HCM',
        type: 'individual',
        total_purchases: 9000000,
        created_at: '2024-01-05',
        total_debt: 0
      }
    ]
    setCustomers(mockCustomers)
  }

  const handleAddOrderItem = () => {
    if (!selectedProductId || !selectedQuantity) {
      alert(t('pleaseSelectProductAndQuantity'))
      return
    }

    const product = products.find(p => p.id === selectedProductId)
    if (!product) return

    const quantity = parseFloat(selectedQuantity)
    
    // Check inventory
    if (quantity > product.quantity_in_stock) {
      alert(`Không đủ hàng! Chỉ còn ${product.quantity_in_stock} ${product.unit_of_measure}`)
      return
    }

    // Check minimum quantity
    if (quantity < product.min_quantity_alert && quantity > 0) {
      const confirm = window.confirm(t('lowStockWarning').replace('{quantity}', quantity.toString()).replace('{min}', product.min_quantity_alert?.toString() || '0'))
      if (!confirm) return
    }

    const newItem: OrderItem = {
      product_id: product.id,
      product_name: product.name,
      quantity: quantity,
      unit: product.unit_of_measure || 'cái',
      unit_price: product.price,
    }

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    })
    
    setSelectedProductId('')
    setSelectedQuantity('')
  }

  const handleRemoveOrderItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * (item.price || item.unit_price || 0)), 0)
  }


  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customer_id) {
      alert(t('pleaseSelectCustomer'))
      return
    }

    if (formData.items.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm')
      return
    }

    // Kiểm tra địa chỉ nếu đơn hàng ở trạng thái vận chuyển
    const customer = customers.find(c => c.id === formData.customer_id)
    if ((formData.status === 'shipped' || formData.status === 'delivered') && !customer?.address) {
      alert(t('cannotShipNoAddress'))
      return
    }
    
    const user = authService.getCurrentUser()
    const storeId = user?.store_id || '1'
    const totalAmount = calculateTotal()

    // Auto-set status based on payment_status
    let orderStatus = formData.status
    if (formData.payment_status === 'paid') {
      // If paid, must be at least 'confirmed' or higher
      if (formData.status === 'pending' || formData.status === 'draft') {
        orderStatus = 'confirmed'
      }
    } else {
      // If not paid, set to draft (chưa thanh toán = đơn nháp)
      orderStatus = 'draft'
    }

    const postData = {
      customer_name: formData.customer_name,
      customer_id: formData.customer_id,
      order_type: 'counter',
      status: orderStatus,
      items: formData.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit: item.unit || 'cái',
        price: item.unit_price || item.price
      })),
      discount: 0,
      is_credit: false,
      payment_method: 'cash',
      payment_status: formData.payment_status || 'pending',
      notes: formData.note
    }

    // Optimistic UI: Add order to local state immediately
    const optimisticOrder: Order = {
      id: `local-${Date.now()}`,
      order_number: `#LOCAL-${orders.length + 1}`,
      customer_id: formData.customer_id,
      customer_name: formData.customer_name,
      total_amount: totalAmount,
      status: postData.status,
      created_at: new Date().toISOString(),
      note: formData.note,
      payment_status: postData.payment_status,
      payment_method: postData.payment_method,
      items: postData.items
    }

    try {
      const response = await apiClient.post('/orders', postData, {
        params: { store_id: storeId }
      })
      
      // Replace optimistic order with real order from API
      const createdOrder = response.data
      setOrders([createdOrder, ...orders])
      alert(t('successCreateOrder'))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.warn('Order POST failed, using optimistic order. Reason:', message)
      // Add optimistic order if API fails
      setOrders([optimisticOrder, ...orders])
      alert(t('successCreateOrder') + ' (Offline)')
    }

    setShowAddForm(false)
    setFormData({ customer_id: '', customer_name: '', status: 'pending', payment_status: 'pending', note: '', items: [] })
    
    await new Promise(resolve => setTimeout(resolve, 300))
    await fetchCustomers()
    await fetchProducts()  // Refresh product inventory after order creation
    // Don't refetch orders - we already have updated state
  }

  const handleDeleteOrder = async (id: string) => {
    if (!confirm(t('confirmDeleteOrder'))) return

    // Optimistic delete: Remove from UI immediately
    setOrders(current => current.filter(o => o.id !== id))

    // If using API data, try to delete from server but don't block UI
    if (ordersFromApi) {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'
      try {
        await apiClient.delete(`/orders/${id}`, {
          params: { store_id: storeId }
        })
        // Success - order already removed from UI
      } catch (deleteError: any) {
        const status = deleteError?.response?.status
        const detail = deleteError?.response?.data?.detail
        const message = deleteError?.message || 'Unknown error'
        console.warn('Delete order failed (UI already removed):', detail || (status ? `Error ${status}` : message))
        // Don't refetch - keep the optimistic delete
      }
    }
  }

  const handleEditOrder = async (order: Order) => {
    // Đảm bảo dữ liệu khách hàng mới nhất trước khi mở form
    await fetchCustomers()
    
    // Chờ một chút để setState hoàn tất
    await new Promise(resolve => setTimeout(resolve, 100))

    // Cố gắng tìm customer id theo order id hoặc tên (phòng trường hợp thiếu customer_id)
    const matchedCustomer = customers.find(c => c.id === order.customer_id)
      || customers.find(c => c.name === order.customer_name)

    setEditFormData({
      customer_id: matchedCustomer?.id || order.customer_id || '',
      customer_name: matchedCustomer?.name || order.customer_name,
      status: order.status,
      payment_status: order.payment_status || 'pending',
      note: order.note || '',
      items: []
    })
    setEditingId(order.id)
    setShowAddForm(false)  // Close add form if it was open
    setShowEditForm(true)
  }

  // Khi mở modal thêm/sửa, luôn tải lại danh sách khách để lấy địa chỉ mới nhất
  useEffect(() => {
    if (showAddForm || showEditForm) {
      fetchCustomers()
    }
  }, [showAddForm, showEditForm])

  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const items = order.items?.map((item, i) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${i + 1}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.product_name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${(item.unit_price || item.price || 0).toLocaleString()} ₫</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${(item.subtotal || item.quantity * (item.unit_price || item.price || 0)).toLocaleString()} ₫</td>
      </tr>
    `).join('') || ''

    const statusText = order.status === 'pending' ? t('Chờ xác nhận', 'Waiting for confirmation') : order.status === 'confirmed' ? t('Đã xác nhận', 'Confirmed') : order.status === 'shipped' ? t('Đã giao', 'Shipped') : t('Đã hoàn thành', 'Completed')
    const paymentText = order.payment_status === 'paid' ? `✓ ${t('Đã thanh toán', 'Paid')}` : `⏳ ${t('Chưa thanh toán', 'Unpaid')}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${t('Hóa Đơn', 'Invoice')} ${order.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; }
          .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-box { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background-color: #f0f0f0; padding: 10px; border: 1px solid #ddd; text-align: left; }
          td { padding: 8px; border: 1px solid #ddd; }
          .total-row { background-color: #f9f9f9; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${t('HÓA ĐƠN BÁN HÀNG', 'SALES INVOICE')}</h1>
          <p>${t('Mã', 'Order Number')}: ${order.order_number}</p>
        </div>

        <div class="info">
          <div class="info-box">
            <h3>${t('Khách Hàng', 'Customer')}</h3>
            <p><strong>${order.customer_name}</strong></p>
          </div>
          <div class="info-box">
            <h3>${t('Ngày Lập', 'Date Created')}</h3>
            <p>${settingsService.formatDate(order.created_at)}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th width="5%">${t('STT', 'No.')}</th>
              <th width="40%">${t('Sản Phẩm', 'Product')}</th>
              <th width="15%">${t('Số Lượng', 'Quantity')}</th>
              <th width="20%">${t('Đơn Giá', 'Unit Price')}</th>
              <th width="20%">${t('Thành Tiền', 'Amount')}</th>
            </tr>
          </thead>
          <tbody>
            ${items}
            <tr class="total-row">
              <td colspan="4" style="text-align: right;">${t('TỔNG CỘNG', 'TOTAL')}:</td>
              <td style="text-align: right;">${settingsService.formatCurrency(order.total_amount)}</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-bottom: 20px;">
          <p><strong>${t('Trạng Thái', 'Status')}:</strong> ${statusText}</p>
          <p><strong>${t('Thanh Toán', 'Payment')}:</strong> ${paymentText}</p>
          ${order.note ? `<p><strong>${t('Ghi Chú', 'Notes')}:</strong> ${order.note}</p>` : ''}
        </div>

        <div class="footer">
          <p>${t('Cảm ơn quý khách đã mua hàng', 'Thank you for your purchase')}!</p>
          <button class="no-print" onclick="window.print()" style="padding: 10px 20px; font-size: 14px;">${t('In Hóa Đơn', 'Print Invoice')}</button>
          <button class="no-print" onclick="window.close()" style="padding: 10px 20px; font-size: 14px; margin-left: 10px;">${t('Đóng', 'Close')}</button>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Kiểm tra địa chỉ nếu đơn hàng ở trạng thái vận chuyển
    const customer = customers.find(c => c.id === editFormData.customer_id)
    if ((editFormData.status === 'shipped' || editFormData.status === 'delivered') && !customer?.address) {
      alert(t('cannotShipNoAddress'))
      return
    }
    
    if (!editingId) return
    
    const updateData = {
      customer_id: editFormData.customer_id,
      customer_name: editFormData.customer_name,
      status: editFormData.payment_status === 'paid' ? editFormData.status : 'pending',
      payment_status: editFormData.payment_status,
      note: editFormData.note
    }
    
    // Optimistic update: Update local state immediately
    setOrders(prevOrders => prevOrders.map(order => 
      order.id === editingId 
        ? { ...order, ...updateData }
        : order
    ))
    
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'
      
      const response = await apiClient.put(`/orders/${editingId}`, updateData, {
        params: { store_id: storeId }
      })
      
      // Update with real data from API
      const updatedOrder = response.data
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === editingId 
          ? updatedOrder
          : order
      ))
      
      alert(t('successUpdateOrder'))
    } catch (error) {
      console.error('Failed to update order', error)
      // Revert optimistic update on error
      await fetchOrders()
      alert('Lỗi cập nhật đơn hàng: ' + (error instanceof Error ? error.message : 'Unknown error'))
      return
    }
    
    setShowEditForm(false)
    setEditingId(null)
    setEditFormData({ customer_id: '', customer_name: '', status: 'pending', payment_status: 'pending', note: '', items: [] })
    await new Promise(resolve => setTimeout(resolve, 300))
    await fetchCustomers()
    await fetchProducts()  // Refresh product inventory after order update
    // Don't refetch orders - we already have updated state
  }

  const getStatusBadge = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    }
    return statusMap[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('Quản lý Đơn Hàng', 'Order Management')}</h1>
        <Button 
          onClick={() => {
            setShowEditForm(false)
            setShowAddForm(true)
          }}
          size="md"
          className="rounded-full px-6 py-2.5"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">+</span>
            <span>{t('Tạo Đơn Hàng', 'Create Order')}</span>
          </span>
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {['', 'draft', 'confirmed', 'shipped', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filterStatus === status
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status === '' ? t('Tất Cả Đơn', 'All Orders') : 
             status === 'draft' ? t('Đơn Nháp', 'Draft Orders') :
             status === 'confirmed' ? t('Đã Xác Nhận', 'Confirmed Orders') :
             status === 'shipped' ? t('Đang Giao', 'Shipping Orders') :
             status === 'delivered' ? t('Đã Giao', 'Delivered Orders') : status}
          </button>
        ))}
      </div>

      {/* Add Order Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{t('createNewOrder')}</h2>
            <form onSubmit={handleAddOrder} className="space-y-4">
              {/* Customer Selection */}
              <div className="border-b pb-4">
                <label htmlFor="add-customer" className="block text-sm font-medium text-gray-700 mb-1">{t('customer')}</label>
                <select
                  id="add-customer"
                  value={formData.customer_id}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === e.target.value)
                    setFormData({ 
                      ...formData, 
                      customer_id: e.target.value,
                      customer_name: customer?.name || ''
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">{t('selectCustomer')}</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Selection */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-sm mb-3">{t('chooseProduct')}</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">{t('selectProduct')}</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.quantity_in_stock} {product.unit_of_measure})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder={t('quantity')}
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="1"
                    />
                    <button
                      type="button"
                      onClick={handleAddOrderItem}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      {t('addButton')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {formData.items.length > 0 && (
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-sm mb-2">{t('productsInOrder')}</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                        <span>{item.product_name}</span>
                        <span>{item.quantity} x {Number(item.price || item.unit_price || 0).toLocaleString()} ₫</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOrderItem(index)}
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 p-2 bg-blue-50 rounded font-semibold text-sm">
                    {t('totalAmount')}: {calculateTotal().toLocaleString()} ₫
                  </div>
                </div>
              )}

              {/* Status & Payment */}
              <div className="space-y-3 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('payment')}</label>
                  <select
                    value={formData.payment_status || 'pending'}
                    onChange={(e) => {
                      const newPaymentStatus = e.target.value
                      setFormData({ 
                        ...formData, 
                        payment_status: newPaymentStatus,
                        // Auto-adjust status when payment changes
                        status: newPaymentStatus === 'paid' ? 'confirmed' : 'draft'
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pending">{t('unpaidDraft')}</option>
                    <option value="paid">{t('paidStatus')}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="add-status" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('deliveryStatus')}
                    {formData.payment_status !== 'paid' && (
                      <span className="text-red-500 text-xs ml-2">({t('mustPayFirst')})</span>
                    )}
                    {formData.payment_status === 'paid' && !customers.find(c => c.id === formData.customer_id)?.address && (
                      <span className="text-red-500 text-xs ml-2">({t('needAddressToDeliver')})</span>
                    )}
                  </label>
                  {formData.payment_status !== 'paid' ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
                      {t('awaitingPayment')}
                    </div>
                  ) : (
                    <select
                      id="add-status"
                      name="status"
                      value={formData.status}
                      onChange={(e) => {
                        const newStatus = e.target.value
                        const hasAddress = customers.find(c => c.id === formData.customer_id)?.address
                        
                        // Block shipped/delivered nếu không có địa chỉ
                        if ((newStatus === 'shipped' || newStatus === 'delivered') && !hasAddress) {
                          alert(t('noAddressForShipping'))
                          return
                        }
                        
                        setFormData({ ...formData, status: newStatus })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="confirmed">{t('confirmed')}</option>
                      <option value="shipped" disabled={!customers.find(c => c.id === formData.customer_id)?.address}>
                        {t('shipped')} {!customers.find(c => c.id === formData.customer_id)?.address ? t('needsAddress') : ''}
                      </option>
                      <option value="delivered" disabled={!customers.find(c => c.id === formData.customer_id)?.address}>
                        {t('delivered')} {!customers.find(c => c.id === formData.customer_id)?.address ? t('needsAddress') : ''}
                      </option>
                    </select>
                  )}
                </div>
                <div>
                  <label htmlFor="add-note" className="block text-sm font-medium text-gray-700 mb-1">{t('notes')}</label>
                  <textarea
                    id="add-note"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">
                  {t('createOrderButton')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('orderCode')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('customerName')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('totalAmount')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('statusLabel')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('paymentStatus')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('createdDate')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders
              .filter(order => !filterStatus || order.status === filterStatus)
              .map((order, index) => {
              const orderKey = order.id || order.order_number || `order-${index}`
              const isExpanded = expandedOrderId === orderKey

              return (
                <Fragment key={orderKey}>
                <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedOrderId(isExpanded ? null : orderKey)}>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">
                    <div className="flex items-center gap-2">
                      <span>{isExpanded ? '▼' : '▶'}</span>
                      {order.order_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.customer_name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    {settingsService.formatCurrency(Number(order.total_amount))}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {order.payment_status !== 'paid' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        {t('unpaid')}
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                        {order.status === 'delivered' ? t('delivered') :
                         order.status === 'shipped' ? t('shipped') :
                         order.status === 'confirmed' ? t('confirmed') :
                         order.status === 'pending' ? t('pending') :
                         order.status === 'draft' ? t('draft') : order.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.payment_status === 'paid' ? t('paid') : t('unpaid')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => handlePrintOrder(order)}>🖨️ {t('print')}</Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditOrder(order)}>{t('edit')}</Button>
                    <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDeleteOrder(order.id)}>{t('delete')}</Button>
                  </td>
                </tr>
                
                {/* Products Details Row */}
                {isExpanded && (
                  <tr className="bg-blue-50">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-700">Sản Phẩm Đã Đặt:</h4>
                        <div className="space-y-2">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white p-3 rounded border border-blue-200">
                                <div className="flex-1">
                                  <span className="font-medium text-gray-800">{item.product_name}</span>
                                </div>
                                <div className="flex gap-6">
                                  <div className="text-right">
                                    <div className="text-xs text-gray-600">Số lượng</div>
                                    <div className="font-semibold text-gray-900">{item.quantity}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-gray-600">Giá</div>
                                    <div className="font-semibold text-gray-900">{Number(item.unit_price || item.price || 0).toLocaleString()} ₫</div>
                                  </div>
                                  <div className="text-right min-w-[100px]">
                                    <div className="text-xs text-gray-600">Thành tiền</div>
                                    <div className="font-semibold text-blue-600">{Number(item.subtotal || (item.quantity * (item.unit_price || item.price || 0))).toLocaleString()} ₫</div>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 text-sm italic">Không có sản phẩm</div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                
                {/* Notes Row */}
                {order.note && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-6 py-3">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-semibold text-gray-700 uppercase pt-1">Ghi Chú:</span>
                        <span className="text-sm text-gray-700 flex-1">{order.note}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Order Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Sửa Đơn Hàng</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label htmlFor="edit-customer" className="block text-sm font-medium text-gray-700 mb-1">Khách Hàng</label>
                <select
                  id="edit-customer"
                  value={editFormData.customer_id}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === e.target.value)
                    setEditFormData({ 
                      ...editFormData, 
                      customer_id: e.target.value,
                      customer_name: customer?.name || ''
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">{t('selectCustomer')}</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.phone ? `(${customer.phone})` : ''}
                    </option>
                  ))}
                </select>
                {editFormData.customer_id && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <strong>Địa chỉ:</strong> {customers.find(c => c.id === editFormData.customer_id)?.address || '(Chưa có)'}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thanh Toán</label>
                <select
                  value={editFormData.payment_status || 'pending'}
                  onChange={(e) => setEditFormData({ ...editFormData, payment_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="pending">{t('Chưa Thanh Toán', 'Unpaid')}</option>
                  <option value="paid">{t('Đã Thanh Toán', 'Paid')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng Thái Vận Chuyển
                  {editFormData.payment_status !== 'paid' && (
                    <span className="text-red-500 text-xs ml-2">(Phải thanh toán trước)</span>
                  )}
                  {editFormData.payment_status === 'paid' && !customers.find(c => c.id === editFormData.customer_id)?.address && (
                    <span className="text-red-500 text-xs ml-2">(Cần địa chỉ khách để giao hàng)</span>
                  )}
                </label>
                {editFormData.payment_status !== 'paid' ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600">
                    Chờ Thanh Toán
                  </div>
                ) : (
                  <select
                    id="edit-status"
                    name="status"
                    value={editFormData.status}
                    onChange={(e) => {
                      const newStatus = e.target.value
                      const hasAddress = customers.find(c => c.id === editFormData.customer_id)?.address
                      
                      // Block shipped/delivered nếu không có địa chỉ
                      if ((newStatus === 'shipped' || newStatus === 'delivered') && !hasAddress) {
                        alert('⚠️ Khách hàng chưa có địa chỉ giao hàng!\nVui lòng cập nhật địa chỉ trước khi chuyển sang trạng thái vận chuyển.')
                        return
                      }
                      
                      setEditFormData({ ...editFormData, status: newStatus })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pending">{t('pending')}</option>
                    <option value="confirmed">{t('confirmed')}</option>
                    <option value="shipped" disabled={!customers.find(c => c.id === editFormData.customer_id)?.address}>
                      {t('shipped')} {!customers.find(c => c.id === editFormData.customer_id)?.address ? '(cần địa chỉ)' : ''}
                    </option>
                    <option value="delivered" disabled={!customers.find(c => c.id === editFormData.customer_id)?.address}>
                      {t('delivered')} {!customers.find(c => c.id === editFormData.customer_id)?.address ? '(cần địa chỉ)' : ''}
                    </option>
                  </select>
                )}
              </div>
              <div>
                <label htmlFor="edit-note" className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                <textarea
                  id="edit-note"
                  value={editFormData.note}
                  onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium">
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

