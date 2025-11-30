import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, Clock, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './ClientArea.css'

const ClientArea = () => {
  const navigate = useNavigate()
  const { services, getAvailableSlots, addAppointment } = useApp()
  
  const [step, setStep] = useState(1)
  const [datePage, setDatePage] = useState(0)
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    service: null,
    date: '',
    time: '',
    isRecurring: false,
    recurringInterval: 15,
    recurringMonths: 3
  })

  // Gerar próximos 60 dias
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 60; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      // Pular domingos (0)
      if (date.getDay() !== 0) {
        dates.push(date)
      }
    }
    return dates
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short' 
    })
  }

  const getDateValue = (date) => {
    return date.toISOString().split('T')[0]
  }

  const handleServiceSelect = (service) => {
    setFormData({ ...formData, service })
    setDatePage(0)
    setStep(2)
  }

  const handleDateSelect = (date) => {
    setFormData({ ...formData, date: getDateValue(date) })
    setStep(3)
  }

  const handleTimeSelect = (time) => {
    setFormData({ ...formData, time })
    setStep(4)
  }

  const sendWhatsAppNotification = (appointment) => {
    const phoneNumber = '5517992212246' // WhatsApp da Naty Studio
    
    // Formatar a data
    const dateObj = new Date(appointment.date + 'T12:00:00')
    const dateFormatted = dateObj.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
    
    // Criar mensagem
    const message = `*NOVO AGENDAMENTO - Naty Studio*

*Data:* ${dateFormatted}
*Horário:* ${appointment.time}

*Serviço:*
${appointment.service.name}
Duração: ${appointment.service.duration}
Valor: ${appointment.service.price}

*Dados do Cliente:*
Nome: ${appointment.clientName}
Telefone: ${appointment.clientPhone}
${appointment.clientEmail ? `E-mail: ${appointment.clientEmail}` : ''}

Agendamento realizado com sucesso!`
    
    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message)
    
    // Abrir WhatsApp em nova aba
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.clientName || !formData.clientPhone) {
      alert('Por favor, preencha todos os campos obrigatórios!')
      return
    }

    try {
      // Criar agendamento principal
      const mainAppointmentData = {
        serviceId: formData.service.id,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail || null,
        date: formData.date,
        time: formData.time,
        isMaintenance: false
      }

      const { success, data: appointment, error } = await addAppointment(mainAppointmentData)
      
      if (!success) {
        alert(`Erro ao criar agendamento: ${error}`)
        return
      }
      
      let appointmentsCreated = 1
      
      // Se for recorrente, criar agendamentos de manutenção
      if (formData.isRecurring && formData.recurringMonths > 0) {
        // Encontrar o serviço de manutenção correspondente
        const maintenanceService = services.find(s => 
          s.name.toLowerCase().includes('manutenção') && 
          formData.service.name.toLowerCase().includes(s.name.toLowerCase().replace(' - manutenção', '').replace('manutenção', ''))
        )
        
        if (maintenanceService) {
          const totalRecurrences = Math.floor((formData.recurringMonths * 30) / formData.recurringInterval)
          
          for (let i = 1; i <= totalRecurrences; i++) {
            const recurringDate = new Date(formData.date)
            recurringDate.setDate(recurringDate.getDate() + (i * formData.recurringInterval))
            
            // Verificar se é domingo e ajustar
            while (recurringDate.getDay() === 0) {
              recurringDate.setDate(recurringDate.getDate() + 1)
            }
            
            const recurringAppointmentData = {
              serviceId: maintenanceService.id,
              clientName: formData.clientName,
              clientPhone: formData.clientPhone,
              clientEmail: formData.clientEmail || null,
              date: recurringDate.toISOString().split('T')[0],
              time: formData.time,
              isMaintenance: true
            }
            
            await addAppointment(recurringAppointmentData)
            appointmentsCreated++
          }
        }
      }
      
      // Enviar notificação via WhatsApp
      sendWhatsAppNotification({
        ...appointment,
        service: formData.service // Usar o serviço completo para formatação
      })
      
      alert(`${appointmentsCreated} agendamento(s) realizado(s) com sucesso!\n\nVocê receberá uma confirmação em breve.`)
      navigate('/')
    } catch (err) {
      console.error('Erro ao criar agendamento:', err)
      alert('Erro ao criar agendamento. Tente novamente.')
    }
  }

  const DATES_PER_PAGE = 15
  const allDates = getAvailableDates()
  const totalPages = Math.ceil(allDates.length / DATES_PER_PAGE)
  const startIndex = datePage * DATES_PER_PAGE
  const endIndex = startIndex + DATES_PER_PAGE
  const availableDates = allDates.slice(startIndex, endIndex)
  const availableSlots = formData.date ? getAvailableSlots(formData.date) : []

  const handleNextPage = () => {
    if (datePage < totalPages - 1) {
      setDatePage(datePage + 1)
    }
  }

  const handlePrevPage = () => {
    if (datePage > 0) {
      setDatePage(datePage - 1)
    }
  }

  return (
    <div className="client-area">
      <button 
        className="back-arrow-btn" 
        onClick={() => step === 1 ? navigate('/') : setStep(step - 1)}
        aria-label="Voltar"
      >
        <ArrowLeft size={24} />
      </button>
      <header className="client-header">
        <div className="header-decoration"></div>
        <div className="header-content">
          <h1><Eye size={24} style={{marginRight: '10px', display: 'inline-block', verticalAlign: 'middle'}} />Agende seu Horário</h1>
          <p className="header-subtitle">Naty Studio</p>
        </div>
      </header>

      <div className="client-content">
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>Serviço</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Data</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Horário</span>
          </div>
          <div className={`step ${step >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <span>Dados</span>
          </div>
        </div>

        {/* Step 1: Selecionar Serviço */}
        {step === 1 && (
          <div className="step-content">
            <h2>Escolha seu Serviço</h2>
            
            <div className="service-category">
              <h3 className="category-title"><Eye size={20} /> Extensão de Cílios</h3>
              <div className="services-grid">
                {services.filter(s => s.category === 'cilios').map(service => (
                  <div 
                    key={service.id} 
                    className="service-card"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <h3>{service.name}</h3>
                    <p className="service-description">{service.description}</p>
                    <div className="service-details">
                      <span className="service-duration"><Clock size={14} /> {service.duration}</span>
                      <span className="service-price">{service.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="service-category">
              <h3 className="category-title">✨ Design de Sobrancelhas</h3>
              <div className="services-grid">
                {services.filter(s => s.category === 'sobrancelhas').map(service => (
                  <div 
                    key={service.id} 
                    className="service-card"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <h3>{service.name}</h3>
                    <p className="service-description">{service.description}</p>
                    <div className="service-details">
                      <span className="service-duration"><Clock size={14} /> {service.duration}</span>
                      <span className="service-price">{service.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Selecionar Data */}
        {step === 2 && (
          <div className="step-content">
            <h2>Escolha a Data</h2>
            <div className="selected-service">
              <strong>Serviço:</strong> {formData.service?.name}
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-btn" 
                onClick={handlePrevPage}
                disabled={datePage === 0}
              >
                <ChevronLeft size={20} />
                Anterior
              </button>
              <span className="page-indicator">
                Página {datePage + 1} de {totalPages}
              </span>
              <button 
                className="pagination-btn" 
                onClick={handleNextPage}
                disabled={datePage === totalPages - 1}
              >
                Próxima
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="dates-grid">
              {availableDates.map((date, index) => (
                <div 
                  key={index} 
                  className="date-card"
                  onClick={() => handleDateSelect(date)}
                >
                  <div className="date-day">{date.getDate()}</div>
                  <div className="date-month">
                    {date.toLocaleDateString('pt-BR', { month: 'short' })}
                  </div>
                  <div className="date-weekday">
                    {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Selecionar Horário */}
        {step === 3 && (
          <div className="step-content">
            <h2>Escolha o Horário</h2>
            <div className="selected-info">
              <p><strong>Serviço:</strong> {formData.service?.name}</p>
              <p><strong>Data:</strong> {new Date(formData.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
            </div>
            {availableSlots.length === 0 ? (
              <div className="no-slots">
                <p>😔 Não há horários disponíveis para esta data.</p>
                <p>Por favor, escolha outra data.</p>
              </div>
            ) : (
              <div className="time-grid">
                {availableSlots.map((time, index) => (
                  <div 
                    key={index} 
                    className="time-card"
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Dados do Cliente */}
        {step === 4 && (
          <div className="step-content">
            <h2>Seus Dados</h2>
            <div className="selected-info">
              <p><strong>Serviço:</strong> {formData.service?.name}</p>
              <p><strong>Data:</strong> {new Date(formData.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> {formData.time}</p>
            </div>
            <form onSubmit={handleSubmit} className="client-form">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input 
                  type="text" 
                  value={formData.clientName}
                  onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                  placeholder="Digite seu nome"
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefone/WhatsApp *</label>
                <input 
                  type="tel" 
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                  placeholder="(17) 98171-7922"
                  required
                />
              </div>
              <div className="form-group">
                <label>E-mail (opcional)</label>
                <input 
                  type="email" 
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  placeholder="seu@email.com"
                />
              </div>
              
              {/* Seção de Agendamentos Recorrentes */}
              <div className="recurring-section">
                <div className="recurring-toggle">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                    />
                    <span>Agendar manutenções automáticas (retornos)</span>
                  </label>
                </div>
                
                {formData.isRecurring && (
                  <div className="recurring-options">
                    <div className="recurring-row">
                      <div className="form-group">
                        <label>Intervalo entre retornos</label>
                        <select 
                          value={formData.recurringInterval}
                          onChange={(e) => setFormData({...formData, recurringInterval: parseInt(e.target.value)})}
                          className="recurring-select"
                        >
                          <option value="15">A cada 15 dias</option>
                          <option value="20">A cada 20 dias</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Durante quantos meses?</label>
                        <select 
                          value={formData.recurringMonths}
                          onChange={(e) => setFormData({...formData, recurringMonths: parseInt(e.target.value)})}
                          className="recurring-select"
                        >
                          <option value="1">1 mês</option>
                          <option value="2">2 meses</option>
                          <option value="3">3 meses</option>
                          <option value="4">4 meses</option>
                          <option value="5">5 meses</option>
                          <option value="6">6 meses</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="recurring-info">
                      <span>ℹ️ Serão agendados aproximadamente {Math.floor((formData.recurringMonths * 30) / formData.recurringInterval)} retornos de manutenção</span>
                    </div>
                  </div>
                )}
              </div>
              
              <button type="submit" className="submit-button">
                <Check size={20} style={{marginRight: '8px', display: 'inline-block', verticalAlign: 'middle'}} />
                Confirmar Agendamento
              </button>
            </form>
          </div>
        )}
      </div>
      
      <footer className="page-footer">
        <p>Feito por <span className="cyber-link">CyberLife</span></p>
      </footer>
    </div>
  )
}

export default ClientArea
