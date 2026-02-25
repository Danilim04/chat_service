import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import { IStorageService } from '../common/interfaces/storage.interface.js';

@Injectable()
export class S3StorageService implements IStorageService {
    private readonly logger = new Logger(S3StorageService.name);
    private readonly s3Client: S3Client;
    private readonly bucket: string;
    private readonly uploadTimeoutMs: number;

    constructor(private readonly configService: ConfigService) {
        const accessKey = this.configService.get<string>('storage.accessKey', '');
        const secretKey = this.configService.get<string>('storage.secretKey', '');
        const region = this.configService.get<string>('storage.region', 'us-east-1');

        this.bucket = this.configService.get<string>('storage.bucket', '');
        this.uploadTimeoutMs = this.configService.get<number>('storage.uploadTimeoutMs', 30_000);

        this.s3Client = new S3Client({
            region,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
        });

        this.logger.log(
            `S3StorageService initialized: region=${region}, bucket=${this.bucket}, timeout=${this.uploadTimeoutMs}ms`,
        );
    }

    /**
     * Faz upload de um arquivo para o S3.
     * @param key - Caminho no bucket (ex: 'sac/AZAPERS/ZPRS123/foto.png')
     * @param body - Buffer do arquivo
     * @param contentType - MIME type
     * @returns URL do objeto no S3
     */
    async upload(key: string, body: Buffer, contentType: string): Promise<string> {
        this.logger.log(`Uploading to S3: bucket=${this.bucket}, key=${key}`);

        const abortController = new AbortController();
        const timeout = setTimeout(() => abortController.abort(), this.uploadTimeoutMs);

        try {
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: body,
                ContentType: contentType,
            });

            await this.s3Client.send(command, {
                abortSignal: abortController.signal,
            });

            const url = `https://${this.bucket}.s3.amazonaws.com/${key}`;
            this.logger.log(`Upload successful: ${url}`);
            return url;
        } catch (error) {
            if (abortController.signal.aborted) {
                this.logger.error(
                    `Upload to S3 timed out after ${this.uploadTimeoutMs}ms: key=${key}`,
                );
                throw new Error(`Upload to S3 timed out after ${this.uploadTimeoutMs}ms`);
            }
            this.logger.error(
                `Failed to upload to S3: key=${key}`,
                error instanceof Error ? error.stack : String(error),
            );
            throw error;
        } finally {
            clearTimeout(timeout);
        }
    }
}
