# ✅ Checklist de Verificação - Sistema Naty Studio

Use este checklist para garantir que tudo está funcionando perfeitamente após a configuração.

---

## 🔧 Antes de Começar

### Arquivos de Configuração
- [ ] Arquivo `.env` criado (baseado em `.env.example`)
- [ ] `VITE_SUPABASE_URL` preenchida
- [ ] `VITE_SUPABASE_ANON_KEY` preenchida
- [ ] Dependências instaladas (`npm install`)

### Supabase
- [ ] Projeto criado no Supabase
- [ ] Schema SQL executado (`supabase-schema.sql`)
- [ ] Usuário admin criado
- [ ] Role 'admin' atribuído ao usuário

---

## 🧪 Testes Funcionais

### 1. Área Inicial (Home)
- [ ] Página inicial carrega sem erros
- [ ] Título "Naty Studio" visível
- [ ] Botões "Agendar Horário" e "Área Profissional" funcionam
- [ ] Tema dourado aplicado corretamente

### 2. Área do Cliente

#### Navegação
- [ ] Página carrega sem erros
- [ ] Console do navegador sem erros (F12)

#### Seleção de Serviços
- [ ] 7 serviços aparecem na lista
- [ ] Serviços organizados por categoria (cílios/sobrancelhas)
- [ ] Preços formatados corretamente (R$ X,XX)
- [ ] Duração exibida corretamente

#### Seleção de Data
- [ ] Carrossel de datas funciona
- [ ] Domingos não aparecem
- [ ] Botões de navegação (anterior/próximo) funcionam
- [ ] Próximos 60 dias disponíveis

#### Seleção de Horário
- [ ] Horários disponíveis aparecem
- [ ] Horários ocupados não aparecem
- [ ] Período de 09:00 às 18:00

#### Dados do Cliente
- [ ] Formulário de dados aparece
- [ ] Campos obrigatórios marcados
- [ ] Validação de telefone funciona
- [ ] Opção de agendamentos recorrentes visível

#### Agendamentos Recorrentes
- [ ] Checkbox "Agendar manutenções automáticas" funciona
- [ ] Opções de intervalo (15/30 dias) aparecem
- [ ] Opções de duração (1-6 meses) aparecem
- [ ] Calcula corretamente o número de retornos

#### Finalização
- [ ] Botão "Confirmar Agendamento" funciona
- [ ] Mensagem de sucesso aparece
- [ ] Notificação WhatsApp abre corretamente
- [ ] Redireciona para home

### 3. Área Profissional

#### Login
- [ ] Página de login carrega
- [ ] Campos de email e senha funcionam
- [ ] Login com credenciais corretas funciona
- [ ] Login com credenciais incorretas mostra erro
- [ ] Não-admins são bloqueados
- [ ] Botão "Voltar" funciona

#### Dashboard
- [ ] Painel carrega após login
- [ ] Header com "Painel Profissional" visível
- [ ] Botão de logout no canto superior direito
- [ ] Tema dourado mantido

#### Estatísticas
- [ ] Cards de estatísticas exibidos:
  - Total de agendamentos
  - Agendamentos confirmados
  - Agendamentos concluídos
  - Agendamentos hoje
  - Manutenções pendentes
  - Manutenções concluídas
  - Taxa de retorno
- [ ] Números corretos (conferir com banco)

#### Gráficos
- [ ] Gráfico de linha (Total de Agendamentos) aparece
- [ ] Gráfico de pizza (Serviços) aparece
- [ ] Selector de período funciona (7dias/1mês/3meses/6meses)
- [ ] Dados mudam ao trocar período
- [ ] Cores douradas nos gráficos

#### Agenda
- [ ] Carrossel de datas funciona
- [ ] Data de hoje selecionada por padrão
- [ ] Agendamentos do dia aparecem
- [ ] Indicador de manutenção (🔄) em retornos
- [ ] Cards em verde para manutenções

#### Ações de Agendamento
- [ ] Botão "Concluir" funciona
- [ ] Botão "Editar" abre modal
- [ ] Botão "Cancelar" abre modal de confirmação
- [ ] Botão "Deletar" abre modal de confirmação
- [ ] Status muda após ação
- [ ] Confirmação de sucesso aparece

#### Modal de Edição
- [ ] Campos preenchidos com dados atuais
- [ ] Todos os campos editáveis
- [ ] Validação funciona
- [ ] Salvar atualiza o agendamento
- [ ] Cancelar fecha sem alterar
- [ ] Verificação de conflito de horário

