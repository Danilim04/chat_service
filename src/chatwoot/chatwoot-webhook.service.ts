import { Injectable, Logger } from '@nestjs/common';

import { MessagesService } from '../messages/messages.service.js';
import { AttachmentService } from '../messages/attachment.service.js';
import { SessionService } from '../session/session.service.js';
import { IWebhookMessageEvent } from '../common/interfaces/webhook-event.interface.js';

@Injectable()
export class ChatwootWebhookService {
  private readonly logger = new Logger(ChatwootWebhookService.name);

  constructor(
    private readonly messagesService: MessagesService,
    private readonly sessionService: SessionService,
    private readonly attachmentService: AttachmentService,
  ) { }

  /**
   * Processa um evento de mensagem já traduzido para a estrutura interna.
   * Não conhece o formato do Chatwoot — trabalha apenas com IWebhookMessageEvent.
   */
  async processWebhook(event: IWebhookMessageEvent): Promise<void> {
    const { protocolo, conversationId, } = event;

    const protocoloDoc =
      await this.sessionService.getByChatwootConversationId(conversationId);

    if (protocolo !== protocoloDoc?.protocolo) {
      this.logger.warn(
        `Protocolo mismatch: event protocolo=${protocolo} does not match session protocolo=${protocoloDoc?.protocolo} for conversation_id=${conversationId}. Skipping message.`,
      );
      return;
    }

    const destIdentifier = protocoloDoc?.cod_relator ?? protocolo;

    // Processa anexos (download + upload S3) se existirem
    let attachmentFileNames: string[] = [];
    if (event.attachments && event.attachments.length > 0) {
      this.logger.log(
        `Processing ${event.attachments.length} attachment(s) for protocolo=${protocolo}`,
      );
      attachmentFileNames = await this.attachmentService.processAttachments(
        protocolo,
        event.attachments,
      );
    }

    await this.messagesService.handleInboundMessage({
      protocolo,
      content: event.content,
      chatwootMessageId: event.externalMessageId,
      senderName: event.sender.name,
      senderIdentifier: event.sender.identifier,
      destIdentifier,
      isPrivate: event.isPrivate,
      attachmentFileNames:
        attachmentFileNames.length > 0 ? attachmentFileNames : undefined,
    });

    this.logger.log(
      `Webhook processed: protocolo=${protocolo}, conversation_id=${conversationId}, type=${event.messageType}, private=${event.isPrivate}, attachments=${attachmentFileNames.length}`,
    );
  }
}
