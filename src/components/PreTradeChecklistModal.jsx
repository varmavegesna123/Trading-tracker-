import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Layers,
  ChevronDown,
  Sparkles,
  Check
} from 'lucide-react';
import { CryptoIcon, BINANCE_POPULAR_PAIRS } from '../utils/cryptoIcons';

export function PreTradeChecklistModal({ 
  isOpen, 
  onClose, 
  onProceedToLogTrade,
  darkMode = true
}) {
  const isDark = typeof darkMode === 'boolean' 
    ? darkMode 
    : (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  const [symbol, setSymbol] = useState('');
  const [direction, setDirection] = useState('LONG');
  
  // 4 SMC Confluence Criteria
  const [h1Bias, setH1Bias] = useState(false);
  const [m15Structure, setM15Structure] = useState(false);
  const [m5EntryPoi, setM5EntryPoi] = useState(false);
  const [m1BosChoch, setM1BosChoch] = useState(false);
  const [ltfTrigger, setLtfTrigger] = useState('CHOCH');

  if (!isOpen) return null;

  const totalConfluences = [h1Bias, m15Structure, m5EntryPoi, m1BosChoch].filter(Boolean).length;

  const handleProceed = () => {
    onProceedToLogTrade({
      symbol: symbol.toUpperCase(),
      direction,
      h1Bias,
      m15Structure,
      m5EntryPoi,
      m1BosChoch,
      ltfTrigger
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto font-sans animate-in fade-in duration-200 ${
      isDark ? 'bg-slate-950/80' : 'bg-slate-900/40'
    }`}>
      {/* Modal Box */}
      <div className={`relative border rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden p-6 lg:p-7 space-y-6 ${
        isDark ? 'bg-[#0B0F19]/90 border-[#1E2638] text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Glow ambient background lights */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Header */}
        <div className={`relative z-10 flex items-center justify-between border-b pb-4 ${
          isDark ? 'border-[#1E2638]/80' : 'border-slate-200'
        }`}>
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 shrink-0 ring-1 ring-white/20">
              <Zap className="w-5 h-5 fill-current text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className={`text-lg font-black font-jakarta tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Pre-Trade Confluence
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono border ${
                  isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}>
                  SMC Checklist
                </span>
              </div>
              <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Verify multi-timeframe rules before executing live position
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
              isDark 
                ? 'bg-[#111726]/80 border-[#1E2638] text-slate-400 hover:text-white hover:bg-[#1E2638]' 
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs Row */}
        <div className="relative z-10 space-y-3">
          <div className={`flex items-center justify-between text-[10px] font-mono font-bold ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <span>QUICK CRYPTO & ASSETS</span>
            <span className={isDark ? 'text-sky-400' : 'text-sky-600'}>Active Pairs</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1 custom-scrollbar">
            {BINANCE_POPULAR_PAIRS.slice(0, 8).map(item => (
              <button
                key={item.symbol}
                type="button"
                onClick={() => setSymbol(item.symbol)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition flex items-center space-x-1 border cursor-pointer ${
                  symbol === item.symbol
                    ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                    : isDark 
                      ? 'bg-[#111726]/80 text-slate-300 border-[#1E2638] hover:border-sky-500/40' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-slate-100'
                }`}
              >
                <CryptoIcon symbol={item.coin} className="w-3.5 h-3.5" />
                <span>{item.symbol}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={`block text-[11px] font-extrabold uppercase tracking-wider font-mono ${
                isDark ? 'text-sky-400' : 'text-sky-600'
              }`}>
                Instrument / Ticker
              </label>
              <div className={`relative flex items-center rounded-xl border px-3 py-1 transition ${
                isDark 
                  ? 'bg-[#111726]/90 border-[#1E2638] focus-within:border-sky-500' 
                  : 'bg-white border-slate-200 focus-within:border-sky-500 hover:border-slate-300'
              }`}>
                <CryptoIcon symbol={symbol || 'BTC'} className="w-4 h-4 mr-2 shrink-0" />
                <input
                  type="text"
                  list="checklist-binance-pairs"
                  placeholder="e.g. BTC/USDT"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className={`w-full bg-transparent text-xs py-1.5 font-bold focus:outline-none uppercase font-mono ${
                    isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'
                  }`}
                />
                <datalist id="checklist-binance-pairs">
                  {BINANCE_POPULAR_PAIRS.map(p => (
                    <option key={p.symbol} value={p.symbol}>{`${p.name} (${p.coin})`}</option>
                  ))}
                </datalist>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={`block text-[11px] font-extrabold uppercase tracking-wider font-mono ${
                isDark ? 'text-sky-400' : 'text-sky-600'
              }`}>
                Order Direction
              </label>
              <div className={`p-1 rounded-xl border grid grid-cols-2 gap-1.5 ${
                isDark ? 'bg-[#111726]/90 border-[#1E2638]' : 'bg-slate-50 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`py-2 text-xs font-black rounded-lg transition-all duration-200 tracking-wide uppercase cursor-pointer ${
                    direction === 'LONG'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-1 ring-emerald-400/30'
                      : isDark ? 'text-slate-400 hover:text-white hover:bg-[#1E2638]/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Long
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`py-2 text-xs font-black rounded-lg transition-all duration-200 tracking-wide uppercase cursor-pointer ${
                    direction === 'SHORT'
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-500/25 ring-1 ring-rose-400/30'
                      : isDark ? 'text-slate-400 hover:text-white hover:bg-[#1E2638]/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Short
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Timeframe Confluence Criteria List */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider font-mono ${
              isDark ? 'text-sky-400' : 'text-sky-600'
            }`}>
              CONFLUENCE CRITERIA ({totalConfluences}/4)
            </span>
            <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Click items to toggle verification
            </span>
          </div>

          <div className="space-y-2.5">
            
            {/* 1. 1H Bias */}
            <div 
              onClick={() => setH1Bias(!h1Bias)}
              className={`p-3.5 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-200 select-none border ${
                h1Bias 
                  ? isDark 
                    ? 'border-emerald-500/70 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                    : 'border-emerald-400 bg-emerald-50/70 shadow-sm'
                  : isDark 
                    ? 'bg-[#0E1320] border-[#1E2638] hover:border-slate-600' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                  h1Bias 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                    : isDark ? 'border-slate-600 bg-[#0B0F19]' : 'border-slate-300 bg-slate-50'
                }`}>
                  {h1Bias && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className={`text-xs font-bold font-jakarta ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    1. 1H Higher Timeframe Bias
                  </h4>
                  <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    HTF trend & overall market orderflow aligned
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                isDark ? 'bg-[#0B0F19]/80 text-sky-400 border-[#1E2638]' : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}>
                1H
              </span>
            </div>

            {/* 2. 15m Market Structure */}
            <div 
              onClick={() => setM15Structure(!m15Structure)}
              className={`p-3.5 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-200 select-none border ${
                m15Structure 
                  ? isDark 
                    ? 'border-emerald-500/70 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                    : 'border-emerald-400 bg-emerald-50/70 shadow-sm'
                  : isDark 
                    ? 'bg-[#0E1320] border-[#1E2638] hover:border-slate-600' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                  m15Structure 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                    : isDark ? 'border-slate-600 bg-[#0B0F19]' : 'border-slate-300 bg-slate-50'
                }`}>
                  {m15Structure && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className={`text-xs font-bold font-jakarta ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    2. 15Min Market Structure
                  </h4>
                  <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    15m MSS, Liquidity Sweep, FVG, or Orderblock
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                isDark ? 'bg-[#0B0F19]/80 text-sky-400 border-[#1E2638]' : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}>
                15m
              </span>
            </div>

            {/* 3. 5m Entry POI Zone */}
            <div 
              onClick={() => setM5EntryPoi(!m5EntryPoi)}
              className={`p-3.5 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-200 select-none border ${
                m5EntryPoi 
                  ? isDark 
                    ? 'border-emerald-500/70 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                    : 'border-emerald-400 bg-emerald-50/70 shadow-sm'
                  : isDark 
                    ? 'bg-[#0E1320] border-[#1E2638] hover:border-slate-600' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                  m5EntryPoi 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                    : isDark ? 'border-slate-600 bg-[#0B0F19]' : 'border-slate-300 bg-slate-50'
                }`}>
                  {m5EntryPoi && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className={`text-xs font-bold font-jakarta ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    3. 5Min Entry POI Zone
                  </h4>
                  <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Price reached refined 5m Point of Interest / Breaker
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                isDark ? 'bg-[#0B0F19]/80 text-sky-400 border-[#1E2638]' : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}>
                5m
              </span>
            </div>

            {/* 4. 1m LTF Confirmation */}
            <div 
              className={`p-3.5 rounded-2xl flex items-center justify-between transition-all duration-200 border ${
                m1BosChoch 
                  ? isDark 
                    ? 'border-emerald-500/70 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                    : 'border-emerald-400 bg-emerald-50/70 shadow-sm'
                  : isDark 
                    ? 'bg-[#0E1320] border-[#1E2638] hover:border-slate-600' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div 
                onClick={() => setM1BosChoch(!m1BosChoch)}
                className="flex items-center space-x-3.5 cursor-pointer flex-1 select-none"
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                  m1BosChoch 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                    : isDark ? 'border-slate-600 bg-[#0B0F19]' : 'border-slate-300 bg-slate-50'
                }`}>
                  {m1BosChoch && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className={`text-xs font-bold font-jakarta ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    4. 1Min LTF Confirmation
                  </h4>
                  <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    LTF structural shift or trigger confirmation
                  </p>
                </div>
              </div>

              <select
                value={ltfTrigger}
                onChange={(e) => setLtfTrigger(e.target.value)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border font-mono cursor-pointer transition-colors ${
                  isDark ? 'bg-[#0B0F19] text-sky-400 border-[#1E2638]' : 'bg-slate-50 text-sky-700 border-slate-200'
                }`}
              >
                <option value="CHOCH">CHoCH</option>
                <option value="BOS">BOS</option>
                <option value="SWEEP">Sweep</option>
              </select>
            </div>

          </div>
        </div>

        {/* Dynamic Setup Confluence Rating Banner */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${
          totalConfluences === 4
            ? isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
            : totalConfluences === 3
            ? isDark ? 'bg-sky-500/10 border-sky-500/30' : 'bg-sky-50 border-sky-200'
            : isDark ? 'bg-rose-500/10 border-rose-500/30' : 'bg-rose-50 border-rose-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${
                  totalConfluences === 4 ? 'text-emerald-500' : totalConfluences === 3 ? 'text-sky-500' : 'text-rose-500'
                }`} />
                <span className={`text-[10px] font-extrabold uppercase tracking-wider font-mono ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  SETUP CONFLUENCE RATING
                </span>
              </div>
              <h4 className={`text-sm font-black font-jakarta tracking-tight ${
                totalConfluences === 4 
                  ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                  : totalConfluences === 3 
                  ? isDark ? 'text-sky-400' : 'text-sky-700'
                  : isDark ? 'text-rose-400' : 'text-rose-700'
              }`}>
                {totalConfluences === 4
                  ? 'A+ High-Probability Setup'
                  : totalConfluences === 3
                  ? 'B Setup (Valid Confluence)'
                  : 'Low Confluence Setup (0-2/4)'}
              </h4>
            </div>

            <div className="text-right font-mono">
              <span className={`text-2xl font-black block tracking-tight ${
                totalConfluences === 4 
                  ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                  : totalConfluences === 3 
                  ? isDark ? 'text-sky-400' : 'text-sky-700'
                  : isDark ? 'text-rose-400' : 'text-rose-700'
              }`}>
                {totalConfluences} <span className={`text-xs font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ 4</span>
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {totalConfluences === 4 ? 'Optimal Entry' : totalConfluences === 3 ? 'Valid Entry' : 'Caution'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`relative z-10 pt-2 flex items-center justify-between border-t ${
          isDark ? 'border-[#1E2638]/80' : 'border-slate-200'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 font-bold text-xs rounded-xl border transition-all duration-200 cursor-pointer ${
              isDark 
                ? 'bg-[#111726]/80 hover:bg-[#1E2638] text-slate-400 hover:text-white border-[#1E2638]' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleProceed}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:from-sky-600 hover:to-sky-800 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 transition-all duration-200 flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <span>Proceed & Log Trade</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
