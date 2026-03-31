import { Mail, MapPin, Phone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import client from '../api/client.js'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import PageHero from '../components/layout/PageHero.jsx'
import { useSiteSettings } from '../hooks/useSiteSettings.js'
import { useLanguage } from '../hooks/useLanguage.js'
import { usePublicTheme } from '../context/PublicThemeContext.jsx'
import { t } from '../utils/translations.js'

const initialForm = {
  name: '',
  email: '',
  phoneCountryCode: '',
  phone: '',
  subject: '',
  message: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[0-9]{9}$/
const phoneCountryOptions = [
  { value: '+1', label: 'United States (+1)' },
  { value: '+44', label: 'United Kingdom (+44)' },
  { value: '+33', label: 'France (+33)' },
  { value: '+49', label: 'Germany (+49)' },
  { value: '+34', label: 'Spain (+34)' },
  { value: '+39', label: 'Italy (+39)' },
  { value: '+212', label: 'Morocco (+212)' },
  { value: '+213', label: 'Algeria (+213)' },
  { value: '+216', label: 'Tunisia (+216)' },
  { value: '+20', label: 'Egypt (+20)' },
  { value: '+221', label: 'Senegal (+221)' },
  { value: '+225', label: 'Cote d\'Ivoire (+225)' },
  { value: '+234', label: 'Nigeria (+234)' },
  { value: '+233', label: 'Ghana (+233)' },
  { value: '+237', label: 'Cameroon (+237)' },
  { value: '+254', label: 'Kenya (+254)' },
  { value: '+250', label: 'Rwanda (+250)' },
  { value: '+251', label: 'Ethiopia (+251)' },
  { value: '+255', label: 'Tanzania (+255)' },
  { value: '+256', label: 'Uganda (+256)' },
  { value: '+27', label: 'South Africa (+27)' },
  { value: '+91', label: 'India (+91)' },
  { value: '+971', label: 'United Arab Emirates (+971)' },
]

const validateContactField = (name, value) => {
  const trimmedValue = value.trim()

  if (name === 'name') {
    if (!trimmedValue) {
      return 'Name is required.'
    }

    if (trimmedValue.length < 2 || trimmedValue.length > 80) {
      return 'Name must be between 2 and 80 characters.'
    }
  }

  if (name === 'email') {
    if (!trimmedValue) {
      return 'Email is required.'
    }

    if (!emailPattern.test(trimmedValue)) {
      return 'Enter a valid email address.'
    }
  }

  if (name === 'phoneCountryCode') {
    if (!trimmedValue) {
      return 'Select a country code.'
    }
  }

  if (name === 'phone') {
    if (!trimmedValue) {
      return 'Phone number is required.'
    }

    if (!phonePattern.test(trimmedValue)) {
      return 'Phone number must be exactly 9 digits.'
    }
  }

  if (name === 'subject') {
    if (!trimmedValue) {
      return 'Subject is required.'
    }

    if (trimmedValue.length < 3 || trimmedValue.length > 120) {
      return 'Subject must be between 3 and 120 characters.'
    }
  }

  if (name === 'message') {
    if (!trimmedValue) {
      return 'Project details are required.'
    }

    if (trimmedValue.length < 10 || trimmedValue.length > 2000) {
      return 'Project details must be between 10 and 2000 characters.'
    }
  }

  return ''
}

const validateContactForm = (form) => {
  const trimmedForm = Object.fromEntries(
    Object.entries(form).map(([key, value]) => [key, value.trim()]),
  )

  const errors = {}

  for (const [field, value] of Object.entries(trimmedForm)) {
    const error = validateContactField(field, value)
    if (error) {
      errors[field] = error
    }
  }

  return { errors, trimmedForm }
}

const getFieldClassName = (hasError) =>
  `w-full rounded-2xl border bg-white dark:bg-slate-900 dark:text-white px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none transition ${
    hasError
      ? 'border-rose-500 focus:border-rose-500 dark:border-rose-500 dark:focus:border-rose-400'
      : 'border-slate-200 dark:border-slate-700 focus:border-amber-500 dark:focus:border-amber-600'
  }`

const ContactPage = () => {
  const { settings } = useSiteSettings()
  const { language } = useLanguage()
  const { isDark } = usePublicTheme()
  const [form, setForm] = useState(initialForm)
  const [touchedFields, setTouchedFields] = useState({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [apiFieldErrors, setApiFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const feedbackTimeoutRef = useRef(null)
  const fieldRefs = useRef({})
  const { errors: validationErrors } = validateContactForm(form)

  const getDisplayedError = (fieldName) => {
    if (apiFieldErrors[fieldName]) {
      return apiFieldErrors[fieldName]
    }

    if (submitAttempted || touchedFields[fieldName]) {
      return validationErrors[fieldName] || ''
    }

    return ''
  }

  useEffect(() => {
    if (!feedback.message) {
      return undefined
    }

    window.clearTimeout(feedbackTimeoutRef.current)
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback({ type: '', message: '' })
    }, 4000)

    return () => {
      window.clearTimeout(feedbackTimeoutRef.current)
    }
  }, [feedback])

  const handleChange = (event) => {
    const { name, value } = event.target
    const nextForm = {
      ...form,
      [name]: value,
    }

    setForm(nextForm)
    setApiFieldErrors((current) => {
      if (!current[name]) {
        return current
      }

      return {
        ...current,
        [name]: '',
      }
    })
  }

  const handleBlur = (event) => {
    const { name } = event.target

    setTouchedFields((current) => ({
      ...current,
      [name]: true,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const { errors, trimmedForm } = validateContactForm(form)
    setSubmitAttempted(true)

    if (Object.keys(errors).length > 0) {
      const firstInvalidField = Object.keys(errors)[0]

      fieldRefs.current[firstInvalidField]?.focus()
      setFeedback({
        type: 'error',
        message: 'Please correct the highlighted fields before submitting.',
      })
      return
    }

    setLoading(true)
    setApiFieldErrors({})
    setFeedback({ type: '', message: '' })

    try {
      const payload = {
        ...trimmedForm,
        phone: `${trimmedForm.phoneCountryCode} ${trimmedForm.phone}`.trim(),
      }

      delete payload.phoneCountryCode

      const { data } = await client.post('/messages', payload)
      setFeedback({ type: 'success', message: data.message })
      setForm(initialForm)
      setTouchedFields({})
      setSubmitAttempted(false)
    } catch (error) {
      const apiErrors = error.response?.data?.errors

      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        setApiFieldErrors(
          apiErrors.reduce((accumulator, current) => {
            accumulator[current.field] = current.message
            return accumulator
          }, {}),
        )
      }

      setFeedback({
        type: 'error',
        message:
          apiErrors?.[0]?.message ||
          error.response?.data?.message ||
          'Unable to send your message right now.',
      })

      if (apiErrors?.[0]?.field) {
        fieldRefs.current[apiErrors[0].field]?.focus()
      }
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
              <div className="service-icon flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 flex-shrink-0">
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">{label}</p>
                <p className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-slate-950 dark:text-white break-words">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate className="card-panel space-y-4 sm:space-y-5 px-4 py-6 sm:px-6 sm:py-8 md:px-8">
          <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">{t(language, 'contact.name')}</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                ref={(element) => {
                  fieldRefs.current.name = element
                }}
                className={getFieldClassName(Boolean(getDisplayedError('name')))}
                aria-invalid={Boolean(getDisplayedError('name'))}
                aria-describedby={getDisplayedError('name') ? 'contact-name-error' : undefined}
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
              />
              {getDisplayedError('name') ? <p id="contact-name-error" className="text-xs font-medium text-rose-600 dark:text-rose-300">{getDisplayedError('name')}</p> : null}
            </label>
            <label className="space-y-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">{t(language, 'contact.email')}</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                ref={(element) => {
                  fieldRefs.current.email = element
                }}
                className={getFieldClassName(Boolean(getDisplayedError('email')))}
                aria-invalid={Boolean(getDisplayedError('email'))}
                aria-describedby={getDisplayedError('email') ? 'contact-email-error' : undefined}
                required
                autoComplete="email"
              />
              {getDisplayedError('email') ? <p id="contact-email-error" className="text-xs font-medium text-rose-600 dark:text-rose-300">{getDisplayedError('email')}</p> : null}
            </label>
          </div>

          <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">{t(language, 'contact.phone')}</span>
              <div className="grid grid-cols-[minmax(0,180px)_minmax(0,1fr)] gap-3">
                <select
                  name="phoneCountryCode"
                  value={form.phoneCountryCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(element) => {
                    fieldRefs.current.phoneCountryCode = element
                  }}
                  className={getFieldClassName(Boolean(getDisplayedError('phoneCountryCode')))}
                  aria-invalid={Boolean(getDisplayedError('phoneCountryCode'))}
                  aria-describedby={getDisplayedError('phoneCountryCode') ? 'contact-phone-country-error' : undefined}
                  required
                >
                  <option value="">Country</option>
                  {phoneCountryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  ref={(element) => {
                    fieldRefs.current.phone = element
                  }}
                  className={getFieldClassName(Boolean(getDisplayedError('phone')))}
                  aria-invalid={Boolean(getDisplayedError('phone'))}
                  aria-describedby={getDisplayedError('phone') ? 'contact-phone-error' : undefined}
                  required
                  minLength={9}
                  maxLength={9}
                  pattern="^[0-9]{9}$"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="Phone number"
                />
              </div>
              {getDisplayedError('phoneCountryCode') ? <p id="contact-phone-country-error" className="text-xs font-medium text-rose-600 dark:text-rose-300">{getDisplayedError('phoneCountryCode')}</p> : null}
              {getDisplayedError('phone') ? <p id="contact-phone-error" className="text-xs font-medium text-rose-600 dark:text-rose-300">{getDisplayedError('phone')}</p> : null}
            </label>
            <label className="space-y-2">
              <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">{t(language, 'contact.subject')}</span>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                ref={(element) => {
                  fieldRefs.current.subject = element
                }}
                className={getFieldClassName(Boolean(getDisplayedError('subject')))}
                aria-invalid={Boolean(getDisplayedError('subject'))}
                aria-describedby={getDisplayedError('subject') ? 'contact-subject-error' : undefined}
                required
                minLength={3}
                maxLength={120}
              />
              {getDisplayedError('subject') ? <p id="contact-subject-error" className="text-xs font-medium text-rose-600 dark:text-rose-300">{getDisplayedError('subject')}</p> : null}
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">{t(language, 'contact.project_details')}</span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              onBlur={handleBlur}
              ref={(element) => {
                fieldRefs.current.message = element
              }}
              rows="6"
              className={`${getFieldClassName(Boolean(getDisplayedError('message')))} rounded-3xl`}
              aria-invalid={Boolean(getDisplayedError('message'))}
              aria-describedby={getDisplayedError('message') ? 'contact-message-error' : undefined}
              required
              minLength={10}
              maxLength={2000}
            />
            {getDisplayedError('message') ? <p id="contact-message-error" className="text-xs font-medium text-rose-600 dark:text-rose-300">{getDisplayedError('message')}</p> : null}
          </label>

          {feedback.message ? (
            <div
              className={`rounded-2xl border px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm shadow-sm ${
                isDark
                  ? feedback.type === 'success'
                    ? 'border-emerald-800 bg-emerald-950/70 text-emerald-100'
                    : 'border-rose-800 bg-rose-950/70 text-rose-100'
                  : feedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-inherit' : ''}`}>{feedback.message}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[11px] font-medium text-inherit opacity-85">
                  This message will disappear in a few seconds.
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-inherit opacity-75">
                  Auto close
                </span>
              </div>
              <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${isDark ? 'bg-white/15' : 'bg-black/8'}`}>
                <div
                  className={`h-full origin-left animate-[shrink_4s_linear_forwards] rounded-full ${
                    isDark
                      ? feedback.type === 'success'
                        ? 'bg-emerald-300'
                        : 'bg-rose-300'
                      : feedback.type === 'success'
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                  }`}
                />
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-slate-950 dark:bg-slate-700 px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <LoadingSpinner label={t(language, 'contact.sending')} /> : t(language, 'contact.send_message')}
          </button>
        </form>
      </section>
    </div>
  )
}

export default ContactPage
