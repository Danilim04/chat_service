import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { MessagesRepository } from './messages.repository.js';
import { IChatMessage } from '../common/interfaces/message.interface.js';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  /**
   * Persiste uma mensagem INBOUND (Chatwoot → interno).
   * Verifica duplicatas pelo chatwoot_message_id antes de salvar.
   * Emite evento `message.created` para broadcast via WebSocket.
   */
  async handleInboundMessage(data: {
    protocolo: string;
    content: string;
    chatwootMessageId?: number;
    senderName: string;
    senderIdentifier: string;
    destIdentifier: string;
    isPrivate?: boolean;
    attachmentFileNames?: string[];
  }): Promise<IChatMessage | null> {
    if (data.chatwootMessageId) {
      const exists = await this.messagesRepository.hasChatwootMessage(
        data.protocolo,
        data.chatwootMessageId,
      );
      if (exists) {
        this.logger.warn(
          `Duplicate message detected: chatwoot_message_id=${data.chatwootMessageId}. Skipping.`,
        );
        return null;
      }
    }

    const chatMessage: IChatMessage = {
      reme: data.senderIdentifier,
      dest: data.destIdentifier,
      dt_env: new Date(),
      isInterno: data.isPrivate ?? false,
      autor: data.senderName,
      mensagem: data.content,
      chatwoot_message_id: data.chatwootMessageId,
      source: 'chatwoot',
      ...(data.attachmentFileNames
        ? { anexo: data.attachmentFileNames }
        : {}),
    };

    const updatedDoc = await this.messagesRepository.pushMessage(
      data.protocolo,
      chatMessage,
    );

    if (!updatedDoc) {
      this.logger.error(
        `Failed to push inbound message: protocolo=${data.protocolo} not found`,
      );
      return null;
    }

    if (data.attachmentFileNames) {
      await this.messagesRepository.pushAnexos(
        data.protocolo,
        data.attachmentFileNames,
      );
      this.logger.log(
        `Anexos persisted: protocolo=${data.protocolo}, files=${data.attachmentFileNames.join(', ')}`,
      );
    }

    this.logger.log(
      `Inbound message persisted: protocolo=${data.protocolo}, autor=${data.senderName}`,
    );

    this.eventEmitter.emit('message.created', {
      message: chatMessage,
      room: data.protocolo,
    });

    return chatMessage;
  }

  /**
   * Persiste uma mensagem OUTBOUND (interno → Chatwoot).
   * Retorna a mensagem criada para posterior envio ao Chatwoot.
   */
  async handleOutboundMessage(data: {
    protocolo: string;
    content: string;
    senderIdentifier: string;
    destIdentifier: string;
    senderName: string;
    isPrivate?: boolean;
    attachmentFileNames?: string[];
  }): Promise<IChatMessage | null> {
    const chatMessage: IChatMessage = {
      reme: data.senderIdentifier,
      dest: data.destIdentifier,
      dt_env: new Date(),
      isInterno: data.isPrivate ?? false,
      autor: data.senderName,
      mensagem: data.content,
      source: 'internal',
      ...(data.attachmentFileNames
        ? { anexo: data.attachmentFileNames }
        : {}),
    };

    const updatedDoc = await this.messagesRepository.pushMessage(
      data.protocolo,
      chatMessage,
    );

    if (!updatedDoc) {
      this.logger.error(
        `Failed to push outbound message: protocolo=${data.protocolo} not found`,
      );
      return null;
    }

    if (data.attachmentFileNames && data.attachmentFileNames.length > 0) {
      await this.messagesRepository.pushAnexos(
        data.protocolo,
        data.attachmentFileNames,
      );
      this.logger.log(
        `Outbound anexos persisted: protocolo=${data.protocolo}, files=${data.attachmentFileNames.join(', ')}`,
      );
    }

    this.logger.log(
      `Outbound message persisted: protocolo=${data.protocolo}, autor=${data.senderName}, attachments=${data.attachmentFileNames?.length ?? 0}`,
    );

    return chatMessage;
  }

  /**
   * Marca a última mensagem de um protocolo como falha de sync.
   */
  async markSyncFailed(protocolo: string, error: string): Promise<void> {
    this.logger.error(
      `Chatwoot sync failed for protocolo=${protocolo}: ${error}`,
    );
    await this.messagesRepository.markLastMessageSyncFailed(protocolo, true);
  }

  /**
   * Marca a última mensagem de um protocolo como sincronizada.
   */
  async markSyncSuccess(protocolo: string): Promise<void> {
    await this.messagesRepository.markLastMessageSyncFailed(protocolo, false);
  }

  /**
   * Retorna histórico de chat de um protocolo.
   */
  async getChatHistory(protocolo: string): Promise<IChatMessage[]> {
    return this.messagesRepository.getChatHistory(protocolo);
  }
}
