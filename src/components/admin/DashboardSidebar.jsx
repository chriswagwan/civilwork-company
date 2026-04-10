import { BriefcaseBusiness, Image, LayoutDashboard, Mail, Settings, Wrench, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/projects', label: 'Projects', icon: BriefcaseBusiness },
  { to: '/admin/services', label: 'Services', icon: Wrench },
  { to: '/admin/staff', label: 'Staff', icon: Users },
  { to: '/admin/slideshow', label: 'Slideshow', icon: Image },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

const DashboardSidebar = ({ isExpanded = true, unreadCount = 0, onToggleExpand = () => {}, onNavigate = () => {} }) => (
  <aside
    className={`sticky top-6 h-fit transition-all duration-300 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden ${
      isExpanded ? 'p-5 w-full lg:w-[280px]' : 'p-3 w-full lg:w-[80px]'
    }`}
  >
    {/* Header with Logo - Only show when expanded */}
    {isExpanded && (
      <div className="pb-5 mb-5 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            A
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Admin Dashboard</p>
            
          </div>
        </div>
      </div>
    )}

    {/* Toggle Button - Desktop only */}
    <div className={`mb-4 hidden lg:flex ${isExpanded ? 'justify-end' : 'justify-center'}`}>
      <button
        onClick={onToggleExpand}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-110"
        title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </div>

    {/* Navigation Items */}
    <nav className={`space-y-1 flex flex-col transition-all duration-300 ${
      !isExpanded ? 'lg:items-center' : ''
    }`}>
      {items.map((item) => {
        const IconComponent = item.icon

        return (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) => {
            const baseClass = `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              !isExpanded ? 'lg:px-2.5 lg:py-2' : ''
            }`
            const activeClass = isActive
              ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/5 dark:from-amber-500/15 dark:to-orange-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-700/50'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
            return `${baseClass} ${activeClass}`
          }}
          title={!isExpanded ? item.label : undefined}
        >
          {/* Icon */}
          <div className={`relative flex-shrink-0 ${isExpanded ? '' : 'lg:mx-auto'}`}>
            <IconComponent
              size={20}
              className="transition-all duration-200"
            />
            {item.to === '/admin/messages' && unreadCount > 0 && !isExpanded && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center">
                <span className="absolute inline-flex h-4 w-4 rounded-full bg-rose-400/35 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br from-rose-500 to-red-500 ring-2 ring-white dark:ring-slate-900 shadow-[0_0_10px_rgba(244,63,94,0.45)]" />
              </span>
            )}
          </div>

          {/* Label - Show when expanded */}
          {isExpanded && (
            <span className="flex-1 transition-all duration-200">{item.label}</span>
          )}

          {item.to === '/admin/messages' && unreadCount > 0 && isExpanded && (
            <div className="flex items-center">
              <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_10px_20px_-12px_rgba(239,68,68,0.9)] ring-1 ring-rose-200/70 dark:ring-rose-800/70">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </div>
          )}
        </NavLink>
        )
      })}
    </nav>

    {/* Divider */}
    <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />

    {/* Footer Info - Only show when expanded */}
    {isExpanded && (
      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100/50 dark:border-amber-800/30 p-3">
        <p className="text-xs font-semibold text-amber-900 dark:text-amber-400">Pro Tip</p>
        <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 leading-5">All changes here update the public panel instantly,keep info accurate!</p>
      </div>
    )}
  </aside>
)

export default DashboardSidebar
