# 🔐 Sistema de Autenticação Admin

## 📋 Visão Geral
Sistema de autenticação dedicado para administradores com tabela separada `user_admin` e informações hardcoded para acesso rápido da profissional Nathasha Silva.

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `user_admin`
Tabela exclusiva para administradores do sistema.

```sql
CREATE TABLE public.user_admin (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  cpf TEXT UNIQUE NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Dados Inseridos Automaticamente
```sql
INSERT INTO public.user_admin (email, password_hash, full_name, cpf, phone, is_active) VALUES
  ('nathashasilva02@icloud.com', '48880813870', 'Nathasha Silva', '488.808.138-70', '17981717922', true);
```

**⚠️ IMPORTANTE**: A senha atual é o CPF sem pontuação: `48880813870`

---

## 🔑 Credenciais de Acesso Admin

### Nathasha Silva
- **Email**: nathashasilva02@icloud.com
- **Senha**: 48880813870
- **CPF**: 488.808.138-70
- **Telefone**: 17981717922

---

## 🚀 Fluxo de Autenticação

### 1. Acesso à Tela de Login
```
Home (/) → Botão "Acesso Admin" (Crown icon) → /admin
```

### 2. Login Admin (`/admin`)
- Usuário digita email e senha
- Sistema busca na tabela `user_admin`
- Valida credenciais (email + senha)
- Verifica se `is_active = true`
- Salva dados no `localStorage` como `adminAuth`
- Redireciona para `/professional-area`

### 3. Área Profissional (`/professional-area`)
- **Sem tela de senha**: Acesso direto se autenticado
- Verifica `localStorage.getItem('adminAuth')` ao carregar
- Se não autenticado, redireciona para `/admin`
- **Informações hardcoded**: Dados da Nathasha já estão no código

```javascript
const adminData = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'nathashasilva02@icloud.com',
  full_name: 'Nathasha Silva',
  cpf: '488.808.138-70',
  phone: '17981717922'
}
```

---

## 📂 Arquivos Modificados

### 1. `supabase-schema.sql`
- ✅ Criada tabela `user_admin`
- ✅ Índices para `email` e `cpf`
- ✅ Políticas RLS para acesso admin
- ✅ Trigger `updated_at`
- ✅ Inserção automática de Nathasha Silva

### 2. `src/pages/AdminLogin.jsx` (NOVO)
Tela de login dedicada para admins:
- Formulário com email e senha
- Validação contra tabela `user_admin`
- Toggle para mostrar/ocultar senha
- Mensagens de erro
- Loading state
- Botão para voltar à home

### 3. `src/pages/AdminLogin.css` (NOVO)
Estilização completa da tela de login:
- Design consistente com o sistema
- Animações suaves
- Responsivo
- Background com efeitos visuais

### 4. `src/pages/ProfessionalArea.jsx`
Modificações:
- ❌ **Removida** tela de login com senha `naty123`
- ✅ **Adicionado** `adminData` hardcoded
- ✅ `isAuthenticated` sempre `true` internamente
- ✅ `useEffect` verifica `localStorage` ao carregar
- ✅ Redireciona para `/admin` se não autenticado
- ✅ `handleLogout` limpa `localStorage` e redireciona
- ✅ `loadSubscriptionData` usa dados hardcoded

### 5. `src/App.jsx`
- ✅ Importado `AdminLogin`
- ✅ Rota `/admin` aponta para `<AdminLogin />`
- ✅ Rota `/professional-area` mantida

---

## 🔒 Segurança

### ⚠️ Estado Atual (Desenvolvimento)
```javascript
// Comparação direta da senha
if (adminData.password_hash !== formData.password) {
  setError('Email ou senha incorretos')
}
```

### ✅ Recomendado para Produção
```javascript
// Usar bcrypt ou argon2
const bcrypt = require('bcrypt')
const isValid = await bcrypt.compare(formData.password, adminData.password_hash)
```

**TODO**: Implementar hash de senha com bcrypt antes de ir para produção!

---

## 🎯 Como Usar

### Para Acessar a Área Admin:
1. Clique no ícone de coroa (👑) no canto superior direito da home
2. Digite:
   - Email: `nathashasilva02@icloud.com`
   - Senha: `48880813870`
3. Clique em "Entrar no Sistema"
4. Você será redirecionado automaticamente para a área profissional

### Para Sair:
1. Clique no botão "Sair" no canto superior direito
2. Você será redirecionado para a tela de login admin

---

## 🔧 Manutenção

### Adicionar Novo Admin
```sql
INSERT INTO public.user_admin (email, password_hash, full_name, cpf, phone) 
VALUES (
  'novo@admin.com',
  'senha_temporaria', -- Trocar por hash em produção
  'Nome do Admin',
  '123.456.789-00',
  '17999999999'
);
```

### Desativar Admin
```sql
UPDATE public.user_admin 
SET is_active = false 
WHERE email = 'admin@desativar.com';
```

### Alterar Senha
```sql
UPDATE public.user_admin 
SET password_hash = 'nova_senha_hash' -- Usar bcrypt
WHERE email = 'nathashasilva02@icloud.com';
```

---

## 🛠️ SQL Completo

Execute este SQL no Supabase SQL Editor:
```bash
# Está em: supabase-schema.sql
# Já contém tudo configurado!
```

---

## 📱 Integração com Asaas

A função `loadSubscriptionData()` usa os dados hardcoded:
- Busca/cria cliente no Asaas com CPF da Nathasha
- Carrega assinaturas ativas
- Lista faturas pendentes
- Mostra histórico de pagamentos

Tudo vinculado ao CPF: **488.808.138-70**

---

## ✅ Checklist de Implementação

- [x] Tabela `user_admin` criada
- [x] Dados da Nathasha inseridos
- [x] Tela de login admin criada
- [x] Rota `/admin` configurada
- [x] ProfessionalArea usando dados hardcoded
- [x] Verificação de autenticação no useEffect
- [x] Logout limpando localStorage
- [x] Integração com modal de assinatura
- [ ] **TODO**: Implementar bcrypt para produção
- [ ] **TODO**: Sistema de recuperação de senha
- [ ] **TODO**: Log de acessos admin

---

## 🎨 Personalização

Para alterar os dados hardcoded da profissional, edite em:
```javascript
// src/pages/ProfessionalArea.jsx (linha ~11)
const adminData = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'nathashasilva02@icloud.com',
  full_name: 'Nathasha Silva',
  cpf: '488.808.138-70',
  phone: '17981717922'
}
```

---

## 📞 Suporte

Para questões sobre autenticação:
- Verifique `localStorage.adminAuth` no console
- Confirme que o SQL foi executado no Supabase
- Teste login com credenciais corretas
- Limpe cache se necessário

---

**Feito por CyberLife** 🚀
