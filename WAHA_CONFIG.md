# 🔌 Configuração WAHA - WhatsApp HTTP API

Guia detalhado para configurar e usar a integração WAHA.

---

## O que é WAHA?

**WAHA** (WhatsApp HTTP API) é uma API HTTP para automação de WhatsApp. Permite:
- Conectar múltiplas contas WhatsApp
- Enviar mensagens programaticamente
- Receber webhooks de mensagens
- Gerenciar grupos e contatos
- Obter QR codes para autenticação

---

## Instalação

### Via Docker (Recomendado)

WAHA já está configurado no `docker-compose.yml`:

```yaml
waha:
  image: devlikeapro/whatsapp-http-api:latest
  container_name: whatsapp-offers-waha
  environment:
    - WHATSAPP_API_URL=http://localhost:3001
    - WHATSAPP_API_PORT=3001
    - WHATSAPP_API_KEY=${WAHA_API_KEY}
  ports:
    - "3001:3001"
  volumes:
    - waha_data:/app/sessions
  networks:
    - whatsapp-offers-network
```

### Via Instalação Local

```bash
# Clonar repositório
git clone https://github.com/devlikeapro/whatsapp-http-api.git
cd whatsapp-http-api

# Instalar dependências
npm install

# Iniciar
npm start
```

---

## Variáveis de Ambiente

Configure no `.env`:

```env
# WAHA API
WAHA_API_URL=http://localhost:3001
WAHA_API_KEY=sua_chave_secreta_aqui

# Opcional
WAHA_API_TIMEOUT=30000
WAHA_MAX_RETRIES=3
WAHA_RETRY_DELAY=1000
```

---

## Endpoints Principais

### 1. Criar Sessão

```bash
curl -X POST http://localhost:3001/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${WAHA_API_KEY}" \
  -d '{
    "sessionName": "minha-sessao",
    "qrcode": "SHOW_QR_CODE"
  }'
```

**Resposta**:
```json
{
  "sessionName": "minha-sessao",
  "status": "STARTING",
  "qrcode": "data:image/png;base64,..."
}
```

### 2. Listar Sessões

```bash
curl http://localhost:3001/sessions \
  -H "Authorization: Bearer ${WAHA_API_KEY}"
```

**Resposta**:
```json
[
  {
    "sessionName": "minha-sessao",
    "status": "CONNECTED",
    "me": {
      "id": "5511999999999@c.us",
      "name": "Seu Nome"
    }
  }
]
```

### 3. Enviar Mensagem

```bash
curl -X POST http://localhost:3001/sessions/minha-sessao/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${WAHA_API_KEY}" \
  -d '{
    "chatId": "120363123456789@g.us",
    "text": "Olá! Esta é uma mensagem de teste."
  }'
```

**Resposta**:
```json
{
  "id": "true_120363123456789@g.us_WAMID.HkIkFmIkFmIk",
  "status": "SENT"
}
```

### 4. Enviar Imagem

```bash
curl -X POST http://localhost:3001/sessions/minha-sessao/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${WAHA_API_KEY}" \
  -d '{
    "chatId": "120363123456789@g.us",
    "media": {
      "url": "https://exemplo.com/imagem.jpg",
      "caption": "Descrição da imagem"
    }
  }'
```

### 5. Desconectar Sessão

```bash
curl -X DELETE http://localhost:3001/sessions/minha-sessao \
  -H "Authorization: Bearer ${WAHA_API_KEY}"
```

---

## Integração com Backend

### Serviço WAHA (server/services/waha.service.ts)

```typescript
import axios from 'axios';

const WAHA_URL = process.env.WAHA_API_URL || 'http://localhost:3001';
const WAHA_KEY = process.env.WAHA_API_KEY;

export class WAHAService {
  // Criar sessão
  static async createSession(sessionName: string) {
    const response = await axios.post(`${WAHA_URL}/sessions`, {
      sessionName,
      qrcode: 'SHOW_QR_CODE',
    }, {
      headers: { Authorization: `Bearer ${WAHA_KEY}` },
    });
    return response.data;
  }

  // Listar sessões
  static async listSessions() {
    const response = await axios.get(`${WAHA_URL}/sessions`, {
      headers: { Authorization: `Bearer ${WAHA_KEY}` },
    });
    return response.data;
  }

  // Enviar mensagem
  static async sendMessage(sessionName: string, chatId: string, text: string) {
    const response = await axios.post(
      `${WAHA_URL}/sessions/${sessionName}/messages`,
      { chatId, text },
      { headers: { Authorization: `Bearer ${WAHA_KEY}` } }
    );
    return response.data;
  }

  // Desconectar
  static async disconnect(sessionName: string) {
    await axios.delete(`${WAHA_URL}/sessions/${sessionName}`, {
      headers: { Authorization: `Bearer ${WAHA_KEY}` },
    });
  }
}
```

