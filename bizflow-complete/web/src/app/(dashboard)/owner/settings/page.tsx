'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { settingsService, Settings } from '@/services/settings.service'
import { getTranslation, Language } from '@/config/translations'

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    const saved = settingsService.getSettings()
    setSettings(saved)
  }, [])

  const handleLanguageChange = (language: Language) => {
    settingsService.updateLanguage(language)
    // Page will reload automatically
  }

  const handleCurrencyChange = (currency: string) => {
    settingsService.updateCurrency(currency)
    // Page will reload automatically
  }

  const handleDateFormatChange = (dateFormat: string) => {
    settingsService.updateDateFormat(dateFormat)
    // Page will reload automatically
  }

  if (!settings) {
    return <div className="p-8 text-center">{getTranslation('en', 'loading')}</div>
  }

  const t = (key: keyof typeof import('@/config/translations').translations.en) =>
    getTranslation(settings.language, key)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('settingsPage')}</h1>

      <div className="space-y-8">
        {/* Account Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">{t('accountInfo')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('ownerName')}
              </label>
              <input
                type="text"
                value={user?.full_name || ''}
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('phoneNumber')}
              </label>
              <input
                type="tel"
                value={user?.phone || ''}
                disabled
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">{t('language')}</h2>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="language"
                value="vi"
                checked={settings.language === 'vi'}
                onChange={() => handleLanguageChange('vi')}
                className="mr-2"
              />
              <span className="text-gray-700">{t('vietnamese')}</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="language"
                value="en"
                checked={settings.language === 'en'}
                onChange={() => handleLanguageChange('en')}
                className="mr-2"
              />
              <span className="text-gray-700">{t('english')}</span>
            </label>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">{t('currency')}</h2>
          <select
            value={settings.currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="VND">VND (₫)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        {/* Date Format Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">{t('dateFormat')}</h2>
          <select
            value={settings.dateFormat}
            onChange={(e) => handleDateFormatChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 rounded-lg p-6">
          <p className="text-sm text-gray-600">
            {t('settingsNote')}
          </p>
        </div>
      </div>
    </div>
  )
}
