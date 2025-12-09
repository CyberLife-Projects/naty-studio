# Sistema de Agendamento de Unhas 💅✨

Sistema completo de agendamento para studio de unhas com interface feminina e elegante, otimizado para mobile.

## 🌸 Características

### Área do Cliente
- ✨ Visualização de serviços disponíveis (Manicure, Pedicure, Nail Art, Alongamento)
- 📅 Calendário interativo para escolha de data
- ⏰ Seleção de horários disponíveis
- 📝 Formulário de agendamento intuitivo
- 💖 Design responsivo e otimizado para mobile

### Área Profissional
- 👑 Painel administrativo protegido por senha
- 📊 Dashboard com estatísticas em tempo real
- 📅 Visualização de agenda semanal
- 📋 Lista detalhada de agendamentos
- ✅ Gerenciamento de status (confirmado/concluído)
- 💰 Cálculo automático de receita
- 📈 Relatórios e análises

## 🎨 Design

- **Paleta de Cores:** Rosa suave, dourado e branco
- **Fontes:** Playfair Display (títulos) e Poppins (texto)
- **Mobile-First:** Layout otimizado para dispositivos móveis
- **Animações:** Transições suaves e elegantes

## 🚀 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Acesse no navegador:
```
http://localhost:3000
```

## 🔐 Acesso à Área Profissional

**Senha padrão:** `admin123`

## 📱 Funcionalidades

### Cliente
1. Acesse a área do cliente
2. Escolha o serviço desejado
3. Selecione data e horário disponível
4. Preencha seus dados
5. Confirme o agendamento

### Profissional
1. Faça login com a senha
2. Visualize a agenda do dia
3. Gerencie agendamentos
4. Acompanhe estatísticas
5. Marque serviços como concluídos

## 💾 Persistência de Dados

Os agendamentos são salvos no **localStorage** do navegador, mantendo os dados mesmo após fechar a aplicação.

## 🛠️ Tecnologias

- **React 18** - Framework JavaScript
- **React Router** - Navegação entre páginas
- **Vite** - Build tool moderna e rápida
- **CSS3** - Estilização avançada
- **Context API** - Gerenciamento de estado

## 📦 Estrutura do Projeto

```
src/
├── context/
│   └── AppContext.jsx      # Gerenciamento de estado global
├── pages/
│   ├── Home.jsx            # Página inicial
│   ├── Home.css
│   ├── ClientArea.jsx      # Área do cliente
│   ├── ClientArea.css
│   ├── ProfessionalArea.jsx # Área profissional
│   └── ProfessionalArea.css
├── App.jsx                 # Componente principal
├── main.jsx               # Entry point
└── index.css              # Estilos globais
```

## 🎯 Próximas Melhorias

- [ ] Integração com WhatsApp API
- [ ] Notificações por email
- [ ] Sistema de login completo
- [ ] Backup de dados em nuvem
- [ ] Relatórios em PDF
- [ ] Sistema de avaliações

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e pode ser usado livremente.

---

**Desenvolvido com 💖 para profissionais de beleza**
