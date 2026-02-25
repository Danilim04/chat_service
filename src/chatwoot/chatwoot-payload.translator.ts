import { Logger } from '@nestjs/common';

import { ChatwootWebhookDto } from '../common/dto/chatwoot-webhook.dto.js';
import { IWebhookMessageEvent, IWebhookAttachment } from '../common/interfaces/webhook-event.interface.js';

const logger = new Logger('ChatwootPayloadTranslator');

/**
 * Traduz o payload bruto do webhook do Chatwoot para a estrutura interna
 * `IWebhookMessageEvent`.
 *
 * Retorna `null` quando o payload não contém as informações mínimas
 * necessárias para ser processado (evento não suportado, sem protocolo, etc.).
 *
 * Se o Chatwoot alterar o formato do payload, apenas esta função precisa
 * ser atualizada — o service e o restante do sistema permanecem intactos.
 */
export function translateChatwootPayload(
    payload: ChatwootWebhookDto,
): IWebhookMessageEvent | null {
    if (payload.event !== 'message_created') {
        logger.debug(`Ignoring event: ${payload.event}`);
        return null;
    }

    if (payload.message_type === 'activity') {
        logger.debug('Ignoring activity message');
        return null;
    }

    const hasContent = !!payload.content && payload.content.trim() !== '';

    const matchingMessage = payload.conversation?.messages?.find(
        (msg) => (msg as any).id === payload.id,
    ) ?? payload.conversation?.messages?.[0];

    const rawAttachments = matchingMessage?.attachments ?? [];
    const hasAttachments = rawAttachments.length > 0;

    if (!hasContent && !hasAttachments) {
        logger.debug('Ignoring message with no content and no attachments');
        return null;
    }

    if (!payload.conversation?.id) {
        logger.warn('Webhook missing conversation.id — skipping');
        return null;
    }

    const protocolo =
        payload.conversation.custom_attributes?.protocolo_azapfy;

    if (!protocolo) {
        logger.debug(
            `No protocolo_azapfy in conversation_id=${payload.conversation.id} — skipping`,
        );
        return null;
    }

    const senderIdentifier = resolveSenderIdentifier(payload);
    const senderName = resolveSenderName(payload);

    const attachments: IWebhookAttachment[] = rawAttachments
        .filter((att) => !!att.data_url)
        .map((att) => {
            const url = att.data_url!;
            const fileName = extractFileNameFromUrl(url);
            return {
                url,
                fileName,
                contentType: att.content_type ?? 'application/octet-stream',
            };
        });

    return {
        event: payload.event,
        externalMessageId: payload.id,
        content: payload.content ?? '',
        messageType: (payload.message_type as 'incoming' | 'outgoing') ?? 'incoming',
        isPrivate: payload.private ?? false,
        protocolo,
        conversationId: payload.conversation.id,
        sender: {
            identifier: senderIdentifier,
            name: senderName,
        },
        ...(attachments.length > 0 ? { attachments } : {}),
    };
}

/* ------------------------------------------------------------------ */
/*  Helpers internos — extraem dados dos caminhos do Chatwoot          */
/* ------------------------------------------------------------------ */

function resolveSenderIdentifier(payload: ChatwootWebhookDto): string {
    if (payload.conversation?.meta?.sender?.identifier) {
        return payload.conversation.meta.sender.identifier;
    }

    if (payload.sender?.email) {
        return payload.sender.email;
    }

    const contactId =
        payload.conversation?.contact_inbox?.contact_id ??
        payload.conversation?.meta?.sender?.id ??
        payload.sender?.id ??
        0;

    return `chatwoot_${contactId}`;
}

function resolveSenderName(payload: ChatwootWebhookDto): string {
    if (payload.message_type === 'outgoing' && payload.sender?.name) {
        return payload.sender.name;
    }

    return (
        payload.conversation?.meta?.sender?.name ??
        payload.sender?.name ??
        'Desconhecido'
    );
}

function extractFileNameFromUrl(url: string): string {
    try {
        const pathname = new URL(url).pathname;
        const segments = pathname.split('/');
        const lastSegment = segments[segments.length - 1];
        if (lastSegment && lastSegment.includes('.')) {
            return decodeURIComponent(lastSegment);
        }
    } catch {
        // URL inválida — fallback abaixo
    }
    return `attachment_${Date.now()}`;
}
