import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service.js';
import { MessagesService } from '../messages/messages.service.js';
import { SessionService } from '../session/session.service.js';
import { ChatwootApiService } from '../chatwoot/chatwoot-api.service.js';
import { CreateMessageDto } from '../common/dto/create-message.dto.js';
import { IChatMessage } from '../common/interfaces/message.interface.js';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
  pingInterval: 25000,
  pingTimeout: 10000,
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly messagesService: MessagesService,
    private readonly sessionService: SessionService,
    private readonly chatwootApiService: ChatwootApiService,
  ) {}

  afterInit(server: Server): void {
    this.chatService.setServer(server);
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Cliente entra em uma sala (associado ao protocolo).
   */
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ): void {
    client.join(data.room);
    this.logger.log(`Client ${client.id} joined room: ${data.room}`);
    client.emit('joined_room', { room: data.room });
  }

  /**
   * Cliente sai de uma sala.
   */
  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ): void {
    client.leave(data.room);
    this.logger.log(`Client ${client.id} left room: ${data.room}`);
  }

  /**
   * Cliente solicita o histórico de mensagens de um protocolo.
   */
  @SubscribeMessage('get_history')
  async handleGetHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ): Promise<void> {
    this.logger.log(
      `History requested by client ${client.id}: protocolo=${data.room}`,
    );

    try {
      const TIMEOUT_MS = 15_000;
      const messages = await Promise.race([
        this.messagesService.getChatHistory(data.room),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timeout: getChatHistory exceeded ${TIMEOUT_MS}ms`)),
            TIMEOUT_MS,
          ),
        ),
      ]);
      client.emit('chat_history', { protocolo: data.room, messages });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(`Error fetching history: ${errorMessage}`);
      client.emit('message_error', {
        error: errorMessage,
        protocolo: data.room,
      });
    }
  }

  /**
   * Cliente envia uma mensagem a partir do front-end interno.
   * Fluxo: persistir no chat[] → se houver vínculo Chatwoot, enviar via API.
   */
  @SubscribeMessage('send_message')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateMessageDto,
  ): Promise<void> {
    this.logger.log(
      `Message received from client ${client.id}: protocolo=${data.protocolo}`,
    );

    try {
      // 1. Verificar se o protocolo existe
      const protocoloDoc = await this.sessionService.getByProtocolo(
        data.protocolo,
      );

      // 2. Persistir mensagem no array chat[] como OUTBOUND
      const chatMessage = await this.messagesService.handleOutboundMessage({
        protocolo: data.protocolo,
        content: data.mensagem,
        senderIdentifier: data.reme,
        destIdentifier: data.dest,
        senderName: data.autor,
        isInterno: data.isInterno,
      });

      if (!chatMessage) {
        client.emit('message_error', {
          error: 'Failed to persist message',
          protocolo: data.protocolo,
        });
        return;
      }

      let syncStatus = 'no_chatwoot_link';

      // 3. Se houver vínculo com Chatwoot, enviar via API
      if (protocoloDoc.chatwoot?.linked && protocoloDoc.chatwoot.conversation_id) {
        const result = await this.chatwootApiService.sendMessage(
          protocoloDoc.chatwoot.conversation_id,
          data.mensagem,
          data.protocolo,
        );

        if (result) {
          await this.messagesService.markSyncSuccess(data.protocolo);
          syncStatus = 'synced';
        } else {
          syncStatus = 'sync_failed';
        }
      }

      // 4. Confirmar envio ao cliente que enviou
      client.emit('message_sent', {
        protocolo: data.protocolo,
        status: syncStatus,
      });

      // 5. Broadcast para a sala (outros clientes veem a mensagem)
      this.chatService.emitToRoom(
        data.protocolo,
        'new_message',
        chatMessage,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(`Error handling send_message: ${errorMessage}`);

      client.emit('message_error', {
        error: errorMessage,
        protocolo: data.protocolo,
      });
    }
  }

  /**
   * Escuta eventos internos de novas mensagens (vindas do Chatwoot via webhook).
   * Faz broadcast via WebSocket para os clientes na sala correspondente.
   */
  @OnEvent('message.created')
  handleMessageCreatedEvent(payload: {
    message: IChatMessage;
    room: string;
  }): void {
    this.logger.debug(
      `Event message.created: broadcasting to room=${payload.room}`,
    );
    this.chatService.handleNewMessage(payload);
  }

  /**
   * Escuta eventos de falha de sincronização.
   * Atualiza a flag no banco.
   */
  @OnEvent('message.sync_failed')
  async handleSyncFailedEvent(payload: {
    protocolo: string;
    error: string;
  }): Promise<void> {
    await this.messagesService.markSyncFailed(
      payload.protocolo,
      payload.error,
    );
  }
}
