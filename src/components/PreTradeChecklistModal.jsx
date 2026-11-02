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
  onProceedToLogTrade 
}) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto font-sans animate-in fade-in duration-200">
      {/* Modal Box */}
      <div className="relative bg-[#0B0F19]/90 border border-[#1E2638] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden backdrop-blur-2xl text-slate-100 p-6 lg:p-7 space-y-6">
        
        {/* Glow ambient background lights */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-[#1E2638]/80 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#38BDF8] via-[#0284C7] to-[#0369A1] flex items-center justify-center text-white shadow-lg shadow-sky-500/25 shrink-0 ring-1 ring-white/20">
              <Zap className="w-5 h-5 fill-current text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white font-jakarta tracking-tight">
                  Pre-Trade Confluence
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-[#38BDF8] text-[10px] font-extrabold uppercase font-mono border border-sky-500/20">
                  SMC Checklist
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Verify multi-timeframe rules before executing live position
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#111726]/80 border border-[#1E2638] text-slate-400 hover:text-white hover:bg-[#1E2638] hover:border-slate-600 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs Row */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
            <span>QUICK BINANCE CRYPTO</span>
            <span className="text-[#38BDF8]">Spot Markets</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1">
            {BINANCE_POPULAR_PAIRS.slice(0, 8).map(item => (
              <button
                key={item.symbol}
                type="button"
                onClick={() => setSymbol(item.symbol)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition flex items-center space-x-1 border cursor-pointer ${
                  symbol === item.symbol
                    ? 'bg-[#38BDF8] text-white border-[#38BDF8] shadow-sm'
                    : 'bg-[#111726]/80 text-slate-300 border-[#1E2638] hover:border-[#38BDF8]/40'
                }`}
              >
                <CryptoIcon symbol={item.coin} className="w-3.5 h-3.5" />
                <span>{item.symbol}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8] font-mono">
                Instrument / Ticker
              </label>
              <div className="relative flex items-center bg-[#111726]/90 rounded-xl border border-[#1E2638] px-3 py-1 focus-within:border-[#38BDF8]">
                <CryptoIcon symbol={symbol || 'BTC'} className="w-4 h-4 mr-2 shrink-0" />
                <input
                  type="text"
                  list="checklist-binance-pairs"
                  placeholder="e.g. BTC/USDT"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-transparent text-white text-xs py-1.5 font-bold focus:outline-none placeholder:text-slate-600 uppercase font-mono"
                />
                <datalist id="checklist-binance-pairs">
                  {BINANCE_POPULAR_PAIRS.map(p => (
                    <option key={p.symbol} value={p.symbol}>{`${p.name} (${p.coin})`}</option>
                  ))}
                </datalist>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8] font-mono">
                Order Direction
              </label>
              <div className="p-1 bg-[#111726]/90 rounded-xl border border-[#1E2638] grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`py-2 text-xs font-black rounded-lg transition-all duration-200 tracking-wide uppercase ${
                    direction === 'LONG'
                      ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-[#1E2638]/50'
                  }`}
                >
                  Long
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`py-2 text-xs font-black rounded-lg transition-all duration-200 tracking-wide uppercase ${
                    direction === 'SHORT'
                      ? 'bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white shadow-lg shadow-rose-500/25 ring-1 ring-rose-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-[#1E2638]/50'
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
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#38BDF8] font-mono">
              CONFLUENCE CRITERIA ({totalConfluences}/4)
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Click items to toggle verification
            </span>
          </div>

          <div className="space-y-2.5">
            
            {/* 1. 1H Bias */}
            <div 
              onClick={() => setH1Bias(!h1Bias)}
              className={`glass-box p-3.5 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-200 select-none ${
                h1Bias 
                  ? 'border-[#10B981]/70 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                  : 'hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                  h1Bias 
                    ? 'bg-[#10B981] border-[#10B981] text-slate-950 shadow-sm shadow-emerald-500/50' 
                    : 'border-slate-600 bg-[#0B0F19]'
                }`}>
                  {h1Bias && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-jakarta">1. 1H Higher Timeframe Bias</h4>
                  <p className="text-[11px] text-slate-400 font-medium">HTF trend & overall market orderflow aligned</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#0B0F19]/80 text-[#38BDF8] text-[10px] font-mono font-bold border border-[#1E2638]">
                1H
              </span>
            </div>

            {/* 2. 15m Market Structure */}
            <div 
              onClick={() => setM15Structure(!m15Structure)}
              className={`glass-box p-3.5 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-200 select-none ${
                m15Structure 
                  ? 'border-[#10B981]/70 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                  : 'hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                  m15Structure 
                    ? 'bg-[#10B981] border-[#10B981] text-slate-950 shadow-sm shadow-emerald-500/50' 
                    : 'border-slate-600 bg-[#0B0F19]'
                }`}>
                  {m15Structure && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-jakarta">2. 15Min Market Structure</h4>
                  <p className="text-[11px] text-slate-400 font-medium">15m MSS, Liquidity Sweep, FVG, or Orderblock</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#0B0F19]/80 text-[#38BDF8] text-[10px] font-mono font-bold border border-[#1E2638]">
                15m
              </span>
            </div>

            {/* 3. 5m Entry POI Zone */}
            <div 
              onClick={() => setM5EntryPoi(!m5EntryPoi)}
              className={`glass-box p-3.5 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-200 select-none ${
                m5EntryPoi 
                  ? 'border-[#10B981]/70 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                  : 'hover:border-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                  m5EntryPoi 
                    ? 'bg-[#10B981] border-[#10B981] text-slate-950 shadow-sm shadow-emerald-500/50' 
                    : 'border-slate-600 bg-[#0B0F19]'
                }`}>
                  {m5EntryPoi && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-jakarta">3. 5Min Entry POI Zone</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Price reached refined 5m Point of Interest / Breaker</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#0B0F19]/80 text-[#38BDF8] text-[10px] font-mono font-bold border border-[#1E2638]">
                5m
              </span>
            </div>

            {/* 4. 1m LTF Confirmation */}
            <div 
              className={`glass-box p-3.5 rounded-2xl flex items-center justify-between transition-all duration-200 ${
                m1BosChoch 
                  ? 'border-[#10B981]/70 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                  : 'hover:border-slate-600'
              }`}
            >
              <div 
                onClick={() => setM1BosChoch(!m1BosChoch)}
                className="flex items-center space-x-3.5 cursor-pointer flex-1 select-none"
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                  m1BosChoch 
                    ? 'bg-[#10B981] border-[#10B981] text-slate-950 shadow-sm shadow-emerald-500/50' 
                    : 'border-slate-600 bg-[#0B0F19]'
                }`}>
                  {m1BosChoch && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-jakarta">4. 1Min LTF Confirmation</h4>
                  <p className="text-[11px] text-slate-400 font-medium">LTF structural shift or trigger confirmation</p>
                </div>
              </div>

              <select
                value={ltfTrigger}
                onChange={(e) => setLtfTrigger(e.target.value)}
                className="px-2.5 py-1 bg-[#0B0F19] text-[#38BDF8] text-xs font-bold rounded-lg border border-[#1E2638] focus:outline-none focus:border-[#38BDF8] font-mono cursor-pointer transition-colors"
              >
                <option value="CHOCH">CHoCH</option>
                <option value="BOS">BOS</option>
                <option value="SWEEP">Sweep</option>
              </select>
            </div>

          </div>
        </div>

        {/* Dynamic Setup Confluence Rating Banner */}
        <div className={`p-4 rounded-2xl transition-all duration-300 ${
          totalConfluences === 4
            ? 'glass-box-emerald'
            : totalConfluences === 3
            ? 'glass-box'
            : 'glass-box-rose'
        }`}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${
                  totalConfluences === 4 ? 'text-[#10B981]' : totalConfluences === 3 ? 'text-[#38BDF8]' : 'text-rose-400'
                }`} />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono">
                  SETUP CONFLUENCE RATING
                </span>
              </div>
              <h4 className={`text-sm font-black font-jakarta tracking-tight ${
                totalConfluences === 4 
                  ? 'text-[#10B981]' 
                  : totalConfluences === 3 
                  ? 'text-[#38BDF8]' 
                  : 'text-rose-400'
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
                  ? 'text-[#10B981]' 
                  : totalConfluences === 3 
                  ? 'text-[#38BDF8]' 
                  : 'text-rose-400'
              }`}>
                {totalConfluences} <span className="text-xs text-slate-500 font-normal">/ 4</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {totalConfluences === 4 ? 'Optimal Entry' : totalConfluences === 3 ? 'Valid Entry' : 'Caution'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="relative z-10 pt-2 flex items-center justify-between border-t border-[#1E2638]/80">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#111726]/80 hover:bg-[#1E2638] text-slate-400 hover:text-white font-bold text-xs rounded-xl border border-[#1E2638] transition-all duration-200"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleProceed}
            className="px-6 py-2.5 bg-gradient-to-r from-[#38BDF8] via-[#0284C7] to-[#0369A1] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 transition-all duration-200 flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <span>Proceed & Log Trade</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
