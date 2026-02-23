import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';

import {
  Protocolo,
  ProtocoloSchema,
} from './schemas/protocolo.schema.js';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        dbName: configService.get<string>('database.dbName'),
        connectTimeoutMS: 10_000,
        socketTimeoutMS: 30_000,
        serverSelectionTimeoutMS: 10_000,
        heartbeatFrequencyMS: 10_000,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Protocolo.name, schema: ProtocoloSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit(): void {
    this.connection.on('connected', () =>
      this.logger.log('MongoDB connected'),
    );
    this.connection.on('error', (err) =>
      this.logger.error(`MongoDB error: ${err.message}`),
    );
    this.connection.on('disconnected', () =>
      this.logger.warn('MongoDB disconnected'),
    );
    this.connection.on('reconnected', () =>
      this.logger.log('MongoDB reconnected'),
    );

    this.logger.log(`MongoDB readyState: ${this.connection.readyState}`);
  }
}
