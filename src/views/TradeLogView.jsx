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
import { formatCurrency, formatPrice, formatDate, formatPercent, calculateTradePnL } from '../utils/formatters';
import { CryptoIcon } from '../utils/cryptoIcons';

export function TradeLogView({ 
  trades = [], 
  currency = 'INR', 
  onOpenTradeModal,
  onOpenPreTradeChecklist,
  onEditTrade,
  onDeleteTrade,
  onExportCSV,
  onOpenImportModal,
  onViewTradeChart,
  searchTerm,
  setSearchTerm,
  darkMode = true
}) {
  const isDark = typeof darkMode === 'boolean' 
    ? darkMode 
    : (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

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
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${
        isDark ? 'bg-[#0B0F19]/80 border-[#1E2638] shadow-lg shadow-black/20' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search by Symbol (e.g. BTC/USDT, RELIANCE), Strategy, Notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-none transition ${
              isDark 
                ? 'bg-[#0B0F19] text-white border-[#1E2638] focus:border-sky-500 placeholder:text-slate-500' 
                : 'bg-white text-slate-900 border-slate-200 focus:border-sky-500 placeholder:text-slate-400 hover:border-slate-300'
            }`}
          />
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border focus:outline-none transition cursor-pointer ${
              isDark 
                ? 'bg-[#0B0F19] text-slate-200 border-[#1E2638] focus:border-sky-500' 
                : 'bg-white text-slate-800 border-slate-200 focus:border-sky-500 hover:border-slate-300'
            }`}
          >
            <option value="ALL">All Directions</option>
            <option value="LONG">Long Only</option>
            <option value="SHORT">Short Only</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border focus:outline-none transition cursor-pointer ${
              isDark 
                ? 'bg-[#0B0F19] text-slate-200 border-[#1E2638] focus:border-sky-500' 
                : 'bg-white text-slate-800 border-slate-200 focus:border-sky-500 hover:border-slate-300'
            }`}
          >
            <option value="ALL">All Status</option>
            <option value="CLOSED">Closed Only</option>
            <option value="OPEN">Open Only</option>
          </select>

          <button
            onClick={onOpenPreTradeChecklist}
            className={`px-3.5 py-2 border font-bold text-xs rounded-xl transition flex items-center space-x-1.5 cursor-pointer ${
              isDark 
                ? 'bg-[#0B0F19] border-[#38BDF8]/40 text-[#38BDF8] hover:bg-[#38BDF8]/10' 
                : 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Pre-Trade Checklist</span>
          </button>

          <button
            onClick={onExportCSV}
            className={`p-2 border rounded-xl transition cursor-pointer ${
              isDark 
                ? 'bg-[#0B0F19] border-[#1E2638] text-slate-300 hover:text-white hover:border-slate-600' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenImportModal}
            className={`p-2 border rounded-xl transition cursor-pointer ${
              isDark 
                ? 'bg-[#0B0F19] border-[#1E2638] text-slate-300 hover:text-white hover:border-slate-600' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Import CSV"
          >
            <Upload className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenTradeModal}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-sky-500/20 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Entry</span>
          </button>

        </div>

      </div>

      {/* Trade Log Table */}
      <div className={`p-5 rounded-2xl border transition-all space-y-4 ${
        isDark ? 'bg-[#0B0F19]/80 border-[#1E2638] shadow-lg shadow-black/20' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`flex items-center justify-between border-b pb-3 ${
          isDark ? 'border-[#1E2638]' : 'border-slate-200'
        }`}>
          <h3 className={`text-sm font-bold font-jakarta ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Trade Log Journal
          </h3>
          <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {filteredTrades.length} Records Found
          </span>
        </div>

        <div className="overflow-x-auto">
          {filteredTrades.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`text-[10px] font-bold uppercase border-b ${
                  isDark ? 'text-slate-500 border-[#1E2638]' : 'text-slate-400 border-slate-200'
                }`}>
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
              <tbody className={`divide-y ${isDark ? 'divide-[#1E2638]/50' : 'divide-slate-100'}`}>
                {filteredTrades.map((t, idx) => {
                  if (!t) return null;
                  const { pnlAmount = 0, pnlPercent = 0 } = calculateTradePnL(t) || {};
                  const isLong = (t.direction || 'LONG').toUpperCase() === 'LONG';
                  const confCount = [t.h1Bias, t.m15Structure, t.m5EntryPoi, t.m1BosChoch].filter(Boolean).length;
                  const tradeId = t.id || `trade-${idx}`;

                  return (
                    <tr key={tradeId} className={`transition ${isDark ? 'hover:bg-[#111726]/60' : 'hover:bg-slate-50'}`}>
                      <td className={`py-3 px-3 font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{formatDate(t.entryDate)}</td>
                      <td className={`py-3 px-3 font-bold font-mono flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <CryptoIcon symbol={t.symbol} className="w-5 h-5 mr-2 shrink-0" />
                        <span>{t.symbol || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-extrabold uppercase border inline-block ${
                          isLong 
                            ? isDark ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : isDark ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {isLong ? 'Long' : 'Short'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {confCount === 4 ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center space-x-1 ${
                            isDark 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                            <span>⭐⭐⭐⭐</span>
                            <span>A+ (4/4)</span>
                          </span>
                        ) : confCount === 3 ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center space-x-1 ${
                            isDark 
                              ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' 
                              : 'bg-sky-50 border-sky-200 text-sky-700'
                          }`}>
                            <span>⭐⭐⭐</span>
                            <span>B (3/4)</span>
                          </span>
                        ) : (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium font-mono border inline-block ${
                            isDark 
                              ? 'bg-[#111726] border-[#1E2638] text-slate-400' 
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                            {confCount}/4 Setup
                          </span>
                        )}
                      </td>
                      <td className={`py-3 px-3 font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {t.entryPrice !== undefined && t.entryPrice !== null ? formatPrice(t.entryPrice, t.symbol) : '-'}
                      </td>
                      <td className={`py-3 px-3 font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {t.status === 'CLOSED' && t.exitPrice !== undefined && t.exitPrice !== null ? formatPrice(t.exitPrice, t.symbol) : '-'}
                      </td>
                      <td className={`py-3 px-3 font-mono font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <div>
                          <span>{t.quantity !== undefined ? t.quantity : '-'}</span>
                          {t.lots && (
                            <span className={`text-[10px] block font-mono font-normal ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
                              {t.lots} Lots {t.leverage ? `(${t.leverage}x)` : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {t.status === 'CLOSED' ? (
                          <span className={`font-black ${
                            pnlAmount >= 0 
                              ? isDark ? 'text-emerald-400' : 'text-emerald-600' 
                              : isDark ? 'text-rose-400' : 'text-rose-600'
                          }`}>
                            {pnlAmount >= 0 ? '+' : ''}{formatCurrency(pnlAmount, currency)} ({formatPercent(pnlPercent)})
                          </span>
                        ) : (
                          <span className={`font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Open Position</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
                          t.status === 'CLOSED' 
                            ? isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                            : isDark ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}>
                          {t.status || 'CLOSED'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        {t.chartUrl && (
                          <button 
                            onClick={() => onViewTradeChart(t)} 
                            className={`p-1 rounded-lg transition cursor-pointer ${
                              isDark ? 'text-sky-400 hover:bg-sky-500/10' : 'text-sky-600 hover:bg-sky-50'
                            }`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => onEditTrade(t)} 
                          className={`p-1 rounded-lg transition cursor-pointer ${
                            isDark ? 'text-slate-400 hover:text-white hover:bg-[#1E2638]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onDeleteTrade(t.id)} 
                          className={`p-1 rounded-lg transition cursor-pointer ${
                            isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className={`py-12 text-center text-xs space-y-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <Zap className={`w-8 h-8 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <p>No executions matching your search filters</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
