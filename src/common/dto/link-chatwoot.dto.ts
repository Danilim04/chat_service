import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LinkChatwootDto {
  /** Número do protocolo interno */
  @IsString()
  @IsNotEmpty()
  protocolo!: string;

  /** ID da conversa no Chatwoot */
  @IsInt()
  @IsNotEmpty()
  conversation_id!: number;

  /** ID do contato no Chatwoot (opcional — obtido automaticamente via API do Chatwoot) */
  @IsInt()
  @IsOptional()
  contact_id?: number;

  /** ID do inbox no Chatwoot (opcional — obtido automaticamente via API do Chatwoot) */
  @IsInt()
  @IsOptional()
  inbox_id?: number;
}
