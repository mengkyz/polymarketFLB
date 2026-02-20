import { PolymarketEvent, ProcessedMatch } from '../types/polymarket';
import { extractFavorite } from './odds-helpers';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export interface FetchMatchOptions {
  tagId?: string;
  limit?: number;
  endDateMin?: string;
  endDateMax?: string;
}

export async function fetchActiveMatches(
  options: FetchMatchOptions = {},
): Promise<ProcessedMatch[]> {
  const url = new URL(`${GAMMA_API_BASE}/events`);
  url.searchParams.append('active', 'true');
  url.searchParams.append('closed', 'false');
  url.searchParams.append('tag_id', options.tagId || '1'); // Default to Sports (1)

  // Fetch a massive chunk of data so our local filter has plenty to work with
  url.searchParams.append('limit', (options.limit || 500).toString());

  try {
    const response = await fetch(url.toString(), { cache: 'no-store' });
    if (!response.ok)
      throw new Error(`Failed to fetch Gamma API: ${response.status}`);

    const events: PolymarketEvent[] = await response.json();

    // 1. Extract valid sports matches
    let matches = events
      .map(extractFavorite)
      .filter((match): match is ProcessedMatch => match !== null);

    // 2. PERFECT FIX: Apply the timeline filter locally in JavaScript
    if (options.endDateMin) {
      const minTime = new Date(options.endDateMin).getTime();
      matches = matches.filter((m) => new Date(m.endDate).getTime() >= minTime);
    }

    if (options.endDateMax) {
      const maxTime = new Date(options.endDateMax).getTime();
      matches = matches.filter((m) => new Date(m.endDate).getTime() <= maxTime);
    }

    // 3. Sort chronologically (soonest matches at the top)
    return matches.sort(
      (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    );
  } catch (error) {
    console.error('Data pipeline error:', error);
    return [];
  }
}
