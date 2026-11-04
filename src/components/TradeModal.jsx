import React, { useState, useEffect, useMemo } from 'react';
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
  Upload
} from 'lucide-react';
import { CryptoIcon, BINANCE_POPULAR_PAIRS } from '../utils/cryptoIcons';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';
import { USD_TO_INR_RATE } from '../utils/currency';

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
        setH1Bias(Boolean(initialConfluences.h1Bias));
        setM15Structure(Boolean(initialConfluences.m15Structure));
        setM5EntryPoi(Boolean(initialConfluences.m5EntryPoi));
        setM1BosChoch(Boolean(initialConfluences.m1BosChoch));
        setLtfTrigger(initialConfluences.ltfTrigger || 'CHOCH');
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

                {/* Row 2: Instrument / Symbol, Exchange, Execution Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Instrument / Symbol */}
                  <div>
                    <label className={`block text-[11px] font-medium mb-1.5 font-jakarta ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Instrument / Symbol *
                    </label>
                    <div className={`relative flex items-center rounded-xl border px-3 h-10 transition ${
                      isDark ? 'bg-[#0E1320] border-[#1E2638] hover:border-slate-700 focus-within:border-sky-500' : 'bg-white border-slate-200 hover:border-slate-300 focus-within:border-sky-500'
                    }`}>
                      <CryptoIcon symbol={symbol || 'BTC'} className="w-4 h-4 mr-2 shrink-0" />
                      <input
                        type="text"
                        list="trademodal-binance-pairs"
                        placeholder="BTC/USDT"
                        value={symbol}
                        onChange={(e) => {
                          setSymbol(e.target.value);
                          const upper = (e.target.value || '').toUpperCase();
                          if (upper.includes('BTC')) setContractSize('0.001');
                          else if (upper.includes('ETH')) setContractSize('0.01');
                          else if (upper.includes('SOL')) setContractSize('0.1');
                          else if (upper.includes('XAU') || upper.includes('GOLD')) setContractSize('0.01');
                          else if (upper.includes('AVAX')) setContractSize('0.1');
                          else if (upper.includes('ALV')) setContractSize('100');
                          else if (upper.includes('ALGO')) setContractSize('10');
                        }}
                        className={`w-full bg-transparent text-xs font-bold focus:outline-none font-mono uppercase ${
                          isDark ? 'text-white placeholder:text-slate-600' : 'text-slate-900 placeholder:text-slate-400'
                        }`}
                        required
                      />
                      <ChevronDown className={`w-3.5 h-3.5 shrink-0 pointer-events-none ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`} />
                      <datalist id="trademodal-binance-pairs">
                        {BINANCE_POPULAR_PAIRS.map(p => (
                          <option key={p.symbol} value={p.symbol}>{p.name + ' (' + p.coin + ')'}</option>
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Exchange */}
                  <div>
                    <label className={`block text-[11px] font-medium mb-1.5 font-jakarta ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      Exchange
                    </label>
                    <div className={`relative flex items-center rounded-xl border px-3 h-10 transition ${
                      isDark ? 'bg-[#0E1320] border-[#1E2638] hover:border-slate-700 focus-within:border-sky-500' : 'bg-white border-slate-200 hover:border-slate-300 focus-within:border-sky-500'
                    }`}>
                      <span className="text-sky-500 text-xs mr-2 select-none">❖</span>
                      <select
                        value={exchange}
                        onChange={(e) => setExchange(e.target.value)}
                        className={`w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer appearance-none ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        <option value="Delta Exchange" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>Delta Exchange</option>
                        <option value="XAUUSD" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>XAUUSD</option>
                        <option value="Binance" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>Binance</option>
                        <option value="Bybit" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>Bybit</option>
                        <option value="OKX" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>OKX</option>
                        <option value="Coinbase" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>Coinbase</option>
                        <option value="NSE" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>NSE (India)</option>
                        <option value="Forex" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>Forex</option>
                      </select>
                      <ChevronDown className={`w-3.5 h-3.5 shrink-0 pointer-events-none ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`} />
                    </div>
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
                      <label className={`block text-[11px] font-medium mb-1 font-jakarta ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        Leverage
                      </label>
                      <div className={`relative flex items-center rounded-xl border px-3 h-10 transition ${
                        isDark ? 'bg-[#0B0F19] border-[#1E2638] focus-within:border-sky-500 hover:border-slate-700' : 'bg-white border-slate-200 focus-within:border-sky-500 hover:border-slate-300'
                      }`}>
                        <select
                          value={leverage}
                          onChange={(e) => setLeverage(e.target.value)}
                          className={`w-full bg-transparent text-xs font-medium focus:outline-none cursor-pointer appearance-none ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          <option value="1" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>1x</option>
                          <option value="5" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>5x</option>
                          <option value="10" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>10x</option>
                          <option value="20" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>20x</option>
                          <option value="25" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>25x</option>
                          <option value="50" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>50x</option>
                          <option value="75" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>75x</option>
                          <option value="100" className={isDark ? 'bg-[#0B0F19] text-white' : 'bg-white text-slate-900'}>100x</option>
                        </select>
                        <ChevronDown className={`w-3.5 h-3.5 shrink-0 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
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
                      Contract: <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>1 Lot = {contractSize} {symbol.split('/')[0] || 'BTC'}</span> · 1 USDT = <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>₹{usdtRate}</span>
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
                          = {calculationSummary.qty.toFixed(6)} {symbol.split('/')[0] || 'BTC'}
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
                  <div className={`text-xs font-semibold font-jakarta ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    SMC Confluence Checklist
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      isDark ? 'bg-[#0B0F19] border-[#1E2638] hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={h1Bias}
                        onChange={(e) => setH1Bias(e.target.checked)}
                        className="rounded accent-sky-500 cursor-pointer"
                      />
                      <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>1H HTF Directional Bias</span>
                    </label>

                    <label className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      isDark ? 'bg-[#0B0F19] border-[#1E2638] hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={m15Structure}
                        onChange={(e) => setM15Structure(e.target.checked)}
                        className="rounded accent-sky-500 cursor-pointer"
                      />
                      <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>15m Market Structure Shift / FVG</span>
                    </label>

                    <label className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      isDark ? 'bg-[#0B0F19] border-[#1E2638] hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={m5EntryPoi}
                        onChange={(e) => setM5EntryPoi(e.target.checked)}
                        className="rounded accent-sky-500 cursor-pointer"
                      />
                      <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>5m Entry POI / Mitigation</span>
                    </label>

                    <label className={`flex items-center space-x-2.5 p-3 rounded-xl border cursor-pointer transition ${
                      isDark ? 'bg-[#0B0F19] border-[#1E2638] hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={m1BosChoch}
                        onChange={(e) => setM1BosChoch(e.target.checked)}
                        className="rounded accent-sky-500 cursor-pointer"
                      />
                      <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>1m LTF Trigger (CHOCH / BOS)</span>
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
                    <option value="SMC Order Block">SMC Order Block</option>
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
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{exchange}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Leverage</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{leverage}x</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Order Size</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {orderLots ? `${orderLots} Lots (${calculationSummary.qty.toFixed(6)} ${symbol.split('/')[0] || 'BTC'})` : '--'}
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
