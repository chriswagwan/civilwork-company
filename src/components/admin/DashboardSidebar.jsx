import { BriefcaseBusiness, LayoutDashboard, Mail, Settings, Wrench, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/admin/dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { to: '/admin/projects', label: 'Projects', icon: <BriefcaseBusiness size={18} /> },
  { to: '/admin/services', label: 'Services', icon: <Wrench size={18} /> },
  { to: '/admin/staff', label: 'Staff', icon: <Users size={18} /> },
  { to: '/admin/messages', label: 'Messages', icon: <Mail size={18} /> },
  { to: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
]

const DashboardSidebar = ({ isExpanded = true, onToggleExpand = () => {} }) => (
  <aside className={`card-panel h-fit sticky top-6 transition-all duration-300 ${
    isExpanded ? 'p-4 sm:p-6 w-full lg:w-[280px]' : 'p-3 w-full lg:w-[80px]'
  }`}>
    {/* Header Card - Only show when expanded */}
    {isExpanded && (
      <div className="admin-hub-card relative rounded-3xl bg-white p-4 sm:p-6 text-slate-900 shadow-sm mb-4 sm:mb-6">
        <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-amber-400 to-amber-600" />
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-700">Admin Hub</p>
        <h2 className="mt-3 sm:mt-4 text-lg sm:text-2xl font-bold leading-snug text-slate-950">Project control center</h2>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">Manage portfolio updates and incoming leads.</p>
      </div>
    )}

    {/* Toggle Button - Desktop only */}
    <div className="mb-4 hidden lg:flex justify-end">
      <button
        onClick={onToggleExpand}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
        title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </div>

    {/* Navigation Items - Vertical Stack */}
    <nav className={`space-y-1.5 sm:space-y-2 flex flex-col transition-all duration-300 ${
      isExpanded ? '' : 'lg:items-center'
    }`}>
      {items.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              isActive 
                ? 'bg-amber-100 text-amber-900 border-l-2 border-amber-700' 
                : 'text-slate-700 hover:bg-slate-100 border-l-2 border-transparent'
            } ${
              !isExpanded ? 'lg:px-2.5 lg:py-2 lg:rounded-lg lg:border-l-0' : ''
            }`
          }
          title={!isExpanded ? label : undefined}
        >
          {/* Icon - Always visible */}
          <span className="flex-shrink-0 flex items-center justify-center">
            {icon}
          </span>
          
          {/* Label - Show when expanded or on mobile */}
          <span className={`flex-1 text-left transition-all duration-300 ${
            !isExpanded ? 'lg:hidden' : 'hidden sm:inline'
          }`}>
            {label}
          </span>
          
          {/* Mobile abbreviation - hidden on lg when expanded */}
          <span className={`text-left font-bold transition-all duration-300 ${
            isExpanded ? 'sm:hidden' : ''
          } ${
            !isExpanded ? 'lg:hidden' : ''
          }`}>
            {label.slice(0, 1)}
          </span>
        </NavLink>
      ))}
    </nav>
  </aside>
)

export default DashboardSidebar