---

## Formatos de ID

### ID de Contato

```
5511999999999@c.us
```

- `55` = Código do país (Brasil)
- `11` = Código da área (São Paulo)
- `999999999` = Número do celular
- `@c.us` = Sufixo para contato individual

### ID de Grupo

```
120363123456789@g.us
```

- `120363...` = ID único do grupo
- `@g.us` = Sufixo para grupo

### Como Obter IDs

**Grupo**:
1. Abra o grupo no WhatsApp Web
2. Clique no nome do grupo
3. Procure por "Informações do grupo"
4. O ID está na URL ou informações

**Contato**:
1. Abra o contato no WhatsApp Web
2. Copie o número do contato
3. Formate como: `55NNNNNNNNNN@c.us`

---

## Tipos de Mensagem

### Texto Simples

```json
{
  "chatId": "120363123456789@g.us",
  "text": "Olá! Como você está?"
}
```

### Com Imagem

```json
{
  "chatId": "120363123456789@g.us",
  "media": {
    "url": "https://exemplo.com/imagem.jpg",
    "caption": "Descrição"
  }
}
```

### Com Link

```json
{
  "chatId": "120363123456789@g.us",
  "text": "Confira nossa oferta: https://loja.com/oferta"
}
```

### Com Emojis

```json
{
  "chatId": "120363123456789@g.us",
  "text": "🎁 Oferta Especial! 🎉\n\nDesconto de 50% em todos os produtos!"
}
```

---

## Tratamento de Erros

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `401 Unauthorized` | Chave API inválida | Verifique `WAHA_API_KEY` |
| `404 Not Found` | Sessão não existe | Crie a sessão primeiro |
| `400 Bad Request` | Formato inválido | Verifique formato do JSON |
| `429 Too Many Requests` | Rate limit atingido | Aguarde antes de enviar |
| `500 Internal Server Error` | Erro do servidor | Reinicie WAHA |

### Implementar Retry

```typescript
async function sendMessageWithRetry(
  sessionName: string,
  chatId: string,
  text: string,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await WAHAService.sendMessage(sessionName, chatId, text);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Backoff exponencial
    }
  }
}
```

---

## Rate Limiting

WAHA aplica rate limits:
- **20 mensagens/minuto** por sessão
- **100 mensagens/minuto** por API key
- **Delay de 3 segundos** entre mensagens recomendado

### Implementar Rate Limiter

```typescript
import pLimit from 'p-limit';

const limiter = pLimit(1); // 1 mensagem por vez
const delayMs = 3000; // 3 segundos

async function sendMessagesRateLimited(messages: Array<{
  sessionName: string;
  chatId: string;
  text: string;
}>) {
  for (const msg of messages) {
    await limiter(async () => {
      await WAHAService.sendMessage(msg.sessionName, msg.chatId, msg.text);
      await new Promise(r => setTimeout(r, delayMs));
    });
  }
}
```

---

## Webhooks (Opcional)

Configure webhooks para receber eventos:

```bash
curl -X POST http://localhost:3001/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${WAHA_API_KEY}" \
  -d '{
    "url": "https://seu-servidor.com/webhooks/waha",
    "events": ["message", "status"]
  }'
```

---

## Troubleshooting

### WAHA não conecta

```bash
# Verificar status
curl http://localhost:3001/health

# Ver logs
docker-compose logs waha

# Reiniciar
docker-compose restart waha
```

### QR Code não aparece

```bash
# Limpar sessões
docker-compose exec waha rm -rf /app/sessions/*

# Reiniciar
docker-compose restart waha

# Criar nova sessão
```

### Mensagens não são enviadas

1. Verifique se a sessão está `CONNECTED`
2. Verifique se o `chatId` está correto
3. Verifique rate limiting
4. Veja os logs do WAHA

---

## Recursos Adicionais

- **Documentação Oficial**: https://github.com/devlikeapro/whatsapp-http-api
- **API Reference**: https://devlikeapro.github.io/whatsapp-http-api/
- **Exemplos**: https://github.com/devlikeapro/whatsapp-http-api/tree/main/examples

---

**Última atualização**: Março 2026
**Versão**: 1.0.0
