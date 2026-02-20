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
var ChatwootWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatwootWebhookController = void 0;
const common_1 = require("@nestjs/common");
const chatwoot_webhook_service_js_1 = require("./chatwoot-webhook.service.js");
const chatwoot_webhook_dto_js_1 = require("../common/dto/chatwoot-webhook.dto.js");
let ChatwootWebhookController = ChatwootWebhookController_1 = class ChatwootWebhookController {
    chatwootWebhookService;
    logger = new common_1.Logger(ChatwootWebhookController_1.name);
    constructor(chatwootWebhookService) {
        this.chatwootWebhookService = chatwootWebhookService;
    }
    async handleWebhook(payload) {
        this.logger.log(`Webhook received: event=${payload.event}`);
        try {
            await this.chatwootWebhookService.processWebhook(payload);
            return { status: 'ok' };
        }
        catch (error) {
            this.logger.error('Error processing webhook', error instanceof Error ? error.stack : String(error));
            return { status: 'error_logged' };
        }
    }
};
exports.ChatwootWebhookController = ChatwootWebhookController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chatwoot_webhook_dto_js_1.ChatwootWebhookDto]),
    __metadata("design:returntype", Promise)
], ChatwootWebhookController.prototype, "handleWebhook", null);
exports.ChatwootWebhookController = ChatwootWebhookController = ChatwootWebhookController_1 = __decorate([
    (0, common_1.Controller)('chatwoot'),
    __metadata("design:paramtypes", [chatwoot_webhook_service_js_1.ChatwootWebhookService])
], ChatwootWebhookController);
//# sourceMappingURL=chatwoot-webhook.controller.js.map