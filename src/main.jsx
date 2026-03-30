import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SiteSettingsProvider } from './context/SiteSettingsContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { PublicThemeProvider } from './context/PublicThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <PublicThemeProvider>
        <AuthProvider>
          <SiteSettingsProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </PublicThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
