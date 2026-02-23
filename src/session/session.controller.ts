import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  Logger,
  HttpCode,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { SessionService } from './session.service.js';
import { ChatwootApiService } from '../chatwoot/chatwoot-api.service.js';
import { LinkChatwootDto } from '../common/dto/link-chatwoot.dto.js';

@Controller('session')
export class SessionController {
  private readonly logger = new Logger(SessionController.name);

  constructor(
    private readonly sessionService: SessionService,
    private readonly chatwootApiService: ChatwootApiService,
  ) {}

  /**
   * POST /session/link
   * Vincula um protocolo interno a uma conversa do Chatwoot.
   * Valida que a conversa existe no Chatwoot antes de criar o vínculo.
   * Extrai contact_id e inbox_id automaticamente da API do Chatwoot.
   */
  @Post('link')
  @HttpCode(200)
  async linkChatwoot(
    @Body() dto: LinkChatwootDto,
  ): Promise<{
    status: string;
    protocolo: string;
    conversation_id: number;
    contact_id?: number;
    inbox_id?: number;
  }> {
    this.logger.log(
      `Linking protocolo=${dto.protocolo} <-> conversation_id=${dto.conversation_id}`,
    );

    // 1. Verificar se a conversa existe no Chatwoot
    const conversation = await this.chatwootApiService.getConversation(
      dto.conversation_id,
    );

    if (!conversation) {
      throw new BadRequestException(
        `Chatwoot conversation not found: ${dto.conversation_id}`,
      );
    }

    // 2. Extrair contact_id e inbox_id da resposta do Chatwoot (ou usar os valores do DTO se fornecidos)
    const meta = conversation['meta'] as
      | Record<string, unknown>
      | undefined;
    const sender = meta?.['sender'] as
      | Record<string, unknown>
      | undefined;

    const contactId =
      dto.contact_id ??
      (sender?.['id'] as number | undefined) ??
      (conversation['contact_id'] as number | undefined);

    const inboxId =
      dto.inbox_id ??
      (conversation['inbox_id'] as number | undefined);

    // 3. Vincular no banco
    const result = await this.sessionService.linkChatwoot(dto.protocolo, {
      conversation_id: dto.conversation_id,
      contact_id: contactId,
      inbox_id: inboxId,
    });

    if (!result) {
      throw new NotFoundException(
        `Protocolo not found: ${dto.protocolo}`,
      );
    }

    // 4. Atualizar campo personalizado protocolo_azapfy na conversa do Chatwoot
    await this.chatwootApiService.updateConversationCustomAttributes(
      dto.conversation_id,
      { protocolo_azapfy: dto.protocolo },
    );

    return {
      status: 'linked',
      protocolo: dto.protocolo,
      conversation_id: dto.conversation_id,
      contact_id: contactId,
      inbox_id: inboxId,
    };
  }

  /**
   * DELETE /session/:protocolo/link
   * Remove o vínculo do Chatwoot de um protocolo.
   */
  @Delete(':protocolo/link')
  @HttpCode(200)
  async unlinkChatwoot(
    @Param('protocolo') protocolo: string,
  ): Promise<{ status: string; protocolo: string }> {
    this.logger.log(`Unlinking Chatwoot from protocolo=${protocolo}`);

    // Verifica se o protocolo existe antes de desvincular
    await this.sessionService.getByProtocolo(protocolo);
    await this.sessionService.unlinkChatwoot(protocolo);

    return { status: 'unlinked', protocolo };
  }

  /**
   * GET /session/:protocolo/chatwoot-status
   * Verifica se um protocolo possui vínculo ativo com o Chatwoot.
   * Também consulta a API do Chatwoot para confirmar que a conversa ainda existe.
   */
  @Get(':protocolo/chatwoot-status')
  async getChatwootStatus(
    @Param('protocolo') protocolo: string,
  ): Promise<{
    protocolo: string;
    linked: boolean;
    chatwoot_conversation_exists: boolean;
    conversation_id?: number;
    contact_id?: number;
    inbox_id?: number;
  }> {
    const doc = await this.sessionService.getByProtocolo(protocolo);

    let chatwootConversationExists = false;

    if (doc.chatwoot?.linked && doc.chatwoot.conversation_id) {
      const conversation = await this.chatwootApiService.getConversation(
        doc.chatwoot.conversation_id,
      );
      chatwootConversationExists = !!conversation;
    }

    return {
      protocolo: doc.protocolo,
      linked: !!doc.chatwoot?.linked,
      chatwoot_conversation_exists: chatwootConversationExists,
      conversation_id: doc.chatwoot?.conversation_id,
      contact_id: doc.chatwoot?.contact_id,
      inbox_id: doc.chatwoot?.inbox_id,
    };
  }
}
