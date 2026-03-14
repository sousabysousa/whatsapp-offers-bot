# 🔧 Guia de Administração - WhatsApp Offers Bot

Documentação técnica para administradores e operadores da plataforma.

---

## Índice

1. [Acesso ao Painel Admin](#acesso-ao-painel-admin)
2. [Gerenciar Usuários](#gerenciar-usuários)
3. [Monitorar Sistema](#monitorar-sistema)
4. [Manutenção do Banco de Dados](#manutenção-do-banco-de-dados)
5. [Gerenciar Logs](#gerenciar-logs)
6. [Backup e Restauração](#backup-e-restauração)
7. [Performance e Otimização](#performance-e-otimização)
8. [Segurança](#segurança)

---

## Acesso ao Painel Admin

### Requisitos

- Ser usuário com role **"admin"**
- Ter acesso SSH ao servidor
- Conhecimento básico de Linux/Docker

### Promover Usuário para Admin

```bash
# Conectar ao banco de dados
docker-compose exec postgres psql -U postgres -d whatsapp_offers

# Executar comando SQL
UPDATE users SET role = 'admin' WHERE openId = 'seu_open_id';

# Sair
\q
```

### Acessar Painel Admin

1. Faça login como admin
2. Você verá opções adicionais no menu
3. Acesse **"Administração"** (se disponível)

---

## Gerenciar Usuários

### Listar Todos os Usuários

```bash
docker-compose exec postgres psql -U postgres -d whatsapp_offers -c "SELECT id, name, email, role, createdAt FROM users;"
```

### Promover Usuário

```bash
docker-compose exec postgres psql -U postgres -d whatsapp_offers -c "UPDATE users SET role = 'admin' WHERE id = 123;"
```

### Remover Privilégio Admin

```bash
docker-compose exec postgres psql -U postgres -d whatsapp_offers -c "UPDATE users SET role = 'user' WHERE id = 123;"
```

### Deletar Usuário

```bash
docker-compose exec postgres psql -U postgres -d whatsapp_offers -c "DELETE FROM users WHERE id = 123;"
```

---

## Monitorar Sistema

### Verificar Status dos Serviços

```bash
# Ver status de todos os containers
docker-compose ps

# Esperado:
# postgres    - Up (healthy)
# redis       - Up (healthy)
# waha        - Up (healthy)
# app         - Up (healthy)
```

### Monitorar Recursos

```bash
# Ver uso de CPU, memória, etc
docker stats

# Monitorar em tempo real
docker stats --no-stream
```

### Verificar Saúde da Aplicação

```bash
# Teste da aplicação
curl http://localhost:3000

# Teste do WAHA
curl http://localhost:3001/health

# Teste do PostgreSQL
docker-compose exec postgres pg_isready -U postgres

# Teste do Redis
docker-compose exec redis redis-cli ping
```

### Ver Logs em Tempo Real

```bash
# Todos os serviços
docker-compose logs -f

# Apenas aplicação
docker-compose logs -f app

# Apenas WAHA
docker-compose logs -f waha

# Últimas 100 linhas
docker-compose logs --tail=100 app
```

---

## Manutenção do Banco de Dados

### Conectar ao PostgreSQL

```bash
docker-compose exec postgres psql -U postgres -d whatsapp_offers
```

### Verificar Tamanho do Banco

```bash
# Dentro do psql
SELECT pg_size_pretty(pg_database_size('whatsapp_offers'));
```

### Verificar Tabelas

```bash
# Dentro do psql
\dt

# Ver estrutura de uma tabela
\d users

# Ver número de linhas
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Limpar Dados Antigos

```bash
# Deletar histórico de mensagens com mais de 30 dias
DELETE FROM message_history 
WHERE createdAt < NOW() - INTERVAL '30 days';

# Deletar ofertas completadas com mais de 60 dias
DELETE FROM offers 
WHERE status = 'sent' AND scheduledAt < NOW() - INTERVAL '60 days';
```

### Otimizar Banco de Dados

```bash
# Dentro do psql
VACUUM ANALYZE;
```

### Fazer Backup

```bash
# Backup completo
docker-compose exec postgres pg_dump -U postgres whatsapp_offers > backup-$(date +%Y%m%d-%H%M%S).sql

# Backup comprimido
docker-compose exec postgres pg_dump -U postgres whatsapp_offers | gzip > backup-$(date +%Y%m%d-%H%M%S).sql.gz
```

### Restaurar Backup

```bash
# Restaurar de arquivo
docker-compose exec -T postgres psql -U postgres whatsapp_offers < backup-20260314.sql

# Restaurar de arquivo comprimido
gunzip -c backup-20260314.sql.gz | docker-compose exec -T postgres psql -U postgres whatsapp_offers
```

---

## Gerenciar Logs

### Localização dos Logs

```bash
# Logs da aplicação (no container)
/app/.manus-logs/

# Tipos de logs:
# - devserver.log        → Startup e HMR
# - browserConsole.log   → Console do cliente
# - networkRequests.log  → Requisições HTTP
# - sessionReplay.log    → Interações do usuário
```

### Acessar Logs

```bash
# Ver logs do container
docker-compose exec app cat /app/.manus-logs/devserver.log

# Monitorar logs em tempo real
docker-compose exec app tail -f /app/.manus-logs/devserver.log

# Buscar por erro
docker-compose exec app grep -i "error" /app/.manus-logs/devserver.log

# Contar erros
docker-compose exec app grep -i "error" /app/.manus-logs/devserver.log | wc -l
```

### Limpar Logs Antigos

```bash
# Dentro do container
docker-compose exec app sh -c 'find /app/.manus-logs -name "*.log" -mtime +30 -delete'

# Ou manualmente
docker-compose exec app rm /app/.manus-logs/devserver.log
```

---

## Backup e Restauração

### Estratégia de Backup

**Recomendação**: Backup diário + backup semanal completo

```bash
# Script de backup automático
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d-%H%M%S)

# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres whatsapp_offers | gzip > $BACKUP_DIR/db-$DATE.sql.gz

# Backup Redis
docker-compose exec redis redis-cli BGSAVE
docker-compose cp whatsapp-offers-redis:/data/dump.rdb $BACKUP_DIR/redis-$DATE.rdb

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +30 -delete

echo "Backup realizado: $DATE"
```

### Agendar Backup Automático

```bash
# Editar crontab
crontab -e

# Adicionar linha (backup diário às 2:00 AM)
0 2 * * * /home/ubuntu/backup.sh >> /var/log/backup.log 2>&1
```

### Restaurar Banco Completo

```bash
# Parar aplicação
docker-compose down

# Restaurar PostgreSQL
docker-compose up -d postgres
sleep 10
gunzip -c backup-20260314.sql.gz | docker-compose exec -T postgres psql -U postgres whatsapp_offers

# Restaurar Redis
docker-compose up -d redis
docker-compose cp backup-20260314.rdb whatsapp-offers-redis:/data/dump.rdb
docker-compose exec redis redis-cli shutdown
docker-compose restart redis

# Reiniciar aplicação
docker-compose up -d
```

---

## Performance e Otimização

### Monitorar Performance

```bash
# Ver queries lentas
docker-compose exec postgres psql -U postgres -d whatsapp_offers -c "
SELECT query, calls, mean_time, max_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
"

# Ver conexões ativas
docker-compose exec postgres psql -U postgres -d whatsapp_offers -c "
SELECT datname, usename, application_name, state, query 
FROM pg_stat_activity 
WHERE datname = 'whatsapp_offers';
"
```

### Otimizar Índices

```bash
# Criar índices para queries comuns
docker-compose exec postgres psql -U postgres -d whatsapp_offers -c "
CREATE INDEX IF NOT EXISTS idx_offers_userId ON offers(userId);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_messageHistory_userId ON message_history(userId);
CREATE INDEX IF NOT EXISTS idx_messageHistory_status ON message_history(status);
"
```

### Limpar Cache Redis

```bash
# Ver tamanho do Redis
docker-compose exec redis redis-cli INFO memory

# Limpar cache
docker-compose exec redis redis-cli FLUSHDB

# Limpar tudo (cuidado!)
docker-compose exec redis redis-cli FLUSHALL
```

### Aumentar Limites

```bash
# Aumentar limite de memória (docker-compose.yml)
services:
  app:
    mem_limit: 2g
    memswap_limit: 2g
  
  postgres:
    mem_limit: 1g
    memswap_limit: 1g
```

---

## Segurança

### Alterar Senhas

```bash
# PostgreSQL
docker-compose exec postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'nova_senha';"

# Redis (se configurado)
docker-compose exec redis redis-cli CONFIG SET requirepass 'nova_senha'
```

### Atualizar Secrets

```bash
# Gerar novo JWT_SECRET
openssl rand -base64 32

# Atualizar .env
nano .env

# Reiniciar aplicação
docker-compose restart app
```

### Verificar Segurança

```bash
# Ver variáveis de ambiente (cuidado com secrets!)
docker-compose exec app env | grep -E "JWT|API|SECRET"

# Verificar permissões de arquivos
docker-compose exec app ls -la /app/.env

# Verificar conexões SSH
docker ps -a
```

### Atualizar Dependências

```bash
# Atualizar imagens Docker
docker-compose pull

# Reconstruir aplicação
docker-compose up -d --build

# Verificar vulnerabilidades
docker scan whatsapp-offers-bot:latest
```

---

## Troubleshooting Avançado

### Aplicação não inicia

```bash
# Ver logs detalhados
docker-compose logs app

# Verificar variáveis de ambiente
docker-compose config | grep -A 20 "services:"

# Reiniciar com rebuild
docker-compose up -d --build
```

### Banco de dados corrompido

```bash
# Verificar integridade
docker-compose exec postgres pg_verify_checksums -D /var/lib/postgresql/data

# Reparar (se possível)
docker-compose exec postgres reindex DATABASE whatsapp_offers
```

### Redis cheio

```bash
# Ver memória usada
docker-compose exec redis redis-cli INFO memory

# Limpar dados antigos
docker-compose exec redis redis-cli EVAL "
for i, key in ipairs(redis.call('keys', '*')) do
  if redis.call('ttl', key) == -1 then
    redis.call('del', key)
  end
end
return 'OK'
" 0
```

### WAHA desconectado

```bash
# Reiniciar WAHA
docker-compose restart waha

# Limpar sessões
docker-compose exec waha rm -rf /app/sessions/*

# Reiniciar
docker-compose restart waha
```

---

## Checklist de Manutenção

### Diário
- [ ] Verificar status dos serviços
- [ ] Monitorar logs de erro
- [ ] Verificar taxa de sucesso de envios

### Semanal
- [ ] Fazer backup completo
- [ ] Revisar performance
- [ ] Limpar logs antigos
- [ ] Atualizar dependências (se necessário)

### Mensal
- [ ] Otimizar banco de dados
- [ ] Revisar segurança
- [ ] Analisar estatísticas
- [ ] Planejar melhorias

### Trimestral
- [ ] Atualizar sistema operacional
- [ ] Revisar política de backups
- [ ] Auditar acessos
- [ ] Testar restauração de backup

---

## Contato e Suporte

Para problemas avançados:
- Consulte os logs
- Verifique a documentação
- Abra uma issue no GitHub
- Entre em contato com suporte

---

**Última atualização**: Março 2026
**Versão**: 1.0.0
