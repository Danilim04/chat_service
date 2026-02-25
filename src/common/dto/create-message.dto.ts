import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMessageAttachmentDto {
  /** Conteúdo do arquivo em base64 */
  @IsString()
  @IsNotEmpty()
  base64!: string;

  /** Nome do arquivo (ex: 'foto.png') */
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  /** MIME type do arquivo (ex: 'image/png') */
  @IsString()
  @IsNotEmpty()
  contentType!: string;
}

export class CreateMessageDto {
  /** Protocolo do ticket ao qual a mensagem pertence */
  @IsString()
  @IsNotEmpty()
  protocolo!: string;

  /** Conteúdo da mensagem */
  @IsString()
  @IsOptional()
  mensagem!: string;

  /** Identificador do remetente */
  @IsString()
  @IsNotEmpty()
  reme!: string;

  /** Identificador do destinatário */
  @IsString()
  @IsNotEmpty()
  dest!: string;

  /** Nome do autor */
  @IsString()
  @IsNotEmpty()
  autor!: string;

  /** Se a mensagem é interna */
  @IsBoolean()
  @IsOptional()
  isInterno?: boolean;

  /** Anexos codificados em base64 (enviados pelo front-end via WebSocket) */
  @IsArray()
  @IsOptional()
  anexos?: CreateMessageAttachmentDto[];
}
