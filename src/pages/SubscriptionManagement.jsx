import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, FileText, DollarSign, Calendar, CheckCircle, AlertCircle, Download, Copy, Loader } from 'lucide-react'
import { asaasClient, PAYMENT_STATUS, BILLING_TYPES, SUBSCRIPTION_PLAN } from '../lib/asaasClient'
import { supabase } from '../lib/supabaseClient'
import './SubscriptionManagement.css'

const SubscriptionManagement = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState(null)
  const [paymentHistory, setPaymentHistory] = useState([])
  const [pendingInvoices, setPendingInvoices] = useState([])
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pixQrCode, setPixQrCode] = useState(null)
  const [boletoInfo, setBoletoInfo] = useState(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [notification, setNotification] = useState({ show: false, type: '', message: '' })
  const [userProfile, setUserProfile] = useState(null)
  const [asaasCustomerId, setAsaasCustomerId] = useState(null)

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message })
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' })
    }, 5000)
  }

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)

      // Buscar dados do usuário autenticado
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/professional-area')
        return
      }

      // Buscar perfil do usuário no Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      setUserProfile(profile)

      // Buscar ou criar assinatura no banco local
      const { data: localSubscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (subError && subError.code !== 'PGRST116') { // PGRST116 = não encontrado
        throw subError
      }

      let customerId = localSubscription?.asaas_customer_id

      // Se não existe customer_id, criar cliente no Asaas
      if (!customerId) {
        const customerResult = await asaasClient.createOrGetCustomer({
          name: profile.full_name || profile.email,
          email: profile.email,
          phone: profile.phone || '17981717922',
          cpfCnpj: profile.cpf_cnpj || undefined
        })

        if (customerResult.success) {
          customerId = customerResult.data.id
          
          // Salvar no banco local
          if (localSubscription) {
            await supabase
              .from('subscriptions')
              .update({ asaas_customer_id: customerId })
              .eq('user_id', user.id)
          } else {
            await supabase
              .from('subscriptions')
              .insert({
                user_id: user.id,
                asaas_customer_id: customerId,
                status: 'inactive'
              })
          }
        }
      }

      setAsaasCustomerId(customerId)

      if (customerId) {
        // Buscar assinatura ativa no Asaas
        const subsResult = await asaasClient.getCustomerSubscriptions(customerId)
        if (subsResult.success && subsResult.data.data?.length > 0) {
          const activeSub = subsResult.data.data.find(s => s.status === 'ACTIVE')
          setSubscription(activeSub || subsResult.data.data[0])
        }

        // Buscar histórico de pagamentos
        const historyResult = await asaasClient.getPaymentHistory(customerId)
        if (historyResult.success) {
          setPaymentHistory(historyResult.payments)
        }

        // Buscar faturas pendentes e vencidas
        const pendingResult = await asaasClient.getPendingPayments(customerId)
        const overdueResult = await asaasClient.getOverduePayments(customerId)
        
        const allPending = []
        if (pendingResult.success) {
          allPending.push(...pendingResult.data.data)
        }
        if (overdueResult.success) {
          allPending.push(...overdueResult.data.data)
        }
        
        setPendingInvoices(allPending)
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      showNotification('error', 'Erro ao carregar dados da assinatura')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubscription = async () => {
    if (!asaasCustomerId) {
      showNotification('error', 'Erro ao identificar cliente')
      return
    }

    try {
      setProcessingPayment(true)

      const result = await asaasClient.createSubscription({
        customerId: asaasCustomerId,
        value: SUBSCRIPTION_PLAN.value,
        billingType: 'CREDIT_CARD',
        cycle: 'MONTHLY',
        description: SUBSCRIPTION_PLAN.description
      })

      if (result.success) {
        showNotification('success', 'Assinatura criada com sucesso!')
        
        // Atualizar no banco local
        const { data: { user } } = await supabase.auth.getUser()
        await supabase
          .from('subscriptions')
          .update({
            asaas_subscription_id: result.data.id,
            status: 'active',
            plan_value: SUBSCRIPTION_PLAN.value
          })
          .eq('user_id', user.id)

        loadSubscriptionData()
      } else {
        showNotification('error', result.error)
      }
    } catch (error) {
      console.error('Erro ao criar assinatura:', error)
      showNotification('error', 'Erro ao criar assinatura')
    } finally {
      setProcessingPayment(false)
    }
  }

  const handlePayInvoice = async (payment, billingType) => {
    setSelectedPayment(payment)
    setProcessingPayment(true)

    try {
      if (billingType === 'PIX') {
        const pixResult = await asaasClient.getPixQrCode(payment.id)
        if (pixResult.success) {
          setPixQrCode(pixResult.data)
        } else {
          showNotification('error', 'Erro ao gerar código PIX')
        }
      } else if (billingType === 'BOLETO') {
        const boletoResult = await asaasClient.getBoletoInfo(payment.id)
        if (boletoResult.success) {
          setBoletoInfo(boletoResult.data)
        } else {
          showNotification('error', 'Erro ao gerar boleto')
        }
      }

      setShowPaymentModal(true)
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      showNotification('error', 'Erro ao processar pagamento')
    } finally {
      setProcessingPayment(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showNotification('success', 'Copiado para a área de transferência!')
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'RECEIVED':
      case 'CONFIRMED':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'OVERDUE':
        return 'danger'
      default:
        return 'default'
    }
  }

  if (loading) {
    return (
      <div className="subscription-loading">
        <Loader className="spinner" size={48} />
        <p>Carregando dados da assinatura...</p>
      </div>
    )
  }

  return (
    <div className="subscription-management">
      {/* Notificação */}
      {notification.show && (
        <div className={`subscription-notification ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="subscription-header">
        <button className="back-button" onClick={() => navigate('/professional-area')}>
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <h1>Gerenciar Assinatura</h1>
      </header>

      <div className="subscription-content">
        {/* Card de Assinatura Atual */}
        <section className="subscription-card">
          <div className="card-header">
            <CreditCard size={24} />
            <h2>Assinatura Atual</h2>
          </div>
          
          {subscription ? (
            <div className="subscription-info">
              <div className="info-row">
                <span className="label">Plano:</span>
                <span className="value">{SUBSCRIPTION_PLAN.description}</span>
              </div>
              <div className="info-row">
                <span className="label">Valor Mensal:</span>
                <span className="value price">{formatCurrency(SUBSCRIPTION_PLAN.value)}</span>
              </div>
              <div className="info-row">
                <span className="label">Status:</span>
                <span className={`badge ${subscription.status.toLowerCase()}`}>
                  {subscription.status === 'ACTIVE' ? 'Ativa' : subscription.status}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Próximo Vencimento:</span>
                <span className="value">{formatDate(subscription.nextDueDate)}</span>
              </div>
            </div>
          ) : (
            <div className="no-subscription">
              <p>Você ainda não possui uma assinatura ativa.</p>
              <button className="btn-primary" onClick={handleCreateSubscription} disabled={processingPayment}>
                {processingPayment ? 'Processando...' : 'Assinar Agora'}
              </button>
            </div>
          )}
        </section>

        {/* Faturas Pendentes */}
        {pendingInvoices.length > 0 && (
          <section className="pending-invoices">
            <div className="section-header">
              <AlertCircle size={24} color="#ff6b6b" />
              <h2>Faturas em Aberto</h2>
              <span className="badge danger">{pendingInvoices.length}</span>
            </div>

            <div className="invoices-list">
              {pendingInvoices.map(invoice => (
                <div key={invoice.id} className="invoice-item">
                  <div className="invoice-info">
                    <div className="invoice-date">
                      <Calendar size={16} />
                      <span>Vencimento: {formatDate(invoice.dueDate)}</span>
                    </div>
                    <div className="invoice-value">
                      <DollarSign size={16} />
                      <span>{formatCurrency(invoice.value)}</span>
                    </div>
                    <span className={`invoice-status ${getStatusColor(invoice.status)}`}>
                      {PAYMENT_STATUS[invoice.status] || invoice.status}
                    </span>
                  </div>

                  <div className="invoice-actions">
                    <button 
                      className="btn-pay pix"
                      onClick={() => handlePayInvoice(invoice, 'PIX')}
                      disabled={processingPayment}
                    >
                      Pagar com PIX
                    </button>
                    <button 
                      className="btn-pay boleto"
                      onClick={() => handlePayInvoice(invoice, 'BOLETO')}
                      disabled={processingPayment}
                    >
                      Pagar com Boleto
                    </button>
                    {invoice.invoiceUrl && (
                      <a 
                        href={invoice.invoiceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-view"
                      >
                        <FileText size={16} />
                        Ver Fatura
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Histórico de Pagamentos */}
        <section className="payment-history">
          <div className="section-header">
            <FileText size={24} />
            <h2>Histórico de Pagamentos</h2>
          </div>

          {paymentHistory.length > 0 ? (
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Forma de Pagamento</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map(payment => (
                    <tr key={payment.id}>
                      <td>{formatDate(payment.dueDate)}</td>
                      <td>{payment.description}</td>
                      <td className="value">{formatCurrency(payment.value)}</td>
                      <td>{BILLING_TYPES[payment.billingType] || payment.billingType}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(payment.status)}`}>
                          {PAYMENT_STATUS[payment.status] || payment.status}
                        </span>
                      </td>
                      <td>
                        {payment.invoiceUrl && (
                          <a 
                            href={payment.invoiceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-download"
                            title="Baixar Fatura"
                          >
                            <Download size={16} />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-history">
              <p>Nenhum histórico de pagamento disponível</p>
            </div>
          )}
        </section>
      </div>

      {/* Modal de Pagamento */}
      {showPaymentModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => {
          setShowPaymentModal(false)
          setPixQrCode(null)
          setBoletoInfo(null)
        }}>
          <div className="modal-content payment-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pagar Fatura</h2>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowPaymentModal(false)
                  setPixQrCode(null)
                  setBoletoInfo(null)
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="payment-details">
                <p><strong>Valor:</strong> {formatCurrency(selectedPayment.value)}</p>
                <p><strong>Vencimento:</strong> {formatDate(selectedPayment.dueDate)}</p>
              </div>

              {pixQrCode && (
                <div className="pix-payment">
                  <h3>Pagamento via PIX</h3>
                  {pixQrCode.encodedImage && (
                    <div className="qrcode-container">
                      <img 
                        src={`data:image/png;base64,${pixQrCode.encodedImage}`} 
                        alt="QR Code PIX" 
                      />
                    </div>
                  )}
                  <div className="pix-code">
                    <p>Copie o código PIX:</p>
                    <div className="code-box">
                      <code>{pixQrCode.payload}</code>
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard(pixQrCode.payload)}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="payment-info">
                    O pagamento será confirmado automaticamente após o processamento.
                  </p>
                </div>
              )}

              {boletoInfo && (
                <div className="boleto-payment">
                  <h3>Pagamento via Boleto</h3>
                  <div className="boleto-code">
                    <p>Linha digitável:</p>
                    <div className="code-box">
                      <code>{boletoInfo.identificationField}</code>
                      <button 
                        className="btn-copy"
                        onClick={() => copyToClipboard(boletoInfo.identificationField)}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  {selectedPayment.bankSlipUrl && (
                    <a 
                      href={selectedPayment.bankSlipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      <Download size={16} />
                      Baixar Boleto
                    </a>
                  )}
                  <p className="payment-info">
                    O boleto pode levar até 3 dias úteis para ser compensado.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubscriptionManagement
