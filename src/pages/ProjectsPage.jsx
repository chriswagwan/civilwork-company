import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import client from '../api/client.js'
import EmptyState from '../components/common/EmptyState.jsx'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import StatusBadge from '../components/common/StatusBadge.jsx'
import PageHero from '../components/layout/PageHero.jsx'
import { formatDate } from '../utils/formatters.js'
import { useLanguage } from '../hooks/useLanguage.js'
import { t } from '../utils/translations.js'

const AutoSlider = ({ images, alt }) => {
  const [index, setIndex] = useState(0)
  const intervalRef = useRef(null)

  const startInterval = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 4000)
  }, [images.length])

  useEffect(() => {
    if (images.length <= 1) return
    startInterval()
    return () => clearInterval(intervalRef.current)
  }, [images.length, startInterval])

  if (!images || images.length === 0) return null

  return (
    <div className="relative overflow-hidden h-36 sm:h-44 lg:h-48">
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${alt} - ${i + 1}`}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
      {images.length > 1 && (
        <>
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1 z-10">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
            </svg>
            {index + 1}/{images.length}
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProject, setSelectedProject] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { language } = useLanguage()
  const itemsPerPage = 6

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await client.get('/projects')
        setProjects(data)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const totalPages = Math.ceil(projects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = projects.slice(startIndex, endIndex)

  return (
    <div className="space-y-12 sm:space-y-14 pb-6 sm:pb-8">
      <PageHero
        eyebrow={t(language, 'projects.eyebrow')}
        title={t(language, 'projects.title')}
        copy={t(language, 'projects.copy')}
        copy3="Explore selected projects that demonstrate our capability across planning, active delivery, and completed assignments."
      />

      <section className="site-container">
        {loading ? (
          <div className="card-panel flex justify-center px-6 py-14">
            <LoadingSpinner label="Loading projects..." />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState title="No projects yet" copy="Add projects from the admin dashboard to showcase them here." />
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProjects.map((project) => (
                <article key={project._id} className="card-panel overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition" onClick={() => {
                  setSelectedProject(project)
                  setCurrentImageIndex(0)
                }}>
                  <AutoSlider images={project.images || []} alt={project.title} />
                  <div className="space-y-2 sm:space-y-3 flex-grow px-4 sm:px-6 py-4 sm:py-6 flex flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-500">{project.category}</p>
                        <h2 className="mt-0.5 sm:mt-1 text-base sm:text-lg font-semibold text-slate-950 dark:text-white line-clamp-2">{project.title}</h2>
                      </div>
                      <div className="flex-shrink-0">
                        <StatusBadge status={project.status} />
                      </div>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700 dark:text-amber-600">{project.location}</p>
                    <div>
                      <p className="text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600 dark:text-slate-400 line-clamp-3">
                        {project.description}
                      </p>
                    </div>
                    {project.completionDate ? (
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-auto">Completion: {formatDate(project.completionDate)}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4">
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center sm:text-left">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2 justify-center sm:justify-start">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full border border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 text-slate-600 dark:text-slate-400 disabled:opacity-50 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    title="Previous page"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-full border border-slate-200 dark:border-slate-700 p-2 sm:p-2.5 text-slate-600 dark:text-slate-400 disabled:opacity-50 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    title="Next page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Project Details Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl dark:shadow-slate-950/50 max-w-2xl w-full my-8">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 rounded-t-3xl px-6 sm:px-8 py-4 sm:py-6 flex items-start justify-between gap-4">
                <div className="flex-grow min-w-0">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-500">{selectedProject.category}</p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-slate-950 dark:text-white line-clamp-2">{selectedProject.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="flex-shrink-0 rounded-full border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  title="Close modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 sm:px-8 py-6 overflow-y-auto max-h-[calc(100vh-200px)] space-y-4">
                {selectedProject.images && selectedProject.images.length > 0 && (
                  <div className="relative">
                    <img
                      src={selectedProject.images[currentImageIndex]}
                      alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                      className="rounded-2xl w-full h-60 sm:h-80 object-cover"
                    />
                    
                    {/* Image Navigation */}
                    {selectedProject.images.length > 1 && (
                      <>
                        {/* Previous Button */}
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? selectedProject.images.length - 1 : prev - 1))}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
                          title="Previous image"
                        >
                          <ChevronLeft size={20} />
                        </button>

                        {/* Next Button */}
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev === selectedProject.images.length - 1 ? 0 : prev + 1))}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
                          title="Next image"
                        >
                          <ChevronRight size={20} />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {currentImageIndex + 1} of {selectedProject.images.length}
                        </div>

                        {/* Image Thumbnails */}
                        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                          {selectedProject.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`flex-shrink-0 rounded-lg overflow-hidden transition ${
                                index === currentImageIndex ? 'ring-2 ring-amber-500' : 'opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="h-16 w-20 object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">{selectedProject.location}</p>
                      <div className="mt-2">
                        <StatusBadge status={selectedProject.status} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white mb-2">Description</h3>
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {selectedProject.description}
                    </p>
                  </div>
                  {selectedProject.completionDate && (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Completion Date: <span className="text-amber-700 dark:text-amber-600">{formatDate(selectedProject.completionDate)}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 dark:border-slate-800 rounded-b-3xl px-6 sm:px-8 py-4 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="rounded-full border border-slate-200 dark:border-slate-700 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default ProjectsPage
