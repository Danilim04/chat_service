import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMessageDto {
  /** Protocolo do ticket ao qual a mensagem pertence */
  @IsString()
  @IsNotEmpty()
  protocolo!: string;

  /** Conteúdo da mensagem */
  @IsString()
  @IsNotEmpty()
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
}
