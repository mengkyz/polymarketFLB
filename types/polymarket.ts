export interface PolymarketEvent {
  id: string;
  title: string;
  startDate: string;
  active: boolean;
  closed: boolean;
  markets: PolymarketMarket[];
}

export interface PolymarketMarket {
  id: string;
  question: string;
  outcomes: string[];
  outcomePrices: string[];
  clobTokenIds: string[];
  active: boolean;
  closed: boolean;
}

export interface ProcessedMatch {
  id: string;
  title: string;
  startDate: string;
  favoriteTeam: string;
  impliedProbability: number;
  clobTokenId: string;
  isLive: boolean;
}
