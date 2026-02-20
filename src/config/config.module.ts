import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import appConfig from './app.config.js';
import databaseConfig from './database.config.js';
import redisConfig from './redis.config.js';
import chatwootConfig from './chatwoot.config.js';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, chatwootConfig],
      envFilePath: '.env',
    }),
  ],
})
export class AppConfigModule {}
