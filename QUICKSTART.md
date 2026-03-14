# ⚡ Quick Start - WhatsApp Offers Bot

Comece em 5 minutos!

---

## 1️⃣ Clonar e Configurar

```bash
git clone https://github.com/seu-usuario/whatsapp-offers-bot.git
cd whatsapp-offers-bot
cp .env.production .env
nano .env  # Edite com suas configurações
```

## 2️⃣ Iniciar com Docker

```bash
docker-compose up -d
```

Aguarde 30-60 segundos para os serviços iniciarem.

## 3️⃣ Acessar Plataforma

```
http://localhost:3000
```

Ou acesse sua URL em produção.

## 4️⃣ Fazer Login

1. Clique em "Entrar com Manus"
2. Faça login com suas credenciais
3. Autorize o acesso

## 5️⃣ Conectar WhatsApp

1. Vá para **"Sessões WhatsApp"**
2. Clique em **"+ Nova Sessão"**
3. Digite um nome (ex: "Principal")
4. Clique em **"Criar Sessão"**
5. Clique em **"Conectar com QR Code"**
6. Escaneie com seu WhatsApp
7. Confirme a conexão

## 6️⃣ Cadastrar Grupo

1. Vá para **"Gerenciar Grupos"**
2. Clique em **"+ Novo Grupo"**
3. Preencha:
   - Nome: "Meus Clientes"
   - ID do Grupo: `120363...@g.us`
   - Sessão: "Principal"
4. Clique em **"Criar Grupo"**

## 7️⃣ Criar Produto

1. Vá para **"Produtos"**
2. Clique em **"+ Novo Produto"**
3. Preencha:
   - Emoji: 🎁
   - Título: "Oferta Especial"
   - Descrição: "Desconto de 50%"
   - Preço: "R$ 99,90"
   - Link: "https://loja.com/oferta"
4. Clique em **"Criar Produto"**

## 8️⃣ Agendar Oferta

1. Vá para **"Agendamentos"**
2. Clique em **"+ Novo Agendamento"**
3. Preencha:
   - Produto: "Oferta Especial"
   - Grupos: Marque "Meus Clientes"
   - Data/Hora: Escolha data futura
4. Clique em **"Agendar"**

## 9️⃣ Monitorar

1. Vá para **"Histórico de Mensagens"**
2. Veja status dos envios
3. Volte ao **"Dashboard"** para ver estatísticas

## ✅ Pronto!

Sua plataforma está funcionando! 🚀

---

## Próximos Passos

- Leia [MANUAL_USO.md](./MANUAL_USO.md) para guia completo
- Leia [DEPLOYMENT.md](./DEPLOYMENT.md) para deploy em produção
- Leia [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) para administração

---

## Comandos Úteis

```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f app

# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Fazer backup
docker-compose exec postgres pg_dump -U postgres whatsapp_offers > backup.sql
```

---

## Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Porta 3000 em uso | Mude em docker-compose.yml: `ports: ["3001:3000"]` |
| Banco não conecta | Aguarde 30s e tente novamente |
| QR Code não aparece | Atualize a página |
| Mensagem não envia | Verifique se sessão está conectada |

---

Precisa de ajuda? Veja a documentação completa! 📚
