import { LogOut, Menu, X, Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import client from '../api/client.js'
import DashboardSidebar from '../components/admin/DashboardSidebar.jsx'
import EnhancedThemeToggle from '../components/public/EnhancedThemeToggle.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { usePublicTheme } from '../hooks/usePublicTheme.js'

const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const { isDark } = usePublicTheme()
  const navigate = useNavigate()
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let isMounted = true

    const loadUnreadCount = async () => {
      try {
        const { data } = await client.get('/messages')
        if (isMounted) {
          setUnreadCount(data.filter((message) => !message.isRead).length)
        }
      } catch {
        if (isMounted) {
          setUnreadCount(0)
        }
      }
    }

    const handleMessagesUpdated = () => {
      loadUnreadCount()
    }

    loadUnreadCount()
    const intervalId = window.setInterval(loadUnreadCount, 30000)
    window.addEventListener('messages:updated', handleMessagesUpdated)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
      window.removeEventListener('messages:updated', handleMessagesUpdated)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
        : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'
    }`}>
      {/* Top Header */}
      <header className={`sticky top-0 z-40 transition-colors duration-300 ${
        isDark
          ? 'bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 shadow-sm'
          : 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm'
      }`}>
        <div className="site-container px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile Menu Toggle + Welcome */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-slate-800 text-slate-400'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex-1">
                <h1 className={`mt-1 text-lg sm:text-xl font-bold ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}>
                  Welcome back, <span className="text-amber-500">{user?.name?.split(' ')[0]}</span>
                </h1>
              </div>
            </div>

            {/* Right: Home & Logout */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <EnhancedThemeToggle compact={true} />
              <Link
                to="/"
                className={`group inline-flex items-center gap-2 rounded-lg border px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold
                           transition-all duration-200 hover:shadow-sm ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                }`}
                title="Return to home"
              >
                <Home size={16} className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <div className={`w-px h-6 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              <button
                type="button"
                onClick={handleLogout}
                className={`group inline-flex items-center gap-2 rounded-lg border px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold
                           transition-all duration-200 hover:shadow-sm ${
                  isDark
                    ? 'bg-red-950/30 hover:bg-red-900/40 border-red-800 text-red-300'
                    : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                }`}
              >
                <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className={`fixed inset-0 z-30 backdrop-blur-sm lg:hidden ${
            isDark ? 'bg-black/60' : 'bg-black/40'
          }`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Layout */}
      <div className="site-container px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile Sidebar Drawer */}
        <div
          className={`fixed left-0 top-0 z-40 h-screen w-full max-w-sm transform transition-transform duration-300
                      lg:hidden shadow-lg ${
                        isDark ? 'bg-slate-900' : 'bg-white'
                      }
                      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="mt-20 p-4">
            <DashboardSidebar
              isExpanded={true}
              unreadCount={unreadCount}
              onToggleExpand={() => {}}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Desktop + Mobile Layout */}
        <div
          className={`grid gap-6 transition-all duration-300
                      ${sidebarExpanded
                        ? 'grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]'
                        : 'grid-cols-1 lg:grid-cols-[80px_minmax(0,1fr)]'}`}
        >
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <DashboardSidebar
              isExpanded={sidebarExpanded}
              unreadCount={unreadCount}
              onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)}
              onNavigate={() => {}}
            />
          </div>

          {/* Main Content Area */}
          <section className="space-y-6 min-w-0">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  )
}

export default DashboardLayout