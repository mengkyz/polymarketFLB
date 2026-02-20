import { PolymarketEvent, ProcessedMatch } from '../types/polymarket';
import { extractFavorite } from './odds-helpers';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export async function fetchActiveMatches(
  tagId?: string,
): Promise<ProcessedMatch[]> {
  const url = new URL(`${GAMMA_API_BASE}/events`);
  url.searchParams.append('active', 'true');
  url.searchParams.append('closed', 'false');

  // Optional: Filter by specific sports like Soccer (tag_id=2)
  if (tagId) {
    url.searchParams.append('tag_id', tagId);
  }

  try {
    // Next.js will cache this response for 60 seconds to prevent rate limiting
    const response = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!response.ok) throw new Error('Failed to fetch Gamma API');

    const events: PolymarketEvent[] = await response.json();

    // Extract favorites and remove null results
    const matches = events
      .map(extractFavorite)
      .filter((match): match is ProcessedMatch => match !== null);

    // Sort heavily favored assets to the top
    return matches.sort((a, b) => b.impliedProbability - a.impliedProbability);
  } catch (error) {
    console.error('Data pipeline error:', error);
    return [];
  }
}
