# Chatservice — Guia de Arquitetura e Desenvolvimento

> **Última atualização:** 2026-02-24
> Este documento é a referência canônica para qualquer agente ou desenvolvedor que for manipular o projeto. Leia-o integralmente antes de fazer alterações.

---

## 1. Visão Geral

O **Chatservice** é um middleware de backend que realiza a **sincronização bidirecional** entre o sistema interno de chat da empresa e a plataforma **Chatwoot**. Ele atua como uma sala centralizada onde mensagens de vários canais são registradas e espelhadas em tempo real.

### Premissa fundamental

O Chatservice **NÃO** possui collections próprias de mensagens. Ele opera sobre a **collection existente `protocolos`** do sistema legado, adicionando mensagens ao array `chat[]` embutido em cada documento e um sub-objeto `chatwoot` para o vínculo com a plataforma.

### Stack Tecnológico

| Tecnologia | Finalidade |
|---|---|
| **NestJS** (TypeScript) | Framework backend |
| **MongoDB** (Mongoose) | Banco de dados (collection `protocolos` existente) |
| **WebSockets** (Socket.IO) | Comunicação em tempo real com o front-end |
| **Redis** (ioredis) | Adapter Pub/Sub para escalabilidade do WebSocket |
| **Axios** (`@nestjs/axios`) | Cliente HTTP para API REST do Chatwoot |
| **EventEmitter** (`@nestjs/event-emitter`) | Desacoplamento interno entre módulos |
| **class-validator / class-transformer** | Validação e transformação de DTOs |

---

## 2. Modelo de Dados

O Chatservice opera sobre o documento de protocolo existente. As adições feitas pelo Chatservice estão marcadas com `[NOVO]`.

### Documento de Protocolo (collection `protocolos`)

```json
{
  "_id": ObjectId,
  "protocolo": "ZPRS25207143",          // Identificador único — chave de correlação
  "grupo_emp": "AZAPERS",
  "nome_relator": "GUSTAVO MARCELO",
  "cod_relator": "gugupenido@gmail.com",
  "contato_relator": { "email": "...", "telefone": "..." },
  "status": "PENDENTE",
  "incidente": { ... },
  // ... demais campos existentes ...

  "chatwoot": {                          // [NOVO] Sub-objeto de vínculo com Chatwoot
    "conversation_id": 12345,
    "contact_id": 678,
    "inbox_id": 1,
    "linked": true
  },

  "chat": [                             // Array existente — mensagens embutidas
    {
      "reme": "13021166652",
      "dest": "gugupenido@gmail.com",
      "dt_env": ISODate,
      "isInterno": false,
      "autor": "LÍVIA ALVES",
      "mensagem": "a",
      "isPrivate": false,                   // [NOVO] Flag de mensagem privada
      "chatwoot_message_id": 99999,      // [NOVO] ID da mensagem no Chatwoot
      "source": "internal",              // [NOVO] 'chatwoot' | 'internal'
      "chatwoot_sync_failed": false      // [NOVO] Flag de falha de sincronização
    }
  ]
}
```

### Identificador de correlação

- O **`protocolo`** (ex: `ZPRS25207143`) é a chave que vincula um ticket interno a uma conversa no Chatwoot.
- O campo **`chatwoot.conversation_id`** armazena o ID da conversa correspondente no Chatwoot.
- Cada sala WebSocket usa o `protocolo` como nome da room.

---

## 3. Fluxo de Dados

```
┌─────────────┐   webhook POST    ┌──────────────────────────────────────────┐   WebSocket emit    ┌─────────────┐
│             │ ────────────────► │              CHATSERVICE                 │ ──────────────────► │             │
│   CHATWOOT  │                   │                                          │                     │  FRONT-END  │
│             │ ◄──────────────── │  Controllers ► Services ► Repositories   │ ◄────────────────── │   INTERNO   │
└─────────────┘   HTTP POST API   │          ▼                               │   WebSocket event   └─────────────┘
                                  │   MongoDB (collection protocolos)         │
                                  │   Redis Pub/Sub                          │
                                  └──────────────────────────────────────────┘
```

