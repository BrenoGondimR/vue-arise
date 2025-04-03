import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import pt_br from '@/locales/pt_br.json'
import es from '@/locales/es.json'
import ru from '@/locales/ru.json'

const messages = {
  en,
  pt_br,
  es,
  ru
}

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
  globalInjection: true
})

export default i18n
