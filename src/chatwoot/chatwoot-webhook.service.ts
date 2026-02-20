import { Injectable, Logger } from '@nestjs/common';

import { MessagesService } from '../messages/messages.service.js';
import { SessionService } from '../session/session.service.js';
import { ChatwootWebhookDto } from '../common/dto/chatwoot-webhook.dto.js';

@Injectable()
export class ChatwootWebhookService {
  private readonly logger = new Logger(ChatwootWebhookService.name);

  constructor(
    private readonly messagesService: MessagesService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Processa o payload do webhook do Chatwoot.
   * Filtra eventos não relevantes e persiste mensagens válidas.
   */
  async processWebhook(payload: ChatwootWebhookDto): Promise<void> {
    // 1. Filtro de evento: apenas message_created
    if (payload.event !== 'message_created') {
      this.logger.debug(`Ignoring event: ${payload.event}`);
      return;
    }

    // 2. Filtro de tipo: ignorar outgoing (evita loop) e activity
    if (
      payload.message_type === 'outgoing' ||
      payload.message_type === 'activity'
    ) {
      this.logger.debug(
        `Ignoring message_type=${payload.message_type} (anti-loop)`,
      );
      return;
    }

    // 3. Filtro de conteúdo vazio
    if (!payload.content || payload.content.trim() === '') {
      this.logger.debug('Ignoring empty content message');
      return;
    }

    // 4. Validar dados obrigatórios da conversa
    if (!payload.conversation?.id) {
      this.logger.warn('Webhook missing conversation.id — skipping');
      return;
    }

    const conversationId = payload.conversation.id;
    const contactId = payload.conversation.contact_id ?? payload.sender?.id ?? 0;

    // 5. Buscar protocolo vinculado a esta conversa do Chatwoot
    const protocoloDoc =
      await this.sessionService.getByChatwootConversationId(conversationId);

    if (!protocoloDoc) {
      this.logger.warn(
        `No protocolo linked to Chatwoot conversation_id=${conversationId} — skipping message`,
      );
      return;
    }

    const protocolo = protocoloDoc.protocolo;

    // 6. Persistir mensagem no array chat[] e emitir evento
    await this.messagesService.handleInboundMessage({
      protocolo,
      content: payload.content,
      chatwootMessageId: payload.id,
      senderName: payload.sender?.name ?? 'Chatwoot',
      senderIdentifier: `chatwoot_${contactId}`,
      destIdentifier: protocoloDoc.cod_relator ?? protocolo,
    });

    this.logger.log(
      `Webhook processed: event=${payload.event}, protocolo=${protocolo}, conversation_id=${conversationId}`,
    );
  }
}
