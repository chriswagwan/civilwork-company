import * as Flags from 'country-flag-icons/react/3x2'
import { Check, ChevronDown, Mail, MapPin, Phone } from 'lucide-react'
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
  { value: '+1', countryCode: 'US', countryName: 'United States' },
  { value: '+44', countryCode: 'GB', countryName: 'United Kingdom' },
  { value: '+33', countryCode: 'FR', countryName: 'France' },
  { value: '+49', countryCode: 'DE', countryName: 'Germany' },
  { value: '+34', countryCode: 'ES', countryName: 'Spain' },
  { value: '+39', countryCode: 'IT', countryName: 'Italy' },
  { value: '+212', countryCode: 'MA', countryName: 'Morocco' },
  { value: '+213', countryCode: 'DZ', countryName: 'Algeria' },
  { value: '+216', countryCode: 'TN', countryName: 'Tunisia' },
  { value: '+20', countryCode: 'EG', countryName: 'Egypt' },
  { value: '+221', countryCode: 'SN', countryName: 'Senegal' },
  { value: '+225', countryCode: 'CI', countryName: 'Cote d\'Ivoire' },
  { value: '+234', countryCode: 'NG', countryName: 'Nigeria' },
  { value: '+233', countryCode: 'GH', countryName: 'Ghana' },
  { value: '+237', countryCode: 'CM', countryName: 'Cameroon' },
  { value: '+254', countryCode: 'KE', countryName: 'Kenya' },
  { value: '+250', countryCode: 'RW', countryName: 'Rwanda' },
  { value: '+251', countryCode: 'ET', countryName: 'Ethiopia' },
  { value: '+255', countryCode: 'TZ', countryName: 'Tanzania' },
  { value: '+256', countryCode: 'UG', countryName: 'Uganda' },
  { value: '+27', countryCode: 'ZA', countryName: 'South Africa' },
  { value: '+91', countryCode: 'IN', countryName: 'India' },
  { value: '+971', countryCode: 'AE', countryName: 'United Arab Emirates' },
]

const getPhoneCountryOption = (countryCodeValue) =>
  phoneCountryOptions.find((option) => option.value === countryCodeValue) || null

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
  const [isPhoneCountryMenuOpen, setIsPhoneCountryMenuOpen] = useState(false)
  const feedbackTimeoutRef = useRef(null)
  const phoneCountryMenuRef = useRef(null)
  const fieldRefs = useRef({})
  const { errors: validationErrors } = validateContactForm(form)
  const selectedPhoneCountry = getPhoneCountryOption(form.phoneCountryCode)

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

  useEffect(() => {
    if (!isPhoneCountryMenuOpen) {
      return undefined
    }

    const handleOutsideInteraction = (event) => {
      if (!phoneCountryMenuRef.current?.contains(event.target)) {
        setIsPhoneCountryMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handleOutsideInteraction)
    window.addEventListener('touchstart', handleOutsideInteraction)

    return () => {
      window.removeEventListener('mousedown', handleOutsideInteraction)
      window.removeEventListener('touchstart', handleOutsideInteraction)
    }
  }, [isPhoneCountryMenuOpen])

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

  const handlePhoneCountrySelect = (value) => {
    setForm((current) => ({
      ...current,
      phoneCountryCode: value,
    }))
    setTouchedFields((current) => ({
      ...current,
      phoneCountryCode: true,
    }))
    setApiFieldErrors((current) => {
      if (!current.phoneCountryCode) {
        return current
      }

      return {
        ...current,
        phoneCountryCode: '',
      }
    })
    setIsPhoneCountryMenuOpen(false)
  }

  const handlePhoneCountryBlur = (event) => {
    if (phoneCountryMenuRef.current?.contains(event.relatedTarget)) {
      return
    }

    setTouchedFields((current) => ({
      ...current,
      phoneCountryCode: true,
    }))
    setIsPhoneCountryMenuOpen(false)
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
              <div className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] gap-3 sm:grid-cols-[minmax(0,140px)_minmax(0,1fr)]">
                <div ref={phoneCountryMenuRef} className="relative">
                  <button
                    type="button"
                    name="phoneCountryCode"
                    onClick={() => setIsPhoneCountryMenuOpen((current) => !current)}
                    onBlur={handlePhoneCountryBlur}
                    ref={(element) => {
                      fieldRefs.current.phoneCountryCode = element
                    }}
                    className={`${getFieldClassName(Boolean(getDisplayedError('phoneCountryCode')))} flex items-center justify-between gap-2 text-left`}
                    aria-haspopup="listbox"
                    aria-expanded={isPhoneCountryMenuOpen}
                    aria-invalid={Boolean(getDisplayedError('phoneCountryCode'))}
                    aria-describedby={getDisplayedError('phoneCountryCode') ? 'contact-phone-country-error' : undefined}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {selectedPhoneCountry ? (
                        <span className="overflow-hidden rounded-[0.35rem] ring-1 ring-slate-200 dark:ring-slate-700">
                          {(() => {
                            const FlagIcon = Flags[selectedPhoneCountry.countryCode]
                            return FlagIcon ? <FlagIcon title={selectedPhoneCountry.countryName} className="h-4 w-6" /> : null
                          })()}
                        </span>
                      ) : (
                        <span className="h-4 w-6 rounded-[0.35rem] border border-dashed border-slate-300 dark:border-slate-600" />
                      )}
                      <span className={`truncate ${selectedPhoneCountry ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                        {selectedPhoneCountry ? selectedPhoneCountry.value : 'Code'}
                      </span>
                    </span>
                    <ChevronDown size={16} className={`flex-shrink-0 transition ${isPhoneCountryMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isPhoneCountryMenuOpen ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
                      <ul role="listbox" aria-label="Country code" className="max-h-72 overflow-y-auto py-2">
                        {phoneCountryOptions.map((option) => {
                          const FlagIcon = Flags[option.countryCode]
                          const isSelected = option.value === form.phoneCountryCode

                          return (
                            <li key={option.value}>
                              <button
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => handlePhoneCountrySelect(option.value)}
                                className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition ${
                                  isSelected
                                    ? 'bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-100'
                                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/80'
                                }`}
                              >
                                <span className="flex min-w-0 items-center gap-2.5">
                                  <span className="overflow-hidden rounded-[0.35rem] ring-1 ring-slate-200 dark:ring-slate-700">
                                    {FlagIcon ? <FlagIcon title={option.countryName} className="h-4 w-6" /> : null}
                                  </span>
                                  <span className="font-medium">{option.value}</span>
                                </span>
                                {isSelected ? <Check size={16} className="flex-shrink-0" /> : null}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ) : null}
                </div>
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
