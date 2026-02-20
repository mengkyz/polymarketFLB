import {
  PolymarketEvent,
  ProcessedMatch,
  ProcessedOutcome,
} from '../types/polymarket';

export function extractFavorite(event: PolymarketEvent): ProcessedMatch | null {
  if (!event.markets || event.markets.length === 0) return null;

  let mappedOutcomes: ProcessedOutcome[] = [];

  // POLYMARKET ARCHITECTURE:
  // 1x2 and Moneyline sports are usually Multi-Market Events (2 or 3 markets grouped together).
  // Each individual market is a "Yes/No" market representing one team.
  if (event.markets.length === 2 || event.markets.length === 3) {
    // Extract the "Yes" side of each market to represent the Team
    event.markets.forEach((m) => {
      try {
        const outs: string[] =
          typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : m.outcomes;
        const prices: string[] =
          typeof m.outcomePrices === 'string'
            ? JSON.parse(m.outcomePrices)
            : m.outcomePrices;
        const tokens: string[] =
          typeof m.clobTokenIds === 'string'
            ? JSON.parse(m.clobTokenIds)
            : m.clobTokenIds;

        const yesIndex = outs.indexOf('Yes');

        if (yesIndex !== -1) {
          const price = parseFloat(prices[yesIndex]);

          // Clean the question to look like a standard team name (e.g. "Will Arsenal win?" -> "Arsenal")
          let teamName = m.question || 'Unknown';
          teamName = teamName
            .replace('Will ', '')
            .replace(' win?', '')
            .replace(' win the match?', '');

          mappedOutcomes.push({
            name: teamName,
            price: isNaN(price) ? 0 : price,
            clobTokenId: tokens[yesIndex],
          });
        }
      } catch (e) {
        // Safely skip malformed markets
      }
    });
  }

  // FALLBACK: Occasionally, sports are single markets with categorical outcomes like ["Lakers", "Bulls"]
  if (mappedOutcomes.length === 0 && event.markets.length === 1) {
    try {
      const m = event.markets[0];
      const outs: string[] =
        typeof m.outcomes === 'string' ? JSON.parse(m.outcomes) : m.outcomes;
      const prices: string[] =
        typeof m.outcomePrices === 'string'
          ? JSON.parse(m.outcomePrices)
          : m.outcomePrices;
      const tokens: string[] =
        typeof m.clobTokenIds === 'string'
          ? JSON.parse(m.clobTokenIds)
          : m.clobTokenIds;

      // Ensure it is strictly a matchup, not a binary question
      if (
        Array.isArray(outs) &&
        (outs.length === 2 || outs.length === 3) &&
        !outs.includes('Yes') &&
        !outs.includes('No')
      ) {
        mappedOutcomes = outs.map((name, index) => ({
          name,
          price: parseFloat(prices[index]) || 0,
          clobTokenId: tokens[index],
        }));
      }
    } catch (e) {
      // Safely skip
    }
  }

  // STRICT FILTER: If we didn't extract exactly 2 (Moneyline) or 3 (1x2) outcomes, brutally reject the event
  if (mappedOutcomes.length < 2 || mappedOutcomes.length > 3) {
    return null;
  }

  return {
    id: event.id,
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    favoriteTeam: mappedOutcomes[0]?.name || '',
    impliedProbability: mappedOutcomes[0]?.price || 0,
    clobTokenId: mappedOutcomes[0]?.clobTokenId || '',
    isLive: false, // Ignored for this phase as requested
    outcomes: mappedOutcomes,
  };
}
