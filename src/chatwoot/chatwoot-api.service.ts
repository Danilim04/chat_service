import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import FormData from 'form-data';

@Injectable()
export class ChatwootApiService {
  private readonly logger = new Logger(ChatwootApiService.name);
  private readonly baseUrl: string;
  private readonly apiToken: string;
  private readonly accountId: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.baseUrl = this.configService.get<string>('chatwoot.baseUrl')!;
    this.apiToken = this.configService.get<string>('chatwoot.apiToken')!;
    this.accountId = this.configService.get<number>('chatwoot.accountId')!;
  }

  /**
   * Envia uma mensagem para uma conversa específica no Chatwoot.
   * Em caso de falha, emite evento `message.sync_failed`.
   */
  async sendMessage(
    conversationId: number,
    content: string,
    protocolo?: string,
    msgPrivate?: boolean,
  ): Promise<Record<string, unknown> | null> {
    const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}/conversations/${conversationId}/messages`;

    this.logger.log(
      `Sending message to Chatwoot conversationId=${conversationId}, protocolo=${protocolo}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            content,
            message_type: 'outgoing',
            private: msgPrivate ?? false,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              api_access_token: this.apiToken,
            },
            timeout: 10000,
          },
        ),
      );

      this.logger.log(
        `Message sent to Chatwoot: conversationId=${conversationId}, chatwootMessageId=${response.data?.id}`,
      );

      return response.data as Record<string, unknown>;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Failed to send message to Chatwoot: conversationId=${conversationId}, error=${errorMessage}`,
      );

      // Emite evento de falha para marcação no banco
      if (protocolo) {
        this.eventEmitter.emit('message.sync_failed', {
          protocolo,
          error: errorMessage,
        });
      }

      return null;
    }
  }

  /**
   * Envia uma mensagem COM ANEXOS para uma conversa no Chatwoot.
   * Usa multipart/form-data conforme exigido pela API do Chatwoot.
   * O campo de arquivo é `attachments[]`.
   */
  async sendMessageWithAttachments(
    conversationId: number,
    content: string,
    files: { buffer: Buffer; fileName: string; contentType: string }[],
    protocolo?: string,
    msgPrivate?: boolean,
  ): Promise<Record<string, unknown> | null> {
    const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}/conversations/${conversationId}/messages`;

    this.logger.log(
      `Sending message with ${files.length} attachment(s) to Chatwoot conversationId=${conversationId}, protocolo=${protocolo}`,
    );

    try {
      const formData = new FormData();
      formData.append('content', content ?? '');
      formData.append('message_type', 'outgoing');
      formData.append('private', String(msgPrivate ?? false));

      for (const file of files) {
        formData.append('attachments[]', file.buffer, {
          filename: file.fileName,
          contentType: file.contentType,
        });
      }

      const response = await firstValueFrom(
        this.httpService.post(url, formData, {
          headers: {
            ...formData.getHeaders(),
            api_access_token: this.apiToken,
          },
          timeout: 30000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }),
      );

      this.logger.log(
        `Message with attachments sent to Chatwoot: conversationId=${conversationId}, chatwootMessageId=${response.data?.id}`,
      );

      return response.data as Record<string, unknown>;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.error(
        `Failed to send message with attachments to Chatwoot: conversationId=${conversationId}, error=${errorMessage}`,
      );

      if (protocolo) {
        this.eventEmitter.emit('message.sync_failed', {
          protocolo,
          error: errorMessage,
        });
      }

      return null;
    }
  }

  /**
   * Atualiza custom_attributes de uma conversa no Chatwoot.
   */
  async updateConversationCustomAttributes(
    conversationId: number,
    customAttributes: Record<string, unknown>,
  ): Promise<Record<string, unknown> | null> {
    const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}/conversations/${conversationId}/custom_attributes`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          { custom_attributes: customAttributes },
          {
            headers: {
              'Content-Type': 'application/json',
              api_access_token: this.apiToken,
            },
            timeout: 10000,
          },
        ),
      );

      this.logger.log(
        `Custom attributes updated on Chatwoot conversation=${conversationId}`,
      );

      return response.data as Record<string, unknown>;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to update custom attributes on Chatwoot conversation=${conversationId}: ${errorMessage}`,
      );
      return null;
    }
  }

  /**
   * Busca detalhes de uma conversa no Chatwoot.
   */
  async getConversation(
    conversationId: number,
  ): Promise<Record<string, unknown> | null> {
    const url = `${this.baseUrl}/api/v1/accounts/${this.accountId}/conversations/${conversationId}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: { api_access_token: this.apiToken },
          timeout: 10000,
        }),
      );

      return response.data as Record<string, unknown>;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to get conversation from Chatwoot: ${errorMessage}`,
      );
      return null;
    }
  }
}
