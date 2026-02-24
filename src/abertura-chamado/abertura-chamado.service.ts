import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { OnEvent } from '@nestjs/event-emitter';
import { firstValueFrom } from 'rxjs';

import { SessionService } from '../session/session.service.js';
import { ChatwootApiService } from '../chatwoot/chatwoot-api.service.js';
import { parseAberturaChamadoMessage } from './abertura-chamado-message.parser.js';
import {
  IAberturaChamadoParsed,
  IAberturaChamadoRequest,
} from '../common/interfaces/abertura-chamado.interface.js';

@Injectable()
export class AberturaChamadoService {
  private readonly logger = new Logger(AberturaChamadoService.name);
  private readonly apiUrl: string;
  private readonly apiToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly chatwootApiService: ChatwootApiService,
  ) {
    this.apiUrl = this.configService.get<string>('aberturaChamado.apiUrl')!;
    this.apiToken =
      this.configService.get<string>('aberturaChamado.apiToken') ?? '';
  }

  /**
   * Escuta o evento `abertura_chamado.requested` emitido pelo
   * ChatwootWebhookController quando uma mensagem privada contém
   * a tag #abertura_chamado.
   *
   * Fluxo:
   * 1. Faz o parse da mensagem
   * 2. Chama a API externa de abertura de chamado
   * 3. Vincula a conversa do Chatwoot ao novo protocolo
   * 4. Atualiza o custom_attribute `protocolo_azapfy` no Chatwoot
   * 5. Envia mensagem de confirmação na conversa
   */
  @OnEvent('abertura_chamado.requested')
  async handleAberturaChamado(payload: {
    content: string;
    conversationId: number;
  }): Promise<void> {
    const { content, conversationId } = payload;

    this.logger.log(
      `Processing #abertura_chamado for conversationId=${conversationId}`,
    );

    // 1. Parse da mensagem
    const parsed = parseAberturaChamadoMessage(content);

    if (!parsed) {
      this.logger.warn(
        `Failed to parse #abertura_chamado message for conversationId=${conversationId}`,
      );
      await this.chatwootApiService.sendMessage(
        conversationId,
        '❌ Falha ao processar abertura de chamado: dados inválidos ou incompletos na mensagem.',
      );
      return;
    }

    // 2. Construir body e chamar API
    const requestBody = this.buildRequestBody(parsed);
    let protocolo: string;

    try {
      protocolo = await this.callAberturaChamadoApi(requestBody);
      this.logger.log(
        `Chamado opened successfully: protocolo=${protocolo}, conversationId=${conversationId}`,
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to open chamado for conversationId=${conversationId}: ${errorMsg}`,
      );
      await this.chatwootApiService.sendMessage(
        conversationId,
        `❌ Falha ao abrir chamado: ${errorMsg}`,
      );
      return;
    }

    // 3. Vincular conversa Chatwoot ao novo protocolo
    try {
      await this.sessionService.linkChatwoot(protocolo, {
        conversation_id: conversationId,
      });
      this.logger.log(
        `Linked conversationId=${conversationId} <-> protocolo=${protocolo}`,
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to link conversationId=${conversationId} to protocolo=${protocolo}: ${errorMsg}`,
      );
    }

    // 4. Atualizar custom_attributes na conversa do Chatwoot
    await this.chatwootApiService.updateConversationCustomAttributes(
      conversationId,
      { protocolo_azapfy: protocolo },
    );

    // 5. Enviar mensagem de confirmação
    const confirmationMsg = this.buildConfirmationMessage(
      protocolo,
      parsed,
      requestBody,
    );
    await this.chatwootApiService.sendMessage(
      conversationId,
      confirmationMsg,
    );

    this.logger.log(
      `Abertura de chamado completed: protocolo=${protocolo}, conversationId=${conversationId}`,
    );
  }

  /**
   * Monta o body da requisição para a API de abertura de chamado
   * a partir dos dados extraídos da mensagem.
   */
  private buildRequestBody(
    parsed: IAberturaChamadoParsed,
  ): IAberturaChamadoRequest {
    const telefone = this.cleanPhoneNumber(parsed.whatsApp);
    const codRelator = parsed.email || telefone;
    const dtAbertura = this.formatDateTime(new Date());

    return {
      nome_relator: parsed.nome,
      cod_relator: codRelator,
      contato_relator: {
        email: parsed.email,
        telefone,
      },
      grupo_emp: "AZAPERS",
      dt_abertura: dtAbertura,
      incidente: {
        resumo: parsed.resumoChamado,
        descricao: parsed.descricaoChamado,
        item: 'INCIDENTE',
        categoria: parsed.categoria.toUpperCase(),
        ocorrencia: 'PESQUISA',
        empresa: parsed.grupoEmpresa.toLowerCase(),
        icone: 'none',
        prazo: 3,
      },
      anexos: [],
      status_doc: '',
      setor: 'NENHUM',
      timezone: 'America/Sao_Paulo',
    };
  }

  /**
   * Chama a API externa de abertura de chamado.
   * Retorna o número do protocolo criado.
   */
  private async callAberturaChamadoApi(
    body: IAberturaChamadoRequest,
  ): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'referer': 'https://atendimento.azapfy.com.br/',
    };

    if (this.apiToken) {
      headers['Authorization'] = `Bearer ${this.apiToken}`;
    }

    this.logger.log(
      `Calling abertura chamado API: url=${this.apiUrl}, nome_relator=${body.nome_relator}`,
    );

    const response = await firstValueFrom(
      this.httpService.post(this.apiUrl, body, {
        headers,
        timeout: 15000,
      }),
    );

    const data = response.data as Record<string, unknown>;
    const protocolo = data['protocolo'] as string | undefined;

    if (!protocolo) {
      throw new Error(
        'API response does not contain "protocolo" field',
      );
    }

    return protocolo;
  }

  /**
   * Monta a mensagem de confirmação enviada na conversa do Chatwoot
   * após a abertura bem-sucedida do chamado.
   */
  private buildConfirmationMessage(
    protocolo: string,
    parsed: IAberturaChamadoParsed,
    request: IAberturaChamadoRequest,
  ): string {
    return [
      `✅ Chamado aberto com sucesso!`,
      ``,
      `📋 Protocolo: ${protocolo}`,
      `👤 Relator: ${parsed.nome}`,
      `🏢 Grupo Empresa: ${parsed.grupoEmpresa}`,
      `📝 Resumo: ${parsed.resumoChamado}`,
      `📂 Categoria: ${request.incidente.categoria}`,
      `📅 Data de abertura: ${request.dt_abertura}`,
    ].join('\n');
  }

  /**
   * Remove formatação do número de telefone.
   * Ex: +553183857490 → 3183857490
   */
  private cleanPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    if (digits.startsWith('55') && digits.length > 11) {
      return digits.substring(2);
    }

    return digits;
  }

  /**
   * Formata uma data no padrão esperado pela API: "YYYY-MM-DD HH:mm:ss"
   */
  private formatDateTime(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}
