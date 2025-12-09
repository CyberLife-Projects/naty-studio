-- =============================================
-- SCHEMA SQL PARA SISTEMA DE AGENDAMENTO
-- =============================================
-- Este arquivo contém todo o schema necessário para o Supabase
-- Execute este SQL no SQL Editor do seu projeto Supabase

-- =============================================
-- TABELA: profiles
-- =============================================
-- Estende a tabela auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =============================================
-- TABELA: services
-- =============================================
-- Serviços oferecidos (manicure e nail art)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('manicure', 'nailart')),
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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas para PROFILES
CREATE POLICY "Profiles são públicos para leitura" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

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
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- DADOS INICIAIS: Serviços
-- =============================================
INSERT INTO public.services (name, category, price, duration, description, requires_maintenance, maintenance_interval_days, is_active) VALUES
  ('Manicure Completa', 'manicure', 50.00, 60, 'Manicure completa com esmaltagem tradicional', true, 15, true),
  ('Pedicure Completa', 'manicure', 60.00, 75, 'Pedicure completa com esmaltagem e hidratação', true, 20, true),
  ('Esmaltação em Gel', 'manicure', 70.00, 45, 'Esmaltagem com gel que dura até 3 semanas', true, 20, true),
  ('Manutenção de Gel', 'manicure', 50.00, 40, 'Remoção e reaplicação de esmalte em gel', false, null, true),
  ('Unhas Decoradas Simples', 'nailart', 80.00, 60, 'Nail art com desenhos simples e elegantes', false, null, true),
  ('Unhas Decoradas Premium', 'nailart', 120.00, 90, 'Nail art elaborada com pedrarias e designs exclusivos', false, null, true),
  ('Alongamento em Fibra', 'nailart', 150.00, 120, 'Alongamento de unhas com fibra de vidro', true, 21, true),
  ('Alongamento em Gel', 'nailart', 180.00, 150, 'Alongamento de unhas em gel com modelagem', true, 21, true),
  ('Manutenção de Alongamento', 'nailart', 100.00, 90, 'Manutenção e preenchimento de alongamento', false, null, true),
  ('Blindagem de Unhas', 'manicure', 90.00, 60, 'Tratamento de fortalecimento com blindagem', true, 15, true)
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
