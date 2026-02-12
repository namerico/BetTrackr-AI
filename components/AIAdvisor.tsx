import React, { useState } from 'react';
import { Bet } from '../types';
import { analyzeBets } from '../services/geminiService';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  bets: Bet[];
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ bets }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (bets.length < 3) {
      setAnalysis("Por favor, registre pelo menos 3 apostas para obter uma análise significativa.");
      return;
    }

    setIsLoading(true);
    setAnalysis(null);
    
    try {
      const result = await analyzeBets(bets);
      setAnalysis(result);
    } catch (error) {
      setAnalysis("Ocorreu um erro ao gerar a análise.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-6 mb-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Bot size={100} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <Sparkles className="text-white h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold text-white">Coach IA</h3>
        </div>
        
        <p className="text-slate-300 mb-4 text-sm max-w-2xl">
          Use a inteligência artificial para analisar seus padrões de aposta, encontrar vazamentos de lucro e otimizar sua estratégia.
        </p>

        {!analysis && !isLoading && (
          <button 
            onClick={handleAnalyze}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/50"
          >
            <Bot size={18} />
            Gerar Análise de Desempenho
          </button>
        )}

        {isLoading && (
          <div className="flex items-center gap-3 text-indigo-300 animate-pulse">
            <Loader2 className="animate-spin" />
            <span>Analisando seus dados com Gemini...</span>
          </div>
        )}

        {analysis && (
          <div className="mt-4 bg-slate-900/50 rounded-lg p-4 border border-indigo-500/20 text-slate-200 text-sm leading-relaxed max-h-96 overflow-y-auto custom-markdown">
            <ReactMarkdown 
                components={{
                    h1: ({node, ...props}) => <h1 className="text-lg font-bold text-indigo-300 mb-2" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-base font-bold text-indigo-300 mb-2 mt-4" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-sm font-bold text-white mb-1 mt-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="text-slate-300" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-indigo-200 font-semibold" {...props} />
                }}
            >
                {analysis}
            </ReactMarkdown>
            <button 
              onClick={() => setAnalysis(null)} 
              className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline"
            >
              Limpar análise
            </button>
          </div>
        )}
      </div>
    </div>
  );
};