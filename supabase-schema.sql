-- =============================================
-- SCHEMA SQL PARA SISTEMA DE AGENDAMENTO
-- =============================================
-- Este arquivo contém todo o schema necessário para o Supabase
-- Execute este SQL no SQL Editor do seu projeto Supabase

-- =============================================
-- TABELA: user_admin
-- =============================================
-- Tabela separada para administradores com autenticação própria
CREATE TABLE IF NOT EXISTS public.user_admin (
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

-- =============================================
-- TABELA: profiles
-- =============================================
-- Estende a tabela auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  cpf_cnpj TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- TABELA: subscriptions
-- =============================================
-- Assinaturas dos profissionais (sistema terceirizado)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asaas_customer_id TEXT,
  asaas_subscription_id TEXT,
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'suspended', 'cancelled')),
  plan_value DECIMAL(10,2) DEFAULT 34.90,
  next_due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- ÍNDICES para subscriptions
-- =============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_asaas_customer ON public.subscriptions(asaas_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- =============================================
-- TABELA: services
-- =============================================
-- Serviços oferecidos (cílios e sobrancelhas)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('cilios', 'sobrancelhas')),
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- duração em minutos
  description TEXT,
  requires_maintenance BOOLEAN DEFAULT false,
  maintenance_interval_days INTEGER, -- 15 ou 30 dias
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- TABELA: appointments
-- =============================================
-- Agendamentos de clientes
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'concluido', 'cancelado')),
  is_maintenance BOOLEAN DEFAULT false,
  parent_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_admin_email ON public.user_admin(email);
