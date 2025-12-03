import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  // Estados
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPaginaBloqueada, setIsPaginaBloqueada] = useState(() => {
    // Carregar estado do localStorage
    const saved = localStorage.getItem('paginaBloqueada')
    return saved === 'true'
  })

  // Horários disponíveis (9h às 18h)
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]

  // Carregar serviços e agendamentos ao montar
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([fetchServices(), fetchAppointments()])
      setLoading(false)
    }
    initialize()

    // Inscrever para mudanças em tempo real
    const appointmentsSubscription = supabase
      .channel('appointments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          console.log('Mudança em appointments:', payload)
          handleAppointmentChange(payload)
        }
      )
      .subscribe()

    return () => {
      appointmentsSubscription.unsubscribe()
    }
  }, [])

  // Buscar serviços do Supabase
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      
      // Mapear para o formato esperado pela aplicação
      const mappedServices = data.map(service => ({
        id: service.id,
        name: service.name,
        duration: formatDuration(service.duration),
        price: formatPrice(service.price),
        description: service.description,
        category: service.category,
        requiresMaintenance: service.requires_maintenance,
        maintenanceIntervalDays: service.maintenance_interval_days,
        rawDuration: service.duration, // Manter duração em minutos para cálculos
        rawPrice: service.price // Manter preço numérico para cálculos
      }))

      setServices(mappedServices)
    } catch (err) {
      console.error('Erro ao buscar serviços:', err)
      setError(err.message)
    }
  }

  // Buscar agendamentos do Supabase
  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(*)
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      if (error) throw error

      // Mapear para o formato esperado pela aplicação
      const mappedAppointments = data.map(apt => {
        // Criar objeto de serviço completo
        const serviceObj = apt.service ? {
          id: apt.service.id,
          name: apt.service.name,
          duration: formatDuration(apt.service.duration),
          price: formatPrice(apt.service.price),
          description: apt.service.description,
          category: apt.service.category,
          requiresMaintenance: apt.service.requires_maintenance,
          maintenanceIntervalDays: apt.service.maintenance_interval_days,
          rawDuration: apt.service.duration,
          rawPrice: apt.service.price
        } : null

        return {
          id: apt.id,
          serviceId: apt.service_id,
          serviceName: apt.service?.name || 'Serviço desconhecido',
          service: serviceObj, // Adicionar objeto completo do serviço
          clientName: apt.client_name,
          clientPhone: apt.client_phone,
          clientEmail: apt.client_email,
          date: apt.appointment_date,
          time: apt.appointment_time.slice(0, 5), // HH:MM
          status: apt.status,
          isMaintenance: apt.is_maintenance,
          parentAppointmentId: apt.parent_appointment_id,
          notes: apt.notes,
          createdAt: apt.created_at,
          updatedAt: apt.updated_at,
          completedAt: apt.completed_at,
          cancelledAt: apt.cancelled_at
        }
      })

      setAppointments(mappedAppointments)
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err)
      setError(err.message)
    }
  }

  // Manipular mudanças em tempo real
  const handleAppointmentChange = (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case 'INSERT':
        // Adicionar novo agendamento
        fetchAppointments() // Refetch para garantir dados completos
        break
      
      case 'UPDATE':
        // Atualizar agendamento existente
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === newRecord.id 
              ? mapAppointmentFromDB(newRecord)
              : apt
          )
        )
        break
      
      case 'DELETE':
        // Remover agendamento
        setAppointments(prev => 
          prev.filter(apt => apt.id !== oldRecord.id)
        )
        break
    }
  }

  // Mapear agendamento do banco para formato da app
  const mapAppointmentFromDB = (dbAppointment) => {
    // Criar objeto de serviço completo
    const serviceObj = dbAppointment.service ? {
      id: dbAppointment.service.id,
      name: dbAppointment.service.name,
      duration: formatDuration(dbAppointment.service.duration),
      price: formatPrice(dbAppointment.service.price),
      description: dbAppointment.service.description,
      category: dbAppointment.service.category,
      requiresMaintenance: dbAppointment.service.requires_maintenance,
      maintenanceIntervalDays: dbAppointment.service.maintenance_interval_days,
      rawDuration: dbAppointment.service.duration,
      rawPrice: dbAppointment.service.price
    } : null

    return {
      id: dbAppointment.id,
      serviceId: dbAppointment.service_id,
      serviceName: dbAppointment.service?.name || 'Serviço desconhecido',
      service: serviceObj,
      clientName: dbAppointment.client_name,
      clientPhone: dbAppointment.client_phone,
      clientEmail: dbAppointment.client_email,
      date: dbAppointment.appointment_date,
      time: dbAppointment.appointment_time.slice(0, 5),
      status: dbAppointment.status,
      isMaintenance: dbAppointment.is_maintenance,
      parentAppointmentId: dbAppointment.parent_appointment_id,
      notes: dbAppointment.notes,
      createdAt: dbAppointment.created_at,
      updatedAt: dbAppointment.updated_at,
      completedAt: dbAppointment.completed_at,
      cancelledAt: dbAppointment.cancelled_at
    }
  }

  // Formatar duração de minutos para string
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours === 0) return `${mins}min`
    if (mins === 0) return `${hours}h`
    return `${hours}h${mins}min`
  }

  // Formatar preço
  const formatPrice = (price) => {
    return `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}`
  }

  // Adicionar novo agendamento
  const addAppointment = async (appointmentData) => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          service_id: appointmentData.serviceId,
          client_name: appointmentData.clientName,
          client_phone: appointmentData.clientPhone,
          client_email: appointmentData.clientEmail || null,
          appointment_date: appointmentData.date,
          appointment_time: appointmentData.time,
          status: 'agendado',
          is_maintenance: appointmentData.isMaintenance || false,
          parent_appointment_id: appointmentData.parentAppointmentId || null,
          notes: appointmentData.notes || null
        }])
        .select(`
          *,
          service:services(*)
        `)
        .single()

      if (error) throw error

      const mappedAppointment = mapAppointmentFromDB(data)
      
      // Adicionar ao estado local imediatamente
      setAppointments(prev => [...prev, mappedAppointment])

      return { success: true, data: mappedAppointment, error: null }
    } catch (err) {
      console.error('Erro ao adicionar agendamento:', err)
      setError(err.message)
      return { success: false, data: null, error: err.message }
    }
  }

  // Verificar disponibilidade de horário
  const isTimeAvailable = (date, time, excludeAppointmentId = null) => {
    return !appointments.some(
      apt => 
        apt.date === date && 
        apt.time === time && 
        apt.status === 'agendado' &&
        apt.id !== excludeAppointmentId
    )
  }

  // Obter horários disponíveis para uma data
  const getAvailableSlots = (date, excludeAppointmentId = null) => {
    return timeSlots.filter(time => isTimeAvailable(date, time, excludeAppointmentId))
  }

  // Cancelar agendamento
  const cancelAppointment = async (id) => {
    try {
      setError(null)

      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelado',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      // Atualizar estado local
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === id 
            ? { ...apt, status: 'cancelado', cancelledAt: new Date().toISOString() }
            : apt
        )
      )

      return { success: true, error: null }
    } catch (err) {
      console.error('Erro ao cancelar agendamento:', err)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  // Remover agendamento permanentemente
  const deleteAppointment = async (id) => {
    try {
      setError(null)

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remover do estado local
      setAppointments(prev => prev.filter(apt => apt.id !== id))

      return { success: true, error: null }
    } catch (err) {
      console.error('Erro ao deletar agendamento:', err)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  // Atualizar agendamento
  const updateAppointment = async (id, updatedData) => {
    try {
      setError(null)

      // Mapear campos para o formato do banco
      const dbUpdate = {}
      if (updatedData.serviceId) dbUpdate.service_id = updatedData.serviceId
      if (updatedData.clientName) dbUpdate.client_name = updatedData.clientName
      if (updatedData.clientPhone) dbUpdate.client_phone = updatedData.clientPhone
      if (updatedData.clientEmail !== undefined) dbUpdate.client_email = updatedData.clientEmail
      if (updatedData.date) dbUpdate.appointment_date = updatedData.date
      if (updatedData.time) dbUpdate.appointment_time = updatedData.time
      if (updatedData.status) dbUpdate.status = updatedData.status
      if (updatedData.notes !== undefined) dbUpdate.notes = updatedData.notes

      const { data, error } = await supabase
        .from('appointments')
        .update(dbUpdate)
        .eq('id', id)
        .select(`
          *,
          service:services(*)
        `)
        .single()

      if (error) throw error

      const mappedAppointment = mapAppointmentFromDB(data)

      // Atualizar estado local
      setAppointments(prev =>
        prev.map(apt => apt.id === id ? mappedAppointment : apt)
      )

      return { success: true, data: mappedAppointment, error: null }
    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err)
      setError(err.message)
      return { success: false, data: null, error: err.message }
    }
  }

  // Concluir agendamento
  const completeAppointment = async (id) => {
    try {
      setError(null)

      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'concluido',
          completed_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      // Atualizar estado local
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === id 
            ? { ...apt, status: 'concluido', completedAt: new Date().toISOString() }
            : apt
        )
      )

      return { success: true, error: null }
    } catch (err) {
      console.error('Erro ao concluir agendamento:', err)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  // Obter agendamentos por data
  const getAppointmentsByDate = (date) => {
    return appointments.filter(apt => apt.date === date && apt.status !== 'cancelado')
  }

  // Funções de bloqueio
  const bloquearPagina = () => {
    setIsPaginaBloqueada(true)
    localStorage.setItem('paginaBloqueada', 'true')
  }

  const desbloquearPagina = () => {
    setIsPaginaBloqueada(false)
    localStorage.setItem('paginaBloqueada', 'false')
  }

  const value = {
    appointments,
    services,
    timeSlots,
    loading,
    error,
    addAppointment,
    isTimeAvailable,
    getAvailableSlots,
    cancelAppointment,
    deleteAppointment,
    updateAppointment,
    completeAppointment,
    getAppointmentsByDate,
    fetchAppointments, // Expor para recarregar quando necessário
    fetchServices,
    isPaginaBloqueada,
    bloquearPagina,
    desbloquearPagina
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
