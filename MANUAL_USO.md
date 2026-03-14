# 📖 Manual de Uso - WhatsApp Offers Bot

Guia completo para usar a plataforma de automação de ofertas via WhatsApp.

---

## Índice

1. [Primeiros Passos](#primeiros-passos)
2. [Autenticação](#autenticação)
3. [Conectar WhatsApp](#conectar-whatsapp)
4. [Gerenciar Grupos](#gerenciar-grupos)
5. [Cadastrar Produtos](#cadastrar-produtos)
6. [Agendar Ofertas](#agendar-ofertas)
7. [Monitorar Envios](#monitorar-envios)
8. [Dicas e Boas Práticas](#dicas-e-boas-práticas)

---

## Primeiros Passos

### Acessar a Plataforma

1. Abra seu navegador
2. Acesse: `https://seu-dominio.com` (ou a URL fornecida)
3. Você será redirecionado para login

### Tela Inicial

Após fazer login, você verá o **Dashboard** com:
- **Estatísticas**: Grupos, produtos, ofertas, mensagens hoje
- **Taxa de sucesso**: Porcentagem de mensagens enviadas com sucesso
- **Ações rápidas**: Botões para acessar principais funcionalidades

---

## Autenticação

### Fazer Login

1. Clique em "Entrar com Manus"
2. Você será redirecionado para o portal de autenticação
3. Faça login com suas credenciais
4. Autorize o acesso à aplicação
5. Você será redirecionado de volta à plataforma

### Fazer Logout

1. Clique no seu nome/avatar no canto superior direito
2. Selecione "Sair"
3. Você será desconectado e redirecionado para a página inicial

---

## Conectar WhatsApp

### Passo 1: Acessar Sessões WhatsApp

1. No menu lateral, clique em **"Sessões WhatsApp"**
2. Você verá a lista de sessões criadas (se houver)

### Passo 2: Criar Nova Sessão

1. Clique no botão **"+ Nova Sessão"**
2. Digite um nome para identificar a sessão (ex: "Minha Conta Principal")
3. Clique em **"Criar Sessão"**
4. Aguarde a sessão ser criada

### Passo 3: Conectar com QR Code

1. Após criar a sessão, clique em **"Conectar com QR Code"**
2. Um QR Code será exibido
3. Abra o WhatsApp no seu celular
4. Vá para **Configurações > Dispositivos Conectados > Conectar Dispositivo**
5. Escaneie o QR Code com a câmera do seu celular
6. Confirme a conexão no WhatsApp
7. Aguarde a sincronização (pode levar alguns segundos)

### Verificar Conexão

- Status **"Conectado"** (verde) = Sessão ativa e pronta para enviar
- Status **"Conectando..."** (amarelo) = Aguardando sincronização
- Status **"Desconectado"** (cinza) = Sessão inativa

### Desconectar Sessão

1. Clique no botão **"Desconectar"** na sessão
2. Confirme a desconexão
3. A sessão será desconectada do WhatsApp

---

## Gerenciar Grupos

### Acessar Gerenciador de Grupos

1. No menu lateral, clique em **"Gerenciar Grupos"**
2. Você verá a lista de grupos cadastrados

### Adicionar Novo Grupo

1. Clique em **"+ Novo Grupo"**
2. Preencha os campos:
   - **Nome do Grupo**: Nome para identificar (ex: "Clientes VIP")
   - **ID do Grupo WhatsApp**: ID único do grupo (ex: `120363123456789@g.us`)
   - **Sessão WhatsApp**: Selecione a sessão para usar
3. Clique em **"Criar Grupo"**

### Como Obter o ID do Grupo

1. Abra o grupo no WhatsApp Web
2. Clique no nome do grupo no topo
3. Procure por "Informações do grupo"
4. O ID estará na URL ou nas informações
5. Copie o ID (formato: `120363...@g.us`)

### Deletar Grupo

1. Clique no botão **"Deletar"** do grupo
2. Confirme a exclusão
3. O grupo será removido da plataforma

---

## Cadastrar Produtos

### Acessar Gerenciador de Produtos

1. No menu lateral, clique em **"Produtos"**
2. Você verá a lista de produtos cadastrados

### Criar Novo Produto

1. Clique em **"+ Novo Produto"**
2. Preencha os campos:
   - **Emoji**: Escolha um emoji para representar (ex: 🎁, 👟, 📱)
   - **Título**: Nome do produto (ex: "Tênis Premium")
   - **Descrição**: Detalhe da oferta (ex: "Desconto de 50% em tênis selecionados")
   - **Preço**: Valor (ex: "R$ 199,90")
   - **Link do Produto**: URL para compra (ex: "https://loja.com/produto")
3. Clique em **"Criar Produto"**

### Preview do Produto

1. Clique em **"Preview"** para ver como ficará a mensagem
2. A mensagem será exibida no formato que será enviado

### Deletar Produto

1. Clique no botão **"Deletar"** do produto
2. Confirme a exclusão
3. O produto será removido

---

## Agendar Ofertas

### Acessar Agendamentos

1. No menu lateral, clique em **"Agendamentos"**
2. Você verá a lista de agendamentos criados

### Criar Novo Agendamento

1. Clique em **"+ Novo Agendamento"**
2. Preencha os campos:
   - **Produto**: Selecione o produto a enviar
   - **Grupos**: Marque os grupos que receberão a oferta
   - **Data e Hora**: Quando deseja enviar (ex: "15/03/2026 14:30")
3. Clique em **"Agendar"**

### Exemplo de Fluxo

**Cenário**: Você quer enviar uma oferta de tênis para 2 grupos amanhã às 10:00

1. Vá para **"Agendamentos"**
2. Clique em **"+ Novo Agendamento"**
3. Selecione **"Tênis Premium"** em Produto
4. Marque **"Clientes VIP"** e **"Clientes Ativos"** em Grupos
5. Digite **"15/03/2026 10:00"** em Data e Hora
6. Clique em **"Agendar"**
7. Pronto! O envio será feito automaticamente no horário

### Status do Agendamento

- **Agendado** (azul) = Aguardando data/hora
- **Enviado** (verde) = Já foi enviado
- **Falha** (vermelho) = Erro no envio

### Deletar Agendamento

1. Clique em **"Deletar"** do agendamento
2. Confirme a exclusão
3. O agendamento será cancelado

---

## Monitorar Envios

### Acessar Histórico

1. No menu lateral, clique em **"Histórico de Mensagens"**
2. Você verá todas as mensagens enviadas

### Informações do Histórico

Cada entrada mostra:
- **Status**: Enviado ✓ | Falha ✗ | Pendente ⏱
- **Oferta**: Qual produto foi enviado
- **Grupo**: Para qual grupo foi enviado
- **Data/Hora**: Quando foi enviado
- **Erro**: Se houver falha, o motivo

### Filtrar Histórico

Use os filtros para encontrar:
- Mensagens por status (enviadas, falhas)
- Mensagens por data
- Mensagens por grupo

### Dashboard de Estatísticas

Volte ao **Dashboard** para ver:
- **Total de Grupos**: Quantos grupos cadastrados
- **Total de Produtos**: Quantos produtos cadastrados
- **Mensagens Hoje**: Quantas enviadas hoje
- **Taxa de Sucesso**: Percentual de sucesso

---

## Dicas e Boas Práticas

### ✅ O que Fazer

1. **Teste antes de agendar** - Use o preview para ver como ficará
2. **Horários estratégicos** - Envie em horários que seus clientes estão ativos
3. **Grupos segmentados** - Crie grupos por tipo de cliente para mensagens personalizadas
4. **Descrições claras** - Seja específico na descrição da oferta
5. **Links funcionais** - Sempre teste os links antes de agendar
6. **Emojis relevantes** - Use emojis que representem bem o produto
7. **Backup de dados** - Faça backup regular de seus agendamentos

### ❌ O que Evitar

1. **Não envie spam** - Respeite a frequência de envios
2. **Não use links suspeitos** - Pode resultar em bloqueio
3. **Não envie para grupos errados** - Verifique antes de agendar
4. **Não altere configurações sem conhecimento** - Pode causar problemas
5. **Não compartilhe credenciais** - Mantenha sua conta segura

### 🎯 Estratégias Eficazes

**Segunda-feira**: Ofertas de segunda chance
**Quarta-feira**: Promoções do meio da semana
**Sexta-feira**: Ofertas de fim de semana
**Domingo**: Preparação para semana seguinte

### 📊 Monitorar Resultados

1. Verifique o histórico regularmente
2. Analise qual horário tem melhor taxa de sucesso
3. Veja quais grupos têm melhor engajamento
4. Ajuste estratégia conforme resultados

---

## Troubleshooting

### Problema: QR Code não aparece

**Solução**:
1. Atualize a página
2. Crie uma nova sessão
3. Verifique conexão com internet

### Problema: Mensagem não foi enviada

**Solução**:
1. Verifique se a sessão está conectada
2. Verifique se o grupo ID está correto
3. Veja o histórico para mais detalhes do erro
4. Tente novamente

### Problema: Agendamento não foi executado

**Solução**:
1. Verifique se a data/hora está correta
2. Verifique se a sessão estava conectada naquele horário
3. Veja os logs para mais informações
4. Crie um novo agendamento

### Problema: Perdi acesso à conta

**Solução**:
1. Clique em "Esqueci a senha"
2. Siga as instruções de recuperação
3. Entre em contato com suporte se necessário

---

## Suporte e Ajuda

### Precisa de Ajuda?

1. Consulte este manual
2. Verifique o histórico de erros
3. Entre em contato com suporte
4. Abra uma issue no GitHub

### Informações de Contato

- **Email**: suporte@whatsappoffersbot.com
- **GitHub**: https://github.com/seu-usuario/whatsapp-offers-bot
- **Documentação**: Veja README.md e DEPLOYMENT.md

---

## Glossário

| Termo | Significado |
|-------|------------|
| **Sessão** | Conexão ativa com uma conta WhatsApp |
| **Grupo** | Grupo WhatsApp cadastrado para receber ofertas |
| **Produto** | Oferta/promoção a ser enviada |
| **Agendamento** | Envio programado para data/hora específica |
| **QR Code** | Código para conectar WhatsApp Web |
| **Taxa de Sucesso** | Percentual de mensagens enviadas com sucesso |

---

## Perguntas Frequentes

**P: Posso usar múltiplas contas WhatsApp?**
R: Sim! Crie várias sessões, uma para cada conta.

**P: Qual é o limite de grupos?**
R: Não há limite técnico, mas recomenda-se até 100 grupos por sessão.

**P: Posso agendar para o passado?**
R: Não, apenas para data/hora futura.

**P: As mensagens são enviadas automaticamente?**
R: Sim, no horário agendado, se a sessão estiver conectada.

**P: Posso editar um agendamento?**
R: Atualmente não. Delete e crie um novo.

**P: Quanto tempo leva para sincronizar?**
R: Normalmente 5-30 segundos após escanear QR Code.

---

**Última atualização**: Março 2026
**Versão**: 1.0.0

Aproveite a plataforma! 🚀
