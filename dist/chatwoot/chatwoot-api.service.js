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
var ChatwootApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatwootApiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const event_emitter_1 = require("@nestjs/event-emitter");
let ChatwootApiService = ChatwootApiService_1 = class ChatwootApiService {
    httpService;
    configService;
    eventEmitter;
    logger = new common_1.Logger(ChatwootApiService_1.name);
    baseUrl;
    apiToken;
    accountId;
    constructor(httpService, configService, eventEmitter) {
        this.httpService = httpService;
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.baseUrl = this.configService.get('chatwoot.baseUrl');
        this.apiToken = this.configService.get('chatwoot.apiToken');
        this.accountId = this.configService.get('chatwoot.accountId');
    }
    async sendMessage(conversationId, content, protocolo) {
        const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}/conversations/${conversationId}/messages`;
        console.log(`Sending message to Chatwoot conversationId=${conversationId}, protocolo=${protocolo}, body: ${content}, url=${url},token=${this.apiToken}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, {
                content,
                message_type: 'outgoing',
                private: false,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    api_access_token: this.apiToken,
                },
                timeout: 10000,
            }));
            this.logger.log(`Message sent to Chatwoot: conversationId=${conversationId}, chatwootMessageId=${response.data?.id}`);
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to send message to Chatwoot: conversationId=${conversationId}, error=${errorMessage}`);
            if (protocolo) {
                this.eventEmitter.emit('message.sync_failed', {
                    protocolo,
                    error: errorMessage,
                });
            }
            return null;
        }
    }
    async updateConversationCustomAttributes(conversationId, customAttributes) {
        const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}/conversations/${conversationId}/custom_attributes`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, { custom_attributes: customAttributes }, {
                headers: {
                    'Content-Type': 'application/json',
                    api_access_token: this.apiToken,
                },
                timeout: 10000,
            }));
            this.logger.log(`Custom attributes updated on Chatwoot conversation=${conversationId}`);
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to update custom attributes on Chatwoot conversation=${conversationId}: ${errorMessage}`);
            return null;
        }
    }
    async getConversation(conversationId) {
        const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}/conversations/${conversationId}`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
                headers: { api_access_token: this.apiToken },
                timeout: 10000,
            }));
            return response.data;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to get conversation from Chatwoot: ${errorMessage}`);
            return null;
        }
    }
};
exports.ChatwootApiService = ChatwootApiService;
exports.ChatwootApiService = ChatwootApiService = ChatwootApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        event_emitter_1.EventEmitter2])
], ChatwootApiService);
//# sourceMappingURL=chatwoot-api.service.js.map