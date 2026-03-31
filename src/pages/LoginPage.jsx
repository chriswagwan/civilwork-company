import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const htmlElement = document.documentElement
    const wasDark = htmlElement.classList.contains('dark')

    htmlElement.classList.remove('dark')
    htmlElement.style.colorScheme = 'light'

    return () => {
      if (wasDark) {
        htmlElement.classList.add('dark')
        htmlElement.style.colorScheme = 'dark'
      }
    }
  }, [])

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

    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }

    try {
      const data = await login(form)
      const fallbackPath = data.role === 'admin' ? '/admin/dashboard' : '/'
      const redirectPath = location.state?.from?.pathname || fallbackPath
      navigate(redirectPath, { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Invalid email or password.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 p-4 relative">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-200/20 dark:bg-gray-800/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-200/20 dark:bg-gray-800/30 rounded-full blur-3xl -z-10" />

      {/* Return Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 rounded-full px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors"
        title="Return to home"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium hidden sm:inline">Back to Home</span>
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-3xl px-6 py-10 sm:px-8 sm:py-12 border border-slate-100 dark:border-slate-700">
          {/* Logo / Header */}
          <div className="flex flex-col items-center mb-8">
            <img src="/icon.png" alt="Logo" className="h-14 w-14 rounded-2xl object-contain mb-4 shadow-lg" />
            <h1 className="text-3xl font-bold text-slate-950 dark:text-white text-center">Admin Login</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">Access the operations console</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="relative group">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={18} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300 focus:border-slate-800 dark:focus:border-slate-500 focus:shadow-lg focus:shadow-slate-300/30 dark:focus:shadow-slate-900/30"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative group">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all duration-300 focus:border-slate-800 dark:focus:border-slate-500 focus:shadow-lg focus:shadow-slate-300/30 dark:focus:shadow-slate-900/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-4 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-slate-800/20 dark:shadow-slate-950/40 hover:shadow-xl hover:shadow-slate-800/30 dark:hover:shadow-slate-950/50 transform hover:scale-105 active:scale-95 dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="flex justify-end">
              <Link
                to="/admin/forgot-password"
                className="text-sm font-medium text-amber-700 transition hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
              >
                Forgot password?
              </Link>
            </div>
          </form>

          {/* Footer Text */}
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-8">
            For authorized personnel only. Unauthorized access attempts are logged.
          </p>
        </div>

        {/* Security Badge */}
        <div className="text-center mt-6 flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Lock size={14} />
          <span>Secure connection</span>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
