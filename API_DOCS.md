# Chatservice — Documentação da API

> **Versão:** 1.0.0  
> **Base URL:** `http://<host>:<PORT>` (padrão: `http://localhost:3000`)  
> **WebSocket URL:** `ws://<host>:<PORT>/chat` (namespace `/chat`, Socket.IO)

---

## Sumário

- [Visão Geral](#visão-geral)
- [Endpoints REST](#endpoints-rest)
  - [Session — Vínculo Chatwoot](#1-session--vínculo-chatwoot)
  - [Messages — Histórico](#2-messages--histórico)
  - [Chatwoot — Webhook](#3-chatwoot--webhook)
- [WebSocket — Eventos](#websocket--eventos)
  - [Conexão](#conexão)
  - [Eventos Cliente → Servidor](#eventos-cliente--servidor)
  - [Eventos Servidor → Cliente](#eventos-servidor--cliente)
- [Modelos de Dados](#modelos-de-dados)
- [Códigos de Erro](#códigos-de-erro)
- [Exemplos de Uso](#exemplos-de-uso)

---

## Visão Geral

O Chatservice é um middleware de sincronização bidirecional de mensagens entre o sistema interno de chat e a plataforma **Chatwoot**. Ele expõe:

- **API REST** para gerenciar vínculos com o Chatwoot e consultar histórico de mensagens.
- **WebSocket (Socket.IO)** para comunicação em tempo real (envio/recebimento de mensagens).

Toda comunicação gira em torno do conceito de **protocolo** — um identificador único (ex: `ZPRS25207143`) que representa um ticket/atendimento.

---

## Endpoints REST

### 1. Session — Vínculo Chatwoot

#### `POST /session/link`

Vincula um protocolo interno a uma conversa do Chatwoot.

| Item | Detalhe |
|---|---|
| **Método** | `POST` |
| **URL** | `/session/link` |
| **Content-Type** | `application/json` |
| **HTTP Code** | `200` sucesso · `404` protocolo não encontrado · `400` validação |

**Request Body:**

```json
{
  "protocolo": "ZPRS25207143",
  "conversation_id": 12345,
  "contact_id": 678,
  "inbox_id": 1
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `protocolo` | `string` | ✅ | Número do protocolo interno |
| `conversation_id` | `integer` | ✅ | ID da conversa no Chatwoot |
| `contact_id` | `integer` | ✅ | ID do contato no Chatwoot |
| `inbox_id` | `integer` | ❌ | ID do inbox no Chatwoot |

**Response (200):**

```json
{
  "status": "linked",
  "protocolo": "ZPRS25207143",
  "conversation_id": 12345
}
```

**Response (404):**

```json
{
  "statusCode": 404,
  "timestamp": "2026-02-23T12:00:00.000Z",
  "path": "/session/link",
  "message": "Protocolo not found: ZPRS25207143"
}
```

---

#### `DELETE /session/:protocolo/link`

Remove o vínculo do Chatwoot de um protocolo (marca `linked: false`).

| Item | Detalhe |
|---|---|
| **Método** | `DELETE` |
| **URL** | `/session/:protocolo/link` |
| **HTTP Code** | `200` sucesso · `404` protocolo não encontrado |

**Exemplo:** `DELETE /session/ZPRS25207143/link`

**Response (200):**

```json
{
  "status": "unlinked",
  "protocolo": "ZPRS25207143"
}
```

---

#### `GET /session/:protocolo/chatwoot-status`

Consulta o status do vínculo Chatwoot de um protocolo.

| Item | Detalhe |
|---|---|
| **Método** | `GET` |
| **URL** | `/session/:protocolo/chatwoot-status` |
| **HTTP Code** | `200` sucesso · `404` protocolo não encontrado |

**Exemplo:** `GET /session/ZPRS25207143/chatwoot-status`

**Response (200) — Vinculado:**

```json
{
  "protocolo": "ZPRS25207143",
  "linked": true,
  "conversation_id": 12345,
  "contact_id": 678,
  "inbox_id": 1
}
```

**Response (200) — Não vinculado:**

```json
{
  "protocolo": "ZPRS25207143",
  "linked": false
}
```

---

### 2. Messages — Histórico

#### `GET /messages/:protocolo/history`

Retorna o array completo de mensagens do chat de um protocolo.

| Item | Detalhe |
|---|---|
| **Método** | `GET` |
| **URL** | `/messages/:protocolo/history` |
| **HTTP Code** | `200` sucesso |

**Exemplo:** `GET /messages/ZPRS25207143/history`

**Response (200):**

```json
{
  "protocolo": "ZPRS25207143",
  "messages": [
    {
      "reme": "13021166652",
      "dest": "gugupenido@gmail.com",
      "dt_env": "2026-02-23T10:30:00.000Z",
      "isInterno": false,
      "autor": "LÍVIA ALVES",
      "mensagem": "Olá, preciso de ajuda",
      "chatwoot_message_id": 99999,
      "source": "chatwoot",
      "chatwoot_sync_failed": false
    },
    {
      "reme": "gugupenido@gmail.com",
      "dest": "13021166652",
      "dt_env": "2026-02-23T10:31:00.000Z",
      "isInterno": false,
      "autor": "GUSTAVO MARCELO",
      "mensagem": "Olá! Em que posso ajudar?",
      "source": "internal"
    }
  ]
}
```

---

### 3. Chatwoot — Webhook

#### `POST /chatwoot/webhook`

Endpoint para receber webhooks do Chatwoot. Configurado no painel do Chatwoot para enviar eventos automaticamente.

| Item | Detalhe |
| --- | --- |
| **Método** | `POST` |
| **URL** | `/chatwoot/webhook` |
| **HTTP Code** | Sempre `200` (mesmo em erro, para evitar retentativas do Chatwoot) |

> **Nota:** Este endpoint é consumido exclusivamente pelo Chatwoot, não pelo front-end. Não é necessário chamá-lo manualmente.

**Regras de processamento:**

- Apenas eventos `message_created` são processados.
- Mensagens do tipo `activity` são ignoradas.
- Mensagens `incoming` (contato) e `outgoing` (atendente) são **ambas registradas**.
- Mensagens **privadas** (`private: true`) são salvas no banco com flag `isPrivate: true`.
- A conversa **deve** possuir o atributo `custom_attributes.protocolo_azapfy` — caso contrário a mensagem é ignorada (sem protocolo = sem sessão aberta).
- Mensagens com conteúdo vazio são ignoradas.
Mensagens com conteúdo vazio são ignoradas.

**[NOVO]** Mensagens privadas contendo `#abertura_chamado`:
  - São processadas ANTES do translator.
  - O controller detecta a tag e emite o evento `abertura_chamado.requested`.
  - O módulo `abertura-chamado` faz o parse, chama a API externa, vincula o protocolo e envia confirmação na conversa.
  - Permite abertura de chamado mesmo sem protocolo vinculado previamente.

**Camada de tradução:** O payload bruto do Chatwoot é convertido para a estrutura interna `IWebhookMessageEvent` pelo translator (`chatwoot-payload.translator.ts`) **antes** de chegar ao service. Isso garante que alterações no formato do Chatwoot afetem apenas o translator.

**Responses possíveis:**

```json
{ "status": "ok" }
```

```json
{ "status": "ignored" }
```

```json
{ "status": "error_logged" }
```

| Status | Significado |
| --- | --- |
| `ok` | Mensagem processada e persistida com sucesso |
| `ignored` | Evento filtrado (não relevante, sem protocolo, activity, conteúdo vazio) |
| `error_logged` | Erro durante o processamento (logado internamente) |

---

## Tabela Resumo — Endpoints REST

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/session/link` | Vincula protocolo ↔ conversa Chatwoot |
| `DELETE` | `/session/:protocolo/link` | Remove vínculo Chatwoot |
| `GET` | `/session/:protocolo/chatwoot-status` | Consulta status do vínculo |
| `GET` | `/messages/:protocolo/history` | Retorna histórico de mensagens |
| `POST` | `/chatwoot/webhook` | Recebe webhooks do Chatwoot *(uso interno)* |

---

## WebSocket — Eventos

### Conexão

O WebSocket utiliza **Socket.IO** no namespace `/chat`.

| Item | Valor |
|---|---|
| **URL** | `ws://<host>:<PORT>/chat` |
| **Namespace** | `/chat` |
| **Transporte** | Socket.IO (WebSocket + fallback polling) |
| **CORS** | `*` (aberto) |
| **Ping Interval** | 25 segundos |
| **Ping Timeout** | 10 segundos |

**Exemplo de conexão (JavaScript):**

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('Conectado:', socket.id);
});
```

---

### Eventos Cliente → Servidor

#### `join_room`

Entra na sala de um protocolo. Necessário para receber mensagens em tempo real daquele atendimento.

**Payload:**

```json
{ "room": "ZPRS25207143" }
```

**Resposta automática:** evento `joined_room`

---

#### `leave_room`

Sai de uma sala.

**Payload:**

```json
{ "room": "ZPRS25207143" }
```

---

#### `get_history`

Solicita o histórico de mensagens de um protocolo via WebSocket.

**Payload:**

```json
{ "room": "ZPRS25207143" }
```

**Resposta automática:** evento `chat_history`

---

#### `send_message`

Envia uma mensagem a partir do front-end interno. A mensagem é persistida no banco e, se houver vínculo com o Chatwoot, é automaticamente espelhada para lá.

**Payload:**

```json
{
  "protocolo": "ZPRS25207143",
  "mensagem": "Olá, tudo bem?",
  "reme": "gugupenido@gmail.com",
  "dest": "13021166652",
  "autor": "GUSTAVO MARCELO",
  "isInterno": false
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `protocolo` | `string` | ✅ | Protocolo do ticket |
| `mensagem` | `string` | ✅ | Conteúdo da mensagem |
| `reme` | `string` | ✅ | Identificador do remetente |
| `dest` | `string` | ✅ | Identificador do destinatário |
| `autor` | `string` | ✅ | Nome de exibição do autor |
| `isInterno` | `boolean` | ❌ | `true` = mensagem interna (só atendentes). Default: `false` |

**Resposta automática:** evento `message_sent` (para o remetente) + `new_message` (broadcast para a sala)

---

### Eventos Servidor → Cliente

#### `joined_room`

Confirmação de que o cliente entrou na sala.

```json
{ "room": "ZPRS25207143" }
```

---

#### `new_message`

Nova mensagem recebida na sala (pode vir do front-end ou do Chatwoot).

```json
{
  "reme": "13021166652",
  "dest": "gugupenido@gmail.com",
  "dt_env": "2026-02-23T10:30:00.000Z",
  "isInterno": false,
  "autor": "LÍVIA ALVES",
  "mensagem": "Olá, preciso de ajuda",
  "chatwoot_message_id": 99999,
  "source": "chatwoot"
}
```

---

#### `message_sent`

Confirmação de que a mensagem enviada via `send_message` foi processada.

```json
{
  "protocolo": "ZPRS25207143",
  "status": "synced"
}
```

| Valor de `status` | Significado |
|---|---|
| `synced` | Mensagem salva e enviada ao Chatwoot com sucesso |
| `sync_failed` | Mensagem salva, mas falha ao enviar ao Chatwoot |
| `no_chatwoot_link` | Mensagem salva, sem vínculo Chatwoot ativo |

---

#### `message_error`

Erro ao processar uma operação (enviar mensagem ou buscar histórico).

```json
{
  "error": "Protocolo not found: ZPRS25207143",
  "protocolo": "ZPRS25207143"
}
```

---

#### `chat_history`

Resposta ao evento `get_history` — retorna o histórico completo de mensagens.

```json
{
  "protocolo": "ZPRS25207143",
  "messages": [
    { "reme": "...", "dest": "...", "mensagem": "...", "..." : "..." }
  ]
}
```

---

### Tabela Resumo — WebSocket

| Direção | Evento | Payload | Descrição |
|---|---|---|---|
| Cliente → Servidor | `join_room` | `{ room }` | Entrar na sala de um protocolo |
| Cliente → Servidor | `leave_room` | `{ room }` | Sair da sala |
| Cliente → Servidor | `get_history` | `{ room }` | Solicitar histórico de mensagens |
| Cliente → Servidor | `send_message` | `CreateMessageDto` | Enviar mensagem |
| Servidor → Cliente | `joined_room` | `{ room }` | Confirmação de entrada na sala |
| Servidor → Cliente | `new_message` | `IChatMessage` | Nova mensagem na sala |
| Servidor → Cliente | `message_sent` | `{ protocolo, status }` | Confirmação de envio |
| Servidor → Cliente | `message_error` | `{ error, protocolo }` | Erro no processamento |
| Servidor → Cliente | `chat_history` | `{ protocolo, messages[] }` | Histórico de mensagens |

---

## Modelos de Dados

### IChatMessage

Objeto de mensagem presente no array `chat[]` do protocolo.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `reme` | `string` | ✅ | Identificador do remetente |
| `dest` | `string` | ✅ | Identificador do destinatário |
| `dt_env` | `ISO 8601` | ✅ | Data/hora de envio |
| `isInterno` | `boolean` | ✅ | Se é mensagem interna |
| `autor` | `string` | ✅ | Nome de exibição do autor |
| `mensagem` | `string` | ✅ | Conteúdo textual |
| `isPrivate` | `boolean` | ❌ | `true` se é mensagem privada (nota interna entre atendentes). Default: `false` |
| `chatwoot_message_id` | `integer` | ❌ | ID da mensagem no Chatwoot |
| `source` | `string` | ❌ | `"chatwoot"` ou `"internal"` |
| `chatwoot_sync_failed` | `boolean` | ❌ | `true` se falhou ao sincronizar |

### IWebhookMessageEvent

Estrutura interna agnóstica ao provedor, gerada pelo translator a partir do payload externo. O service trabalha exclusivamente com esta interface.

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `event` | `string` | ✅ | Tipo do evento (ex: `message_created`) |
| `externalMessageId` | `integer` | ❌ | ID da mensagem no provedor externo |
| `content` | `string` | ✅ | Conteúdo textual da mensagem |
| `messageType` | `string` | ✅ | `"incoming"` ou `"outgoing"` |
| `isPrivate` | `boolean` | ✅ | Se é mensagem privada |
| `protocolo` | `string` | ✅ | Protocolo vinculado à conversa |
| `conversationId` | `integer` | ✅ | ID da conversa no provedor externo |
| `sender.identifier` | `string` | ✅ | Identificador único do remetente |
| `sender.name` | `string` | ✅ | Nome de exibição do remetente |

### IAberturaChamadoParsed

Estrutura extraída da mensagem privada com `#abertura_chamado`.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `nome` | `string` | ✅ | Nome do relator |
| `grupoEmpresa` | `string` | ✅ | Grupo empresarial |
| `email` | `string` | ✅ | Email do relator |
| `whatsApp` | `string` | ✅ | Telefone (WhatsApp) |
| `resumoChamado` | `string` | ✅ | Resumo do chamado |
| `descricaoChamado` | `string` | ✅ | Descrição detalhada |
| `categoria` | `string` | ✅ | Categoria |

### IAberturaChamadoRequest

Body enviado à API externa de abertura de chamado.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `nome_relator` | `string` | ✅ | Nome do relator |
| `cod_relator` | `string` | ✅ | Código/email do relator |
| `contato_relator.email` | `string` | ✅ | Email |
| `contato_relator.telefone` | `string` | ✅ | Telefone |
| `grupo_emp` | `string` | ✅ | Grupo empresarial |
| `dt_abertura` | `string` | ✅ | Data/hora de abertura |
| `incidente.resumo` | `string` | ✅ | Resumo |
| `incidente.descricao` | `string` | ✅ | Descrição |
| `incidente.categoria` | `string` | ✅ | Categoria |
| ... | ... | ... | Demais campos conforme API |

### IAberturaChamadoResponse

Resposta esperada da API de abertura de chamado.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `protocolo` | `string` | ✅ | Protocolo gerado |

### IChatwootLink

Sub-objeto `chatwoot` embutido no documento de protocolo.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `conversation_id` | `integer` | ✅ | ID da conversa no Chatwoot |
| `contact_id` | `integer` | ✅ | ID do contato no Chatwoot |
| `inbox_id` | `integer` | ❌ | ID do inbox no Chatwoot |
| `linked` | `boolean` | ✅ | Se o vínculo está ativo |

---

## Códigos de Erro

| HTTP Code | Significado |
|---|---|
| `200` | Sucesso |
| `400` | Erro de validação (campo obrigatório ausente ou tipo inválido) |
| `404` | Protocolo não encontrado |
| `500` | Erro interno do servidor |

Formato padrão de erro:

```json
{
  "statusCode": 400,
  "timestamp": "2026-02-23T12:00:00.000Z",
  "path": "/session/link",
  "message": "protocolo must be a string"
}
```

---

## Exemplos de Uso

### Fluxo completo — Front-end

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  transports: ['websocket'],
});

// 1. Conectar
socket.on('connect', () => {
  console.log('Conectado:', socket.id);

  // 2. Entrar na sala do protocolo
  socket.emit('join_room', { room: 'ZPRS25207143' });
});

// 3. Confirmar entrada
socket.on('joined_room', (data) => {
  console.log('Entrou na sala:', data.room);

  // 4. Solicitar histórico
  socket.emit('get_history', { room: 'ZPRS25207143' });
});

// 5. Receber histórico
socket.on('chat_history', (data) => {
  console.log('Histórico:', data.messages);
});

// 6. Escutar novas mensagens em tempo real
socket.on('new_message', (message) => {
  console.log('Nova mensagem:', message);
});

// 7. Enviar mensagem
socket.emit('send_message', {
  protocolo: 'ZPRS25207143',
  mensagem: 'Olá, tudo bem?',
  reme: 'gugupenido@gmail.com',
  dest: '13021166652',
  autor: 'GUSTAVO MARCELO',
  isInterno: false,
});

// 8. Confirmar envio
socket.on('message_sent', (data) => {
  console.log('Enviado:', data.status); // 'synced' | 'sync_failed' | 'no_chatwoot_link'
});

// 9. Tratar erros
socket.on('message_error', (data) => {
  console.error('Erro:', data.error);
});
```

### Vincular protocolo ao Chatwoot (REST)

```bash
curl -X POST http://localhost:3000/session/link \
  -H "Content-Type: application/json" \
  -d '{
    "protocolo": "ZPRS25207143",
    "conversation_id": 12345,
    "contact_id": 678,
    "inbox_id": 1
  }'
```

### Consultar status do vínculo (REST)

```bash
curl http://localhost:3000/session/ZPRS25207143/chatwoot-status
```

### Remover vínculo (REST)

```bash
curl -X DELETE http://localhost:3000/session/ZPRS25207143/link
```

### Buscar histórico via REST

```bash
curl http://localhost:3000/messages/ZPRS25207143/history
```
