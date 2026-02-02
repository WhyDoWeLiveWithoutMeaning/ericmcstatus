import { NextRequest, NextResponse } from 'next/server';

const PELICAN_PANEL_URL = process.env.PELICAN_PANEL_URL;
const PELICAN_CLIENT_API_KEY = process.env.PELICAN_CLIENT_API_KEY;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    try {
        const { uuid } = await params;
        const { action } = await request.json();

        if (!['start', 'stop', 'restart', 'kill'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be start, stop, restart, or kill.' },
                { status: 400 }
            );
        }

        if (!PELICAN_PANEL_URL || !PELICAN_CLIENT_API_KEY) {
            return NextResponse.json(
                { error: 'Pelican Panel configuration is missing' },
                { status: 500 }
            );
        }

        const response = await fetch(
            `${PELICAN_PANEL_URL}/api/client/servers/${uuid}/power`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PELICAN_CLIENT_API_KEY}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ signal: action }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Pelican power control error:', errorText);
            return NextResponse.json(
                { error: `Failed to ${action} server` },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true, action });
    } catch (error) {
        console.error('Power control error:', error);
        return NextResponse.json(
            { error: 'Failed to control server power' },
            { status: 500 }
        );
    }
}
