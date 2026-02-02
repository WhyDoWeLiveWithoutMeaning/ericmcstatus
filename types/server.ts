export interface PelicanServer {
    object: string;
    attributes: {
        id: number;
        uuid: string;
        identifier: string;
        external_id?: string | null;
        name: string;
        description: string;
        status: string | null;
        tags?: string[];
        limits: {
            memory: number;
            swap: number;
            disk: number;
            io: number;
            cpu: number;
        };
        feature_limits: {
            databases: number;
            allocations: number;
            backups: number;
        };
        user: number;
        node: number;
        allocation: number;
        nest: number;
        egg: number;
        container: {
            startup_command: string;
            image: string;
            installed: number;
            environment: Record<string, string>;
        };
        updated_at: string;
        created_at: string;
    };
}

export interface Server {
    id: number;
    uuid: string;
    name: string;
    description: string;
    status: ServerStatus;
    metadata: Record<string, string>; // Parsed from external_id
    domain?: string; // Main shared domain (e.g., er-ic.ca)
    subdomain?: string; // Specific server domain (e.g., atm10sky.er-ic.ca)
    group?: string;
    subgroup?: string;
    image: string; // Container image
    eggId?: number; // Egg ID for icon fallback
    eggUuid?: string; // Egg UUID for icon fallback
    isInstalled: boolean;
    updatedAt: string;
    players?: number; // Current player count
    maxPlayers?: number; // Max player count
    playerList?: string[]; // List of online player names
}

export type ServerStatus = 'online' | 'offline' | 'starting' | 'stopping' | 'installing' | 'unknown';

export interface ServersResponse {
    servers: Server[];
    error?: string;
}
