import { PolymarketEvent, ProcessedMatch } from '../types/polymarket';
import { extractFavorite } from './odds-helpers';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export async function fetchActiveMatches(): Promise<ProcessedMatch[]> {
  const url = new URL(`${GAMMA_API_BASE}/events`);
  url.searchParams.append('active', 'true');
  url.searchParams.append('closed', 'false');
  // 1. EXACT SPORTS FILTER: '1' is the master "Sports" tag on Polymarket
  url.searchParams.append('tag_id', '1');
  // 2. Fetch a large batch so we have plenty of matches to render
  url.searchParams.append('limit', '100');

  try {
    const response = await fetch(url.toString(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch Gamma API');

    const events: PolymarketEvent[] = await response.json();

    // Extract matches and filter out nulls (non 1x2 / non-moneyline events)
    const matches = events
      .map(extractFavorite)
      .filter((match): match is ProcessedMatch => match !== null);

    return matches;
  } catch (error) {
    console.error('Data pipeline error:', error);
    return [];
  }
}
