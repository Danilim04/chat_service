import { registerAs } from '@nestjs/config';

export default registerAs('aberturaChamado', () => ({
  apiUrl: process.env.ABERTURA_CHAMADO_API_URL ?? '',
  apiToken: process.env.ABERTURA_CHAMADO_API_TOKEN ?? '',
}));
