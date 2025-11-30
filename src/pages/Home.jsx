import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Sparkles, Clock, Heart, Star, Crown, MessageCircle } from 'lucide-react'
import logoImage from '../img/logo-sem-cor.png'
import './Home.css'

const Home = () => {
  const navigate = useNavigate()

  const handleWhatsAppClick = () => {
    const phoneNumber = '5517981717922'
    const message = encodeURIComponent('Olá! Gostaria de saber mais sobre os serviços do Naty Studio')
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  return (
    <div className="home-container">
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
        <div className="floating-shape shape-6"></div>
        <div className="floating-shape shape-7"></div>
        <div className="floating-shape shape-8"></div>
        <div className="sparkles">
          <span className="sparkle-dot" style={{top: '10%', left: '15%', animationDelay: '0s'}}></span>
          <span className="sparkle-dot" style={{top: '20%', left: '80%', animationDelay: '0.5s'}}></span>
          <span className="sparkle-dot" style={{top: '70%', left: '10%', animationDelay: '1s'}}></span>
          <span className="sparkle-dot" style={{top: '80%', left: '85%', animationDelay: '1.5s'}}></span>
          <span className="sparkle-dot" style={{top: '40%', left: '5%', animationDelay: '2s'}}></span>
          <span className="sparkle-dot" style={{top: '60%', left: '90%', animationDelay: '2.5s'}}></span>
          <span className="sparkle-dot" style={{top: '30%', left: '50%', animationDelay: '1.2s'}}></span>
          <span className="sparkle-dot" style={{top: '50%', left: '25%', animationDelay: '1.8s'}}></span>
          <span className="sparkle-dot" style={{top: '65%', left: '70%', animationDelay: '0.8s'}}></span>
          <span className="sparkle-dot" style={{top: '15%', left: '40%', animationDelay: '2.2s'}}></span>
        </div>
        <div className="hearts-container">
          <span className="floating-heart" style={{left: '10%', animationDelay: '0s'}}>💜</span>
          <span className="floating-heart" style={{left: '25%', animationDelay: '2s'}}>✨</span>
          <span className="floating-heart" style={{left: '40%', animationDelay: '4s'}}>💕</span>
          <span className="floating-heart" style={{left: '55%', animationDelay: '1s'}}>🌸</span>
          <span className="floating-heart" style={{left: '70%', animationDelay: '3s'}}>💜</span>
          <span className="floating-heart" style={{left: '85%', animationDelay: '5s'}}>✨</span>
        </div>
        <div className="waves">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
        </div>
      </div>
      <div className="admin-icon" onClick={() => navigate('/admin')} title="Acesso Admin">
        <Crown size={20} />
      </div>
      <div className="home-content">
        <div className="logo-section">
          <div className="hero-image">
            <img src={logoImage} alt="Naty Studio Logo" />
          </div>
          <div className="logo">
            <Eye className="logo-icon" size={40} />
            <h1>Naty Studio</h1>
            <Sparkles className="logo-icon" size={40} />
          </div>
          <p className="tagline">Cílios & Sobrancelhas que Encantam</p>
          <p className="subtitle">Beleza e Elegância em Cada Detalhe</p>
        </div>

        <div className="cards-container">
          <div className="access-card client-card" onClick={() => navigate('/cliente')}>
            <div className="card-decoration top-left"></div>
            <div className="card-decoration bottom-right"></div>
            <div className="card-icon">
              <Sparkles size={48} strokeWidth={2} />
            </div>
            <h2>Área do Cliente</h2>
            <p>Agende extensão de cílios ou design de sobrancelhas</p>
            <div className="card-divider"></div>
            <button className="card-button">Acessar Agendamento</button>
            <button className="whatsapp-button" onClick={(e) => { e.stopPropagation(); handleWhatsAppClick(); }}>
              <MessageCircle size={20} style={{marginRight: '8px'}} />
              Fale Comigo
            </button>
          </div>
        </div>

        <div className="features">
          <div className="feature">
            <Clock className="feature-icon" size={32} />
            <p>Agendamento Online</p>
          </div>
          <div className="feature">
            <Heart className="feature-icon" size={32} />
            <p>Atendimento Exclusivo</p>
          </div>
          <div className="feature">
            <Star className="feature-icon" size={32} />
            <p>Profissionais Certificadas</p>
          </div>
        </div>
      </div>
      
      <footer className="page-footer">
        <p>Feito por <span className="cyber-link">CyberLife</span></p>
      </footer>
    </div>
  )
}

export default Home
