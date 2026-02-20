'use client';

import { useState } from 'react';
import { ProcessedMatch } from '../../types/polymarket';
import { usePolymarketWebSocket } from '../hooks/usePolymarketWebSocket';
import { MatchCard } from './MatchCard';
import { TopNav } from './TopNav';
import { fetchActiveMatches } from '../../lib/api';

export function TerminalDashboard({
  initialMatches,
}: {
  initialMatches: ProcessedMatch[];
}) {
  // Keep track of the matches currently loaded from the server API
  const [serverMatches, setServerMatches] =
    useState<ProcessedMatch[]>(initialMatches);

  // Connect those server matches to the live WebSocket engine
  const liveMatches = usePolymarketWebSocket(serverMatches);

  // Timeline Filter State
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Database-style Query Execution
  const handleSearch = async () => {
    setIsSearching(true);

    // Convert HTML date strings (YYYY-MM-DD) into ISO timestamps for the API
    const endMin = fromDate ? new Date(fromDate).toISOString() : undefined;

    // Set toDate to the end of the selected day (23:59:59)
    let endMax = undefined;
    if (toDate) {
      const dateObj = new Date(toDate);
      dateObj.setHours(23, 59, 59, 999);
      endMax = dateObj.toISOString();
    }

    const newMatches = await fetchActiveMatches({
      endDateMin: endMin,
      endDateMax: endMax,
      limit: 100, // Safe limit since the date bounds strip away the noise
    });

    setServerMatches(newMatches);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-[#15191d] text-white font-sans selection:bg-white/10 flex flex-col">
      <TopNav />
      <main className="flex-1 w-full max-w-[1350px] mx-auto px-4 lg:px-6 pt-6 pb-20">
        <div className="flex justify-center w-full">
          <div className="flex-1 max-w-[756px] w-full">
            {/* Timeline Filter Bar */}
            <div className="bg-[#1e2226] p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row items-end sm:items-center gap-4 mb-6">
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-[#15191d] border border-gray-700 text-white text-sm rounded-lg focus:ring-1 focus:ring-blue-500 outline-none p-2 w-full"
                />
              </div>
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-[#15191d] border border-gray-700 text-white text-sm rounded-lg focus:ring-1 focus:ring-blue-500 outline-none p-2 w-full"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-400 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-colors mt-2 sm:mt-0 sm:ml-auto h-[38px]"
              >
                {isSearching ? 'Searching...' : 'Search Markets'}
              </button>
            </div>

            {/* Feed Header */}
            <div className="flex items-center justify-between h-9 mb-4">
              <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-white">
                Targeted Matchups
              </h1>
              <span className="text-sm font-mono text-gray-500 bg-[#1e2226] px-3 py-1 rounded-full">
                {liveMatches.length} Found
              </span>
            </div>

            {/* Dynamic Feed */}
            <div className="flex flex-col">
              {isSearching ? (
                <div className="text-gray-500 py-8 text-center bg-[#1e2226] rounded-xl border border-gray-800 animate-pulse">
                  Querying Polymarket Database...
                </div>
              ) : liveMatches.length === 0 ? (
                <div className="text-gray-500 py-8 text-center bg-[#1e2226] rounded-xl border border-gray-800">
                  No 1x2 sports markets found for this timeline.
                </div>
              ) : (
                liveMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
