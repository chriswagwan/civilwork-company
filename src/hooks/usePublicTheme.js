import { useContext } from 'react'
import { PublicThemeContext } from '../context/public-theme-context.js'

export const usePublicTheme = () => {
  const context = useContext(PublicThemeContext)

  if (!context) {
    throw new Error('usePublicTheme must be used within PublicThemeProvider')
  }

  return context
}