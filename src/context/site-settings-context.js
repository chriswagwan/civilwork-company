import { createContext } from 'react'

export const SiteSettingsContext = createContext(null)

export const fallbackSettings = {
  companyName: 'Civil Works Co.',
  companyTagline: 'Building infrastructure with confidence',
  contactEmail: 'hello@civilworksco.com',
  contactPhone: '+20 100 555 0099',
  addressLine1: 'Nasr City, Cairo',
  addressLine2: 'Egypt',
  officeHours: 'Sunday - Thursday, 8:00 AM - 5:00 PM',
  contactIntro:
    'Tell us about your project scope, location, or tender requirements and our team will get back to you.',
  footerSummary:
    'We deliver civil infrastructure, buildings, and utility projects with disciplined execution, dependable quality, and long-term value.',
}
