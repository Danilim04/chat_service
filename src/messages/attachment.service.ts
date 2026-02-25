import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import {
    STORAGE_SERVICE,
} from '../common/interfaces/storage.interface.js';
import type { IStorageService } from '../common/interfaces/storage.interface.js';
import type { IWebhookAttachment } from '../common/interfaces/webhook-event.interface.js';

@Injectable()
export class AttachmentService {
    private readonly logger = new Logger(AttachmentService.name);

    constructor(
        @Inject(STORAGE_SERVICE)
        private readonly storageService: IStorageService,
        private readonly httpService: HttpService,
    ) { }

    /**
     * Processa uma lista de anexos: faz download de cada um e upload para o S3.
     * Retorna o array de nomes de arquivo que foram enviados com sucesso.
     *
     * @param protocolo - Protocolo do chamado (ex: 'ZPRS25207177')
     * @param attachments - Anexos extraídos do webhook
     * @returns Array de nomes de arquivos enviados ao S3
     */
    async processAttachments(
        protocolo: string,
        attachments: IWebhookAttachment[],
    ): Promise<string[]> {
        const uploadedFileNames: string[] = [];

        for (const attachment of attachments) {
            try {
                const buffer = await this.downloadFile(attachment.url);

                const s3Key = `sac/AZAPERS/${protocolo}/${attachment.fileName}`;

                await this.storageService.upload(s3Key, buffer, attachment.contentType);

                uploadedFileNames.push(attachment.fileName);

                this.logger.log(
                    `Attachment processed: fileName=${attachment.fileName}, s3Key=${s3Key}`,
                );
            } catch (error) {
                this.logger.error(
                    `Failed to process attachment: fileName=${attachment.fileName}, url=${attachment.url}`,
                    error instanceof Error ? error.stack : String(error),
                );
                // Continua processando os demais anexos — não bloqueia por falha individual
            }
        }

        return uploadedFileNames;
    }

    /**
     * Faz download de um arquivo a partir de uma URL.
     * @param url - URL do arquivo (fornecida pelo Chatwoot)
     * @returns Buffer com o conteúdo do arquivo
     */
    private async downloadFile(url: string): Promise<Buffer> {
        this.logger.log(`Downloading file from: ${url}`);

        const response = await firstValueFrom(
            this.httpService.get<ArrayBuffer>(url, {
                responseType: 'arraybuffer',
                timeout: 30000,
            }),
        );

        return Buffer.from(response.data);
    }
}