### Fluxo Chatwoot → Interno

1. Chatwoot envia webhook `POST /chatwoot/webhook` ao Chatservice.
2. `ChatwootWebhookController` recebe o payload (`ChatwootWebhookDto`).
3. O **translator** (`translateChatwootPayload`) converte o payload bruto para `IWebhookMessageEvent`.
   - Filtra eventos não relevantes (retorna `null` para eventos ignorados).
   - Requer `custom_attributes.protocolo_azapfy` — sem protocolo = mensagem ignorada.
   - Aceita mensagens `incoming` e `outgoing` (atendentes também são registrados).
   - Mensagens privadas são aceitas e marcadas com `isPrivate: true`.
4. O controller passa o `IWebhookMessageEvent` ao `ChatwootWebhookService`.
5. O service (agnóstico ao Chatwoot) valida o protocolo via `SessionService`.
6. `MessagesService` faz `$push` da mensagem no array `chat[]` do documento.
7. Evento `message.created` é emitido via `EventEmitter`.
8. `ChatGateway` captura o evento e emite via WebSocket para os clientes na sala do protocolo.

> **Camada de tradução:** Se o Chatwoot alterar o formato do payload, apenas o translator precisa ser atualizado. O service e o restante do sistema permanecem intactos.

### Fluxo Interno → Chatwoot

1. Front-end envia mensagem via WebSocket (evento `send_message`) com o `protocolo`.
2. `ChatGateway` valida e delega ao `MessagesService`.
3. `MessagesService` faz `$push` da mensagem no array `chat[]`.
4. Se o protocolo possui `chatwoot.linked: true`, `ChatwootApiService` envia via POST à API REST.
5. Em caso de falha, a mensagem é marcada com `chatwoot_sync_failed: true`.

---

## 4. Estrutura de Pastas

```
src/
├── main.ts
├── app.module.ts                         # Módulo raiz — importa todos os feature modules
│
├── config/                               # Configuração centralizada
│   ├── config.module.ts
│   ├── app.config.ts                     # Variáveis de ambiente tipadas (porta, etc.)
│   ├── database.config.ts                # Config MongoDB
│   ├── redis.config.ts                   # Config Redis
│   └── chatwoot.config.ts               # Base URL, API token, Account ID
│
├── common/                               # Shared: DTOs, interfaces, filtros
│   ├── interfaces/
│   │   ├── message.interface.ts          # IChatMessage, IChatwootLink
│   │   ├── session-mapping.interface.ts  # IProtocolo
│   │   └── webhook-event.interface.ts    # IWebhookMessageEvent (estrutura interna agnóstica)
│   ├── dto/
│   │   ├── create-message.dto.ts         # DTO de criação vindo do front-end
│   │   ├── chatwoot-webhook.dto.ts       # DTO que representa o payload bruto do webhook Chatwoot
│   │   └── link-chatwoot.dto.ts          # DTO de vínculo protocolo ↔ Chatwoot
│   └── filters/
│       └── http-exception.filter.ts      # Filtro global de exceções
│
├── database/                             # Schema Mongoose + módulo de conexão
│   ├── database.module.ts
│   └── schemas/
│       └── protocolo.schema.ts           # Schema do documento existente + campos Chatwoot
│
├── chatwoot/                             # Módulo de integração com Chatwoot
│   ├── chatwoot.module.ts
│   ├── chatwoot-webhook.controller.ts    # POST /chatwoot/webhook (recebe eventos)
│   ├── chatwoot-payload.translator.ts    # Traduz payload Chatwoot → IWebhookMessageEvent
│   ├── chatwoot-api.service.ts           # HttpService wrapper p/ API REST do Chatwoot
│   └── chatwoot-webhook.service.ts       # Processa IWebhookMessageEvent (agnóstico ao Chatwoot)
│
├── messages/                             # Módulo core de mensagens
│   ├── messages.module.ts
│   ├── messages.controller.ts            # GET /messages/:protocolo/history
│   ├── messages.service.ts               # Orquestra persistência + dispatch
│   └── messages.repository.ts            # $push no array chat[] do protocolo
│
├── session/                              # Módulo de vínculo protocolo ↔ Chatwoot
│   ├── session.module.ts
│   ├── session.controller.ts             # POST /session/link, DELETE, GET status
│   ├── session.service.ts                # Busca/vincula protocolo com Chatwoot
│   └── session.repository.ts            # Acesso ao sub-objeto chatwoot do documento
│
└── chat/                                 # Módulo WebSocket (Gateway)
    ├── chat.module.ts
    ├── chat.gateway.ts                   # @WebSocketGateway — bidirecional
    └── chat.service.ts                   # Lógica de emissão/recepção WS
```

