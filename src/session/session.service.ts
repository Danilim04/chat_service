import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { SessionRepository } from './session.repository.js';
import { ProtocoloDocument } from '../database/schemas/protocolo.schema.js';
import { IChatwootLink } from '../common/interfaces/message.interface.js';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private readonly sessionRepository: SessionRepository) {}

  /**
   * Busca protocolo pelo número de protocolo.
   * Lança NotFoundException se não encontrar.
   */
  async getByProtocolo(protocolo: string): Promise<ProtocoloDocument> {
    const doc = await this.sessionRepository.findByProtocolo(protocolo);

    if (!doc) {
      this.logger.warn(`Protocolo not found: ${protocolo}`);
      throw new NotFoundException(
        `Protocolo not found: ${protocolo}`,
      );
    }

    return doc;
  }

  /**   
   * Busca protocolo pelo conversation_id do Chatwoot.
   * Retorna null se não encontrar (webhook pode chegar antes do vínculo).
   */
  async getByChatwootConversationId(
    conversationId: number,
  ): Promise<ProtocoloDocument | null> {
    return this.sessionRepository.findByChatwootConversationId(conversationId);
  }

  /**
   * Vincula um protocolo a uma conversa do Chatwoot.
   * Cria/atualiza o sub-objeto `chatwoot` no documento.
   */
  async linkChatwoot(
    protocolo: string,
    data: Omit<IChatwootLink, 'linked'>,
  ): Promise<ProtocoloDocument | null> {
    this.logger.log(
      `Linking protocolo=${protocolo} <-> chatwoot conversation=${data.conversation_id}`,
    );

    return this.sessionRepository.linkChatwoot(protocolo, {
      ...data,
      linked: true,
    });
  }

  /**
   * Remove o vínculo do Chatwoot de um protocolo.
   */
  async unlinkChatwoot(protocolo: string): Promise<void> {
    this.logger.log(`Unlinking Chatwoot from protocolo=${protocolo}`);
    await this.sessionRepository.unlinkChatwoot(protocolo);
  }

  /**
   * Verifica se um protocolo possui vínculo ativo com o Chatwoot.
   */
  async hasChatwootLink(protocolo: string): Promise<boolean> {
    const doc = await this.sessionRepository.findByProtocolo(protocolo);
    return !!doc?.chatwoot?.linked;
  }
}
