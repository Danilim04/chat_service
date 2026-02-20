import { Module } from '@nestjs/common';

import { ChatGateway } from './chat.gateway.js';
import { ChatService } from './chat.service.js';
import { MessagesModule } from '../messages/messages.module.js';
import { SessionModule } from '../session/session.module.js';
import { ChatwootModule } from '../chatwoot/chatwoot.module.js';

@Module({
  imports: [MessagesModule, SessionModule, ChatwootModule],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
