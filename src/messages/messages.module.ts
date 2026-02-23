import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Protocolo,
  ProtocoloSchema,
} from '../database/schemas/protocolo.schema.js';
import { MessagesController } from './messages.controller.js';
import { MessagesRepository } from './messages.repository.js';
import { MessagesService } from './messages.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Protocolo.name, schema: ProtocoloSchema },
    ]),
  ],
  controllers: [MessagesController],
  providers: [MessagesRepository, MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
