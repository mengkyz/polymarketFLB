import { PolymarketEvent, ProcessedMatch } from '../types/polymarket';
import { extractFavorite } from './odds-helpers';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export async function fetchActiveMatches(): Promise<ProcessedMatch[]> {
  const url = new URL(`${GAMMA_API_BASE}/events`);
  url.searchParams.append('active', 'true');
  url.searchParams.append('closed', 'false');
  // Fetch a massive chunk of 300 markets so our strict 1x2 filter has enough data to work with
  url.searchParams.append('limit', '300');

  try {
    const response = await fetch(url.toString(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch Gamma API');

    const events: PolymarketEvent[] = await response.json();

    const matches = events
      .map(extractFavorite)
      .filter((match): match is ProcessedMatch => match !== null);

    return matches;
  } catch (error) {
    console.error('Data pipeline error:', error);
    return [];
  }
}
