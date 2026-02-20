import { Model } from 'mongoose';
import { ProtocoloDocument } from '../database/schemas/protocolo.schema.js';
import { IChatMessage } from '../common/interfaces/message.interface.js';
export declare class MessagesRepository {
    private readonly protocoloModel;
    private readonly logger;
    constructor(protocoloModel: Model<ProtocoloDocument>);
    pushMessage(protocolo: string, message: IChatMessage): Promise<ProtocoloDocument | null>;
    hasChatwootMessage(protocolo: string, chatwootMessageId: number): Promise<boolean>;
    getChatHistory(protocolo: string): Promise<IChatMessage[]>;
    markLastMessageSyncFailed(protocolo: string, failed?: boolean): Promise<void>;
    findWithFailedSync(limit?: number): Promise<ProtocoloDocument[]>;
}
