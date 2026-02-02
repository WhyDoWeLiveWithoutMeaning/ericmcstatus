'use client';

import { useEffect, useState, useCallback } from 'react';
import { ServerList } from '@/components/ServerList';
import { Server } from '@/types/server';

export default function Home() {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [lastUpdated, setLastUpdated] = useState<Date>();

  const fetchServers = useCallback(async () => {
    try {
      // Only show loading spinner on initial load (when there are no servers)
      if (servers.length === 0) {
        setIsLoading(true);
      }
      setError(undefined);

      const response = await fetch('/api/servers', {
        cache: 'no-store',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch servers');
      }

      const data = await response.json();
      setServers(data.servers || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setServers([]);
    } finally {
      setIsLoading(false);
    }
  }, [servers.length]);

  // Initial fetch
  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchServers();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchServers]);

  const handleRefresh = () => {
    fetchServers();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-100 via-purple-100 to-pink-200 dark:from-purple-950 dark:via-pink-950 dark:to-purple-900">
      {/* Header */}
      <header className="border-b border-pink-200 dark:border-purple-800 bg-pink-50/80 dark:bg-purple-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Spacer for balance */}
            <div className="w-32"></div>

            {/* Centered Title */}
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-[var(--font-finger-paint)]">
              Eric's Server Hub
            </h1>

            {/* Right side controls */}
            <div className="flex items-center gap-4">
              {lastUpdated && (
                <span className="text-sm text-purple-600 dark:text-pink-400 hidden sm:block font-[var(--font-finger-paint)]">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-pink-300 disabled:to-purple-300 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed font-[var(--font-finger-paint)]"
              >
                <svg
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats summary */}
        {!isLoading && !error && servers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-purple-900/50 dark:to-pink-900/50 rounded-3xl p-6 border-2 border-pink-200 dark:border-purple-700 shadow-xl">
              <div className="text-sm text-purple-600 dark:text-pink-300 mb-1 font-[var(--font-finger-paint)]">Total Servers</div>
              <div className="text-4xl font-bold text-purple-700 dark:text-pink-200 font-[var(--font-finger-paint)]">{servers.length}</div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-purple-900/50 dark:to-pink-900/50 rounded-3xl p-6 border-2 border-pink-200 dark:border-purple-700 shadow-xl">
              <div className="text-sm text-purple-600 dark:text-pink-300 mb-1 font-[var(--font-finger-paint)]">Online</div>
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 font-[var(--font-finger-paint)]">
                {servers.filter(s => s.status === 'online').length}
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-purple-900/50 dark:to-pink-900/50 rounded-3xl p-6 border-2 border-pink-200 dark:border-purple-700 shadow-xl">
              <div className="text-sm text-purple-600 dark:text-pink-300 mb-1 font-[var(--font-finger-paint)]">Offline</div>
              <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 font-[var(--font-finger-paint)]">
                {servers.filter(s => s.status === 'offline').length}
              </div>
            </div>
          </div>
        )}

        {/* Server list */}
        <ServerList
          servers={servers}
          isLoading={isLoading}
          error={error}
          onRetry={handleRefresh}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-pink-200 dark:border-purple-800 bg-pink-50/80 dark:bg-purple-900/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-purple-600 dark:text-pink-300 font-[var(--font-finger-paint)]">
            Powered by Pelican Panel • Auto-refreshes every 30 seconds ✨
          </p>
        </div>
      </footer>
    </div>
  );
}
