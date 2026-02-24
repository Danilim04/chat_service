import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';

import { ChatwootWebhookService } from './chatwoot-webhook.service.js';
import { ChatwootWebhookDto } from '../common/dto/chatwoot-webhook.dto.js';
import { translateChatwootPayload } from './chatwoot-payload.translator.js';

@Controller('chatwoot')
export class ChatwootWebhookController {
  private readonly logger = new Logger(ChatwootWebhookController.name);

  constructor(
    private readonly chatwootWebhookService: ChatwootWebhookService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() payload: ChatwootWebhookDto): Promise<{ status: string }> {
    this.logger.log(`Webhook received: event=${payload.event}`);

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
}
