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
var SessionRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const protocolo_schema_js_1 = require("../database/schemas/protocolo.schema.js");
let SessionRepository = SessionRepository_1 = class SessionRepository {
    protocoloModel;
    logger = new common_1.Logger(SessionRepository_1.name);
    constructor(protocoloModel) {
        this.protocoloModel = protocoloModel;
    }
    async findByProtocolo(protocolo) {
        return this.protocoloModel.findOne({ protocolo }).exec();
    }
    async findByChatwootConversationId(conversationId) {
        return this.protocoloModel
            .findOne({
            'chatwoot.conversation_id': conversationId,
            'chatwoot.linked': true,
        })
            .exec();
    }
    async linkChatwoot(protocolo, chatwootData) {
        this.logger.log(`Linking Chatwoot to protocolo=${protocolo}: conversation_id=${chatwootData.conversation_id}`);
        return this.protocoloModel
            .findOneAndUpdate({ protocolo }, { $set: { chatwoot: chatwootData } }, { new: true })
            .exec();
    }
    async unlinkChatwoot(protocolo) {
        await this.protocoloModel
            .updateOne({ protocolo }, { $set: { 'chatwoot.linked': false } })
            .exec();
    }
};
exports.SessionRepository = SessionRepository;
exports.SessionRepository = SessionRepository = SessionRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(protocolo_schema_js_1.Protocolo.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SessionRepository);
//# sourceMappingURL=session.repository.js.map