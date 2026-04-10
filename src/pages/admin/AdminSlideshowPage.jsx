import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import client from '../../api/client.js'
import EmptyState from '../../components/common/EmptyState.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'

const AdminSlideshowPage = () => {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [title, setTitle] = useState('')
  const [order, setOrder] = useState(0)
  const [active, setActive] = useState(true)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  useEffect(() => {
    loadSlides()
  }, [])

  const loadSlides = async () => {
    try {
      const { data } = await client.get('/slideshow')
      setSlides(data)
    } catch (error) {
      console.error('Error loading slides:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || [])
    if (editingId) {
      setImageFiles(files.slice(0, 1))
      setImagePreviews(files.slice(0, 1).map((f) => URL.createObjectURL(f)))
    } else {
      setImageFiles(files)
      setImagePreviews(files.map((f) => URL.createObjectURL(f)))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFeedback({ type: '', message: '' })

    try {
      const payload = new FormData()
      payload.append('title', title)
      payload.append('order', order)
      payload.append('active', active)

      if (editingId) {
        if (imageFiles.length > 0) payload.append('image', imageFiles[0])
        await client.put(`/slideshow/${editingId}`, payload)
        setFeedback({ type: 'success', message: 'Slide updated successfully.' })
      } else {
        if (imageFiles.length === 0) {
          setFeedback({ type: 'error', message: 'Please select at least one image.' })
          setSaving(false)
          return
        }
        imageFiles.forEach((file) => payload.append('images', file))
        await client.post('/slideshow', payload)
        setFeedback({ type: 'success', message: `${imageFiles.length} slide(s) added successfully.` })
      }

      await loadSlides()
      resetForm()
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Unable to save slide.',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (slide) => {
    setEditingId(slide._id)
    setTitle(slide.title || '')
    setOrder(slide.order || 0)
    setActive(slide.active)
    setImageFiles([])
    setImagePreviews([slide.image])
    setShowForm(true)
    setFeedback({ type: '', message: '' })
  }

  const handleToggleActive = async (slide) => {
    try {
      await client.put(`/slideshow/${slide._id}`, { active: !slide.active })
      await loadSlides()
    } catch (error) {
      setFeedback({ type: 'error', message: 'Unable to update slide.' })
    }
  }

  const handleDelete = async (slideId) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return

    try {
      await client.delete(`/slideshow/${slideId}`)
      await loadSlides()
      setFeedback({ type: 'success', message: 'Slide deleted successfully.' })
      if (editingId === slideId) resetForm()
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Unable to delete slide.',
      })
    }
  }

  const resetForm = () => {
    setEditingId('')
    setTitle('')
    setOrder(0)
    setActive(true)
    setImageFiles([])
    setImagePreviews([])
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">Slideshow</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage trending images displayed on the homepage.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700"
        >
          <Plus size={18} />
          Add Slide
        </button>
      </div>

      {feedback.message && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
          feedback.type === 'success'
            ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {feedback.message}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card-panel space-y-5 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {editingId ? 'Edit Slide' : 'New Slide'}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Caption (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New bridge project underway"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {editingId ? 'Image' : 'Images'} {!editingId && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple={!editingId}
              onChange={handleImageChange}
              className="w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-amber-700 hover:file:bg-amber-100 dark:text-slate-400 dark:file:bg-amber-900/30 dark:file:text-amber-400"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {imagePreviews.map((src, i) => (
                  <img key={i} src={src} alt={`Preview ${i + 1}`} className="h-28 w-full rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Slide' : 'Add Slide'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="card-panel flex justify-center px-6 py-14">
          <LoadingSpinner label="Loading slides..." />
        </div>
      ) : slides.length === 0 ? (
        <EmptyState title="No slides yet" copy="Add images to create a trending slideshow on the homepage." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide) => (
            <div key={slide._id} className={`card-panel overflow-hidden transition ${!slide.active ? 'opacity-60' : ''}`}>
              <div className="relative h-44 sm:h-52">
                <img src={slide.image} alt={slide.title || 'Slide'} className="h-full w-full object-cover" />
                {!slide.active && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50">
                    <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">Hidden</span>
                  </div>
                )}
                {slide.title && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 to-transparent px-4 py-3">
                    <p className="text-sm font-medium text-white truncate">{slide.title}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">Order: {slide.order}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    title={slide.active ? 'Hide slide' : 'Show slide'}
                  >
                    {slide.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleEdit(slide)}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    title="Edit slide"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(slide._id)}
                    className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/30"
                    title="Delete slide"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminSlideshowPage
