import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Home from './pages/Home'
import ClientArea from './pages/ClientArea'
import AdminLogin from './pages/AdminLogin'
import ProfessionalArea from './pages/ProfessionalArea'
import SubscriptionManagement from './pages/SubscriptionManagement'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cliente" element={<ClientArea />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/professional-area" element={<ProfessionalArea />} />
          <Route path="/subscription-management" element={<SubscriptionManagement />} />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
