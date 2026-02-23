import { Controller, Get, Param, Logger } from '@nestjs/common';

import { MessagesService } from './messages.service.js';
import { IChatMessage } from '../common/interfaces/message.interface.js';

@Controller('messages')
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(private readonly messagesService: MessagesService) {}

  /**
   * GET /messages/:protocolo/history
   * Retorna o histórico de mensagens do chat de um protocolo.
   */
  @Get(':protocolo/history')
  async getChatHistory(
    @Param('protocolo') protocolo: string,
  ): Promise<{ protocolo: string; messages: IChatMessage[] }> {
    this.logger.log(`Fetching chat history for protocolo=${protocolo}`);

    const messages = await this.messagesService.getChatHistory(protocolo);

    return { protocolo, messages };
  }
}
