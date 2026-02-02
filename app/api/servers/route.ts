import { NextResponse } from 'next/server';
import { fetchServers, PelicanAPIError } from '@/lib/pelican';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const servers = await fetchServers();

        return NextResponse.json({
            servers,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching servers:', error);

        if (error instanceof PelicanAPIError) {
            return NextResponse.json(
                {
                    error: error.message,
                    servers: [],
                },
                { status: error.statusCode || 500 }
            );
        }

        return NextResponse.json(
            {
                error: 'An unexpected error occurred',
                servers: [],
            },
            { status: 500 }
        );
    }
}
