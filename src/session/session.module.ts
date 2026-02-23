import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Protocolo,
  ProtocoloSchema,
} from '../database/schemas/protocolo.schema.js';
import { SessionController } from './session.controller.js';
import { SessionRepository } from './session.repository.js';
import { SessionService } from './session.service.js';
import { ChatwootModule } from '../chatwoot/chatwoot.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Protocolo.name, schema: ProtocoloSchema },
    ]),
    forwardRef(() => ChatwootModule),
  ],
  controllers: [SessionController],
  providers: [SessionRepository, SessionService],
  exports: [SessionService],
})
export class SessionModule {}
