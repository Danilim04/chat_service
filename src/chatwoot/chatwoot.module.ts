import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ChatwootWebhookController } from './chatwoot-webhook.controller.js';
import { ChatwootWebhookService } from './chatwoot-webhook.service.js';
import { ChatwootApiService } from './chatwoot-api.service.js';
import { MessagesModule } from '../messages/messages.module.js';
import { SessionModule } from '../session/session.module.js';

@Module({
  imports: [
    HttpModule.register({ timeout: 10000 }),
    MessagesModule,
    forwardRef(() => SessionModule),
  ],
  controllers: [ChatwootWebhookController],
  providers: [ChatwootWebhookService, ChatwootApiService],
  exports: [ChatwootApiService],
})
export class ChatwootModule {}
