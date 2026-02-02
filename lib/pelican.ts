import { PelicanServer, Server, ServerStatus } from '@/types/server';

const PELICAN_PANEL_URL = process.env.PELICAN_PANEL_URL;
const PELICAN_API_KEY = process.env.PELICAN_API_KEY;
const PELICAN_CLIENT_API_KEY = process.env.PELICAN_CLIENT_API_KEY;

interface PelicanResponse {
    object: string;
    data: PelicanServer[];
    meta?: {
        pagination: {
            total: number;
            count: number;
            per_page: number;
            current_page: number;
            total_pages: number;
        };
    };
}

export class PelicanAPIError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message);
        this.name = 'PelicanAPIError';
    }
}

/**
 * Parse external_id key:value pairs into metadata object
 * Format: "display:true,category:survival,mode:public"
 */
function parseMetadata(externalId: string | null | undefined): Record<string, string> {
    if (!externalId) return {};

    const metadata: Record<string, string> = {};

    try {
        const pairs = externalId.split(',');
        pairs.forEach(pair => {
            const [key, value] = pair.split(':').map(s => s.trim());
            if (key && value) {
                metadata[key] = value;
            }
        });
    } catch (error) {
        console.warn('Failed to parse external_id:', externalId, error);
    }

    return metadata;
}

/**
 * Fetch real-time status from Pelican Panel resources endpoint
 * This endpoint works with Application API key and provides current_state
 */
async function fetchServerStatus(uuid: string): Promise<{ status: string | null; currentState: string | null }> {
    if (!PELICAN_PANEL_URL || !PELICAN_CLIENT_API_KEY) {
        console.warn('Client API key not configured, skipping status fetch');
        return { status: null, currentState: null };
    }

    try {
        const response = await fetch(`${PELICAN_PANEL_URL}/api/client/servers/${uuid}/resources`, {
            headers: {
                'Authorization': `Bearer ${PELICAN_CLIENT_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            next: { revalidate: 0 },
        });

        if (!response.ok) {
            console.warn(`Failed to fetch status for ${uuid}: ${response.status} ${response.statusText}`);
            try {
                const errorData = await response.text();
                console.warn(`Resources API error response:`, errorData);
            } catch (e) {
                // Ignore parse error
            }
            return { status: null, currentState: null };
        }

        const data = await response.json();
        const attributes = data.attributes || {};

        return {
            status: attributes.current_state || null,
            currentState: attributes.current_state || null,
        };
    } catch (error) {
        console.warn(`Error fetching status for ${uuid}:`, error);
        return { status: null, currentState: null };
    }
}

/**
 * Fetch all servers from Pelican Panel Application API
 */
export async function fetchServers(): Promise<Server[]> {
    if (!PELICAN_PANEL_URL || !PELICAN_API_KEY) {
        throw new PelicanAPIError('Pelican Panel configuration is missing');
    }

    try {
        const response = await fetch(`${PELICAN_PANEL_URL}/api/application/servers`, {
            headers: {
                'Authorization': `Bearer ${PELICAN_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            next: { revalidate: 0 }, // Don't cache, always fetch fresh data
        });

        if (!response.ok) {
            throw new PelicanAPIError(
                `Failed to fetch servers: ${response.statusText}`,
                response.status
            );
        }

        const data: PelicanResponse = await response.json();

        // Log the actual response to understand structure
        console.log('Pelican API Response:', JSON.stringify(data, null, 2));

        if (!data.data || !Array.isArray(data.data)) {
            throw new PelicanAPIError('Invalid response format from Pelican API');
        }

        // Log first server to see structure
        if (data.data.length > 0) {
            console.log('First server structure:', JSON.stringify(data.data[0], null, 2));
        }

        // Transform Pelican API response to our internal format
        const allServers = data.data.map(transformPelicanServer);

        // Filter to only show servers with "display:true" in external_id
        const displayServers = allServers.filter(server => {
            const shouldDisplay = server.metadata['display'] === 'true';
            console.log(`Server "${server.name}" metadata:`, server.metadata, 'display:', shouldDisplay);
            return shouldDisplay;
        });

        console.log(`Filtered ${displayServers.length} servers with display:true out of ${allServers.length} total`);

        // Fetch real-time status from resources endpoint for displayed servers
        const serversWithStatus = await Promise.all(
            displayServers.map(async (server) => {
                const pelicanData = data.data.find((s: any) => {
                    const serverData = s.attributes || s;
                    return serverData.id === server.id;
                });
                const serverData = (pelicanData?.attributes || pelicanData) as any;
                const uuid = serverData?.uuid as string | undefined;

                if (!uuid) {
                    console.warn(`No UUID found for server ${server.name}`);
                    return server;
                }

                const statusData = await fetchServerStatus(uuid);
                const actualStatus = statusData.currentState || statusData.status;

                console.log(`Server "${server.name}" status from resources API:`, actualStatus);

                return {
                    ...server,
                    status: mapServerStatus(actualStatus),
                };
            })
        );

        return serversWithStatus;
    } catch (error) {
        console.error('Pelican API Error:', error);
        if (error instanceof PelicanAPIError) {
            throw error;
        }
        throw new PelicanAPIError(
            `Failed to connect to Pelican Panel: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

/**
 * Transform Pelican server data to our internal Server format
 */
function transformPelicanServer(pelicanServer: any): Server {
    // Handle JSON:API format where data is in 'attributes'
    const data = pelicanServer.attributes || pelicanServer;
    const metadata = parseMetadata(data.external_id);

    return {
        id: data.id || 0,
        uuid: data.uuid || `server-${data.id || Math.random()}`,
        name: data.name || 'Unknown Server',
        description: data.description || '',
        status: mapServerStatus(data.status),
        metadata,
        domain: metadata.domain || undefined,
        subdomain: metadata.subdomain || undefined,
        group: metadata['group'] || undefined,
        subgroup: metadata['subgroup'] || undefined,
        image: data.container?.image || 'unknown',
        eggId: data.egg,
        isInstalled: data.container?.installed === 1,
        updatedAt: data.updated_at || new Date().toISOString(),
    };
}

/**
 * Map Pelican status to our ServerStatus type
 */
function mapServerStatus(status: string | null): ServerStatus {
    console.log('Mapping status:', status);
    if (!status) return 'unknown';

    const statusLower = status.toLowerCase();

    if (statusLower === 'running') return 'online';
    if (statusLower === 'offline' || statusLower === 'stopped') return 'offline';
    if (statusLower === 'starting') return 'starting';
    if (statusLower === 'stopping') return 'stopping';
    if (statusLower === 'installing') return 'installing';

    console.log('Unknown status:', status, 'returning unknown');
    return 'unknown';
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
}
