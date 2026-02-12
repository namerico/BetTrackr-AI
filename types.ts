export enum BetResult {
  WIN = 'WIN',
  LOSS = 'LOSS',
  PUSH = 'PUSH', // Devolvida
  PENDING = 'PENDING'
}

export interface Bet {
  id: string;
  date: string;
  sport: string;
  market: string; // e.g., "Over 2.5 Goals", "Team A to Win"
  stake: number;
  odds: number;
  result: BetResult;
  profit: number; // Calculated field
  notes?: string;
}

export interface Stats {
  totalBets: number;
  wins: number;
  losses: number;
  pushes: number;
  pending: number;
  totalStaked: number;
  netProfit: number;
  roi: number; // Return on Investment %
  winRate: number; // %
}