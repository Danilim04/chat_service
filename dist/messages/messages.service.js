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
var MessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const messages_repository_js_1 = require("./messages.repository.js");
let MessagesService = MessagesService_1 = class MessagesService {
    messagesRepository;
    eventEmitter;
    logger = new common_1.Logger(MessagesService_1.name);
    constructor(messagesRepository, eventEmitter) {
        this.messagesRepository = messagesRepository;
        this.eventEmitter = eventEmitter;
    }
    async handleInboundMessage(data) {
        if (data.chatwootMessageId) {
            const exists = await this.messagesRepository.hasChatwootMessage(data.protocolo, data.chatwootMessageId);
            if (exists) {
                this.logger.warn(`Duplicate message detected: chatwoot_message_id=${data.chatwootMessageId}. Skipping.`);
                return null;
            }
        }
        const chatMessage = {
            reme: data.senderIdentifier,
            dest: data.destIdentifier,
            dt_env: new Date(),
            isInterno: false,
            autor: data.senderName,
            mensagem: data.content,
            chatwoot_message_id: data.chatwootMessageId,
            source: 'chatwoot',
        };
        const updatedDoc = await this.messagesRepository.pushMessage(data.protocolo, chatMessage);
        if (!updatedDoc) {
            this.logger.error(`Failed to push inbound message: protocolo=${data.protocolo} not found`);
            return null;
        }
        this.logger.log(`Inbound message persisted: protocolo=${data.protocolo}, autor=${data.senderName}`);
        this.eventEmitter.emit('message.created', {
            message: chatMessage,
            room: data.protocolo,
        });
        return chatMessage;
    }
    async handleOutboundMessage(data) {
        const chatMessage = {
            reme: data.senderIdentifier,
            dest: data.destIdentifier,
            dt_env: new Date(),
            isInterno: data.isInterno ?? false,
            autor: data.senderName,
            mensagem: data.content,
            source: 'internal',
        };
        const updatedDoc = await this.messagesRepository.pushMessage(data.protocolo, chatMessage);
        if (!updatedDoc) {
            this.logger.error(`Failed to push outbound message: protocolo=${data.protocolo} not found`);
            return null;
        }
        this.logger.log(`Outbound message persisted: protocolo=${data.protocolo}, autor=${data.senderName}`);
        return chatMessage;
    }
    async markSyncFailed(protocolo, error) {
        this.logger.error(`Chatwoot sync failed for protocolo=${protocolo}: ${error}`);
        await this.messagesRepository.markLastMessageSyncFailed(protocolo, true);
    }
    async markSyncSuccess(protocolo) {
        await this.messagesRepository.markLastMessageSyncFailed(protocolo, false);
    }
    async getChatHistory(protocolo) {
        return this.messagesRepository.getChatHistory(protocolo);
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = MessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [messages_repository_js_1.MessagesRepository,
        event_emitter_1.EventEmitter2])
], MessagesService);
//# sourceMappingURL=messages.service.js.map