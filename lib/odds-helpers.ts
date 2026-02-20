import {
  PolymarketEvent,
  ProcessedMatch,
  ProcessedOutcome,
} from '../types/polymarket';

export function extractFavorite(event: PolymarketEvent): ProcessedMatch | null {
  if (!event.markets || event.markets.length === 0) return null;

  let mappedOutcomes: ProcessedOutcome[] = [];

  // Scrape grouped markets for 1x2 and Moneyline Teams
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

        const yesIndex = outs.indexOf('Yes');

        if (yesIndex !== -1) {
          const price = parseFloat(prices[yesIndex]);
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
        // Skip malformed
      }
    }
  }

  // Fallback for single direct-matchup markets
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
      // Skip
    }
  }

  if (mappedOutcomes.length < 2 || mappedOutcomes.length > 3) {
    return null;
  }

  let category = 'Sports';
  let matchTitle = event.title;

  if (event.title.includes(':')) {
    const parts = event.title.split(':');
    category = parts[0].trim();
    matchTitle = parts.slice(1).join(':').trim();
  } else if (event.title.includes(' - ')) {
    const parts = event.title.split(' - ');
    category = parts[0].trim();
    matchTitle = parts.slice(1).join(' - ').trim();
  }

  // EXACT "LIVE" LOGIC: The game has passed its scheduled start time, but is still actively trading.
  const isLive = new Date(event.startDate).getTime() < Date.now();

  return {
    id: event.id,
    title: event.title,
    matchTitle,
    category,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    favoriteTeam: mappedOutcomes[0]?.name || '',
    impliedProbability: mappedOutcomes[0]?.price || 0,
    clobTokenId: mappedOutcomes[0]?.clobTokenId || '',
    isLive, // We will use this in the API filter!
    outcomes: mappedOutcomes,
  };
}
