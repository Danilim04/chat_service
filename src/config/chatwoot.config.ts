import { registerAs } from '@nestjs/config';

export default registerAs('chatwoot', () => ({
  baseUrl: process.env.CHATWOOT_BASE_URL ?? 'https://app.chatwoot.com',
  apiToken: process.env.CHATWOOT_API_TOKEN ?? '',
  accountId: parseInt(process.env.CHATWOOT_ACCOUNT_ID ?? '1', 10),
  inboxId: parseInt(process.env.CHATWOOT_INBOX_ID ?? '1', 10),
}));
