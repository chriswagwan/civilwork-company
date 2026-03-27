import { Menu, ShieldCheck, X, Globe } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import ThemeToggle from '../common/ThemeToggle.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useSiteSettings } from '../../hooks/useSiteSettings.js'
import { useLanguage } from '../../hooks/useLanguage.js'
import { t } from '../../utils/translations.js'

const navItemsBase = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.about', to: '/about' },
  { key: 'nav.services', to: '/services' },
  { key: 'nav.projects', to: '/projects' },
  { key: 'nav.contact', to: '/contact' },
]

const navClass = ({ isActive }) =>
  `transition ${isActive ? 'text-amber-700' : 'text-slate-700 hover:text-slate-950'}`

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
  }

  return (
    <header className="site-container pt-3 sm:pt-4">
      <div className="card-panel flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 gap-2">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-2xl bg-slate-950 text-xs sm:text-sm font-bold text-white">
            CW
          </div>
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
            className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            title="Toggle language"
          >
            <Globe size={16} />
            <span className="uppercase tracking-widest text-xs font-bold">{language}</span>
          </button>
          <ThemeToggle />
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

      {open ? (
        <div className="card-panel mt-3 space-y-3 px-4 py-4 sm:px-5 sm:py-5 lg:hidden">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
            <button
              onClick={() => toggleLanguage(language === 'en' ? 'fr' : 'en')}
              className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 w-fit"
              title="Toggle language"
            >
              <Globe size={16} />
              <span className="uppercase tracking-widest text-xs font-bold">{language}</span>
            </button>
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' ? (
                  <Link to="/admin/dashboard" onClick={() => setOpen(false)} className="text-slate-700">
                    Dashboard
                  </Link>
                ) : null}
                <button type="button" onClick={handleLogout} className="rounded-full bg-slate-950 px-4 py-2 text-white">
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Navbar
