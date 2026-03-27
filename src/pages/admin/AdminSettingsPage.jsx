import { useEffect, useState } from 'react'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { useSiteSettings } from '../../hooks/useSiteSettings.js'

const AdminSettingsPage = () => {
  const { settings, loading, updateSettings, refreshSettings } = useSiteSettings()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setForm(settings)
  }, [settings])

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleAbort = () => {
    setForm(settings)
    setShowForm(false)
    setFeedback({ type: '', message: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFeedback({ type: '', message: '' })

    try {
      await updateSettings(form)
      await refreshSettings()
      setFeedback({ type: 'success', message: 'Website settings updated successfully.' })
      setShowForm(false)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Unable to update company settings.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="card-panel px-6 py-14">
        <LoadingSpinner label="Loading company settings..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-950">Website Settings</h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">Manage company information, contact details, and content.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-full bg-slate-950 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-800 whitespace-nowrap"
        >
          {showForm ? 'Cancel' : 'Update Settings'}
        </button>
      </div>

      {/* Company Settings Form - Conditional Display */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card-panel space-y-4 sm:space-y-6 px-4 sm:px-6 py-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-950">Company Settings</h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">Update the contact details and company information shown on the public website.</p>
          </div>

          <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700">Company Name</span>
              <input
                type="text"
                name="companyName"
                value={form.companyName || ''}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-amber-500"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700">Tagline</span>
              <input
                type="text"
                name="companyTagline"
                value={form.companyTagline || ''}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-amber-500"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700">Contact Email</span>
              <input
                type="email"
                name="contactEmail"
                value={form.contactEmail || ''}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-amber-500"
              />
          </label>
          <label className="space-y-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700">Contact Phone</span>
            <input
              type="text"
              name="contactPhone"
              value={form.contactPhone || ''}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-amber-500"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:gap-4 md:gap-5 grid-cols-1 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700">Address Line 1</span>
            <input
              type="text"
              name="addressLine1"
              value={form.addressLine1 || ''}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-amber-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700">Address Line 2</span>
            <input
              type="text"
              name="addressLine2"
              value={form.addressLine2 || ''}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-amber-500"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-xs sm:text-sm font-medium text-slate-700">Office Hours</span>
          <input
            type="text"
            name="officeHours"
            value={form.officeHours || ''}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-amber-500"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs sm:text-sm font-medium text-slate-700">Contact Page Intro</span>
          <textarea
            name="contactIntro"
            value={form.contactIntro || ''}
            onChange={handleChange}
            rows="4"
            className="w-full rounded-3xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-amber-500"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs sm:text-sm font-medium text-slate-700">Footer Summary</span>
          <textarea
            name="footerSummary"
            value={form.footerSummary || ''}
            onChange={handleChange}
            rows="4"
            className="w-full rounded-3xl border border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:border-amber-500"
          />
        </label>

        {feedback.message ? (
          <div
            className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-slate-950 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 transition hover:bg-slate-800 whitespace-nowrap"
          >
            {saving ? 'Saving...' : 'Update Settings'}
          </button>
          <button
            type="button"
            onClick={handleAbort}
            className="rounded-full border border-slate-200 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition hover:bg-slate-50"
          >
            Abort
          </button>
        </div>
      </form>
      )}
    </div>
  )
}

export default AdminSettingsPage
