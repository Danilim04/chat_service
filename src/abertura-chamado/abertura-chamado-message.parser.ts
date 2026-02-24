import { Logger } from '@nestjs/common';

import { IAberturaChamadoParsed } from '../common/interfaces/abertura-chamado.interface.js';

const logger = new Logger('AberturaChamadoMessageParser');

const ABERTURA_CHAMADO_TAG = '#abertura_chamado';

/**
 * Verifica se o conteúdo da mensagem contém a tag #abertura_chamado.
 */
export function isAberturaChamadoContent(content: string): boolean {
  return content.includes(ABERTURA_CHAMADO_TAG);
}

/**
 * Faz o parse do conteúdo da mensagem #abertura_chamado.
 *
 * Formato esperado:
 * ```
 * #abertura_chamado
 *
 * nome: Daniel Ferraz;
 * grupo_empresa: JC;
 * email: user@email.com;
 * whatsApp: +553183857490;
 * resumo Chamado: Teste de abertura;
 * descricao Chamado: Teste de abertura;
 * categoria: Sistema Web
 * ```
 *
 * Retorna `null` se não conseguir extrair os dados mínimos necessários.
 */
export function parseAberturaChamadoMessage(
  content: string,
): IAberturaChamadoParsed | null {
  if (!isAberturaChamadoContent(content)) {
    return null;
  }

  try {
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter(
        (line) =>
          line.length > 0 &&
          line !== ABERTURA_CHAMADO_TAG,
      );

    const data: Record<string, string> = {};

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;

      const key = line.substring(0, colonIndex).trim().toLowerCase();
      const value = line
        .substring(colonIndex + 1)
        .trim()
        .replace(/;\s*$/, '')
        .trim();

      data[key] = value;
    }

    const nome = data['nome'] ?? '';
    const grupoEmpresa = data['grupo_empresa'] ?? '';
    const email = data['email'] ?? '';
    const whatsApp = data['whatsapp'] ?? '';
    const resumoChamado = data['resumo chamado'] ?? '';
    const descricaoChamado = data['descricao chamado'] ?? '';
    const categoria = data['categoria'] ?? '';

    if (!nome) {
      logger.warn(
        'Missing required field "nome" in #abertura_chamado message',
      );
      return null;
    }

    if (!resumoChamado) {
      logger.warn(
        'Missing required field "resumo chamado" in #abertura_chamado message',
      );
      return null;
    }

    return {
      nome,
      grupoEmpresa,
      email,
      whatsApp,
      resumoChamado,
      descricaoChamado,
      categoria,
    };
  } catch (error) {
    logger.error(
      'Failed to parse #abertura_chamado message',
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}
