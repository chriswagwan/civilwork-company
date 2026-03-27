import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme.js'

const ThemeToggle = ({ compact = false }) => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        compact
          ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
      aria-label="Toggle dark theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      <span>{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}

export default ThemeToggle
