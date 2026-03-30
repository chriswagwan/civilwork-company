import { ArrowRight, Building2, CheckCircle2, HardHat, Landmark, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import client from '../api/client.js'
import SectionHeading from '../components/layout/SectionHeading.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import { truncateText } from '../utils/formatters.js'
import { useLanguage } from '../hooks/useLanguage.js'
import { t } from '../utils/translations.js'

const iconMap = {
  'building-2': Building2,
  route: Landmark,
  waves: Waves, 
}

const HomePage = () => {
  const [services, setServices] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const { language } = useLanguage()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, projectsResponse] = await Promise.all([
          client.get('/services'),
          client.get('/projects?featured=true'),
        ])

        setServices(servicesResponse.data.slice(0, 3))
        setProjects(projectsResponse.data.slice(0, 3))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-16 sm:space-y-20 pb-6 sm:pb-8 pt-4 sm:pt-6">
      <section className="site-container">
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="card-panel grid-overlay overflow-hidden px-4 sm:px-6 py-8 sm:py-12 md:px-10 md:py-14">
            <span className="fade-in-up inline-flex w-fit rounded-full border border-amber-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:border-amber-400/40 dark:text-amber-400">
              Civil Infrastructure Excellence
            </span>
            <h1 className="fade-in-up stagger-1 mt-4 sm:mt-6 max-w-3xl text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-950 dark:text-white">
              We build roads, structures, and utility networks that keep communities moving.
            </h1>
            <p className="fade-in-up stagger-2 mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-lg leading-6 sm:leading-7 md:leading-8 text-slate-600 dark:text-slate-300">
              Civil Works Co. partners with public and private clients to deliver dependable construction,
              disciplined project management, and durable engineering outcomes.
            </p>
            <div className="fade-in-up stagger-3 mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                Explore Projects
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="consultation-btn rounded-full border border-slate-200 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                GetQuote  
              </Link>
            </div>
            <div className="mt-8 sm:mt-12 grid gap-4 grid-cols-1 sm:grid-cols-3">
              {[
                { label: 'Years of practice', value: '18+' },
                { label: 'Projects delivered', value: '120+' },
                { label: 'Safety-first teams', value: '24/7' },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-amber-400/40 p-3 sm:p-4 dark:border-amber-400/40">
                  <p className="text-xl sm:text-2xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="card-panel overflow-hidden p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] font-semibold text-slate-500 dark:text-slate-400">Why Clients Choose Us</p>
                  <h2 className="mt-3 text-lg sm:text-2xl font-semibold text-slate-900 dark:text-white">Structured delivery from mobilization to handover</h2>
                </div>
                <div className="transition-transform duration-300 hover:scale-110 flex-shrink-0">
                  <HardHat className="text-amber-600 dark:text-amber-500" size={28} />
                </div>
              </div>
              <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                {[
                  'Integrated planning, procurement, and site execution',
                  'Transparent reporting and milestone-based delivery',
                  'High-quality workmanship with strong HSE controls',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3 group">
                    <CheckCircle2 className="mt-0.5 sm:mt-1 text-amber-600 dark:text-amber-500 flex-shrink-0 transition-colors" size={18} />
                    <p className="text-xs sm:text-sm leading-6 sm:leading-7 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-panel overflow-hidden">
              <img
                src="./Your paragraph text.png"
                alt="Construction site"
                className="h-full min-h-[220px] sm:min-h-[280px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="site-container">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="What We Do"
            title="Civil works services built around performance on site"
            copy="From earthworks and road construction to structural building delivery and drainage packages, our teams are set up for safe, high-quality execution."
          />
          {loading ? (
            <div className="card-panel flex items-center justify-center px-6 py-14">
              <LoadingSpinner label="Loading services..." />
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {services.map((service, index) => {
                const Icon = iconMap[service.icon] || Building2
                return (
                  <article
                    key={service._id}
                    className={`card-panel fade-in-up px-4 sm:px-5 py-5 sm:py-6 ${index ? `stagger-${index}` : ''}`}
                  >
                    <div className="service-icon flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-4 sm:mt-5 text-base sm:text-xl font-semibold text-slate-900 dark:text-white">{service.name}</h3>
                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-6 sm:leading-7 text-slate-600 dark:text-slate-400">{truncateText(service.description, 120)}</p>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="site-container">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <SectionHeading
            eyebrow="Featured Work"
            title="Recent projects shaping better infrastructure"
            copy="A snapshot of the transport, building, and utility projects currently in our portfolio."
          />
          <Link to="/projects" className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-600 transition hover:text-amber-800 dark:hover:text-amber-500 whitespace-nowrap">
            See full portfolio
          </Link>
        </div>
        {loading ? (
          <div className="card-panel flex items-center justify-center px-6 py-14">
            <LoadingSpinner label="Loading projects..." />
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article key={project._id} className="card-panel overflow-hidden">
                <img
                  src={project.images?.[0]}
                  alt={project.title}
                  className="h-40 sm:h-48 lg:h-56 w-full object-cover"
                />
                <div className="space-y-3 sm:space-y-4 px-4 sm:px-6 py-4 sm:py-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-500">{project.location}</p>
                    <StatusBadge status={project.status} />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-semibold text-slate-900 dark:text-white">{project.title}</h3>
                  <p className="text-xs sm:text-sm leading-6 sm:leading-7 text-slate-600 dark:text-slate-400">{truncateText(project.description, 125)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default HomePage
