import { OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';
export declare class DatabaseModule implements OnModuleInit {
    private readonly connection;
    private readonly logger;
    constructor(connection: Connection);
    onModuleInit(): void;
}
