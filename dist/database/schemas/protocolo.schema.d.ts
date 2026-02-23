import { HydratedDocument } from 'mongoose';
export declare class ChatMessage {
    reme: string;
    dest: string;
    dt_env: Date;
    isInterno: boolean;
    autor: string;
    mensagem: string;
    chatwoot_message_id?: number;
    source?: string;
    chatwoot_sync_failed?: boolean;
}
export declare const ChatMessageSchema: import("mongoose").Schema<ChatMessage, import("mongoose").Model<ChatMessage, any, any, any, (import("mongoose").Document<unknown, any, ChatMessage, any, import("mongoose").DefaultSchemaOptions> & ChatMessage & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (import("mongoose").Document<unknown, any, ChatMessage, any, import("mongoose").DefaultSchemaOptions> & ChatMessage & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, ChatMessage>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChatMessage, import("mongoose").Document<unknown, {}, ChatMessage, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    reme?: import("mongoose").SchemaDefinitionProperty<string, ChatMessage, import("mongoose").Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dest?: import("mongoose").SchemaDefinitionProperty<string, ChatMessage, import("mongoose").Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    dt_env?: import("mongoose").SchemaDefinitionProperty<Date, ChatMessage, import("mongoose").Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isInterno?: import("mongoose").SchemaDefinitionProperty<boolean, ChatMessage, import("mongoose").Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    autor?: import("mongoose").SchemaDefinitionProperty<string, ChatMessage, import("mongoose").Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mensagem?: import("mongoose").SchemaDefinitionProperty<string, ChatMessage, import("mongoose").Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    chatwoot_message_id?: import("mongoose").SchemaDefinitionProperty<number | undefined, ChatMessage, import("mongoose").Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    source?: import("mongoose").SchemaDefinitionProperty<string | undefined, ChatMessage, import("mongoose").Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    chatwoot_sync_failed?: import("mongoose").SchemaDefinitionProperty<boolean | undefined, ChatMessage, import("mongoose").Document<unknown, {}, ChatMessage, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatMessage & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ChatMessage>;
export declare class ChatwootLink {
    conversation_id: number;
    contact_id?: number;
    inbox_id?: number;
    linked: boolean;
}
export declare const ChatwootLinkSchema: import("mongoose").Schema<ChatwootLink, import("mongoose").Model<ChatwootLink, any, any, any, (import("mongoose").Document<unknown, any, ChatwootLink, any, import("mongoose").DefaultSchemaOptions> & ChatwootLink & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (import("mongoose").Document<unknown, any, ChatwootLink, any, import("mongoose").DefaultSchemaOptions> & ChatwootLink & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, ChatwootLink>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChatwootLink, import("mongoose").Document<unknown, {}, ChatwootLink, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ChatwootLink & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    conversation_id?: import("mongoose").SchemaDefinitionProperty<number, ChatwootLink, import("mongoose").Document<unknown, {}, ChatwootLink, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatwootLink & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    contact_id?: import("mongoose").SchemaDefinitionProperty<number | undefined, ChatwootLink, import("mongoose").Document<unknown, {}, ChatwootLink, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatwootLink & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    inbox_id?: import("mongoose").SchemaDefinitionProperty<number | undefined, ChatwootLink, import("mongoose").Document<unknown, {}, ChatwootLink, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatwootLink & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    linked?: import("mongoose").SchemaDefinitionProperty<boolean, ChatwootLink, import("mongoose").Document<unknown, {}, ChatwootLink, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ChatwootLink & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ChatwootLink>;
export type ProtocoloDocument = HydratedDocument<Protocolo>;
export declare class Protocolo {
    protocolo: string;
    grupo_emp?: string;
    nome_relator?: string;
    cod_relator?: string;
    chat: ChatMessage[];
    chatwoot?: ChatwootLink;
}
export declare const ProtocoloSchema: import("mongoose").Schema<Protocolo, import("mongoose").Model<Protocolo, any, any, any, (import("mongoose").Document<unknown, any, Protocolo, any, import("mongoose").DefaultSchemaOptions> & Protocolo & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (import("mongoose").Document<unknown, any, Protocolo, any, import("mongoose").DefaultSchemaOptions> & Protocolo & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, Protocolo>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Protocolo, import("mongoose").Document<unknown, {}, Protocolo, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Protocolo & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    protocolo?: import("mongoose").SchemaDefinitionProperty<string, Protocolo, import("mongoose").Document<unknown, {}, Protocolo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Protocolo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    grupo_emp?: import("mongoose").SchemaDefinitionProperty<string | undefined, Protocolo, import("mongoose").Document<unknown, {}, Protocolo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Protocolo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    nome_relator?: import("mongoose").SchemaDefinitionProperty<string | undefined, Protocolo, import("mongoose").Document<unknown, {}, Protocolo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Protocolo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    cod_relator?: import("mongoose").SchemaDefinitionProperty<string | undefined, Protocolo, import("mongoose").Document<unknown, {}, Protocolo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Protocolo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    chat?: import("mongoose").SchemaDefinitionProperty<ChatMessage[], Protocolo, import("mongoose").Document<unknown, {}, Protocolo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Protocolo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    chatwoot?: import("mongoose").SchemaDefinitionProperty<ChatwootLink | undefined, Protocolo, import("mongoose").Document<unknown, {}, Protocolo, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Protocolo & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Protocolo>;
