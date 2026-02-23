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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocoloSchema = exports.Protocolo = exports.ChatwootLinkSchema = exports.ChatwootLink = exports.ChatMessageSchema = exports.ChatMessage = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ChatMessage = class ChatMessage {
    reme;
    dest;
    dt_env;
    isInterno;
    autor;
    mensagem;
    chatwoot_message_id;
    source;
    chatwoot_sync_failed;
};
exports.ChatMessage = ChatMessage;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ChatMessage.prototype, "reme", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ChatMessage.prototype, "dest", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], ChatMessage.prototype, "dt_env", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ChatMessage.prototype, "isInterno", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ChatMessage.prototype, "autor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ChatMessage.prototype, "mensagem", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ChatMessage.prototype, "chatwoot_message_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['chatwoot', 'internal'] }),
    __metadata("design:type", String)
], ChatMessage.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ChatMessage.prototype, "chatwoot_sync_failed", void 0);
exports.ChatMessage = ChatMessage = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ChatMessage);
exports.ChatMessageSchema = mongoose_1.SchemaFactory.createForClass(ChatMessage);
let ChatwootLink = class ChatwootLink {
    conversation_id;
    contact_id;
    inbox_id;
    linked;
};
exports.ChatwootLink = ChatwootLink;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ChatwootLink.prototype, "conversation_id", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ChatwootLink.prototype, "contact_id", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ChatwootLink.prototype, "inbox_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], ChatwootLink.prototype, "linked", void 0);
exports.ChatwootLink = ChatwootLink = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ChatwootLink);
exports.ChatwootLinkSchema = mongoose_1.SchemaFactory.createForClass(ChatwootLink);
let Protocolo = class Protocolo {
    protocolo;
    grupo_emp;
    nome_relator;
    cod_relator;
    chat;
    chatwoot;
};
exports.Protocolo = Protocolo;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true }),
    __metadata("design:type", String)
], Protocolo.prototype, "protocolo", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Protocolo.prototype, "grupo_emp", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Protocolo.prototype, "nome_relator", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Protocolo.prototype, "cod_relator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ChatMessageSchema], default: [] }),
    __metadata("design:type", Array)
], Protocolo.prototype, "chat", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: exports.ChatwootLinkSchema }),
    __metadata("design:type", ChatwootLink)
], Protocolo.prototype, "chatwoot", void 0);
exports.Protocolo = Protocolo = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'sac',
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        strict: false,
    })
], Protocolo);
exports.ProtocoloSchema = mongoose_1.SchemaFactory.createForClass(Protocolo);
exports.ProtocoloSchema.index({ 'chatwoot.conversation_id': 1 }, { sparse: true });
exports.ProtocoloSchema.index({ 'chat.chatwoot_message_id': 1 }, { sparse: true });
//# sourceMappingURL=protocolo.schema.js.map