import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { StyledEngineProvider } from '@mui/material/styles'
import { GlobalStyles } from '@mui/system'
import { AuthProvider } from '../context/auth_context.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </StyledEngineProvider>
  </StrictMode>,
)
