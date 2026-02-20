"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_js_1 = require("./app.module.js");
const http_exception_filter_js_1 = require("./common/filters/http-exception.filter.js");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_js_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_js_1.HttpExceptionFilter());
    app.enableCors({ origin: '*' });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('app.port', 3000);
    await app.listen(port);
    logger.log(`Chatservice running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map