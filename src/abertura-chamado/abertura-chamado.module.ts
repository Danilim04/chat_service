import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AberturaChamadoService } from './abertura-chamado.service.js';
import { SessionModule } from '../session/session.module.js';
import { ChatwootModule } from '../chatwoot/chatwoot.module.js';

@Module({
  imports: [
    HttpModule.register({ timeout: 15000 }),
    SessionModule,
    forwardRef(() => ChatwootModule),
  ],
  providers: [AberturaChamadoService],
  exports: [AberturaChamadoService],
})
export class AberturaChamadoModule {}
