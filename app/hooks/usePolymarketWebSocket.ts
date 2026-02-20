import { useState, useEffect } from 'react';
import { ProcessedMatch } from '../types/polymarket';

const POLYMARKET_WS_URL =
  'wss://ws-subscriptions-clob.polymarket.com/ws/market';

export function usePolymarketWebSocket(initialMatches: ProcessedMatch[]) {
  // We maintain the matches in React state so the UI can re-render instantly when a price changes
  const [matches, setMatches] = useState<ProcessedMatch[]>(initialMatches);

  useEffect(() => {
    // Keep state synced if the initial server-fetched matches change
    setMatches(initialMatches);
  }, [initialMatches]);

  useEffect(() => {
    // Extract all the Asset IDs we want to monitor
    const assetIds = matches.map((match) => match.clobTokenId).filter(Boolean);

    if (assetIds.length === 0) return;

    // Open the WebSocket connection
    const ws = new WebSocket(POLYMARKET_WS_URL);

    ws.onopen = () => {
      console.log('Connected to Polymarket CLOB');
      // Subscribe to market updates for our specific heavy favorites
      const subscribeMessage = {
        assets_ids: assetIds,
        type: 'MARKET',
      };
      ws.send(JSON.stringify(subscribeMessage));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Polymarket pushes updates often. We are looking for price changes on our tracked assets.
        if (data && data.asset_id && data.price) {
          const newPrice = parseFloat(data.price);

          setMatches(
            (prevMatches) =>
              prevMatches
                .map((match) => {
                  // When we find the matching asset, update its implied probability
                  if (
                    match.clobTokenId === data.asset_id &&
                    match.impliedProbability !== newPrice
                  ) {
                    return { ...match, impliedProbability: newPrice };
                  }
                  return match;
                })
                .sort((a, b) => b.impliedProbability - a.impliedProbability), // Keep the terminal sorted perfectly
          );
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Clean up the connection when the component unmounts or updates
    return () => {
      ws.close();
    };
  }, [matches.length]); // Re-run if the number of monitored matches changes

  return matches;
}
