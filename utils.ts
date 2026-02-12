import { Bet, BetResult, Stats } from './types';

export const calculateStats = (bets: Bet[]): Stats => {
  const initialStats: Stats = {
    totalBets: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    pending: 0,
    totalStaked: 0,
    netProfit: 0,
    roi: 0,
    winRate: 0
  };

  const stats = bets.reduce((acc, bet) => {
    acc.totalBets++;
    acc.totalStaked += bet.stake;

    switch (bet.result) {
      case BetResult.WIN:
        acc.wins++;
        acc.netProfit += bet.profit;
        break;
      case BetResult.LOSS:
        acc.losses++;
        acc.netProfit += bet.profit; // profit is negative here
        break;
      case BetResult.PUSH:
        acc.pushes++;
        break;
      case BetResult.PENDING:
        acc.pending++;
        break;
    }
    return acc;
  }, initialStats);

  // ROI Calculation: (Net Profit / Total Staked) * 100
  // Note: Usually ROI is calculated on settled bets only, but total staked often includes everything. 
  // Let's calculate ROI based on Settled Stake to be accurate.
  const settledBets = bets.filter(b => b.result !== BetResult.PENDING);
  const settledStaked = settledBets.reduce((sum, b) => sum + b.stake, 0);

  if (settledStaked > 0) {
    stats.roi = (stats.netProfit / settledStaked) * 100;
  }

  // Win Rate: Wins / (Wins + Losses) * 100  (ignoring pushes usually)
  const decisiveBets = stats.wins + stats.losses;
  if (decisiveBets > 0) {
    stats.winRate = (stats.wins / decisiveBets) * 100;
  }

  return stats;
};