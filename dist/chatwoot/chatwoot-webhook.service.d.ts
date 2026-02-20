import { MessagesService } from '../messages/messages.service.js';
import { SessionService } from '../session/session.service.js';
import { ChatwootWebhookDto } from '../common/dto/chatwoot-webhook.dto.js';
export declare class ChatwootWebhookService {
    private readonly messagesService;
    private readonly sessionService;
    private readonly logger;
    constructor(messagesService: MessagesService, sessionService: SessionService);
    processWebhook(payload: ChatwootWebhookDto): Promise<void>;
}
