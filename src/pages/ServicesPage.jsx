import { Building2, Landmark, Waves, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import client from '../api/client.js'
import EmptyState from '../components/common/EmptyState.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import PageHero from '../components/layout/PageHero.jsx'
import { truncateText } from '../utils/formatters.js'
import { useLanguage } from '../hooks/useLanguage.js'
import { t } from '../utils/translations.js'

const iconMap = {
  'building-2': Building2,
  route: Landmark,
  waves: Waves,
}

const ServicesPage = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const { language } = useLanguage()
  const itemsPerPage = 6

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await client.get('/services')
        setServices(data)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const totalPages = Math.ceil(services.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedServices = services.slice(startIndex, endIndex)

  return (
    <div className="space-y-12 sm:space-y-14 pb-6 sm:pb-8">
      <PageHero
        eyebrow={t(language, 'services.eyebrow')}
        title={t(language, 'services.title')}
        copy={t(language, 'services.copy')}
        copy2={t(language, 'services.copy2')}
      />

      <section className="site-container">
        {loading ? (
          <div className="card-panel flex justify-center px-6 py-14">
            <LoadingSpinner label="Loading services..." />
          </div>
        ) : services.length === 0 ? (
          <EmptyState title="No services yet" copy="Add services from the admin dashboard to showcase them here." />
        ) : (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {paginatedServices.map((service, index) => {
                const Icon = iconMap[service.icon] || Building2
                return (
                  <article
                    key={service._id}
                    className={`card-panel fade-in-up px-4 sm:px-5 py-5 sm:py-6 ${index ? `stagger-${index}` : ''}`}
                  >
                    <div className="flex text-amber-700 dark:text-amber-500">
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-4 sm:mt-5 text-base sm:text-xl font-semibold text-slate-900 dark:text-white">{service.name}</h3>
                    <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-6 sm:leading-7 text-slate-600 dark:text-slate-400">{truncateText(service.description, 120)}</p>
                  </article>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination-container">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-widest">
                  Showing {startIndex + 1}–{Math.min(endIndex, services.length)} of {services.length}
                </span>
                <div className="pagination-controls">
                  <button
                    onClick={() => {
                      setCurrentPage(Math.max(1, currentPage - 1))
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                    title="Previous page"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex flex-col items-center min-w-[3rem]">
                    <span className="text-sm font-bold text-slate-950 dark:text-white">{currentPage}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-tighter">Page</span>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                    title="Next page"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default ServicesPage
