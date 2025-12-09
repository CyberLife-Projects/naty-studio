import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Clock, Heart, Star, Crown, MessageCircle } from 'lucide-react'
import logoImage from '../img/logo.png'
import './Home.css'

const Home = () => {
  const navigate = useNavigate()

  return (
    <div className="home-container">
      {/* Corações flutuantes */}
      <div className="floating-hearts">
        <Heart className="heart heart-1" />
        <Heart className="heart heart-2" />
        <Heart className="heart heart-3" />
        <Heart className="heart heart-4" />
        <Heart className="heart heart-5" />
        <Heart className="heart heart-6" />
      </div>

      <button className="admin-btn" onClick={() => navigate('/profissional')}>
        <Crown size={18} />
      </button>

      <div className="content">
        <div className="logo-section">
          <img src={logoImage} alt="BS Carvalho" className="logo-image" />
        </div>

        <h1 className="main-title">BS Carvalho</h1>
        <p className="main-subtitle">Nail Design & Estética</p>

        <div className="action-buttons">
          <button className="btn-book" onClick={() => navigate('/cliente')}>
            <div className="btn-content">
              <Sparkles size={22} />
              <span>Agendar Horário</span>
            </div>
          </button>

          <button className="btn-whatsapp" onClick={() => window.open('https://wa.me/5517999791733', '_blank')}>
            <MessageCircle size={20} />
            <span>WhatsApp</span>
          </button>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <Clock size={20} />
            <span>Agendamento 24h</span>
          </div>
          <div className="info-item">
            <Heart size={20} />
            <span>Atendimento Premium</span>
          </div>
          <div className="info-item">
            <Star size={20} />
            <span>Alta Qualidade</span>
          </div>
        </div>
      </div>

      <div className="footer-text">
        <p>© CyberLife</p>
      </div>
    </div>
  )
}

export default Home
