export function FilterBar({
  minOdds,
  setMinOdds,
  maxOdds,
  setMaxOdds,
  sportTag,
  setSportTag,
}: {
  minOdds: number;
  setMinOdds: (val: number) => void;
  maxOdds: number;
  setMaxOdds: (val: number) => void;
  sportTag: string;
  setSportTag: (val: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-900 border-b border-gray-800 rounded-t-lg items-center">
      <div className="flex flex-col">
        <label className="text-xs text-gray-400 mb-1">Sport</label>
        <select
          value={sportTag}
          onChange={(e) => setSportTag(e.target.value)}
          className="bg-black border border-gray-700 text-white text-sm rounded focus:ring-blue-500 focus:border-blue-500 block p-2"
        >
          <option value="">All Sports</option>
          <option value="2">Soccer</option>
          <option value="3">Basketball</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Min Price (%)</label>
          <input
            type="number"
            value={minOdds * 100}
            onChange={(e) => setMinOdds(Number(e.target.value) / 100)}
            className="w-20 bg-black border border-gray-700 text-white text-sm rounded p-2 text-center"
          />
        </div>
        <span className="text-gray-500 mt-5">-</span>
        <div className="flex flex-col">
          <label className="text-xs text-gray-400 mb-1">Max Price (%)</label>
          <input
            type="number"
            value={maxOdds * 100}
            onChange={(e) => setMaxOdds(Number(e.target.value) / 100)}
            className="w-20 bg-black border border-gray-700 text-white text-sm rounded p-2 text-center"
          />
        </div>
      </div>
    </div>
  );
}