---

## 5. Módulos NestJS e Responsabilidades

| Módulo | Tipo | Responsabilidade |
|---|---|---|
| **AppModule** | Root | Importa todos os módulos. Registra filtros/pipes globais. |
| **ConfigModule** | Global | Carrega `.env`, expõe configs tipadas via `ConfigService`. |
| **DatabaseModule** | Global | Conexão Mongoose com MongoDB, registra schema `Protocolo`. |
| **ChatwootModule** | Feature | Controller do webhook + Service de chamada à API do Chatwoot. |
| **MessagesModule** | Feature | `$push` no array `chat[]` e orquestração de mensagens. |
| **SessionModule** | Feature | Vínculo do `protocolo` com `chatwoot.conversation_id`. |
| **ChatModule** | Feature | WebSocket Gateway + emissão em tempo real via Redis adapter. |

---

## 6. Grafo de Dependências entre Módulos

```
AppModule
 ├── ConfigModule        (global — disponível em todos)
 ├── DatabaseModule      (global — disponível em todos)
 ├── EventEmitterModule  (global — barramento de eventos interno)
 ├── ChatwootModule
 │    └── imports: MessagesModule, SessionModule
 ├── MessagesModule
 │    └── exports: MessagesService
 │    └── (emite eventos via EventEmitter — sem import direto do ChatModule)
 ├── SessionModule
 │    └── exports: SessionService
 └── ChatModule
      └── imports: MessagesModule, SessionModule, ChatwootModule
      └── (escuta eventos via EventEmitter — sem dependência circular)
```

### Resolução de dependência circular

**Solução adotada:** `@nestjs/event-emitter`. O `MessagesService` emite um evento (`message.created`) após persistir; o `ChatGateway` escuta esse evento e faz o broadcast. Isso elimina dependência circular entre os módulos.

---

## 7. Regras de Negócio

### 7.1 Filtragem de Webhooks

- Apenas eventos do tipo `message_created` do Chatwoot devem gerar persistência e emissão.
- Mensagens com `message_type: "activity"` são ignoradas (eventos de sistema).
- Mensagens `incoming` (contato) e `outgoing` (atendente) são **ambas registradas**.
- Mensagens **privadas** (`private: true`) são salvas com flag `isPrivate: true`.
- O campo `content` vazio deve ser descartado.
- Mensagens **sem `protocolo_azapfy`** no `custom_attributes` da conversa são ignoradas (sem protocolo = sem sessão aberta).

### 7.1.1 Camada de Tradução (Translator)

- O payload bruto do Chatwoot (`ChatwootWebhookDto`) é convertido para `IWebhookMessageEvent` pelo translator (`chatwoot-payload.translator.ts`) **antes** de chegar ao service.
- O service (`ChatwootWebhookService`) trabalha **exclusivamente** com `IWebhookMessageEvent`, sem nenhuma referência ao formato do Chatwoot.
- Se o Chatwoot alterar o formato do payload, apenas o translator precisa ser atualizado — o restante do sistema permanece intacto.
- Toda filtragem e mapeamento de campos do Chatwoot acontece no translator, nunca no service.

