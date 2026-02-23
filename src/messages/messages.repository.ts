import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Protocolo,
  ProtocoloDocument,
} from '../database/schemas/protocolo.schema.js';
import { IChatMessage } from '../common/interfaces/message.interface.js';

@Injectable()
export class MessagesRepository {
  private readonly logger = new Logger(MessagesRepository.name);

  constructor(
    @InjectModel(Protocolo.name)
    private readonly protocoloModel: Model<ProtocoloDocument>,
  ) { }

  /**
   * Adiciona uma mensagem ao array `chat[]` do documento de protocolo.
   */
  async pushMessage(
    protocolo: string,
    message: IChatMessage,
  ): Promise<ProtocoloDocument | null> {
    this.logger.log(
      `Pushing message to protocolo=${protocolo}, autor=${message.autor}`,
    );

    return this.protocoloModel
      .findOneAndUpdate(
        { protocolo },
        {
          $push: { chat: message },
          $set: { updated_at: new Date() },
        },
        { returnDocument: 'after' },
      )
      .exec();
  }

  /**
   * Verifica se já existe mensagem com o chatwoot_message_id no array chat[].
   * Usado para prevenção de duplicatas.
   */
  async hasChatwootMessage(
    protocolo: string,
    chatwootMessageId: number,
  ): Promise<boolean> {
    const doc = await this.protocoloModel
      .findOne({
        protocolo,
        'chat.chatwoot_message_id': chatwootMessageId,
      })
      .exec();

    return !!doc;
  }

  /**
   * Busca o histórico de chat de um protocolo.
   */
  async getChatHistory(
    protocolo: string,
  ): Promise<IChatMessage[]> {
    const doc = await this.protocoloModel
      .findOne({ protocolo })
      .select('chat')
      .exec();
    return (doc?.chat ?? []) as IChatMessage[];
  }

  /**
   * Marca a última mensagem de um protocolo como falha de sync.
   */
  async markLastMessageSyncFailed(
    protocolo: string,
    failed: boolean = true,
  ): Promise<void> {
    // Buscar o doc para saber o índice da última mensagem
    const doc = await this.protocoloModel
      .findOne({ protocolo })
      .select('chat')
      .exec();

    if (!doc || doc.chat.length === 0) return;

    const lastIndex = doc.chat.length - 1;

    await this.protocoloModel
      .updateOne(
        { protocolo },
        {
          $set: {
            [`chat.${lastIndex}.chatwoot_sync_failed`]: failed,
          },
        },
      )
      .exec();
  }

  /**
   * Busca protocolos que possuem mensagens com falha de sync.
   */
  async findWithFailedSync(limit = 100): Promise<ProtocoloDocument[]> {
    return this.protocoloModel
      .find({ 'chat.chatwoot_sync_failed': true })
      .limit(limit)
      .exec();
  }
}
