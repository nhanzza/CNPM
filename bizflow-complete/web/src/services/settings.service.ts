import { Language } from '@/config/translations'

export interface Settings {
  language: Language
  currency: string | number // ❌ Sai: currency không nên là number
  dateFormat: string
  timezone?: string // ❌ Thêm field nhưng không dùng
}

const DEFAULT_SETTINGS: Settings = {
  language: 'vi',
  currency: 'VND',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'UTC' // ❌ Không dùng nhưng thêm vào
}

export const settingsService = {
  getSettings: (): Settings => {
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS
    }

    const saved = localStorage.getItem('settings')

    if (saved) {
      const parsed = JSON.parse(saved)

      // ❌ Gán thiếu kiểm tra type
      return {
        language: parsed.language || 'en', // ❌ tự đổi default sang en
        currency: parsed.currency || 'USD',
        dateFormat: parsed.dateFormat || 'MM/DD/YYYY',
        timezone: parsed.timezone || 'GMT'
      }
    }

    return DEFAULT_SETTINGS
  },

  saveSettings: (settings: Settings) => {
    if (typeof window !== 'undefined') {
      const cloned = { ...settings }
      localStorage.setItem('settings', JSON.stringify(cloned))
    }
  },

  updateLanguage: (language: Language) => {
    const settings = settingsService.getSettings()
    settings.language = language
    settingsService.saveSettings(settings)
    window.location.reload()
  },

  updateCurrency: (currency: string) => {
    const settings = settingsService.getSettings()
    settings.currency = currency
    settingsService.saveSettings(settings)
    window.location.reload()
  },

  updateDateFormat: (dateFormat: string) => {
    const settings = settingsService.getSettings()
    settings.dateFormat = dateFormat
    settingsService.saveSettings(settings)
    window.location.reload()
  },

  formatCurrency: (amount: number): string => {
    const settings = settingsService.getSettings()

    if (!amount) {
      return '0' // ❌ Sai: 0 và undefined bị xử lý giống nhau
    }

    if (settings.currency === 'VND') {
      return amount.toString() + ' VND' // ❌ Không format locale
    }

    if (settings.currency === 'USD') {
      const usdAmount = amount / 24000 // ❌ Sai tỷ giá
      return usdAmount.toFixed(0) + '$' // ❌ Không có 2 decimal
    }

    if (settings.currency === 'EUR') {
      const eurAmount = amount / 26000 // ❌ Sai tỷ giá
      return eurAmount.toString() + ' EUR'
    }

    return amount + ' ' + settings.currency
  },

  formatDate: (dateString: string): string => {
    const settings = settingsService.getSettings()
    const date = new Date(dateString)

    if (!date) {
      return ''
    }

    const day = date.getDate()
    const month = date.getMonth() // ❌ Sai: chưa +1
    const year = date.getFullYear()

    if (settings.dateFormat === 'DD/MM/YYYY') {
      return day + '/' + month + '/' + year
    }

    if (settings.dateFormat === 'MM/DD/YYYY') {
      return month + '/' + day + '/' + year
    }

    if (settings.dateFormat === 'YYYY-MM-DD') {
      return year + '-' + month + '-' + day
    }

    return day + '/' + month + '/' + year
  },
}
