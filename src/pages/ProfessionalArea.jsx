import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, Calendar, BarChart3, Eye, Clock, Phone, Mail, ArrowLeft, Users, ChevronLeft, ChevronRight, Search, Plus, X, LogOut, TrendingUp, BarChart2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './ProfessionalArea.css'

const ProfessionalArea = () => {
  const navigate = useNavigate()
  const { appointments, services, cancelAppointment, completeAppointment, addAppointment, deleteAppointment, updateAppointment, isPaginaBloqueada } = useApp()
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState('agenda') // 'agenda', 'stats', 'clients' ou 'services'
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [showEditServiceModal, setShowEditServiceModal] = useState(false)
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false)
  const [serviceToEdit, setServiceToEdit] = useState(null)
  const [serviceToDelete, setServiceToDelete] = useState(null)
  const [newService, setNewService] = useState({
    name: '',
    category: 'cilios',
    duration: '',
    price: '',
    description: ''
  })
  const [editServiceData, setEditServiceData] = useState({
    name: '',
    category: 'cilios',
    duration: '',
    price: '',
    description: ''
  })
  const [selectedClientPhone, setSelectedClientPhone] = useState(null)
  const [dateCarouselPage, setDateCarouselPage] = useState(0)
  const [chartPeriod, setChartPeriod] = useState('7days') // '7days', '1month', '3months', '6months'
  const [expandedDates, setExpandedDates] = useState({})
  const [expandedUpcomingDates, setExpandedUpcomingDates] = useState({})
  const [showNotification, setShowNotification] = useState(false)
  const [notificationData, setNotificationData] = useState({ type: '', message: '', details: '' })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState({ count: 0, hasRecurring: false })
  const [appointmentToCancel, setAppointmentToCancel] = useState(null)
  const [appointmentToDelete, setAppointmentToDelete] = useState(null)
  const [appointmentToEdit, setAppointmentToEdit] = useState(null)
  const [editFormData, setEditFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    service: null,
    date: '',
    time: ''
  })
  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    service: null,
    date: new Date().toISOString().split('T')[0],
    time: '',
    isRecurring: false,
    recurringInterval: 15, // 15 ou 20 dias
    recurringMonths: 3 // quantos meses
  })

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === 'naty123') {
      setIsAuthenticated(true)
    } else {
      showCustomNotification('error', 'Senha incorreta!', 'Por favor, tente novamente.')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
    navigate('/')
  }

  const toggleDateExpansion = (dateKey) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }))
  }

  const toggleUpcomingDateExpansion = (dateKey) => {
    setExpandedUpcomingDates(prev => ({
      ...prev,
      [dateKey]: !prev[dateKey]
    }))
  }

  // Sistema de notificações personalizadas
  const showCustomNotification = (type, message, details = '') => {
    setNotificationData({ type, message, details })
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 5000)
  }

  // Notificação de boas-vindas ao entrar no admin
  useEffect(() => {
    if (isAuthenticated) {
      const today = new Date().toISOString().split('T')[0]
      const todayAppointments = appointments.filter(apt => 
        apt.date === today && apt.status !== 'cancelado' && apt.status !== 'concluído'
      )
      
      const pendingCount = todayAppointments.length
      const message = pendingCount > 0 
        ? `Bem-vinda, Naty! 💖` 
        : 'Bem-vinda, Naty! 💖'
      const details = pendingCount > 0
        ? `Você tem ${pendingCount} agendamento(s) pendente(s) para hoje.`
        : 'Nenhum agendamento pendente para hoje. ✨'
      
      showCustomNotification('welcome', message, details)
    }
  }, [isAuthenticated, appointments])

  // Funções de gerenciamento de serviços
  const handleAddService = (e) => {
    e.preventDefault()
    
    if (!newService.name || !newService.duration || !newService.price) {
      showCustomNotification('error', 'Campos obrigatórios!', 'Por favor, preencha todos os campos obrigatórios.')
      return
    }

    // Em produção, aqui você faria a chamada para o Supabase
    // Por enquanto, apenas simula a adição
    showCustomNotification('success', `Serviço "${newService.name}" adicionado!`, 'A funcionalidade de persistência será implementada com integração ao banco de dados.')
    
    setShowAddServiceModal(false)
    setNewService({
      name: '',
      category: 'cilios',
      duration: '',
      price: '',
      description: ''
    })
  }

  const handleEditServiceClick = (service) => {
    setServiceToEdit(service)
    setEditServiceData({
      name: service.name,
      category: service.category,
      duration: service.rawDuration || service.duration,
      price: service.rawPrice || service.price.replace('R$ ', '').replace(',', '.'),
      description: service.description
    })
    setShowEditServiceModal(true)
  }

  const handleEditService = (e) => {
    e.preventDefault()
    
    if (!editServiceData.name || !editServiceData.duration || !editServiceData.price) {
      showCustomNotification('error', 'Campos obrigatórios!', 'Por favor, preencha todos os campos obrigatórios.')
      return
    }

    // Em produção, aqui você faria a chamada para o Supabase
    showCustomNotification('success', `Serviço "${editServiceData.name}" atualizado!`, 'A funcionalidade de persistência será implementada com integração ao banco de dados.')
    
    setShowEditServiceModal(false)
    setServiceToEdit(null)
  }

  const handleDeleteServiceClick = (service) => {
    setServiceToDelete(service)
    setShowDeleteServiceModal(true)
  }

  const handleConfirmDeleteService = () => {
    // Em produção, aqui você faria a chamada para o Supabase
    showCustomNotification('success', `Serviço "${serviceToDelete.name}" removido!`, 'A funcionalidade de persistência será implementada com integração ao banco de dados.')
    
    setShowDeleteServiceModal(false)
    setServiceToDelete(null)
  }

  // Filtrar agendamentos por data
  const getAppointmentsForDate = (date) => {
    const filtered = appointments.filter(apt => {
      // Garantir que ambas as datas estão no mesmo formato (YYYY-MM-DD)
      const aptDate = apt.date.split('T')[0] // Remove hora se houver
      const compareDate = date.split('T')[0] // Remove hora se houver
      return aptDate === compareDate && apt.status !== 'cancelado'
    }).sort((a, b) => a.time.localeCompare(b.time))
    
    return filtered
  }

  const todayAppointments = getAppointmentsForDate(selectedDate)

  // Estatísticas
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const stats = {
    total: appointments.filter(apt => apt.status !== 'cancelado').length,
    confirmados: appointments.filter(apt => apt.status === 'confirmado').length,
    concluidos: appointments.filter(apt => apt.status === 'concluido').length,
    hoje: todayAppointments.length,
    // Manutenções pendentes (agendadas para o futuro ou hoje)
    manutencoesPendentes: appointments.filter(apt => {
      const aptDate = new Date(apt.date + 'T00:00:00')
      return apt.service.name.toLowerCase().includes('manutenção') && 
             apt.status !== 'cancelado' &&
             apt.status !== 'concluido' &&
             aptDate >= today
    }).length,
    // Manutenções concluídas (já realizadas)
    manutencoesConcluidas: appointments.filter(apt => 
      apt.service.name.toLowerCase().includes('manutenção') && 
      apt.status === 'concluido'
    ).length,
    // Total de manutenções (incluindo todas)
    manutencoesTotal: appointments.filter(apt => 
      apt.service.name.toLowerCase().includes('manutenção') && 
      apt.status !== 'cancelado'
    ).length,
    // Taxa de retorno (clientes que fizeram manutenção)
    taxaRetorno: (() => {
      // Agrupar por cliente (usando telefone como identificador)
      const clientesComAplicacao = new Set()
      const clientesComManutencao = new Set()
      
      appointments.forEach(apt => {
        if (apt.status !== 'cancelado') {
          if (apt.service.name.toLowerCase().includes('aplicação')) {
            clientesComAplicacao.add(apt.clientPhone)
          }
          if (apt.service.name.toLowerCase().includes('manutenção')) {
            clientesComManutencao.add(apt.clientPhone)
          }
        }
      })
      
      const totalClientesComAplicacao = clientesComAplicacao.size
      const clientesQueRetornaram = [...clientesComManutencao].filter(phone => 
        clientesComAplicacao.has(phone)
      ).length
      
      return totalClientesComAplicacao > 0 
        ? ((clientesQueRetornaram / totalClientesComAplicacao) * 100).toFixed(1) 
        : 0
    })()
  }

  // Calcular receita
  const calculateRevenue = () => {
    return appointments
      .filter(apt => apt.status === 'concluido')
      .reduce((total, apt) => {
        const price = parseFloat(apt.service.price.replace('R$ ', '').replace(',', '.'))
        return total + price
      }, 0)
  }

  // Gerar dados do gráfico de linhas com base no período selecionado
  const getLineChartData = () => {
    const periods = []
    const today = new Date()
    let periodCount = 0
    let labelFormat = {}
    
    switch(chartPeriod) {
      case '7days':
        periodCount = 7
        for (let i = periodCount - 1; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(today.getDate() - i)
          periods.push({
            name: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            fullDate: date
          })
        }
        break
      case '1month':
        periodCount = 4 // 4 semanas
        for (let i = periodCount - 1; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(today.getDate() - (i * 7))
          periods.push({
            name: `Sem ${periodCount - i}`,
            fullDate: date,
            isWeek: true
          })
        }
        break
      case '3months':
      case '6months':
        periodCount = chartPeriod === '3months' ? 3 : 6
        for (let i = periodCount - 1; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
          periods.push({
            name: date.toLocaleDateString('pt-BR', { month: 'short' }),
            fullDate: date
          })
        }
        break
    }
    
    // Calcular total de agendamentos por período
    const data = periods.map(period => {
      const count = appointments.filter(apt => {
        const aptDate = new Date(apt.date + 'T12:00:00')
        
        if (chartPeriod === '7days') {
          return apt.status !== 'cancelado' &&
                 aptDate.toDateString() === period.fullDate.toDateString()
        } else if (chartPeriod === '1month' && period.isWeek) {
          const weekStart = new Date(period.fullDate)
          const weekEnd = new Date(period.fullDate)
          weekEnd.setDate(weekEnd.getDate() + 6)
          return apt.status !== 'cancelado' &&
                 aptDate >= weekStart && aptDate <= weekEnd
        } else {
          return apt.status !== 'cancelado' &&
                 aptDate.getMonth() === period.fullDate.getMonth() &&
                 aptDate.getFullYear() === period.fullDate.getFullYear()
        }
      }).length
      return count
    })
    
    return { 
      periods, 
      data,
      total: data.reduce((sum, count) => sum + count, 0)
    }
  }

  // Gerar dados do gráfico de pizza (serviços mais pedidos)
  const getPieChartData = () => {
    // Incluir TODOS os serviços (incluindo manutenções)
    const data = services.map(service => {
      const count = appointments.filter(apt => 
        apt.service.id === service.id && apt.status !== 'cancelado'
      ).length
      
      return {
        name: service.name,
        count: count,
        color: getServiceColor(service.id)
      }
    }).filter(item => item.count > 0)
    
    const total = data.reduce((sum, item) => sum + item.count, 0)
    
    // Calcular ângulos para o gráfico pizza
    let currentAngle = -90
    const slices = data.map(item => {
      const percentage = (item.count / total) * 100
      const angle = (item.count / total) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle
      
      return {
        ...item,
        percentage,
        startAngle,
        endAngle
      }
    })
    
    return { slices, total }
  }

  // Cores para cada serviço - paleta harmoniosa do site
  const getServiceColor = (serviceId) => {
    const colors = [
      '#fde383', // Dourado principal
      '#f5d372', // Dourado médio  
      '#ffc857', // Dourado brilhante
      '#ffb347', // Laranja claro
      '#e6cc6f', // Dourado escuro
      '#d4a574', // Bronze
      '#c9a961'  // Dourado terroso
    ]
    return colors[(serviceId - 1) % colors.length]
  }

  // Função para desenhar caminho SVG da fatia de pizza
  const getSlicePath = (startAngle, endAngle, radius = 100) => {
    const start = polarToCartesian(100, 100, radius, endAngle)
    const end = polarToCartesian(100, 100, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    
    return [
      'M', 100, 100,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ')
  }

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  const lineChartData = getLineChartData()
  const pieChartData = getPieChartData()

  // Função para formatar data sem problemas de timezone
  const formatDateDisplay = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date
  }

  // Gerar próximos 60 dias
  const getAll60Dates = () => {
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

  const DATES_PER_PAGE = 7
  const all60Dates = getAll60Dates()
  const totalDatePages = Math.ceil(all60Dates.length / DATES_PER_PAGE)
  const startDateIndex = dateCarouselPage * DATES_PER_PAGE
  const endDateIndex = startDateIndex + DATES_PER_PAGE
  const weekDates = all60Dates.slice(startDateIndex, endDateIndex)

  const handleNextDatePage = () => {
    if (dateCarouselPage < totalDatePages - 1) {
      setDateCarouselPage(dateCarouselPage + 1)
    }
  }

  const handlePrevDatePage = () => {
    if (dateCarouselPage > 0) {
      setDateCarouselPage(dateCarouselPage - 1)
    }
  }

  const handleDateSearch = (searchDate) => {
    if (!searchDate) return
    
    // Converter a data de busca para objeto Date
    const searchDateTime = new Date(searchDate + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Verificar se é um domingo
    if (searchDateTime.getDay() === 0) {
      showCustomNotification('warning', 'Domingo não disponível', 'Domingos não estão disponíveis para agendamento.')
      return
    }
    
    // Verificar se está dentro dos próximos 60 dias
    const diffTime = searchDateTime - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0 || diffDays > 60) {
      showCustomNotification('warning', 'Data não disponível', 'Escolha uma data dentro dos próximos 60 dias.')
      return
    }
    
    // Encontrar o índice da data no array de 60 dias
    const dateIndex = all60Dates.findIndex(date => 
      date.toISOString().split('T')[0] === searchDate
    )
    
    if (dateIndex !== -1) {
      // Calcular qual página contém essa data
      const targetPage = Math.floor(dateIndex / DATES_PER_PAGE)
      setDateCarouselPage(targetPage)
      setSelectedDate(searchDate)
    } else {
      // Selecionar a data mesmo que não esteja na lista (ex: se for um dia útil)
      setSelectedDate(searchDate)
    }
  }

  const handleAddAppointment = async (e) => {
    e.preventDefault()
    
    if (!newAppointment.clientName || !newAppointment.clientPhone || !newAppointment.service || !newAppointment.date || !newAppointment.time) {
      showCustomNotification('error', 'Campos obrigatórios!', 'Por favor, preencha todos os campos obrigatórios.')
      return
    }

    try {
      // Criar agendamento principal
      const mainAppointmentData = {
        serviceId: newAppointment.service.id,
        clientName: newAppointment.clientName,
        clientPhone: newAppointment.clientPhone,
        clientEmail: newAppointment.clientEmail || null,
        date: newAppointment.date,
        time: newAppointment.time,
        isMaintenance: false
      }

      const { success, error } = await addAppointment(mainAppointmentData)
      
      if (!success) {
        showCustomNotification('error', 'Erro ao criar agendamento', error)
        return
      }
      
      let appointmentsCreated = 1
      
      // Se for recorrente, criar agendamentos de manutenção
      if (newAppointment.isRecurring && newAppointment.recurringMonths > 0) {
        // Encontrar o serviço de manutenção correspondente
        // Procurar especificamente por "Manutenção" (o serviço genérico de retorno)
        const maintenanceService = services.find(s => 
          s.name.toLowerCase() === 'manutenção'
        )
        
        if (maintenanceService) {
          const totalRecurrences = Math.floor((newAppointment.recurringMonths * 30) / newAppointment.recurringInterval)
          
          for (let i = 1; i <= totalRecurrences; i++) {
            const recurringDate = new Date(newAppointment.date)
            recurringDate.setDate(recurringDate.getDate() + (i * newAppointment.recurringInterval))
            
            // Verificar se é domingo e ajustar
            while (recurringDate.getDay() === 0) {
              recurringDate.setDate(recurringDate.getDate() + 1)
            }
            
            const recurringAppointmentData = {
              serviceId: maintenanceService.id,
              clientName: newAppointment.clientName,
              clientPhone: newAppointment.clientPhone,
              clientEmail: newAppointment.clientEmail || null,
              date: recurringDate.toISOString().split('T')[0],
              time: newAppointment.time,
              isMaintenance: true
            }
            
            await addAppointment(recurringAppointmentData)
            appointmentsCreated++
          }
        }
      }

      setSuccessMessage({ 
        count: appointmentsCreated, 
        hasRecurring: newAppointment.isRecurring && appointmentsCreated > 1 
      })
      setShowAddModal(false)
      setShowSuccessModal(true)
      
      setNewAppointment({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        service: null,
        date: new Date().toISOString().split('T')[0],
        time: '',
        isRecurring: false,
        recurringInterval: 15,
        recurringMonths: 3
      })
    } catch (err) {
      console.error('Erro ao criar agendamento:', err)
      showCustomNotification('error', 'Erro ao criar agendamento', 'Tente novamente.')
    }
  }

  const handleCancelClick = (appointment) => {
    setAppointmentToCancel(appointment)
    setShowCancelModal(true)
  }

  const handleConfirmCancel = async () => {
    if (appointmentToCancel) {
      const { success, error } = await cancelAppointment(appointmentToCancel.id)
      
      if (!success) {
        showCustomNotification('error', 'Erro ao cancelar agendamento', error)
        return
      }

      setShowCancelModal(false)
      setAppointmentToCancel(null)
    }
  }

  const handleComplete = async (appointmentId) => {
    const { success, error } = await completeAppointment(appointmentId)
    
    if (!success) {
      showCustomNotification('error', 'Erro ao concluir agendamento', error)
      return
    }
    
    showCustomNotification('success', 'Agendamento concluído!', 'O agendamento foi marcado como concluído.')
  }

  const handleEditClick = (appointment) => {
    setAppointmentToEdit(appointment)
    setEditFormData({
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      clientEmail: appointment.clientEmail || '',
      service: appointment.service,
      date: appointment.date,
      time: appointment.time
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    
    if (!editFormData.clientName || !editFormData.clientPhone || !editFormData.service || !editFormData.date || !editFormData.time) {
      showCustomNotification('error', 'Campos obrigatórios!', 'Por favor, preencha todos os campos obrigatórios.')
      return
    }

    try {
      const updates = {
        serviceId: editFormData.service.id,
        clientName: editFormData.clientName,
        clientPhone: editFormData.clientPhone,
        clientEmail: editFormData.clientEmail || null,
        date: editFormData.date,
        time: editFormData.time
      }

      const { success, error } = await updateAppointment(appointmentToEdit.id, updates)
      
      if (!success) {
        showCustomNotification('error', 'Erro ao atualizar agendamento', error)
        return
      }

      setShowEditModal(false)
      setAppointmentToEdit(null)
    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err)
      alert('Erro ao atualizar agendamento. Tente novamente.')
    }

    updateAppointment(appointmentToEdit.id, editFormData)
    setShowEditModal(false)
    setAppointmentToEdit(null)
  }

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (appointmentToDelete) {
      const { success, error } = await deleteAppointment(appointmentToDelete.id)
      
      if (!success) {
        showCustomNotification('error', 'Erro ao deletar agendamento', error)
        return
      }

      setShowDeleteModal(false)
      setAppointmentToDelete(null)
    }
  }

  // Obter lista de clientes únicos usando WhatsApp como ID
  const getUniqueClients = () => {
    const clientsMap = new Map()
    
    appointments.forEach(apt => {
      const phone = apt.clientPhone
      
      if (!clientsMap.has(phone)) {
        clientsMap.set(phone, {
          phone: phone,
          name: apt.clientName,
          email: apt.clientEmail,
          appointments: [],
          totalSpent: 0,
          lastVisit: apt.date
        })
      }
      
      const client = clientsMap.get(phone)
      
      // Adicionar apenas agendamentos concluídos ao histórico
      if (apt.status === 'concluido') {
        client.appointments.push(apt)
        
        // Calcular total gasto
        const price = parseFloat(apt.service.price.replace('R$ ', '').replace(',', '.'))
        client.totalSpent += price
        
        // Atualizar última visita (apenas visitas concluídas)
        if (apt.date > client.lastVisit) {
          client.lastVisit = apt.date
        }
      }
    })
    
    return Array.from(clientsMap.values()).sort((a, b) => 
      b.lastVisit.localeCompare(a.lastVisit)
    )
  }

  const clients = getUniqueClients()
  
  // Filtrar clientes por nome
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Tela de login
  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <button
          className="back-arrow-btn"
          onClick={() => navigate('/')}
          aria-label="Voltar"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="login-box">
          <div className="login-header">
            <div className="login-logo">Naty Studio</div>
            <h1><Crown size={32} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '10px'}} />Área Profissional</h1>
            <p>Acesso restrito</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Senha de Acesso</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                required
                autoFocus
              />
            </div>
            <button type="submit" className="login-button">
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="professional-area">
      {/* Modal de Bloqueio - Não pode ser fechado */}
      {isPaginaBloqueada && (
        <div className="bloqueio-modal-overlay">
          <div className="bloqueio-modal-content">
            <div className="bloqueio-icon">🔒</div>
            <h1>Página Bloqueada</h1>
            <p>Esta página foi temporariamente bloqueada pelo administrador.</p>
            <p className="bloqueio-subtitle">Entre em contato com o suporte para mais informações.</p>
            <a 
              href="https://wa.me/5517992212246?text=Olá,%20preciso%20de%20suporte%20-%20Página%20bloqueada" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bloqueio-whatsapp-btn"
            >
              <span className="whatsapp-icon">💬</span>
              Falar com Suporte
            </a>
            <div className="bloqueio-animation">
              <div className="bloqueio-spinner"></div>
            </div>
          </div>
        </div>
      )}

      {/* Notificação Personalizada */}
      {showNotification && (
        <div className={`custom-notification ${notificationData.type} show`}>
          <div className="notification-icon">
            {notificationData.type === 'success' && '✅'}
            {notificationData.type === 'error' && '❌'}
            {notificationData.type === 'warning' && '⚠️'}
            {notificationData.type === 'welcome' && '💖'}
          </div>
          <div className="notification-content">
            <h4>{notificationData.message}</h4>
            {notificationData.details && <p>{notificationData.details}</p>}
          </div>
          <button className="notification-close" onClick={() => setShowNotification(false)}>✕</button>
        </div>
      )}

      <header className="professional-header">
        <div className="header-decoration"></div>
        <div className="header-actions" style={{position: 'absolute', right: '20px', top: '20px', display: 'flex', gap: '10px'}}>
          <button className="logout-button" onClick={handleLogout} style={{
            padding: '8px 15px',
            backgroundColor: '#e6cc6f',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}>
            <LogOut size={16} /> Sair
          </button>
        </div>
        <div className="header-content">
          <h1><Crown size={24} style={{marginRight: '10px', display: 'inline-block', verticalAlign: 'middle'}} />Painel Profissional</h1>
          <p className="header-subtitle">Naty Studio</p>
        </div>
      </header>

      <div className="professional-content">
        {/* View Toggle */}
        <div className="view-toggle">
          <button 
            className={viewMode === 'agenda' ? 'active' : ''}
            onClick={() => setViewMode('agenda')}
          >
            <Calendar size={18} style={{marginRight: '8px', display: 'inline-block', verticalAlign: 'middle'}} />Agenda
          </button>
          <button 
            className={viewMode === 'clients' ? 'active' : ''}
            onClick={() => setViewMode('clients')}
          >
            <Users size={18} style={{marginRight: '8px', display: 'inline-block', verticalAlign: 'middle'}} />Clientes
          </button>
          <button 
            className={viewMode === 'services' ? 'active' : ''}
            onClick={() => setViewMode('services')}
          >
            <Eye size={18} style={{marginRight: '8px', display: 'inline-block', verticalAlign: 'middle'}} />Serviços
          </button>
          <button 
            className={viewMode === 'stats' ? 'active' : ''}
            onClick={() => setViewMode('stats')}
          >
            <BarChart3 size={18} style={{marginRight: '8px', display: 'inline-block', verticalAlign: 'middle'}} />Estatísticas
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <span className="stat-value">{stats.confirmados}</span>
              <span className="stat-label">Confirmados</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-value">{stats.concluidos}</span>
              <span className="stat-label">Concluídos</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-info">
              <span className="stat-value">{stats.manutencoesPendentes}</span>
              <span className="stat-label">Retornos Agendados</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <span className="stat-value">R$ {calculateRevenue().toFixed(2)}</span>
              <span className="stat-label">Receita</span>
            </div>
          </div>
        </div>

        {viewMode === 'agenda' ? (
          <>
            {/* Date Search */}
            <div className="date-search-container">
              <label htmlFor="date-search" className="date-search-label">
                <Search size={18} />
                Buscar data específica:
              </label>
              <input 
                id="date-search"
                type="date" 
                className="date-search-input"
                onChange={(e) => handleDateSearch(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>

            {/* Date Carousel Navigation */}
            <div className="date-carousel-navigation">
              <button 
                className="carousel-nav-btn" 
                onClick={handlePrevDatePage}
                disabled={dateCarouselPage === 0}
              >
                <ChevronLeft size={20} />
                Anterior
              </button>
              <span className="carousel-page-indicator">
                Semana {dateCarouselPage + 1} de {totalDatePages}
              </span>
              <button 
                className="carousel-nav-btn" 
                onClick={handleNextDatePage}
                disabled={dateCarouselPage === totalDatePages - 1}
              >
                Próxima
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Week Calendar */}
            <div className="week-calendar" key={dateCarouselPage}>
              {weekDates.map((date, index) => {
                const dateStr = date.toISOString().split('T')[0]
                const dayAppointments = getAppointmentsForDate(dateStr)
                const appointmentsCount = dayAppointments.length
                const isSelected = dateStr === selectedDate
                const isToday = dateStr === new Date().toISOString().split('T')[0]

                return (
                  <div 
                    key={index}
                    className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${appointmentsCount > 0 ? 'has-appointments' : ''}`}
                    onClick={() => setSelectedDate(dateStr)}
                    title={appointmentsCount > 0 ? `${appointmentsCount} agendamento(s)` : 'Sem agendamentos'}
                  >
                    <div className="day-name">
                      {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <div className="day-number">{date.getDate()}</div>
                    {appointmentsCount > 0 && (
                      <div className="day-badge" title={`${appointmentsCount} agendamento(s)`}>
                        {appointmentsCount}
                      </div>
                    )}
                    {/* Indicador de retornos */}
                    {dayAppointments.some(apt => apt.service.name.toLowerCase().includes('manutenção')) && (
                      <div className="return-indicator" title="Contém retornos">🔄</div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Appointments List */}
            <div className="appointments-section">
              <h2>
                Agendamentos - {formatDateDisplay(selectedDate).toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: '2-digit', 
                  month: 'long' 
                })}
              </h2>

              {todayAppointments.length === 0 ? (
                <div className="no-appointments">
                  <p>😊 Nenhum agendamento para esta data</p>
                </div>
              ) : (
                <div className="appointments-list">
                  {todayAppointments.map(appointment => (
                    <div key={appointment.id} className={`appointment-card ${appointment.status} ${appointment.service.name.toLowerCase().includes('manutenção') ? 'is-maintenance' : ''}`}>
                      <div className="appointment-time">
                        <span className="time">{appointment.time}</span>
                        <span className={`status-badge ${appointment.status}`}>
                          {appointment.status === 'confirmado' ? '⏰ Confirmado' : appointment.status === 'concluido' ? '✅ Concluído' : '📅 Agendado'}
                        </span>
                        {appointment.service.name.toLowerCase().includes('manutenção') && (
                          <span className="maintenance-badge">🔄 Retorno</span>
                        )}
                      </div>
                      
                      <div className="appointment-details">
                        <div className="client-info">
                          <h3>{appointment.clientName}</h3>
                          <p><Phone size={14} style={{marginRight: '5px', display: 'inline-block', verticalAlign: 'middle'}} />{appointment.clientPhone}</p>
                          {appointment.clientEmail && (
                            <p><Mail size={14} style={{marginRight: '5px', display: 'inline-block', verticalAlign: 'middle'}} />{appointment.clientEmail}</p>
                          )}
                        </div>
                        
                        <div className="service-info">
                          <h4><Eye size={16} style={{marginRight: '5px', display: 'inline-block', verticalAlign: 'middle'}} />{appointment.service.name}</h4>
                          <div className="service-meta">
                            <span><Clock size={14} style={{marginRight: '5px', display: 'inline-block', verticalAlign: 'middle'}} />{appointment.service.duration}</span>
                            <span className="price">{appointment.service.price}</span>
                          </div>
                          <p className="service-desc">{appointment.service.description}</p>
                        </div>
                      </div>

                      <div className="appointment-actions">
                        {appointment.status === 'confirmado' && (
                          <>
                            <button 
                              className="btn-complete"
                              onClick={async () => {
                                const { success, error } = await completeAppointment(appointment.id)
                                if (!success) {
                                  showCustomNotification('error', 'Erro ao concluir agendamento', error)
                                }
                              }}
                            >
                              ✓ Concluir
                            </button>
                            <button 
                              className="btn-edit"
                              onClick={() => handleEditClick(appointment)}
                            >
                              ✎ Editar
                            </button>
                            <button 
                              className="btn-cancel"
                              onClick={() => handleCancelClick(appointment)}
                            >
                              ✕ Cancelar
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDeleteClick(appointment)}
                            >
                              🗑 Remover
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Próximos Agendamentos - Lista Expansível */}
            <div className="upcoming-appointments-compact">
              <div className="compact-header">
                <h3>📅 Agendamentos Pendentes</h3>
                <span className="compact-subtitle">
                  {(() => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const count = appointments.filter(apt => {
                      const aptDate = new Date(apt.date + 'T00:00:00')
                      return apt.status !== 'concluido' && apt.status !== 'cancelado' && aptDate >= today
                    }).length
                    return count > 0 ? `${count} agendamento(s) pendente(s)` : 'Nenhum agendamento pendente'
                  })()}
                </span>
              </div>

              {(() => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                
                const upcomingAppointments = appointments
                  .filter(apt => {
                    const aptDate = new Date(apt.date + 'T00:00:00')
                    return apt.status !== 'concluido' && apt.status !== 'cancelado' && aptDate >= today
                  })
                  .sort((a, b) => {
                    const dateCompare = a.date.localeCompare(b.date)
                    if (dateCompare !== 0) return dateCompare
                    return a.time.localeCompare(b.time)
                  })

                const groupedByDate = upcomingAppointments.reduce((acc, apt) => {
                  if (!acc[apt.date]) {
                    acc[apt.date] = []
                  }
                  acc[apt.date].push(apt)
                  return acc
                }, {})

                const dateKeys = Object.keys(groupedByDate)

                if (dateKeys.length === 0) {
                  return null
                }

                return (
                  <div className="compact-list">
                    {dateKeys.map(dateKey => {
                      const dateAppointments = groupedByDate[dateKey]
                      const displayDate = formatDateDisplay(dateKey)
                      const isExpanded = expandedUpcomingDates[dateKey]
                      
                      return (
                        <div key={dateKey} className={`compact-date-item ${isExpanded ? 'expanded' : ''}`}>
                          <div 
                            className="compact-date-row"
                            onClick={() => toggleUpcomingDateExpansion(dateKey)}
                          >
                            <div className="compact-date-info">
                              <Calendar size={16} />
                              <span className="compact-date-text">
                                {displayDate.toLocaleDateString('pt-BR', { 
                                  weekday: 'short', 
                                  day: '2-digit', 
                                  month: 'short'
                                })}
                              </span>
                              <span className="compact-count">{dateAppointments.length}</span>
                              {dateAppointments.some(apt => apt.service.name.toLowerCase().includes('manutenção')) && (
                                <span className="compact-return-badge">🔄</span>
                              )}
                            </div>
                            <ChevronRight size={18} className={`expand-icon ${isExpanded ? 'rotated' : ''}`} />
                          </div>

                          {isExpanded && (
                            <div className="compact-appointments-expanded">
                              {dateAppointments.map(appointment => (
                                <div key={appointment.id} className="compact-appointment">
                                  <div className="compact-apt-header">
                                    <span className="compact-time">
                                      <Clock size={14} /> {appointment.time}
                                    </span>
                                    <span className="compact-client-name">{appointment.clientName}</span>
                                    {appointment.service.name.toLowerCase().includes('manutenção') && (
                                      <span className="compact-maintenance">🔄</span>
                                    )}
                                  </div>
                                  <div className="compact-apt-details">
                                    <div className="compact-info-row">
                                      <Phone size={12} />
                                      <span>{appointment.clientPhone}</span>
                                    </div>
                                    {appointment.clientEmail && (
                                      <div className="compact-info-row">
                                        <Mail size={12} />
                                        <span>{appointment.clientEmail}</span>
                                      </div>
                                    )}
                                    <div className="compact-info-row">
                                      <span className="compact-service">{appointment.service.name}</span>
                                      <span className="compact-separator">•</span>
                                      <span className="compact-duration">{appointment.service.duration}</span>
                                      <span className="compact-separator">•</span>
                                      <span className="compact-price">{appointment.service.price}</span>
                                    </div>
                                  </div>
                                  <div className="compact-apt-actions">
                                    <button 
                                      className="compact-btn complete"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleComplete(appointment.id)
                                      }}
                                      title="Concluir"
                                    >
                                      ✅ Concluir
                                    </button>
                                    <button 
                                      className="compact-btn edit"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleEditClick(appointment)
                                      }}
                                      title="Editar"
                                    >
                                      ✏️ Editar
                                    </button>
                                    <button 
                                      className="compact-btn cancel"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleCancelClick(appointment)
                                      }}
                                      title="Cancelar"
                                    >
                                      ❌ Cancelar
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </>
        ) : viewMode === 'clients' ? (
          // Clients View
          <div className="clients-view">
            <h2>👥 Clientes Cadastrados</h2>
            
            <div className="clients-summary">
              <div className="summary-card">
                <div className="summary-icon">👤</div>
                <div className="summary-info">
                  <span className="summary-value">{clients.length}</span>
                  <span className="summary-label">Clientes Únicos</span>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="🔍 Pesquisar cliente por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>

            {filteredClients.length === 0 ? (
              <div className="no-appointments">
                <p>{searchQuery ? '🔍 Nenhum cliente encontrado com esse nome' : '😊 Nenhum cliente cadastrado ainda'}</p>
              </div>
            ) : (
              <div className="clients-list">
                {filteredClients.map(client => {
                  const isExpanded = selectedClientPhone === client.phone
                  
                  return (
                    <div key={client.phone} className={`client-card ${isExpanded ? 'expanded' : ''}`}>
                      <div 
                        className="client-header"
                        onClick={() => setSelectedClientPhone(isExpanded ? null : client.phone)}
                      >
                        <div className="client-avatar">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="client-main-info">
                          <div className="client-name-phone">
                            <h3>{client.name}</h3>
                            <p><Phone size={14} style={{marginRight: '5px', display: 'inline-block', verticalAlign: 'middle'}} />{client.phone}</p>
                          </div>
                          <div className="client-quick-stats">
                            <div className="quick-stat">
                              <span className="quick-stat-value">{client.appointments.length}</span>
                              <span className="quick-stat-label">Visitas</span>
                            </div>
                            <div className="quick-stat">
                              <span className="quick-stat-value">R$ {client.totalSpent.toFixed(0)}</span>
                              <span className="quick-stat-label">Gasto</span>
                            </div>
                          </div>
                        </div>
                        <div className="expand-icon">
                          {isExpanded ? '▼' : '▶'}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="client-details">
                          {client.email && (
                            <div className="client-email">
                              <Mail size={14} style={{marginRight: '5px', display: 'inline-block', verticalAlign: 'middle'}} />
                              {client.email}
                            </div>
                          )}

                          <div className="client-stats">
                            <div className="client-stat-item">
                              <span className="client-stat-label">Total de Visitas:</span>
                              <span className="client-stat-value">{client.appointments.length}</span>
                            </div>
                            <div className="client-stat-item">
                              <span className="client-stat-label">Total Gasto:</span>
                              <span className="client-stat-value">R$ {client.totalSpent.toFixed(2)}</span>
                            </div>
                            <div className="client-stat-item">
                              <span className="client-stat-label">Última Visita:</span>
                              <span className="client-stat-value">
                                {formatDateDisplay(client.lastVisit).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="client-appointments-summary">
                            <h4>Histórico de Serviços</h4>
                            <div className="client-services-list">
                              {client.appointments
                                .sort((a, b) => b.date.localeCompare(a.date))
                                .map((apt, index) => (
                                  <div key={index} className="client-service-item">
                                    <span className="service-date">
                                      {formatDateDisplay(apt.date).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'short'
                                      })}
                                    </span>
                                    <span className="service-name">{apt.service.name}</span>
                                    <span className={`service-status ${apt.status}`}>
                                      {apt.status === 'confirmado' ? '⏰' : apt.status === 'concluido' ? '✅' : '❌'}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : viewMode === 'services' ? (
          // Services View
          <div className="services-view">
            <div className="services-header">
              <h2>🛍️ Gerenciar Serviços</h2>
              <button 
                className="add-service-btn"
                onClick={() => setShowAddServiceModal(true)}
              >
                <Plus size={20} /> Novo Serviço
              </button>
            </div>

            <div className="services-grid">
              {services.map(service => (
                <div key={service.id} className="service-card">
                  <div className="service-card-header">
                    <div className="service-category-badge" data-category={service.category}>
                      {service.category === 'cilios' ? '👁️' : '✨'} {service.category === 'cilios' ? 'Cílios' : 'Sobrancelhas'}
                    </div>
                  </div>
                  
                  <div className="service-card-body">
                    <h3 className="service-name">{service.name}</h3>
                    <p className="service-description">{service.description}</p>
                    
                    <div className="service-info-grid">
                      <div className="service-info-item">
                        <Clock size={16} />
                        <span>{service.duration}</span>
                      </div>
                      <div className="service-info-item">
                        <span className="price-tag">💰</span>
                        <span className="service-price">{service.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="service-card-actions">
                    <button 
                      className="btn-edit-service"
                      onClick={() => handleEditServiceClick(service)}
                      title="Editar serviço"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="btn-delete-service"
                      onClick={() => handleDeleteServiceClick(service)}
                      title="Excluir serviço"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Statistics View
          <div className="stats-view">
            <h2>📊 Estatísticas e Relatórios</h2>
            
            {/* Gráfico de Pizza - Serviços Mais Pedidos */}
            <div className="stats-section">
              <h3>Serviços Mais Pedidos</h3>
              <div className="pie-chart-container">
                {pieChartData.total > 0 ? (
                  <>
                    <svg className="pie-chart" viewBox="0 0 200 200">
                      {pieChartData.slices.map((slice, index) => {
                        const colors = ['#fde383', '#f5d372', '#ffc857', '#ffb347', '#e6cc6f', '#d4a574', '#c9a961']
                        const color = colors[index % colors.length]
                        return (
                          <path
                            key={index}
                            d={getSlicePath(slice.startAngle, slice.endAngle, 90)}
                            fill={color}
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                        )
                      })}
                    </svg>
                    <div className="pie-legend">
                      {pieChartData.slices.map((slice, index) => {
                        const colors = ['#fde383', '#f5d372', '#ffc857', '#ffb347', '#e6cc6f', '#d4a574', '#c9a961']
                        const color = colors[index % colors.length]
                        return (
                          <div key={index} className="pie-legend-item">
                            <div 
                              className="pie-legend-color" 
                              style={{ backgroundColor: color }}
                            ></div>
                            <span className="pie-legend-label">{slice.name}</span>
                            <span className="pie-legend-value">
                              {slice.count} ({slice.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="no-data">Nenhum dado disponível</div>
                )}
              </div>
            </div>

            {/* Gráfico de Linhas - Crescimento ao Longo do Tempo */}
            <div className="stats-section evolution-chart-section">
              <div className="chart-header">
                <div className="chart-title-group">
                  <h3>Evolução de Agendamentos</h3>
                  <span className="chart-subtitle">Acompanhe o crescimento do seu negócio</span>
                </div>
                <div className="period-selector">
                  <button 
                    className={chartPeriod === '7days' ? 'active' : ''}
                    onClick={() => setChartPeriod('7days')}
                  >
                    <span className="period-number">7</span> dias
                  </button>
                  <button 
                    className={chartPeriod === '1month' ? 'active' : ''}
                    onClick={() => setChartPeriod('1month')}
                  >
                    <span className="period-number">1</span> mês
                  </button>
                  <button 
                    className={chartPeriod === '3months' ? 'active' : ''}
                    onClick={() => setChartPeriod('3months')}
                  >
                    <span className="period-number">3</span> meses
                  </button>
                  <button 
                    className={chartPeriod === '6months' ? 'active' : ''}
                    onClick={() => setChartPeriod('6months')}
                  >
                    <span className="period-number">6</span> meses
                  </button>
                </div>
              </div>

              {/* Cards de Resumo */}
              <div className="chart-stats-cards">
                <div className="stat-card stat-card-primary">
                  <div className="stat-icon">
                    <Calendar size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Total no Período</span>
                    <span className="stat-value">{lineChartData.total}</span>
                  </div>
                </div>
                <div className="stat-card stat-card-secondary">
                  <div className="stat-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Média por Período</span>
                    <span className="stat-value">
                      {lineChartData.periods.length > 0 
                        ? (lineChartData.total / lineChartData.periods.length).toFixed(1) 
                        : 0}
                    </span>
                  </div>
                </div>
                <div className="stat-card stat-card-tertiary">
                  <div className="stat-icon">
                    <BarChart2 size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Pico</span>
                    <span className="stat-value">
                      {Math.max(...lineChartData.data, 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="evolution-chart-container" key={chartPeriod}>
                <div className="chart-canvas-wrapper">
                  {/* Eixo Y com gradiente */}
                  <div className="evolution-y-axis">
                    {[...Array(6)].map((_, i) => {
                      const maxValue = Math.max(...lineChartData.data, 1)
                      const value = Math.ceil(maxValue - (i * maxValue / 5))
                      return (
                        <div key={i} className="evolution-y-label">
                          <span>{value}</span>
                          <div className="y-label-line"></div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Área Principal do Gráfico */}
                  <div className="evolution-chart-area">
                    {/* Linhas de grade com estilo moderno */}
                    <div className="evolution-grid">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="evolution-grid-line"></div>
                      ))}
                    </div>
                    
                    {/* SVG com a linha e área */}
                    <svg className="evolution-svg" viewBox="0 0 800 400" preserveAspectRatio="none">
                      <defs>
                        {/* Gradiente para a área preenchida */}
                        <linearGradient id="evolutionAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#fde383" stopOpacity="0.5"/>
                          <stop offset="50%" stopColor="#fde383" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="#fde383" stopOpacity="0.05"/>
                        </linearGradient>
                        
                        {/* Gradiente para a linha */}
                        <linearGradient id="evolutionLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#e6cc6f"/>
                          <stop offset="50%" stopColor="#fde383"/>
                          <stop offset="100%" stopColor="#e6cc6f"/>
                        </linearGradient>
                        
                        {/* Sombra para a linha */}
                        <filter id="evolutionShadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                          <feOffset dx="0" dy="2" result="offsetblur"/>
                          <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3"/>
                          </feComponentTransfer>
                          <feMerge>
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>

                      {(() => {
                        const maxValue = Math.max(...lineChartData.data, 1)
                        const padding = 40
                        const width = 800 - (padding * 2)
                        const height = 400
                        
                        // Calcular pontos da linha com suavização
                        const points = lineChartData.data.map((value, index) => {
                          const x = padding + (lineChartData.periods.length > 1 
                            ? (index * width) / (lineChartData.periods.length - 1)
                            : width / 2)
                          const y = height - 40 - ((value / maxValue) * (height - 80))
                          return { x, y, value }
                        })
                        
                        // Criar path suave usando curvas bezier
                        const createSmoothPath = (points, tension = 0.3) => {
                          if (points.length < 2) return `M ${points[0].x},${points[0].y}`
                          
                          let path = `M ${points[0].x},${points[0].y}`
                          
                          for (let i = 0; i < points.length - 1; i++) {
                            const current = points[i]
                            const next = points[i + 1]
                            const prev = points[i - 1] || current
                            const nextNext = points[i + 2] || next
                            
                            const cp1x = current.x + (next.x - prev.x) * tension
                            const cp1y = current.y + (next.y - prev.y) * tension
                            const cp2x = next.x - (nextNext.x - current.x) * tension
                            const cp2y = next.y - (nextNext.y - current.y) * tension
                            
                            path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`
                          }
                          
                          return path
                        }
                        
                        const linePath = createSmoothPath(points)
                        const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${padding},${height} Z`
                        
                        return (
                          <g>
                            {/* Área preenchida com gradiente */}
                            <path
                              d={areaPath}
                              fill="url(#evolutionAreaGradient)"
                              opacity="0.9"
                            />
                            
                            {/* Linha principal com gradiente e sombra */}
                            <path
                              d={linePath}
                              fill="none"
                              stroke="url(#evolutionLineGradient)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              filter="url(#evolutionShadow)"
                            />
                            
                            {/* Pontos interativos */}
                            {points.map((point, index) => (
                              <g key={index} className="evolution-point-group">
                                {/* Círculo de hover (invisível) */}
                                <circle
                                  cx={point.x}
                                  cy={point.y}
                                  r="20"
                                  fill="transparent"
                                  className="evolution-hover-area"
                                />
                                
                                {/* Ponto externo */}
                                <circle
                                  cx={point.x}
                                  cy={point.y}
                                  r="6"
                                  fill="white"
                                  stroke="#fde383"
                                  strokeWidth="2"
                                  className="evolution-point-outer"
                                />
                                
                                {/* Ponto interno */}
                                <circle
                                  cx={point.x}
                                  cy={point.y}
                                  r="3"
                                  fill="#e6cc6f"
                                  className="evolution-point-inner"
                                />
                                
                                {/* Tooltip com valor */}
                                <g className="evolution-tooltip" opacity="0">
                                  <rect
                                    x={point.x - 30}
                                    y={point.y - 45}
                                    width="60"
                                    height="32"
                                    rx="6"
                                    fill="#2d2d2d"
                                    filter="url(#evolutionShadow)"
                                  />
                                  <text
                                    x={point.x}
                                    y={point.y - 32}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="13"
                                    fontWeight="700"
                                  >
                                    {point.value}
                                  </text>
                                  <text
                                    x={point.x}
                                    y={point.y - 19}
                                    textAnchor="middle"
                                    fill="#fde383"
                                    fontSize="9"
                                    fontWeight="600"
                                  >
                                    agendamentos
                                  </text>
                                </g>
                              </g>
                            ))}
                          </g>
                        )
                      })()}
                    </svg>
                    
                    {/* Eixo X com labels melhorados */}
                    <div className="evolution-x-axis">
                      {lineChartData.periods.map((period, index) => (
                        <div key={index} className="evolution-x-label">
                          <div className="x-label-dot"></div>
                          <span>{period.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Manutenções e Retornos */}
            <div className="stats-section maintenance-section">
              <h3>📊 Análise de Manutenções (Retornos)</h3>
              <div className="maintenance-stats-grid">
                <div className="maintenance-stat-card">
                  <div className="maintenance-stat-icon">📅</div>
                  <div className="maintenance-stat-content">
                    <span className="maintenance-stat-value">{stats.manutencoesPendentes}</span>
                    <span className="maintenance-stat-label">Retornos Agendados</span>
                    <span className="maintenance-stat-desc">Manutenções futuras confirmadas</span>
                  </div>
                </div>
                <div className="maintenance-stat-card">
                  <div className="maintenance-stat-icon">✅</div>
                  <div className="maintenance-stat-content">
                    <span className="maintenance-stat-value">{stats.manutencoesConcluidas}</span>
                    <span className="maintenance-stat-label">Retornos Concluídos</span>
                    <span className="maintenance-stat-desc">Manutenções já realizadas</span>
                  </div>
                </div>
                <div className="maintenance-stat-card">
                  <div className="maintenance-stat-icon">📈</div>
                  <div className="maintenance-stat-content">
                    <span className="maintenance-stat-value">{stats.taxaRetorno}%</span>
                    <span className="maintenance-stat-label">Taxa de Retorno</span>
                    <span className="maintenance-stat-desc">Clientes que voltaram para manutenção</span>
                  </div>
                </div>
                <div className="maintenance-stat-card">
                  <div className="maintenance-stat-icon">🔢</div>
                  <div className="maintenance-stat-content">
                    <span className="maintenance-stat-value">{stats.manutencoesTotal}</span>
                    <span className="maintenance-stat-label">Total de Retornos</span>
                    <span className="maintenance-stat-desc">Todas as manutenções registradas</span>
                  </div>
                </div>
              </div>
              
              {/* Lista de Próximos Retornos */}
              <div className="next-maintenances">
                <h4>🔄 Próximos Retornos Agendados</h4>
                <div className="maintenance-list">
                  {appointments
                    .filter(apt => {
                      const aptDate = new Date(apt.date + 'T00:00:00')
                      return apt.service.name.toLowerCase().includes('manutenção') && 
                             apt.status !== 'cancelado' &&
                             apt.status !== 'concluido' &&
                             aptDate >= today
                    })
                    .sort((a, b) => {
                      if (a.date === b.date) return a.time.localeCompare(b.time)
                      return a.date.localeCompare(b.date)
                    })
                    .slice(0, 8)
                    .map(apt => (
                      <div key={apt.id} className="maintenance-item">
                        <div className="maintenance-item-date">
                          <span className="date-day">
                            {formatDateDisplay(apt.date).toLocaleDateString('pt-BR', { day: '2-digit' })}
                          </span>
                          <span className="date-month">
                            {formatDateDisplay(apt.date).toLocaleDateString('pt-BR', { month: 'short' })}
                          </span>
                        </div>
                        <div className="maintenance-item-details">
                          <span className="maintenance-item-client">{apt.clientName}</span>
                          <span className="maintenance-item-service">{apt.service.name}</span>
                        </div>
                        <div className="maintenance-item-time">
                          <Clock size={14} />
                          {apt.time}
                        </div>
                      </div>
                    ))}
                  {appointments.filter(apt => {
                    const aptDate = new Date(apt.date + 'T00:00:00')
                    return apt.service.name.toLowerCase().includes('manutenção') && 
                           apt.status === 'confirmado' &&
                           aptDate >= today
                  }).length === 0 && (
                    <div className="no-maintenance">
                      <p>Nenhum retorno agendado no momento</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="stats-section">
              <h3>Próximos Agendamentos</h3>
              <div className="upcoming-appointments">
                {appointments
                  .filter(apt => apt.status === 'confirmado')
                  .sort((a, b) => {
                    if (a.date === b.date) return a.time.localeCompare(b.time)
                    return a.date.localeCompare(b.date)
                  })
                  .slice(0, 5)
                  .map(apt => (
                    <div key={apt.id} className="upcoming-item">
                      <span className="upcoming-date">
                        {formatDateDisplay(apt.date).toLocaleDateString('pt-BR', { 
                          day: '2-digit',
                          month: 'short'
                        })}- {apt.time}
                      </span>
                      <span className="upcoming-client">{apt.clientName}</span>
                      <span className="upcoming-service">{apt.service.name}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="stats-section">
              <h3>Informações do Serviço</h3>
              <div className="service-info-cards">
                <div className="info-card">
                  <h4>🕐 Horários de Atendimento</h4>
                  <p>Segunda a Sábado</p>
                  <p>09:00 às 18:00</p>
                </div>
                <div className="info-card">
                  <h4>💼 Serviços Oferecidos</h4>
                  <p>{services.length} tipos de procedimentos</p>
                  <p>Qualidade profissional garantida</p>
                </div>
                <div className="info-card">
                  <h4>📞 Contato</h4>
                  <p>WhatsApp: (17) 98171-7922</p>
                  <p>Instagram: @nathasha_beauty_studio</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Botão Flutuante */}
      <button className="floating-add-btn" onClick={() => setShowAddModal(true)} title="Novo Agendamento">
        <Plus size={28} />
      </button>
      
      {/* Modal para adicionar novo agendamento */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Agendamento</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddAppointment} className="add-appointment-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome do Cliente *</label>
                  <input 
                    type="text" 
                    value={newAppointment.clientName}
                    onChange={(e) => setNewAppointment({...newAppointment, clientName: e.target.value})}
                    placeholder="Digite o nome"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Telefone/WhatsApp *</label>
                  <input 
                    type="tel" 
                    value={newAppointment.clientPhone}
                    onChange={(e) => setNewAppointment({...newAppointment, clientPhone: e.target.value})}
                    placeholder="(17) 98171-7922"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>E-mail (opcional)</label>
                <input 
                  type="email" 
                  value={newAppointment.clientEmail}
                  onChange={(e) => setNewAppointment({...newAppointment, clientEmail: e.target.value})}
                  placeholder="cliente@email.com"
                />
              </div>
              
              <div className="form-group">
                <label>Serviço *</label>
                <select 
                  value={newAppointment.service?.id || ''}
                  onChange={(e) => {
                    const selectedService = services.find(s => s.id === parseInt(e.target.value))
                    setNewAppointment({...newAppointment, service: selectedService})
                  }}
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.price} ({service.duration})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Data *</label>
                  <input 
                    type="date" 
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Horário *</label>
                  <select 
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                    required
                  >
                    <option value="">Selecione um horário</option>
                    {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Seção de Agendamentos Recorrentes */}
              <div className="recurring-section">
                <div className="recurring-toggle">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={newAppointment.isRecurring}
                      onChange={(e) => setNewAppointment({...newAppointment, isRecurring: e.target.checked})}
                    />
                    <span>Agendar manutenções automáticas (retornos)</span>
                  </label>
                </div>
                
                {newAppointment.isRecurring && (
                  <div className="recurring-options">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Intervalo entre retornos</label>
                        <select 
                          value={newAppointment.recurringInterval}
                          onChange={(e) => setNewAppointment({...newAppointment, recurringInterval: parseInt(e.target.value)})}
                        >
                          <option value="15">A cada 15 dias</option>
                          <option value="20">A cada 20 dias</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Durante quantos meses?</label>
                        <select 
                          value={newAppointment.recurringMonths}
                          onChange={(e) => setNewAppointment({...newAppointment, recurringMonths: parseInt(e.target.value)})}
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
                      <span>ℹ️ Serão criados aproximadamente {Math.floor((newAppointment.recurringMonths * 30) / newAppointment.recurringInterval)} agendamentos de manutenção</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel-modal" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit-modal">
                  Criar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de Confirmação de Cancelamento */}
      {showCancelModal && appointmentToCancel && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h3>Cancelar Agendamento?</h3>
            <p className="confirm-message">
              Tem certeza que deseja cancelar o agendamento de <strong>{appointmentToCancel.clientName}</strong>?
            </p>
            <div className="confirm-details">
              <div className="detail-item">
                <span className="detail-label">Data:</span>
                <span>{formatDateDisplay(appointmentToCancel.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Horário:</span>
                <span>{appointmentToCancel.time}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Serviço:</span>
                <span>{appointmentToCancel.service.name}</span>
              </div>
            </div>
            <div className="confirm-actions">
              <button 
                className="btn-confirm-cancel" 
                onClick={() => setShowCancelModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm-yes" 
                onClick={handleConfirmCancel}
              >
                Sim, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Editar */}
      {showEditModal && appointmentToEdit && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✎ Editar Agendamento</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="add-appointment-form">
              <div className="form-group">
                <label>Nome do Cliente *</label>
                <input
                  type="text"
                  value={editFormData.clientName}
                  onChange={(e) => setEditFormData({...editFormData, clientName: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  value={editFormData.clientPhone}
                  onChange={(e) => setEditFormData({...editFormData, clientPhone: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editFormData.clientEmail}
                  onChange={(e) => setEditFormData({...editFormData, clientEmail: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Serviço *</label>
                <select
                  value={editFormData.service?.id || ''}
                  onChange={(e) => {
                    const service = services.find(s => s.id === parseInt(e.target.value))
                    setEditFormData({...editFormData, service})
                  }}
                  required
                >
                  <option value="">Selecione um serviço</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.price}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Data *</label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Horário *</label>
                  <input
                    type="time"
                    value={editFormData.time}
                    onChange={(e) => setEditFormData({...editFormData, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-cancel-modal" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit-modal">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de Remover */}
      {showDeleteModal && appointmentToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="confirm-modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <h3>Remover Agendamento?</h3>
            <p className="confirm-message">
              Tem certeza que deseja <strong>remover permanentemente</strong> o agendamento de <strong>{appointmentToDelete.clientName}</strong>?
            </p>
            <div className="confirm-details">
              <div className="detail-item">
                <span className="detail-label">Data:</span>
                <span>{formatDateDisplay(appointmentToDelete.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Horário:</span>
                <span>{appointmentToDelete.time}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Serviço:</span>
                <span>{appointmentToDelete.service.name}</span>
              </div>
            </div>
            <div className="delete-warning">
              ⚠️ Esta ação não pode ser desfeita!
            </div>
            <div className="confirm-actions">
              <button 
                className="btn-confirm-cancel" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm-delete" 
                onClick={handleConfirmDelete}
              >
                Sim, remover
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon-wrapper">
              <div className="success-icon">✓</div>
            </div>
            <h3>Agendamento Confirmado!</h3>
            <p className="success-message">
              {successMessage.count === 1 ? (
                <>
                  <strong>1 agendamento</strong> foi criado com sucesso!
                </>
              ) : (
                <>
                  <strong>{successMessage.count} agendamentos</strong> foram criados com sucesso!
                </>
              )}
            </p>
            {successMessage.hasRecurring && (
              <div className="success-detail">
                <div className="success-detail-icon">🔄</div>
                <p>
                  Incluindo <strong>{successMessage.count - 1} manutenção(ões)</strong> agendadas automaticamente
                </p>
              </div>
            )}
            <button 
              className="btn-success-ok" 
              onClick={() => setShowSuccessModal(false)}
            >
              Perfeito!
            </button>
          </div>
        </div>
      )}
      
      {/* Modal de Adicionar Serviço */}
      {showAddServiceModal && (
        <div className="modal-overlay" onClick={() => setShowAddServiceModal(false)}>
          <div className="modal-content service-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Adicionar Novo Serviço</h3>
              <button className="modal-close" onClick={() => setShowAddServiceModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddService} className="service-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome do Serviço *</label>
                  <input 
                    type="text" 
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    placeholder="Ex: Volume Brasileiro Aplicação"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoria *</label>
                  <select 
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                    required
                  >
                    <option value="cilios">👁️ Cílios</option>
                    <option value="sobrancelhas">✨ Sobrancelhas</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duração (minutos) *</label>
                  <input 
                    type="number" 
                    value={newService.duration}
                    onChange={(e) => setNewService({...newService, duration: e.target.value})}
                    placeholder="Ex: 120"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Preço (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: e.target.value})}
                    placeholder="Ex: 150.00"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Descrição</label>
                  <textarea 
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                    placeholder="Descreva o serviço..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel-modal" onClick={() => setShowAddServiceModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm-modal">
                  Adicionar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Editar Serviço */}
      {showEditServiceModal && serviceToEdit && (
        <div className="modal-overlay" onClick={() => setShowEditServiceModal(false)}>
          <div className="modal-content service-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Editar Serviço</h3>
              <button className="modal-close" onClick={() => setShowEditServiceModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditService} className="service-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome do Serviço *</label>
                  <input 
                    type="text" 
                    value={editServiceData.name}
                    onChange={(e) => setEditServiceData({...editServiceData, name: e.target.value})}
                    placeholder="Ex: Volume Brasileiro Aplicação"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoria *</label>
                  <select 
                    value={editServiceData.category}
                    onChange={(e) => setEditServiceData({...editServiceData, category: e.target.value})}
                    required
                  >
                    <option value="cilios">👁️ Cílios</option>
                    <option value="sobrancelhas">✨ Sobrancelhas</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duração (minutos) *</label>
                  <input 
                    type="number" 
                    value={editServiceData.duration}
                    onChange={(e) => setEditServiceData({...editServiceData, duration: e.target.value})}
                    placeholder="Ex: 120"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Preço (R$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editServiceData.price}
                    onChange={(e) => setEditServiceData({...editServiceData, price: e.target.value})}
                    placeholder="Ex: 150.00"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Descrição</label>
                  <textarea 
                    value={editServiceData.description}
                    onChange={(e) => setEditServiceData({...editServiceData, description: e.target.value})}
                    placeholder="Descreva o serviço..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel-modal" onClick={() => setShowEditServiceModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm-modal">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmar Exclusão de Serviço */}
      {showDeleteServiceModal && serviceToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteServiceModal(false)}>
          <div className="confirm-modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">🗑️</div>
            <h3>Excluir Serviço?</h3>
            <p className="confirm-message">
              Tem certeza que deseja <strong>excluir permanentemente</strong> o serviço <strong>{serviceToDelete.name}</strong>?
            </p>
            <div className="confirm-details">
              <div className="detail-item">
                <span className="detail-label">Categoria:</span>
                <span>{serviceToDelete.category === 'cilios' ? '👁️ Cílios' : '✨ Sobrancelhas'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duração:</span>
                <span>{serviceToDelete.duration}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Preço:</span>
                <span>{serviceToDelete.price}</span>
              </div>
            </div>
            <p className="confirm-warning">
              ⚠️ Esta ação não pode ser desfeita!
            </p>
            <div className="confirm-actions">
              <button 
                className="btn-cancel-confirm"
                onClick={() => setShowDeleteServiceModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm-delete"
                onClick={handleConfirmDeleteService}
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      
      <footer className="page-footer">
        <p>Feito por <span className="cyber-link">CyberLife</span></p>
      </footer>
    </div>
  )
}

export default ProfessionalArea
