# 🚀 WhatsApp Offers Bot

Sistema completo de automação de envio de ofertas via WhatsApp. Plataforma self-hosted, totalmente containerizada e pronta para deploy em Coolify.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-22+-brightgreen)
![Docker](https://img.shields.io/badge/docker-20.10+-blue)

---

## ✨ Funcionalidades

### 🔐 Autenticação & Segurança
- Autenticação com Manus OAuth
- Controle de acesso baseado em roles
- Sessões seguras com JWT
- Criptografia de dados sensíveis

### 📱 Gerenciamento de WhatsApp
- Múltiplas sessões WhatsApp simultâneas
- Conexão via QR Code
- Status em tempo real
- Desconexão segura

### 👥 Gerenciamento de Grupos
- Cadastro manual de grupos
- Teste de envio de mensagens
- Filtro por sessão
- Ativação/desativação de grupos

### 📦 Gerenciamento de Produtos
- Cadastro de ofertas com imagem, título, descrição
- Links de produtos
- Preços customizáveis
- Emojis personalizados
- Preview de mensagens

### 📅 Agendamento de Ofertas
- Agendar envios para data/hora específica
- Enviar para um ou múltiplos grupos
- Fila de processamento com Redis
- Retry automático em caso de falha

### 📊 Dashboard & Estatísticas
- Visão geral de grupos, produtos e ofertas
- Métricas de envio (sucesso, falha)
- Histórico de mensagens
- Taxa de sucesso em tempo real

### 🔄 Sistema de Fila
- Processamento assíncrono com Redis
- Rate limiting (máx 20 msg/min)
- Delay entre mensagens (3 segundos)
- Retry automático (até 3 tentativas)

### 📈 Agendamento Automático
- Cron jobs para verificar ofertas agendadas
- Processamento automático de envios
- Logs detalhados de execução

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  Dashboard | Sessões | Grupos | Produtos | Ofertas | Histórico
└────────────────────────┬────────────────────────────────────┘
                         │
                    tRPC API
                         │
┌────────────────────────▼────────────────────────────────────┐
│                 Backend (Node.js/Express)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Routers     │  │  Services    │  │  Workers     │      │
│  │  - WhatsApp  │  │  - WAHA      │  │  - Message   │      │
│  │  - Groups    │  │  - Queue     │  │  - Scheduler │      │
│  │  - Products  │  │  - Scheduler │  │              │      │
│  │  - Offers    │  │              │  │              │      │
│  │  - Dashboard │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
         │               │               │
    ┌────▼────┐  ┌───────▼────┐  ┌──────▼──────┐
    │PostgreSQL│  │   Redis    │  │    WAHA     │
    │ Database │  │   Queue    │  │  WhatsApp   │
    └──────────┘  └────────────┘  └─────────────┘
```

---

## 🛠️ Stack Tecnológico

| Componente | Tecnologia |
|-----------|-----------|
| **Frontend** | React 19 + Tailwind CSS 4 + shadcn/ui |
| **Backend** | Node.js 22 + Express 4 + tRPC 11 |
| **Database** | PostgreSQL 16 + Drizzle ORM |
| **Cache/Queue** | Redis 7 |
| **WhatsApp API** | WAHA (WhatsApp HTTP API) |
| **Containerização** | Docker + Docker Compose |
| **Autenticação** | Manus OAuth |

---

## 📋 Pré-requisitos

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git**
- **4GB RAM** mínimo
- **Conexão com internet**

---

## 🚀 Início Rápido

### 1. Clonar repositório

```bash
git clone https://github.com/seu-usuario/whatsapp-offers-bot.git
cd whatsapp-offers-bot
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.production .env
nano .env  # Edite com suas configurações
```

### 3. Iniciar com Docker Compose

```bash
docker-compose up -d
```

### 4. Acessar aplicação

```
http://localhost:3000
```

---

## 📖 Documentação

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guia completo de instalação e deploy
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Documentação da arquitetura
- **[API.md](./API.md)** - Documentação da API tRPC

---

## 🔧 Desenvolvimento Local

### Instalar dependências

```bash
pnpm install
```

### Iniciar em desenvolvimento

```bash
pnpm dev
```

### Executar testes

```bash
pnpm test
```

### Build para produção

```bash
pnpm build
```

---

## 📁 Estrutura do Projeto

```
whatsapp-offers-bot/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários e hooks
│   │   └── App.tsx        # Componente raiz
│   └── index.html
├── server/                 # Backend Node.js
│   ├── routers/           # Routers tRPC
│   ├── services/          # Serviços (WAHA, Queue, Scheduler)
│   ├── workers/           # Workers (Message)
│   ├── db.ts              # Helpers de banco de dados
│   └── _core/             # Configuração core
├── drizzle/               # Schema e migrations
├── shared/                # Tipos compartilhados
├── Dockerfile             # Build da aplicação
├── docker-compose.yml     # Orquestração de serviços
├── package.json           # Dependências
└── README.md              # Este arquivo
```

---

## 🔐 Variáveis de Ambiente

Veja `.env.production` para lista completa de variáveis necessárias.

**Essenciais:**
- `DATABASE_URL` - Conexão PostgreSQL
- `REDIS_URL` - Conexão Redis
- `WAHA_API_URL` - URL da API WAHA
- `WAHA_API_KEY` - Chave de autenticação WAHA
- `JWT_SECRET` - Chave secreta JWT

---

## 🐳 Docker

### Build da imagem

```bash
docker build -t whatsapp-offers-bot:latest .
```

### Executar container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://user:pass@host:5432/db \
  -e REDIS_URL=redis://redis:6379 \
  whatsapp-offers-bot:latest
```

### Docker Compose

```bash
# Iniciar
docker-compose up -d

# Parar
docker-compose down

# Ver logs
docker-compose logs -f app

# Reiniciar
docker-compose restart
```

---

## 📊 Monitoramento

### Verificar status

```bash
docker-compose ps
```

### Ver logs

```bash
docker-compose logs -f
```

### Monitorar recursos

```bash
docker stats
```

---

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Modo watch
pnpm test --watch

# Com coverage
pnpm test --coverage
```

---

## 📝 Fluxo de Uso

### 1. Autenticação
- Faça login com Manus OAuth
- Acesse o dashboard

### 2. Conectar WhatsApp
- Vá para "Sessões WhatsApp"
- Crie nova sessão
- Escaneie QR Code com seu WhatsApp

### 3. Cadastrar Grupos
- Vá para "Gerenciar Grupos"
- Adicione grupos para envio
- Teste envio de mensagem

### 4. Cadastrar Produtos
- Vá para "Produtos"
- Crie ofertas com imagem, título, descrição
- Defina preço e link

### 5. Agendar Ofertas
- Vá para "Agendamentos"
- Crie novo agendamento
- Selecione produto, data/hora e grupos
- Confirme agendamento

### 6. Monitorar Envios
- Vá para "Histórico"
- Acompanhe status de envios
- Veja estatísticas no dashboard

---

## 🐛 Troubleshooting

### Erro: "Database connection refused"
```bash
docker-compose restart postgres
docker-compose logs postgres
```

### Erro: "Redis connection refused"
```bash
docker-compose restart redis
docker-compose logs redis
```

### Erro: "WAHA not responding"
```bash
docker-compose restart waha
docker-compose logs waha
```

Veja [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) para mais soluções.

---

## 🚀 Deploy

### Local
```bash
pnpm dev
```

### Docker
```bash
docker-compose up -d
```

### Coolify
1. Crie novo projeto em Coolify
2. Selecione "Docker Compose"
3. Cole conteúdo de `docker-compose.yml`
4. Configure variáveis de ambiente
5. Clique em "Deploy"

Veja [DEPLOYMENT.md](./DEPLOYMENT.md) para instruções detalhadas.

---

## 📈 Performance

- **Processamento de fila**: Assíncrono com Redis
- **Rate limiting**: 20 mensagens/minuto
- **Delay entre mensagens**: 3 segundos
- **Retry automático**: Até 3 tentativas
- **Timeout de requisição**: 30 segundos

---

## 🔒 Segurança

- ✅ Autenticação OAuth
- ✅ Criptografia de dados
- ✅ Validação de entrada
- ✅ Rate limiting
- ✅ Logs de auditoria
- ✅ Isolamento de dados por usuário

---

## 📜 Licença

MIT License - veja [LICENSE](./LICENSE)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.

---

## 🗺️ Roadmap

- [ ] Interface mobile responsiva
- [ ] Integração com múltiplas contas de WhatsApp
- [ ] Importação de grupos via arquivo
- [ ] Integração com APIs de afiliados
- [ ] Analytics avançado
- [ ] Webhooks customizados
- [ ] API pública para terceiros
- [ ] Suporte a múltiplos idiomas

---

**Desenvolvido com ❤️ para automação de WhatsApp**

Versão: 1.0.0 | Última atualização: Março 2026
