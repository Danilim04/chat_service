"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const protocolo_schema_js_1 = require("../database/schemas/protocolo.schema.js");
const session_repository_js_1 = require("./session.repository.js");
const session_service_js_1 = require("./session.service.js");
let SessionModule = class SessionModule {
};
exports.SessionModule = SessionModule;
exports.SessionModule = SessionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: protocolo_schema_js_1.Protocolo.name, schema: protocolo_schema_js_1.ProtocoloSchema },
            ]),
        ],
        providers: [session_repository_js_1.SessionRepository, session_service_js_1.SessionService],
        exports: [session_service_js_1.SessionService],
    })
], SessionModule);
//# sourceMappingURL=session.module.js.map