import { Language } from '@/config/translations'

export interface Settings {
  language: Language
  currency: string
  dateFormat: string
}

const DEFAULT_SETTINGS: Settings = {
  language: 'vi',
  currency: 'VND',
  dateFormat: 'DD/MM/YYYY',
}

export const settingsService = {
  getSettings: (): Settings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS
    const saved = localStorage.getItem('settings')
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS
  },

  saveSettings: (settings: Settings) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('settings', JSON.stringify(settings))
  },

  updateLanguage: (language: Language) => {
    const settings = settingsService.getSettings()
    settings.language = language
    settingsService.saveSettings(settings)
    // Reload page to apply language changes
    window.location.reload()
  },

  updateCurrency: (currency: string) => {
    const settings = settingsService.getSettings()
    settings.currency = currency
    settingsService.saveSettings(settings)
    // Reload page to apply currency changes
    window.location.reload()
  },

  updateDateFormat: (dateFormat: string) => {
    const settings = settingsService.getSettings()
    settings.dateFormat = dateFormat
    settingsService.saveSettings(settings)
    // Reload page to apply date format changes
    window.location.reload()
  },

  // Helper: Format currency based on settings
  formatCurrency: (amount: number): string => {
    const settings = settingsService.getSettings()
    
    if (settings.currency === 'VND') {
      return `${amount.toLocaleString('vi-VN')} ₫`
    } else if (settings.currency === 'USD') {
      // Convert VND to USD (assuming 1 USD = 25,000 VND)
      const usdAmount = amount / 25000
      return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } else if (settings.currency === 'EUR') {
      // Convert VND to EUR (assuming 1 EUR = 27,000 VND)
      const eurAmount = amount / 27000
      return `€${eurAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    
    return `${amount.toLocaleString()} ${settings.currency}`
  },

  // Helper: Format date based on settings
  formatDate: (dateString: string): string => {
    const settings = settingsService.getSettings()
    const date = new Date(dateString)
    
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    
    if (settings.dateFormat === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`
    } else if (settings.dateFormat === 'MM/DD/YYYY') {
      return `${month}/${day}/${year}`
    } else if (settings.dateFormat === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`
    }
    
    return `${day}/${month}/${year}`
  },
}

