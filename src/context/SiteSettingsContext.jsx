import { useEffect, useMemo, useState } from 'react'
import client from '../api/client.js'
import { SiteSettingsContext, fallbackSettings } from './site-settings-context.js'

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(fallbackSettings)
  const [loading, setLoading] = useState(true)

  const refreshSettings = async () => {
    const { data } = await client.get('/settings')
    setSettings((current) => ({ ...current, ...data }))
    return data
  }

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await refreshSettings()
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const updateSettings = async (payload) => {
    const { data } = await client.put('/settings', payload)
    setSettings((current) => ({ ...current, ...data }))
    return data
  }

  const value = useMemo(
    () => ({
      settings,
      loading,
      refreshSettings,
      updateSettings,
    }),
    [settings, loading],
  )

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}
