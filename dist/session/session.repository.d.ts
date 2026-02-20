import { Model } from 'mongoose';
import { ProtocoloDocument } from '../database/schemas/protocolo.schema.js';
import { IChatwootLink } from '../common/interfaces/message.interface.js';
export declare class SessionRepository {
    private readonly protocoloModel;
    private readonly logger;
    constructor(protocoloModel: Model<ProtocoloDocument>);
    findByProtocolo(protocolo: string): Promise<ProtocoloDocument | null>;
    findByChatwootConversationId(conversationId: number): Promise<ProtocoloDocument | null>;
    linkChatwoot(protocolo: string, chatwootData: IChatwootLink): Promise<ProtocoloDocument | null>;
    unlinkChatwoot(protocolo: string): Promise<void>;
}
