import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import client from '../api/client.js'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'

const getPasswordStrength = (password) => {
  let score = 0

  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 1) return { label: 'Weak', width: 'w-1/4', color: 'bg-rose-500' }
  if (score <= 3) return { label: 'Medium', width: 'w-2/3', color: 'bg-amber-500' }
  return { label: 'Strong', width: 'w-full', color: 'bg-emerald-500' }
}

const ResetPasswordPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password])

  useEffect(() => {
    let isMounted = true

    const verifyToken = async () => {
      try {
        await client.get(`/auth/verify-reset-token/${token}`)
        if (isMounted) setStatus('ready')
      } catch (requestError) {
        if (isMounted) {
          setStatus('invalid')
          setError(requestError.response?.data?.message || 'This password reset link is invalid or has expired.')
        }
      }
    }

    if (!token) {
      setStatus('invalid')
      setError('Password reset token is missing.')
      return undefined
    }

    verifyToken()

    return () => {
      isMounted = false
    }
  }, [token])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSaving(true)

    try {
      const { data } = await client.post(`/auth/reset-password/${token}`, form)
      setSuccessMessage(data.message || 'Password reset successfully.')
      setStatus('success')
      window.setTimeout(() => navigate('/admin/login', { replace: true }), 1600)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset password with this link.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_28%),linear-gradient(135deg,_#f8fafc_0%,_#e2e8f0_45%,_#cbd5e1_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.14),_transparent_25%),linear-gradient(135deg,_#020617_0%,_#0f172a_55%,_#111827_100%)]">
      <div className="absolute inset-0 opacity-50">
        <div className="absolute left-[-8rem] top-16 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute bottom-10 right-[-6rem] h-80 w-80 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/10" />
      </div>

      <Link
        to="/admin/login"
        className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900"
      >
        <ArrowLeft size={16} />
        <span>Back to Login</span>
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 p-8 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/85 sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-slate-900 text-white shadow-lg shadow-amber-500/20">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Create a new password</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              This secure link can be used once before it expires.
            </p>
          </div>

          {status === 'loading' && (
            <div className="flex min-h-52 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/40">
              <LoadingSpinner label="Verifying password reset link..." />
            </div>
          )}

          {status === 'invalid' && (
            <div className="space-y-5 rounded-3xl border border-rose-200 bg-rose-50/80 p-6 dark:border-rose-900/60 dark:bg-rose-950/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 text-rose-600 dark:text-rose-400" size={20} />
                <div>
                  <h2 className="text-lg font-semibold text-rose-900 dark:text-rose-100">Link unavailable</h2>
                  <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">{error}</p>
                </div>
              </div>
              <p className="text-sm text-rose-700/90 dark:text-rose-300/90">Generate a fresh password reset link from the admin login page and try again.</p>
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  New password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:shadow-lg focus:shadow-slate-300/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-400 dark:focus:shadow-slate-950/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    <span>Password strength</span>
                    <span>{form.password ? passwordStrength.label : 'Enter password'}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className={`h-2 rounded-full transition-all duration-300 ${form.password ? `${passwordStrength.width} ${passwordStrength.color}` : 'w-0'}`} />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:shadow-lg focus:shadow-slate-300/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-400 dark:focus:shadow-slate-950/40"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-slate-800 via-slate-900 to-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving password...' : 'Reset Password'}
              </button>
            </form>
          )}

          {status === 'success' && (
            <div className="space-y-5 rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 text-emerald-600 dark:text-emerald-400" size={20} />
                <div>
                  <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Password updated</h2>
                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/login', { replace: true })}
                className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Continue to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage