import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../../api/client.js'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import { formatDate, truncateText } from '../../utils/formatters.js'

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
      <div className="card-panel px-4 sm:px-6 py-10 sm:py-14">
        <LoadingSpinner label="Loading dashboard..." />
      </div>
    )
  }

  const statCards = [
    { label: 'Projects', value: data?.totals?.projects ?? 0 },
    { label: 'Services', value: data?.totals?.services ?? 0 },
    { label: 'Users', value: data?.totals?.users ?? 0 },
    { label: 'Messages', value: data?.totals?.messages ?? 0 },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Return Home Link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 whitespace-nowrap"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Return Home</span>
        <span className="sm:hidden">Home</span>
      </Link>

      {/* Stats Grid - Responsive */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="card-panel px-3 sm:px-5 py-4 sm:py-6">
            <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
            <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-950">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] auto-rows-max lg:auto-rows-[1fr]">
        {/* Recent Projects */}
        <div className="card-panel bg-gradient-to-br from-slate-50 to-slate-100/60 px-4 sm:px-6 py-4 sm:py-6 flex flex-col">
          <h2 className="text-lg sm:text-2xl font-semibold text-slate-950">Recent Projects</h2>
          <div className="mt-3 sm:mt-5 space-y-3 sm:space-y-4 flex-1">
            {data?.recentProjects?.slice(0, 3).map((project) => (
              <div key={project._id} className="rounded-3xl border border-amber-100/40 bg-gradient-to-r from-amber-50/60 to-white px-3 sm:px-4 py-3 sm:py-4 transition hover:border-amber-200/60 hover:shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <h3 className="text-base sm:text-lg font-semibold text-amber-950 line-clamp-1">{project.title}</h3>
                  <div className="flex-shrink-0">
                    <StatusBadge status={project.status} />
                  </div>
                </div>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-amber-700">{project.location}</p>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-700">{truncateText(project.description, 110)}</p>
              </div>
            ))}
          </div>
          <Link
            to="/admin/projects"
            className="mt-4 sm:mt-5 inline-flex text-xs sm:text-sm font-semibold text-amber-700 transition hover:text-amber-800"
          >
            View All Projects →
          </Link>
        </div>

        {/* Latest Messages */}
        <div className="card-panel bg-gradient-to-br from-slate-50 to-slate-100/60 px-4 sm:px-6 py-4 sm:py-6 flex flex-col">
          <h2 className="text-lg sm:text-2xl font-semibold text-slate-950">Latest Messages</h2>
          <div className="mt-3 sm:mt-5 space-y-3 sm:space-y-4 flex-1">
            {data?.recentMessages?.slice(0, 3).map((message) => (
              <div
                key={message._id}
                className={`rounded-3xl border px-3 sm:px-4 py-3 sm:py-4 transition hover:shadow-sm ${
                  message.isRead
                    ? 'border-gray-200 bg-gray-100'
                    : 'border-emerald-100/40 bg-gray-100 hover:border-emerald-200/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-1">
                    {message.name}
                  </h3>
                  <span className="text-xs font-medium text-gray-600 flex-shrink-0">
                    {formatDate(message.createdAt)}
                  </span>
                </div>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-gray-600 line-clamp-1">
                  {message.email}
                </p>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-5 sm:leading-6 text-gray-700 line-clamp-2">
                  {truncateText(message.message, 110)}
                </p>
                {!message.isRead && (
                  <p className="mt-2 text-xs font-semibold text-red-600">Unread</p>
                )}
              </div>
            ))}
          </div>
          <Link
            to="/admin/messages"
            className="mt-4 sm:mt-5 inline-flex text-xs sm:text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
          >
            View All Messages →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default DashboardHomePage
