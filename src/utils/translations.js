import en from '../locales/en.json'
import fr from '../locales/fr.json'

const translations = { en, fr }

export const getTranslation = (language, key) => {
  const keys = key.split('.')
  let value = translations[language] || translations.en

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      return key
    }
  }

  return value || key
}

export const t = (language, key) => getTranslation(language, key)
