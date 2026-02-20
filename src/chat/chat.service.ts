import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { IChatMessage } from '../common/interfaces/message.interface.js';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private server: Server | null = null;

  /**
   * Define a referência ao servidor WebSocket.
   * Chamado pelo ChatGateway após inicialização.
   */
  setServer(server: Server): void {
    this.server = server;
  }

  /**
   * Emite uma mensagem para uma sala (room) específica.
   */
  emitToRoom(room: string, event: string, data: unknown): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized — cannot emit');
      return;
    }

    this.server.to(room).emit(event, data);
    this.logger.debug(`Emitted "${event}" to room "${room}"`);
  }

  /**
   * Emite uma mensagem para todos os clientes conectados.
   */
  broadcast(event: string, data: unknown): void {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized — cannot broadcast');
      return;
    }

    this.server.emit(event, data);
    this.logger.debug(`Broadcasted "${event}" to all clients`);
  }

  /**
   * Emite a mensagem criada para a sala do protocolo.
   * Usado pelo listener do evento `message.created`.
   */
  handleNewMessage(payload: { message: IChatMessage; room: string }): void {
    this.emitToRoom(payload.room, 'new_message', payload.message);
  }
}
