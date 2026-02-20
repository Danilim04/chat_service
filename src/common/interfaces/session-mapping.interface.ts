import { IChatMessage, IChatwootLink } from './message.interface.js';

/**
 * Representa o documento de protocolo existente no MongoDB.
 * Contém apenas os campos que o Chatservice precisa manipular.
 */
export interface IProtocolo {
  _id?: string;

  /** Identificador único do protocolo (ex: ZPRS25207143) */
  protocolo: string;

  /** Grupo empresarial */
  grupo_emp: string;

  /** Nome do relator */
  nome_relator: string;

  /** Código do relator (email) */
  cod_relator: string;

  /** Array de mensagens do chat */
  chat: IChatMessage[];

  /** Vínculo com o Chatwoot (campo novo, opcional) */
  chatwoot?: IChatwootLink;

  /** Data de atualização */
  updated_at?: Date;

  /** Data de criação */
  created_at?: Date;
}
