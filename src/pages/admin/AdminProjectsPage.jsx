import { Search, Trash2, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
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

const AdminProjectsPage = () => {
  const [projects, setProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
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
  const itemsPerPage = 4

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
    return (
      project.title.toLowerCase().includes(searchLower) ||
      project.location.toLowerCase().includes(searchLower) ||
      project.category.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower)
    )
  })

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
    setFiles(selectedFiles)

    // Generate previews for selected files
    const previews = selectedFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(previews).then((results) => {
      setFilePreviews(results)
    })
  }

  const removeNewImage = (index) => {
    setFiles((current) => current.filter((_, i) => i !== index))
    setFilePreviews((current) => current.filter((_, i) => i !== index))
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
      setSuccess(actionMessage)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save project.')
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
  }

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="card-panel px-6 py-14">
        <LoadingSpinner label="Loading projects..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
        <form onSubmit={handleSubmit} className="card-panel space-y-5 px-6 py-6">
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
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500"
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
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500"
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
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500"
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
              className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500"
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
              <h4 className="text-sm font-medium text-slate-700 mb-3">Existing Images</h4>
              <div className="flex flex-wrap gap-3">
                {form.existingImages.map((image) => (
                  <div key={image} className="relative group">
                    <img src={image} alt="Project asset" className="h-20 w-24 rounded-2xl object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          existingImages: current.existingImages.filter((item) => item !== image),
                        }))
                      }
                      className="absolute right-2 top-2 rounded-full bg-rose-500 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Display newly selected images */}
          {filePreviews.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">New Images to Upload ({filePreviews.length})</h4>
              <div className="flex flex-wrap gap-3">
                {filePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt="New project asset" className="h-20 w-24 rounded-2xl object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-rose-500 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
          {success ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

          <button type="submit" disabled={saving} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
            {saving ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}
          </button>
        </form>
      ) : null}

      {!showForm && (
        <>
          {projects.length > 0 && (
            <div className="card-panel">
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
            </div>
          )}

          {filteredProjects.length === 0 && projects.length > 0 ? (
            <EmptyState title="No projects found" copy="Try adjusting your search query." />
          ) : projects.length === 0 ? (
            <EmptyState title="No projects created" copy="Use the form above to add your first project." />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {paginatedProjects.map((project) => (
              <div key={project._id} className="card-panel flex flex-col gap-3 px-6 py-4">
                <img src={project.images?.[0]} alt={project.title} className="h-24 w-full rounded-2xl object-cover" />
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
                <div className="flex gap-3">
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
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-6 py-4">
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
    </div>
  )
}

export default AdminProjectsPage
