import { useState, useEffect } from 'react';
import { ProcessedMatch } from '../../types/polymarket';

const POLYMARKET_WS_URL =
  'wss://ws-subscriptions-clob.polymarket.com/ws/market';

export function usePolymarketWebSocket(initialMatches: ProcessedMatch[]) {
  const [matches, setMatches] = useState<ProcessedMatch[]>(initialMatches);

  useEffect(() => {
    setMatches(initialMatches);
  }, [initialMatches]);

  useEffect(() => {
    // Collect ALL clobTokenIds for every team in every match
    const assetIds = matches
      .flatMap((match) => match.outcomes.map((o) => o.clobTokenId))
      .filter(Boolean);

    if (assetIds.length === 0) return;

    const ws = new WebSocket(POLYMARKET_WS_URL);

    ws.onopen = () => {
      ws.send(JSON.stringify({ assets_ids: assetIds, type: 'MARKET' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data && data.asset_id && data.price) {
          const newPrice = parseFloat(data.price);

          setMatches((prevMatches) =>
            prevMatches.map((match) => {
              // Find if this price update belongs to Team A or Team B
              const outcomeIndex = match.outcomes.findIndex(
                (o) => o.clobTokenId === data.asset_id,
              );

              if (
                outcomeIndex !== -1 &&
                match.outcomes[outcomeIndex].price !== newPrice
              ) {
                const newOutcomes = [...match.outcomes];
                newOutcomes[outcomeIndex] = {
                  ...newOutcomes[outcomeIndex],
                  price: newPrice,
                };
                return { ...match, outcomes: newOutcomes };
              }
              return match;
            }),
          );
        }
      } catch (error) {
        // Ignore parse errors
      }
    };

    return () => ws.close();
  }, [matches.length]);

  return matches;
}
