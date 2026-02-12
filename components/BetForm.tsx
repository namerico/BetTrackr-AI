import React, { useState } from 'react';
import { Bet, BetResult } from '../types';
import { PlusCircle, Save, Undo2 } from 'lucide-react';

interface BetFormProps {
  onAddBet: (bet: Bet) => void;
}

export const BetForm: React.FC<BetFormProps> = ({ onAddBet }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomMarket, setIsCustomMarket] = useState(false);
  
  const [formData, setFormData] = useState({
    sport: 'Futebol',
    market: '',
    stake: '',
    odds: '',
    result: BetResult.PENDING,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.market || !formData.stake || !formData.odds) return;

    const stake = parseFloat(formData.stake);
    const odds = parseFloat(formData.odds);
    
    // Calculate initial profit based on result
    let profit = 0;
    if (formData.result === BetResult.WIN) {
      profit = (stake * odds) - stake;
    } else if (formData.result === BetResult.LOSS) {
      profit = -stake;
    }

    const newBet: Bet = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      sport: 'Futebol', // Hardcoded as requested
      market: formData.market,
      stake,
      odds,
      result: formData.result,
      profit,
      notes: formData.notes
    };

    onAddBet(newBet);
    
    // Reset form
    setFormData(prev => ({
      ...prev,
      market: '',
      stake: '',
      odds: '',
      result: BetResult.PENDING,
      notes: ''
    }));
    setIsCustomMarket(false);
    setIsOpen(false);
  };

  const handleMarketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setIsCustomMarket(true);
      setFormData({ ...formData, market: '' });
    } else {
      setFormData({ ...formData, market: value });
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold shadow-lg shadow-emerald-900/20"
      >
        <PlusCircle size={20} />
        Adicionar Nova Aposta
      </button>
    );
  }

  return (
    <div className="bg-surface border border-slate-700 p-6 rounded-xl mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Nova Aposta</h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-sm">Cancelar</button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Esporte</label>
            <div className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-slate-300 cursor-not-allowed font-medium">
              Futebol
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mercado / Seleção</label>
            {!isCustomMarket ? (
              <select 
                value={formData.market}
                onChange={handleMarketChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                required
              >
                <option value="">Selecione...</option>
                <option value="Escanteios: Mais de 5">Escanteios: Mais de 5</option>
                <option value="Escanteios: Mais de 6">Escanteios: Mais de 6</option>
                <option value="Escanteios: Mais de 7">Escanteios: Mais de 7</option>
                <option value="custom">Outro / Personalizado...</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Digite o mercado..."
                  value={formData.market}
                  onChange={e => setFormData({...formData, market: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  required
                  autoFocus
                />
                <button 
                  type="button"
                  onClick={() => setIsCustomMarket(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
                  title="Voltar para lista"
                >
                  <Undo2 size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Valor (Stake)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
              <input 
                type="number"
                step="0.01"
                min="0.1"
                placeholder="0.00"
                value={formData.stake}
                onChange={e => setFormData({...formData, stake: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pl-9 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Odds</label>
            <input 
              type="number"
              step="0.01"
              min="1.01"
              placeholder="1.50"
              value={formData.odds}
              onChange={e => setFormData({...formData, odds: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Resultado</label>
            <select 
              value={formData.result}
              onChange={e => setFormData({...formData, result: e.target.value as BetResult})}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            >
              <option value={BetResult.PENDING}>Pendente</option>
              <option value={BetResult.WIN}>Green (Vitória)</option>
              <option value={BetResult.LOSS}>Red (Derrota)</option>
              <option value={BetResult.PUSH}>Reembolso (Push)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Notas (Opcional)</label>
          <textarea 
            rows={2}
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
            placeholder="Análise rápida do motivo da entrada..."
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Save size={18} />
          Salvar Aposta
        </button>
      </form>
    </div>
  );
};