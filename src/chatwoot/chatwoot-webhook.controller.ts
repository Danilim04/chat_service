import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';

import { ChatwootWebhookService } from './chatwoot-webhook.service.js';
import { ChatwootWebhookDto } from '../common/dto/chatwoot-webhook.dto.js';

@Controller('chatwoot')
export class ChatwootWebhookController {
  private readonly logger = new Logger(ChatwootWebhookController.name);

  constructor(
    private readonly chatwootWebhookService: ChatwootWebhookService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() payload: ChatwootWebhookDto): Promise<{ status: string }> {
    this.logger.log(`Webhook received: event=${payload.event}, payload=${JSON.stringify(payload)}`);

    try {
      await this.chatwootWebhookService.processWebhook(payload);
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