CREATE INDEX IF NOT EXISTS idx_user_admin_cpf ON public.user_admin(cpf);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_client_phone ON public.appointments(client_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_parent ON public.appointments(parent_appointment_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Habilitar RLS nas tabelas
ALTER TABLE public.user_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admins podem ler user_admin" ON public.user_admin;
DROP POLICY IF EXISTS "Admins podem inserir user_admin" ON public.user_admin;
DROP POLICY IF EXISTS "Admins podem atualizar user_admin" ON public.user_admin;
DROP POLICY IF EXISTS "Profiles são públicos para leitura" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem ver sua própria assinatura" ON public.subscriptions;
DROP POLICY IF EXISTS "Usuários podem inserir sua própria assinatura" ON public.subscriptions;
DROP POLICY IF EXISTS "Usuários podem atualizar sua própria assinatura" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins podem ver todas as assinaturas" ON public.subscriptions;
DROP POLICY IF EXISTS "Serviços ativos são públicos para leitura" ON public.services;
DROP POLICY IF EXISTS "Apenas admins podem modificar serviços" ON public.services;
DROP POLICY IF EXISTS "Clientes podem criar agendamentos" ON public.appointments;
DROP POLICY IF EXISTS "Todos podem ver agendamentos (para verificar horários)" ON public.appointments;
DROP POLICY IF EXISTS "Admins podem atualizar qualquer agendamento" ON public.appointments;
DROP POLICY IF EXISTS "Admins podem deletar agendamentos" ON public.appointments;

-- Políticas para USER_ADMIN
CREATE POLICY "Admins podem ler user_admin" 
  ON public.user_admin FOR SELECT 
  USING (true);

CREATE POLICY "Admins podem inserir user_admin" 
  ON public.user_admin FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins podem atualizar user_admin" 
  ON public.user_admin FOR UPDATE 
  USING (true);

-- Políticas para PROFILES
CREATE POLICY "Profiles são públicos para leitura" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Políticas para SUBSCRIPTIONS
CREATE POLICY "Usuários podem ver sua própria assinatura" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir sua própria assinatura" 
  ON public.subscriptions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar sua própria assinatura" 
  ON public.subscriptions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todas as assinaturas" 
  ON public.subscriptions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para SERVICES
CREATE POLICY "Serviços ativos são públicos para leitura" 
  ON public.services FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Apenas admins podem modificar serviços" 
  ON public.services FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para APPOINTMENTS
CREATE POLICY "Clientes podem criar agendamentos" 
  ON public.appointments FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Todos podem ver agendamentos (para verificar horários)" 
  ON public.appointments FOR SELECT 
  USING (true);

CREATE POLICY "Admins podem atualizar qualquer agendamento" 
  ON public.appointments FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins podem deletar agendamentos" 
  ON public.appointments FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- FUNCTION: Atualizar updated_at automaticamente
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS: updated_at
-- =============================================
DROP TRIGGER IF EXISTS update_user_admin_updated_at ON public.user_admin;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;

CREATE TRIGGER update_user_admin_updated_at BEFORE UPDATE ON public.user_admin
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTION: Criar perfil automaticamente
-- =============================================
-- Trigger para criar um perfil quando um novo usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- DADOS INICIAIS: Admin User
-- =============================================
-- Inserir admin Nathasha Silva
-- Senha: A senha será o CPF sem pontuação (48880813870)
-- IMPORTANTE: Em produção, use bcrypt ou argon2 para hash de senha
INSERT INTO public.user_admin (email, password_hash, full_name, cpf, phone, is_active) VALUES
  ('nathashasilva02@icloud.com', '48880813870', 'Nathasha Silva', '488.808.138-70', '17981717922', true)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- DADOS INICIAIS: Serviços
-- =============================================
INSERT INTO public.services (name, category, price, duration, description, requires_maintenance, maintenance_interval_days, is_active) VALUES
  ('Volume Brasileiro Aplicação', 'cilios', 150.00, 120, 'Aplicação completa de cílios fio a fio estilo brasileiro', true, 15, true),
  ('Volume Brasileiro Manutenção', 'cilios', 80.00, 90, 'Manutenção de cílios fio a fio estilo brasileiro', false, null, true),
  ('Volume Egípcio Aplicação', 'cilios', 200.00, 150, 'Aplicação completa de cílios fio a fio estilo egípcio', true, 15, true),
  ('Volume Egípcio Manutenção', 'cilios', 100.00, 90, 'Manutenção de cílios fio a fio estilo egípcio', false, null, true),
  ('Design de Sobrancelhas c/ Henna', 'sobrancelhas', 50.00, 45, 'Design e coloração de sobrancelhas com henna', true, 30, true),
  ('Design de Sobrancelhas', 'sobrancelhas', 35.00, 30, 'Design de sobrancelhas sem coloração', false, null, true),
  ('Retoque de Henna', 'sobrancelhas', 30.00, 20, 'Retoque de henna em sobrancelhas', false, null, true)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- DADOS INICIAIS: Admin User
-- =============================================
-- IMPORTANTE: Após executar este schema, crie o primeiro admin através do Supabase Auth
-- Ou execute este SQL após criar o usuário admin na interface do Supabase:
-- 
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'seu-email-admin@exemplo.com';

-- =============================================
-- VIEWS ÚTEIS
-- =============================================

-- View: Estatísticas de agendamentos
CREATE OR REPLACE VIEW public.appointment_stats AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'agendado') as total_agendados,
  COUNT(*) FILTER (WHERE status = 'concluido') as total_concluidos,
  COUNT(*) FILTER (WHERE status = 'cancelado') as total_cancelados,
  COUNT(*) FILTER (WHERE is_maintenance = true) as total_manutencoes,
  COUNT(DISTINCT client_phone) as total_clientes_unicos,
  DATE_TRUNC('month', appointment_date) as mes
FROM public.appointments
GROUP BY DATE_TRUNC('month', appointment_date);

-- View: Próximas manutenções
CREATE OR REPLACE VIEW public.upcoming_maintenances AS
SELECT 
  a.id as appointment_id,
  a.client_name,
  a.client_phone,
  a.appointment_date as last_service_date,
  s.name as service_name,
  s.maintenance_interval_days,
  (a.appointment_date + INTERVAL '1 day' * s.maintenance_interval_days) as next_maintenance_date
FROM public.appointments a
INNER JOIN public.services s ON a.service_id = s.id
WHERE 
  a.status = 'concluido' 
  AND s.requires_maintenance = true
  AND NOT EXISTS (
    SELECT 1 FROM public.appointments m 
    WHERE m.parent_appointment_id = a.id 
    AND m.is_maintenance = true
  );

-- =============================================
-- FUNÇÃO: Verificar conflitos de horário
-- =============================================
CREATE OR REPLACE FUNCTION check_appointment_conflict(
  p_appointment_date DATE,
  p_appointment_time TIME,
  p_duration_minutes INTEGER,
  p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM public.appointments a
  INNER JOIN public.services s ON a.service_id = s.id
  WHERE 
    a.appointment_date = p_appointment_date
    AND a.status = 'agendado'
    AND (p_exclude_appointment_id IS NULL OR a.id != p_exclude_appointment_id)
    AND (
      -- Novo horário começa durante um agendamento existente
      (p_appointment_time >= a.appointment_time 
       AND p_appointment_time < (a.appointment_time + (s.duration || ' minutes')::INTERVAL))
      OR
      -- Novo horário termina durante um agendamento existente
      ((p_appointment_time + (p_duration_minutes || ' minutes')::INTERVAL) > a.appointment_time
       AND (p_appointment_time + (p_duration_minutes || ' minutes')::INTERVAL) <= (a.appointment_time + (s.duration || ' minutes')::INTERVAL))
      OR
      -- Novo horário engloba um agendamento existente
      (p_appointment_time <= a.appointment_time
       AND (p_appointment_time + (p_duration_minutes || ' minutes')::INTERVAL) >= (a.appointment_time + (s.duration || ' minutes')::INTERVAL))
    );
  
  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FIM DO SCHEMA
-- =============================================
-- Próximos passos após executar este SQL:
-- 1. Criar usuário admin no Supabase Auth
-- 2. Atualizar o role do admin: UPDATE profiles SET role = 'admin' WHERE email = 'seu-email'
-- 3. Copiar URL e ANON KEY do projeto para o .env
-- 4. Testar a aplicação
