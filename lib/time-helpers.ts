import { ProcessedMatch } from '../types/polymarket';

export interface GroupedMatches {
  [timeBlock: string]: ProcessedMatch[];
}

export function groupMatchesByTime(matches: ProcessedMatch[]): GroupedMatches {
  return matches.reduce((acc: GroupedMatches, match) => {
    // FIX: Group by the match's resolution time (endDate) instead of creation date
    const date = new Date(match.endDate);

    const hour = date.getHours();
    const blockStart = Math.floor(hour / 3) * 3;
    const blockEnd = blockStart + 3;

    // Add the specific day so the schedule spans across multiple days cleanly
    const day = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const blockKey = `${day} | ${blockStart.toString().padStart(2, '0')}:00 - ${blockEnd.toString().padStart(2, '0')}:00`;

    if (!acc[blockKey]) {
      acc[blockKey] = [];
    }
    acc[blockKey].push(match);

    return acc;
  }, {});
}
