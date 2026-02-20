import {
  PolymarketEvent,
  ProcessedMatch,
  ProcessedOutcome,
} from '../types/polymarket';

export function extractFavorite(event: PolymarketEvent): ProcessedMatch | null {
  if (!event.markets || event.markets.length === 0) return null;

  let mappedOutcomes: ProcessedOutcome[] = [];

  // SCENARIO 1: Multi-Market Event (Standard Polymarket Sports Setup)
  // Example: Market 1 (Arsenal Yes/No), Market 2 (Chelsea Yes/No), Market 3 (Draw Yes/No)
  if (event.markets.length === 2 || event.markets.length === 3) {
    for (const m of event.markets) {
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

        // We only care about the "Yes" side for each team's specific market
        const yesIndex = outs.indexOf('Yes');

        if (yesIndex !== -1) {
          const price = parseFloat(prices[yesIndex]);

          // Polymarket questions are verbose (e.g. "Will Arsenal win?"). We clean it to just "Arsenal"
          let teamName = m.question || 'Unknown';
          teamName = teamName
            .replace('Will ', '')
            .replace(' win the match?', '')
            .replace(' win?', '')
            .replace('?', '')
            .trim();

          mappedOutcomes.push({
            name: teamName,
            price: isNaN(price) ? 0 : price,
            clobTokenId: tokens[yesIndex],
          });
        }
      } catch (e) {
        // Safely skip malformed individual markets
      }
    }
  }

  // SCENARIO 2: Single Market Event
  // Rare fallback where outcomes are directly ["Lakers", "Warriors"]
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

      // Reject if it's a binary Yes/No question
      if (
        Array.isArray(outs) &&
        (outs.length === 2 || outs.length === 3) &&
        !outs.includes('Yes')
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

  // THE GATEKEEPER: If we do not have exactly 2 (Moneyline) or 3 (1x2) teams, it's not a standard match. Discard it.
  if (mappedOutcomes.length < 2 || mappedOutcomes.length > 3) {
    return null;
  }

  return {
    id: event.id,
    title: event.title,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    favoriteTeam: mappedOutcomes[0]?.name || '', // Just a fallback reference
    impliedProbability: mappedOutcomes[0]?.price || 0,
    clobTokenId: mappedOutcomes[0]?.clobTokenId || '',
    isLive: event.active, // Ignored for this phase as requested
    outcomes: mappedOutcomes,
  };
}
