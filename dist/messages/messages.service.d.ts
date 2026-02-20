import { EventEmitter2 } from '@nestjs/event-emitter';
import { MessagesRepository } from './messages.repository.js';
import { IChatMessage } from '../common/interfaces/message.interface.js';
export declare class MessagesService {
    private readonly messagesRepository;
    private readonly eventEmitter;
    private readonly logger;
    constructor(messagesRepository: MessagesRepository, eventEmitter: EventEmitter2);
    handleInboundMessage(data: {
        protocolo: string;
        content: string;
        chatwootMessageId?: number;
        senderName: string;
        senderIdentifier: string;
        destIdentifier: string;
    }): Promise<IChatMessage | null>;
    handleOutboundMessage(data: {
        protocolo: string;
        content: string;
        senderIdentifier: string;
        destIdentifier: string;
        senderName: string;
        isInterno?: boolean;
    }): Promise<IChatMessage | null>;
    markSyncFailed(protocolo: string, error: string): Promise<void>;
    markSyncSuccess(protocolo: string): Promise<void>;
    getChatHistory(protocolo: string): Promise<IChatMessage[]>;
}
