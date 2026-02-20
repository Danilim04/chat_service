"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('chatwoot', () => ({
    baseUrl: process.env.CHATWOOT_BASE_URL ?? 'https://app.chatwoot.com',
    apiToken: process.env.CHATWOOT_API_TOKEN ?? '',
    accountId: parseInt(process.env.CHATWOOT_ACCOUNT_ID ?? '1', 10),
    inboxId: parseInt(process.env.CHATWOOT_INBOX_ID ?? '1', 10),
}));
//# sourceMappingURL=chatwoot.config.js.map