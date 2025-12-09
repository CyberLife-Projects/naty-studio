import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient.js'
import logoImage from '../img/logo-sem-cor.png'
import './AdminLogin.css'

const AdminLogin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Buscar admin na tabela user_admin
      const { data: adminData, error: queryError } = await supabase
        .from('user_admin')
        .select('*')
        .eq('email', formData.email.toLowerCase().trim())
        .eq('is_active', true)
        .single()

      if (queryError || !adminData) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }

      // Verificar senha (comparação direta - em produção use bcrypt)
      if (adminData.password_hash !== formData.password) {
        setError('Email ou senha incorretos')
        setLoading(false)
        return
      }

      // Salvar dados do admin no localStorage
      localStorage.setItem('adminAuth', JSON.stringify({
        id: adminData.id,
        email: adminData.email,
        full_name: adminData.full_name,
        cpf: adminData.cpf,
        phone: adminData.phone,
        loggedAt: new Date().toISOString()
      }))

      // Redirecionar para área profissional
      navigate('/professional-area')
    } catch (err) {
      console.error('Erro no login:', err)
      setError('Erro ao realizar login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-container">
      <div className="background-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="sparkles">
          <span className="sparkle-dot" style={{top: '10%', left: '15%', animationDelay: '0s'}}></span>
          <span className="sparkle-dot" style={{top: '20%', left: '80%', animationDelay: '0.5s'}}></span>
          <span className="sparkle-dot" style={{top: '70%', left: '10%', animationDelay: '1s'}}></span>
          <span className="sparkle-dot" style={{top: '80%', left: '85%', animationDelay: '1.5s'}}></span>
          <span className="sparkle-dot" style={{top: '40%', left: '5%', animationDelay: '2s'}}></span>
          <span className="sparkle-dot" style={{top: '60%', left: '90%', animationDelay: '2.5s'}}></span>
          <span className="sparkle-dot" style={{top: '30%', left: '50%', animationDelay: '1.2s'}}></span>
          <span className="sparkle-dot" style={{top: '50%', left: '25%', animationDelay: '1.8s'}}></span>
        </div>
      </div>

      <div className="admin-login-content">
        <div className="admin-login-card">
          <div className="logo-header">
            <img src={logoImage} alt="Naty Studio Logo" className="logo-image" />
          </div>

          <div className="admin-icon-circle">
            <Crown size={40} />
          </div>

          <h1 className="admin-title">Área Administrativa</h1>
          <p className="admin-subtitle">Acesso exclusivo para gestão</p>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <Lock size={18} />
                Senha
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-submit-admin"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Entrando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>

          <button 
            className="btn-back-home"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Voltar para Home
          </button>
        </div>
      </div>

      <footer className="page-footer">
        <p>Feito por <span className="cyber-link">CyberLife</span></p>
      </footer>
    </div>
  )
}

export default AdminLogin
