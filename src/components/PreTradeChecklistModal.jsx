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
  Check,
  TrendingUp,
  AlertTriangle,
  Compass,
  Info,
  BookOpen
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
  const [showPlaybook, setShowPlaybook] = useState(false);

  // 4 Core Strategy Confluences based on ICT London/NY Session Model
  // 1. London / NY Session High & Low Sweep
  const [londonSweep, setLondonSweep] = useState(false);
  const [sweepSession, setSweepSession] = useState('LONDON'); // 'LONDON' | 'NEW_YORK' | 'BOTH'

  // 2. NY Impulsive Move & Trend Displacement
  const [nyImpulse, setNyImpulse] = useState(false);

  // 3. 50% - 61.8% Fib Zone & POI Retracement (No Break Rule)
  const [fibPoiZone, setFibPoiZone] = useState(false);

  // 4. Rejection Candle Confirmation at POI / Fib
  const [rejectionCandle, setRejectionCandle] = useState(false);
  const [triggerType, setTriggerType] = useState('PIN_BAR'); // 'PIN_BAR' | 'CHOCH' | 'ENGULFING' | 'SWEEP_REJECTION'

  if (!isOpen) return null;

  const totalConfluences = [londonSweep, nyImpulse, fibPoiZone, rejectionCandle].filter(Boolean).length;

  const handleProceed = () => {
    onProceedToLogTrade({
      symbol: (symbol || 'BTC/USDT').toUpperCase(),
      direction,
      // Strategy Fields
      londonSweep,
      nyImpulse,
      fibPoiZone,
      rejectionCandle,
      sweepSession,
      triggerType,
      strategyModel: 'London / NY Sweep & 50-61.8% Fib POI',
      // Backward compatibility aliases for existing logs & analytics
      h1Bias: londonSweep,
      m15Structure: nyImpulse,
      m5EntryPoi: fibPoiZone,
      m1BosChoch: rejectionCandle,
      ltfTrigger: triggerType
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md overflow-y-auto font-sans animate-in fade-in duration-200 ${
      isDark ? 'bg-slate-950/80' : 'bg-slate-900/40'
    }`}>
      {/* Modal Box */}
      <div className={`relative border rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden p-5 sm:p-7 space-y-5 my-auto ${
        isDark ? 'bg-[#0B0F19]/95 border-[#1E2638] text-slate-100 shadow-sky-950/20' : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/60'
      }`}>
        
        {/* Glow ambient background lights */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-24 -mb-24" />

        {/* Header */}
        <div className={`relative z-10 flex items-start justify-between border-b pb-4 ${
          isDark ? 'border-[#1E2638]/80' : 'border-slate-200'
        }`}>
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 shrink-0 ring-1 ring-white/20">
              <Zap className="w-5 h-5 fill-current text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className={`text-lg font-black font-jakarta tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Pre-Trade Confluence
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono border ${
                  isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-50 text-sky-700 border-sky-200'
                }`}>
                  ICT Session Model
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                  isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  Discipline First
                </span>
              </div>
              <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                London & NY Session Sweep • 50%–61.8% Fib Zone • POI Rejection
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowPlaybook(!showPlaybook)}
              title="Toggle Strategy Playbook Rules"
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1 transition cursor-pointer ${
                showPlaybook 
                  ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                  : isDark 
                    ? 'bg-[#111726]/80 border-[#1E2638] text-slate-400 hover:text-white hover:bg-[#1E2638]' 
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Rules</span>
            </button>
            <button
              type="button"
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
        </div>

        {/* Collapsible Strategy Playbook Summary */}
        {showPlaybook && (
          <div className={`p-3.5 rounded-2xl border text-xs space-y-2 animate-in slide-in-from-top-2 duration-200 ${
            isDark ? 'bg-[#0D1322] border-sky-500/30 text-slate-300' : 'bg-sky-50/70 border-sky-200 text-slate-700'
          }`}>
            <div className="flex items-center justify-between font-bold text-sky-500 text-[11px] uppercase tracking-wider font-mono">
              <span className="flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Strategy Execution Playbook</span>
              </span>
              <span className="text-[10px] lowercase font-normal opacity-80">ICT / Session Rules</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
              <li><strong className={isDark ? 'text-white' : 'text-slate-900'}>London Session Sweep:</strong> Wait for London close. Mark London High & Low. Look for a sweep of the level.</li>
              <li><strong className={isDark ? 'text-white' : 'text-slate-900'}>NY Impulsive Move:</strong> Or wait for NY session impulsive move. Mark swing low to high or high to low.</li>
              <li><strong className={isDark ? 'text-white' : 'text-slate-900'}>Fib & POI Retracement:</strong> Draw Fib & POI. Wait for price to reach 50%–61.8% Fib zone or POI. <span className="text-rose-500 font-bold">If price breaks Fib area, DO NOT ENTER!</span></li>
              <li><strong className={isDark ? 'text-white' : 'text-slate-900'}>Rejection Candle:</strong> Confirm pin bar / wick rejection at POI before pulling the trigger. (Also look for NY Session High/Low sweep itself).</li>
            </ol>
          </div>
        )}

        {/* Strategy Flow Pipeline Strip */}
        <div className={`p-2.5 rounded-2xl border flex items-center justify-between text-[10px] font-mono font-bold overflow-x-auto ${
          isDark ? 'bg-[#0E1322]/80 border-[#1E2638]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`flex items-center space-x-1.5 transition ${londonSweep ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
              londonSweep ? 'bg-emerald-500 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}>1</span>
            <span>Session Sweep</span>
          </div>
          <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>➔</span>

          <div className={`flex items-center space-x-1.5 transition ${nyImpulse ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
              nyImpulse ? 'bg-emerald-500 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}>2</span>
            <span>NY Impulse</span>
          </div>
          <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>➔</span>

          <div className={`flex items-center space-x-1.5 transition ${fibPoiZone ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
              fibPoiZone ? 'bg-emerald-500 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}>3</span>
            <span>Fib 50-61.8%</span>
          </div>
          <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>➔</span>

          <div className={`flex items-center space-x-1.5 transition ${rejectionCandle ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
              rejectionCandle ? 'bg-emerald-500 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
            }`}>4</span>
            <span>Rejection Entry</span>
          </div>
        </div>

        {/* Inputs Row */}
        <div className="relative z-10 space-y-3">
          <div className={`flex items-center justify-between text-[10px] font-mono font-bold ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <span>QUICK ASSETS</span>
            <span className={isDark ? 'text-sky-400' : 'text-sky-600'}>Select Pair</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1 custom-scrollbar">
            {BINANCE_POPULAR_PAIRS.slice(0, 8).map(item => (
              <button
                key={item.symbol}
                type="button"
                onClick={() => setSymbol(item.symbol)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
                  symbol === item.symbol
                    ? 'bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-500/20'
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                  placeholder="e.g. BTC/USDT or XAUUSD"
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
                  Long / Buy
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
                  Short / Sell
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Timeframe Confluence Criteria List */}
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-extrabold uppercase tracking-wider font-mono ${
              isDark ? 'text-sky-400' : 'text-sky-600'
            }`}>
              CONFLUENCE CRITERIA ({totalConfluences}/4)
            </span>
            <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Click items to verify rule fulfillment
            </span>
          </div>

          <div className="space-y-2.5">
            
            {/* 1. London / NY Session Liquidity Sweep */}
            <div 
              className={`p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all duration-200 border ${
                londonSweep 
                  ? isDark 
                    ? 'border-emerald-500/70 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                    : 'border-emerald-400 bg-emerald-50/70 shadow-sm'
                  : isDark 
                    ? 'bg-[#0E1320] border-[#1E2638] hover:border-slate-600' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div 
                onClick={() => setLondonSweep(!londonSweep)}
                className="flex items-start sm:items-center space-x-3.5 cursor-pointer flex-1 select-none"
              >
                <div className={`w-5 h-5 mt-0.5 sm:mt-0 rounded-lg flex items-center justify-center border shrink-0 transition-all duration-200 ${
                  londonSweep 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                    : isDark ? 'border-slate-600 bg-[#0B0F19]' : 'border-slate-300 bg-slate-50'
                }`}>
                  {londonSweep && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className={`text-xs font-bold font-jakarta ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      1. London / NY Session Liquidity Sweep
                    </h4>
                  </div>
                  <p className={`text-[11px] font-medium leading-tight mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    London closed, session High/Low marked & price swept the level for liquidity
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                <select
                  value={sweepSession}
                  onChange={(e) => setSweepSession(e.target.value)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border font-mono cursor-pointer transition ${
                    isDark 
                      ? 'bg-[#0B0F19] text-sky-400 border-[#1E2638] hover:border-sky-500/40' 
                      : 'bg-slate-50 text-sky-700 border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <option value="LONDON">London Sweep</option>
                  <option value="NEW_YORK">NY Sweep</option>
                  <option value="BOTH">London + NY Sweep</option>
                </select>
              </div>
            </div>

            {/* 2. New York Impulsive Move (Displacement) */}
            <div 
              onClick={() => setNyImpulse(!nyImpulse)}
              className={`p-3.5 rounded-2xl cursor-pointer flex items-center justify-between transition-all duration-200 select-none border ${
                nyImpulse 
                  ? isDark 
                    ? 'border-emerald-500/70 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                    : 'border-emerald-400 bg-emerald-50/70 shadow-sm'
                  : isDark 
                    ? 'bg-[#0E1320] border-[#1E2638] hover:border-slate-600' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className={`w-5 h-5 mt-0.5 sm:mt-0 rounded-lg flex items-center justify-center border shrink-0 transition-all duration-200 ${
                  nyImpulse 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                    : isDark ? 'border-slate-600 bg-[#0B0F19]' : 'border-slate-300 bg-slate-50'
                }`}>
                  {nyImpulse && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className={`text-xs font-bold font-jakarta ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    2. New York Impulsive Move (Displacement)
                  </h4>
                  <p className={`text-[11px] font-medium leading-tight mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Strong directional impulse in NY session. Swing High & Swing Low cleanly marked
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${
                isDark ? 'bg-[#0B0F19]/80 text-sky-400 border-[#1E2638]' : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}>
                NY Impulse
              </span>
            </div>

            {/* 3. 50% - 61.8% Golden Fib Zone & POI Retracement */}
            <div 
              onClick={() => setFibPoiZone(!fibPoiZone)}
              className={`p-3.5 rounded-2xl cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all duration-200 select-none border ${
                fibPoiZone 
                  ? isDark 
                    ? 'border-emerald-500/70 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                    : 'border-emerald-400 bg-emerald-50/70 shadow-sm'
                  : isDark 
                    ? 'bg-[#0E1320] border-[#1E2638] hover:border-slate-600' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start sm:items-center space-x-3.5 flex-1">
                <div className={`w-5 h-5 mt-0.5 sm:mt-0 rounded-lg flex items-center justify-center border shrink-0 transition-all duration-200 ${
                  fibPoiZone 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                    : isDark ? 'border-slate-600 bg-[#0B0F19]' : 'border-slate-300 bg-slate-50'
                }`}>
                  {fibPoiZone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className={`text-xs font-bold font-jakarta ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      3. Golden Fib (50% – 61.8%) & POI Zone
                    </h4>
                  </div>
                  <p className={`text-[11px] font-medium leading-tight mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Price in 50%–61.8% Fib zone or POI. <span className="text-amber-500 font-semibold">Strict rule: If Fib broke, DO NOT enter!</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  Fib 50–61.8% / POI
                </span>
              </div>
            </div>

            {/* 4. Rejection Candle Confirmation */}
            <div 
              className={`p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all duration-200 border ${
                rejectionCandle 
                  ? isDark 
                    ? 'border-emerald-500/70 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' 
                    : 'border-emerald-400 bg-emerald-50/70 shadow-sm'
                  : isDark 
                    ? 'bg-[#0E1320] border-[#1E2638] hover:border-slate-600' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div 
                onClick={() => setRejectionCandle(!rejectionCandle)}
                className="flex items-start sm:items-center space-x-3.5 cursor-pointer flex-1 select-none"
              >
                <div className={`w-5 h-5 mt-0.5 sm:mt-0 rounded-lg flex items-center justify-center border shrink-0 transition-all duration-200 ${
                  rejectionCandle 
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                    : isDark ? 'border-slate-600 bg-[#0B0F19]' : 'border-slate-300 bg-slate-50'
                }`}>
                  {rejectionCandle && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <h4 className={`text-xs font-bold font-jakarta ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    4. Rejection Candle Confirmation at Zone
                  </h4>
                  <p className={`text-[11px] font-medium leading-tight mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Confirmed pin bar, rejection wick, or shift before executing live trade
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border font-mono cursor-pointer transition-colors ${
                    isDark ? 'bg-[#0B0F19] text-sky-400 border-[#1E2638]' : 'bg-slate-50 text-sky-700 border-slate-200'
                  }`}
                >
                  <option value="PIN_BAR">Pin Bar / Rejection Wick</option>
                  <option value="CHOCH">CHoCH Structure Shift</option>
                  <option value="ENGULFING">Engulfing Candle</option>
                  <option value="SWEEP_REJECTION">Sweep Rejection</option>
                </select>
              </div>
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
                  ? 'A+ Institutional Setup (4/4)'
                  : totalConfluences === 3
                  ? 'B Setup (Valid Confluence 3/4)'
                  : 'Low Confluence Setup (0–2/4)'}
              </h4>
              <p className={`text-[11px] font-medium ${
                totalConfluences === 4
                  ? isDark ? 'text-emerald-400/80' : 'text-emerald-600'
                  : totalConfluences === 3
                  ? isDark ? 'text-sky-400/80' : 'text-sky-600'
                  : isDark ? 'text-rose-400/80' : 'text-rose-600'
              }`}>
                {totalConfluences === 4
                  ? 'Optimal conditions: Session sweep, NY impulse, Fib/POI & rejection verified.'
                  : totalConfluences === 3
                  ? 'Valid setup. Trade with standard risk and tight stop loss management.'
                  : 'Caution: Missing key session sweep, Fib 50-61.8%, or rejection. Wait for setup!'}
              </p>
            </div>

            <div className="text-right font-mono shrink-0 pl-3">
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
            className="px-6 py-2.5 bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 transition-all duration-200 flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <span>Proceed & Log Trade</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
