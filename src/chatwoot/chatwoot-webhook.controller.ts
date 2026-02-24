import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { ChatwootWebhookService } from './chatwoot-webhook.service.js';
import { ChatwootWebhookDto } from '../common/dto/chatwoot-webhook.dto.js';
import { translateChatwootPayload } from './chatwoot-payload.translator.js';
import { isAberturaChamadoContent } from '../abertura-chamado/abertura-chamado-message.parser.js';

@Controller('chatwoot')
export class ChatwootWebhookController {
  private readonly logger = new Logger(ChatwootWebhookController.name);

  constructor(
    private readonly chatwootWebhookService: ChatwootWebhookService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() payload: ChatwootWebhookDto): Promise<{ status: string }> {
    this.logger.log(`Webhook received Payload=${JSON.stringify(payload)}`);

    if (this.isAberturaChamadoMessage(payload)) {
      this.logger.log(
        `#abertura_chamado detected in conversationId=${payload.conversation?.id}`,
      );
      this.eventEmitter.emit('abertura_chamado.requested', {
        content: payload.content,
        conversationId: payload.conversation!.id,
      });
      return { status: 'abertura_chamado_requested' };
    }

    const event = translateChatwootPayload(payload);

    if (!event) {
      return { status: 'ignored' };
    }

    try {
      await this.chatwootWebhookService.processWebhook(event);
      return { status: 'ok' };
    } catch (error) {
      this.logger.error(
        'Error processing webhook',
        error instanceof Error ? error.stack : String(error),
      );

      return { status: 'error_logged' };
    }
  }

  /**
   * Verifica se o payload é uma mensagem privada com a tag #abertura_chamado.
   * A detecção é feita ANTES do translator para permitir conversas sem protocolo vinculado.
   */
  private isAberturaChamadoMessage(payload: ChatwootWebhookDto): boolean {
    return (
      payload.event === 'message_created' &&
      payload.private === true &&
      !!payload.content &&
      isAberturaChamadoContent(payload.content) &&
      !!payload.conversation?.id
    );
  }
}
