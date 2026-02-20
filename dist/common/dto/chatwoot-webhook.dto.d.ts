declare class ChatwootSender {
    id?: number;
    name?: string;
}
declare class ChatwootConversation {
    id: number;
    inbox_id?: number;
    contact_id?: number;
}
export declare class ChatwootWebhookDto {
    event: string;
    id?: number;
    content?: string;
    source_id?: string;
    message_type?: string;
    content_type?: string;
    conversation?: ChatwootConversation;
    sender?: ChatwootSender;
    account?: Record<string, unknown>;
    inbox?: Record<string, unknown>;
}
export {};
