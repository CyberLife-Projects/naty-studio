# 🚀 Guia de Configuração do Supabase - Naty Studio

Este guia fornece instruções passo a passo para configurar o backend do sistema de agendamento usando Supabase.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com) (gratuita)
- Node.js instalado (versão 16 ou superior)
- Git (opcional, para controle de versão)

## 🔧 Passo 1: Criar Projeto no Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Name**: Naty Studio (ou nome de sua preferência)
   - **Database Password**: Crie uma senha segura (guarde-a!)
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
4. Clique em **"Create new project"**
5. Aguarde alguns minutos enquanto o Supabase provisiona seu projeto

## 📊 Passo 2: Executar o Schema SQL

1. No painel do Supabase, vá em **SQL Editor** (ícone de banco de dados na barra lateral)
2. Clique em **"New Query"**
3. Copie todo o conteúdo do arquivo `supabase-schema.sql` (na raiz do projeto)
4. Cole no editor SQL
5. Clique em **"Run"** ou pressione `Ctrl + Enter`
6. Aguarde a execução completar (você verá "Success" quando terminar)

> ⚠️ **Importante**: Execute o schema apenas uma vez. Executar novamente pode causar erros de duplicação.

## 🔑 Passo 3: Configurar Variáveis de Ambiente

1. No painel do Supabase, vá em **Settings** (ícone de engrenagem)
2. Clique em **API** na barra lateral
3. Localize as seguintes informações:
   - **Project URL** (em "Project URL")
   - **anon public** key (em "Project API keys")

4. Na raiz do projeto, crie um arquivo chamado `.env`:
   ```bash
   # Windows (CMD)
   copy .env.example .env
   
   # Windows (PowerShell)
   Copy-Item .env.example .env
   
   # Linux/Mac
   cp .env.example .env
   ```

5. Abra o arquivo `.env` e preencha com suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica-aqui
   ```

> 🔒 **Segurança**: Nunca compartilhe o arquivo `.env` ou faça commit dele no Git. Use apenas a chave `anon public`, NUNCA a `service_role`.

## 👤 Passo 4: Criar Usuário Admin

### Opção 1: Via Interface do Supabase (Recomendado)

1. No painel do Supabase, vá em **Authentication** > **Users**
2. Clique em **"Add user"** > **"Create new user"**
3. Preencha:
   - **Email**: seu-email@exemplo.com
   - **Password**: crie uma senha segura
   - **Confirm password**: repita a senha
4. Clique em **"Create user"**

5. Agora, defina este usuário como admin:
   - Vá em **SQL Editor**
   - Execute o seguinte SQL (substitua o email):
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'seu-email@exemplo.com';
   ```

### Opção 2: Via SQL Direto

Execute este SQL no SQL Editor (substitua as informações):

```sql
-- Inserir usuário admin diretamente
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@natystudio.com',
  crypt('suaSenhaSegura123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Administrador","role":"admin"}',
  NOW(),
  NOW()
);
```

## 📦 Passo 5: Instalar Dependências e Executar

1. Instale as dependências do projeto:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra o navegador em `http://localhost:5173`

4. Acesse a **Área Profissional** e faça login com o email e senha do admin criado

## ✅ Verificação da Instalação

### Teste 1: Login Admin
1. Vá para a página de Área Profissional
2. Faça login com as credenciais criadas
3. Você deve ver o painel administrativo

### Teste 2: Listar Serviços
1. Na área do cliente, clique em "Agendar Horário"
2. Você deve ver os 7 serviços carregados do banco de dados:
   - Volume Brasileiro Aplicação
   - Volume Brasileiro Manutenção
   - Volume Egípcio Aplicação
   - Volume Egípcio Manutenção
   - Design de Sobrancelhas c/ Henna
   - Design de Sobrancelhas
   - Retoque de Henna

### Teste 3: Criar Agendamento
1. Selecione um serviço
2. Escolha data e horário
3. Preencha os dados do cliente
4. Confirme o agendamento
5. Verifique se aparece no painel administrativo

### Teste 4: Real-time
1. Abra o painel administrativo em uma aba
2. Abra a área de cliente em outra aba
3. Crie um agendamento na área de cliente
4. O agendamento deve aparecer automaticamente no painel admin (sem refresh)

