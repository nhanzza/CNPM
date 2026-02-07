'use client'

import { useState, useEffect, useRef } from 'react'
import apiClient from '@/services/api.service'
import { authService } from '@/services/auth.service'
import { settingsService } from '@/services/settings.service'
import { Bot } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestedOrder?: any
}

interface DraftOrder {
  id: string
  items: Array<{
    product_id: string
    product_name: string
    quantity: number
    unit: string
  }>
  customer_name: string
  customer_phone?: string
  total_amount: number
  notes?: string
  created_at: string
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [draftOrders, setDraftOrders] = useState<DraftOrder[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageCountRef = useRef(0)
  const [settings] = useState(settingsService.getSettings())
  const t = (vi: string, en: string) => (settings.language === 'en' ? en : vi)

  useEffect(() => {
    fetchProducts()
    // Add welcome message
    messageCountRef.current = 1
    setMessages([{
      id: `msg_0`,
      role: 'assistant',
      content: t(
        'Xin chào! 👋 Tôi là trợ lý AI của BizFlow. Tôi có thể giúp bạn:\n\n✅ Tạo đơn hàng từ text ("bán 2 bánh mì + 3 nước cho khách Hương")\n✅ Xem gợi ý sản phẩm bán chạy\n✅ Kiểm tra tồn kho\n✅ Cộng tính tiền tự động\n\nHãy nói tôi muốn bán gì!',
        'Hello! 👋 I\'m BizFlow\'s AI assistant. I can help you:\n\n✅ Create orders from text ("sell 2 bread + 3 drinks for customer Huong")\n✅ View top-selling products\n✅ Check inventory\n✅ Auto-calculate totals\n\nTell me what you want to sell!'
      ),
      timestamp: new Date()
    }])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchProducts = async () => {
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id
      if (!storeId) {
        setProducts([])
        console.warn('Missing store_id for product fetch')
        return []
      }
      const res = await apiClient.get('/products', { params: { store_id: storeId } })
      const data = res.data.products || res.data || []
      const updatedProducts = Array.isArray(data) ? data : []

      setProducts(updatedProducts)
      return updatedProducts
    } catch (error) {
      console.error('Failed to fetch products', error)
      return []
    }
  }

  const parseOrderFromText = (text: string, productList: any[] = products): DraftOrder | null => {
    // Simple NLP parsing for Vietnamese text
    // Pattern: "X [sản phẩm/product name] + Y [sản phẩm] cho [customer name]"

    try {
      const normalizeText = (value: string) =>
        value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, ' ')
          .trim()

      const numberWords: Record<string, string> = {
        'mot': '1',
        'một': '1',
        'hai': '2',
        'ba': '3',
        'bon': '4',
        'bốn': '4',
        'tu': '4',
        'tư': '4',
        'nam': '5',
        'năm': '5',
        'sau': '6',
        'sáu': '6',
        'bay': '7',
        'bảy': '7',
        'tam': '8',
        'tám': '8',
        'chin': '9',
        'chín': '9',
        'muoi': '10',
        'mười': '10'
      }

      let orderText = text.toLowerCase().trim()
      Object.entries(numberWords).forEach(([word, number]) => {
        const wordRegex = new RegExp(`\\b${word}\\b`, 'g')
        orderText = orderText.replace(wordRegex, number)
      })
      const items = []
      let total = 0
      let customerName = 'Khách'

      // Extract customer name if exists (look for "cho [name]" pattern)
      const customerMatch = orderText.match(/cho\s+([^+]+?)(?:\s*$|\s*\+)/i)
      if (customerMatch) {
        customerName = customerMatch[1].trim().replace(/[,.]$/, '')
        orderText = orderText.replace(customerMatch[0], '')
      }

      // Parse quantities and product names
      // More flexible regex: "number + any text until + or end"
      const itemPattern = /(\d+)\s+([^+]+?)(?:\s*\+|$)/g

      let match
      while ((match = itemPattern.exec(orderText)) !== null) {
        const quantity = parseInt(match[1])
        const productText = match[2].trim()
        const normalizedProductText = normalizeText(productText)

        // Find matching product in database using fuzzy matching
        let matchedProduct = null

        // First try exact substring match
        matchedProduct = productList.find(p =>
          normalizedProductText.includes(normalizeText(p.name)) ||
          normalizeText(p.name).includes(normalizedProductText)
        )

        // If no exact match, try partial word matching
        if (!matchedProduct) {
          const words = normalizedProductText.split(/\s+/)
          matchedProduct = productList.find(p => {
            const productWords = normalizeText(p.name).split(/\s+/)
            return words.some(w => productWords.some((pw: string) => pw.includes(w) || w.includes(pw)))
          })
        }

        if (matchedProduct) {
          items.push({
            product_id: matchedProduct.id,
            product_name: matchedProduct.name,
            quantity: quantity,
            unit: matchedProduct.unit_of_measure || 'cái'
          })
          total += quantity * matchedProduct.price
        }
      }

      if (items.length === 0) {
        return null
      }

      const draftOrder: DraftOrder = {
        id: `draft_${messageCountRef.current++}`,
        items,
        customer_name: customerName,
        total_amount: total,
        created_at: new Date().toISOString()
      }

      return draftOrder
    } catch (error) {
      console.error('Parse error:', error)
      return null
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: `msg_${messageCountRef.current++}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages([...messages, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      const latestProducts = await fetchProducts()
      // Try to parse as order
      const draftOrder = parseOrderFromText(inputValue, latestProducts)

      if (draftOrder) {
        // Successfully parsed an order
        setDraftOrders([draftOrder, ...draftOrders])

        const itemsList = draftOrder.items
          .map(item => `${item.quantity} ${item.product_name}`)
          .join(' + ')

        const assistantMessage: Message = {
          id: `msg_${messageCountRef.current++}`,
          role: 'assistant',
          content: t(
            `✅ Tôi đã tạo đơn hàng nháp:\n\n📋 **Đơn Hàng #${draftOrder.id.slice(-6)}**\n👤 Khách: **${draftOrder.customer_name}**\n📦 Sản phẩm: ${itemsList}\n💰 Tổng tiền: **${settingsService.formatCurrency(draftOrder.total_amount)}**\n\nBạn có thể xem và chỉnh sửa đơn hàng dưới đây hoặc nói thêm để thêm sản phẩm!`,
            `✅ Draft order created:\n\n📋 **Order #${draftOrder.id.slice(-6)}**\n👤 Customer: **${draftOrder.customer_name}**\n📦 Products: ${itemsList}\n💰 Total: **${settingsService.formatCurrency(draftOrder.total_amount)}**\n\nYou can view and edit the order below or tell me more to add products!`
          ),
          timestamp: new Date(),
          suggestedOrder: draftOrder
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        // General response
        const storeStats = {
          totalProducts: latestProducts.length,
          topProducts: latestProducts.slice(0, 3).map(p => `${p.name} (${p.quantity_in_stock} ${p.unit_of_measure})`).join(', '),
          outOfStock: latestProducts.filter(p => p.quantity_in_stock === 0).length
        }

        const responses: { [key: string]: string } = {
          'hết': t(
            `📊 Sản phẩm hết hàng: ${storeStats.outOfStock}\n\nDanh sách: ${latestProducts.filter(p => p.quantity_in_stock === 0).map(p => p.name).join(', ') || 'Không có'}`,
            `📊 Out of stock: ${storeStats.outOfStock}\n\nList: ${latestProducts.filter(p => p.quantity_in_stock === 0).map(p => p.name).join(', ') || 'None'}`
          ),
          'hàng': t(
            `📦 Tồn kho hiện tại:\n\n${latestProducts.slice(0, 5).map(p => `• ${p.name}: ${p.quantity_in_stock} ${p.unit_of_measure}`).join('\n')}`,
            `📦 Current stock:\n\n${latestProducts.slice(0, 5).map(p => `• ${p.name}: ${p.quantity_in_stock} ${p.unit_of_measure}`).join('\n')}`
          ),
          'cộng tính tiền': t(
            `💰 Tính tiền tự động đã sẵn sàng!\n\nChỉ cần nói: "Bán 2 bánh mì + 3 nước cho khách Hương"\n\nTôi sẽ tự động:\n✅ Tìm sản phẩm\n✅ Tính tổng tiền\n✅ Tạo đơn hàng nháp\n\nThử ngay!`,
            `💰 Auto-calculate is ready!\n\nJust say: "Sell 2 bread + 3 drinks for Huong"\n\nI will automatically:\n✅ Find products\n✅ Calculate total\n✅ Create draft order\n\nTry now!`
          ),
          'bán chạy': t(
            `🔥 Top sản phẩm bán chạy:\n\n${storeStats.topProducts}`,
            `🔥 Top selling products:\n\n${storeStats.topProducts}`
          ),
          'giúp': t(
            `👋 Tôi có thể:\n\n1. **Tạo đơn hàng**: "2 bánh mì + 3 nước cho Hương"\n2. **Xem tồn kho**: "Còn bao nhiêu hàng?"\n3. **Tính tiền**: "Tính tiền 5 bánh + 2 nước"\n4. **Sản phẩm bán chạy**: "Hàng bán chạy?"\n\nCứ nói thoải mái!`,
            `👋 I can:\n\n1. **Create order**: "2 bread + 3 drinks for Huong"\n2. **Check stock**: "How much stock?"\n3. **Calculate**: "Calculate 5 bread + 2 drinks"\n4. **Top products**: "Best sellers?"\n\nFeel free to ask!`
          ),
          'default': t(
            `🤖 Tôi chưa hiểu rõ. Bạn có muốn:\n• Tạo đơn hàng mới? (Nói: "2 bánh + 3 nước cho [tên khách]")\n• Xem tồn kho? (Nói: "Còn bao nhiêu hàng?")\n• Xem sản phẩm bán chạy? (Nói: "Bán chạy?")\n\nHoặc gợi ý: Nói lại rõ hơn nhé!`,
            `🤖 I don't understand. Do you want to:\n• Create new order? (Say: "2 bread + 3 drinks for [customer name]")\n• Check stock? (Say: "How much stock?")\n• See best sellers? (Say: "Best sellers?")\n\nOr: Please clarify!`
          )
        }

        let responseText = responses['default']
        for (const [key, value] of Object.entries(responses)) {
          if (key !== 'default' && inputValue.toLowerCase().includes(key)) {
            responseText = value
            break
          }
        }

        const assistantMessage: Message = {
          id: `msg_${messageCountRef.current++}`,
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: `msg_${messageCountRef.current++}`,
        role: 'assistant',
        content: t('❌ Có lỗi xảy ra. Vui lòng thử lại!', '❌ An error occurred. Please try again!'),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = async (draft: DraftOrder) => {
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id
      if (!storeId) {
        const errorMessage: Message = {
          id: `msg_${messageCountRef.current++}`,
          role: 'assistant',
          content: t(
            '❌ Không tìm thấy cửa hàng của bạn. Vui lòng đăng nhập lại để tạo đơn hàng.',
            '❌ Store not found. Please log in again to create orders.'
          ),
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        return
      }

      // Transform items to match backend schema (only product_id, quantity, unit)
      const orderItems = draft.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit: item.unit
      }))

      await apiClient.post('/orders', {
        customer_name: draft.customer_name,
        items: orderItems,
        order_type: 'counter',
        payment_status: 'pending',
        payment_method: 'cash',
        notes: `Tạo từ AI chatbot`
      }, { params: { store_id: storeId } })

      setDraftOrders(draftOrders.filter(o => o.id !== draft.id))

      const confirmMessage: Message = {
        id: `msg_${messageCountRef.current++}`,
        role: 'assistant',
        content: t(
          `✅ Đã lưu đơn hàng cho **${draft.customer_name}**! Tổng: **${settingsService.formatCurrency(draft.total_amount)}**\n\n📲 Bạn có thể tiếp tục tạo đơn hàng mới hoặc tôi có thể giúp gì?`,
          `✅ Order saved for **${draft.customer_name}**! Total: **${settingsService.formatCurrency(draft.total_amount)}**\n\n📲 You can continue creating new orders or how can I help?`
        ),
        timestamp: new Date()
      }

      setMessages(prev => [...prev, confirmMessage])
    } catch (error) {
      console.error('Failed to create order', error)
      alert('Lỗi lưu đơn hàng: ' + (error instanceof Error ? error.message : 'Unknown'))
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-7 h-7" />
            {t('AI Chatbot - Hỗ Trợ Đơn Hàng', 'AI Chatbot - Order Assistant')}
          </h1>
          <p className="text-sm opacity-90">
            {t('Nói cho tôi muốn bán gì, tôi sẽ tạo đơn hàng tự động', 'Tell me what you want to sell, I\'ll create orders automatically')}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-md px-4 py-3 rounded-lg ${msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                {msg.suggestedOrder && (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded p-3 text-xs">
                    <p className="font-semibold text-gray-700 mb-2">
                      {t('📦 Đơn Hàng Nháp:', '📦 Draft Order:')}
                    </p>
                    {msg.suggestedOrder.items.map((item: any, i: number) => (
                      <p key={i} className="text-gray-600">
                        • {item.quantity} {item.product_name}
                      </p>
                    ))}
                    <p className="font-bold text-indigo-600 mt-2">
                      {t('Tổng:', 'Total:')} {settingsService.formatCurrency(msg.suggestedOrder.total_amount)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-lg rounded-bl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          {/* Quick Action Buttons */}
          <div className="flex gap-2 mb-3 overflow-x-auto">
            <button
              onClick={() => {
                setInputValue('Còn bao nhiêu hàng?')
                setTimeout(() => handleSendMessage(), 100)
              }}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs whitespace-nowrap"
            >
              {t('Còn bao nhiêu hàng?', 'How much stock?')}
            </button>
            <button
              onClick={() => {
                setInputValue('Cộng tính tiền tự động')
                setTimeout(() => handleSendMessage(), 100)
              }}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs whitespace-nowrap"
            >
              {t('Cộng tính tiền tự động', 'Auto-calculate total')}
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={t('Ví dụ: 2 bánh mì + 3 nước cho khách Hương', 'Example: 2 bread + 3 drinks for customer Huong')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {t('📤 Gửi', '📤 Send')}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t('💡 Gợi ý: "bán chạy?", "hết hàng?", "tính tiền", "giúp"', '💡 Hints: "best sellers?", "out of stock?", "calculate", "help"')}
          </p>
        </div>
      </div>

      {/* Draft Orders Sidebar */}
      {draftOrders.length > 0 && (
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 bg-yellow-50 border-b border-yellow-200">
            <h2 className="font-bold text-yellow-800">
              {t(`📋 Đơn Nháp (${draftOrders.length})`, `📋 Draft Orders (${draftOrders.length})`)}
            </h2>
            <p className="text-xs text-yellow-700">
              {t('Nhấn "Tạo" để lưu đơn hàng', 'Click "Create" to save order')}
            </p>
          </div>

          <div className="p-4 space-y-3">
            {draftOrders.map(order => (
              <div key={order.id} className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="font-semibold text-sm">{order.customer_name}</p>
                <div className="mt-2 text-xs space-y-1">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-gray-600">
                      {item.quantity} {item.product_name}
                    </p>
                  ))}
                </div>
                <p className="font-bold text-indigo-600 mt-2">
                  {settingsService.formatCurrency(order.total_amount)}
                </p>
                <button
                  onClick={() => handleCreateOrder(order)}
                  className="w-full mt-3 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 font-medium"
                >
                  {t('✅ Tạo Đơn Hàng', '✅ Create Order')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
