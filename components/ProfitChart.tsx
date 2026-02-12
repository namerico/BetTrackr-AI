import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { Bet, BetResult } from '../types';

interface ProfitChartProps {
  bets: Bet[];
}

export const ProfitChart: React.FC<ProfitChartProps> = ({ bets }) => {
  // Sort bets chronologically for the chart
  const sortedBets = [...bets]
    .filter(b => b.result !== BetResult.PENDING && b.result !== BetResult.PUSH)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedBets.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center bg-surface border border-slate-700 rounded-xl text-slate-500 text-sm">
        Dados insuficientes para gerar gráfico (mínimo 2 apostas finalizadas).
      </div>
    );
  }

  // Calculate cumulative profit
  let cumulative = 0;
  const data = sortedBets.map((bet, index) => {
    cumulative += bet.profit;
    return {
      index: index + 1,
      date: new Date(bet.date).toLocaleDateString(),
      profit: cumulative,
      originalProfit: bet.profit, // for tooltip
    };
  });

  // Add a starting point of 0
  const chartData = [{ index: 0, date: 'Início', profit: 0, originalProfit: 0 }, ...data];
  const lastValue = chartData[chartData.length - 1].profit;
  const isPositive = lastValue >= 0;

  return (
    <div className="h-72 w-full bg-surface p-4 rounded-xl border border-slate-700 mb-6">
      <h3 className="text-slate-200 font-semibold mb-4 text-sm">Evolução da Banca</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="index" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `R$${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }}
            itemStyle={{ color: '#f8fafc' }}
            labelFormatter={() => ''}
            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Acumulado']}
          />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
          <Area 
            type="monotone" 
            dataKey="profit" 
            stroke={isPositive ? "#10b981" : "#ef4444"} 
            fillOpacity={1} 
            fill="url(#colorProfit)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};