import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/* ------------------------------------------------------------------ */
/*  Sub-DTOs que refletem a estrutura real do webhook do Chatwoot       */
/* ------------------------------------------------------------------ */

class ChatwootAccount {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  name?: string;
}

class ChatwootInbox {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  name?: string;
}

class ChatwootSender {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  type?: string;
}

class ChatwootContactInbox {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsNumber()
  contact_id?: number;

  @IsOptional()
  @IsNumber()
  inbox_id?: number;

  @IsOptional()
  @IsString()
  source_id?: string;
}

class ChatwootMetaSender {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  identifier?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  type?: string;
}

class ChatwootMeta {
  @IsOptional()
  @ValidateNested()
  @Type(() => ChatwootMetaSender)
  sender?: ChatwootMetaSender;

  @IsOptional()
  assignee?: Record<string, unknown> | null;

  @IsOptional()
  team?: Record<string, unknown> | null;
}

class ChatwootCustomAttributes {
  @IsOptional()
  @IsString()
  protocolo_azapfy?: string;
}

class ChatwootConversation {
  @IsNumber()
  id!: number;

  @IsOptional()
  @IsNumber()
  inbox_id?: number;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatwootContactInbox)
  contact_inbox?: ChatwootContactInbox;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatwootMeta)
  meta?: ChatwootMeta;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatwootCustomAttributes)
  custom_attributes?: ChatwootCustomAttributes;

  @IsOptional()
  messages?: Record<string, unknown>[];
}

/* ------------------------------------------------------------------ */
/*  DTO principal do webhook                                           */
/* ------------------------------------------------------------------ */

export class ChatwootWebhookDto {
  @IsString()
  @IsNotEmpty()
  event!: string;

  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  source_id?: string | null;

  @IsOptional()
  @IsEnum(['incoming', 'outgoing', 'activity'])
  message_type?: string;

  @IsOptional()
  @IsString()
  content_type?: string;

  @IsOptional()
  @IsBoolean()
  private?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatwootConversation)
  conversation?: ChatwootConversation;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatwootSender)
  sender?: ChatwootSender;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatwootAccount)
  account?: ChatwootAccount;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatwootInbox)
  inbox?: ChatwootInbox;
}
