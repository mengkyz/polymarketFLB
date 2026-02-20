import { ProcessedMatch } from '../types/polymarket';

export interface GroupedMatches {
  [timeBlock: string]: ProcessedMatch[];
}

export function groupMatchesByTime(matches: ProcessedMatch[]): GroupedMatches {
  return matches.reduce((acc: GroupedMatches, match) => {
    const date = new Date(match.startDate);

    // Extract the hour and calculate which 3-hour block it falls into
    const hour = date.getHours();
    const blockStart = Math.floor(hour / 3) * 3;
    const blockEnd = blockStart + 3;

    // Format the key (e.g., "15:00 - 18:00")
    const blockKey = `${blockStart.toString().padStart(2, '0')}:00 - ${blockEnd.toString().padStart(2, '0')}:00`;

    if (!acc[blockKey]) {
      acc[blockKey] = [];
    }
    acc[blockKey].push(match);

    return acc;
  }, {});
}
