'use server';

import { PolymarketEvent, ProcessedMatch } from '../types/polymarket';
import { extractFavorite } from './odds-helpers';

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export interface FetchMatchOptions {
  sportSlug?: string;
  limit?: number;
}

export async function fetchActiveMatches(
  options: FetchMatchOptions = {},
): Promise<ProcessedMatch[]> {
  const targetTotal = options.limit || 500;
  const maxApiLimit = 100;
  let allEvents: PolymarketEvent[] = [];

  // Use the exact URL slug from Polymarket (e.g. 'live', 'soccer', 'nba')
  const slug = options.sportSlug || 'live';
  let tagId = '1'; // Default base to All Sports
  let usedLocalFallback = false;

  // 1. DYNAMIC TAG RESOLVER
  if (slug !== 'sports' && slug !== 'live') {
    try {
      const sportsRes = await fetch(`${GAMMA_API_BASE}/sports`, {
        cache: 'no-store',
      });
      if (sportsRes.ok) {
        const sportsData = await sportsRes.json();
        const matchingSport = sportsData.find(
          (s: any) => s.slug?.toLowerCase() === slug.toLowerCase(),
        );

        if (matchingSport && (matchingSport.tag_id || matchingSport.id)) {
          tagId = (matchingSport.tag_id || matchingSport.id).toString();
        } else {
          usedLocalFallback = true;
        }
      } else {
        usedLocalFallback = true;
      }
    } catch (e) {
      usedLocalFallback = true;
    }
  }

  // 2. DATA FETCHING
  try {
    for (let offset = 0; offset < targetTotal; offset += maxApiLimit) {
      const url = new URL(`${GAMMA_API_BASE}/events`);
      url.searchParams.append('active', 'true');
      url.searchParams.append('closed', 'false');
      url.searchParams.append('tag_id', tagId);
      url.searchParams.append('order', 'startDate');
      url.searchParams.append('ascending', 'false');
      url.searchParams.append('limit', maxApiLimit.toString());
      url.searchParams.append('offset', offset.toString());

      const response = await fetch(url.toString(), { cache: 'no-store' });

      if (!response.ok) throw new Error(`API Error ${response.status}`);

      const events: PolymarketEvent[] = await response.json();
      allEvents = allEvents.concat(events);

      if (events.length < maxApiLimit) break;
    }

    let matches = allEvents
      .map(extractFavorite)
      .filter((match): match is ProcessedMatch => match !== null);

    // 3. MIMIC POLYMARKET URL ROUTING
    if (slug === 'live') {
      // Filter down to only games that have started and are actively playing
      matches = matches.filter((m) => m.isLive);
    } else if (usedLocalFallback && slug !== 'sports') {
      matches = matches.filter(
        (m) =>
          m.category.toLowerCase().includes(slug) ||
          m.matchTitle.toLowerCase().includes(slug),
      );
    }

    // Sort by start time
    return matches.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  } catch (error) {
    console.error('Data pipeline error:', error);
    return [];
  }
}
