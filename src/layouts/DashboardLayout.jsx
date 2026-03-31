import { LogOut, Menu, X, Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import client from '../api/client.js'
import DashboardSidebar from '../components/admin/DashboardSidebar.jsx'
import { useAuth } from '../hooks/useAuth.js'

const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Force light mode for admin panel
  useEffect(() => {
    const htmlElement = document.documentElement
    const wasDark = htmlElement.classList.contains('dark')
    
    // Remove dark class
    htmlElement.classList.remove('dark')
    htmlElement.style.colorScheme = 'light'

    // Restore dark mode when leaving admin panel
    return () => {
      if (wasDark) {
        htmlElement.classList.add('dark')
        htmlElement.style.colorScheme = 'dark'
      }
    }
  }, [])

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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="site-container px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Mobile Menu Toggle + Welcome */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex-1">
                <h1 className="mt-1 text-lg sm:text-xl font-bold text-slate-900">
                  Welcome back, <span className="text-amber-700">{user?.name?.split(' ')[0]}</span>
                </h1>
              </div>
            </div>

            {/* Right: Home & Logout */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link
                to="/"
                className="group inline-flex items-center gap-2 rounded-lg bg-slate-100 hover:bg-slate-200
                           border border-slate-300 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold
                           text-slate-700 transition-all duration-200 hover:shadow-sm"
                title="Return to home"
              >
                <Home size={16} className="group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <div className="w-px h-6 bg-slate-200" />
              <button
                type="button"
                onClick={handleLogout}
                className="group inline-flex items-center gap-2 rounded-lg bg-red-50 hover:bg-red-100
                           border border-red-200 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold
                           text-red-700 transition-all duration-200 hover:shadow-sm"
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
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Layout */}
      <div className="site-container px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile Sidebar Drawer */}
        <div
          className={`fixed left-0 top-0 z-40 h-screen w-full max-w-sm bg-white transform transition-transform duration-300
                      lg:hidden shadow-lg
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