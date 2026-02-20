export interface IChatMessage {
    reme: string;
    dest: string;
    dt_env: Date;
    isInterno: boolean;
    autor: string;
    mensagem: string;
    chatwoot_message_id?: number;
    source?: 'chatwoot' | 'internal';
    chatwoot_sync_failed?: boolean;
}
export interface IChatwootLink {
    conversation_id: number;
    contact_id: number;
    inbox_id?: number;
    linked: boolean;
}
