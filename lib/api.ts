'use server';

import { PolymarketEvent, ProcessedMatch } from '../types/polymarket';
import { extractFavorite } from './odds-helpers';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export async function fetchActiveMatches(): Promise<ProcessedMatch[]> {
  // Fetch a deep pool of the 500 newest markets to ensure we capture all upcoming games
  const targetTotal = 500;
  const maxApiLimit = 100;
  let allEvents: PolymarketEvent[] = [];

  try {
    for (let offset = 0; offset < targetTotal; offset += maxApiLimit) {
      const url = new URL(`${GAMMA_API_BASE}/events`);
      url.searchParams.append('active', 'true');
      url.searchParams.append('closed', 'false');
      url.searchParams.append('tag_id', '1'); // Strictly Sports Only

      // Pull the newest created markets first (best way to grab active daily sports)
      url.searchParams.append('order', 'startDate');
      url.searchParams.append('ascending', 'false');

      url.searchParams.append('limit', maxApiLimit.toString());
      url.searchParams.append('offset', offset.toString());

      const response = await fetch(url.toString(), { cache: 'no-store' });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gamma API Error ${response.status}: ${errText}`);
      }

      const events: PolymarketEvent[] = await response.json();
      allEvents = allEvents.concat(events);

      if (events.length < maxApiLimit) {
        break;
      }
    }

    // 1. Extract valid 1x2 and Moneyline sports matches
    let matches = allEvents
      .map(extractFavorite)
      .filter((match): match is ProcessedMatch => match !== null);

    // 2. Sort by match start time (soonest matches at the top)
    return matches.sort(
      (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    );
  } catch (error) {
    console.error('Data pipeline error:', error);
    return [];
  }
}
