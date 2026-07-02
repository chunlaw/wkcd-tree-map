import { useStore } from './store'
import { translations, type Translation } from './i18n'

/** Returns the translation dictionary for the current language. */
export function useT(): Translation {
  const lang = useStore((s) => s.lang)
  return translations[lang]
}
