import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info,
  FileText,
  Check,
  CheckCircle2,
  Upload,
  Search,
  Sparkles,
  Zap,
  Sliders
} from 'lucide-react';
import { CryptoIcon, BINANCE_POPULAR_PAIRS, getAssetTicker } from '../utils/cryptoIcons';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';
import { USD_TO_INR_RATE } from '../utils/currency';

export function getRecommendedContractSize(symbolStr) {
  const upper = String(symbolStr || '').toUpperCase().trim();
  if (upper.includes('BTC')) return '0.001';
  if (upper.includes('ETH')) return '0.01';
  if (upper.includes('SOL')) return '0.1';
  // Delta Exchange XAUUSD specification: 1 Lot = 0.001 XAU
  if (upper.includes('XAU') || upper.includes('GOLD') || upper.includes('PAXG')) return '0.001';
  if (upper.includes('AVAX')) return '0.1';
  if (upper.includes('ALV')) return '100';
  if (upper.includes('ALGO')) return '10';
  if (upper.includes('BNB')) return '0.01';
  if (upper.includes('XRP')) return '10';
  if (upper.includes('ADA')) return '10';
  if (upper.includes('DOGE')) return '100';
  if (upper.includes('PEPE') || upper.includes('SHIB')) return '1000';
  return '0.001';
}

function formatVal(val, currency = 'INR') {
  return formatCurrency(val, currency, 'INR', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  });
}