### 7.2 Vínculo Protocolo ↔ Chatwoot

- O vínculo é armazenado no sub-objeto `chatwoot` do documento de protocolo.
- Um protocolo pode ter apenas **um vínculo ativo** com uma conversa do Chatwoot.
- Se um webhook chegar para um `conversation_id` sem protocolo vinculado, a mensagem é **descartada** (log de warning).
- O vínculo é criado via `SessionService.linkChatwoot(protocolo, data)`.

### 7.3 Persistência de Mensagens

- Toda mensagem (inbound ou outbound) é adicionada via `$push` ao array `chat[]` do documento de protocolo.
- Mensagens mantêm a estrutura existente (`reme`, `dest`, `dt_env`, `isInterno`, `autor`, `mensagem`).
- Campo `isPrivate` indica nota interna entre atendentes (visível apenas no painel, não para o contato).
- Campos Chatwoot (`chatwoot_message_id`, `source`, `chatwoot_sync_failed`) são **opcionais** — presentes apenas em mensagens que passam pelo Chatservice.

### 7.4 Prevenção de Duplicatas

- Mensagens do Chatwoot possuem um `id` único. Antes de persistir, verificar se já existe mensagem com o mesmo `chatwoot_message_id` no array `chat[]` para evitar duplicatas em caso de reenvio de webhook.

### 7.5 Tratamento de Erros

- Falhas na API do Chatwoot (timeout, 5xx) devem ser logadas e **não** devem derrubar o fluxo WebSocket. Mensagem é salva localmente e marcada com flag `chatwoot_sync_failed: true` para retry posterior.
- Quedas de conexão WebSocket devem ser tratadas com reconnect automático no lado do Gateway (heartbeat/ping configurados).

### 7.6 Schema `strict: false`

- O schema do Protocolo tem `strict: false` para preservar todos os campos existentes do documento que o Chatservice não precisa manipular diretamente.

---

## 8. Eventos Internos (EventEmitter)

| Evento | Emissor | Ouvinte | Payload |
|---|---|---|---|
| `message.created` | `MessagesService` | `ChatGateway` | `{ message: IChatMessage, room: string }` |
| `message.sync_failed` | `ChatwootApiService` | `ChatGateway` | `{ protocolo: string, error: string }` |

---

## 9. WebSocket — Eventos

### Servidor → Cliente

| Evento | Descrição | Payload |
|---|---|---|
| `new_message` | Nova mensagem na sala | `IChatMessage` |
| `message_sent` | Confirmação de envio | `{ protocolo, status }` |
| `message_error` | Erro no envio | `{ error, protocolo }` |
| `joined_room` | Confirmação de entrada na sala | `{ room }` |
| `chat_history` | Histórico de mensagens solicitado | `{ protocolo, messages: IChatMessage[] }` |

### Cliente → Servidor

| Evento | Descrição | Payload |
|---|---|---|
| `send_message` | Enviar mensagem | `CreateMessageDto` |
| `join_room` | Entrar na sala de um protocolo | `{ room: protocolo }` |
| `leave_room` | Sair da sala | `{ room: protocolo }` |
| `get_history` | Solicitar histórico de chat | `{ room: protocolo }` |

---

## 9.1. Endpoints REST

### Session (vínculo Chatwoot)

| Método | Rota | Descrição | Body / Params |
|---|---|---|---|
| `POST` | `/session/link` | Vincula protocolo a conversa Chatwoot | `LinkChatwootDto { protocolo, conversation_id, contact_id, inbox_id? }` |
| `DELETE` | `/session/:protocolo/link` | Remove vínculo Chatwoot | `protocolo` via param |
| `GET` | `/session/:protocolo/chatwoot-status` | Status do vínculo | `protocolo` via param |

