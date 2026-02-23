"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const socket_io_1 = require("socket.io");
const chat_service_js_1 = require("./chat.service.js");
const messages_service_js_1 = require("../messages/messages.service.js");
const session_service_js_1 = require("../session/session.service.js");
const chatwoot_api_service_js_1 = require("../chatwoot/chatwoot-api.service.js");
const create_message_dto_js_1 = require("../common/dto/create-message.dto.js");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    chatService;
    messagesService;
    sessionService;
    chatwootApiService;
    server;
    logger = new common_1.Logger(ChatGateway_1.name);
    constructor(chatService, messagesService, sessionService, chatwootApiService) {
        this.chatService = chatService;
        this.messagesService = messagesService;
        this.sessionService = sessionService;
        this.chatwootApiService = chatwootApiService;
    }
    afterInit(server) {
        this.chatService.setServer(server);
        this.logger.log('WebSocket Gateway initialized');
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleJoinRoom(client, data) {
        client.join(data.room);
        this.logger.log(`Client ${client.id} joined room: ${data.room}`);
        client.emit('joined_room', { room: data.room });
    }
    handleLeaveRoom(client, data) {
        client.leave(data.room);
        this.logger.log(`Client ${client.id} left room: ${data.room}`);
    }
    async handleGetHistory(client, data) {
        this.logger.log(`History requested by client ${client.id}: protocolo=${data.room}`);
        try {
            const TIMEOUT_MS = 15_000;
            const messages = await Promise.race([
                this.messagesService.getChatHistory(data.room),
                new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout: getChatHistory exceeded ${TIMEOUT_MS}ms`)), TIMEOUT_MS)),
            ]);
            client.emit('chat_history', { protocolo: data.room, messages });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error fetching history: ${errorMessage}`);
            client.emit('message_error', {
                error: errorMessage,
                protocolo: data.room,
            });
        }
    }
    async handleSendMessage(client, data) {
        this.logger.log(`Message received from client ${client.id}: protocolo=${data.protocolo}`);
        try {
            const protocoloDoc = await this.sessionService.getByProtocolo(data.protocolo);
            const chatMessage = await this.messagesService.handleOutboundMessage({
                protocolo: data.protocolo,
                content: data.mensagem,
                senderIdentifier: data.reme,
                destIdentifier: data.dest,
                senderName: data.autor,
                isInterno: data.isInterno,
            });
            if (!chatMessage) {
                client.emit('message_error', {
                    error: 'Failed to persist message',
                    protocolo: data.protocolo,
                });
                return;
            }
            let syncStatus = 'no_chatwoot_link';
            if (protocoloDoc.chatwoot?.linked && protocoloDoc.chatwoot.conversation_id) {
                const result = await this.chatwootApiService.sendMessage(protocoloDoc.chatwoot.conversation_id, data.mensagem, data.protocolo);
                if (result) {
                    await this.messagesService.markSyncSuccess(data.protocolo);
                    syncStatus = 'synced';
                }
                else {
                    syncStatus = 'sync_failed';
                }
            }
            client.emit('message_sent', {
                protocolo: data.protocolo,
                status: syncStatus,
            });
            this.chatService.emitToRoom(data.protocolo, 'new_message', chatMessage);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Error handling send_message: ${errorMessage}`);
            client.emit('message_error', {
                error: errorMessage,
                protocolo: data.protocolo,
            });
        }
    }
    handleMessageCreatedEvent(payload) {
        this.logger.debug(`Event message.created: broadcasting to room=${payload.room}`);
        this.chatService.handleNewMessage(payload);
    }
    async handleSyncFailedEvent(payload) {
        await this.messagesService.markSyncFailed(payload.protocolo, payload.error);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_history'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetHistory", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        create_message_dto_js_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, event_emitter_1.OnEvent)('message.created'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleMessageCreatedEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('message.sync_failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSyncFailedEvent", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/chat',
        pingInterval: 25000,
        pingTimeout: 10000,
    }),
    __metadata("design:paramtypes", [chat_service_js_1.ChatService,
        messages_service_js_1.MessagesService,
        session_service_js_1.SessionService,
        chatwoot_api_service_js_1.ChatwootApiService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map