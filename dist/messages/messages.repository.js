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
var MessagesRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesRepository = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const protocolo_schema_js_1 = require("../database/schemas/protocolo.schema.js");
let MessagesRepository = MessagesRepository_1 = class MessagesRepository {
    protocoloModel;
    logger = new common_1.Logger(MessagesRepository_1.name);
    constructor(protocoloModel) {
        this.protocoloModel = protocoloModel;
    }
    async pushMessage(protocolo, message) {
        this.logger.log(`Pushing message to protocolo=${protocolo}, autor=${message.autor}`);
        return this.protocoloModel
            .findOneAndUpdate({ protocolo }, {
            $push: { chat: message },
            $set: { updated_at: new Date() },
        }, { new: true })
            .exec();
    }
    async hasChatwootMessage(protocolo, chatwootMessageId) {
        const doc = await this.protocoloModel
            .findOne({
            protocolo,
            'chat.chatwoot_message_id': chatwootMessageId,
        })
            .exec();
        return !!doc;
    }
    async getChatHistory(protocolo) {
        const doc = await this.protocoloModel
            .findOne({ protocolo })
            .select('chat')
            .exec();
        return (doc?.chat ?? []);
    }
    async markLastMessageSyncFailed(protocolo, failed = true) {
        const doc = await this.protocoloModel
            .findOne({ protocolo })
            .select('chat')
            .exec();
        if (!doc || doc.chat.length === 0)
            return;
        const lastIndex = doc.chat.length - 1;
        await this.protocoloModel
            .updateOne({ protocolo }, {
            $set: {
                [`chat.${lastIndex}.chatwoot_sync_failed`]: failed,
            },
        })
            .exec();
    }
    async findWithFailedSync(limit = 100) {
        return this.protocoloModel
            .find({ 'chat.chatwoot_sync_failed': true })
            .limit(limit)
            .exec();
    }
};
exports.MessagesRepository = MessagesRepository;
exports.MessagesRepository = MessagesRepository = MessagesRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(protocolo_schema_js_1.Protocolo.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MessagesRepository);
//# sourceMappingURL=messages.repository.js.map