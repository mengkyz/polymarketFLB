'use client';

import { ProcessedMatch } from '../../types/polymarket';
import { usePolymarketWebSocket } from '../hooks/usePolymarketWebSocket';
import { MatchCard } from './MatchCard';
import { TopNav } from './TopNav';

export function TerminalDashboard({
  initialMatches,
}: {
  initialMatches: ProcessedMatch[];
}) {
  // Feed the raw sports matches into the WebSocket to get live price flashes
  const liveMatches = usePolymarketWebSocket(initialMatches);

  return (
    <div className="min-h-screen bg-[#15191d] text-white font-sans selection:bg-white/10 flex flex-col">
      <TopNav />
      <main className="flex-1 w-full max-w-[1350px] mx-auto px-4 lg:px-6 pt-6 pb-20">
        <div className="flex justify-center w-full">
          <div className="flex-1 max-w-[756px] w-full">
            <div className="flex items-center justify-between h-9 mb-4">
              <h1 className="text-[24px] md:text-[28px] font-semibold tracking-tight text-white">
                Upcoming Sports
              </h1>
              <span className="text-sm font-mono text-gray-500 bg-[#1e2226] px-3 py-1 rounded-full">
                {liveMatches.length} Matches
              </span>
            </div>

            <div className="flex flex-col">
              {liveMatches.length === 0 ? (
                <div className="text-gray-500 py-8 text-center bg-[#1e2226] rounded-xl border border-gray-800">
                  Fetching sports data from Polymarket...
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
