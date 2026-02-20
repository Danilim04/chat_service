import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Protocolo,
  ProtocoloSchema,
} from '../database/schemas/protocolo.schema.js';
import { SessionRepository } from './session.repository.js';
import { SessionService } from './session.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Protocolo.name, schema: ProtocoloSchema },
    ]),
  ],
  providers: [SessionRepository, SessionService],
  exports: [SessionService],
})
export class SessionModule {}
