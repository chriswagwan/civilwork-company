import { ArrowRight, TrendingUp, Briefcase, MessageSquare, Users, Settings, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../../api/client.js'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import { formatDate, truncateText } from '../../utils/formatters.js'

const AnimatedCounter = ({ target, label, icon: Icon, color = 'amber' }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = target / 50
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 30)
    return () => clearInterval(timer)
  }, [target])

  const colorMap = {
    amber: {
      bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      text: 'text-amber-700',
      bg50: 'bg-amber-50',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      text: 'text-blue-700',
      bg50: 'bg-blue-50',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      text: 'text-emerald-700',
      bg50: 'bg-emerald-50',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-500 to-pink-600',
      text: 'text-purple-700',
      bg50: 'bg-purple-50',
    },
  }

  const colorClass = colorMap[color] || colorMap.amber

  return (
    <div className={`group rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 p-6 flex flex-col hover:border-slate-300`}>
      {/* Icon */}
      <div className={`inline-flex w-fit rounded-xl ${colorClass.bg} p-3 text-white mb-4 shadow-md`}>
        <Icon size={24} />
      </div>

      {/* Label */}
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{label}</p>

      {/* Counter */}
      <p className={`text-3xl sm:text-4xl font-bold text-slate-900 mb-2 transition-all duration-300 group-hover:scale-110`}>
        {count}
      </p>

      {/* Trend indicator */}
      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <TrendingUp size={14} />
        <span>+12% vs last month</span>
      </div>
    </div>
  )
}

const DashboardHomePage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await client.get('/dashboard/stats')
        setData(response.data)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14">
        <LoadingSpinner label="Loading dashboard..." />
      </div>
    )
  }

  const stats = [
    {
      label: 'Projects',
      value: data?.totals?.projects ?? 0,
      icon: Briefcase,
      color: 'amber',
    },
    {
      label: 'Messages',
      value: data?.totals?.messages ?? 0,
      icon: MessageSquare,
      color: 'emerald',
    },
    {
      label: 'Team Members',
      value: data?.totals?.users ?? 0,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Services',
      value: data?.totals?.services ?? 0,
      icon: Settings,
      color: 'purple',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_50%,#eef2f7_100%)] p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">
              <ShieldCheck size={14} />
              Admin Workspace
            </div>

            <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Company Control Center
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Manage projects, services, team members, and incoming leads from one central hub with a cleaner view of the business at a glance.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <AnimatedCounter
            key={stat.label}
            target={stat.value}
            label={stat.label}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] auto-rows-max lg:auto-rows-[1fr]">
        {/* Recent Projects */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Recent Projects</h3>
              <p className="text-sm text-slate-600 mt-1">Latest updates from your portfolio</p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <Briefcase size={24} />
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {data?.recentProjects?.slice(0, 3).map((project, idx) => (
              <div
                key={project._id}
                className="group rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-200 px-4 py-4 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                    {project.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">{project.location}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={project.status} />
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{truncateText(project.description, 90)}</p>
              </div>
            ))}
          </div>

          <Link
            to="/admin/projects"
            className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800 transition-colors"
          >
            View All Projects
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Latest Messages */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Latest Messages</h3>
              <p className="text-sm text-slate-600 mt-1">New inquiries & leads</p>
            </div>
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <MessageSquare size={24} />
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {data?.recentMessages?.slice(0, 3).map((message) => (
              <div
                key={message._id}
                className={`group rounded-xl border px-4 py-4 transition-all duration-200 cursor-pointer ${
                  message.isRead
                    ? 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-200'
                    : 'border-emerald-200/50 bg-emerald-50/50 hover:border-emerald-300 hover:bg-emerald-100/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 line-clamp-1 text-sm">{message.name}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{message.email}</p>
                  </div>
                  {!message.isRead && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 mt-1" />
                  )}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-5">{truncateText(message.message, 85)}</p>
                <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200/50">
                  {formatDate(message.createdAt)}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/admin/messages"
            className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            View All Messages
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardHomePage
