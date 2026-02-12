import React, { useState, useEffect } from 'react';
import { Bet, BetResult } from './types';
import { calculateStats } from './utils';
import { DashboardStats } from './components/DashboardStats';
import { BetForm } from './components/BetForm';
import { BetList } from './components/BetList';
import { ProfitChart } from './components/ProfitChart';
import { AIAdvisor } from './components/AIAdvisor';
import { LayoutDashboard, FileDown } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const App: React.FC = () => {
  // Load bets from localStorage on init
  const [bets, setBets] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('bettrackr_bets');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState(calculateStats(bets));

  // Update stats and persistence whenever bets change
  useEffect(() => {
    setStats(calculateStats(bets));
    localStorage.setItem('bettrackr_bets', JSON.stringify(bets));
  }, [bets]);

  const handleAddBet = (newBet: Bet) => {
    setBets(prev => [newBet, ...prev]);
  };

  const handleDeleteBet = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta aposta?')) {
      setBets(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleUpdateResult = (id: string, result: BetResult) => {
    setBets(prev => prev.map(bet => {
      if (bet.id === id) {
        // Recalculate profit based on new result
        let newProfit = 0;
        if (result === BetResult.WIN) {
          newProfit = (bet.stake * bet.odds) - bet.stake;
        } else if (result === BetResult.LOSS) {
          newProfit = -bet.stake;
        } else if (result === BetResult.PUSH) {
          newProfit = 0;
        }
        
        return { ...bet, result, profit: newProfit };
      }
      return bet;
    }));
  };

  const handleExportPDF = () => {
    if (bets.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Histórico de Apostas - BetTrackr AI", 14, 22);
    
    // Metadata
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total de Apostas: ${bets.length}`, 14, 35);
    doc.text(`Lucro Líquido: R$ ${stats.netProfit.toFixed(2)}`, 14, 40);

    // Prepare table data
    // Sort chronologically for the report
    const sortedBets = [...bets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const tableData = sortedBets.map(bet => [
      new Date(bet.date).toLocaleDateString(),
      bet.market,
      `R$ ${bet.stake.toFixed(2)}`,
      bet.odds.toFixed(2),
      bet.result,
      `R$ ${bet.profit.toFixed(2)}`
    ]);

    // Generate table
    autoTable(doc, {
      head: [['Data', 'Mercado', 'Stake', 'Odds', 'Resultado', 'Lucro']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] }, // Emerald color matches theme
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        5: { fontStyle: 'bold' } // Make Profit column bold
      }
    });

    doc.save(`bettrackr_historico_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background pb-12 font-sans text-slate-200">
      {/* Header */}
      <header className="bg-surface border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">BetTrackr <span className="text-emerald-500">AI</span></h1>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            Gestão de Banca Profissional
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Stats Row */}
        <DashboardStats stats={stats} />

        {/* AI Section & Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ProfitChart bets={bets} />
            <BetForm onAddBet={handleAddBet} />
          </div>
          <div className="lg:col-span-1">
             <AIAdvisor bets={bets} />
             {/* Quick Tip or Mini List could go here */}
             <div className="bg-surface border border-slate-700 rounded-xl p-4">
                <h3 className="text-slate-300 font-semibold mb-2 text-sm">Resumo Rápido</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex justify-between">
                        <span>Apostas Pendentes:</span>
                        <span className="text-white">{stats.pending}</span>
                    </li>
                    <li className="flex justify-between">
                        <span>Maior Win:</span>
                        <span className="text-emerald-400">
                            R$ {Math.max(...bets.map(b => b.profit), 0).toFixed(2)}
                        </span>
                    </li>
                     <li className="flex justify-between">
                        <span>Maior Loss:</span>
                        <span className="text-red-400">
                             R$ {Math.min(...bets.map(b => b.profit), 0).toFixed(2)}
                        </span>
                    </li>
                </ul>
             </div>
          </div>
        </div>

        {/* History Table */}
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Histórico de Entradas
              <span className="text-sm font-normal text-slate-500 ml-2">({bets.length} registros)</span>
            </h2>
            <button 
              onClick={handleExportPDF}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <FileDown size={16} />
              Exportar PDF
            </button>
          </div>
          <BetList 
            bets={bets} 
            onDeleteBet={handleDeleteBet} 
            onUpdateResult={handleUpdateResult}
          />
        </div>

      </main>
    </div>
  );
};

export default App;