import { Search, Trash2, ChevronLeft, ChevronRight, Pencil, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import client from '../../api/client.js'
import EmptyState from '../../components/common/EmptyState.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import StatusBadge from '../../components/common/StatusBadge.jsx'
import { formatDate } from '../../utils/formatters.js'

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  location: '',
  category: '',
  status: 'planned',
  featured: false,
  completionDate: '',
  existingImages: [],
}

const projectStatusFilters = [
  { value: 'all', label: 'All' },
  { value: 'planned', label: 'Planned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
]

const AdminProjectsPage = () => {
  const [projects, setProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([])
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProject, setSelectedProject] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [draggedImageIndex, setDraggedImageIndex] = useState(null)
  const [draggedType, setDraggedType] = useState(null)
  const [toast, setToast] = useState({ type: '', message: '' })
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef(null)
  const itemsPerPage = 4

  const showToast = (type, message) => {
    clearTimeout(toastTimer.current)
    setToast({ type, message })
    setToastVisible(true)
    toastTimer.current = setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => setToast({ type: '', message: '' }), 300)
    }, 4000)
  }

  useEffect(() => {
    return () => clearTimeout(toastTimer.current)
  }, [])

  const loadProjects = async () => {
    const { data } = await client.get('/projects')
    setProjects(data)
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadProjects()
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  const filteredProjects = projects.filter((project) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = (
      project.title.toLowerCase().includes(searchLower) ||
      project.location.toLowerCase().includes(searchLower) ||
      project.category.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower)
    )
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId('')
    setFiles([])
    setFilePreviews([])
    setError('')
    setShowForm(false)
    setCurrentPage(1)
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setSuccess('')
  }

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (selectedFiles.length === 0) return

    setFiles((current) => [...current, ...selectedFiles])

    // Generate previews for selected files and append
    const previews = selectedFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(previews).then((results) => {
      setFilePreviews((current) => [...current, ...results])
    })

    // Reset input so the same file can be selected again
    event.target.value = ''
  }

  const removeNewImage = (index) => {
    setFiles((current) => current.filter((_, i) => i !== index))
    setFilePreviews((current) => current.filter((_, i) => i !== index))
  }

  const handleDragStart = (index, type) => {
    setDraggedImageIndex(index)
    setDraggedType(type)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDragEnd = () => {
    setDraggedImageIndex(null)
    setDraggedType(null)
  }

  const handleDrop = (index, type) => {
    if (draggedImageIndex === null || draggedType !== type) {
      setDraggedImageIndex(null)
      setDraggedType(null)
      return
    }
    
    if (type === 'existing') {
      const newImages = [...form.existingImages]
      const [draggedImage] = newImages.splice(draggedImageIndex, 1)
      newImages.splice(index, 0, draggedImage)
      setForm((current) => ({
        ...current,
        existingImages: newImages,
      }))
    } else if (type === 'new') {
      setFiles((current) => {
        const newFiles = [...current]
        const [draggedFile] = newFiles.splice(draggedImageIndex, 1)
        newFiles.splice(index, 0, draggedFile)
        return newFiles
      })
      setFilePreviews((current) => {
        const newPreviews = [...current]
        const [draggedPreview] = newPreviews.splice(draggedImageIndex, 1)
        newPreviews.splice(index, 0, draggedPreview)
        return newPreviews
      })
    }
    
    setDraggedImageIndex(null)
    setDraggedType(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'existingImages') {
          value.forEach((image) => payload.append('existingImages', image))
          return
        }

        payload.append(key, value)
      })
      Array.from(files).forEach((file) => payload.append('images', file))

      if (editingId) {
        await client.put(`/projects/${editingId}`, payload)
      } else {
        await client.post('/projects', payload)
      }

      await loadProjects()
      const actionMessage = editingId ? 'Project updated successfully.' : 'Project created successfully.'
      resetForm()
      showToast('success', actionMessage)
    } catch (requestError) {
      showToast('error', requestError.response?.data?.message || 'Unable to save project.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (project) => {
    setEditingId(project._id)
    setForm({
      title: project.title,
      slug: project.slug,
      description: project.description,
      location: project.location,
      category: project.category,
      status: project.status,
      featured: project.featured,
      completionDate: project.completionDate ? project.completionDate.slice(0, 10) : '',
      existingImages: project.images || [],
    })
    setShowForm(true)
  }

  const handleDelete = async (projectId) => {
    await client.delete(`/projects/${projectId}`)
    await loadProjects()
    if (editingId === projectId) resetForm()
    showToast('success', 'Project deleted successfully.')
  }

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="card-panel px-6 py-14 bg-white">
        <LoadingSpinner label="Loading projects..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-6 right-6 z-50 transition-all duration-300 ease-in-out ${
          toastVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`flex items-center gap-3 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 shadow-lg text-xs sm:text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-rose-600 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
            <button
              onClick={() => {
                clearTimeout(toastTimer.current)
                setToastVisible(false)
                setTimeout(() => setToast({ type: '', message: '' }), 300)
              }}
              className="ml-2 rounded-full p-1 hover:bg-white/20 transition"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Manage Projects</h2>
          <p className="mt-1 text-sm text-slate-500">View, edit, and create projects with image uploads and status tracking.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {showForm ? 'Hide Form' : '+ Add Project'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="card-panel space-y-5 px-6 py-6 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">{editingId ? 'Edit Project' : 'Add Project'}</h2>
              <p className="mt-1 text-sm text-slate-500">Projects support image upload, featured states, and live status tracking.</p>
            </div>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-4 py-2 text-sm">
                Cancel Edit
              </button>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              ['title', 'Project Title'],
              ['slug', 'Slug'],
              ['location', 'Location'],
              ['category', 'Category'],
            ].map(([name, label]) => (
              <label key={name} className="space-y-2">
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <input
                  type="text"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500 bg-white text-slate-950"
                  required
                />
              </label>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500 bg-white text-slate-950"
              >
                <option value="planned">Planned</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Completion Date</span>
              <input
                type="date"
                name="completionDate"
                value={form.completionDate}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500 bg-white text-slate-950"
              />
            </label>
            <label className="flex items-center gap-3 pt-8 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-amber-600"
              />
              Featured on home page
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="5"
              className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500 bg-white text-slate-950"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Project Images</span>
            <p className="text-xs text-slate-500">Upload one or multiple images. You can add images to existing projects when editing.</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-4"
            />
          </label>

          {/* Display existing images */}
          {form.existingImages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">Existing Images (drag to reorder)</h4>
              <div className="flex flex-wrap gap-3">
                {form.existingImages.map((image, index) => (
                  <div
                    key={image}
                    draggable
                    onDragStart={() => handleDragStart(index, 'existing')}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDrop={() => handleDrop(index, 'existing')}
                    className={`relative group cursor-move transition ${
                      draggedImageIndex === index && draggedType === 'existing' ? 'opacity-50' : ''
                    }`}
                  >
                    <img src={image} alt="Project asset" className="h-20 w-24 rounded-2xl object-cover pointer-events-none" />
                    <button
                      type="button"
                      draggable={false}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setForm((current) => ({
                          ...current,
                          existingImages: current.existingImages.filter((item) => item !== image),
                        }))
                      }}
                      className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white cursor-pointer shadow-md hover:bg-rose-600 transition"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute inset-0 rounded-2xl border-2 border-amber-500 opacity-0 group-hover:opacity-100 transition pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display newly selected images */}
          {filePreviews.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">New Images to Upload ({filePreviews.length}) - drag to reorder</h4>
              <div className="flex flex-wrap gap-3">
                {filePreviews.map((preview, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index, 'new')}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onDrop={() => handleDrop(index, 'new')}
                    className={`relative group cursor-move transition ${
                      draggedImageIndex === index && draggedType === 'new' ? 'opacity-50' : ''
                    }`}
                  >
                    <img src={preview} alt="New project asset" className="h-20 w-24 rounded-2xl object-cover pointer-events-none" />
                    <button
                      type="button"
                      draggable={false}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        removeNewImage(index)
                      }}
                      className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white cursor-pointer shadow-md hover:bg-rose-600 transition"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute inset-0 rounded-2xl border-2 border-amber-500 opacity-0 group-hover:opacity-100 transition pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

          <button type="submit" disabled={saving} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition">
            {saving ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}
          </button>
        </form>
      ) : null}

      {!showForm && (
        <>
          {projects.length > 0 && (
            <div className="card-panel space-y-4 bg-white">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search projects by title, location, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-3 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {projectStatusFilters.map((filter) => {
                  const count = filter.value === 'all'
                    ? projects.length
                    : projects.filter((project) => project.status === filter.value).length
                  const isActive = statusFilter === filter.value

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setStatusFilter(filter.value)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                        isActive
                          ? 'border border-amber-200 bg-amber-100 text-amber-900 shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800'
                      }`}
                    >
                      {filter.label} ({count})
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {filteredProjects.length === 0 && projects.length > 0 ? (
            <EmptyState title="No projects found" copy="Try adjusting your search query or status filter." />
          ) : projects.length === 0 ? (
            <EmptyState title="No projects created" copy="Use the form above to add your first project." />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {paginatedProjects.map((project) => (
              <div key={project._id} className="card-panel flex flex-col gap-3 px-6 py-4 cursor-pointer hover:shadow-lg transition bg-white" onClick={() => {
                setSelectedProject(project)
                setCurrentImageIndex(0)
              }}>
                <div className="relative overflow-hidden rounded-2xl">
                  <img src={project.images?.[0]} alt={project.title} className="h-24 w-full object-cover" />
                  {project.images && project.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                      </svg>
                      {project.images.length}
                    </div>
                  )}
                </div>
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-950">{project.title}</h3>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {project.category} • {project.location}
                    </p>
                    {project.completionDate ? (
                      <p className="text-xs text-slate-500">Completion: {formatDate(project.completionDate)}</p>
                    ) : null}
                </div>
                <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => handleEdit(project)} className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600" title="Edit project">
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(project._id)}
                    className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-6 py-4 bg-white">
                  <span className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="rounded-full border border-slate-200 p-2 text-slate-600 disabled:opacity-50 transition hover:bg-slate-50"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-full border border-slate-200 p-2 text-slate-600 disabled:opacity-50 transition hover:bg-slate-50"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 rounded-t-3xl px-6 sm:px-8 py-4 sm:py-6 flex items-start justify-between gap-4">
              <div className="flex-grow min-w-0">
                <p className="text-xs font-medium text-slate-500">{selectedProject.category}</p>
                <h2 className="mt-1 text-xl sm:text-2xl font-semibold text-slate-950 line-clamp-2">{selectedProject.title}</h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="flex-shrink-0 rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition"
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
                  <h3 className="text-sm font-semibold text-slate-950 mb-2">Description</h3>
                  <p className="text-sm leading-7 text-slate-600 whitespace-pre-wrap">
                    {selectedProject.description}
                  </p>
                </div>
                {selectedProject.completionDate && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Completion Date: <span className="text-amber-700">{formatDate(selectedProject.completionDate)}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 rounded-b-3xl px-6 sm:px-8 py-4 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-full border border-slate-200 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProjectsPage
