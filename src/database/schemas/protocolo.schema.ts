import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/* ------------------------------------------------------------------ */
/*  Sub-documento: Item do array chat[]                                */
/* ------------------------------------------------------------------ */

@Schema({ _id: false })
export class ChatMessage {
  @Prop({ required: true })
  reme!: string;

  @Prop({ required: true })
  dest!: string;

  @Prop({ required: true })
  dt_env!: Date;

  @Prop({ default: false })
  isInterno!: boolean;

  @Prop({ required: true })
  autor!: string;

  @Prop({ required: true })
  mensagem!: string;

  // --- Campos Chatwoot (opcionais) ---

  @Prop()
  chatwoot_message_id?: number;

  @Prop({ enum: ['chatwoot', 'internal'] })
  source?: string;

  @Prop({ default: false })
  chatwoot_sync_failed?: boolean;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

/* ------------------------------------------------------------------ */
/*  Sub-documento: Vínculo com Chatwoot                                */
/* ------------------------------------------------------------------ */

@Schema({ _id: false })
export class ChatwootLink {
  @Prop({ required: true })
  conversation_id!: number;

  @Prop({ required: true })
  contact_id!: number;

  @Prop()
  inbox_id?: number;

  @Prop({ default: true })
  linked!: boolean;
}

export const ChatwootLinkSchema = SchemaFactory.createForClass(ChatwootLink);

/* ------------------------------------------------------------------ */
/*  Documento principal: Protocolo (collection existente)              */
/* ------------------------------------------------------------------ */

export type ProtocoloDocument = HydratedDocument<Protocolo>;

@Schema({
  collection: 'protocolos',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  strict: false, // Permite campos extras que já existem no documento
})
export class Protocolo {
  @Prop({ required: true, unique: true, index: true })
  protocolo!: string;

  @Prop()
  grupo_emp?: string;

  @Prop()
  nome_relator?: string;

  @Prop()
  cod_relator?: string;

  @Prop({ type: [ChatMessageSchema], default: [] })
  chat!: ChatMessage[];

  @Prop({ type: ChatwootLinkSchema })
  chatwoot?: ChatwootLink;
}

export const ProtocoloSchema = SchemaFactory.createForClass(Protocolo);

// Índice para buscar protocolos vinculados ao Chatwoot
ProtocoloSchema.index({ 'chatwoot.conversation_id': 1 }, { sparse: true });
// Índice para buscar duplicatas de mensagem Chatwoot dentro do chat
ProtocoloSchema.index(
  { 'chat.chatwoot_message_id': 1 },
  { sparse: true },
);
