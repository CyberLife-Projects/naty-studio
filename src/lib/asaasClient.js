// Cliente para integração com Asaas API
const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjI2YmI2ZDkwLWUxYzktNGUwYy05OTVjLTY2MTcwZWY3NWIyZjo6JGFhY2hfNzU5ODZkN2YtNTQyOC00YzYxLThlYzAtMGVmMzZjOWQ1MDZj'
const ASAAS_API_URL = 'https://api.asaas.com/v3'

// Valor fixo da assinatura mensal
const SUBSCRIPTION_VALUE = 34.90

class AsaasClient {
  constructor() {
    this.apiKey = ASAAS_API_KEY
    this.baseUrl = ASAAS_API_URL
  }

  // Método auxiliar para fazer requisições
  async request(endpoint, method = 'GET', data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'access_token': this.apiKey
      }
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options)
      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.errors?.[0]?.description || 'Erro na requisição Asaas')
      }

      return { success: true, data: responseData }
    } catch (error) {
      console.error('Erro Asaas:', error)
      return { success: false, error: error.message }
    }
  }

  // Criar ou buscar cliente no Asaas
  async createOrGetCustomer(customerData) {
    const { name, email, phone, cpfCnpj } = customerData

    // Tentar buscar cliente pelo email ou CPF
    if (cpfCnpj) {
      const searchResult = await this.request(`/customers?cpfCnpj=${cpfCnpj}`)
      if (searchResult.success && searchResult.data.data?.length > 0) {
        return { success: true, data: searchResult.data.data[0] }
      }
    }

    // Se não encontrou, criar novo cliente
    const createResult = await this.request('/customers', 'POST', {
      name,
      email,
      phone: phone.replace(/\D/g, ''), // Remove caracteres não numéricos
      cpfCnpj: cpfCnpj || undefined,
      notificationDisabled: false
    })

    return createResult
  }

  // Criar assinatura recorrente
  async createSubscription(subscriptionData) {
    const {
      customerId,
      value = SUBSCRIPTION_VALUE,
      billingType = 'CREDIT_CARD', // BOLETO, CREDIT_CARD, PIX
      cycle = 'MONTHLY',
      description = 'Assinatura Naty Studio',
      nextDueDate
    } = subscriptionData

    const result = await this.request('/subscriptions', 'POST', {
      customer: customerId,
      billingType,
      value,
      cycle,
      description,
      nextDueDate: nextDueDate || new Date().toISOString().split('T')[0]
    })

    return result
  }

  // Buscar assinatura por ID
  async getSubscription(subscriptionId) {
    return await this.request(`/subscriptions/${subscriptionId}`)
  }

  // Listar faturas de uma assinatura
  async getSubscriptionInvoices(subscriptionId) {
    return await this.request(`/subscriptions/${subscriptionId}/payments`)
  }

  // Buscar todas as assinaturas de um cliente
  async getCustomerSubscriptions(customerId) {
    return await this.request(`/subscriptions?customer=${customerId}`)
  }

  // Buscar faturas (payments) de um cliente
  async getCustomerPayments(customerId, status = null) {
    let endpoint = `/payments?customer=${customerId}`
    if (status) {
      endpoint += `&status=${status}` // PENDING, RECEIVED, CONFIRMED, OVERDUE, etc.
    }
    return await this.request(endpoint)
  }

  // Buscar fatura específica
  async getPayment(paymentId) {
    return await this.request(`/payments/${paymentId}`)
  }

  // Gerar código PIX para uma fatura
  async getPixQrCode(paymentId) {
    return await this.request(`/payments/${paymentId}/pixQrCode`)
  }

  // Gerar linha digitável do boleto
  async getBoletoInfo(paymentId) {
    return await this.request(`/payments/${paymentId}/identificationField`)
  }

  // Cancelar assinatura
  async cancelSubscription(subscriptionId) {
    return await this.request(`/subscriptions/${subscriptionId}`, 'DELETE')
  }

  // Atualizar assinatura
  async updateSubscription(subscriptionId, updateData) {
    return await this.request(`/subscriptions/${subscriptionId}`, 'POST', updateData)
  }

  // Criar cobrança avulsa (para faturas em aberto)
  async createPayment(paymentData) {
    const {
      customerId,
      value,
      dueDate,
      description = 'Pagamento Naty Studio',
      billingType = 'CREDIT_CARD'
    } = paymentData

    return await this.request('/payments', 'POST', {
      customer: customerId,
      billingType,
      value,
      dueDate,
      description
    })
  }

  // Verificar status de pagamento
  async checkPaymentStatus(paymentId) {
    const result = await this.getPayment(paymentId)
    if (result.success) {
      return {
        success: true,
        status: result.data.status,
        isPaid: ['RECEIVED', 'CONFIRMED'].includes(result.data.status)
      }
    }
    return result
  }

  // Listar todas as faturas pendentes de um cliente
  async getPendingPayments(customerId) {
    return await this.getCustomerPayments(customerId, 'PENDING')
  }

  // Listar faturas vencidas
  async getOverduePayments(customerId) {
    return await this.getCustomerPayments(customerId, 'OVERDUE')
  }

  // Buscar histórico completo de pagamentos
  async getPaymentHistory(customerId) {
    const result = await this.request(`/payments?customer=${customerId}&limit=100`)
    if (result.success) {
      return {
        success: true,
        payments: result.data.data.map(payment => ({
          id: payment.id,
          value: payment.value,
          dueDate: payment.dueDate,
          paymentDate: payment.paymentDate,
          status: payment.status,
          description: payment.description,
          billingType: payment.billingType,
          invoiceUrl: payment.invoiceUrl,
          bankSlipUrl: payment.bankSlipUrl
        }))
      }
    }
    return result
  }
}

// Exportar instância singleton
export const asaasClient = new AsaasClient()

// Exportar constantes úteis
export const SUBSCRIPTION_PLAN = {
  value: SUBSCRIPTION_VALUE,
  description: 'Assinatura Mensal - Naty Studio',
  cycle: 'MONTHLY'
}

export const PAYMENT_STATUS = {
  PENDING: 'Pendente',
  RECEIVED: 'Recebido',
  CONFIRMED: 'Confirmado',
  OVERDUE: 'Vencido',
  REFUNDED: 'Estornado',
  RECEIVED_IN_CASH: 'Recebido em Dinheiro',
  REFUND_REQUESTED: 'Estorno Solicitado',
  CHARGEBACK_REQUESTED: 'Chargeback Solicitado',
  CHARGEBACK_DISPUTE: 'Em Disputa',
  AWAITING_CHARGEBACK_REVERSAL: 'Aguardando Reversão',
  DUNNING_REQUESTED: 'Negativação Solicitada',
  DUNNING_RECEIVED: 'Negativado',
  AWAITING_RISK_ANALYSIS: 'Aguardando Análise'
}

export const BILLING_TYPES = {
  BOLETO: 'Boleto Bancário',
  CREDIT_CARD: 'Cartão de Crédito',
  PIX: 'PIX',
  UNDEFINED: 'Não Definido'
}
