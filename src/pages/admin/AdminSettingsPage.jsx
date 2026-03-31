import { CheckCircle2, X, AlertCircle, ShieldCheck, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import client from '../../api/client.js'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useSiteSettings } from '../../hooks/useSiteSettings.js'

const initialCredentialsForm = {
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
}

const AdminSettingsPage = () => {
  const { settings, loading, updateSettings, refreshSettings } = useSiteSettings()
  const { user, updateAuth } = useAuth()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [showForm, setShowForm] = useState(false)
  const [showCredentialsForm, setShowCredentialsForm] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [credentialsForm, setCredentialsForm] = useState(initialCredentialsForm)
  const [credentialsSaving, setCredentialsSaving] = useState(false)
  const [credentialsFeedback, setCredentialsFeedback] = useState({ type: '', message: '' })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const feedbackTimer = useRef(null)

  const showFeedback = (type, message) => {
    clearTimeout(feedbackTimer.current)
    setFeedback({ type, message })
    setToastVisible(true)
    feedbackTimer.current = setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => setFeedback({ type: '', message: '' }), 300)
    }, 4000)
  }

  useEffect(() => {
    return () => clearTimeout(feedbackTimer.current)
  }, [])

  useEffect(() => {
    setForm(settings)
  }, [settings])

  useEffect(() => {
    setCredentialsForm((current) => ({
      ...current,
      email: user?.email || '',
    }))
  }, [user?.email])

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleCredentialChange = (event) => {
    const { name, value } = event.target
    setCredentialsForm((current) => ({
      ...current,
      [name]: value,
    }))

    if (credentialsFeedback.message) {
      setCredentialsFeedback({ type: '', message: '' })
    }
  }

  const handleAbort = () => {
    setForm(settings)
    setShowForm(false)
    setFeedback({ type: '', message: '' })
  }

  const resetCredentialsForm = (nextEmail = user?.email || '') => {
    setCredentialsForm({
      ...initialCredentialsForm,
      email: nextEmail,
    })
  }

  const handleCredentialsToggle = () => {
    if (showCredentialsForm) {
      resetCredentialsForm()
      setCredentialsFeedback({ type: '', message: '' })
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    }

    setShowCredentialsForm((current) => !current)
  }

  const handleCredentialsSubmit = async (event) => {
    event.preventDefault()
    setCredentialsFeedback({ type: '', message: '' })

    const trimmedEmail = credentialsForm.email.trim().toLowerCase()

    if (!credentialsForm.currentPassword) {
      setCredentialsFeedback({ type: 'error', message: 'Current password is required to update login credentials.' })
      return
    }

    if (!trimmedEmail && !credentialsForm.newPassword) {
      setCredentialsFeedback({ type: 'error', message: 'Enter a new email, a new password, or both.' })
      return
    }

    if (credentialsForm.newPassword && credentialsForm.newPassword.length < 6) {
      setCredentialsFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' })
      return
    }

    if (credentialsForm.newPassword !== credentialsForm.confirmNewPassword) {
      setCredentialsFeedback({ type: 'error', message: 'New passwords do not match.' })
      return
    }

    setCredentialsSaving(true)

    try {
      const { data } = await client.put('/auth/admin-credentials', {
        email: trimmedEmail,
        currentPassword: credentialsForm.currentPassword,
        newPassword: credentialsForm.newPassword,
        confirmNewPassword: credentialsForm.confirmNewPassword,
      })

      updateAuth(data.user)
      resetCredentialsForm(data.user.email)
      setCredentialsFeedback({ type: 'success', message: data.message || 'Login credentials updated successfully.' })
    } catch (error) {
      setCredentialsFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Unable to update login credentials.',
      })
    } finally {
      setCredentialsSaving(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFeedback({ type: '', message: '' })

    try {
      await updateSettings(form)
      await refreshSettings()
      showFeedback('success', 'Website settings updated successfully.')
      setShowForm(false)
    } catch (error) {
      showFeedback('error', error.response?.data?.message || 'Unable to update company settings.')
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
      {feedback.message && (
        <div
          className={`fixed top-6 right-6 z-50 transition-all duration-300 ease-in-out ${
            toastVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          <div
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-medium shadow-lg sm:px-5 sm:py-4 sm:text-sm ${
              feedback.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
            <button
              onClick={() => {
                clearTimeout(feedbackTimer.current)
                setToastVisible(false)
                setTimeout(() => setFeedback({ type: '', message: '' }), 300)
              }}
              className="ml-2 rounded-full p-1 transition hover:bg-white/20"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">Website Settings</h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">Manage company information, contact details, and public-facing content.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="whitespace-nowrap rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 sm:px-5 sm:py-3 sm:text-sm"
            >
              {showForm ? 'Cancel' : 'Update Settings'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="card-panel space-y-4 px-4 py-6 sm:space-y-6 sm:px-6">
              <div>
                <h3 className="text-base font-semibold text-slate-950 sm:text-lg">Company Settings</h3>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">Update the contact details and company information shown on the public website.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
                <label className="space-y-2">
                  <span className="text-xs font-medium text-slate-700 sm:text-sm">Company Name</span>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName || ''}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 sm:px-4 sm:py-3"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-medium text-slate-700 sm:text-sm">Tagline</span>
                  <input
                    type="text"
                    name="companyTagline"
                    value={form.companyTagline || ''}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 sm:px-4 sm:py-3"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
                <label className="space-y-2">
                  <span className="text-xs font-medium text-slate-700 sm:text-sm">Contact Email</span>
                  <input
                    type="email"
                    name="contactEmail"
                    value={form.contactEmail || ''}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 sm:px-4 sm:py-3"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-medium text-slate-700 sm:text-sm">Contact Phone</span>
                  <input
                    type="text"
                    name="contactPhone"
                    value={form.contactPhone || ''}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 sm:px-4 sm:py-3"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
                <label className="space-y-2">
                  <span className="text-xs font-medium text-slate-700 sm:text-sm">Address Line 1</span>
                  <input
                    type="text"
                    name="addressLine1"
                    value={form.addressLine1 || ''}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 sm:px-4 sm:py-3"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-medium text-slate-700 sm:text-sm">Address Line 2</span>
                  <input
                    type="text"
                    name="addressLine2"
                    value={form.addressLine2 || ''}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 sm:px-4 sm:py-3"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-xs font-medium text-slate-700 sm:text-sm">Office Hours</span>
                <input
                  type="text"
                  name="officeHours"
                  value={form.officeHours || ''}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 sm:px-4 sm:py-3"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-medium text-slate-700 sm:text-sm">Contact Page Intro</span>
                <textarea
                  name="contactIntro"
                  value={form.contactIntro || ''}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-3xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 sm:px-4 sm:py-3"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-medium text-slate-700 sm:text-sm">Footer Summary</span>
                <textarea
                  name="footerSummary"
                  value={form.footerSummary || ''}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-3xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 sm:px-4 sm:py-3"
                />
              </label>

              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="whitespace-nowrap rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 sm:px-5 sm:py-3 sm:text-sm"
                >
                  {saving ? 'Saving...' : 'Update Settings'}
                </button>
                <button
                  type="button"
                  onClick={handleAbort}
                  className="rounded-full border border-slate-200 px-4 py-2.5 text-xs font-semibold transition hover:bg-slate-50 sm:px-5 sm:py-3 sm:text-sm"
                >
                  Abort
                </button>
              </div>
            </form>
          )}
        </section>

        <aside className="space-y-6">
          <section className="card-panel overflow-hidden px-5 py-6 sm:px-6">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Login Credentials</h3>
                <p className="mt-1 text-sm text-slate-500">Change the admin email used for sign-in and rotate the password without leaving the dashboard.</p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Current Sign-In</p>
                  <p className="mt-2 truncate text-base font-semibold text-slate-950">{user?.email || 'No email available'}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCredentialsToggle}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    showCredentialsForm
                      ? 'border border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                      : 'bg-gradient-to-r from-slate-950 via-slate-800 to-zinc-700 text-white shadow-lg shadow-slate-900/25 hover:from-slate-900 hover:via-slate-700 hover:to-zinc-600'
                  }`}
                >
                  {showCredentialsForm ? 'Hide Form' : 'Update Login Credentials'}
                </button>
              </div>
            </div>

            {showCredentialsForm && (
              <form onSubmit={handleCredentialsSubmit} className="mt-5 space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Login Email</span>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={credentialsForm.email}
                      onChange={handleCredentialChange}
                      className="w-full rounded-2xl border border-slate-200 px-12 py-3 text-sm outline-none transition focus:border-amber-500"
                      placeholder="admin@example.com"
                    />
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Current Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={credentialsForm.currentPassword}
                      onChange={handleCredentialChange}
                      className="w-full rounded-2xl border border-slate-200 px-12 py-3 pr-12 text-sm outline-none transition focus:border-amber-500"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">New Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={credentialsForm.newPassword}
                      onChange={handleCredentialChange}
                      className="w-full rounded-2xl border border-slate-200 px-12 py-3 pr-12 text-sm outline-none transition focus:border-amber-500"
                      placeholder="Leave blank to keep current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Confirm New Password</span>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmNewPassword"
                      value={credentialsForm.confirmNewPassword}
                      onChange={handleCredentialChange}
                      className="w-full rounded-2xl border border-slate-200 px-12 py-3 pr-12 text-sm outline-none transition focus:border-amber-500"
                      placeholder="Confirm the new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                {credentialsFeedback.message && (
                  <div
                    className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                      credentialsFeedback.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {credentialsFeedback.type === 'success' ? (
                      <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    )}
                    <p>{credentialsFeedback.message}</p>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Changing the login email updates the account used on the admin login screen. Enter your current password to confirm any credential change.
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={credentialsSaving}
                    className="w-full rounded-2xl bg-gradient-to-r from-slate-950 via-slate-800 to-zinc-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:from-slate-900 hover:via-slate-700 hover:to-zinc-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {credentialsSaving ? 'Updating credentials...' : 'Save Credential Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCredentialsToggle}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-white px-5 py-6 shadow-sm sm:px-6">
            <h3 className="text-lg font-semibold text-slate-950">Forgot your password?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Use the forgot-password flow from the login screen to generate a secure reset link if you no longer remember the current password.
            </p>
            <a
              href="/admin/forgot-password"
              className="mt-4 inline-flex items-center rounded-full bg-gradient-to-r from-slate-950 via-slate-800 to-zinc-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:from-slate-900 hover:via-slate-700 hover:to-zinc-600"
            >
              Open Password Reset
            </a>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default AdminSettingsPage
