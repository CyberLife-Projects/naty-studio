import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Home from './pages/Home'
import ClientArea from './pages/ClientArea'
import ProfessionalArea from './pages/ProfessionalArea'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cliente" element={<ClientArea />} />
          <Route path="/admin" element={<ProfessionalArea />} />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