### Messages (histórico)

| Método | Rota | Descrição | Params |
|---|---|---|---|
| `GET` | `/messages/:protocolo/history` | Retorna histórico de chat | `protocolo` via param |

---

## 10. Padrões e Convenções de Código

### 10.1 Nomenclatura

- **Arquivos:** `kebab-case` (ex: `chatwoot-api.service.ts`)
- **Classes:** `PascalCase` (ex: `ChatwootApiService`)
- **Interfaces:** Prefixo `I` (ex: `IChatMessage`, `IProtocolo`)
- **DTOs:** Sufixo `Dto` (ex: `CreateMessageDto`)

### 10.2 Princípios Arquiteturais

- **SOLID:** Cada classe tem uma única responsabilidade. Services não acessam o banco diretamente — usam Repositories.
- **Injeção de Dependências:** Todos os services são injetáveis via decorador `@Injectable()`. Nunca instanciar services com `new`.
- **Camadas:**
  - `Controller / Gateway` → Recebe entrada, valida, delega ao Service.
  - `Service` → Lógica de negócio e orquestração.
  - `Repository` → Acesso exclusivo ao banco de dados.
- **DTOs com validação:** Todo input externo (HTTP body, WebSocket payload) deve ser validado com `class-validator`.
- **Operações no documento existente:** Usar `$push` para adicionar ao array `chat[]`, `$set` para o sub-objeto `chatwoot`. Nunca substituir o documento inteiro.

### 10.3 Tratamento de Erros

- Usar `HttpException` e suas subclasses para erros HTTP.
- Usar filtro global `HttpExceptionFilter` para padronizar respostas de erro.
- Logar todos os erros com o `Logger` nativo do NestJS.
- Nunca expor stack traces ou detalhes internos ao cliente.

### 10.4 Configuração

- Todas as variáveis de ambiente devem ser acessadas via `ConfigService` — nunca `process.env` direto.
- Arquivo `.env` na raiz do projeto (não versionado).
- Arquivo `.env.example` com todas as variáveis necessárias (versionado).

---

## 11. Variáveis de Ambiente Esperadas

```env
# App
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/chatservice

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Chatwoot
CHATWOOT_BASE_URL=https://app.chatwoot.com
CHATWOOT_API_TOKEN=seu_token_aqui
CHATWOOT_ACCOUNT_ID=1
CHATWOOT_INBOX_ID=1
```

---

## 12. Dependências do Projeto

### Produção

```
@nestjs/common @nestjs/core @nestjs/platform-express
@nestjs/mongoose mongoose
@nestjs/websockets @nestjs/platform-socket.io
@nestjs/config
@nestjs/axios axios
@nestjs/event-emitter
ioredis
class-validator class-transformer
reflect-metadata rxjs
```

### Desenvolvimento

```
@nestjs/cli @nestjs/schematics @nestjs/testing
@types/express @types/jest @types/node @types/supertest
eslint prettier jest ts-jest ts-node typescript
```

---

## 13. Checklist de Qualidade para Alterações

Antes de submeter qualquer alteração, verifique:

- [ ] Segue a estrutura de pastas definida na Seção 4.
- [ ] Respeita a separação de camadas (Controller → Service → Repository).
- [ ] DTOs possuem validação com `class-validator`.
- [ ] Nenhum `process.env` direto — usar `ConfigService`.
- [ ] Nenhum `new Service()` — usar injeção de dependências.
- [ ] Eventos internos usam `EventEmitter`, não imports cruzados.
- [ ] Erros são tratados e logados adequadamente.
- [ ] Interfaces estão em `common/interfaces/`, não nos módulos.
- [ ] Schema está em `database/schemas/`, não nos módulos.
- [ ] Sem dependências circulares entre módulos.
- [ ] Operações no MongoDB usam `$push`/`$set` — nunca substituir documento inteiro.
- [ ] Campo `strict: false` no schema preserva dados existentes do sistema legado.
