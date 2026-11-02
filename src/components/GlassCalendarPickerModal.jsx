import React, { useState, useMemo } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { calculateTradePnL } from '../utils/formatters';

export function GlassCalendarPickerModal({ 
  isOpen, 
  onClose, 
  onSelectRange, 
  trades = [] 
}) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  const todayKey = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Map trades to dates for PnL indicators
  const tradePnLByDate = useMemo(() => {
    const map = {};
    trades.forEach(t => {
      if (t && t.entryDate && typeof t.entryDate === 'string') {
        const dateKey = t.entryDate.slice(0, 10);
        const { pnlAmount } = calculateTradePnL(t);
        if (!map[dateKey]) map[dateKey] = 0;
        map[dateKey] += pnlAmount;
      }
    });
    return map;
  }, [trades]);

  if (!isOpen) return null;

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Month grid calculation
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarDays.push({ day, isCurrentMonth: false, fullDate: null });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const fullDate = `${currentYear}-${monthStr}-${dayStr}`;
    calendarDays.push({ day: d, isCurrentMonth: true, fullDate });
  }

  // Next month leading days to complete 42 boxes (6 rows x 7 days)
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({ day: d, isCurrentMonth: false, fullDate: null });
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDateClick = (fullDate) => {
    if (!fullDate) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(fullDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (new Date(fullDate) >= new Date(startDate)) {
        setEndDate(fullDate);
      } else {
        setStartDate(fullDate);
        setEndDate(null);
      }
    }
  };

  const isSelected = (fullDate) => fullDate === startDate || fullDate === endDate;
  const isInRange = (fullDate) => {
    if (!startDate || !endDate || !fullDate) return false;
    const current = new Date(fullDate);
    return current >= new Date(startDate) && current <= new Date(endDate);
  };

  const handleApply = () => {
    if (onSelectRange) {
      onSelectRange({ startDate, endDate: endDate || startDate });
    }
    onClose();
  };

  const handleJumpToToday = () => {
    setViewDate(new Date());
    setStartDate(todayKey);
    setEndDate(todayKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl font-sans overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0B0F19] rounded-3xl max-w-md w-full border border-[#1E2638] shadow-2xl overflow-hidden text-slate-100 p-5 sm:p-6 space-y-5 transform transition-all">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[#1E2638] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#38BDF8]/20 border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8]">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white font-jakarta">
                Select Date Range
              </h2>
              <p className="text-[11px] text-slate-400">
                Filter trades & analytics by date
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#111726] border border-[#1E2638] text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Month & Year Navigation Header */}
        <div className="flex items-center justify-between bg-[#111726] p-2.5 rounded-2xl border border-[#1E2638]">
          <span className="text-sm font-extrabold text-white font-jakarta px-2">
            {monthName}
          </span>

          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-[#0B0F19] border border-[#1E2638] text-slate-300 hover:text-[#38BDF8] hover:border-[#38BDF8]/50 transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-[#0B0F19] border border-[#1E2638] text-slate-300 hover:text-[#38BDF8] hover:border-[#38BDF8]/50 transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-slate-400 uppercase font-mono">
          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
        </div>

        {/* 7x6 SMALL GLASS DATE BOX GRID WITH TODAY COLORED HIGHLIGHT */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((item, idx) => {
            const isSel = isSelected(item.fullDate);
            const isRng = isInRange(item.fullDate);
            const isToday = item.fullDate === todayKey;
            const hasTradePnL = item.fullDate ? tradePnLByDate[item.fullDate] : undefined;

            return (
              <button
                key={idx}
                type="button"
                disabled={!item.isCurrentMonth}
                onClick={() => handleDateClick(item.fullDate)}
                className={`h-10 rounded-xl text-xs font-mono font-bold relative flex items-center justify-center transition-all duration-200 ease-out transform cursor-pointer ${
                  !item.isCurrentMonth
                    ? 'text-slate-600 opacity-25 cursor-not-allowed bg-transparent border-transparent'
                    : isSel
                    ? 'bg-[#38BDF8] text-white shadow-lg shadow-sky-500/40 ring-2 ring-sky-300 scale-105 z-20 font-black border-[#38BDF8]'
                    : isRng
                    ? 'bg-[#38BDF8]/25 text-[#38BDF8] border border-[#38BDF8]/50 z-10'
                    : isToday
                    ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-2 border-[#38BDF8] ring-2 ring-[#38BDF8]/40 shadow-md shadow-sky-500/30 font-extrabold'
                    : 'glass-box text-slate-200 hover:scale-110 hover:-translate-y-0.5 hover:border-[#38BDF8] hover:shadow-lg hover:shadow-sky-500/20'
                }`}
              >
                <span>{item.day}</span>

                {/* Today's indicator dot */}
                {isToday && !isSel && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] absolute top-1 right-1 animate-pulse" />
                )}

                {/* Trade PnL Indicator Dot */}
                {hasTradePnL !== undefined && (
                  <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                    hasTradePnL >= 0 ? 'bg-[#10B981]' : 'bg-rose-500'
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions Bar: Clear, Today, and Apply Range */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1E2638]">
          <button
            type="button"
            onClick={() => { setStartDate(null); setEndDate(null); }}
            className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition flex items-center space-x-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-3.5 py-2 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#38BDF8] text-xs font-extrabold hover:bg-[#38BDF8]/30 transition flex items-center space-x-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-gradient-to-r from-[#38BDF8] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply</span>
          </button>
        </div>

      </div>
    </div>
  );
}
