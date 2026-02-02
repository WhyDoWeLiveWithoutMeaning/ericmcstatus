import { Server } from '@/types/server';
import { useState } from 'react';

interface ServerCardProps {
    server: Server;
    onRefresh?: () => void;
}

export function ServerCard({ server, onRefresh }: ServerCardProps) {
    const [isStarting, setIsStarting] = useState(false);
    const [startError, setStartError] = useState<string>();
    const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);

    const statusConfig: Record<string, { color: string; text: string; pulse: boolean }> = {
        online: {
            color: 'bg-emerald-500',
            text: 'Online',
            pulse: true,
        },
        offline: {
            color: 'bg-gray-500',
            text: 'Offline',
            pulse: false,
        },
        starting: {
            color: 'bg-yellow-500',
            text: 'Starting',
            pulse: true,
        },
        stopping: {
            color: 'bg-orange-500',
            text: 'Stopping',
            pulse: true,
        },
        installing: {
            color: 'bg-blue-500',
            text: 'Installing',
            pulse: true,
        },
        unknown: {
            color: 'bg-gray-400',
            text: 'Unknown',
            pulse: false,
        },
    };

    const currentStatus = optimisticStatus || server.status;
    const config = statusConfig[currentStatus] || statusConfig.unknown;

    const handleStart = async () => {
        try {
            setIsStarting(true);
            setStartError(undefined);

            // Optimistic update
            setOptimisticStatus('starting');

            const response = await fetch(`/api/servers/${server.uuid}/power`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'start' }),
            });

            if (!response.ok) {
                // Revert optimistic update on failure
                setOptimisticStatus(null);
                throw new Error('Failed to start server');
            }

            // Trigger refresh after a delay to allow panel to process
            if (onRefresh) {
                setTimeout(() => onRefresh(), 2000);
            }
        } catch (error) {
            setStartError(error instanceof Error ? error.message : 'Failed to start server');
            setOptimisticStatus(null); // Revert on error
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-purple-900/50 dark:via-pink-900/40 dark:to-purple-950/50 border-2 border-pink-200 dark:border-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 via-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative p-6">
                {/* Header with Image */}
                <div className="flex items-start gap-4 mb-4">
                    {/* Server Icon Image */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-900/70 dark:to-purple-900/70 border-2 border-pink-300 dark:border-purple-600 shadow-lg">
                        <img
                            src={`https://pelican.er-ic.ca/storage/icons/server/${server.uuid}.png`}
                            alt={`${server.name} icon`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.currentTarget;
                                const currentSrc = target.src;

                                // Fallback chain: server.png -> server.webp -> server.jpg -> egg.png -> egg.webp -> egg.jpg -> letter
                                if (currentSrc.includes('/server/') && currentSrc.endsWith('.png')) {
                                    // Try server .webp
                                    target.src = `https://pelican.er-ic.ca/storage/icons/server/${server.uuid}.webp`;
                                } else if (currentSrc.includes('/server/') && currentSrc.endsWith('.webp')) {
                                    // Try server .jpg
                                    target.src = `https://pelican.er-ic.ca/storage/icons/server/${server.uuid}.jpg`;
                                } else if (currentSrc.includes('/server/') && currentSrc.endsWith('.jpg')) {
                                    // Try egg .png
                                    if (server.eggUuid) {
                                        target.src = `https://pelican.er-ic.ca/storage/icons/egg/${server.eggUuid}.png`;
                                    } else {
                                        // No egg UUID, skip to fallback
                                        target.style.display = 'none';
                                        if (target.nextSibling) {
                                            (target.nextSibling as HTMLElement).style.display = 'flex';
                                        }
                                    }
                                } else if (currentSrc.includes('/egg/') && currentSrc.endsWith('.png')) {
                                    // Try egg .webp
                                    target.src = `https://pelican.er-ic.ca/storage/icons/egg/${server.eggUuid}.webp`;
                                } else if (currentSrc.includes('/egg/') && currentSrc.endsWith('.webp')) {
                                    // Try egg .jpg
                                    target.src = `https://pelican.er-ic.ca/storage/icons/egg/${server.eggUuid}.jpg`;
                                } else {
                                    // All failed, show letter fallback
                                    target.style.display = 'none';
                                    if (target.nextSibling) {
                                        (target.nextSibling as HTMLElement).style.display = 'flex';
                                    }
                                }
                            }}
                        />
                        <div className="hidden w-full h-full items-center justify-center text-2xl font-bold text-purple-700 dark:text-pink-300 font-[var(--font-finger-paint)]">
                            {server.name.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent mb-1 break-words leading-tight font-[var(--font-finger-paint)]">
                            {server.name}
                        </h3>
                        {server.description && (
                            <p className="text-sm text-purple-600 dark:text-pink-300 line-clamp-2">
                                {server.description}
                            </p>
                        )}
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className={`w-3 h-3 rounded-full ${config.color}`} />
                            {config.pulse && (
                                <div className={`absolute inset-0 w-3 h-3 rounded-full ${config.color} animate-ping opacity-75`} />
                            )}
                        </div>
                        <span className="text-sm font-medium text-purple-700 dark:text-pink-300 font-[var(--font-finger-paint)]">
                            {config.text}
                        </span>

                        {/* Start button for offline servers with start permission */}
                        {currentStatus === 'offline' && server.metadata['start'] === 'true' && (
                            <button
                                onClick={handleStart}
                                disabled={isStarting}
                                className="ml-2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-emerald-300 disabled:to-teal-300 text-white text-xs font-semibold rounded-full transition-all disabled:cursor-not-allowed flex items-center gap-1 shadow-md font-[var(--font-finger-paint)]"
                                title="Start server"
                            >
                                {isStarting ? (
                                    <>
                                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Starting...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Start</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Error message */}
                {startError && (
                    <div className="mt-2 px-3 py-2 bg-pink-50 dark:bg-pink-950/30 border-2 border-pink-300 dark:border-pink-800 rounded-2xl text-sm text-pink-700 dark:text-pink-300 font-[var(--font-finger-paint)]">
                        {startError}
                    </div>
                )}

                {/* Player Count */}
                {server.players !== undefined && (
                    <div className="mb-2 flex items-center gap-2 group/players relative">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 shadow-sm cursor-help transition-all hover:scale-105">
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Players:</div>
                            <div className="text-sm font-mono text-emerald-900 dark:text-emerald-100">
                                {server.players} / {server.maxPlayers}
                            </div>
                        </div>

                        {/* Player List Tooltip */}
                        {server.playerList && server.playerList.length > 0 && (
                            <div className="absolute left-0 bottom-full mb-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-emerald-100 dark:border-zinc-700 p-3 opacity-0 invisible group-hover/players:opacity-100 group-hover/players:visible transition-all duration-200 z-10">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Online Players</div>
                                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                                    {server.playerList.map((player, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                            <span className="truncate">{player}</span>
                                        </div>
                                    ))}
                                </div>
                                {/* Arrow */}
                                <div className="absolute left-6 bottom-[-6px] w-3 h-3 bg-white dark:bg-zinc-800 border-b border-r border-emerald-100 dark:border-zinc-700 rotate-45 transform" />
                            </div>
                        )}
                    </div>
                )}

                {/* Connection addresses */}
                {(server.domain || server.subdomain) && (
                    <div className="space-y-2">
                        {server.domain && (
                            <div className="flex items-center gap-2">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full text-xs font-medium text-purple-700 dark:text-pink-300 border border-purple-200 dark:border-purple-700">
                                    <div className="text-xs text-purple-600 dark:text-pink-400 font-medium">Main Address:</div>
                                    <div className="text-sm font-mono text-purple-900 dark:text-pink-300">{server.domain}</div>
                                </div>
                            </div>
                        )}
                        {server.subdomain && (
                            <div className="flex items-center gap-2">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 rounded-full text-xs font-medium text-pink-700 dark:text-purple-300 border border-pink-200 dark:border-pink-700">
                                    <div className="text-xs text-pink-600 dark:text-purple-400 font-medium">Direct Address:</div>
                                    <div className="text-sm font-mono text-pink-900 dark:text-purple-300">{server.subdomain}</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer - Installation status */}
                {!server.isInstalled && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>Server installation pending</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
