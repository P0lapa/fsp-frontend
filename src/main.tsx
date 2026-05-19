import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ApiErrorProvider } from './api/ApiErrorProvider'
import { AuthProvider } from './auth/KeycloakProvider'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './theme/ThemeProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ApiErrorProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ApiErrorProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
