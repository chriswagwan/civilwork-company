import { Menu, ShieldCheck, X, Globe, Home, Info, Briefcase, FolderOpen, Mail, LogOut, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import EnhancedThemeToggle from '../public/EnhancedThemeToggle.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useSiteSettings } from '../../hooks/useSiteSettings.js'
import { useLanguage } from '../../hooks/useLanguage.js'
import { t } from '../../utils/translations.js'

const navItemsBase = [
  { key: 'nav.home', to: '/', icon: Home },
  { key: 'nav.about', to: '/about', icon: Info },
  { key: 'nav.services', to: '/services', icon: Briefcase },
  { key: 'nav.projects', to: '/projects', icon: FolderOpen },
  { key: 'nav.contact', to: '/contact', icon: Mail },
]

const navClass = ({ isActive }) =>
  `transition ${
    isActive
      ? 'text-amber-700'
      : 'text-slate-700 hover:text-slate-950'
  }`

// Mobile Navigation Link Component
const MobileNavLink = ({ icon: Icon, label, to, isActive, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/50 text-amber-700'
          : 'text-slate-700 hover:bg-slate-100'
      }`
    }
  >
    <Icon className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform" />
    <span className="font-semibold text-base">{label}</span>
    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
  </NavLink>
)

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const { settings } = useSiteSettings()
  const { language, toggleLanguage } = useLanguage()
  const navigate = useNavigate()

  const navItems = navItemsBase.map((item) => ({
    ...item,
    label: t(language, item.key),
  }))

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
    setOpen(false)
  }

  const handleNavClick = () => {
    setOpen(false)
  }

  return (
    <header className="site-container pt-3 sm:pt-4">
      <div className="card-panel flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 gap-2">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <img src="/icon.png" alt="Company Logo" className="h-10 sm:h-12 w-auto" />
          <div className="hidden sm:block">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">{settings.companyName}</p>
            <p className="text-xs text-slate-500">{settings.companyTagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() => toggleLanguage(language === 'en' ? 'fr' : 'en')}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Toggle language"
          >
            <Globe size={16} />
            <span className="uppercase tracking-widest text-xs font-bold">{language}</span>
          </button>
          <EnhancedThemeToggle />
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' ? (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <ShieldCheck size={16} />
                  Dashboard
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>

        <button
          type="button"
          className="rounded-xl border border-slate-200 p-2.5 sm:p-3 lg:hidden hover:bg-slate-50 transition"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-in Menu */}
      <nav
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto lg:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu Header with Logo and Close Button */}
        <div className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" onClick={handleNavClick} className="flex items-center gap-2 flex-shrink-0">
              <img src="/icon.png" alt="Company Logo" className="h-10 w-auto" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">{settings.companyName}</p>
              </div>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X size={24} className="text-slate-700" />
            </button>
          </div>
        </div>

        {/* Main Navigation Links */}
        <div className="px-4 py-6 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 mb-4">Navigation</p>
          {navItems.map((item) => (
            <MobileNavLink
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              onClick={handleNavClick}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Settings Section */}
        <div className="px-4 py-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 mb-4">Settings</p>

          {/* Language Selector */}
          <button
            onClick={() => {
              toggleLanguage(language === 'en' ? 'fr' : 'en')
            }}
            className="group w-full flex items-center gap-4 rounded-2xl px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-all duration-300 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <Globe className="w-6 h-6 flex-shrink-0 text-slate-600 group-hover:scale-110 transition-transform dark:text-slate-400" />
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Language</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'en' ? 'English' : 'Français'}
              </p>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 px-3 py-1 rounded-full border border-amber-400/40 dark:border-amber-400/40 dark:text-amber-500">
              {language.toUpperCase()}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Authentication Section */}
        {isAuthenticated ? (
          <div className="px-4 py-6 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 mb-4">Account</p>

            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                onClick={handleNavClick}
                className="group flex items-center gap-4 rounded-2xl px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-all duration-300 border border-slate-200"
              >
                <ShieldCheck className="w-6 h-6 flex-shrink-0 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-base text-slate-700 flex-1 text-left">Admin Dashboard</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="group w-full flex items-center gap-4 rounded-2xl px-5 py-4 bg-red-50 hover:bg-red-100 transition-all duration-300 border border-red-200"
            >
              <LogOut className="w-6 h-6 flex-shrink-0 text-red-600 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-base text-red-600 flex-1 text-left">Logout</span>
            </button>
          </div>
        ) : null}

        {/* Footer Spacing */}
        <div className="h-8" />
      </nav>

      {/* Desktop Menu Rest of Component */}
    </header>
  )
}

export default Navbar
