import React from 'react';
import { Bet, BetResult } from '../types';
import { CheckCircle, XCircle, Clock, RotateCcw, Trash2 } from 'lucide-react';

interface BetListProps {
  bets: Bet[];
  onDeleteBet: (id: string) => void;
  onUpdateResult: (id: string, result: BetResult) => void;
}

const getResultColor = (result: BetResult) => {
  switch (result) {
    case BetResult.WIN: return 'text-emerald-400';
    case BetResult.LOSS: return 'text-red-400';
    case BetResult.PUSH: return 'text-orange-400';
    default: return 'text-slate-400';
  }
};

const getResultIcon = (result: BetResult) => {
  switch (result) {
    case BetResult.WIN: return <CheckCircle size={16} className="text-emerald-500" />;
    case BetResult.LOSS: return <XCircle size={16} className="text-red-500" />;
    case BetResult.PUSH: return <RotateCcw size={16} className="text-orange-500" />;
    default: return <Clock size={16} className="text-slate-500" />;
  }
};

export const BetList: React.FC<BetListProps> = ({ bets, onDeleteBet, onUpdateResult }) => {
  if (bets.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-surface rounded-xl border border-slate-700">
        <p>Nenhuma aposta registrada ainda.</p>
      </div>
    );
  }

  // Sort by date descending
  const sortedBets = [...bets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="overflow-x-auto bg-surface rounded-xl border border-slate-700">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
          <tr>
            <th className="p-4 font-medium">Data / Esporte</th>
            <th className="p-4 font-medium">Seleção</th>
            <th className="p-4 font-medium text-right">Stake</th>
            <th className="p-4 font-medium text-right">Odds</th>
            <th className="p-4 font-medium">Resultado</th>
            <th className="p-4 font-medium text-right">Lucro/Perda</th>
            <th className="p-4 font-medium text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {sortedBets.map((bet) => (
            <tr key={bet.id} className="hover:bg-slate-700/30 transition-colors">
              <td className="p-4">
                <div className="font-medium text-white">{bet.sport}</div>
                <div className="text-xs text-slate-500">{new Date(bet.date).toLocaleDateString()}</div>
              </td>
              <td className="p-4 text-slate-200">
                {bet.market}
                {bet.notes && <p className="text-xs text-slate-500 truncate max-w-[150px]">{bet.notes}</p>}
              </td>
              <td className="p-4 text-right text-slate-200">R$ {bet.stake.toFixed(2)}</td>
              <td className="p-4 text-right text-accent font-medium">{bet.odds.toFixed(2)}</td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                   {/* Quick Status Toggle */}
                   <select 
                    value={bet.result}
                    onChange={(e) => onUpdateResult(bet.id, e.target.value as BetResult)}
                    className="bg-slate-900 border border-slate-700 text-xs rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-emerald-500"
                   >
                     <option value={BetResult.PENDING}>Pendente</option>
                     <option value={BetResult.WIN}>Win</option>
                     <option value={BetResult.LOSS}>Loss</option>
                     <option value={BetResult.PUSH}>Push</option>
                   </select>
                   {getResultIcon(bet.result)}
                </div>
              </td>
              <td className={`p-4 text-right font-bold ${bet.profit > 0 ? 'text-emerald-400' : bet.profit < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {bet.profit > 0 ? '+' : ''}{bet.profit.toFixed(2)}
              </td>
              <td className="p-4 text-center">
                <button 
                  onClick={() => onDeleteBet(bet.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};