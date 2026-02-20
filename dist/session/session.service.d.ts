import { SessionRepository } from './session.repository.js';
import { ProtocoloDocument } from '../database/schemas/protocolo.schema.js';
import { IChatwootLink } from '../common/interfaces/message.interface.js';
export declare class SessionService {
    private readonly sessionRepository;
    private readonly logger;
    constructor(sessionRepository: SessionRepository);
    getByProtocolo(protocolo: string): Promise<ProtocoloDocument>;
    getByChatwootConversationId(conversationId: number): Promise<ProtocoloDocument | null>;
    linkChatwoot(protocolo: string, data: Omit<IChatwootLink, 'linked'>): Promise<ProtocoloDocument | null>;
    unlinkChatwoot(protocolo: string): Promise<void>;
    hasChatwootLink(protocolo: string): Promise<boolean>;
}
