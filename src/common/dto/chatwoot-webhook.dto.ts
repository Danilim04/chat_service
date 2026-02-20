import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ChatwootSender {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  name?: string;
}

class ChatwootConversation {
  @IsNumber()
  id!: number;

  @IsOptional()
  @IsNumber()
  inbox_id?: number;

  @IsOptional()
  @IsNumber()
  contact_id?: number;
}

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
  source_id?: string;

  @IsOptional()
  @IsEnum(['incoming', 'outgoing', 'activity'])
  message_type?: string;

  @IsOptional()
  @IsString()
  content_type?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatwootConversation)
  conversation?: ChatwootConversation;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatwootSender)
  sender?: ChatwootSender;

  @IsOptional()
  @IsNumber()
  account?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  inbox?: Record<string, unknown>;
}
