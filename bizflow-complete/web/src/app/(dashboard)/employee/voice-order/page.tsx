'use client'

import { useState, useEffect, useRef } from 'react'
import apiClient from '@/services/api.service'
import { authService } from '@/services/auth.service'
import { settingsService } from '@/services/settings.service'
import { Mic, Lightbulb, Check, Trash2, Square } from 'lucide-react'

interface VoiceOrder {
  id: string
  text: string
  status: 'listening' | 'processing' | 'completed' | 'error'
  confidence: number
  items: Array<{
    product_name: string
    quantity: number
  }>
  customer_name: string
  created_at: Date
}

export default function VoiceOrderPage() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [voiceOrders, setVoiceOrders] = useState<VoiceOrder[]>([])
  const [products, setProducts] = useState<any[]>([])
  const recognitionRef = useRef<any>(null)
  const voiceOrderCountRef = useRef(0)
  const [browserSupport, setBrowserSupport] = useState(true)
  const [settings] = useState(settingsService.getSettings())
  const t = (vi: string, en: string) => (settings.language === 'en' ? en : vi)

  useEffect(() => {
    // Check browser support for Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setBrowserSupport(false)
      return
    }

    recognitionRef.current = new SpeechRecognition()
    
    // CRITICAL: Set Vietnamese language
    recognitionRef.current.lang = 'vi-VN'
    recognitionRef.current.language = 'vi-VN'
    
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.maxAlternatives = 1

    recognitionRef.current.onstart = () => {
      console.log('🎤 Speech Recognition Started - Language:', recognitionRef.current.lang)
      setIsListening(true)
      setTranscript('')
    }

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        const confidence = event.results[i][0].confidence
        
        console.log(`Speech result [${i}]: "${transcript}" (confidence: ${confidence?.toFixed(2) || 'N/A'})`)
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }
      
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript)
      }
    }

    recognitionRef.current.onerror = (event: any) => {
      console.warn('Speech Recognition Error:', event.error)
      if (event.error === 'no-speech') {
        console.warn('No speech detected')
      } else if (event.error === 'language-not-supported') {
        alert('⚠️ Trình duyệt không hỗ trợ tiếng Việt. Vui lòng dùng Google Chrome!')
      }
      setIsListening(false)
    }

    recognitionRef.current.onend = () => {
      console.log('🛑 Speech Recognition Ended')
      setIsListening(false)
    }

    fetchProducts()

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const fetchProducts = async () => {
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'
      const res = await apiClient.get('/products', { params: { store_id: storeId } })
      setProducts(res.data.products || res.data || [])
    } catch (error) {
      console.warn('Failed to fetch products', error)
    }
  }

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('')
      
      // CRITICAL: Force Vietnamese language before each start
      recognitionRef.current.lang = 'vi-VN'
      recognitionRef.current.language = 'vi-VN'
      
      console.log('▶️ Starting speech recognition with language:', recognitionRef.current.lang)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Normalize string for fuzzy Vietnamese matching (accents/number words)
  const normalize = (value: string) => {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const replaceNumberWords = (value: string) => {
    const mapping: Record<string, string> = {
      'mot': '1', 'moot': '1', 'một': '1',
      'hai': '2',
      'ba': '3',
      'bon': '4', 'bốn': '4', 'tu': '4', 'tư': '4',
      'nam': '5', 'năm': '5',
      'sau': '6', 'sáu': '6',
      'bay': '7', 'bảy': '7',
      'tam': '8', 'tám': '8',
      'chin': '9', 'chín': '9',
      'muoi': '10', 'mười': '10'
    }

    let replaced = value
    Object.entries(mapping).forEach(([word, digit]) => {
      const pattern = new RegExp(`\\b${word}\\b`, 'gi')
      replaced = replaced.replace(pattern, digit)
    })
    return replaced
  }

  // Convert spoken separators like "cộng", "và", "," to '+' so we can split items
  const normalizeSeparators = (value: string) => {
    return value.replace(/\s+(cong|cộng|va|và|voi|với|plus|,)\s+/gi, ' + ')
  }

  const parseVoiceOrder = (text: string): VoiceOrder | null => {
    try {
      const order: VoiceOrder = {
        id: `voice_${voiceOrderCountRef.current++}`,
        text: text,
        status: 'completed',
        confidence: 0.85,
        items: [],
        customer_name: 'Khách',
        created_at: new Date()
      }

      const normalizedText = normalizeSeparators(replaceNumberWords(normalize(text)))

      // Extract customer name (after "cho ...") using normalized text
      const customerMatch = normalizedText.match(/cho\s+([a-z0-9\s]+)/i)
      if (customerMatch) {
        order.customer_name = customerMatch[1].trim()
      }

      // Only parse the part before "cho ..." to avoid swallowing customer name into items
      const itemsPart = normalizedText.split(/\bcho\b/)[0] || normalizedText

      // Split by '+' (or normalized separators) and parse each chunk
      const segments = itemsPart
        .split('+')
        .map(segment => segment.trim())
        .filter(Boolean)

      let foundCount = 0

      segments.forEach(segment => {
        const match = segment.match(/^(\d+)\s+(.+)$/)
        if (!match) {
          console.warn('Segment does not match pattern:', segment)
          return
        }

        const quantity = parseInt(match[1])
        const productName = match[2].trim()
        const normalizedProductName = normalize(productName)

        console.log(`Parsing: quantity=${quantity}, productName="${productName}", normalized="${normalizedProductName}"`)
        console.log('Available products:', products.map(p => ({ name: p.name, normalized: normalize(p.name) })))

        const product = products.find(p => {
          const normalizedProduct = normalize(p.name)
          const matches = normalizedProduct.includes(normalizedProductName) || normalizedProductName.includes(normalizedProduct)
          console.log(`  Check "${normalizedProduct}" vs "${normalizedProductName}": ${matches}`)
          return matches
        })

        if (product) {
          order.items.push({
            product_name: product.name,
            quantity: quantity
          })
          foundCount++
          console.log(`✓ Found product: ${product.name}`)
        } else {
          console.warn(`✗ Product not found for: ${productName}`)
        }
      })

      return foundCount > 0 ? order : null
    } catch (error) {
      console.warn('Parse error:', error)
      return null
    }
  }

  const handleProcessOrder = async () => {
    if (!transcript.trim()) {
      alert('Vui lòng nói đơn hàng trước')
      return
    }

    const order = parseVoiceOrder(transcript)
    if (order) {
      setTranscript('')
      // Tự động gọi API tạo đơn ngay (giống AI chatbot)
      try {
        await handleCreateOrder(order)
      } catch (error) {
        console.warn('Auto create failed, showing draft:', error)
        // Nếu lỗi, hiển thị nháp để bấm lại
        setVoiceOrders([order, ...voiceOrders])
      }
    } else {
      alert('❌ Không thể nhận diện đơn hàng. Hãy nói rõ: "số lượng + tên sản phẩm + tên khách"')
    }
  }

  const handleCreateOrder = async (order: VoiceOrder) => {
    try {
      const user = authService.getCurrentUser()
      const storeId = user?.store_id || '1'

      const items = order.items.map(item => {
        const product = products.find(p => p.name === item.product_name)
        return {
          product_id: product?.id || '',
          quantity: item.quantity,
          unit: 'cái',
          price: product?.price || 0
        }
      })

      const payload = {
        customer_name: order.customer_name,
        items: items,
        payment_status: 'pending',
        status: 'draft',
        notes: `Tạo từ voice order: "${order.text}"`,
        order_type: 'counter',
        is_credit: false,
        payment_method: 'cash',
        discount: 0.0
      }

      console.log('Creating order:', payload)
      console.log('Store ID:', storeId)
      await apiClient.post('/orders', payload, {
        params: { store_id: storeId }
      })

      setVoiceOrders(voiceOrders.filter(o => o.id !== order.id))
      alert(`✅ Lưu đơn hàng thành công cho ${order.customer_name} - ${order.items.length} sản phẩm!`)
    } catch (error: any) {
      console.error('Failed to create order', error)
      console.error('Response data:', error?.response?.data)
      const errorDetail = error?.response?.data?.detail || error?.message || 'Lỗi không xác định'
      console.error('Error detail:', errorDetail)
      alert(`❌ Lỗi lưu đơn hàng: ${errorDetail}`)
      throw error
    }
  }

  if (!browserSupport) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-2">
            {t('❌ Trình Duyệt Không Hỗ Trợ', '❌ Browser Not Supported')}
          </h2>
          <p className="text-red-700">
            {t(
              'Tính năng nhận diện giọng nói yêu cầu trình duyệt hỗ trợ Web Speech API (Chrome, Edge, Safari)',
              'Voice recognition requires a browser that supports Web Speech API (Chrome, Edge, Safari)'
            )}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Mic className="w-9 h-9" />
            {t('Voice Order - Tạo Đơn Bằng Giọng Nói', 'Voice Order - Create Orders by Voice')}
          </h1>
          <p className="mt-2 text-blue-100">
            {t('Nói vào microphone để tạo đơn hàng nhanh chóng', 'Speak into the microphone to create orders quickly')}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Voice Input Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Mic className="w-6 h-6 text-blue-600" />
            {t('Nhập Giọng Nói', 'Voice Input')}
          </h2>

          {/* Microphone Status */}
          <div className={`p-6 rounded-xl mb-6 border-2 ${
            isListening ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isListening ? 'text-red-700' : 'text-blue-700'}`}>
                  {isListening ? t('🔴 Đang Nghe', '🔴 Listening') : t('🔵 Sẵn Sàng', '🔵 Ready')}
                </p>
                <p className="text-lg font-semibold mt-1">
                  {transcript || t('(Bắt đầu nói...)', '(Start speaking...)')}
                </p>
              </div>
              {isListening && (
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-100"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-200"></div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              {t('Ví Dụ Lệnh:', 'Example Commands:')}
            </p>
            <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
              <li>{t('"Bán 2 bánh mì + 3 nước lọc cho khách Hương"', '"Sell 2 bread + 3 water for customer Huong"')}</li>
              <li>{t('"1 bánh + 2 nước cho anh Toàn"', '"1 bread + 2 drinks for Mr. Toan"')}</li>
              <li>{t('"3 bánh mì cho chị Lan"', '"3 bread for Ms. Lan"')}</li>
            </ul>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!isListening ? (
              <button
                onClick={startListening}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold text-lg flex items-center gap-2"
              >
                <Mic className="w-5 h-5" />
                {t('Bắt Đầu Nghe', 'Start Listening')}
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-bold text-lg flex items-center gap-2"
              >
                <Square className="w-5 h-5" />
                {t('Dừng', 'Stop')}
              </button>
            )}

            <button
              onClick={handleProcessOrder}
              disabled={!transcript}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              {t('Tạo Nháp Đơn', 'Create Draft')}
            </button>

            <button
              onClick={() => setTranscript('')}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-bold flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              {t('Xóa', 'Clear')}
            </button>
          </div>
        </div>

        {/* Draft Orders */}
        {voiceOrders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {t(`📋 Đơn Nháp (${voiceOrders.length})`, `📋 Draft Orders (${voiceOrders.length})`)}
            </h2>

            <div className="space-y-4">
              {voiceOrders.map(order => (
                <div key={order.id} className="border-2 border-yellow-300 rounded-lg p-6 bg-yellow-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-lg font-bold text-gray-900">{order.customer_name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        🎙️ "{order.text}"
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        🎯 {t('Độ chính xác:', 'Accuracy:')} {(order.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {order.items.length} {t('sản phẩm', 'products')}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="bg-white rounded p-4 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-600">{item.quantity} {t('cái', 'pcs')}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCreateOrder(order)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                    >
                      {t('✅ Lưu Đơn Hàng', '✅ Save Order')}
                    </button>
                    <button
                      onClick={() => setVoiceOrders(voiceOrders.filter(o => o.id !== order.id))}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            {t('Mẹo Sử Dụng:', 'Usage Tips:')}
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>{t('Nói chậm và rõ ràng để nhận diện chính xác', 'Speak slowly and clearly for accurate recognition')}</li>
            <li>{t('Luôn kết thúc với tên khách ("cho [tên khách]")', 'Always end with customer name ("for [customer name]")')}</li>
            <li>{t('Dùng dấu "+" để phân tách sản phẩm hoặc nói "cộng"', 'Use "+" to separate products or say "plus"')}</li>
            <li>{t('Nếu hệ thống không hiểu, hãy nói lại hoặc sử dụng AI Chatbot', 'If system doesn\'t understand, repeat or use AI Chatbot')}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
