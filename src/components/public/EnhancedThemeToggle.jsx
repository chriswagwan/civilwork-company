import { Sun, Moon } from 'lucide-react'
import { usePublicTheme } from '../../context/PublicThemeContext.jsx'

const EnhancedThemeToggle = ({ compact = false }) => {
  const { isDark, toggleTheme } = usePublicTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="group relative inline-flex items-center justify-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 rounded-full"
    >
      {/* Background pill/switch */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-slate-700 dark:to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon container */}
      <div className={`relative flex items-center justify-center transition-all duration-300 ${compact ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'}`}>
        {/* Sun Icon */}
        <Sun
          size={compact ? 18 : 20}
          className="absolute text-amber-500 transition-all duration-500 group-hover:scale-110"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'rotate(90deg) scale(0.8)' : 'rotate(0deg) scale(1)',
          }}
        />

        {/* Moon Icon */}
        <Moon
          size={compact ? 18 : 20}
          className="absolute text-blue-300 dark:text-amber-300 transition-all duration-500 group-hover:scale-110"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.8)',
          }}
        />
      </div>

      {/* Pulse animation on click */}
      <style>{`
        @keyframes themePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        .theme-toggle-pulse {
          animation: themePulse 0.4s ease-out;
        }
      `}</style>
    </button>
  )
}

export default EnhancedThemeToggle
