import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import {
  Protocolo,
  ProtocoloSchema,
} from './schemas/protocolo.schema.js';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Protocolo.name, schema: ProtocoloSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
