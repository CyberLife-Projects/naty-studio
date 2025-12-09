# 💳 Sistema de Assinatura Recorrente - Asaas

## 📋 Visão Geral

Sistema de assinatura mensal implementado com integração à API do Asaas para o Naty Studio. Valor fixo de **R$ 34,90/mês**.

## ✨ Funcionalidades Implementadas

### 1. **Integração com Asaas API** (`src/lib/asaasClient.js`)
- Cliente completo para comunicação com a API Asaas
- Gerenciamento de clientes (criar/buscar)
- Criação e gerenciamento de assinaturas recorrentes
- Listagem de faturas e histórico de pagamentos
- Geração de códigos PIX e boletos
- Verificação de status de pagamentos

### 2. **Página de Gerenciamento** (`src/pages/SubscriptionManagement.jsx`)
- Visualização da assinatura atual
- Status da assinatura (ativa/inativa)
- Próximo vencimento
- Histórico completo de pagamentos
- Faturas em aberto destacadas
- Múltiplas formas de pagamento

### 3. **Formas de Pagamento Disponíveis**
- **PIX**: QR Code e código copia-e-cola
- **Boleto Bancário**: Linha digitável e download do boleto
- **Cartão de Crédito**: Integração via Asaas

### 4. **Banco de Dados** (Supabase)
```sql
-- Tabela subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  asaas_customer_id TEXT,
  asaas_subscription_id TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended', 'cancelled')),
  plan_value DECIMAL(10,2) DEFAULT 34.90,
  next_due_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 5. **Interface do Usuário**
- Botão "Gerenciar Assinatura" na área profissional (ao lado do botão Sair)
- Design moderno e responsivo
- Notificações visuais de sucesso/erro
- Cards informativos
- Tabela de histórico de pagamentos
- Modais para pagamento via PIX/Boleto

## 🔧 Configuração

### 1. **Variáveis de Ambiente**
A chave da API do Asaas está diretamente no código em `src/lib/asaasClient.js`:
```javascript
const ASAAS_API_KEY = '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjI2YmI2ZDkwLWUxYzktNGUwYy05OTVjLTY2MTcwZWY3NWIyZjo6JGFhY2hfNzU5ODZkN2YtNTQyOC00YzYxLThlYzAtMGVmMzZjOWQ1MDZj'
```

### 2. **Executar SQL no Supabase**
Execute o schema atualizado em `supabase-schema.sql` no SQL Editor do Supabase para criar a tabela `subscriptions` e suas políticas RLS.

### 3. **Adicionar CPF ao Perfil (Opcional)**
Para melhor integração com o Asaas, adicione o CPF no perfil do usuário:
```sql
UPDATE profiles SET cpf_cnpj = '000.000.000-00' WHERE email = 'seu-email@exemplo.com';
```

## 📱 Como Usar

### Para o Profissional:

1. **Acessar Gerenciamento**
   - Fazer login na área profissional
   - Clicar em "Gerenciar Assinatura" no cabeçalho

2. **Primeira Assinatura**
   - Se não possui assinatura, clicar em "Assinar Agora"
   - Sistema cria automaticamente o cliente no Asaas
   - Assinatura recorrente mensal de R$ 34,90 é criada

3. **Visualizar Histórico**
   - Ver todos os pagamentos realizados
   - Status de cada pagamento
   - Datas e valores

4. **Pagar Faturas em Aberto**
   - Faturas pendentes aparecem destacadas em vermelho
   - Escolher entre PIX, Boleto ou Cartão
   - Copiar código PIX ou linha digitável do boleto
   - Download do boleto disponível

## 🔄 Fluxo de Pagamento

### PIX
1. Cliente clica em "Pagar com PIX"
2. Sistema gera QR Code e código copia-e-cola
3. Cliente escaneia ou copia o código
4. Pagamento é confirmado automaticamente pelo Asaas

### Boleto
1. Cliente clica em "Pagar com Boleto"
2. Sistema gera linha digitável
3. Cliente pode copiar ou baixar o boleto em PDF
4. Compensação em até 3 dias úteis

### Cartão de Crédito
1. Configurado como método padrão na assinatura
2. Cobrado automaticamente todo mês
3. Cliente recebe notificação por email

## 🎨 Estrutura de Arquivos

```
src/
├── lib/
│   ├── asaasClient.js          # Cliente da API Asaas
│   └── supabaseClient.js       # Cliente Supabase
├── pages/
│   ├── ProfessionalArea.jsx    # Área profissional (com botão)
│   ├── SubscriptionManagement.jsx  # Página de assinatura
│   └── SubscriptionManagement.css  # Estilos da página
└── App.jsx                     # Rotas da aplicação

supabase-schema.sql             # Schema do banco (atualizado)
```

## 🔐 Segurança

### Row Level Security (RLS)
- Usuários só veem suas próprias assinaturas
- Admins podem ver todas as assinaturas
- Políticas configuradas no Supabase

### API Key
- Chave de produção do Asaas protegida
- Requisições feitas pelo backend (cliente JavaScript)
- Validação de usuário autenticado

## 📊 Monitoramento

### Dashboard Asaas
Acesse [sandbox.asaas.com](https://sandbox.asaas.com) (ou produção) para:
- Ver todas as transações
- Gerenciar assinaturas
- Análise financeira
- Relatórios

### Banco de Dados
Monitore a tabela `subscriptions` no Supabase para:
- Status das assinaturas
- Sincronização com Asaas
- IDs de clientes e assinaturas

## 🐛 Tratamento de Erros

O sistema possui tratamento completo de erros:
- Notificações visuais para o usuário
- Logs no console para debug
- Mensagens descritivas do Asaas
- Validações de dados

## 🚀 Melhorias Futuras

1. **Webhooks do Asaas**
   - Atualização automática de status de pagamento
   - Notificações em tempo real

2. **Email/SMS**
   - Lembretes de vencimento
   - Confirmação de pagamento

3. **Planos Diferenciados**
   - Múltiplas opções de assinatura
   - Recursos adicionais por plano

4. **Analytics**
   - Métricas de assinaturas
   - Taxa de churn
   - Receita recorrente

## 📞 Suporte

Para dúvidas sobre a integração:
- Documentação Asaas: https://docs.asaas.com
- Supabase: https://supabase.com/docs

## ✅ Checklist de Implementação

- [x] Cliente Asaas API
- [x] Página de gerenciamento de assinatura
- [x] Botão na área profissional
- [x] Histórico de pagamentos
- [x] Pagamento via PIX
- [x] Pagamento via Boleto
- [x] Pagamento via Cartão
- [x] Tabela no Supabase
- [x] Row Level Security
- [x] Interface responsiva
- [x] Notificações
- [x] Documentação

---

**Desenvolvido por CyberLife** 🚀
