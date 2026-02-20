import { PolymarketEvent, ProcessedMatch } from '../types/polymarket';

export function extractFavorite(event: PolymarketEvent): ProcessedMatch | null {
  if (!event.markets || event.markets.length === 0) return null;

  // We target the primary market (usually the 1x2 or moneyline)
  const primaryMarket = event.markets[0];
  if (!primaryMarket.outcomes || !primaryMarket.outcomePrices) return null;

  let maxPrice = -1;
  let favoriteIndex = -1;

  // Scan the orderbook prices to find the highest implied probability
  primaryMarket.outcomePrices.forEach((priceStr, index) => {
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
    favoriteTeam: primaryMarket.outcomes[favoriteIndex],
    impliedProbability: maxPrice,
    clobTokenId: primaryMarket.clobTokenIds[favoriteIndex],
    isLive,
  };
}
