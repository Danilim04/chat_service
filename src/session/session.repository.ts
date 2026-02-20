import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Protocolo,
  ProtocoloDocument,
} from '../database/schemas/protocolo.schema.js';
import { IChatwootLink } from '../common/interfaces/message.interface.js';

@Injectable()
export class SessionRepository {
  private readonly logger = new Logger(SessionRepository.name);

  constructor(
    @InjectModel(Protocolo.name)
    private readonly protocoloModel: Model<ProtocoloDocument>,
  ) {}

  /**
   * Busca protocolo pelo número de protocolo.
   */
  async findByProtocolo(
    protocolo: string,
  ): Promise<ProtocoloDocument | null> {
    return this.protocoloModel.findOne({ protocolo }).exec();
  }

  /**
   * Busca protocolo pelo conversation_id do Chatwoot.
   */
  async findByChatwootConversationId(
    conversationId: number,
  ): Promise<ProtocoloDocument | null> {
    return this.protocoloModel
      .findOne({
        'chatwoot.conversation_id': conversationId,
        'chatwoot.linked': true,
      })
      .exec();
  }

  /**
   * Vincula (upsert) os dados do Chatwoot no documento de protocolo.
   */
  async linkChatwoot(
    protocolo: string,
    chatwootData: IChatwootLink,
  ): Promise<ProtocoloDocument | null> {
    this.logger.log(
      `Linking Chatwoot to protocolo=${protocolo}: conversation_id=${chatwootData.conversation_id}`,
    );

    return this.protocoloModel
      .findOneAndUpdate(
        { protocolo },
        { $set: { chatwoot: chatwootData } },
        { new: true },
      )
      .exec();
  }

  /**
   * Remove o vínculo do Chatwoot (marca linked: false).
   */
  async unlinkChatwoot(protocolo: string): Promise<void> {
    await this.protocoloModel
      .updateOne(
        { protocolo },
        { $set: { 'chatwoot.linked': false } },
      )
      .exec();
  }
}
