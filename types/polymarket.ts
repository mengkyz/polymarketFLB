export interface PolymarketEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
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

export interface ProcessedOutcome {
  name: string;
  price: number;
  clobTokenId: string;
}

export interface ProcessedMatch {
  id: string;
  title: string;
  matchTitle: string; // The clean match name (e.g., "Lakers vs Bulls")
  category: string; // The extracted sport category (e.g., "NBA")
  startDate: string;
  endDate: string;
  favoriteTeam: string;
  impliedProbability: number;
  clobTokenId: string;
  isLive: boolean;
  outcomes: ProcessedOutcome[];
}
