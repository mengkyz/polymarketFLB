'use client';

import { useState, useMemo } from 'react';
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
  const [serverMatches, setServerMatches] =
    useState<ProcessedMatch[]>(initialMatches);
  const liveMatches = usePolymarketWebSocket(serverMatches);

  // URL Path Database Control
  const [selectedSportSlug, setSelectedSportSlug] = useState<string>('live');
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Local Frontend Sub-Category Filter
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');

  const subCategories = useMemo(() => {
    const cats = new Set(liveMatches.map((m) => m.category));
    return ['All', ...Array.from(cats).sort()];
  }, [liveMatches]);

  const filteredMatches = useMemo(() => {
    if (selectedSubCategory === 'All') return liveMatches;
    return liveMatches.filter((m) => m.category === selectedSubCategory);
  }, [liveMatches, selectedSubCategory]);

  const handleFetch = async () => {
    setIsFetching(true);
    setSelectedSubCategory('All');

    // Pass the exact URL slug string to the backend to fetch the matching database shard
    const newMatches = await fetchActiveMatches({
      sportSlug: selectedSportSlug,
    });
    setServerMatches(newMatches);

    setIsFetching(false);
  };

  return (
    <div className="min-h-screen bg-[#15191d] text-white font-sans selection:bg-white/10 flex flex-col">
      <TopNav />
      <main className="flex-1 w-full max-w-[1350px] mx-auto px-4 lg:px-6 pt-6 pb-20">
        <div className="flex gap-8 w-full">
          {/* LEFT SIDEBAR: URL Routing & Local Filters */}
          <div className="hidden lg:flex w-[240px] flex-col gap-8 shrink-0 pt-2">
            <div className="flex flex-col gap-3 bg-[#1c2025] p-4 rounded-xl border border-gray-800">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Polymarket Endpoint
              </h3>
              <div className="flex flex-col gap-3">
                <select
                  value={selectedSportSlug}
                  onChange={(e) => setSelectedSportSlug(e.target.value)}
                  className="bg-[#15191d] border border-gray-700 text-white text-sm rounded-lg focus:ring-1 focus:ring-blue-500 outline-none p-2 w-full"
                >
                  <option value="live">🔴 sports/live</option>
                  <option value="sports">🏅 sports (All Upcoming)</option>
                  <option value="soccer">⚽ sports/soccer</option>
                  <option value="basketball">🏀 sports/basketball</option>
                  <option value="nba">🏀 sports/nba</option>
                  <option value="tennis">🎾 sports/tennis</option>
                  <option value="nfl">🏈 sports/nfl</option>
                  <option value="league-of-legends">🎮 sports/esports</option>
                </select>
                <button
                  onClick={handleFetch}
                  disabled={isFetching}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-400 text-white py-2 rounded-lg font-semibold text-sm transition-colors"
                >
                  {isFetching ? 'Fetching Data...' : 'Pull Market Data'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider pl-2">
                Filter Sub-Categories
              </h3>
              <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto no-scrollbar pr-2">
                {subCategories.map((cat) => (
                  <span
                    key={cat}
                    onClick={() => setSelectedSubCategory(cat)}
                    className={`text-[14px] font-medium py-2 px-3 rounded-md cursor-pointer transition-colors ${
                      selectedSubCategory === cat
                        ? 'bg-[#2a2e33] text-gray-100'
                        : 'text-gray-400 hover:bg-[#1e2226]'
                    }`}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN FEED */}
          <div className="flex-1 max-w-[756px] w-full">
            <div className="flex items-center justify-between h-9 mb-4">
              <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-white capitalize">
                {selectedSportSlug} Matches
              </h1>
              <span className="text-sm font-mono text-gray-500 bg-[#1e2226] px-3 py-1 rounded-full">
                {filteredMatches.length} Found
              </span>
            </div>

            <div className="flex flex-col">
              {isFetching ? (
                <div className="text-blue-400 py-8 text-center bg-[#1e2226] rounded-xl border border-gray-800 animate-pulse font-medium">
                  Routing Polymarket Database...
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="text-gray-500 py-8 text-center bg-[#1e2226] rounded-xl border border-gray-800">
                  No matches currently active for this endpoint.
                </div>
              ) : (
                filteredMatches.map((match) => (
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
