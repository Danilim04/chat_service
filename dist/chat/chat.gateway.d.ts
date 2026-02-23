import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service.js';
import { MessagesService } from '../messages/messages.service.js';
import { SessionService } from '../session/session.service.js';
import { ChatwootApiService } from '../chatwoot/chatwoot-api.service.js';
import { CreateMessageDto } from '../common/dto/create-message.dto.js';
import { IChatMessage } from '../common/interfaces/message.interface.js';
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private readonly messagesService;
    private readonly sessionService;
    private readonly chatwootApiService;
    server: Server;
    private readonly logger;
    constructor(chatService: ChatService, messagesService: MessagesService, sessionService: SessionService, chatwootApiService: ChatwootApiService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(client: Socket, data: {
        room: string;
    }): void;
    handleLeaveRoom(client: Socket, data: {
        room: string;
    }): void;
    handleGetHistory(client: Socket, data: {
        room: string;
    }): Promise<void>;
    handleSendMessage(client: Socket, data: CreateMessageDto): Promise<void>;
    handleMessageCreatedEvent(payload: {
        message: IChatMessage;
        room: string;
    }): void;
    handleSyncFailedEvent(payload: {
        protocolo: string;
        error: string;
    }): Promise<void>;
}
