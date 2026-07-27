import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import PasswordPage from './pages/PasswordPage'
import CryptoPage from './pages/CryptoPage'
import IdPage from './pages/IdPage'
import JsonPage from './pages/JsonPage'
import TimePage from './pages/TimePage'
import IpPage from './pages/IpPage'
import QrPage from './pages/QrPage'
import UrlPage from './pages/UrlPage'
import RegexPage from './pages/RegexPage'
import JwtPage from './pages/JwtPage'
import UuidPage from './pages/UuidPage'
import CronPage from './pages/CronPage'
import Base64ImagePage from './pages/Base64ImagePage'
import ThemeProvider from './components/theme-provider'

function AppContent() {
  const navigate = useNavigate()

  useEffect(() => {
    const redirect = sessionStorage.getItem('redirect')
    if (redirect) {
      sessionStorage.removeItem('redirect')
      navigate(redirect)
    }
  }, [navigate])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tools/password" element={<PasswordPage />} />
      <Route path="/tools/crypto" element={<CryptoPage />} />
      <Route path="/tools/id" element={<IdPage />} />
      <Route path="/tools/ip" element={<IpPage />} />
      <Route path="/tools/time" element={<TimePage />} />
      <Route path="/tools/json" element={<JsonPage />} />
      <Route path="/tools/qr" element={<QrPage />} />
      <Route path="/tools/url" element={<UrlPage />} />
      <Route path="/tools/regex" element={<RegexPage />} />
      <Route path="/tools/jwt" element={<JwtPage />} />
      <Route path="/tools/uuid" element={<UuidPage />} />
      <Route path="/tools/cron" element={<CronPage />} />
      <Route path="/tools/base64-image" element={<Base64ImagePage />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
