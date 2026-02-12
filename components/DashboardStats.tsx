import React from 'react';
import { Stats } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, Percent } from 'lucide-react';

interface DashboardStatsProps {
  stats: Stats;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const isProfitable = stats.netProfit >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Net Profit Card */}
      <div className={`p-4 rounded-xl border ${isProfitable ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-red-900/20 border-red-500/50'} flex flex-col justify-between`}>
        <div className="flex justify-between items-start mb-2">
          <span className="text-slate-400 text-sm font-medium">Lucro Líquido</span>
          {isProfitable ? <TrendingUp className="text-emerald-500 h-5 w-5" /> : <TrendingDown className="text-red-500 h-5 w-5" />}
        </div>
        <div>
          <span className={`text-2xl font-bold ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
            R$ {stats.netProfit.toFixed(2)}
          </span>
          <p className="text-xs text-slate-500 mt-1">Total acumulado</p>
        </div>
      </div>

      {/* ROI Card */}
      <div className="bg-surface p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-slate-400 text-sm font-medium">ROI</span>
          <Percent className="text-blue-400 h-5 w-5" />
        </div>
        <div>
          <span className={`text-2xl font-bold ${stats.roi >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            {stats.roi.toFixed(2)}%
          </span>
          <p className="text-xs text-slate-500 mt-1">Retorno sobre investimento</p>
        </div>
      </div>

      {/* Win Rate Card */}
      <div className="bg-surface p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-slate-400 text-sm font-medium">Taxa de Acerto</span>
          <Target className="text-purple-400 h-5 w-5" />
        </div>
        <div>
          <span className="text-2xl font-bold text-slate-100">
            {stats.winRate.toFixed(1)}%
          </span>
          <p className="text-xs text-slate-500 mt-1">{stats.wins} vitórias em {stats.totalBets - stats.pending} resolvidas</p>
        </div>
      </div>

      {/* Total Staked Card */}
      <div className="bg-surface p-4 rounded-xl border border-slate-700 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <span className="text-slate-400 text-sm font-medium">Volume Apostado</span>
          <Activity className="text-orange-400 h-5 w-5" />
        </div>
        <div>
          <span className="text-2xl font-bold text-slate-100">
            R$ {stats.totalStaked.toFixed(2)}
          </span>
          <p className="text-xs text-slate-500 mt-1">{stats.totalBets} apostas totais</p>
        </div>
      </div>
    </div>
  );
};