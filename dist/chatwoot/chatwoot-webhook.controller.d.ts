import { ChatwootWebhookService } from './chatwoot-webhook.service.js';
import { ChatwootWebhookDto } from '../common/dto/chatwoot-webhook.dto.js';
export declare class ChatwootWebhookController {
    private readonly chatwootWebhookService;
    private readonly logger;
    constructor(chatwootWebhookService: ChatwootWebhookService);
    handleWebhook(payload: ChatwootWebhookDto): Promise<{
        status: string;
    }>;
}
