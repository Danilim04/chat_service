import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { ChatwootModule } from './chatwoot/chatwoot.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { SessionModule } from './session/session.module.js';
import { ChatModule } from './chat/chat.module.js';
import { AberturaChamadoModule } from './abertura-chamado/abertura-chamado.module.js';
import { StorageModule } from './storage/storage.module.js';

@Module({
  imports: [
    // Global modules
    AppConfigModule,
    DatabaseModule,
    EventEmitterModule.forRoot(),
    StorageModule,

    // Feature modules
    SessionModule,
    MessagesModule,
    ChatwootModule,
    ChatModule,
    AberturaChamadoModule,
  ],
})
export class AppModule { }
