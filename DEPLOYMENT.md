# WhatsApp Offers Bot - Guia de Deploy

Documentação completa para instalação, configuração e deploy da plataforma de automação de ofertas via WhatsApp.

## Índice

1. [Requisitos](#requisitos)
2. [Instalação Local](#instalação-local)
3. [Configuração](#configuração)
4. [Deploy com Docker](#deploy-com-docker)
5. [Deploy no Coolify](#deploy-no-coolify)
6. [Configuração do WAHA](#configuração-do-waha)
7. [Troubleshooting](#troubleshooting)

---

## Requisitos

### Mínimos
- **Docker** 20.10+ e **Docker Compose** 2.0+
- **Node.js** 22+ (para desenvolvimento local)
- **PostgreSQL** 16+ ou compatível
- **Redis** 7+
- **4GB RAM** mínimo
- **2GB espaço em disco**

### Recomendados
- **8GB RAM**
- **10GB espaço em disco**
- **Processador multi-core**
- **Conexão estável com internet**

---

## Instalação Local

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/whatsapp-offers-bot.git
cd whatsapp-offers-bot
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas configurações:

```env
DATABASE_URL=mysql://postgres:postgres@localhost:3306/whatsapp_offers
REDIS_URL=redis://localhost:6379
WAHA_API_URL=http://localhost:3001
WAHA_API_KEY=sua_chave_waha
JWT_SECRET=sua_chave_secreta_jwt
```

### 4. Iniciar serviços locais

```bash
# Terminal 1: PostgreSQL
docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine

# Terminal 2: Redis
docker run --name redis -p 6379:6379 redis:7-alpine

# Terminal 3: WAHA
docker run --name waha -p 3001:3000 devlikeapro/waha:latest

# Terminal 4: Aplicação
pnpm dev
```

Acesse em `http://localhost:3000`

---

## Configuração

### Variáveis de Ambiente Essenciais

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `mysql://user:pass@host:5432/db` |
| `REDIS_URL` | URL de conexão Redis | `redis://localhost:6379` |
| `WAHA_API_URL` | URL da API WAHA | `http://waha:3000` |
| `WAHA_API_KEY` | Chave de autenticação WAHA | `sua_chave_api` |
| `JWT_SECRET` | Chave secreta JWT (mín 32 chars) | `sua_chave_secreta_muito_segura` |
| `VITE_APP_ID` | ID da aplicação Manus | `seu_app_id` |
| `OWNER_OPEN_ID` | ID do proprietário | `seu_open_id` |

### Configuração de Segurança

1. **Alterar senhas padrão**
   ```bash
   # Gerar senha segura
   openssl rand -base64 32
   ```

2. **Configurar HTTPS** (em produção)
   - Use um reverse proxy (Nginx, Traefik)
   - Configure certificado SSL/TLS
   - Redirecione HTTP para HTTPS

3. **Firewall**
   - Abra apenas portas necessárias (3000, 5432, 6379)
   - Restrinja acesso por IP se possível

---

## Deploy com Docker

### 1. Build da imagem

```bash
docker build -t whatsapp-offers-bot:latest .
```

### 2. Executar com Docker Compose

```bash
# Copiar arquivo de produção
cp .env.production .env

# Editar variáveis
nano .env

# Iniciar serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f app
```

### 3. Parar serviços

```bash
docker-compose down

# Com limpeza de volumes
docker-compose down -v
```

### 4. Backup do banco de dados

```bash
# Fazer backup
docker-compose exec postgres pg_dump -U postgres whatsapp_offers > backup.sql

# Restaurar
docker-compose exec -T postgres psql -U postgres whatsapp_offers < backup.sql
```

---

## Deploy no Coolify

### 1. Preparar no Coolify

1. Acesse o painel do Coolify
2. Crie um novo projeto
3. Selecione "Docker Compose"
4. Cole o conteúdo de `docker-compose.yml`

### 2. Configurar variáveis de ambiente

No painel do Coolify, adicione as variáveis:

```
DATABASE_URL=mysql://postgres:senha@postgres:5432/whatsapp_offers
REDIS_URL=redis://redis:6379
WAHA_API_URL=http://waha:3000
WAHA_API_KEY=sua_chave
JWT_SECRET=sua_chave_secreta
VITE_APP_ID=seu_app_id
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome
```

### 3. Conectar repositório Git

1. Conecte seu repositório GitHub/GitLab
2. Configure branch para deploy automático
3. Ative webhooks para CI/CD

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde a build completar
3. Verifique os logs
4. Acesse a URL gerada

### 5. Configurar domínio customizado

1. No Coolify, vá para "Domains"
2. Adicione seu domínio
3. Configure DNS apontando para Coolify
4. Ative SSL automático

---

## Configuração do WAHA

### 1. Acessar Swagger do WAHA

```
http://seu-servidor:3001/swagger
```

### 2. Criar sessão via API

```bash
curl -X POST http://localhost:3001/sessions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_chave_waha" \
  -d '{
    "sessionName": "minha-sessao",
    "config": {
      "headless": true,
      "debug": false
    }
  }'
```

### 3. Obter QR Code

```bash
curl http://localhost:3001/sessions/minha-sessao \
  -H "X-API-Key: sua_chave_waha"
```

Escaneie o QR Code com seu WhatsApp

### 4. Testar envio de mensagem

```bash
curl -X POST http://localhost:3001/sessions/minha-sessao/messages/text \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sua_chave_waha" \
  -d '{
    "chatId": "5511999999999@c.us",
    "text": "Olá! Teste de mensagem"
  }'
```

---

## Troubleshooting

### Erro: "Database connection refused"

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Verificar logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres
```

### Erro: "Redis connection refused"

```bash
# Verificar Redis
docker-compose logs redis

# Testar conexão
redis-cli -h localhost ping
```

### Erro: "WAHA not responding"

```bash
# Verificar WAHA
docker-compose logs waha

# Testar health
curl http://localhost:3001/health

# Reiniciar
docker-compose restart waha
```

### Erro: "Port already in use"

```bash
# Encontrar processo usando porta
lsof -i :3000

# Matar processo
kill -9 PID

# Ou mudar porta no docker-compose.yml
```

### Erro: "Out of memory"

```bash
# Aumentar limite de memória no docker-compose.yml
services:
  app:
    mem_limit: 2g
    memswap_limit: 2g
```

### Erro: "Permission denied"

```bash
# Dar permissão ao usuário
sudo usermod -aG docker $USER
newgrp docker

# Ou usar sudo
sudo docker-compose up
```

---

## Monitoramento

### Verificar status dos serviços

```bash
docker-compose ps
```

### Ver logs em tempo real

```bash
# Todos os serviços
docker-compose logs -f

# Apenas aplicação
docker-compose logs -f app

# Últimas 100 linhas
docker-compose logs --tail=100 app
```

### Monitorar recursos

```bash
docker stats
```

### Verificar saúde

```bash
# Aplicação
curl http://localhost:3000

# WAHA
curl http://localhost:3001/health

# PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# Redis
docker-compose exec redis redis-cli ping
```

---

## Atualizações

### Atualizar código

```bash
git pull origin main
docker-compose up -d --build
```

### Atualizar imagens Docker

```bash
docker-compose pull
docker-compose up -d
```

### Backup antes de atualizar

```bash
docker-compose exec postgres pg_dump -U postgres whatsapp_offers > backup-$(date +%Y%m%d).sql
```

---

## Segurança em Produção

1. **Altere todas as senhas padrão**
2. **Use variáveis de ambiente para secrets**
3. **Configure firewall adequadamente**
4. **Ative HTTPS/SSL**
5. **Faça backups regulares**
6. **Monitore logs regularmente**
7. **Atualize dependências periodicamente**
8. **Use reverse proxy (Nginx/Traefik)**

---

## Suporte

Para problemas ou dúvidas:

1. Verifique os logs: `docker-compose logs`
2. Consulte a documentação: `README.md`
3. Abra uma issue no GitHub
4. Entre em contato com o suporte

---

**Última atualização**: Março 2026
**Versão**: 1.0.0
