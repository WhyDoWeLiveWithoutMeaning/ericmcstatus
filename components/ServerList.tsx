'use client';

import { Server } from '@/types/server';
import { ServerCard } from './ServerCard';

interface ServerListProps {
    servers: Server[];
    isLoading: boolean;
    error?: string;
    onRetry: () => void;
}

export function ServerList({ servers, isLoading, error, onRetry }: ServerListProps) {
    // Loading state
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="h-64 rounded-2xl bg-gray-200 dark:bg-zinc-800 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-16 h-16 mb-6 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-red-600 dark:text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Failed to Load Servers
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
                    {error}
                </p>
                <button
                    onClick={onRetry}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Empty state
    if (servers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-16 h-16 mb-6 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-gray-400 dark:text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 12h14M12 5l7 7-7 7"
                        />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No Servers Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
                    There are no servers configured in your Pelican Panel yet.
                </p>
            </div>
        );
    }

    // Group servers by group and subgroup
    const groupedServers: Record<string, Record<string, Server[]>> = {};
    const ungrouped: Server[] = [];

    servers.forEach(server => {
        if (server.group) {
            if (!groupedServers[server.group]) {
                groupedServers[server.group] = {};
            }

            const subgroupKey = server.subgroup || '_no_subgroup';
            if (!groupedServers[server.group][subgroupKey]) {
                groupedServers[server.group][subgroupKey] = [];
            }
            groupedServers[server.group][subgroupKey].push(server);
        } else {
            ungrouped.push(server);
        }
    });

    // Server list with grouping and subgrouping
    return (
        <div className="space-y-8">
            {/* Grouped servers */}
            {Object.entries(groupedServers).sort(([a], [b]) => a.localeCompare(b)).map(([groupName, subgroups]) => (
                <div key={groupName}>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent mb-4 flex items-center gap-2 font-[var(--font-finger-paint)]">
                        <span className="inline-block w-1.5 h-10 bg-gradient-to-b from-pink-500 via-purple-500 to-pink-500 rounded-full shadow-lg"></span>
                        {groupName}
                    </h2>

                    {/* Subgroups */}
                    <div className="space-y-6">
                        {Object.entries(subgroups).sort(([a], [b]) => {
                            // Sort so _no_subgroup comes last
                            if (a === '_no_subgroup') return 1;
                            if (b === '_no_subgroup') return -1;
                            return a.localeCompare(b);
                        }).map(([subgroupKey, subgroupServers]) => (
                            <div key={subgroupKey}>
                                {/* Subgroup header (only if not _no_subgroup) */}
                                {subgroupKey !== '_no_subgroup' && (
                                    <h3 className="text-lg font-semibold text-purple-700 dark:text-pink-300 mb-3 ml-4 flex items-center gap-2 font-[var(--font-finger-paint)]">
                                        <span className="inline-block w-1 h-6 bg-gradient-to-b from-pink-400 to-purple-400 rounded-full shadow-md"></span>
                                        {subgroupKey}
                                    </h3>
                                )}

                                {/* Server grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {subgroupServers.map((server, index) => (
                                        <ServerCard key={server.uuid || `server-${index}`} server={server} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Ungrouped servers */}
            {ungrouped.length > 0 && (
                <div>
                    {Object.keys(groupedServers).length > 0 && (
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent mb-4 flex items-center gap-2 font-[var(--font-finger-paint)]">
                            <span className="inline-block w-1.5 h-10 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full shadow-lg"></span>
                            Other Servers
                        </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ungrouped.map((server, index) => (
                            <ServerCard key={server.uuid || `server-${index}`} server={server} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