#### Modal de Adicionar
- [ ] Botão flutuante "+" no canto inferior
- [ ] Modal abre corretamente
- [ ] Formulário completo
- [ ] Opção de agendamentos recorrentes
- [ ] Criação funciona
- [ ] Modal de sucesso com contador

#### Lista de Clientes
- [ ] Aba "Clientes" funciona
- [ ] Lista de clientes únicos aparece
- [ ] Busca por nome/telefone funciona
- [ ] Telefones formatados
- [ ] Contador de agendamentos correto
- [ ] Histórico de cada cliente completo
- [ ] Botão WhatsApp funciona

### 4. Real-time

#### Teste Multi-Janela
- [ ] Abrir painel admin em aba 1
- [ ] Abrir área cliente em aba 2
- [ ] Criar agendamento na aba 2
- [ ] Agendamento aparece automaticamente na aba 1
- [ ] Sem necessidade de refresh

#### Teste Multi-Usuário
- [ ] Login em 2 navegadores diferentes
- [ ] Ação em navegador 1 reflete em navegador 2
- [ ] Sincronização instantânea

### 5. Responsividade

- [ ] Layout funciona em desktop (1920px)
- [ ] Layout funciona em tablet (768px)
- [ ] Layout funciona em mobile (375px)
- [ ] Botões clicáveis em touch screens
- [ ] Texto legível em todas as resoluções

---

## 🔍 Verificações Técnicas

### Console do Navegador (F12)
- [ ] Sem erros em vermelho
- [ ] Warnings esperados apenas (opcional)
- [ ] Network requests retornando 200
- [ ] Supabase client inicializando corretamente

### Network Tab
- [ ] Requests para Supabase funcionando
- [ ] Status 200 nas requisições
- [ ] Dados sendo retornados corretamente
- [ ] Real-time WebSocket conectado

### Application Tab
- [ ] Cookies do Supabase presentes
- [ ] Session storage com dados de auth
- [ ] Sem dados no localStorage (migração completa)

### Supabase Dashboard

#### Authentication
- [ ] Usuários criados aparecem
- [ ] Role 'admin' correto

#### Database
- [ ] Tabela `profiles` populada
- [ ] Tabela `services` com 7 registros
- [ ] Tabela `appointments` recebendo dados
- [ ] RLS políticas ativas

#### Realtime
- [ ] Canal de appointments ativo
- [ ] Mensagens sendo enviadas
- [ ] Logs de eventos

---

## 🐛 Problemas Comuns

### Erro: "Invalid API key"
- **Causa**: Credenciais incorretas no `.env`
- **Solução**: Verificar e corrigir `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### Erro: "relation does not exist"
- **Causa**: Schema SQL não executado
- **Solução**: Executar `supabase-schema.sql` no SQL Editor

### Login não funciona
- **Causa**: Usuário sem role 'admin'
- **Solução**: Executar `UPDATE profiles SET role = 'admin' WHERE email = '...'`

### Serviços não aparecem
- **Causa**: INSERT dos serviços não executado
- **Solução**: Verificar se o schema completo foi executado

### Real-time não funciona
- **Causa**: Problemas de rede ou configuração
- **Solução**: Verificar console, tentar reconnect, checar firewall

---

## ✅ Lista de Verificação Final

Antes de considerar o sistema pronto para produção:

### Funcional
- [ ] Todos os testes acima passaram
- [ ] Sem erros no console
- [ ] Sem warnings críticos
- [ ] Performance aceitável

### Segurança
- [ ] Arquivo `.env` no `.gitignore`
- [ ] Credenciais não expostas no código
- [ ] RLS ativo e testado
- [ ] Apenas chave pública em uso

### Documentação
- [ ] README-SUPABASE.md lido
- [ ] QUICK-START.md seguido
- [ ] Backup do `.env` feito
- [ ] Equipe treinada

### Dados
- [ ] Serviços corretos cadastrados
- [ ] Admin principal criado
- [ ] Agendamentos de teste removidos
- [ ] Banco limpo para produção

---

## 🎉 Sistema Verificado!

Se todos os itens acima estão marcados, seu sistema está:

- ✅ **Funcional** - Todas as features operando
- ✅ **Seguro** - RLS e auth configurados
- ✅ **Rápido** - Real-time ativo
- ✅ **Pronto** - Pode ir para produção

**Parabéns! O sistema Naty Studio está pronto para uso!** 🚀

---

**Suporte**: Consulte `README-SUPABASE.md` para troubleshooting detalhado
