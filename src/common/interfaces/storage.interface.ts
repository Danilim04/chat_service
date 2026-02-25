/**
 * Interface abstrata para serviço de storage.
 * Permite trocar o driver (S3, GCS, local) sem afetar o restante do sistema.
 */
export interface IStorageService {
    /**
     * Faz upload de um arquivo para o storage.
     * @param key - Caminho/chave do arquivo no bucket (ex: 'sac/AZAPERS/ZPRS123/foto.png')
     * @param body - Conteúdo do arquivo em Buffer
     * @param contentType - MIME type do arquivo (ex: 'image/png')
     * @returns URL pública ou chave do arquivo armazenado
     */
    upload(key: string, body: Buffer, contentType: string): Promise<string>;
}

/**
 * Token de injeção para o serviço de storage.
 * Usado com `@Inject(STORAGE_SERVICE)` nos consumers.
 */
export const STORAGE_SERVICE = 'STORAGE_SERVICE';
