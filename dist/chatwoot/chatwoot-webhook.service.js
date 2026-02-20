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
var ChatwootWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatwootWebhookService = void 0;
const common_1 = require("@nestjs/common");
const messages_service_js_1 = require("../messages/messages.service.js");
const session_service_js_1 = require("../session/session.service.js");
let ChatwootWebhookService = ChatwootWebhookService_1 = class ChatwootWebhookService {
    messagesService;
    sessionService;
    logger = new common_1.Logger(ChatwootWebhookService_1.name);
    constructor(messagesService, sessionService) {
        this.messagesService = messagesService;
        this.sessionService = sessionService;
    }
    async processWebhook(payload) {
        if (payload.event !== 'message_created') {
            this.logger.debug(`Ignoring event: ${payload.event}`);
            return;
        }
        if (payload.message_type === 'outgoing' ||
            payload.message_type === 'activity') {
            this.logger.debug(`Ignoring message_type=${payload.message_type} (anti-loop)`);
            return;
        }
        if (!payload.content || payload.content.trim() === '') {
            this.logger.debug('Ignoring empty content message');
            return;
        }
        if (!payload.conversation?.id) {
            this.logger.warn('Webhook missing conversation.id — skipping');
            return;
        }
        const conversationId = payload.conversation.id;
        const contactId = payload.conversation.contact_id ?? payload.sender?.id ?? 0;
        const protocoloDoc = await this.sessionService.getByChatwootConversationId(conversationId);
        if (!protocoloDoc) {
            this.logger.warn(`No protocolo linked to Chatwoot conversation_id=${conversationId} — skipping message`);
            return;
        }
        const protocolo = protocoloDoc.protocolo;
        await this.messagesService.handleInboundMessage({
            protocolo,
            content: payload.content,
            chatwootMessageId: payload.id,
            senderName: payload.sender?.name ?? 'Chatwoot',
            senderIdentifier: `chatwoot_${contactId}`,
            destIdentifier: protocoloDoc.cod_relator ?? protocolo,
        });
        this.logger.log(`Webhook processed: event=${payload.event}, protocolo=${protocolo}, conversation_id=${conversationId}`);
    }
};
exports.ChatwootWebhookService = ChatwootWebhookService;
exports.ChatwootWebhookService = ChatwootWebhookService = ChatwootWebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [messages_service_js_1.MessagesService,
        session_service_js_1.SessionService])
], ChatwootWebhookService);
//# sourceMappingURL=chatwoot-webhook.service.js.map