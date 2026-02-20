/**
 * Representa uma mensagem no array `chat[]` do documento de protocolo.
 * Reflete a estrutura existente + campos opcionais do Chatwoot.
 */
export interface IChatMessage {
  /** Remetente (CPF, email, ou identificador) */
  reme: string;

  /** Destinatário (CPF, email, ou identificador) */
  dest: string;

  /** Data de envio */
  dt_env: Date;

  /** Se a mensagem é interna (visível apenas para atendentes) */
  isInterno: boolean;

  /** Nome do autor da mensagem */
  autor: string;

  /** Conteúdo textual da mensagem */
  mensagem: string;

  // --- Campos Chatwoot (opcionais) ---

  /** ID da mensagem no Chatwoot (para prevenção de duplicatas) */
  chatwoot_message_id?: number;

  /** Origem da mensagem: 'chatwoot' | 'internal' */
  source?: 'chatwoot' | 'internal';

  /** Indica se a sincronização com o Chatwoot falhou */
  chatwoot_sync_failed?: boolean;
}

/**
 * Sub-objeto `chatwoot` embutido no documento de protocolo.
 * Armazena o vínculo entre o protocolo interno e a conversa no Chatwoot.
 */
export interface IChatwootLink {
  /** ID da conversa no Chatwoot */
  conversation_id: number;

  /** ID do contato no Chatwoot */
  contact_id: number;

  /** ID do inbox no Chatwoot */
  inbox_id?: number;

  /** Se o vínculo está ativo */
  linked: boolean;
}
