"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatwootModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const chatwoot_webhook_controller_js_1 = require("./chatwoot-webhook.controller.js");
const chatwoot_webhook_service_js_1 = require("./chatwoot-webhook.service.js");
const chatwoot_api_service_js_1 = require("./chatwoot-api.service.js");
const messages_module_js_1 = require("../messages/messages.module.js");
const session_module_js_1 = require("../session/session.module.js");
let ChatwootModule = class ChatwootModule {
};
exports.ChatwootModule = ChatwootModule;
exports.ChatwootModule = ChatwootModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.register({ timeout: 10000 }),
            messages_module_js_1.MessagesModule,
            session_module_js_1.SessionModule,
        ],
        controllers: [chatwoot_webhook_controller_js_1.ChatwootWebhookController],
        providers: [chatwoot_webhook_service_js_1.ChatwootWebhookService, chatwoot_api_service_js_1.ChatwootApiService],
        exports: [chatwoot_api_service_js_1.ChatwootApiService],
    })
], ChatwootModule);
//# sourceMappingURL=chatwoot.module.js.map