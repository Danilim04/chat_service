/**
 * Dados extraídos da mensagem #abertura_chamado.
 * Resultado do parse do conteúdo textual enviado pelo atendente.
 */
export interface IAberturaChamadoParsed {
  nome: string;
  grupoEmpresa: string;
  email: string;
  whatsApp: string;
  resumoChamado: string;
  descricaoChamado: string;
  categoria: string;
}

/**
 * Body enviado à API externa de abertura de chamado.
 * Reflete a estrutura esperada pelo backend de protocolos.
 */
export interface IAberturaChamadoRequest {
  nome_relator: string;
  cod_relator: string;
  contato_relator: {
    email: string;
    telefone: string;
  };
  grupo_emp: string;
  dt_abertura: string;
  incidente: {
    resumo: string;
    descricao: string;
    item: string;
    categoria: string;
    ocorrencia: string;
    empresa: string;
    icone: string;
    prazo: number;
  };
  anexos: unknown[];
  status_doc: string;
  setor: string;
  timezone: string;
}

/**
 * Resposta esperada da API de abertura de chamado.
 */
export interface IAberturaChamadoResponse {
  protocolo: string;
  [key: string]: unknown;
}
