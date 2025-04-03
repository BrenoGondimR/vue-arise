import { SupportedLanguage } from '@/interfaces/ILocalization'
import { i18n } from '@/i18n'

class LocalizationService {
  private supportedLanguages: SupportedLanguage[] = ['en', 'pt_br', 'es', 'ru']

  detectAndSetLanguage(): void {
    const browserLang = navigator.language.toLowerCase()
    const formattedLang = browserLang.replace('-', '_')

    const match = this.supportedLanguages.find(lang =>
      formattedLang.startsWith(lang.split('_')[0])
    )

    i18n.global.locale.value = (match || 'en') as SupportedLanguage
  }

  setLanguage(lang: string): void {
    if (this.supportedLanguages.includes(lang as SupportedLanguage)) {
      i18n.global.locale.value = lang as SupportedLanguage
    } else {
      console.warn(`[LocalizationService] Language '${lang}' not supported.`)
    }
  }

  getCurrentLanguage(): string {
    return i18n.global.locale.value
  }

  getAvailableLanguages(): SupportedLanguage[] {
    return this.supportedLanguages
  }
}

export default new LocalizationService()
