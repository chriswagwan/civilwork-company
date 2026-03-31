import { Compass, Flag, Shield, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import client from '../api/client.js'
import LoadingSpinner from '../components/common/LoadingSpinner.jsx'
import PageHero from '../components/layout/PageHero.jsx'
import SectionHeading from '../components/layout/SectionHeading.jsx'
import { useLanguage } from '../hooks/useLanguage.js'
import { t } from '../utils/translations.js'

const AboutPage = () => {
  const [staff, setStaff] = useState([])
  const [staffLoading, setStaffLoading] = useState(true)
  const { language } = useLanguage()

  const values = [
    {
      icon: <Compass size={24} />,
      title: t(language, 'about.mission_title'),
      copy: t(language, 'about.mission_copy'),
    },
    {
      icon: <Flag size={24} />,
      title: t(language, 'about.vision_title'),
      copy: t(language, 'about.vision_copy'),
    },
    {
      icon: <Shield size={24} />,
      title: t(language, 'about.commitment_title'),
      copy: t(language, 'about.commitment_copy'),
    },
  ]

  // Load staff on mount
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const { data } = await client.get('/staff')
        setStaff(data)
      } catch (error) {
        console.error('Error loading staff:', error)
      } finally {
        setStaffLoading(false)
      }
    }

    loadStaff()
  }, [])

  return (
    <div className="space-y-12 sm:space-y-16 pb-6 sm:pb-8">
      <PageHero
        eyebrow={t(language, 'about.eyebrow')}
        title={t(language, 'about.title')}
        copy={t(language, 'about.copy')}
      />

      <section className="site-container grid gap-6 grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="card-panel px-4 sm:px-6 py-6 sm:py-8 md:px-8">
          <SectionHeading
            eyebrow={t(language, 'about.story')}
            title={t(language, 'about.story_title')}
            copy={t(language, 'about.story_copy')}
          />
        </div>
        <div className="card-panel px-4 sm:px-6 py-6 sm:py-8 md:px-8">
          <p className="text-xs sm:text-sm md:text-base leading-6 sm:leading-7 md:leading-8 text-slate-600 dark:text-slate-400">
            {t(language, 'about.company_expansion_p1')}
          </p>
          <p className="mt-4 sm:mt-5 text-xs sm:text-sm md:text-base leading-6 sm:leading-7 md:leading-8 text-slate-600 dark:text-slate-400">
            {t(language, 'about.company_expansion_p2')}
          </p>
        </div>
      </section>

      <section className="site-container">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {values.map(({ icon, title, copy }) => (
            <article key={title} className="card-panel px-4 sm:px-6 py-6 sm:py-8">
              <div className="flex text-amber-700 dark:text-amber-500">
                {icon}
              </div>
              <h3 className="mt-4 sm:mt-5 text-lg sm:text-2xl font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-6 sm:leading-7 text-slate-600 dark:text-slate-400">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Staff Management Section */}
      <section className="site-container">
        <div className="mb-6 sm:mb-8">
          <SectionHeading
            eyebrow={t(language, 'about.leadership')}
            title={t(language, 'about.leadership_title')}
            copy={t(language, 'about.leadership_copy')}
          />
        </div>

        {/* Staff Display */}
        {staffLoading ? (
          <div className="card-panel flex justify-center px-6 py-14">
            <LoadingSpinner label="Loading staff..." />
          </div>
        ) : staff.length === 0 ? (
          <div className="card-panel rounded-2xl border border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-6 sm:py-8 text-center">
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">No staff members added yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {staff.map((member) => (
              <article key={member._id} className="card-panel overflow-hidden flex flex-col relative group">
                <div className="h-32 sm:h-40 lg:h-48 w-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="h-full w-full object-cover object-top" />
                  ) : (
                    <User size={40} className="text-slate-400 dark:text-slate-600" />
                  )}
                </div>
                <div className="px-4 sm:px-6 py-4 sm:py-5 flex-grow flex flex-col">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-950 dark:text-white line-clamp-2">{member.name}</h3>
                  <p className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-600 mt-1">{member.title}</p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-5 sm:leading-6 mt-2 sm:mt-3 line-clamp-3">{member.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default AboutPage
