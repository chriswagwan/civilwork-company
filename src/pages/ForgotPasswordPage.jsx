import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Copy, Mail, ShieldCheck } from 'lucide-react'
import client from '../api/client.js'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [resetLink, setResetLink] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    setResetLink('')
    setCopied(false)

    try {
      const { data } = await client.post('/auth/forgot-password', { email })
      setMessage(data.message || 'If an account exists, a reset link has been generated.')
      setResetLink(data.resetLink || '')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to generate a password reset link.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resetLink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-amber-100 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-amber-950/40">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-[-5rem] top-12 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute bottom-0 right-[-4rem] h-72 w-72 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />
      </div>

      <Link
        to="/admin/login"
        className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
      >
        <ArrowLeft size={16} />
        <span>Back to Login</span>
      </Link>

      <div className="relative z-10 w-full max-w-lg rounded-[2rem] border border-white/60 bg-white/90 p-8 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-slate-900 text-white shadow-lg shadow-amber-500/20">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Reset admin password</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            Enter the admin login email to generate a secure password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Admin Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3 text-sm outline-none transition focus:border-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="admin@example.com"
                required
              />
            </div>
          </label>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {message && !error && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {resetLink && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Generated reset link</p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Copy size={14} />
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <a
                href={resetLink}
                className="mt-3 block break-all text-sm font-medium text-amber-700 underline decoration-amber-300 underline-offset-4 dark:text-amber-400"
              >
                {resetLink}
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-slate-900 to-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-slate-800 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Generating reset link...' : 'Generate Reset Link'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPasswordPage