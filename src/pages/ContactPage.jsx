import { Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import client from '../api/client.js'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import PageHero from '../components/layout/PageHero.jsx'
import { useSiteSettings } from '../hooks/useSiteSettings.js'
import { useLanguage } from '../hooks/useLanguage.js'
import { t } from '../utils/translations.js'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

const ContactPage = () => {
  const { settings } = useSiteSettings()
  const { language } = useLanguage()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setFeedback({ type: '', message: '' })

    try {
      const { data } = await client.post('/messages', form)
      setFeedback({ type: 'success', message: data.message })
      setForm(initialForm)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || 'Unable to send your message right now.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12 sm:space-y-14 pb-6 sm:pb-8">
      <PageHero
        eyebrow={t(language, 'contact.eyebrow')}
        title={t(language, 'contact.title')}
        copy={settings.contactIntro}
      />

      <section className="site-container grid gap-6 grid-cols-1 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4 sm:space-y-5">
          {[
            { icon: <Phone size={20} />, label: t(language, 'contact.contact_phone'), value: settings.contactPhone },
            { icon: <Mail size={20} />, label: t(language, 'contact.contact_email'), value: settings.contactEmail },
            {
              icon: <MapPin size={20} />,
              label: t(language, 'contact.contact_location'),
              value: `${settings.addressLine1}${settings.addressLine2 ? `, ${settings.addressLine2}` : ''}`,
            },
            { icon: <MapPin size={20} />, label: t(language, 'contact.contact_hours'), value: settings.officeHours },
          ].map(({ icon, label, value }) => (
            <div key={label} className="card-panel flex gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 flex-shrink-0">
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                <p className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-slate-950 break-words">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="card-panel space-y-4 sm:space-y-5 px-4 py-6 sm:px-6 sm:py-8 md:px-8">
          <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700">{t(language, 'contact.name')}</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none transition focus:border-amber-500"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700">{t(language, 'contact.email')}</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none transition focus:border-amber-500"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700">{t(language, 'contact.phone')}</span>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none transition focus:border-amber-500"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700">{t(language, 'contact.subject')}</span>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none transition focus:border-amber-500"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700">{t(language, 'contact.project_details')}</span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows="6"
              className="w-full rounded-3xl border border-slate-200 bg-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none transition focus:border-amber-500"
              required
            />
          </label>

          {feedback.message ? (
            <div
              className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {feedback.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <LoadingSpinner label={t(language, 'contact.sending')} /> : t(language, 'contact.send_message')}
          </button>
        </form>
      </section>
    </div>
  )
}

export default ContactPage
