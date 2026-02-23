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
var DatabaseModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const mongoose_2 = require("mongoose");
const protocolo_schema_js_1 = require("./schemas/protocolo.schema.js");
let DatabaseModule = DatabaseModule_1 = class DatabaseModule {
    connection;
    logger = new common_1.Logger(DatabaseModule_1.name);
    constructor(connection) {
        this.connection = connection;
    }
    onModuleInit() {
        this.connection.on('connected', () => this.logger.log('MongoDB connected'));
        this.connection.on('error', (err) => this.logger.error(`MongoDB error: ${err.message}`));
        this.connection.on('disconnected', () => this.logger.warn('MongoDB disconnected'));
        this.connection.on('reconnected', () => this.logger.log('MongoDB reconnected'));
        this.logger.log(`MongoDB readyState: ${this.connection.readyState}`);
    }
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = DatabaseModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRootAsync({
                useFactory: (configService) => ({
                    uri: configService.get('database.uri'),
                    dbName: configService.get('database.dbName'),
                    connectTimeoutMS: 10_000,
                    socketTimeoutMS: 30_000,
                    serverSelectionTimeoutMS: 10_000,
                    heartbeatFrequencyMS: 10_000,
                }),
                inject: [config_1.ConfigService],
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: protocolo_schema_js_1.Protocolo.name, schema: protocolo_schema_js_1.ProtocoloSchema },
            ]),
        ],
        exports: [mongoose_1.MongooseModule],
    }),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Connection])
], DatabaseModule);
//# sourceMappingURL=database.module.js.map