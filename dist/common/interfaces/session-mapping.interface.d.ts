import { IChatMessage, IChatwootLink } from './message.interface.js';
export interface IProtocolo {
    _id?: string;
    protocolo: string;
    grupo_emp: string;
    nome_relator: string;
    cod_relator: string;
    chat: IChatMessage[];
    chatwoot?: IChatwootLink;
    updated_at?: Date;
    created_at?: Date;
}
