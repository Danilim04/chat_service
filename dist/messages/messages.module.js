"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const protocolo_schema_js_1 = require("../database/schemas/protocolo.schema.js");
const messages_repository_js_1 = require("./messages.repository.js");
const messages_service_js_1 = require("./messages.service.js");
let MessagesModule = class MessagesModule {
};
exports.MessagesModule = MessagesModule;
exports.MessagesModule = MessagesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: protocolo_schema_js_1.Protocolo.name, schema: protocolo_schema_js_1.ProtocoloSchema },
            ]),
        ],
        providers: [messages_repository_js_1.MessagesRepository, messages_service_js_1.MessagesService],
        exports: [messages_service_js_1.MessagesService],
    })
], MessagesModule);
//# sourceMappingURL=messages.module.js.map