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
var SessionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const session_repository_js_1 = require("./session.repository.js");
let SessionService = SessionService_1 = class SessionService {
    sessionRepository;
    logger = new common_1.Logger(SessionService_1.name);
    constructor(sessionRepository) {
        this.sessionRepository = sessionRepository;
    }
    async getByProtocolo(protocolo) {
        const doc = await this.sessionRepository.findByProtocolo(protocolo);
        if (!doc) {
            this.logger.warn(`Protocolo not found: ${protocolo}`);
            throw new common_1.NotFoundException(`Protocolo not found: ${protocolo}`);
        }
        return doc;
    }
    async getByChatwootConversationId(conversationId) {
        return this.sessionRepository.findByChatwootConversationId(conversationId);
    }
    async linkChatwoot(protocolo, data) {
        this.logger.log(`Linking protocolo=${protocolo} <-> chatwoot conversation=${data.conversation_id}`);
        return this.sessionRepository.linkChatwoot(protocolo, {
            ...data,
            linked: true,
        });
    }
    async unlinkChatwoot(protocolo) {
        this.logger.log(`Unlinking Chatwoot from protocolo=${protocolo}`);
        await this.sessionRepository.unlinkChatwoot(protocolo);
    }
    async hasChatwootLink(protocolo) {
        const doc = await this.sessionRepository.findByProtocolo(protocolo);
        return !!doc?.chatwoot?.linked;
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = SessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [session_repository_js_1.SessionRepository])
], SessionService);
//# sourceMappingURL=session.service.js.map