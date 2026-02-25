import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Protocolo,
  ProtocoloSchema,
} from '../database/schemas/protocolo.schema.js';
import { MessagesController } from './messages.controller.js';
import { MessagesRepository } from './messages.repository.js';
import { MessagesService } from './messages.service.js';
import { AttachmentService } from './attachment.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Protocolo.name, schema: ProtocoloSchema },
    ]),
    HttpModule.register({ timeout: 30000 }),
  ],
  controllers: [MessagesController],
  providers: [MessagesRepository, MessagesService, AttachmentService],
  exports: [MessagesService, AttachmentService],
})
export class MessagesModule { }
