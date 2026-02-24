import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import appConfig from './app.config.js';
import databaseConfig from './database.config.js';
import redisConfig from './redis.config.js';
import chatwootConfig from './chatwoot.config.js';
import aberturaChamadoConfig from './abertura-chamado.config.js';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, chatwootConfig, aberturaChamadoConfig],
      envFilePath: '.env',
    }),
  ],
})
export class AppConfigModule {}
