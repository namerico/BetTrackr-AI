import { GoogleGenAI } from "@google/genai";
import { Bet } from "../types";

// Note: In a real production app, you should not expose API keys on the client side.
// This is for demonstration purposes as requested by the prompt structure.
const API_KEY = process.env.API_KEY || ''; 

export const analyzeBets = async (bets: Bet[]): Promise<string> => {
  if (!API_KEY) {
    return "Erro: Chave de API não configurada (process.env.API_KEY).";
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Filter relevant data to save tokens and improve focus
  const betSummary = bets.map(b => ({
    sport: b.sport,
    market: b.market,
    odds: b.odds,
    result: b.result,
    profit: b.profit,
    stake: b.stake,
    notes: b.notes
  }));

  const prompt = `
    Atue como um analista profissional de apostas esportivas. 
    Analise o seguinte histórico de apostas (formato JSON) e forneça um relatório curto e direto em Markdown.
    
    Dados das apostas:
    ${JSON.stringify(betSummary)}

    Seu relatório deve conter:
    1. Uma breve análise do desempenho geral.
    2. Identificação de padrões (ex: qual esporte ou faixa de odds é mais lucrativa).
    3. Uma dica prática para melhorar a lucratividade baseada nesses dados.
    4. Use emojis para tornar a leitura agradável.
    5. Fale em Português do Brasil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao conectar com a IA. Verifique sua conexão ou chave de API.";
  }
};