import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PasswordPage from './pages/PasswordPage'
import CryptoPage from './pages/CryptoPage'
import IdPage from './pages/IdPage'
import JsonPage from './pages/JsonPage'
import { IpPage, TimePage } from './pages/ComingSoon'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools/password" element={<PasswordPage />} />
        <Route path="/tools/crypto" element={<CryptoPage />} />
        <Route path="/tools/id" element={<IdPage />} />
        <Route path="/tools/ip" element={<IpPage />} />
        <Route path="/tools/time" element={<TimePage />} />
        <Route path="/tools/json" element={<JsonPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