## 🎨 Estrutura do Banco de Dados

### Tabelas Criadas

1. **profiles** - Perfis de usuários
   - id (UUID, FK para auth.users)
   - email (TEXT)
   - full_name (TEXT)
   - phone (TEXT)
   - role (TEXT: 'admin' ou 'client')

2. **services** - Serviços oferecidos
   - id (UUID)
   - name (TEXT)
   - category (TEXT: 'cilios' ou 'sobrancelhas')
   - price (DECIMAL)
   - duration (INTEGER, em minutos)
   - requires_maintenance (BOOLEAN)
   - maintenance_interval_days (INTEGER)

3. **appointments** - Agendamentos
   - id (UUID)
   - service_id (UUID, FK)
   - client_name (TEXT)
   - client_phone (TEXT)
   - client_email (TEXT)
   - appointment_date (DATE)
   - appointment_time (TIME)
   - status (TEXT: 'agendado', 'concluido', 'cancelado')
   - is_maintenance (BOOLEAN)
   - parent_appointment_id (UUID, FK, nullable)

### Políticas de Segurança (RLS)

- **Serviços**: Leitura pública, modificação apenas para admins
- **Agendamentos**: Criação pública, leitura pública, modificação/exclusão apenas para admins
- **Perfis**: Leitura pública, cada usuário pode atualizar apenas seu próprio perfil

## 🔄 Funcionalidades Real-time

O sistema possui subscrições real-time para:

- ✅ Novos agendamentos
- ✅ Atualizações de agendamentos
- ✅ Cancelamentos
- ✅ Exclusões

Isso garante que todos os usuários vejam as mudanças instantaneamente.

## 🛠️ Comandos Úteis

### Limpar todos os agendamentos
```sql
DELETE FROM public.appointments;
```

### Ver todos os usuários admin
```sql
SELECT * FROM public.profiles WHERE role = 'admin';
```

### Resetar senha de um usuário
```sql
UPDATE auth.users 
SET encrypted_password = crypt('novaSenha123', gen_salt('bf'))
WHERE email = 'usuario@exemplo.com';
```

### Verificar agendamentos de hoje
```sql
SELECT 
  a.*,
  s.name as service_name
FROM public.appointments a
INNER JOIN public.services s ON a.service_id = s.id
WHERE a.appointment_date = CURRENT_DATE
ORDER BY a.appointment_time;
```

## 🐛 Solução de Problemas

### Erro: "Invalid API key"
- Verifique se as variáveis no arquivo `.env` estão corretas
- Certifique-se de que copiou a chave `anon public` (não a `service_role`)
- Reinicie o servidor de desenvolvimento após editar o `.env`

### Erro: "relation does not exist"
- Execute o schema SQL novamente no SQL Editor
- Verifique se não há erros na execução do schema

### Login não funciona
- Verifique se o usuário foi criado corretamente
- Confirme se o role foi definido como 'admin'
- Teste com outro navegador ou janela anônima

### Serviços não aparecem
- Verifique se o schema SQL foi executado completamente
- Execute no SQL Editor: `SELECT * FROM public.services;`
- Se vazio, o INSERT dos serviços não foi executado

### Real-time não funciona
- Verifique se a subscrição está ativa no console do navegador
- Teste abrindo duas abas e criando um agendamento
- Verifique se não há erros de conexão no console

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Authentication](https://supabase.com/docs/guides/auth)
- [Guia de Realtime](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🚀 Próximos Passos

Após configurar o Supabase com sucesso:

1. ✅ Faça backup do arquivo `.env` em local seguro
2. ✅ Teste todos os recursos (criar, editar, deletar agendamentos)
3. ✅ Configure notificações por email (opcional)
4. ✅ Personalize os serviços conforme sua necessidade
5. ✅ Prepare para deploy em produção

## 💡 Dicas de Produção

Quando for colocar em produção:

1. **Domain personalizado**: Configure um domínio personalizado nas settings do Supabase
2. **Email templates**: Personalize os templates de email em Authentication > Email Templates
3. **Backups**: Configure backups automáticos (Settings > Database > Backups)
4. **Monitoring**: Ative alertas de uso (Settings > Usage)
5. **Rate limiting**: Configure limites de requisição para evitar abuso

---

**Desenvolvido para Naty Studio** 💅✨
