import { PolymarketEvent, ProcessedMatch } from '../types/polymarket';

export function extractFavorite(event: PolymarketEvent): ProcessedMatch | null {
  if (!event.markets || event.markets.length === 0) return null;

  // We target the primary market (usually the 1x2 or moneyline)
  const primaryMarket = event.markets[0];
  if (
    !primaryMarket.outcomes ||
    !primaryMarket.outcomePrices ||
    !primaryMarket.clobTokenIds
  )
    return null;

  try {
    // Polymarket's API returns these as stringified JSON arrays (e.g., '["0.75", "0.25"]').
    // We need to parse them back into actual JavaScript arrays.
    const outcomes: string[] =
      typeof primaryMarket.outcomes === 'string'
        ? JSON.parse(primaryMarket.outcomes)
        : primaryMarket.outcomes;

    const outcomePrices: string[] =
      typeof primaryMarket.outcomePrices === 'string'
        ? JSON.parse(primaryMarket.outcomePrices)
        : primaryMarket.outcomePrices;

    const clobTokenIds: string[] =
      typeof primaryMarket.clobTokenIds === 'string'
        ? JSON.parse(primaryMarket.clobTokenIds)
        : primaryMarket.clobTokenIds;

    // Safety check: ensure they parsed correctly into arrays
    if (
      !Array.isArray(outcomePrices) ||
      !Array.isArray(outcomes) ||
      !Array.isArray(clobTokenIds)
    ) {
      return null;
    }

    let maxPrice = -1;
    let favoriteIndex = -1;

    // Scan the orderbook prices to find the highest implied probability
    outcomePrices.forEach((priceStr, index) => {
      const price = parseFloat(priceStr);
      if (price > maxPrice) {
        maxPrice = price;
        favoriteIndex = index;
      }
    });

    // Discard if no valid odds are found
    if (favoriteIndex === -1) return null;

    // Determine if the match has already started
    const isLive = new Date(event.startDate).getTime() < Date.now();

    return {
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      favoriteTeam: outcomes[favoriteIndex],
      impliedProbability: maxPrice,
      clobTokenId: clobTokenIds[favoriteIndex],
      isLive,
    };
  } catch (error) {
    // If JSON.parse fails, it means the market data was malformed, so we safely skip it.
    console.error(`Error parsing market data for event ${event.id}:`, error);
    return null;
  }
}
