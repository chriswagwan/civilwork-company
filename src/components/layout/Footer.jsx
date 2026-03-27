import { Mail, Phone, MapPin, ArrowUpRight, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSiteSettings } from '../../hooks/useSiteSettings.js'

const Footer = () => {
  const { settings } = useSiteSettings()

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="relative overflow-hidden bg-[#162c44] dark:bg-[#0f172a] pt-12 sm:pt-16 md:pt-20 pb-6 sm:pb-8 mt-16 sm:mt-20 md:mt-24 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] border-t border-slate-200 dark:border-slate-800">
      {/* Decorative ambient spots for dark mode */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none hidden dark:block transition-opacity duration-1000"></div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none hidden dark:block transition-opacity duration-1000"></div>

      <div className="site-container relative z-10">
        <div className="grid gap-8 sm:gap-10 md:gap-12 lg:gap-16 grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr]">
          {/* Company Info */}
          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-sm sm:text-base font-bold text-white shadow-lg dark:shadow-[0_0_20px_rgba(99,102,241,0.2)] border border-transparent dark:border-indigo-500/20">
              CW
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.35em] text-white">{settings.companyName}</p>
              <p className="mt-4 max-w-md text-xs sm:text-sm leading-6 sm:leading-7 text-slate-300 dark:text-slate-400">{settings.footerSummary}</p>
            </div>
          </div>

          {/* Office */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-white flex items-center gap-2 group cursor-default">
              <MapPin size={18} className="text-indigo-500" />
              Office
            </h3>
            <div className="rounded-3xl bg-white dark:bg-slate-800/40 p-4 sm:p-5 space-y-3 hover:shadow-xl dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.1)] transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:dark:border-indigo-500/30 backdrop-blur-md relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-blue-500/0 group-hover:dark:from-indigo-500/5 group-hover:dark:to-blue-500/5 transition-colors duration-500 pointer-events-none"></div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug relative z-10">{settings.addressLine1}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 relative z-10">{settings.addressLine2}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-700 relative z-10">
                {settings.officeHours}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-white flex items-center gap-2 group cursor-default">
              <Mail size={18} className="text-indigo-500" />
              Contact
            </h3>
            <div className="space-y-3">
              <a
                href={`mailto:${settings.contactEmail}`}
                className="relative overflow-hidden flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-800/40 px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700/60 hover:shadow-lg dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300 group border border-slate-200 dark:border-slate-700 backdrop-blur-md hover:border-indigo-300 dark:hover:border-indigo-500/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent dark:via-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Mail size={18} className="text-indigo-500 group-hover:scale-110 transition-all flex-shrink-0 relative z-10" />
                <span className="truncate group-hover:dark:text-white transition-colors relative z-10">{settings.contactEmail}</span>
              </a>
              <a
                href={`tel:${settings.contactPhone}`}
                className="relative overflow-hidden flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-800/40 px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700/60 hover:shadow-lg dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300 group border border-slate-200 dark:border-slate-700 backdrop-blur-md hover:border-indigo-300 dark:hover:border-indigo-500/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent dark:via-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Phone size={18} className="text-indigo-500 group-hover:scale-110 transition-all flex-shrink-0 relative z-10" />
                <span className="truncate group-hover:dark:text-white transition-colors relative z-10">{settings.contactPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 sm:my-10 md:my-12 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/login"
              className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-500 transition-colors duration-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl"
              title="Admin Portal"
              aria-label="Admin Portal"
            >
              <Lock size={18} />
            </Link>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-500">
              © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
            </p>
          </div>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white hover:shadow-lg dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-300 group border border-slate-700 dark:border-slate-600 hover:border-slate-600 dark:hover:border-indigo-500/50 whitespace-nowrap uppercase tracking-[0.1em]"
          >
            Back to top
            <ArrowUpRight size={16} className="text-indigo-500 group-hover:-translate-y-1 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer
