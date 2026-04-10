import { ArrowRight, Building2, CheckCircle2, ChevronLeft, ChevronRight, HardHat, Landmark, Waves } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
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
  const [slides, setSlides] = useState([])
  const [slideIndex, setSlideIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const slideTimer = useRef(null)
  const { language } = useLanguage()

  const startSlideTimer = useCallback(() => {
    clearInterval(slideTimer.current)
    slideTimer.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % (slides.length || 1))
    }, 5000)
  }, [slides.length])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, projectsResponse, slideshowResponse] = await Promise.all([
          client.get('/services'),
          client.get('/projects?featured=true'),
          client.get('/slideshow?active=true'),
        ])

        setServices(servicesResponse.data.slice(0, 3))
        setProjects(projectsResponse.data.slice(0, 3))
        setSlides(slideshowResponse.data)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    startSlideTimer()
    return () => clearInterval(slideTimer.current)
  }, [slides.length, startSlideTimer])

  return (
    <div className="space-y-16 sm:space-y-20 pb-6 sm:pb-8 pt-4 sm:pt-6">
      <section className="site-container">
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="card-panel grid-overlay overflow-hidden px-4 sm:px-6 py-8 sm:py-12 md:px-10 md:py-14">
            <span className="fade-in-up inline-flex w-fit rounded-full border border-amber-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:border-amber-400/40 dark:text-amber-400">
              {t(language, 'home.hero_eyebrow')}
            </span>
            <h1 className="fade-in-up stagger-1 mt-4 sm:mt-6 max-w-3xl text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {t(language, 'home.hero_title')}
            </h1>
            <p className="fade-in-up stagger-2 mt-4 sm:mt-6 max-w-2xl text-sm sm:text-base md:text-lg leading-6 sm:leading-7 md:leading-8 text-slate-600 dark:text-slate-300">
              {t(language, 'home.hero_copy')}
            </p>
            <div className="fade-in-up stagger-3 mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                {t(language, 'home.explore_projects')}
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="consultation-btn rounded-full border border-slate-200 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                {t(language, 'home.get_quote')}  
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="card-panel overflow-hidden relative group">
              {slides.length > 0 ? (
                <>
                  {slides.map((slide, i) => (
                    <img
                      key={slide._id}
                      src={slide.image}
                      alt={slide.title || `Slide ${i + 1}`}
                      className="h-full min-h-[220px] sm:min-h-[280px] w-full object-cover absolute inset-0 transition-opacity duration-1000 ease-in-out"
                      style={{ opacity: i === slideIndex ? 1 : 0 }}
                    />
                  ))}
                  {slides[slideIndex]?.title && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 to-transparent px-4 py-4 z-10">
                      <p className="text-sm font-semibold text-white">{slides[slideIndex].title}</p>
                    </div>
                  )}
                  {slides.length > 1 && (
                    <>
                      <button
                        onClick={() => { setSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1)); startSlideTimer() }}
                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition opacity-0 group-hover:opacity-100 hover:bg-black/60"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => { setSlideIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1)); startSlideTimer() }}
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition opacity-0 group-hover:opacity-100 hover:bg-black/60"
                        aria-label="Next slide"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  {slides.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 flex gap-1.5">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => { setSlideIndex(i); startSlideTimer() }}
                          className={`h-1.5 rounded-full transition-all duration-500 ${i === slideIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  )}
                  <div className="min-h-[220px] sm:min-h-[280px]" />
                </>
              ) : (
                <div className="flex items-center justify-center min-h-[220px] sm:min-h-[280px] bg-slate-100 dark:bg-slate-800">
                  <div className="text-center text-slate-400 dark:text-slate-500">
                    <Building2 className="mx-auto mb-2" size={40} />
                    <p className="text-sm font-medium">{t(language, 'home.hero_eyebrow')}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="card-panel overflow-hidden p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] font-semibold text-slate-500 dark:text-slate-400">{t(language, 'home.why_choose')}</p>
                  <h2 className="mt-3 text-lg sm:text-2xl font-semibold text-slate-900 dark:text-white">{t(language, 'home.why_copy')}</h2>
                </div>
                <div className="transition-transform duration-300 hover:scale-110 flex-shrink-0">
                  <HardHat className="text-amber-600 dark:text-amber-500" size={28} />
                </div>
              </div>
              <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                {[
                  t(language, 'home.point1'),
                  t(language, 'home.point2'),
                  t(language, 'home.point3'),
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3 group">
                    <CheckCircle2 className="mt-0.5 sm:mt-1 text-amber-600 dark:text-amber-500 flex-shrink-0 transition-colors" size={18} />
                    <p className="text-xs sm:text-sm leading-6 sm:leading-7 text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container">
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow={t(language, 'home.what_we_do')}
            title={t(language, 'home.what_we_do_title')}
            copy={t(language, 'home.what_we_do_copy')}
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
            eyebrow={t(language, 'home.featured_eyebrow')}
            title={t(language, 'home.featured_title')}
            copy={t(language, 'home.featured_copy')}
          />
          <Link to="/projects" className="text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-600 transition hover:text-amber-800 dark:hover:text-amber-500 whitespace-nowrap">
            {t(language, 'home.see_portfolio')}
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
