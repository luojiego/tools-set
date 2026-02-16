import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import PasswordPage from './pages/PasswordPage'
import CryptoPage from './pages/CryptoPage'
import IdPage from './pages/IdPage'
import JsonPage from './pages/JsonPage'
import TimePage from './pages/TimePage'
import IpPage from './pages/IpPage'

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
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
