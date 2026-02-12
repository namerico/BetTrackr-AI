import React, { useState, useEffect } from 'react';
import { Bet, BetResult } from './types';
import { calculateStats } from './utils';
import { DashboardStats } from './components/DashboardStats';
import { BetForm } from './components/BetForm';
import { BetList } from './components/BetList';
import { ProfitChart } from './components/ProfitChart';
import { AIAdvisor } from './components/AIAdvisor';
import { LayoutDashboard, FileDown, Settings, Table, Check, Loader2, X } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

const App: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>(() => {
    const saved = localStorage.getItem('bettrackr_bets');
    return saved ? JSON.parse(saved) : [];
  });

  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('bettrackr_webhook') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [stats, setStats] = useState(calculateStats(bets));

  useEffect(() => {
    setStats(calculateStats(bets));
    localStorage.setItem('bettrackr_bets', JSON.stringify(bets));
  }, [bets]);

  useEffect(() => {
    localStorage.setItem('bettrackr_webhook', webhookUrl);
  }, [webhookUrl]);

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

  const handleSyncToSheets = async () => {
    if (!webhookUrl) {
      alert("Por favor, configure a URL do Apps Script nas configurações.");
      setShowSettings(true);
      return;
    }

    setIsSyncing(true);
    setSyncStatus('idle');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Apps Script requires no-cors often for simple triggers
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bets),
      });
      
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error("Erro na sincronização:", error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportCSV = () => {
    if (bets.length === 0) return;
    const headers = ["Data", "Mercado", "Stake", "Odds", "Resultado", "Lucro"];
    const csvContent = [
      headers.join(","),
      ...bets.map(b => [
        new Date(b.date).toLocaleDateString(),
        `"${b.market}"`,
        b.stake,
        b.odds,
        b.result,
        b.profit
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `apostas_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const handleExportPDF = () => {
    if (bets.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Histórico de Apostas - BetTrackr AI", 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 30);
    const tableData = bets.map(bet => [
      new Date(bet.date).toLocaleDateString(),
      bet.market,
      `R$ ${bet.stake.toFixed(2)}`,
      bet.odds.toFixed(2),
      bet.result,
      `R$ ${bet.profit.toFixed(2)}`
    ]);
    autoTable(doc, {
      head: [['Data', 'Mercado', 'Stake', 'Odds', 'Resultado', 'Lucro']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [16, 185, 129] },
    });
    doc.save(`bettrackr_historico_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background pb-12 font-sans text-slate-200">
      <header className="bg-surface border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">BetTrackr <span className="text-emerald-500">AI</span></h1>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400"
            title="Configurações de Integração"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSettings && (
          <div className="mb-8 bg-surface border border-emerald-500/30 rounded-xl p-6 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Table className="text-emerald-500" size={20} />
                Integração Google Sheets
              </h3>
              <button onClick={() => setShowSettings(false)}><X size={20} className="text-slate-500 hover:text-white" /></button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Cole a URL de implantação do seu Google Apps Script abaixo para salvar os dados diretamente na sua planilha.
            </p>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button 
                onClick={() => setShowSettings(false)}
                className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        )}

        <DashboardStats stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ProfitChart bets={bets} />
            <BetForm onAddBet={handleAddBet} />
          </div>
          <div className="lg:col-span-1">
             <AIAdvisor bets={bets} />
             <div className="bg-surface border border-slate-700 rounded-xl p-4">
                <h3 className="text-slate-300 font-semibold mb-2 text-sm">Resumo Rápido</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li className="flex justify-between">
                        <span>Apostas Pendentes:</span>
                        <span className="text-white">{stats.pending}</span>
                    </li>
                    <li className="flex justify-between">
                        <span>Maior Win:</span>
                        <span className="text-emerald-400">R$ {Math.max(...bets.map(b => b.profit), 0).toFixed(2)}</span>
                    </li>
                </ul>
             </div>
          </div>
        </div>

        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Histórico de Entradas
              <span className="text-sm font-normal text-slate-500 ml-2">({bets.length} registros)</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={handleSyncToSheets}
                disabled={isSyncing}
                className={`px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all ${
                  syncStatus === 'success' ? 'bg-emerald-500' : 
                  syncStatus === 'error' ? 'bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isSyncing ? <Loader2 size={16} className="animate-spin" /> : syncStatus === 'success' ? <Check size={16} /> : <Table size={16} />}
                {isSyncing ? 'Sincronizando...' : syncStatus === 'success' ? 'Sincronizado!' : 'Salvar no Sheets'}
              </button>
              <button 
                onClick={handleExportCSV}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Table size={16} />
                CSV
              </button>
              <button 
                onClick={handleExportPDF}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <FileDown size={16} />
                PDF
              </button>
            </div>
          </div>
          <BetList bets={bets} onDeleteBet={handleDeleteBet} onUpdateResult={handleUpdateResult} />
        </div>
      </main>
    </div>
  );
};

export default App;