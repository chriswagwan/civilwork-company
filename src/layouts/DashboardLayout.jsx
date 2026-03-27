import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import DashboardSidebar from '../components/admin/DashboardSidebar.jsx'
import ThemeToggle from '../components/common/ThemeToggle.jsx'
import { useAuth } from '../hooks/useAuth.js'

const DashboardLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="site-container py-6 sm:py-8">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Operations Console</p>
          <h1 className="mt-1 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-semibold text-slate-950">Welcome back, {user?.name}</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 whitespace-nowrap"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Log out</span>
          </button>
        </div>
      </div>

      {/* Responsive grid - adjusts based on sidebar expansion */}
      <div className={`grid gap-6 transition-all duration-300 ${
        sidebarExpanded 
          ? 'grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]' 
          : 'grid-cols-1 lg:grid-cols-[80px_minmax(0,1fr)]'
      }`}>
        {/* Desktop Sidebar - visible on lg and up */}
        <div className="hidden lg:block sticky top-6 h-fit">
          <DashboardSidebar 
            isExpanded={sidebarExpanded} 
            onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)}
          />
        </div>
        {/* Mobile/Tablet Sidebar - always expanded */}
        <div className="lg:hidden">
          <DashboardSidebar 
            isExpanded={true}
            onToggleExpand={() => {}}
          />
        </div>
        {/* Main Content Area */}
        <section className="space-y-6 min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  )
}

export default DashboardLayout
