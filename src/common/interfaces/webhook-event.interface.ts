/**
 * Estrutura interna que representa um evento de mensagem recebido via webhook.
 *
 * Esta interface é AGNÓSTICA ao provedor (Chatwoot, etc.).
 * Toda tradução do payload externo deve acontecer ANTES de chegar aqui,
 * de modo que o service e o restante do sistema nunca conheçam o formato
 * do provedor externo.
 */
export interface IWebhookMessageEvent {
  /** Tipo do evento (ex: 'message_created') */
  event: string;

  /** ID externo da mensagem (usado para prevenção de duplicatas) */
  externalMessageId?: number;

  /** Conteúdo textual da mensagem */
  content: string;

  /** Tipo da mensagem: recebida pelo contato, enviada pelo atendente, ou atividade */
  messageType: 'incoming' | 'outgoing' | 'activity';

  /** Se a mensagem é privada (nota interna entre atendentes) */
  isPrivate: boolean;

  /** Protocolo vinculado a esta conversa (ex: ZPRS25205360) */
  protocolo: string;

  /** ID da conversa no provedor externo */
  conversationId: number;

  /** Informações do remetente */
  sender: {
    /** Identificador único (ex: email, phone@whatsapp, chatwoot_123) */
    identifier: string;
    /** Nome de exibição */
    name: string;
  };
}
