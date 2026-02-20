import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class ChatwootApiService {
    private readonly httpService;
    private readonly configService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiToken;
    private readonly accountId;
    constructor(httpService: HttpService, configService: ConfigService, eventEmitter: EventEmitter2);
    sendMessage(conversationId: number, content: string, protocolo?: string): Promise<Record<string, unknown> | null>;
    getConversation(conversationId: number): Promise<Record<string, unknown> | null>;
}
