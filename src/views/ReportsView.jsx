import React from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap,
  BarChart3
} from 'lucide-react';
import { formatCurrency, calculateTradePnL, formatPercent } from '../utils/formatters';

export function ReportsView({ trades = [], currency = 'USD', onExportCSV, onExportJSON }) {
  const closed = trades.filter(t => t.status === 'CLOSED');
  
  let netPnL = 0;
  let winCount = 0;
  let lossCount = 0;

  closed.forEach(t => {
    const { pnlAmount } = calculateTradePnL(t);
    netPnL += pnlAmount;
    if (pnlAmount >= 0) winCount++;
    else lossCount++;
  });

  const winRate = closed.length > 0 ? (winCount / closed.length) * 100 : 0;

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Glass Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-box border border-[#1E2638]">
        <div>
          <h2 className="text-xl font-black text-[#38BDF8] font-jakarta tracking-tight flex items-center space-x-2">
            <FileText className="w-5.5 h-5.5 text-[#38BDF8]" />
            <span>Performance Reports & Verified Statements</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Generate, audit, and export verified trading statements and CSV data backups.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={onExportCSV}
            className="px-5 py-2.5 bg-gradient-to-r from-[#38BDF8] via-[#0284C7] to-[#0369A1] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 transition-all duration-200 flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onExportJSON}
            className="px-4 py-2.5 bg-[#111726]/80 hover:bg-[#1E2638] border border-[#1E2638] text-slate-200 font-extrabold text-xs rounded-xl transition-all duration-200 flex items-center space-x-2 cursor-pointer hover:border-slate-600"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#38BDF8]" />
            <span>Export JSON Backup</span>
          </button>
        </div>
      </div>

      {/* Interactive Responsive Glass Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Total Verified Executions */}
        <div className="p-5 rounded-2xl glass-box space-y-2 cursor-pointer select-none">
          <div className="flex items-center justify-between border-b border-[#1E2638]/80 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Total Recorded Executions
            </span>
            <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white font-mono tracking-tight">
              {trades.length} <span className="text-xs font-normal text-slate-400">Trades</span>
            </h3>
            <span className="text-[11px] text-[#10B981] font-bold block mt-1 font-mono">
              ✓ Verified System Records
            </span>
          </div>
        </div>

        {/* Card 2: Net Realized P&L */}
        <div className={`p-5 rounded-2xl cursor-pointer select-none space-y-2 ${
          netPnL >= 0 ? 'glass-box-emerald' : 'glass-box-rose'
        }`}>
          <div className="flex items-center justify-between border-b border-[#1E2638]/80 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Net Realized P&L
            </span>
            {netPnL >= 0 ? (
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>

          <div>
            <h3 className={`text-lg font-bold font-mono tracking-tight ${
              netPnL >= 0 ? 'text-[#10B981]' : 'text-rose-400'
            }`}>
              {netPnL >= 0 ? '+' : ''}{formatCurrency(netPnL, currency)}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium block mt-1 font-mono">
              Cumulative Account Return
            </span>
          </div>
        </div>

        {/* Card 3: Win Rate & Closed Executions */}
        <div className="p-5 rounded-2xl glass-box space-y-2 cursor-pointer select-none">
          <div className="flex items-center justify-between border-b border-[#1E2638]/80 pb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              Closed Trade Win Rate
            </span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white font-mono tracking-tight">
              {winRate.toFixed(1)}%
            </h3>
            <span className="text-[11px] text-slate-400 font-medium block mt-1 font-mono">
              {winCount} Wins / {lossCount} Losses ({closed.length} Closed)
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
