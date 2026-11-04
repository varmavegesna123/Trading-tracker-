import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, TrendingDown, ArrowUpRight, Clock } from 'lucide-react';
import { formatCurrency, calculateTradePnL } from '../utils/formatters';

export function CalendarView({ trades = [], currency = 'INR', onEditTrade }) {
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDayTrades, setSelectedDayTrades] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState(null);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // Compute daily net P&L map for current month
  const dailyPnLMap = useMemo(() => {
    const map = {};
    trades.forEach(t => {
      if (t && t.status === 'CLOSED' && t.exitDate && typeof t.exitDate === 'string') {
        const dateKey = t.exitDate.slice(0, 10);
        const { pnlAmount } = calculateTradePnL(t);

        if (!map[dateKey]) {
          map[dateKey] = { netPnL: 0, tradesCount: 0, list: [] };
        }
        map[dateKey].netPnL += pnlAmount;
        map[dateKey].tradesCount += 1;
        map[dateKey].list.push(t);
      }
    });
    return map;
  }, [trades]);

  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ empty: true, id: `empty-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;
      const dayData = dailyPnLMap[dateKey] || { netPnL: 0, tradesCount: 0, list: [] };

      cells.push({
        empty: false,
        day,
        dateKey,
        ...dayData
      });
    }

    return cells;
  }, [year, month, dailyPnLMap]);

  const monthLabel = currentMonthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      
      {/* Calendar Header & Month Navigation */}
      <div className="p-6 rounded-2xl glass-box flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#38BDF8] font-jakarta">
            Calendar P&L & Date Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual daily trading performance matrix with interactive small date boxes.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-[#0B0F19] p-1.5 rounded-xl border border-[#1E2638]">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-300 hover:text-[#38BDF8] transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-extrabold text-white px-2 font-mono">
            {monthLabel}
          </span>

          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-slate-300 hover:text-[#38BDF8] transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main 7-Column Small Glass Date Box Grid */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-box space-y-4">
          
          {/* Day Names Row */}
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Small Glass Date Boxes with Interactive Cursor Motion Hover Response */}
          <div className="grid grid-cols-7 gap-2">
            {calendarGrid.map((cell) => {
              if (cell.empty) {
                return <div key={cell.id} className="h-16 rounded-xl bg-transparent opacity-20" />;
              }

              const hasTrades = cell.tradesCount > 0;
              const isProfit = cell.netPnL >= 0;
              const isSelected = selectedDateStr === cell.dateKey;
              const isToday = cell.dateKey === new Date().toISOString().slice(0, 10);

              return (
                <button
                  key={cell.dateKey}
                  onClick={() => {
                    setSelectedDateStr(cell.dateKey);
                    setSelectedDayTrades(cell.list);
                  }}
                  className={`h-16 p-2 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 ease-out transform cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#0284C7] text-white dark:bg-[#38BDF8] dark:text-slate-950 ring-2 ring-sky-400 scale-105 z-20 shadow-lg shadow-sky-500/40 border-[#0284C7] dark:border-[#38BDF8]'
                      : isToday
                      ? 'border-2 border-[#0284C7] dark:border-[#38BDF8] ring-2 ring-[#0284C7]/30 dark:ring-[#38BDF8]/40 bg-[#0284C7]/10 dark:bg-[#38BDF8]/15 z-10 shadow-md shadow-sky-500/25 font-bold'
                      : hasTrades
                      ? isProfit
                        ? 'glass-box-emerald text-emerald-400 border-emerald-500/40 bg-emerald-950/20'
                        : 'glass-box-rose text-rose-400 border-rose-500/40 bg-rose-950/20'
                      : 'glass-box text-slate-800 dark:text-slate-300 hover:scale-105 hover:-translate-y-1 hover:border-[#0284C7] dark:hover:border-[#38BDF8] hover:shadow-lg hover:shadow-sky-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono flex items-center space-x-1">
                      <span className={
                        isSelected
                          ? 'text-white dark:text-slate-950 font-black'
                          : isToday
                          ? 'text-[#0284C7] dark:text-[#38BDF8] font-black'
                          : 'text-slate-800 dark:text-slate-200 font-bold'
                      }>{cell.day}</span>
                      {isToday && (
                        <span className="text-[8px] font-black uppercase text-[#0284C7] bg-[#0284C7]/15 dark:text-[#38BDF8] dark:bg-[#38BDF8]/20 px-1 py-0.5 rounded font-sans">
                          Today
                        </span>
                      )}
                    </span>
                    {hasTrades && (
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isProfit ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-600 dark:text-rose-300'
                      }`}>
                        {cell.tradesCount}t
                      </span>
                    )}
                  </div>

                  {hasTrades ? (
                    <div>
                      <span className={`text-[11px] font-black font-mono block tracking-tight truncate ${
                        isSelected
                          ? (isProfit ? 'text-emerald-100 dark:text-emerald-950' : 'text-rose-100 dark:text-rose-950')
                          : (isProfit ? 'text-[#10B981]' : 'text-[#EF4444]')
                      }`}>
                        {isProfit ? '+' : ''}{formatCurrency(cell.netPnL, currency)}
                      </span>
                    </div>
                  ) : (
                    <span className={`text-[10px] font-mono ${
                      isSelected ? 'text-white/70 dark:text-slate-900/70' : 'text-slate-400 dark:text-slate-500 opacity-60'
                    }`}>-</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector Sidebar */}
        <div className="p-6 rounded-2xl glass-box flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-jakarta mb-1">
              Daily Trade Inspector
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {selectedDateStr ? `Executions on ${selectedDateStr}` : 'Hover & click any small date box to inspect activity'}
            </p>

            {selectedDayTrades && selectedDayTrades.length > 0 ? (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {selectedDayTrades.map(t => {
                  const { pnlAmount } = calculateTradePnL(t);
                  const isWin = pnlAmount >= 0;
                  return (
                    <div key={t.id} className={`p-3 rounded-xl border transition-all ${
                      isWin ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white uppercase font-mono">
                          {t.symbol}
                        </span>
                        <span className={`text-xs font-mono font-black ${
                          isWin ? 'text-[#10B981]' : 'text-[#EF4444]'
                        }`}>
                          {isWin ? '+' : ''}{formatCurrency(pnlAmount, currency)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                        <span>{t.direction} • {t.strategy || 'Trade'}</span>
                        <span>{t.quantity} qty</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                {selectedDateStr ? 'No trades recorded on this date.' : 'Click a date box on the left grid.'}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
