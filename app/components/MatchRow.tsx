import { ProcessedMatch } from '../../types/polymarket';

export function MatchRow({ match }: { match: ProcessedMatch }) {
  // Convert the 0.00 - 1.00 price into a readable implied probability percentage
  const probability = (match.impliedProbability * 100).toFixed(1);
  const startTime = new Date(match.startDate).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-800 hover:bg-gray-900 transition-colors">
      <div className="flex flex-col">
        <span className="text-sm text-gray-400">{startTime}</span>
        <span className="font-semibold text-white">{match.title}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xs text-gray-500">
          Favorite: {match.favoriteTeam}
        </span>
        <span
          className={`font-mono text-lg font-bold ${match.isLive ? 'text-green-400' : 'text-blue-400'}`}
        >
          {probability}%
        </span>
      </div>
    </div>
  );
}
