import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Zap,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatDate, formatPercent, calculateTradePnL } from '../utils/formatters';
import { CryptoIcon } from '../utils/cryptoIcons';

export function TradeLogView({ 
  trades = [], 
  currency = 'USD', 
  onOpenTradeModal,
  onOpenPreTradeChecklist,
  onEditTrade,
  onDeleteTrade,
  onExportCSV,
  onOpenImportModal,
  onViewTradeChart,
  searchTerm,
  setSearchTerm
}) {
  const [filterDirection, setFilterDirection] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterStrategy, setFilterStrategy] = useState('ALL');

  const filteredTrades = useMemo(() => {
    return (trades || []).filter(t => {
      if (!t) return false;
      const term = (searchTerm || '').toLowerCase();
      const sym = (t.symbol || '').toLowerCase();
      const strat = (t.strategy || '').toLowerCase();
      const nts = (t.notes || '').toLowerCase();

      const matchesSearch = !term || sym.includes(term) || strat.includes(term) || nts.includes(term);
      const matchesDir = filterDirection === 'ALL' || t.direction === filterDirection;
      const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
      const matchesStrat = filterStrategy === 'ALL' || t.strategy === filterStrategy;

      return matchesSearch && matchesDir && matchesStatus && matchesStrat;
    });
  }, [trades, searchTerm, filterDirection, filterStatus, filterStrategy]);

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Top Action Bar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-box">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Symbol (e.g. BTC/USDT, RELIANCE), Strategy, Notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
          />
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
            className="px-3 py-2 bg-[#0B0F19] text-slate-200 text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
          >
            <option value="ALL">All Directions</option>
            <option value="LONG">Long Only</option>
            <option value="SHORT">Short Only</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-[#0B0F19] text-slate-200 text-xs font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
          >
            <option value="ALL">All Status</option>
            <option value="CLOSED">Closed Only</option>
            <option value="OPEN">Open Only</option>
          </select>

          <button
            onClick={onOpenPreTradeChecklist}
            className="px-3.5 py-2 bg-[#0B0F19] border border-[#38BDF8]/40 text-[#38BDF8] hover:bg-[#38BDF8]/10 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Pre-Trade Checklist</span>
          </button>

          <button
            onClick={onExportCSV}
            className="p-2 bg-[#0B0F19] border border-[#1E2638] text-slate-300 hover:text-white rounded-xl"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenImportModal}
            className="p-2 bg-[#0B0F19] border border-[#1E2638] text-slate-300 hover:text-white rounded-xl"
            title="Import CSV"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenTradeModal}
            className="px-4 py-2 bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-md shadow-sky-500/20 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Entry</span>
          </button>

        </div>

      </div>

      {/* Trade Log Table */}
      <div className="p-5 rounded-2xl glass-box space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
          <h3 className="text-sm font-bold text-white font-jakarta">
            Trade Log Journal
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {filteredTrades.length} Records Found
          </span>
        </div>

        <div className="overflow-x-auto">
          {filteredTrades.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-slate-500 uppercase border-b border-[#1E2638]">
                  <th className="py-2.5 px-3">DATE & TIME</th>
                  <th className="py-2.5 px-3">SYMBOL</th>
                  <th className="py-2.5 px-3">DIRECTION</th>
                  <th className="py-2.5 px-3">CONFLUENCE</th>
                  <th className="py-2.5 px-3">ENTRY</th>
                  <th className="py-2.5 px-3">EXIT</th>
                  <th className="py-2.5 px-3">QTY</th>
                  <th className="py-2.5 px-3">REALIZED P&L</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2638]/50">
                {filteredTrades.map((t, idx) => {
                  if (!t) return null;
                  const { pnlAmount = 0, pnlPercent = 0 } = calculateTradePnL(t) || {};
                  const isLong = (t.direction || 'LONG').toUpperCase() === 'LONG';
                  const confCount = [t.h1Bias, t.m15Structure, t.m5EntryPoi, t.m1BosChoch].filter(Boolean).length;
                  const tradeId = t.id || `trade-${idx}`;

                  return (
                    <tr key={tradeId} className="hover:bg-[#0B0F19]/50 transition">
                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">{formatDate(t.entryDate)}</td>
                      <td className="py-3 px-3 font-bold text-white font-mono flex items-center">
                        <CryptoIcon symbol={t.symbol} className="w-5 h-5 mr-2 shrink-0" />
                        <span>{t.symbol || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-extrabold uppercase border inline-block ${
                          isLong ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}>
                          {isLong ? 'Long' : 'Short'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {confCount === 4 ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-[10px] font-bold">
                            ⭐⭐⭐⭐ A+ (4/4)
                          </span>
                        ) : confCount === 3 ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] text-[10px] font-bold">
                            ⭐⭐⭐ B (3/4)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                            {confCount}/4 Setup
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300 font-bold">{t.entryPrice !== undefined && t.entryPrice !== null ? formatCurrency(t.entryPrice, currency) : '-'}</td>
                      <td className="py-3 px-3 font-mono text-slate-300 font-bold">{t.status === 'CLOSED' && t.exitPrice !== undefined && t.exitPrice !== null ? formatCurrency(t.exitPrice, currency) : '-'}</td>
                      <td className="py-3 px-3 font-mono text-slate-300 font-bold">
                        <div>
                          <span>{t.quantity !== undefined ? t.quantity : '-'}</span>
                          {t.lots && (
                            <span className="text-[10px] text-[#38BDF8] block font-mono font-normal">
                              {t.lots} Lots {t.leverage ? `(${t.leverage}x)` : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {t.status === 'CLOSED' ? (
                          <span className={`font-black ${pnlAmount >= 0 ? 'text-[#10B981]' : 'text-rose-400'}`}>
                            {pnlAmount >= 0 ? '+' : ''}{formatCurrency(pnlAmount, currency)} ({formatPercent(pnlPercent)})
                          </span>
                        ) : (
                          <span className="text-purple-400 font-semibold">Open Position</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.status === 'CLOSED' ? 'closed-status-badge' : 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30'
                        }`}>
                          {t.status || 'CLOSED'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        {t.chartUrl && (
                          <button onClick={() => onViewTradeChart(t)} className="p-1 rounded-lg text-[#38BDF8] hover:bg-[#38BDF8]/10">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => onEditTrade(t)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2638]">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDeleteTrade(t.id)} className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#1E2638]">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <Zap className="w-8 h-8 mx-auto text-slate-600" />
              <p>No executions matching your search filters</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
