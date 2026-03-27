import { Search, Trash2, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import client from '../../api/client.js'
import EmptyState from '../../components/common/EmptyState.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'

const emptyService = {
  name: '',
  description: '',
  icon: 'building-2',
  highlightsText: '',
}

const AdminServicesPage = () => {
  const [services, setServices] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [form, setForm] = useState(emptyService)
  const [editingId, setEditingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const loadServices = async () => {
    const { data } = await client.get('/services')
    setServices(data)
  }

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadServices()
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  const filteredServices = services.filter((service) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      service.name.toLowerCase().includes(searchLower) ||
      service.description.toLowerCase().includes(searchLower) ||
      service.highlights?.some((highlight) => highlight.toLowerCase().includes(searchLower))
    )
  })

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
    setSuccess('')
  }

  const resetForm = () => {
    setForm(emptyService)
    setEditingId('')
    setError('')
    setShowForm(false)
    setCurrentPage(1)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const payload = {
      name: form.name,
      description: form.description,
      icon: form.icon,
      highlights: form.highlightsText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    }

    try {
      if (editingId) {
        await client.put(`/services/${editingId}`, payload)
      } else {
        await client.post('/services', payload)
      }

      await loadServices()
      const actionMessage = editingId ? 'Service updated successfully.' : 'Service created successfully.'
      resetForm()
      setSuccess(actionMessage)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save service.')
    }
  }

  const handleEdit = (service) => {
    setEditingId(service._id)
    setForm({
      name: service.name,
      description: service.description,
      icon: service.icon,
      highlightsText: service.highlights?.join(', ') || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (serviceId) => {
    await client.delete(`/services/${serviceId}`)
    await loadServices()
    if (editingId === serviceId) resetForm()
  }

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedServices = filteredServices.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="card-panel px-6 py-14">
        <LoadingSpinner label="Loading services..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Manage Services</h2>
          <p className="mt-1 text-sm text-slate-500">Create and manage the public services catalog shown on the website.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {showForm ? 'Hide Form' : '+ Add Service'}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="card-panel space-y-5 px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">{editingId ? 'Edit Service' : 'Add Service'}</h2>
              <p className="mt-1 text-sm text-slate-500">Control the public services catalog shown on the website.</p>
            </div>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 px-4 py-2 text-sm">
                Cancel Edit
              </button>
            ) : null}
          </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Service Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Icon</span>
            <select
              name="icon"
              value={form.icon}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500"
            >
              <option value="building-2">Building</option>
              <option value="route">Route</option>
              <option value="waves">Waves</option>
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Highlights</span>
          <input
            type="text"
            name="highlightsText"
            value={form.highlightsText}
            onChange={handleChange}
            placeholder="Earthworks, Asphalt paving, Site grading"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500"
          />
        </label>

        {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {success ? <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

        <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          {editingId ? 'Update Service' : 'Create Service'}
        </button>
        </form>
      ) : null}

      {!showForm && (
        <>
          {services.length > 0 && (
            <div className="card-panel">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search services by name, description, or highlights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-3 outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {filteredServices.length === 0 && services.length > 0 ? (
            <EmptyState title="No services found" copy="Try adjusting your search query." />
          ) : services.length === 0 ? (
            <EmptyState title="No services created" copy="Create services to power the public website." />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {paginatedServices.map((service) => (
              <div key={service._id} className="card-panel flex flex-col gap-3 px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-950">{service.name}</h3>
                <p className="text-sm leading-6 text-slate-600">{service.description}</p>
                {service.highlights?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {service.highlights.map((highlight) => (
                      <span key={highlight} className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-800">
                        {highlight}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => handleEdit(service)} className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600" title="Edit service">
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(service._id)}
                    className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete service"
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

export default AdminServicesPage
