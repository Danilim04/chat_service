import { Server } from 'socket.io';
import { IChatMessage } from '../common/interfaces/message.interface.js';
export declare class ChatService {
    private readonly logger;
    private server;
    setServer(server: Server): void;
    emitToRoom(room: string, event: string, data: unknown): void;
    broadcast(event: string, data: unknown): void;
    handleNewMessage(payload: {
        message: IChatMessage;
        room: string;
    }): void;
}
