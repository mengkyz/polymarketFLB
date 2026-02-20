import { ProcessedMatch } from '../../types/polymarket';

export function MatchCard({ match }: { match: ProcessedMatch }) {
  // Clean up the title strings (e.g., "EPL: Arsenal vs Chelsea" -> "Arsenal vs Chelsea")
  const titleParts = match.title.split(/ - | \· |: /);
  const category = titleParts.length > 1 ? titleParts[0] : 'Sports';
  const matchTitle =
    titleParts.length > 1 ? titleParts[titleParts.length - 1] : match.title;

  // Handle missing dates safely
  const dateString = match.endDate
    ? new Date(match.endDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Upcoming';

  return (
    <div className="pb-3">
      <div className="block w-full bg-[#15191d] relative p-4 rounded-xl border border-gray-800 hover:bg-[#1c2025] transition-colors cursor-pointer">
        <div className="flex flex-col gap-4 w-full">
          {/* Top Header */}
          <div className="flex justify-between items-center text-[13px] text-gray-400 font-semibold">
            <span className="bg-[#1e2226] px-2 py-1 rounded-md text-gray-300">
              {category}
            </span>
            <span className="text-gray-500 text-[12px]">{dateString}</span>
          </div>

          {/* Match Title */}
          <div className="text-[16px] font-bold text-gray-100">
            {matchTitle}
          </div>

          {/* 1x2 / Moneyline Odds Grid */}
          <div className="flex flex-col gap-3 w-full mt-2">
            {/* Dynamically adjust to 2 or 3 columns based on Moneyline vs 1x2 */}
            <div
              className={`grid gap-2 w-full ${match.outcomes.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}
            >
              {match.outcomes.map((outcome, idx) => {
                const priceCents = (outcome.price * 100).toFixed(1);

                return (
                  <button
                    key={idx}
                    className="w-full h-[52px] rounded-lg bg-[#242b32] hover:bg-[#2f353c] border-b-[3px] border-[#121518] active:border-b-0 active:translate-y-[3px] text-white flex flex-col md:flex-row justify-center md:justify-between items-center px-4 transition-all duration-100"
                  >
                    <span className="text-[12px] md:text-[13px] font-semibold text-gray-300 truncate max-w-[120px]">
                      {outcome.name}
                    </span>
                    <span className="text-[14px] md:text-[15px] font-bold text-blue-400">
                      {priceCents}¢
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
