# ⚡ Quick Start - Bia Souza Nails

## 🎯 Inicialização Rápida

### 1️⃣ Instalar Dependências
```bash
npm install
```

### 2️⃣ Configurar Supabase

1. Crie sua conta em [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Execute o arquivo `supabase-schema.sql` no SQL Editor
4. Copie `.env.example` para `.env`
5. Preencha as credenciais do Supabase no `.env`

**Leia o guia completo em:** [`README-SUPABASE.md`](./README-SUPABASE.md)

### 3️⃣ Criar Usuário Admin

No SQL Editor do Supabase, execute:

```sql
-- 1. Crie o usuário via interface do Supabase (Authentication > Users)
-- 2. Depois execute isso (substitua o email):

UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';
```

### 4️⃣ Iniciar Aplicação
```bash
npm run dev
```

Acesse: `http://localhost:5173`

---

## 📁 Estrutura do Projeto

```
controle-pedido/
├── src/
│   ├── context/
│   │   ├── AppContext.jsx      # Gerenciamento de estado (agendamentos, serviços)
│   │   └── AuthContext.jsx     # Autenticação de usuários
│   ├── lib/
│   │   └── supabaseClient.js   # Cliente Supabase
│   ├── pages/
│   │   ├── Home.jsx            # Página inicial
│   │   ├── ClientArea.jsx      # Área de agendamento do cliente
│   │   └── ProfessionalArea.jsx # Painel administrativo
│   ├── App.jsx
│   └── main.jsx
├── supabase-schema.sql         # Schema do banco de dados
├── .env.example                # Exemplo de variáveis de ambiente
├── README-SUPABASE.md          # Guia completo de setup
└── package.json
```

---

## 🎨 Funcionalidades

### Para Clientes
- ✅ Visualizar serviços disponíveis
- ✅ Agendar horários (com verificação de disponibilidade)
- ✅ Agendamentos recorrentes (manutenções automáticas)
- ✅ Notificação via WhatsApp

### Para Profissionais (Admin)
- ✅ Painel de controle completo
- ✅ Visualizar agenda do dia
- ✅ Gerenciar agendamentos (criar, editar, concluir, cancelar, deletar)
- ✅ Estatísticas detalhadas
- ✅ Gráficos de desempenho
- ✅ Lista de clientes
- ✅ Indicadores de retorno (manutenções)
- ✅ Atualizações em tempo real

---

## 🔐 Credenciais de Acesso

### Área Profissional
- **Email**: O que você criou no Supabase
- **Senha**: A que você definiu

> 💡 **Nota**: Não há mais senha hardcoded. O sistema usa autenticação real do Supabase.

---

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework frontend
- **React Router** - Navegação
- **Supabase** - Backend (Database + Auth + Real-time)
- **Vite** - Build tool
- **Lucide React** - Ícones
- **CSS3** - Estilização (tema dourado personalizado)

---

## 📊 Banco de Dados

### Tabelas Principais
- `profiles` - Usuários do sistema
- `services` - Serviços oferecidos
- `appointments` - Agendamentos

### Recursos
- ✅ Row Level Security (RLS)
- ✅ Real-time subscriptions
- ✅ Triggers automáticos
- ✅ Views para estatísticas
- ✅ Funções SQL customizadas

---

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint
```

---

## 📱 Contato

**WhatsApp**: +55 17 99979-1733 (Bia Souza Nails)
**Instagram**: @bia_souzanails_

---

## 📖 Documentação Completa

Para instruções detalhadas de configuração, solução de problemas e recursos avançados, consulte:

👉 **[README-SUPABASE.md](./README-SUPABASE.md)**

---

**Desenvolvido para Bia Souza Nails** 💅✨
