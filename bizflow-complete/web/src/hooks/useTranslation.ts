import { useState, useEffect } from 'react'
import { settingsService } from '@/services/settings.service'
import { getTranslation, Language } from '@/config/translations'

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('vi')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const settings = settingsService.getSettings()
      setLanguage(settings.language)
    } catch (error) {
      console.error('Error loading settings:', error)
      setLanguage('vi')
    }
    setIsLoading(false)
  }, [])

  const t = (key: keyof typeof import('@/config/translations').translations.en): string => {
    return getTranslation(language, key)
  }

  return { language, t, isLoading }
}



























































































































































