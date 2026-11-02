import React from 'react';
import { Layers, Plus, TrendingUp, TrendingDown, CheckCircle2, Award, Zap } from 'lucide-react';
import { formatCurrency, calculateTradePnL } from '../utils/formatters';

export function StrategiesView({ trades = [], currency = 'USD', onOpenTradeModal }) {
  const strategyMap = {};

  trades.filter(t => t.status === 'CLOSED').forEach(t => {
    const sName = t.strategy || 'SMC Order Block';
    if (!strategyMap[sName]) {
      strategyMap[sName] = { count: 0, wins: 0, losses: 0, netPnL: 0 };
    }
    const { pnlAmount } = calculateTradePnL(t);
    strategyMap[sName].count += 1;
    strategyMap[sName].netPnL += pnlAmount;
    if (pnlAmount >= 0) strategyMap[sName].wins += 1;
    else strategyMap[sName].losses += 1;
  });

  const list = Object.keys(strategyMap).map(k => ({
    name: k,
    ...strategyMap[k],
    winRate: strategyMap[k].count > 0 ? (strategyMap[k].wins / strategyMap[k].count) * 100 : 0
  })).sort((a, b) => b.netPnL - a.netPnL);

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Glass Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-box border border-[#1E2638]">
        <div>
          <h2 className="text-xl font-black text-[#38BDF8] font-jakarta tracking-tight flex items-center space-x-2">
            <Layers className="w-5.5 h-5.5 text-[#38BDF8]" />
            <span>Trading Strategies & Playbooks</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Monitor real-time profitability and win rate metrics across your SMC and mechanical setups.
          </p>
        </div>

        <button
          onClick={onOpenTradeModal}
          className="px-5 py-2.5 bg-gradient-to-r from-[#38BDF8] via-[#0284C7] to-[#0369A1] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 transition-all duration-200 flex items-center space-x-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Log Setup Execution</span>
        </button>
      </div>

      {/* Interactive Responsive Glass Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.length > 0 ? (
          list.map((s, idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-3xl cursor-pointer select-none space-y-4 transition-all duration-300 ${
                s.netPnL >= 0 ? 'glass-box-emerald' : 'glass-box-rose'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#1E2638]/80 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0B0F19]/80 flex items-center justify-center border border-[#1E2638]">
                    <Zap className={`w-4 h-4 ${s.netPnL >= 0 ? 'text-[#10B981]' : 'text-rose-400'}`} />
                  </div>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm font-jakarta tracking-tight">{s.name}</span>
                </div>
                
                <span className="px-2.5 py-1 rounded-full bg-[#0B0F19]/80 text-[#38BDF8] text-[10px] font-mono font-bold border border-[#1E2638]">
                  {s.count} Trades
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-2xl bg-[#0B0F19]/60 border border-[#1E2638]/60 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Win Rate</span>
                  <span className="text-lg font-bold text-[#10B981] block">{s.winRate.toFixed(1)}%</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#0B0F19]/60 border border-[#1E2638]/60 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Net Realized P&L</span>
                  <span className={`text-lg font-bold block ${s.netPnL >= 0 ? 'text-[#10B981]' : 'text-rose-400'}`}>
                    {s.netPnL >= 0 ? '+' : ''}{formatCurrency(s.netPnL, currency)}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-[#1E2638]/60 flex items-center justify-between font-mono">
                <span>{s.wins} Wins / {s.losses} Losses</span>
                <span className={`font-bold ${s.netPnL >= 0 ? 'text-[#10B981]' : 'text-rose-400'}`}>
                  {s.netPnL >= 0 ? 'Profitable Model' : 'Needs Optimization'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-xs text-slate-500 rounded-3xl glass-box space-y-2">
            <Layers className="w-8 h-8 mx-auto text-slate-600" />
            <p className="font-medium">No strategy executions recorded yet. Log trades to view strategy analytics!</p>
          </div>
        )}
      </div>

    </div>
  );
}
