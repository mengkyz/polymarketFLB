'use client';

import { useState, useMemo } from 'react';
import { ProcessedMatch } from '../../types/polymarket';
import { usePolymarketWebSocket } from '../hooks/usePolymarketWebSocket';
import { FilterBar } from './FilterBar';
import { MatchRow } from './MatchRow';
import { groupMatchesByTime } from '../../lib/time-helpers';

export function TerminalDashboard({
  initialMatches,
}: {
  initialMatches: ProcessedMatch[];
}) {
  // 1. Hook up the real-time WebSocket for institutional-grade speed
  const liveMatches = usePolymarketWebSocket(initialMatches);

  // 2. State for your quantitative filters
  const [minOdds, setMinOdds] = useState<number>(0.65); // Default 65% probability
  const [maxOdds, setMaxOdds] = useState<number>(0.85); // Default 85% probability
  const [sportTag, setSportTag] = useState<string>('');

  // 3. Apply the filters dynamically
  const filteredMatches = useMemo(() => {
    return liveMatches.filter((match) => {
      const inRange =
        match.impliedProbability >= minOdds &&
        match.impliedProbability <= maxOdds;
      return inRange;
    });
  }, [liveMatches, minOdds, maxOdds]);

  // 4. Split into Live and Prematch arrays
  const { inPlay, upcoming } = useMemo(() => {
    const inPlay: ProcessedMatch[] = [];
    const upcoming: ProcessedMatch[] = [];

    filteredMatches.forEach((match) => {
      if (match.isLive) {
        inPlay.push(match);
      } else {
        upcoming.push(match);
      }
    });

    return { inPlay, upcoming };
  }, [filteredMatches]);

  // 5. Group the Prematch array by 3-hour scheduling blocks
  const upcomingGrouped = useMemo(
    () => groupMatchesByTime(upcoming),
    [upcoming],
  );

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans">
      {/* Header & Filters */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold mb-4 tracking-tight">
          Polymarket Alpha Screener
        </h1>
        <FilterBar
          minOdds={minOdds}
          setMinOdds={setMinOdds}
          maxOdds={maxOdds}
          setMaxOdds={setMaxOdds}
          sportTag={sportTag}
          setSportTag={setSportTag}
        />
      </div>

      {/* Split Screen Panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Column: LIVE */}
        <div className="w-1/2 border-r border-gray-800 flex flex-col">
          <div className="bg-gray-900 p-2 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wider">
              ● Live Markets ({inPlay.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {inPlay.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">
                No live matches in this odds range.
              </div>
            ) : (
              inPlay.map((match) => <MatchRow key={match.id} match={match} />)
            )}
          </div>
        </div>

        {/* Right Column: PREMATCH */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-gray-900 p-2 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
              Upcoming Setups ({upcoming.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {Object.keys(upcomingGrouped).length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">
                No upcoming matches in this odds range.
              </div>
            ) : (
              Object.entries(upcomingGrouped)
                .sort()
                .map(([timeBlock, matches]) => (
                  <div key={timeBlock} className="mb-4">
                    <div className="bg-gray-800 p-1 px-3 text-xs text-gray-300 font-mono border-y border-gray-700">
                      {timeBlock}
                    </div>
                    {matches.map((match) => (
                      <MatchRow key={match.id} match={match} />
                    ))}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