function formatShortDate(dateStr) {
  if (!dateStr) return '04 Nov 2026';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function CustomGlassDateTimePicker({ value, onChange, onClose, isDark = true }) {
  const dateObj = useMemo(() => {
    if (!value) return new Date();
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [value]);

  const [viewDate, setViewDate] = useState(() => dateObj);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push({ dayNum: null, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const fullDate = `${currentYear}-${monthStr}-${dayStr}`;
    calendarDays.push({ dayNum: d, isCurrentMonth: true, fullDate });
  }

  const selectedDateStr = value ? value.slice(0, 10) : '';
  const selectedHourStr = value && value.includes('T') ? value.split('T')[1].slice(0, 2) : '10';
  const selectedMinStr = value && value.includes('T') ? value.split('T')[1].slice(3, 5) : '00';

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleSelectDay = (fullDate) => {
    if (!fullDate) return;
    const timePart = value && value.includes('T') ? value.split('T')[1] : '10:00';
    onChange(`${fullDate}T${timePart}`);
  };

  const handleTimeChange = (h, m) => {
    const safeH = String(Math.min(Math.max(parseInt(h) || 0, 0), 23)).padStart(2, '0');
    const safeM = String(Math.min(Math.max(parseInt(m) || 0, 0), 59)).padStart(2, '0');
    const datePart = value ? value.slice(0, 10) : todayStr;
    onChange(`${datePart}T${safeH}:${safeM}`);
  };

  return (
    <div className={`absolute left-0 sm:right-0 sm:left-auto top-full mt-2 z-50 p-4 rounded-2xl border shadow-2xl space-y-3 w-72 font-sans ${
      isDark ? 'bg-[#0B0F19] border-[#1E2638] text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      <div className={`flex items-center justify-between text-xs font-bold font-jakarta pb-2 border-b ${
        isDark ? 'border-[#1E2638] text-white' : 'border-slate-200 text-slate-900'
      }`}>
        <button
          type="button"
          onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))}
          className={`p-1 rounded-lg transition cursor-pointer ${
            isDark ? 'hover:bg-[#1E2638] text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className={`font-mono font-bold ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>{monthLabel}</span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))}
          className={`p-1 rounded-lg transition cursor-pointer ${
            isDark ? 'hover:bg-[#1E2638] text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className={`grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase font-mono ${
        isDark ? 'text-slate-500' : 'text-slate-400'
      }`}>
        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-mono">
        {calendarDays.map((cell, idx) => {
          if (!cell.isCurrentMonth) {
            return <div key={idx} className="h-7 text-transparent" />;
          }
          const isSelected = selectedDateStr === cell.fullDate;
          const isToday = todayStr === cell.fullDate;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectDay(cell.fullDate)}
              className={`h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition cursor-pointer ${
                isSelected
                  ? 'bg-sky-500 text-white font-extrabold shadow-sm'
                  : isToday
                  ? isDark ? 'bg-[#1E2638] text-sky-400 font-bold border border-sky-500/40' : 'bg-sky-50 text-sky-600 font-bold border border-sky-300'
                  : isDark ? 'bg-[#111726] text-slate-300 hover:bg-[#1E2638]' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cell.dayNum}
            </button>
          );
        })}
      </div>

      <div className={`pt-2 border-t flex items-center justify-between text-xs font-mono ${
        isDark ? 'border-[#1E2638]' : 'border-slate-200'
      }`}>
        <div className="flex items-center space-x-1.5">
          <span className={`text-[10px] font-medium uppercase font-jakarta ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Time:</span>
          <input
            type="text"
            maxLength={2}
            value={selectedHourStr}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 2);
              handleTimeChange(val, selectedMinStr);
            }}
            onBlur={(e) => {
              const num = Math.min(Math.max(parseInt(e.target.value) || 0, 0), 23);
              handleTimeChange(String(num).padStart(2, '0'), selectedMinStr);
            }}
            className={`w-11 py-1 text-center text-xs rounded-lg border font-bold font-mono focus:outline-none focus:border-sky-500 ${
              isDark ? 'bg-[#111726] text-white border-[#1E2638]' : 'bg-slate-50 text-slate-900 border-slate-200'
            }`}
          />
          <span className="text-slate-400 font-bold font-mono">:</span>
          <input
            type="text"
            maxLength={2}
            value={selectedMinStr}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 2);
              handleTimeChange(selectedHourStr, val);
            }}
            onBlur={(e) => {
              const num = Math.min(Math.max(parseInt(e.target.value) || 0, 0), 59);
              handleTimeChange(selectedHourStr, String(num).padStart(2, '0'));
            }}
            className={`w-11 py-1 text-center text-xs rounded-lg border font-bold font-mono focus:outline-none focus:border-sky-500 ${
              isDark ? 'bg-[#111726] text-white border-[#1E2638]' : 'bg-slate-50 text-slate-900 border-slate-200'
            }`}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1 bg-sky-500 hover:bg-sky-400 text-white font-bold text-[11px] rounded-lg shadow-sm transition cursor-pointer"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export function LeverageSelector({ 
  value, 
  onChange, 
  isDark, 
  label = "Leverage",
  align = "left" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState(String(value || '25'));
  const containerRef = useRef(null);

  useEffect(() => {
    setCustomInput(String(value || '25'));
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const numVal = parseInt(value, 10) || 25;
  const presets = [1, 2, 5, 10, 20, 25, 50, 75, 100, 125, 200];

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className={`block text-[11px] font-medium mb-1.5 font-jakarta ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl border px-3 h-10 transition select-none cursor-pointer ${
          isOpen
            ? isDark ? 'border-sky-500 ring-2 ring-sky-500/20 bg-[#111726]' : 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50'
            : isDark ? 'bg-[#0E1320] border-[#1E2638] hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center space-x-2 min-w-0">
          <Zap className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className={`font-mono font-black text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {value}x
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
          isOpen ? 'rotate-180 text-sky-400' : (isDark ? 'text-slate-500' : 'text-slate-400')
        }`} />
      </button>

      {/* Custom Popover */}
      {isOpen && (
        <div className={`absolute z-50 top-full mt-1.5 ${
          align === 'right' ? 'right-0' : 'left-0'
        } w-72 rounded-2xl border p-3.5 space-y-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
          isDark ? 'bg-[#0B0F19]/95 border-[#1E2638] text-slate-100 shadow-black/80' : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/80'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between border-b pb-2 ${
            isDark ? 'border-[#1E2638]/70' : 'border-slate-200'
          }`}>
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Select Leverage
            </span>
            <span className="text-base font-black font-mono text-sky-400">
              {value}x
            </span>
          </div>

          {/* Quick Presets Grid */}
          <div className="space-y-1.5">
            <span className={`text-[10px] font-mono font-semibold uppercase ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Quick Multipliers
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {presets.map((p) => {
                const isSelected = String(value) === String(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      onChange(String(p));
                      setCustomInput(String(p));
                    }}
                    className={`py-1.5 text-xs font-mono font-bold rounded-lg transition cursor-pointer border ${
                      isSelected
                        ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/25 ring-1 ring-white/20'
                        : isDark
                          ? 'bg-[#111726] border-[#1E2638] text-slate-300 hover:border-sky-500/40 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-slate-100'
                    }`}
                  >
                    {p}x
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slider & Custom Input */}
          <div className={`space-y-2 pt-1 border-t ${
            isDark ? 'border-[#1E2638]/70' : 'border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-semibold uppercase ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Drag Slider (1x – 100x)
              </span>
              <span className="text-[10px] font-mono font-bold text-sky-400">
                {numVal}x
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="100"
              value={Math.min(numVal, 100)}
              onChange={(e) => {
                onChange(e.target.value);
                setCustomInput(e.target.value);
              }}
              className="w-full accent-sky-500 cursor-pointer h-1.5 rounded-lg"
            />

            {/* Custom Input */}
            <div className="flex items-center space-x-2 pt-1">
              <div className={`relative flex-1 flex items-center rounded-xl border px-2.5 h-8 ${
                isDark ? 'bg-[#111726] border-[#1E2638]' : 'bg-slate-50 border-slate-200'
              }`}>
                <input
                  type="number"
                  min="1"
                  max="200"
                  placeholder="Custom"
                  value={customInput}
                  onChange={(e) => {
                    setCustomInput(e.target.value);
                    const parsed = parseInt(e.target.value, 10);
                    if (!isNaN(parsed) && parsed >= 1 && parsed <= 200) {
                      onChange(String(parsed));
                    }
                  }}
                  className={`w-full bg-transparent font-mono text-xs font-bold focus:outline-none ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                />
                <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  x
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 h-8 bg-sky-500 hover:bg-sky-600 text-white text-xs font-extrabold rounded-xl transition cursor-pointer shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Delta Exchange Footer Hint */}
          <div className={`text-[9px] font-mono leading-tight pt-1 border-t ${
            isDark ? 'border-[#1E2638]/50 text-slate-500' : 'border-slate-100 text-slate-400'
          }`}>
            Delta Exchange supports up to 100x leverage on Gold & 200x on BTC/ETH.
          </div>
        </div>
      )}
    </div>
  );
}

// Crisp official application logos for supported trading exchanges
export function ExchangeLogo({ exchange, className = "w-5 h-5" }) {
  const ex = String(exchange || '').toLowerCase().trim();

  // 1. Delta Exchange (Official India 3D Orange & Green Delta)
  if (ex.includes('delta')) {
    return (
      <span className={`${className} inline-flex items-center justify-center shrink-0 rounded-full bg-[#181A20] border border-[#FF7A00]/25 p-0.5 shadow-xs overflow-hidden select-none`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-[90%] h-[90%]" xmlns="http://www.w3.org/2000/svg">
          {/* Left Orange Shadow Facet */}
          <polygon points="4,12 9.5,8.8 9.5,15.2" fill="#E65800" />
          {/* Top Orange Wing */}
          <polygon points="10.2,4.8 21.2,10.2 13.8,12 10.2,9.2" fill="#FF7A00" />
          {/* Bottom Green Wing */}
          <polygon points="10.2,19.2 21.2,10.2 13.8,12 10.2,14.8" fill="#00C853" />
        </svg>
      </span>
    );
  }

  // 2. Coinbase (Official Coinbase Blue Circle & Rounded Square Emblem)
  if (ex.includes('coinbase')) {
    return (
      <span className={`${className} inline-flex items-center justify-center shrink-0 rounded-full bg-[#0052FF] shadow-xs overflow-hidden select-none`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-[85%] h-[85%]" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="14" height="14" rx="4" fill="#FFFFFF" />
          <rect x="8.5" y="8.5" width="7" height="7" rx="1.8" fill="#0052FF" />
        </svg>
      </span>
    );
  }

  // 3. Binance (Official Binance Yellow Diamond Lattice)
  if (ex.includes('binance')) {
    return (
      <span className={`${className} inline-flex items-center justify-center shrink-0 rounded-full bg-[#181A20] border border-[#F3BA2F]/40 p-0.5 shadow-xs overflow-hidden select-none`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4.5L14.7 7.2L12 9.9L9.3 7.2L12 4.5ZM16.8 9.3L19.5 12L16.8 14.7L14.1 12L16.8 9.3ZM12 14.1L14.7 16.8L12 19.5L9.3 16.8L12 14.1ZM7.2 9.3L9.9 12L7.2 14.7L4.5 12L7.2 9.3ZM12 10.8L13.2 12L12 13.2L10.8 12L12 10.8Z" fill="#F3BA2F" />
        </svg>
      </span>
    );
  }

  // 4. CoinSwitch (Official Rebranded Mint Green 'C' & White Coin)
  if (ex.includes('coinswitch') || ex.includes('switch')) {
    return (
      <span className={`${className} inline-flex items-center justify-center shrink-0 rounded-full bg-[#181A20] border border-[#21CC7B]/30 shadow-xs overflow-hidden select-none`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="11" fill="#181A20" />
          {/* Left Mint Green Crescent / C-Spine */}
          <path 
            d="M 12 4.2 C 7.69 4.2 4.2 7.69 4.2 12 C 4.2 16.31 7.69 19.8 12 19.8 L 12 16.2 C 9.68 16.2 7.8 14.32 7.8 12 C 7.8 9.68 9.68 7.8 12 7.8 Z" 
            fill="#21CC7B" 
          />
          {/* Top Right Dark Teal-Green Quadrant */}
          <path 
            d="M 12 4.2 C 16.31 4.2 19.8 7.69 19.8 12 L 16.2 12 C 16.2 9.68 14.32 7.8 12 7.8 Z" 
            fill="#1C945E" 
          />
          {/* Bottom Right Solid White Coin */}
          <circle cx="15.6" cy="15.6" r="3" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 5. Bybit
  if (ex.includes('bybit')) {
    return (
      <span className={`${className} inline-flex items-center justify-center shrink-0 rounded-full bg-[#121214] border border-[#F7A600]/30 shadow-xs overflow-hidden select-none`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-[85%] h-[85%]" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 6H12.8C14.8 6 16.3 7.3 16.3 9C16.3 10.1 15.6 11 14.6 11.5C15.8 12 16.8 13.1 16.8 14.5C16.8 16.4 15.2 18 13.1 18H7V6ZM10.2 8.5V10.7H12.6C13.2 10.7 13.7 10.2 13.7 9.6C13.7 9 13.2 8.5 12.6 8.5H10.2ZM10.2 13V15.5H12.9C13.6 15.5 14.1 15 14.1 14.3C14.1 13.6 13.6 13 12.9 13H10.2Z" fill="#F7A600" />
        </svg>
      </span>
    );
  }

  // 6. OKX
  if (ex.includes('okx')) {
    return (
      <span className={`${className} inline-flex items-center justify-center shrink-0 rounded-full bg-black border border-white/20 shadow-xs overflow-hidden select-none`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-[80%] h-[80%]" xmlns="http://www.w3.org/2000/svg">
          <rect x="5.5" y="5.5" width="5" height="5" rx="0.5" fill="#FFFFFF" />
          <rect x="13.5" y="5.5" width="5" height="5" rx="0.5" fill="#FFFFFF" />
          <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" fill="#000000" stroke="#FFFFFF" strokeWidth="1" />
          <rect x="5.5" y="13.5" width="5" height="5" rx="0.5" fill="#FFFFFF" />
          <rect x="13.5" y="13.5" width="5" height="5" rx="0.5" fill="#FFFFFF" />
        </svg>
      </span>
    );
  }

  // 7. NSE (India)
  if (ex.includes('nse')) {
    return (
      <span className={`${className} inline-flex items-center justify-center shrink-0 rounded-full bg-[#E65100] shadow-xs overflow-hidden select-none`}>
        <span className="text-[9px] font-black text-white tracking-tighter">NSE</span>
      </span>
    );
  }

  // 8. Forex / Global Currencies
  if (ex.includes('forex') || ex.includes('currency')) {
    return (
      <span className={`${className} inline-flex items-center justify-center shrink-0 rounded-full bg-[#0284C7] shadow-xs overflow-hidden select-none`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-[80%] h-[80%]" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" stroke="#FFFFFF" strokeWidth="1.5" />
          <path d="M3 12H21M12 3C14.5 5.5 16 8.5 16 12C16 15.5 14.5 18.5 12 21C9.5 18.5 8 15.5 8 12C8 8.5 9.5 5.5 12 3Z" stroke="#FFFFFF" strokeWidth="1.2" />
        </svg>
      </span>
    );
  }

  // Fallback generic badge
  return (
    <span className={`${className} inline-flex items-center justify-center shrink-0 rounded-full bg-sky-500/20 text-sky-400 font-bold text-[9px] select-none uppercase`}>
      {String(exchange || 'EX').slice(0, 2)}
    </span>
  );
}

// Supported Platforms with branding & categorization
export const EXCHANGES_LIST = [
  { 
    id: 'Delta Exchange', 
    name: 'Delta Exchange', 
    subtitle: 'Crypto & Gold Derivatives', 
    badge: 'Popular', 
    badgeColor: 'amber' 
  },
  { 
    id: 'Coinbase', 
    name: 'Coinbase', 
    subtitle: 'US & Global Exchange', 
    badge: 'Global', 
    badgeColor: 'blue' 
  },
  { 
    id: 'Binance', 
    name: 'Binance', 
    subtitle: 'Global Crypto & Futures', 
    badge: 'High Vol', 
    badgeColor: 'amber' 
  },
  { 
    id: 'CoinSwitch', 
    name: 'CoinSwitch', 
    subtitle: 'India Crypto Platform', 
    badge: 'INR Direct', 
    badgeColor: 'emerald' 
  },
  { 
    id: 'Bybit', 
    name: 'Bybit', 
    subtitle: 'Perpetuals & Derivatives' 
  },
  { 
    id: 'OKX', 
    name: 'OKX', 
    subtitle: 'Web3 & Derivatives' 
  },
  { 
    id: 'NSE', 
    name: 'NSE (India)', 
    subtitle: 'National Stock Exchange' 
  },
  { 
    id: 'Forex', 
    name: 'Forex', 
    subtitle: 'Currencies & FX Pairs' 
  }
];

// Custom, theme-aware Exchange Selector with application logos and dropdown popover
export function ExchangeSelector({ value, onChange, isDark = true, label = "Exchange" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Current exchange object or fallback
  const currentEx = useMemo(() => {
    const match = EXCHANGES_LIST.find(
      e => e.id.toLowerCase() === String(value || '').toLowerCase() || 
           e.name.toLowerCase() === String(value || '').toLowerCase()
    );
    return match || { id: value || 'Delta Exchange', name: value || 'Delta Exchange', subtitle: 'Trading Exchange' };
  }, [value]);

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className={`block text-[11px] font-medium mb-1.5 font-jakarta ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-10 px-3 rounded-xl border flex items-center justify-between transition cursor-pointer select-none ${
          isDark
            ? isOpen 
              ? 'bg-[#121828] border-sky-500 shadow-sm ring-1 ring-sky-500/20 text-white' 
              : 'bg-[#0E1320] border-[#1E2638] hover:border-slate-700 text-white'
            : isOpen
              ? 'bg-sky-50/50 border-sky-500 shadow-sm ring-1 ring-sky-500/20 text-slate-900'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0 pr-1">
          <ExchangeLogo exchange={currentEx.name} className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold truncate tracking-tight">
            {currentEx.name}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
          isOpen ? 'rotate-180 text-sky-400' : isDark ? 'text-slate-400' : 'text-slate-500'
        }`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className={`absolute left-0 top-full mt-2 w-72 max-w-[90vw] z-50 p-2 rounded-2xl border shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-[#0B0F19]/95 border-[#1E2638] text-white shadow-black/80'
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
        }`}>
          {/* Header */}
          <div className={`px-2.5 py-1.5 flex items-center justify-between border-b mb-1 ${
            isDark ? 'border-[#1E2638]' : 'border-slate-100'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Select Exchange Platform
            </span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
              isDark ? 'bg-sky-500/10 text-sky-400' : 'bg-sky-50 text-sky-600'
            }`}>
              Live
            </span>
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto space-y-1 py-1 custom-scrollbar">
            {EXCHANGES_LIST.map((item) => {
              const isSelected = String(currentEx.id).toLowerCase() === item.id.toLowerCase() ||
                                 String(currentEx.name).toLowerCase() === item.name.toLowerCase();
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer group ${
                    isSelected
                      ? isDark
                        ? 'bg-sky-500/15 text-white border border-sky-500/30'
                        : 'bg-sky-50 text-sky-900 border border-sky-200'
                      : isDark
                        ? 'hover:bg-[#151D2E] text-slate-200'
                        : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <ExchangeLogo exchange={item.name} className="w-6 h-6 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold truncate font-jakarta">
                          {item.name}
                        </span>
                        {item.badge && (
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                            item.badgeColor === 'emerald'
                              ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                              : item.badgeColor === 'amber'
                              ? isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                              : item.badgeColor === 'cyan'
                              ? isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                              : isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] truncate ${
                        isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-600'
                      }`}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className={`w-4 h-4 shrink-0 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function TradeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  tradeToEdit = null, 
  initialConfluences = null,
  currency = 'INR',
  darkMode = true 
}) {
  const currencySymbol = getCurrencySymbol(currency);
  const [step, setStep] = useState(1);

  // Auto-detect dark mode if prop is passed or document html class has 'dark'
  const isDark = typeof darkMode === 'boolean' 
    ? darkMode 
    : (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Form State
  const [direction, setDirection] = useState('LONG');
  const [orderType, setOrderType] = useState('Limit');
  const [status, setStatus] = useState('CLOSED');
  const [tradeType, setTradeType] = useState('Intraday');
  const [market, setMarket] = useState('Crypto');
  const [exchange, setExchange] = useState('Delta Exchange');
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);
  const [symbolSearch, setSymbolSearch] = useState('');
  const [symbolCategory, setSymbolCategory] = useState('ALL');
  const symbolDropdownRef = useRef(null);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 16));
  const [showEntryDatePicker, setShowEntryDatePicker] = useState(false);
  
  // Capital & Leverage State
  const [startingCapital, setStartingCapital] = useState('');
  const [marginUsed, setMarginUsed] = useState('');
  const [leverage, setLeverage] = useState('25');
  const [selectedQuickSize, setSelectedQuickSize] = useState(null);
  const [contractSize, setContractSize] = useState('0.001');
  const [usdtRate, setUsdtRate] = useState(String(USD_TO_INR_RATE));

  // Order Levels & Risk Management State
  const [hasBracketOrder, setHasBracketOrder] = useState(true);
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [orderLots, setOrderLots] = useState('');
  const [targetRiskINR, setTargetRiskINR] = useState('');
  const [manualRealizedPnL, setManualRealizedPnL] = useState('');
  const [tradingFees, setTradingFees] = useState('');
  const [fundingFees, setFundingFees] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isManualQuantity, setIsManualQuantity] = useState(false);

  // Confluences & Details
  const [strategy, setStrategy] = useState('SMC Order Block');
  const [notes, setNotes] = useState('');
  const [chartUrl, setChartUrl] = useState('');
  const [h1Bias, setH1Bias] = useState(false);
  const [m15Structure, setM15Structure] = useState(false);
  const [m5EntryPoi, setM5EntryPoi] = useState(false);
  const [m1BosChoch, setM1BosChoch] = useState(false);
  const [ltfTrigger, setLtfTrigger] = useState('CHOCH');

  useEffect(() => {
    if (tradeToEdit) {
      setTradeType(tradeToEdit.tradeType || 'Intraday');
      setOrderType(tradeToEdit.orderType || 'Limit');
      setDirection(tradeToEdit.direction || 'LONG');
      setMarket(tradeToEdit.market || 'Crypto');
      setExchange(tradeToEdit.exchange || 'Delta Exchange');
      setSymbol(tradeToEdit.symbol || 'BTC/USDT');
      setEntryDate(tradeToEdit.entryDate ? tradeToEdit.entryDate.slice(0, 16) : new Date().toISOString().slice(0, 16));
      setEntryPrice(tradeToEdit.entryPrice !== undefined && tradeToEdit.entryPrice !== null ? String(tradeToEdit.entryPrice) : '');
      setQuantity(tradeToEdit.quantity !== undefined && tradeToEdit.quantity !== null ? String(tradeToEdit.quantity) : '');
      setStatus(tradeToEdit.status || 'CLOSED');
      setExitPrice(tradeToEdit.exitPrice !== undefined && tradeToEdit.exitPrice !== null ? String(tradeToEdit.exitPrice) : '');
      setManualRealizedPnL(tradeToEdit.actualRealizedPnL !== undefined && tradeToEdit.actualRealizedPnL !== null ? String(tradeToEdit.actualRealizedPnL) : '');
      setStopLoss(tradeToEdit.stopLoss !== undefined && tradeToEdit.stopLoss !== null ? String(tradeToEdit.stopLoss) : '');
      setTargetPrice(
        tradeToEdit.targetPrice !== undefined && tradeToEdit.targetPrice !== null ? String(tradeToEdit.targetPrice) :
        tradeToEdit.takeProfit !== undefined && tradeToEdit.takeProfit !== null ? String(tradeToEdit.takeProfit) : ''
      );
      setTradingFees(tradeToEdit.tradingFees !== undefined && tradeToEdit.tradingFees !== null ? String(tradeToEdit.tradingFees) : '');
      setFundingFees(tradeToEdit.fundingFees !== undefined && tradeToEdit.fundingFees !== null ? String(tradeToEdit.fundingFees) : '');
      setUsdtRate(tradeToEdit.usdtRate !== undefined && tradeToEdit.usdtRate !== null ? String(tradeToEdit.usdtRate) : String(USD_TO_INR_RATE));
      setIsManualQuantity(Boolean(tradeToEdit.isManualQuantity));
      setStrategy(tradeToEdit.strategy || 'SMC Order Block');
      setNotes(tradeToEdit.notes || '');
      setChartUrl(tradeToEdit.chartUrl || '');
      setH1Bias(Boolean(tradeToEdit.h1Bias));
      setM15Structure(Boolean(tradeToEdit.m15Structure));
      setM5EntryPoi(Boolean(tradeToEdit.m5EntryPoi));
      setM1BosChoch(Boolean(tradeToEdit.m1BosChoch));
      setLtfTrigger(tradeToEdit.ltfTrigger || 'CHOCH');
      setStartingCapital(
        tradeToEdit.startingCapital !== undefined && tradeToEdit.startingCapital !== null ? String(tradeToEdit.startingCapital) :
        tradeToEdit.capital !== undefined && tradeToEdit.capital !== null ? String(tradeToEdit.capital) : ''
      );
      setLeverage(
        tradeToEdit.leverage !== undefined && tradeToEdit.leverage !== null ? String(tradeToEdit.leverage) : '25'
      );
      setMarginUsed(
        tradeToEdit.marginUsed !== undefined && tradeToEdit.marginUsed !== null ? String(tradeToEdit.marginUsed) :
        tradeToEdit.margin !== undefined && tradeToEdit.margin !== null ? String(tradeToEdit.margin) : ''
      );
      setContractSize(
        tradeToEdit.contractSize !== undefined && tradeToEdit.contractSize !== null ? String(tradeToEdit.contractSize) : '0.001'
      );
      setOrderLots(
        tradeToEdit.lots !== undefined && tradeToEdit.lots !== null ? String(tradeToEdit.lots) :
        tradeToEdit.orderLots !== undefined && tradeToEdit.orderLots !== null ? String(tradeToEdit.orderLots) :
        tradeToEdit.contractQuantity !== undefined && tradeToEdit.contractQuantity !== null ? String(tradeToEdit.contractQuantity) : ''
      );
      setTargetRiskINR(
        tradeToEdit.targetRisk !== undefined && tradeToEdit.targetRisk !== null ? String(tradeToEdit.targetRisk) : ''
      );
      setHasBracketOrder(Boolean(tradeToEdit.hasBracketOrder ?? true));
    } else {
      resetForm();
      if (initialConfluences) {
        setH1Bias(Boolean(initialConfluences.h1Bias ?? initialConfluences.londonSweep));
        setM15Structure(Boolean(initialConfluences.m15Structure ?? initialConfluences.nyImpulse));
        setM5EntryPoi(Boolean(initialConfluences.m5EntryPoi ?? initialConfluences.fibPoiZone));
        setM1BosChoch(Boolean(initialConfluences.m1BosChoch ?? initialConfluences.rejectionCandle));
        setLtfTrigger(initialConfluences.triggerType || initialConfluences.ltfTrigger || 'PIN_BAR');
        if (initialConfluences.symbol) setSymbol(initialConfluences.symbol);
        if (initialConfluences.direction) setDirection(initialConfluences.direction);
        if (initialConfluences.strategyModel) setStrategy(initialConfluences.strategyModel);
      }
    }
    setStep(1);
  }, [tradeToEdit, initialConfluences, isOpen]);

  const resetForm = () => {
    setDirection('LONG');
    setOrderType('Limit');
    setStatus('CLOSED');
    setTradeType('Intraday');
    setMarket('Crypto');
    setExchange('Delta Exchange');
    setSymbol('BTC/USDT');
    setEntryDate(new Date().toISOString().slice(0, 16));
    setStartingCapital('');
    setMarginUsed('');
    setLeverage('25');
    setSelectedQuickSize(null);
    setContractSize('0.001');
    setUsdtRate(String(USD_TO_INR_RATE));
    setHasBracketOrder(true);
    setEntryPrice('');
    setStopLoss('');
    setTargetPrice('');
    setExitPrice('');
    setOrderLots('');
    setTargetRiskINR('');
    setManualRealizedPnL('');
    setTradingFees('');
    setFundingFees('');
    setQuantity('');
    setIsManualQuantity(false);
    setStrategy('SMC Order Block');
    setNotes('');
    setChartUrl('');
    setH1Bias(false);
    setM15Structure(false);
    setM5EntryPoi(false);
    setM1BosChoch(false);
    setLtfTrigger('CHOCH');
    setShowSymbolDropdown(false);
    setSymbolSearch('');
  };

  // Close symbol dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (symbolDropdownRef.current && !symbolDropdownRef.current.contains(e.target)) {
        setShowSymbolDropdown(false);
      }
    };
    if (showSymbolDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSymbolDropdown]);

  // Filtered popular pairs based on search and category
  const filteredSymbols = useMemo(() => {
    let list = BINANCE_POPULAR_PAIRS;
    if (symbolCategory === 'POPULAR') {
      const topSymbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XAUUSD', 'XRP/USDT', 'BNB/USDT', 'DOGE/USDT', 'AVAX/USDT', 'SUI/USDT', 'LINK/USDT', 'ALV/USDT'];
      list = list.filter(p => topSymbols.includes(p.symbol));
    } else if (symbolCategory === 'METALS') {
      list = list.filter(p => p.symbol.includes('XAU') || p.coin === 'XAU');
    } else if (symbolCategory === 'CRYPTO') {
      list = list.filter(p => !p.symbol.includes('XAU') && p.coin !== 'XAU');
    }

    if (symbolSearch.trim()) {
      const q = symbolSearch.toUpperCase().trim();
      list = list.filter(p => 
        p.symbol.toUpperCase().includes(q) || 
        p.name.toUpperCase().includes(q) || 
        p.coin.toUpperCase().includes(q)
      );
    }
    return list;
  }, [symbolSearch, symbolCategory]);

  const handleSelectSymbol = (selectedSym) => {
    const clean = selectedSym.toUpperCase().trim();
    setSymbol(clean);
    const recSize = getRecommendedContractSize(clean);
    setContractSize(recSize);
    if (clean.includes('XAU') || clean.includes('GOLD')) {
      setMarket('Commodities');
      if (!exchange || exchange === 'XAUUSD') {
        setExchange('Delta Exchange');
      }
    } else {
      setMarket('Crypto');
    }
    setShowSymbolDropdown(false);
    setSymbolSearch('');
  };

  // Synchronize Lot size to Coin Quantity
  useEffect(() => {
    if (isManualQuantity) return;
    if (orderLots === '') {
      setQuantity('');
      return;
    }
    const lots = parseFloat(orderLots);
    const cSize = parseFloat(contractSize) || 0.001;
    if (!isNaN(lots) && lots >= 0 && cSize > 0) {
      const derivedCoinQty = parseFloat((lots * cSize).toFixed(6));
      setQuantity(String(derivedCoinQty));
    }
  }, [orderLots, contractSize, isManualQuantity]);

  // Position Sizing % Shortcuts (10%, 25%, 50%, 75%, 100%)
  const handlePercentageMargin = (pct) => {
    setSelectedQuickSize(pct);
    const cap = parseFloat(startingCapital);
    if (!cap || isNaN(cap) || cap <= 0) return;
    const margin = (cap * (pct / 100)).toFixed(0);
    setMarginUsed(margin);

    const lev = parseFloat(leverage) || 25;
    const entry = parseFloat(entryPrice) || 0;
    const cSize = parseFloat(contractSize) || 0.001;
    const rate = parseFloat(usdtRate) || USD_TO_INR_RATE;
    const marginNum = parseFloat(margin);

    if (entry > 0 && lev > 0 && cSize > 0 && rate > 0 && marginNum > 0) {
      const capacityNotionalINR = marginNum * lev;
      const capacityNotionalUSDT = capacityNotionalINR / rate;
      const lotsCapacity = Math.floor(capacityNotionalUSDT / (cSize * entry));
      if (lotsCapacity > 0) {
        setOrderLots(String(lotsCapacity));
        setQuantity(parseFloat((lotsCapacity * cSize).toFixed(6)).toString());
        setIsManualQuantity(false);
      }
    }
  };

  // Comprehensive Real-time Delta Exchange Futures Order Calculation Engine
  const calculationSummary = useMemo(() => {
    const cap = parseFloat(startingCapital) || 0;
    const lev = parseFloat(leverage) || 1;
    const margin = parseFloat(marginUsed) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(targetPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const cSize = parseFloat(contractSize) || 0.001;
    const lots = parseFloat(orderLots) || 0;
    const manualQty = parseFloat(quantity) || 0;
    const qty = isManualQuantity && manualQty > 0 ? manualQty : (lots * cSize);
    const targetRisk = parseFloat(targetRiskINR) || 0;
    const tFees = parseFloat(tradingFees) || 0;
    const fFees = parseFloat(fundingFees) || 0;
    const totalFees = tFees + fFees;
    const rate = parseFloat(usdtRate) || USD_TO_INR_RATE;
    const isLong = direction === 'LONG';

    // 1. Capacity & Position Notional
    const capacityNotionalINR = margin * lev;
    const availableBalance = cap - margin;

    const lotsNotionalUSDT = qty * entry;
    const lotsNotionalINR = lotsNotionalUSDT * rate;
    const requiredMarginINR = lev > 0 ? (lotsNotionalINR / lev) : 0;

    // 2. Stop Loss & Take Profit Price Distances
    let slDiff = 0;
    let hasSL = false;
    let isSLInProfit = false;
    if (entry > 0 && sl > 0) {
      const directionalSL = isLong ? (entry - sl) : (sl - entry);
      if (directionalSL > 0) {
        slDiff = directionalSL;
        hasSL = true;
      } else {
        // Trailed stop loss moved beyond entry (locked-in profit)
        slDiff = Math.abs(entry - sl);
        hasSL = true;
        isSLInProfit = true;
      }
    }

    let tpDiff = 0;
    let hasTP = false;
    if (entry > 0 && tp > 0) {
      const directionalTP = isLong ? (tp - entry) : (entry - tp);
      if (directionalTP > 0) {
        tpDiff = directionalTP;
        hasTP = true;
      } else {
        tpDiff = Math.abs(tp - entry);
        hasTP = tpDiff > 0;
      }
    }

    // 3. Dynamic Risk-Based Lot Sizing
    let lossPerLotUSDT = 0;
    let lossPerLotINR = 0;
    let recommendedRiskLots = 0;
    if (hasSL && slDiff > 0 && cSize > 0) {
      lossPerLotUSDT = slDiff * cSize;
      lossPerLotINR = lossPerLotUSDT * rate;
      if (lossPerLotINR > 0 && targetRisk > 0) {
        recommendedRiskLots = Math.floor(targetRisk / lossPerLotINR);
      }
    }

    // 4. Stop Loss Estimated Loss / Locked Profit
    const rawGrossLossUSDT = hasSL && qty > 0 ? (qty * slDiff) : 0;
    const grossLossINR = rawGrossLossUSDT * rate;
    const netLossINR = isSLInProfit ? Math.max(0, grossLossINR - totalFees) : (grossLossINR + totalFees);
    const riskPercentCapital = cap > 0 && grossLossINR > 0 ? (grossLossINR / cap) * 100 : 0;
    const balanceAtSL = cap > 0 ? (isSLInProfit ? (cap + netLossINR) : (cap - netLossINR)) : 0;

    // 5. Take Profit Estimated Profit
    const rawGrossProfitUSDT = hasTP && qty > 0 ? (qty * tpDiff) : 0;
    const grossProfitINR = rawGrossProfitUSDT * rate;
    const netProfitINR = grossProfitINR - totalFees;
    const rewardPercentCapital = cap > 0 && netProfitINR > 0 ? (netProfitINR / cap) * 100 : 0;
    const balanceAtTP = cap > 0 ? (cap + netProfitINR) : 0;

    // 6. Risk / Reward Ratio
    let rrRatioStr = '--';
    let rrRatioValue = null;
    if (hasSL && hasTP && grossLossINR > 0) {
      rrRatioValue = grossProfitINR / grossLossINR;
      rrRatioStr = `1 : ${rrRatioValue.toFixed(2)}`;
    }

    // 7. Actual Realized P&L
    const hasExit = (status === 'CLOSED' || exitPrice !== '') && exitPrice !== '' && !isNaN(exit) && exit > 0;
    let rawGrossRealizedUSDT = 0;
    let realizedGrossPnLINR = 0;
    let realizedNetPnLINR = 0;
    let realizedRoiPercent = 0;

    if (hasExit && entry > 0 && qty > 0) {
      const priceDiff = isLong ? (exit - entry) : (entry - exit);
      rawGrossRealizedUSDT = qty * priceDiff;
      realizedGrossPnLINR = rawGrossRealizedUSDT * rate;
      realizedNetPnLINR = realizedGrossPnLINR - totalFees;
    }

    const hasManualRealized = manualRealizedPnL !== '' && !isNaN(parseFloat(manualRealizedPnL));
    if (hasManualRealized) {
      realizedNetPnLINR = parseFloat(manualRealizedPnL);
    }

    const capitalBase = margin > 0 ? margin : (cap > 0 ? cap : (lotsNotionalINR > 0 ? lotsNotionalINR : 1));
    if (capitalBase > 0 && (hasExit || hasManualRealized)) {
      realizedRoiPercent = (realizedNetPnLINR / capitalBase) * 100;
    }

    const balanceAfterTrade = cap > 0 ? (cap + realizedNetPnLINR) : 0;

    return {
      isValid: entry > 0 && (lots > 0 || qty > 0),
      capacityNotionalINR,
      lotsNotionalUSDT,
      lotsNotionalINR,
      requiredMarginINR,
      availableBalance,
      qty,
      cSize,
      lots,
      hasSL,
      isSLInProfit,
      hasTP,
      slDiff,
      tpDiff,
      lossPerLotINR,
      lossPerLotUSDT,
      recommendedRiskLots,
      grossLossINR,
      netLossINR,
      grossProfitINR,
      netProfitINR,
      riskPercentCapital,
      rewardPercentCapital,
      balanceAtSL,
      balanceAtTP,
      rrRatioStr,
      rrRatioValue,
      hasExit,
      hasManualRealized,
      realizedGrossPnL: realizedGrossPnLINR,
      realizedNetPnL: realizedNetPnLINR,
      realizedRoiPercent,
      balanceAfterTrade,
      tradingFees: tFees,
      fundingFees: fFees,
      totalFees
    };
  }, [startingCapital, leverage, marginUsed, entryPrice, stopLoss, targetPrice, exitPrice, quantity, orderLots, contractSize, targetRiskINR, tradingFees, fundingFees, direction, status, usdtRate, isManualQuantity, manualRealizedPnL]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setChartUrl(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveInternal = (e) => {
    if (e) e.preventDefault();
    const effQty = calculationSummary.qty || parseFloat(quantity);
    if (!symbol || !entryPrice || (!quantity && (!effQty || effQty <= 0))) {
      alert('Please enter Symbol, Entry Price, and Quantity (or Lots).');
      return;
    }

    const parsedEntry = parseFloat(entryPrice);
    const parsedQty = effQty;

    if (isNaN(parsedEntry) || parsedEntry <= 0) {
      alert('Please enter a valid numerical Entry Price.');
      return;
    }

    if (isNaN(parsedQty) || parsedQty <= 0) {
      alert('Please enter a valid numerical Quantity or Lots.');
      return;
    }

    let parsedExit = status === 'CLOSED' && exitPrice !== '' ? parseFloat(exitPrice) : null;
    if (status === 'CLOSED' && (parsedExit === null || isNaN(parsedExit))) {
      parsedExit = parsedEntry;
    }

    const tradeData = {
      id: tradeToEdit ? tradeToEdit.id : `trd-${Date.now()}`,
      tradeType: tradeType || 'Intraday',
      orderType: orderType || 'Limit',
      direction: direction || 'LONG',
      market: market || 'Crypto',
      exchange: exchange || 'Delta Exchange',
      symbol: symbol.toUpperCase().trim(),
      entryDate: entryDate || new Date().toISOString().slice(0, 16),
      entryPrice: parsedEntry,
      quantity: parsedQty,
      lots: parseFloat(orderLots) || calculationSummary.lots,
      orderLots: parseFloat(orderLots) || calculationSummary.lots,
      contractQuantity: parseFloat(orderLots) || calculationSummary.lots,
      contractSize: parseFloat(contractSize) || 0.001,
      targetRisk: parseFloat(targetRiskINR) || 100,
      hasBracketOrder: Boolean(hasBracketOrder),
      status: status || 'CLOSED',
      exitPrice: status === 'CLOSED' ? parsedExit : null,
      actualExitPrice: status === 'CLOSED' ? parsedExit : null,
      exitDate: status === 'CLOSED' ? new Date().toISOString().slice(0, 10) : null,
      stopLoss: stopLoss !== '' && !isNaN(parseFloat(stopLoss)) ? parseFloat(stopLoss) : null,
      targetPrice: targetPrice !== '' && !isNaN(parseFloat(targetPrice)) ? parseFloat(targetPrice) : null,
      takeProfit: targetPrice !== '' && !isNaN(parseFloat(targetPrice)) ? parseFloat(targetPrice) : null,
      strategy: strategy || 'SMC Order Block',
      notes: notes || '',
      chartUrl: chartUrl || '',
      h1Bias: Boolean(h1Bias),
      m15Structure: Boolean(m15Structure),
      m5EntryPoi: Boolean(m5EntryPoi),
      m1BosChoch: Boolean(m1BosChoch),
      ltfTrigger: ltfTrigger || 'CHOCH',
      startingCapital: parseFloat(startingCapital) || 2000,
      capital: parseFloat(startingCapital) || 2000,
      leverage: parseFloat(leverage) || 25,
      marginUsed: marginUsed !== '' && !isNaN(parseFloat(marginUsed)) ? parseFloat(marginUsed) : 2000,
      margin: marginUsed !== '' && !isNaN(parseFloat(marginUsed)) ? parseFloat(marginUsed) : 2000,
      positionSize: calculationSummary.lotsNotionalINR,
      positionNotional: calculationSummary.lotsNotionalINR,
      requiredMargin: calculationSummary.requiredMarginINR,
      availableBalance: calculationSummary.availableBalance,
      tradingFees: parseFloat(tradingFees) || 0,
      fundingFees: parseFloat(fundingFees) || 0,
      usdtRate: parseFloat(usdtRate) || USD_TO_INR_RATE,
      isManualQuantity: Boolean(isManualQuantity),
      grossPnL: calculationSummary.realizedGrossPnL,
      netPnL: calculationSummary.realizedNetPnL,
      actualRealizedPnL: manualRealizedPnL !== '' && !isNaN(parseFloat(manualRealizedPnL)) ? parseFloat(manualRealizedPnL) : (status === 'CLOSED' ? calculationSummary.realizedNetPnL : null),
      balanceAfterTrade: calculationSummary.balanceAfterTrade,
      pnlAmount: calculationSummary.realizedNetPnL,
      pnlPercent: calculationSummary.realizedRoiPercent,
      riskAmount: calculationSummary.grossLossINR,
      rewardAmount: calculationSummary.grossProfitINR,
      riskRewardRatio: calculationSummary.rrRatioStr
    };

    try {
      onSave(tradeData);
    } catch (err) {
      console.error('Failed to save trade execution:', err);
    }
    onClose();
  };

  const handleSaveDraft = () => {
    handleSaveInternal();
  };

  const handleDeleteInternal = () => {
    if (tradeToEdit && onDelete) {
      if (confirm(`Are you sure you want to delete trade execution for ${tradeToEdit.symbol}?`)) {
        onDelete(tradeToEdit.id);
        onClose();
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 backdrop-blur-md overflow-y-auto font-sans ${
      isDark ? 'bg-black/80' : 'bg-slate-900/40'
    }`}>
      <div className={`rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto border shadow-2xl p-5 sm:p-6 space-y-4 custom-scrollbar ${
        isDark ? 'bg-[#0B0F17] border-[#1E2638] text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => {
                if (step > 1) setStep(step - 1);
                else onClose();
              }}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDark 
                  ? 'bg-[#111724] border-[#1E2638] text-slate-400 hover:text-white hover:border-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <h2 className={`text-base sm:text-lg font-bold tracking-tight font-jakarta ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {tradeToEdit ? 'Edit Trade' : 'New Trade'}
              </h2>
              <p className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Log a trade with plan, risk and execution details.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {tradeToEdit && (
              <button
                type="button"
                onClick={handleDeleteInternal}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isDark 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' 
                    : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                }`}
                title="Delete Trade Execution"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveDraft}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                isDark 
                  ? 'bg-[#111724] border-[#1E2638] text-slate-300 hover:text-white hover:border-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDark 
                  ? 'bg-[#111724] border-[#1E2638] text-slate-400 hover:text-white hover:border-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className={`flex items-center justify-center space-x-2 sm:space-x-4 py-2 border-y text-xs ${
          isDark ? 'border-[#1E2638]/60' : 'border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition ${
              step === 1
                ? 'bg-sky-500 text-white font-bold shadow-sm'
                : isDark ? 'bg-[#111724] border border-[#1E2638] text-slate-400 group-hover:text-white' : 'bg-slate-100 border border-slate-200 text-slate-500 group-hover:text-slate-900'
            }`}>
              1
            </span>
            <span className={`text-xs ${
              step === 1 
                ? isDark ? 'font-bold text-white' : 'font-bold text-slate-900' 
                : isDark ? 'font-medium text-slate-400 group-hover:text-slate-300' : 'font-medium text-slate-500 group-hover:text-slate-800'
            }`}>
              Order & Levels
            </span>
          </button>

          <div className={`w-8 sm:w-16 h-px ${isDark ? 'bg-[#1E2638]' : 'bg-slate-200'}`} />

          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition ${
              step === 2
                ? 'bg-sky-500 text-white font-bold shadow-sm'
                : isDark ? 'bg-[#111724] border border-[#1E2638] text-slate-400 group-hover:text-white' : 'bg-slate-100 border border-slate-200 text-slate-500 group-hover:text-slate-900'
            }`}>
              2
            </span>
            <span className={`text-xs ${
              step === 2 
                ? isDark ? 'font-bold text-white' : 'font-bold text-slate-900' 
                : isDark ? 'font-medium text-slate-400 group-hover:text-slate-300' : 'font-medium text-slate-500 group-hover:text-slate-800'
            }`}>
              Trade Plan & Confluences
            </span>
          </button>

          <div className={`w-8 sm:w-16 h-px ${isDark ? 'bg-[#1E2638]' : 'bg-slate-200'}`} />

          <button
            type="button"
            onClick={() => setStep(3)}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition ${
              step === 3
                ? 'bg-sky-500 text-white font-bold shadow-sm'
                : isDark ? 'bg-[#111724] border border-[#1E2638] text-slate-400 group-hover:text-white' : 'bg-slate-100 border border-slate-200 text-slate-500 group-hover:text-slate-900'
            }`}>
              3
            </span>
            <span className={`text-xs ${
              step === 3 
                ? isDark ? 'font-bold text-white' : 'font-bold text-slate-900' 
                : isDark ? 'font-medium text-slate-400 group-hover:text-slate-300' : 'font-medium text-slate-500 group-hover:text-slate-800'
            }`}>
              Review & Save
            </span>
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT COLUMN: Main Controls */}
          <div className="lg:col-span-8 space-y-4">

            {/* STEP 1: Order & Levels */}
            {step === 1 && (
              <>
                {/* Row 1: Direction, Order Type, Trade Status */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  
                  {/* Trade Direction */}
                  <div className="md:col-span-4">
                    <label className={`block text-[11px] font-medium mb-1.5 font-jakarta ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Trade Direction
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDirection('LONG')}
                        className={`h-9 px-2 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center space-x-1 border ${
                          direction === 'LONG'
                            ? isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-sm' : 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                            : isDark ? 'bg-[#0E1320] text-slate-400 border-[#1E2638] hover:text-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>↑ Buy / Long</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirection('SHORT')}
                        className={`h-9 px-2 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center space-x-1 border ${
                          direction === 'SHORT'
                            ? isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/40 shadow-sm' : 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
                            : isDark ? 'bg-[#0E1320] text-slate-400 border-[#1E2638] hover:text-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span>↓ Sell / Short</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Type */}
                  <div className="md:col-span-4">
                    <label className={`block text-[11px] font-medium mb-1.5 font-jakarta ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Order Type
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setOrderType('Limit')}
                        className={`h-9 px-1 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center border ${
                          orderType === 'Limit'
                            ? isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/40' : 'bg-sky-50 text-sky-700 border-sky-300'
                            : isDark ? 'bg-[#0E1320] text-slate-400 border-[#1E2638] hover:text-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Limit
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('Market')}
                        className={`h-9 px-1 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center border ${
                          orderType === 'Market'
                            ? isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/40' : 'bg-sky-50 text-sky-700 border-sky-300'
                            : isDark ? 'bg-[#0E1320] text-slate-400 border-[#1E2638] hover:text-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Market
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderType('Stop')}
                        className={`h-9 px-1 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center border ${
                          orderType === 'Stop'
                            ? isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/40' : 'bg-sky-50 text-sky-700 border-sky-300'
                            : isDark ? 'bg-[#0E1320] text-slate-400 border-[#1E2638] hover:text-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Stop
                      </button>
                    </div>
                  </div>

                  {/* Trade Status */}
                  <div className="md:col-span-4">
                    <label className={`block text-[11px] font-medium mb-1.5 font-jakarta ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Trade Status
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setStatus('OPEN')}
                        className={`h-9 px-2 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center whitespace-nowrap border ${
                          status === 'OPEN'
                            ? isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/40 shadow-sm' : 'bg-sky-50 text-sky-700 border-sky-300 shadow-sm'
                            : isDark ? 'bg-[#0E1320] text-slate-400 border-[#1E2638] hover:text-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Open Position
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('CLOSED')}
                        className={`h-9 px-2 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center whitespace-nowrap border ${
                          status === 'CLOSED'
                            ? isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-sm' : 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                            : isDark ? 'bg-[#0E1320] text-slate-400 border-[#1E2638] hover:text-slate-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Closed Trade
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 2: Instrument / Symbol, Exchange, Leverage (Upper), Execution Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Instrument / Symbol */}
                  <div className="relative" ref={symbolDropdownRef}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`block text-[11px] font-medium font-jakarta ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Instrument / Symbol *
                      </label>
                      {symbol && (
                        <span className={`text-[10px] font-mono font-medium ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
                          1 Lot = {contractSize} {getAssetTicker(symbol)}
                        </span>
                      )}
                    </div>

                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowSymbolDropdown(prev => !prev);
                        setSymbolSearch('');
                      }}
                      className={`w-full flex items-center justify-between rounded-xl border px-3 h-10 transition cursor-pointer select-none text-left ${
                        showSymbolDropdown
                          ? isDark ? 'border-sky-500 ring-2 ring-sky-500/20 bg-[#111726]' : 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50'
                          : isDark ? 'bg-[#0E1320] border-[#1E2638] hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-1">
                        <CryptoIcon symbol={symbol || 'BTC'} className="w-5 h-5 shrink-0" />
                        <span className={`text-xs font-bold font-mono uppercase tracking-wide truncate ${
                          symbol ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                          {symbol || 'Select Trading Pair'}
                        </span>
                        <span className={`hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded border ml-auto mr-1 ${
                          symbol.includes('XAU')
                            ? isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
                            : isDark ? 'bg-[#1E2638]/70 border-[#2A364F] text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          {symbol.includes('XAU') ? 'METALS' : 'PERP'}
                        </span>
                      </div>

                      <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                        showSymbolDropdown ? 'rotate-180 text-sky-400' : (isDark ? 'text-slate-500' : 'text-slate-400')
                      }`} />
                    </button>

                    {/* Custom Searchable Dropdown Popover */}
                    {showSymbolDropdown && (
                      <div className={`absolute left-0 top-full mt-1.5 w-80 sm:w-96 z-50 rounded-2xl border shadow-2xl p-3 space-y-2.5 font-sans animate-in fade-in zoom-in-95 duration-100 ${
                        isDark ? 'bg-[#0B0F19] border-[#1E2638] text-slate-100 shadow-black/80' : 'bg-white border-slate-200 text-slate-800 shadow-slate-300/80'
                      }`}>
                        
                        {/* Search Input Box */}
                        <div className={`flex items-center px-2.5 py-1.5 rounded-xl border transition ${
                          isDark ? 'bg-[#111726] border-[#1E2638] focus-within:border-sky-500' : 'bg-slate-50 border-slate-200 focus-within:border-sky-500'
                        }`}>
                          <Search className={`w-3.5 h-3.5 mr-2 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                          <input
                            type="text"
                            autoFocus
                            placeholder="Search coin (e.g. ETH, SOL, XAU, ALV)..."
                            value={symbolSearch}
                            onChange={(e) => setSymbolSearch(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (filteredSymbols.length > 0) {
                                  handleSelectSymbol(filteredSymbols[0].symbol);
                                } else if (symbolSearch.trim()) {
                                  handleSelectSymbol(symbolSearch.trim());
                                }
                              } else if (e.key === 'Escape') {
                                setShowSymbolDropdown(false);
                              }
                            }}
                            className={`w-full bg-transparent text-xs font-medium focus:outline-none ${
                              isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                            }`}
                          />
                          {symbolSearch && (
                            <button
                              type="button"
                              onClick={() => setSymbolSearch('')}
                              className={`p-0.5 rounded-md hover:bg-slate-500/20 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center space-x-1.5 text-[11px] font-medium overflow-x-auto pb-0.5 custom-scrollbar">
                          {[
                            { id: 'ALL', label: 'All Pairs' },
                            { id: 'POPULAR', label: '🔥 Top 10' },
                            { id: 'CRYPTO', label: 'Crypto' },
                            { id: 'METALS', label: 'Gold (XAU)' }
                          ].map(cat => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setSymbolCategory(cat.id)}
                              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer border ${
                                symbolCategory === cat.id
                                  ? 'bg-sky-500 text-white font-bold border-sky-500 shadow-xs'
                                  : isDark 
                                    ? 'bg-[#111726] border-[#1E2638] text-slate-400 hover:text-white hover:border-slate-700' 
                                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* Symbol List */}
                        <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                          {/* Custom Symbol fallback if user typed something not strictly in the list */}
                          {symbolSearch.trim() && !filteredSymbols.some(p => p.symbol.toUpperCase() === symbolSearch.toUpperCase().trim()) && (
                            <button
                              type="button"
                              onClick={() => handleSelectSymbol(symbolSearch.trim())}
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left border border-dashed transition cursor-pointer mb-1.5 ${
                                isDark 
                                  ? 'border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300' 
                                  : 'border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-700'
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                <span className="text-xs font-mono font-bold uppercase">
                                  Use "{symbolSearch.toUpperCase().trim()}"
                                </span>
                              </div>
                              <span className="text-[10px] font-mono uppercase opacity-80">Custom Symbol →</span>
                            </button>
                          )}

                          {filteredSymbols.length === 0 && !symbolSearch.trim() ? (
                            <div className="text-center py-6 text-xs text-slate-400 font-mono">
                              No symbols match the filter
                            </div>
                          ) : (
                            filteredSymbols.map(p => {
                              const isSelected = symbol === p.symbol;
                              const cSize = getRecommendedContractSize(p.symbol);
                              return (
                                <button
                                  key={p.symbol}
                                  type="button"
                                  onClick={() => handleSelectSymbol(p.symbol)}
                                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer group border ${
                                    isSelected
                                      ? isDark ? 'bg-sky-500/15 border-sky-500/40 text-white' : 'bg-sky-50 border-sky-300 text-sky-900'
                                      : isDark ? 'border-transparent hover:bg-[#111726] text-slate-300 hover:text-white' : 'border-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                                  }`}
                                >
                                  <div className="flex items-center space-x-2.5 min-w-0">
                                    <CryptoIcon symbol={p.symbol} className="w-5 h-5 shrink-0" />
                                    <div className="min-w-0">
                                      <div className="flex items-center space-x-1.5">
                                        <span className={`text-xs font-mono font-bold uppercase ${
                                          isSelected ? (isDark ? 'text-sky-400' : 'text-sky-700') : (isDark ? 'text-white' : 'text-slate-900')
                                        }`}>
                                          {p.symbol}
                                        </span>
                                        {p.symbol.includes('XAU') && (
                                          <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                                            GOLD
                                          </span>
                                        )}
                                      </div>
                                      <span className={`text-[10px] block truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {p.name}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2 shrink-0">
                                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                      isDark ? 'bg-[#0E1320] border-[#1E2638] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                                    }`}>
                                      1 Lot = {cSize} {p.coin}
                                    </span>
                                    {isSelected && (
                                      <Check className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
                                    )}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Exchange */}
                  <div>
                    <ExchangeSelector
                      value={exchange}
                      onChange={setExchange}
                      isDark={isDark}
                      label="Exchange"
                    />
                  </div>

                  {/* Leverage (Upper Section) */}
                  <div>
                    <LeverageSelector
                      value={leverage}
                      onChange={setLeverage}
                      isDark={isDark}
                      label="Leverage"
                      align="left"
                    />
                  </div>

                  {/* Execution Date */}
                  <div>
                    <label className={`block text-[11px] font-medium mb-1.5 font-jakarta ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Execution Date
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEntryDatePicker(!showEntryDatePicker)}
                        className={`w-full px-3 h-10 text-xs font-medium rounded-xl border focus:outline-none flex items-center justify-between cursor-pointer transition ${
                          isDark ? 'bg-[#0E1320] hover:bg-[#151D30] text-slate-200 border-[#1E2638] hover:border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span>{formatShortDate(entryDate)}</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </button>

                      {showEntryDatePicker && (
                        <CustomGlassDateTimePicker
                          value={entryDate}
                          onChange={(val) => setEntryDate(val)}
                          onClose={() => setShowEntryDatePicker(false)}
                          isDark={isDark}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 1: Capital & Position Sizing Card */}
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#0D121F]/80 border-[#1E2638]' : 'bg-[#F8FAFC] border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center space-x-1.5 text-xs font-semibold font-jakarta ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}>
                      <span>Capital & Position Sizing</span>
                      <Info className={`w-3.5 h-3.5 cursor-pointer ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`} title="Margin, capacity and leverage sizing details" />
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className={`text-[11px] mr-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quick Size:</span>
                      {[10, 25, 50, 75, 100].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handlePercentageMargin(pct)}
                          className={`px-2 py-0.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
                            selectedQuickSize === pct
                              ? 'bg-sky-500 text-white font-bold shadow-sm border-sky-500'
                              : isDark ? 'bg-[#111726] text-slate-400 hover:text-white border-[#1E2638]' : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4 Clean Columns */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className={`block text-[11px] font-medium mb-1 font-jakarta ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Starting Capital ({currencySymbol})
                      </label>
                      <div className={`relative flex items-center rounded-xl border px-3 h-10 transition ${
                        isDark ? 'bg-[#0B0F19] border-[#1E2638] focus-within:border-sky-500 hover:border-slate-700' : 'bg-white border-slate-200 focus-within:border-sky-500 hover:border-slate-300'
                      }`}>
                        <span className={`text-xs mr-1 select-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{currencySymbol}</span>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 2000"
                          value={startingCapital}
                          onChange={(e) => setStartingCapital(e.target.value)}
                          className={`w-full bg-transparent font-mono text-xs font-medium focus:outline-none ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-medium mb-1 font-jakarta ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Margin Used ({currencySymbol})
                      </label>
                      <div className={`relative flex items-center rounded-xl border px-3 h-10 transition ${
                        isDark ? 'bg-[#0B0F19] border-[#1E2638] focus-within:border-sky-500 hover:border-slate-700' : 'bg-white border-slate-200 focus-within:border-sky-500 hover:border-slate-300'
                      }`}>
                        <span className={`text-xs mr-1 select-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{currencySymbol}</span>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 2000"
                          value={marginUsed}
                          onChange={(e) => setMarginUsed(e.target.value)}
                          className={`w-full bg-transparent font-mono text-xs font-medium focus:outline-none ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[11px] font-medium mb-1 font-jakarta ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Available Balance ({currencySymbol})
                      </label>
                      <div className={`flex items-center rounded-xl border px-3 h-10 font-mono text-xs font-semibold ${
                        isDark ? 'bg-[#0B0F19] border-[#1E2638] text-emerald-400' : 'bg-white border-slate-200 text-emerald-600'
                      }`}>
                        <span>{currencySymbol} {calculationSummary.availableBalance >= 0 ? calculationSummary.availableBalance.toLocaleString('en-IN') : '0'}</span>
                      </div>
                    </div>

                    <div>
                      <LeverageSelector
                        value={leverage}
                        onChange={setLeverage}
                        isDark={isDark}
                        label="Leverage"
                        align="right"
                      />
                    </div>
                  </div>

                  {/* Sub-strip */}
                  <div className={`flex flex-wrap items-center justify-between text-xs pt-1 border-t ${
                    isDark ? 'border-[#1E2638]/60 text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}>
                    <div>
                      Capacity: <span className={`font-medium ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>{formatVal(calculationSummary.capacityNotionalINR, currency)}</span> <span className="text-[11px] opacity-70">(Margin × Leverage)</span>
                    </div>
                    <div className="text-[11px]">
                      Contract: <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>1 Lot = {contractSize} {getAssetTicker(symbol)}</span> · 1 USDT = <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>₹{usdtRate}</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Order Levels & Position Sizing Card */}
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#0D121F]/80 border-[#1E2638]' : 'bg-[#F8FAFC] border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className={`text-xs font-semibold font-jakarta ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Order Levels & Position Sizing
                    </div>

                    <label className={`flex items-center space-x-1.5 text-xs font-medium cursor-pointer ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      <input
                        type="checkbox"
                        checked={hasBracketOrder}
                        onChange={(e) => setHasBracketOrder(e.target.checked)}
                        className="rounded accent-sky-500 cursor-pointer"
                      />
                      <span>TP / SL Bracket</span>
                      <Info className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    </label>
                  </div>

                  {/* Row 1: 4 Price Inputs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className={`block text-[11px] font-medium mb-1 font-jakarta ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Entry Price *
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 77406"
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(e.target.value)}
                        className={`w-full px-3 h-10 rounded-xl border font-mono text-xs font-medium focus:outline-none focus:border-sky-500 transition ${
                          isDark ? 'bg-[#0B0F19] border-[#1E2638] text-white hover:border-slate-700' : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                        }`}
                        required
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] font-medium mb-1 font-jakarta ${
                        isDark ? 'text-rose-400' : 'text-rose-600'
                      }`}>
                        Stop Loss (SL)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 77250"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        className={`w-full px-3 h-10 rounded-xl border font-mono text-xs font-medium focus:outline-none focus:border-rose-500 transition ${
                          isDark ? 'bg-[#0B0F19] border-[#1E2638] text-rose-300 hover:border-slate-700' : 'bg-white border-slate-200 text-rose-600 hover:border-slate-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] font-medium mb-1 font-jakarta ${
                        isDark ? 'text-emerald-400' : 'text-emerald-600'
                      }`}>
                        Take Profit (TP)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 77874"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        className={`w-full px-3 h-10 rounded-xl border font-mono text-xs font-medium focus:outline-none focus:border-emerald-500 transition ${
                          isDark ? 'bg-[#0B0F19] border-[#1E2638] text-emerald-300 hover:border-slate-700' : 'bg-white border-slate-200 text-emerald-600 hover:border-slate-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] font-medium mb-1 font-jakarta ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Actual Exit Price
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 77485"
                        value={exitPrice}
                        onChange={(e) => setExitPrice(e.target.value)}
                        className={`w-full px-3 h-10 rounded-xl border font-mono text-xs font-medium focus:outline-none focus:border-sky-500 transition ${
                          isDark ? 'bg-[#0B0F19] border-[#1E2638] text-white hover:border-slate-700' : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Row 2: Order Size in Lots & Dynamic Risk Target */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className={`block text-[11px] font-medium font-jakarta ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          Order Size in Lots *
                        </label>
                        <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          = {calculationSummary.qty.toFixed(6)} {getAssetTicker(symbol)}
                        </span>
                      </div>
                      <div className={`relative flex items-center rounded-xl border px-3 h-10 transition ${
                        isDark ? 'bg-[#0B0F19] border-[#1E2638] focus-within:border-sky-500 hover:border-slate-700' : 'bg-white border-slate-200 focus-within:border-sky-500 hover:border-slate-300'
                      }`}>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 14"
                          value={orderLots}
                          onChange={(e) => {
                            setOrderLots(e.target.value);
                            const l = parseFloat(e.target.value);
                            const c = parseFloat(contractSize) || 0.001;
                            if (!isNaN(l) && l >= 0) {
                              setQuantity(parseFloat((l * c).toFixed(6)).toString());
                              setIsManualQuantity(false);
                            }
                          }}
                          className={`w-full bg-transparent font-mono text-xs font-medium focus:outline-none pr-10 ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                          required
                        />
                        <span className={`text-xs font-medium pointer-events-none select-none ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          Lots
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className={`block text-[11px] font-medium font-jakarta ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          Dynamic Risk Target ({currencySymbol})
                        </label>
                        {calculationSummary.hasSL && calculationSummary.recommendedRiskLots > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setOrderLots(String(calculationSummary.recommendedRiskLots));
                              const c = parseFloat(contractSize) || 0.001;
                              setQuantity(parseFloat((calculationSummary.recommendedRiskLots * c).toFixed(6)).toString());
                              setIsManualQuantity(false);
                            }}
                            className={`text-[10px] font-medium cursor-pointer hover:underline ${
                              isDark ? 'text-sky-400' : 'text-sky-600'
                            }`}
                          >
                            Apply {calculationSummary.recommendedRiskLots} Lots
                          </button>
                        )}
                      </div>
                      <div className={`relative flex items-center rounded-xl border px-3 h-10 transition ${
                        isDark ? 'bg-[#0B0F19] border-[#1E2638] focus-within:border-sky-500 hover:border-slate-700' : 'bg-white border-slate-200 focus-within:border-sky-500 hover:border-slate-300'
                      }`}>
                        <span className={`text-xs mr-1 select-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{currencySymbol}</span>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 100"
                          value={targetRiskINR}
                          onChange={(e) => setTargetRiskINR(e.target.value)}
                          className={`w-full bg-transparent font-mono text-xs font-medium focus:outline-none ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Exchange Realized P&L, Trading Fees, Funding Fees */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div>
                      <label className={`block text-[11px] font-medium mb-1 font-jakarta ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Exchange Realized P&L ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. -100"
                        value={manualRealizedPnL}
                        onChange={(e) => setManualRealizedPnL(e.target.value)}
                        className={`w-full px-3 h-10 rounded-xl border font-mono text-xs font-medium focus:outline-none focus:border-sky-500 transition ${
                          isDark ? 'bg-[#0B0F19] border-[#1E2638] text-white hover:border-slate-700' : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] font-medium mb-1 font-jakarta ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Trading Fees ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={tradingFees}
                        onChange={(e) => setTradingFees(e.target.value)}
                        className={`w-full px-3 h-10 rounded-xl border font-mono text-xs font-medium focus:outline-none focus:border-sky-500 transition ${
                          isDark ? 'bg-[#0B0F19] border-[#1E2638] text-white hover:border-slate-700' : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[11px] font-medium mb-1 font-jakarta ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Funding Fees ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={fundingFees}
                        onChange={(e) => setFundingFees(e.target.value)}
                        className={`w-full px-3 h-10 rounded-xl border font-mono text-xs font-medium focus:outline-none focus:border-sky-500 transition ${
                          isDark ? 'bg-[#0B0F19] border-[#1E2638] text-white hover:border-slate-700' : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: Trade Plan & Confluences */}
            {step === 2 && (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#0D121F]/80 border-[#1E2638]' : 'bg-[#F8FAFC] border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className={`text-xs font-semibold font-jakarta ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      ICT London / NY Confluence Checklist
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${
                      [h1Bias, m15Structure, m5EntryPoi, m1BosChoch].filter(Boolean).length === 4
                        ? 'text-emerald-500'
                        : [h1Bias, m15Structure, m5EntryPoi, m1BosChoch].filter(Boolean).length === 3
                        ? 'text-sky-500'
                        : isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {[h1Bias, m15Structure, m5EntryPoi, m1BosChoch].filter(Boolean).length}/4 Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      h1Bias 
                        ? isDark ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-emerald-50/70 border-emerald-300' 
                        : isDark ? 'bg-[#0B0F19] border-[#1E2638] hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={h1Bias}
                        onChange={(e) => setH1Bias(e.target.checked)}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                      <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>1. London / NY Session Sweep</span>
                    </label>

                    <label className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      m15Structure 
                        ? isDark ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-emerald-50/70 border-emerald-300' 
                        : isDark ? 'bg-[#0B0F19] border-[#1E2638] hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={m15Structure}
                        onChange={(e) => setM15Structure(e.target.checked)}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                      <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>2. NY Impulsive Move (Displacement)</span>
                    </label>

                    <label className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      m5EntryPoi 
                        ? isDark ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-emerald-50/70 border-emerald-300' 
                        : isDark ? 'bg-[#0B0F19] border-[#1E2638] hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={m5EntryPoi}
                        onChange={(e) => setM5EntryPoi(e.target.checked)}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                      <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>3. 50%–61.8% Fib Zone & POI</span>
                    </label>

                    <label className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      m1BosChoch 
                        ? isDark ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-emerald-50/70 border-emerald-300' 
                        : isDark ? 'bg-[#0B0F19] border-[#1E2638] hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={m1BosChoch}
                        onChange={(e) => setM1BosChoch(e.target.checked)}
                        className="rounded accent-emerald-500 cursor-pointer"
                      />
                      <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>4. Rejection Candle Confirmation</span>
                    </label>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-[#0D121F]/80 border-[#1E2638]' : 'bg-[#F8FAFC] border-slate-200'
                }`}>
                  <label className={`block text-[11px] font-medium font-jakarta ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Trading Strategy / Setup Model
                  </label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className={`w-full px-3 h-10 text-xs rounded-xl border font-medium focus:outline-none focus:border-sky-500 cursor-pointer ${
                      isDark ? 'bg-[#0B0F19] text-white border-[#1E2638] hover:border-slate-700' : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <option value="London / NY Sweep & 50-61.8% Fib POI">London / NY Sweep & 50-61.8% Fib POI</option>
                    <option value="London / NY Session Sweep">London / NY Session Sweep</option>
                    <option value="NY Impulse + 50-61.8% Fib Retracement">NY Impulse + 50-61.8% Fib Retracement</option>
                    <option value="SMC Order Block">SMC Order Block / POI Mitigation</option>
                    <option value="Liquidity Sweep">Liquidity Sweep / Raid</option>
                    <option value="Fair Value Gap (FVG)">Fair Value Gap (FVG)</option>
                    <option value="Break of Structure">Break of Structure (BOS)</option>
                    <option value="Breakout Retest">Breakout Retest</option>
                    <option value="Range Trading">Range Trading (High/Low)</option>
                  </select>
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-[#0D121F]/80 border-[#1E2638]' : 'bg-[#F8FAFC] border-slate-200'
                }`}>
                  <label className={`block text-[11px] font-medium font-jakarta ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Upload Setup Screenshot (Local File)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className={`w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold cursor-pointer ${
                      isDark 
                        ? 'text-slate-400 file:bg-[#1E2638] file:text-sky-400 hover:file:bg-slate-700' 
                        : 'text-slate-500 file:bg-slate-100 file:text-sky-600 hover:file:bg-slate-200'
                    }`}
                  />

                  {chartUrl && (
                    <div className={`mt-2 relative rounded-xl overflow-hidden border h-32 ${
                      isDark ? 'border-[#1E2638] bg-[#0B0F19]' : 'border-slate-200 bg-slate-100'
                    }`}>
                      <img src={chartUrl} alt="Setup Chart" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setChartUrl('')}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/80 text-white hover:bg-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-[#0D121F]/80 border-[#1E2638]' : 'bg-[#F8FAFC] border-slate-200'
                }`}>
                  <label className={`block text-[11px] font-medium font-jakarta ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Notes & Execution Rationale
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Enter setup observations, confluence reasons, emotions, or market context..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:border-sky-500 ${
                      isDark ? 'bg-[#0B0F19] text-white border-[#1E2638] hover:border-slate-700' : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Review & Save */}
            {step === 3 && (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border space-y-4 ${
                  isDark ? 'bg-[#0D121F]/80 border-[#1E2638]' : 'bg-[#F8FAFC] border-slate-200'
                }`}>
                  <div className={`flex items-center space-x-2 text-xs font-semibold font-jakarta ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Review Execution Summary</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0B0F19] border-[#1E2638]' : 'bg-white border-slate-200'}`}>
                      <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Instrument</span>
                      <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{symbol}</span>
                    </div>

                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0B0F19] border-[#1E2638]' : 'bg-white border-slate-200'}`}>
                      <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Direction & Type</span>
                      <span className={`font-bold text-sm ${direction === 'LONG' ? isDark ? 'text-emerald-400' : 'text-emerald-600' : isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                        {direction} • {orderType}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0B0F19] border-[#1E2638]' : 'bg-white border-slate-200'}`}>
                      <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Position Lots</span>
                      <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{orderLots} Lots</span>
                    </div>

                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0B0F19] border-[#1E2638]' : 'bg-white border-slate-200'}`}>
                      <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Entry Price</span>
                      <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{entryPrice}</span>
                    </div>

                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0B0F19] border-[#1E2638]' : 'bg-white border-slate-200'}`}>
                      <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Stop Loss</span>
                      <span className={`font-bold text-sm ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>{stopLoss || '--'}</span>
                    </div>

                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#0B0F19] border-[#1E2638]' : 'bg-white border-slate-200'}`}>
                      <span className={`text-[10px] block uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Take Profit</span>
                      <span className={`font-bold text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{targetPrice || '--'}</span>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                    isDark ? 'bg-[#0B0F19] border-[#1E2638]' : 'bg-white border-slate-200'
                  }`}>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Calculated Realized Net P&L:</span>
                    <span className={`text-base font-bold ${calculationSummary.realizedNetPnL >= 0 ? isDark ? 'text-emerald-400' : 'text-emerald-600' : isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                      {calculationSummary.realizedNetPnL >= 0 ? '+' : ''}{formatVal(calculationSummary.realizedNetPnL, currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Summary Ticket */}
          <div className="lg:col-span-4 space-y-4">
            <div className={`rounded-2xl p-4 sm:p-5 space-y-4 border ${
              isDark ? 'bg-[#0D121F]/90 border-[#1E2638]' : 'bg-[#F8FAFC] border-slate-200'
            }`}>
              
              {/* Trade Overview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`text-xs font-semibold font-jakarta ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Trade Overview
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider border ${
                    direction === 'LONG'
                      ? isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {direction} • {orderType.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Symbol</span>
                    <span className={`font-semibold flex items-center space-x-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <CryptoIcon symbol={symbol || 'BTC'} className="w-3.5 h-3.5" />
                      <span>{symbol || 'BTC/USDT'}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Exchange</span>
                    <span className={`font-semibold flex items-center space-x-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      <ExchangeLogo exchange={exchange} className="w-3.5 h-3.5" />
                      <span>{exchange}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Leverage</span>
                    <span className={`font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{leverage}x</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Order Size</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {orderLots ? `${orderLots} Lots (${calculationSummary.qty.toFixed(6)} ${getAssetTicker(symbol)})` : '--'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`h-px ${isDark ? 'bg-[#1E2638]/70' : 'bg-slate-200'}`} />

              {/* Risk & Reward / Realized Performance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`text-xs font-semibold font-jakarta ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {status === 'CLOSED' || calculationSummary.hasExit ? 'Realized P&L & Performance' : 'Risk & Reward'}
                  </div>
                  {status === 'CLOSED' && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                      (calculationSummary.hasExit || calculationSummary.hasManualRealized)
                        ? (calculationSummary.realizedNetPnL >= 0
                            ? isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200')
                        : isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                      {(calculationSummary.hasExit || calculationSummary.hasManualRealized)
                        ? (calculationSummary.realizedNetPnL >= 0 ? 'WIN • PROFIT' : 'LOSS')
                        : 'CLOSED'}
                    </span>
                  )}
                </div>

                {/* 3 Stat Cards */}
                <div className="grid grid-cols-3 gap-2">
                  {status === 'CLOSED' || calculationSummary.hasExit ? (
                    <>
                      {/* Card 1: Net Realized P&L */}
                      <div className={`p-2.5 rounded-xl border text-center ${
                        isDark ? 'bg-[#090D16] border-[#1E2638]' : 'bg-white border-slate-200 shadow-xs'
                      }`}>
                        <span className={`text-[10px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Net P&L ({currencySymbol})
                        </span>
                        <span className={`text-sm font-bold font-mono ${
                          (calculationSummary.hasExit || calculationSummary.hasManualRealized)
                            ? (calculationSummary.realizedNetPnL >= 0 
                                ? (isDark ? 'text-emerald-400' : 'text-emerald-600') 
                                : (isDark ? 'text-rose-400' : 'text-rose-600'))
                            : (isDark ? 'text-slate-400' : 'text-slate-500')
                        }`}>
                          {(calculationSummary.hasExit || calculationSummary.hasManualRealized)
                            ? `${calculationSummary.realizedNetPnL >= 0 ? '+' : ''}${formatVal(calculationSummary.realizedNetPnL, currency)}`
                            : '--'}
                        </span>
                      </div>

                      {/* Card 2: ROI % */}
                      <div className={`p-2.5 rounded-xl border text-center ${
                        isDark ? 'bg-[#090D16] border-[#1E2638]' : 'bg-white border-slate-200 shadow-xs'
                      }`}>
                        <span className={`text-[10px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          ROI %
                        </span>
                        <span className={`text-sm font-bold font-mono ${
                          (calculationSummary.hasExit || calculationSummary.hasManualRealized)
                            ? (calculationSummary.realizedRoiPercent >= 0 
                                ? (isDark ? 'text-emerald-400' : 'text-emerald-600') 
                                : (isDark ? 'text-rose-400' : 'text-rose-600'))
                            : (isDark ? 'text-slate-400' : 'text-slate-500')
                        }`}>
                          {(calculationSummary.hasExit || calculationSummary.hasManualRealized)
                            ? `${calculationSummary.realizedRoiPercent >= 0 ? '+' : ''}${calculationSummary.realizedRoiPercent.toFixed(2)}%`
                            : '--'}
                        </span>
                      </div>

                      {/* Card 3: Outcome */}
                      <div className={`p-2.5 rounded-xl border text-center ${
                        isDark ? 'bg-[#090D16] border-[#1E2638]' : 'bg-white border-slate-200 shadow-xs'
                      }`}>
                        <span className={`text-[10px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Result
                        </span>
                        <span className={`text-sm font-bold font-mono uppercase ${
                          (calculationSummary.hasExit || calculationSummary.hasManualRealized)
                            ? (calculationSummary.realizedNetPnL >= 0 
                                ? (isDark ? 'text-emerald-400' : 'text-emerald-600') 
                                : (isDark ? 'text-rose-400' : 'text-rose-600'))
                            : (isDark ? 'text-sky-400' : 'text-sky-600')
                        }`}>
                          {(calculationSummary.hasExit || calculationSummary.hasManualRealized)
                            ? (calculationSummary.realizedNetPnL >= 0 ? 'WIN' : 'LOSS')
                            : (calculationSummary.rrRatioStr !== '--' ? calculationSummary.rrRatioStr : 'CLOSED')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Card 1: Risk */}
                      <div className={`p-2.5 rounded-xl border text-center ${
                        isDark ? 'bg-[#090D16] border-[#1E2638]' : 'bg-white border-slate-200 shadow-xs'
                      }`}>
                        <span className={`text-[10px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Risk ({currencySymbol})</span>
                        <span className={`text-sm font-bold font-mono ${
                          calculationSummary.isSLInProfit
                            ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                            : (isDark ? 'text-rose-400' : 'text-rose-600')
                        }`}>
                          {calculationSummary.hasSL 
                            ? (calculationSummary.isSLInProfit 
                                ? `+${formatVal(calculationSummary.netLossINR, currency)}` 
                                : formatVal(calculationSummary.netLossINR, currency))
                            : (targetRiskINR ? formatVal(targetRiskINR, currency) : '--')}
                        </span>
                      </div>

                      {/* Card 2: Reward */}
                      <div className={`p-2.5 rounded-xl border text-center ${
                        isDark ? 'bg-[#090D16] border-[#1E2638]' : 'bg-white border-slate-200 shadow-xs'
                      }`}>
                        <span className={`text-[10px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Reward ({currencySymbol})</span>
                        <span className={`text-sm font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {calculationSummary.hasTP ? `+${formatVal(calculationSummary.grossProfitINR, currency)}` : '--'}
                        </span>
                      </div>

                      {/* Card 3: R:R */}
                      <div className={`p-2.5 rounded-xl border text-center ${
                        isDark ? 'bg-[#090D16] border-[#1E2638]' : 'bg-white border-slate-200 shadow-xs'
                      }`}>
                        <span className={`text-[10px] font-medium block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>R:R</span>
                        <span className={`text-sm font-bold font-mono ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
                          {calculationSummary.rrRatioStr}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Level Detail Breakdown */}
                <div className="space-y-1.5 text-xs font-mono pt-1">
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>• Entry</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {entryPrice ? Number(entryPrice).toLocaleString() : '--'}
                    </span>
                  </div>

                  {exitPrice && (
                    <div className="flex items-center justify-between">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>• Actual Exit</span>
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {Number(exitPrice).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>• Stop Loss</span>
                    <span className={`font-semibold ${
                      calculationSummary.isSLInProfit
                        ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                        : (isDark ? 'text-rose-400' : 'text-rose-600')
                    }`}>
                      {stopLoss ? `${Number(stopLoss).toLocaleString()} (${entryPrice && stopLoss ? (((parseFloat(stopLoss) - parseFloat(entryPrice)) / parseFloat(entryPrice)) * 100).toFixed(2) : '0.00'}%)` : '--'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>• Take Profit</span>
                    <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {targetPrice ? `${Number(targetPrice).toLocaleString()} (${entryPrice && targetPrice ? ((((parseFloat(targetPrice) - parseFloat(entryPrice)) / parseFloat(entryPrice)) * 100) >= 0 ? '+' : '') + (((parseFloat(targetPrice) - parseFloat(entryPrice)) / parseFloat(entryPrice)) * 100).toFixed(2) : '0.00'}%)` : '--'}
                    </span>
                  </div>

                  <div className={`flex items-center justify-between pt-1 border-t ${
                    isDark ? 'border-[#1E2638]/60' : 'border-slate-200'
                  }`}>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                      {status === 'CLOSED' || calculationSummary.hasExit ? `• Realized P&L (${currencySymbol})` : `• Est. P&L (${currencySymbol})`}
                    </span>
                    <span className={`font-bold ${
                      (status === 'CLOSED' || calculationSummary.hasExit)
                        ? ((calculationSummary.hasExit || calculationSummary.hasManualRealized)
                            ? (calculationSummary.realizedNetPnL >= 0 
                                ? (isDark ? 'text-emerald-400' : 'text-emerald-600') 
                                : (isDark ? 'text-rose-400' : 'text-rose-600'))
                            : (isDark ? 'text-slate-400' : 'text-slate-500'))
                        : (calculationSummary.hasTP
                            ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                            : (calculationSummary.hasExit
                                ? (calculationSummary.realizedNetPnL >= 0 
                                    ? (isDark ? 'text-emerald-400' : 'text-emerald-600') 
                                    : (isDark ? 'text-rose-400' : 'text-rose-600'))
                                : (isDark ? 'text-slate-400' : 'text-slate-500')))
                    }`}>
                      {(status === 'CLOSED' || calculationSummary.hasExit)
                        ? ((calculationSummary.hasExit || calculationSummary.hasManualRealized)
                            ? `${calculationSummary.realizedNetPnL >= 0 ? '+' : ''}${formatCurrency(calculationSummary.realizedNetPnL, currency)}`
                            : '--')
                        : (calculationSummary.hasTP
                            ? `+${formatCurrency(calculationSummary.grossProfitINR, currency)}`
                            : (calculationSummary.hasExit
                                ? `${calculationSummary.realizedNetPnL >= 0 ? '+' : ''}${formatCurrency(calculationSummary.realizedNetPnL, currency)}`
                                : '--'))}
                    </span>
                  </div>
                </div>

                {/* Visual Level Gauge / Gradient Slider */}
                <div className="pt-2">
                  <div className="relative h-1.5 rounded-full bg-gradient-to-r from-rose-500 via-sky-400 to-emerald-500 my-4">
                    <div className="absolute left-0 -top-1 w-3.5 h-3.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
                    <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-3.5 h-3.5 rounded-full bg-sky-400 ring-4 ring-sky-500/20" />
                    <div className="absolute right-0 -top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                  </div>

                  {/* Marker Labels */}
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <div className="text-left">
                      <span className={`block font-semibold ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>SL</span>
                      <span className={isDark ? 'text-rose-400' : 'text-rose-600'}>{stopLoss ? Number(stopLoss).toLocaleString() : '--'}</span>
                    </div>

                    <div className="text-center">
                      <span className={`block font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Entry</span>
                      <span className={isDark ? 'text-white' : 'text-slate-900'}>{entryPrice ? Number(entryPrice).toLocaleString() : '--'}</span>
                    </div>

                    <div className="text-right">
                      <span className={`block font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>TP</span>
                      <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>{targetPrice ? Number(targetPrice).toLocaleString() : '--'}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className={`pt-3 border-t flex items-center justify-between ${
          isDark ? 'border-[#1E2638]' : 'border-slate-200'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl border font-medium text-xs transition cursor-pointer ${
              isDark 
                ? 'bg-[#111724] hover:bg-[#151D30] border-[#1E2638] hover:border-slate-700 text-slate-400 hover:text-white' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={handleSaveDraft}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border font-medium text-xs transition cursor-pointer ${
                isDark 
                  ? 'bg-[#111724] hover:bg-[#151D30] border-[#1E2638] hover:border-slate-700 text-slate-300 hover:text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Save Draft</span>
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition shadow-sm cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveInternal}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition shadow-sm cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Trade</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
