import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Check, 
  Zap, 
  Image as ImageIcon,
  Trash2,
  Calendar,
  CheckSquare,
  Coins,
  Calculator,
  Target,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Wallet,
  Scale,
  Sliders,
  Percent,
  ShieldAlert,
  Layers,
  Crosshair,
  Activity
} from 'lucide-react';

function formatINR(val) {
  const num = Number(val);
  if (isNaN(num)) return '₹0';
  const isNegative = num < 0;
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
  return `${isNegative ? '-' : ''}₹${formatted}`;
}
import { CryptoIcon, BINANCE_POPULAR_PAIRS } from '../utils/cryptoIcons';
import { formatCurrency, formatPercent, calculateTradePnL, calculateRiskReward } from '../utils/formatters';

function formatDateDisplay(dateStr) {
  if (!dateStr) return 'Select Date & Time';
  const parts = dateStr.split('T');
  const d = parts[0] || dateStr;
  const time = parts[1] || '10:00';
  const [y, m, day] = d.split('-');
  if (!y || !m || !day) return dateStr;
  return `${day} - ${m} - ${y} ${time.slice(0, 5)}`;
}

function CustomGlassDateTimePicker({ value, onChange, onClose }) {
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
    <div className="absolute right-0 top-full mt-2 z-50 p-4 bg-[#0B0F19] rounded-2xl border border-[#1E2638] shadow-2xl space-y-3 w-72 font-sans text-slate-100">
      <div className="flex items-center justify-between text-xs font-bold text-white font-jakarta pb-2 border-b border-[#1E2638]">
        <button
          type="button"
          onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))}
          className="p-1 rounded-lg hover:bg-[#1E2638] text-slate-400 hover:text-white transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-mono text-[#38BDF8] font-extrabold">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))}
          className="p-1 rounded-lg hover:bg-[#1E2638] text-slate-400 hover:text-white transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 uppercase font-mono">
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
                  ? 'bg-[#38BDF8] text-white font-extrabold shadow-md shadow-sky-500/30 ring-2 ring-sky-400/50'
                  : isToday
                  ? 'bg-[#1E2638] text-[#38BDF8] font-bold border border-[#38BDF8]/40'
                  : 'bg-[#111726] text-slate-300 hover:bg-[#1E2638]'
              }`}
            >
              {cell.dayNum}
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-[#1E2638] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400 text-[10px] font-bold uppercase font-jakarta">Time:</span>
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
            className="w-11 py-1 bg-[#111726] text-white text-center text-xs rounded-lg border border-[#1E2638] font-bold font-mono focus:outline-none focus:border-[#38BDF8]"
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
            className="w-11 py-1 bg-[#111726] text-white text-center text-xs rounded-lg border border-[#1E2638] font-bold font-mono focus:outline-none focus:border-[#38BDF8]"
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1 bg-gradient-to-r from-[#38BDF8] to-[#0284C7] text-white text-[11px] font-extrabold rounded-lg shadow-sm hover:from-[#0284C7] hover:to-[#0369A1] transition cursor-pointer"
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
  currency = 'USD' 
}) {
  const [step, setStep] = useState(1);

  // Form State
  const [tradeType, setTradeType] = useState('Intraday');
  const [orderType, setOrderType] = useState('Limit');
  const [direction, setDirection] = useState('LONG');
  const [market, setMarket] = useState('Crypto');
  const [exchange, setExchange] = useState('Delta Exchange');
  const [symbol, setSymbol] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 16));
  const [showEntryDatePicker, setShowEntryDatePicker] = useState(false);
  const [entryPrice, setEntryPrice] = useState('');
  const [quantity, setQuantity] = useState('0.014');
  
  // Delta Exchange Contract & Lot Sizing State
  const [contractSize, setContractSize] = useState('0.001');
  const [orderLots, setOrderLots] = useState('14');
  const [targetRiskINR, setTargetRiskINR] = useState('100');
  const [hasBracketOrder, setHasBracketOrder] = useState(true);

  // Capital & Leverage State
  const [startingCapital, setStartingCapital] = useState('2000');
  const [leverage, setLeverage] = useState('25');
  const [marginUsed, setMarginUsed] = useState('2000');
  
  // Execution Levels & Risk Management State
  const [status, setStatus] = useState('CLOSED');
  const [exitPrice, setExitPrice] = useState('');
  const [manualRealizedPnL, setManualRealizedPnL] = useState('');
  const [exitDate, setExitDate] = useState(new Date().toISOString().slice(0, 10));
  const [stopLoss, setStopLoss] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [tradingFees, setTradingFees] = useState('');
  const [fundingFees, setFundingFees] = useState('');
  const [usdtRate, setUsdtRate] = useState('90');
  const [isManualQuantity, setIsManualQuantity] = useState(false);
  const [strategy, setStrategy] = useState('SMC Order Block');
  const [notes, setNotes] = useState('');
  const [chartUrl, setChartUrl] = useState('');

  // SMC Confluences
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
      setSymbol(tradeToEdit.symbol || '');
      setEntryDate(tradeToEdit.entryDate ? tradeToEdit.entryDate.slice(0, 16) : new Date().toISOString().slice(0, 16));
      setEntryPrice(tradeToEdit.entryPrice !== undefined && tradeToEdit.entryPrice !== null ? String(tradeToEdit.entryPrice) : '');
      setQuantity(tradeToEdit.quantity !== undefined && tradeToEdit.quantity !== null ? String(tradeToEdit.quantity) : '');
      setStatus(tradeToEdit.status || 'CLOSED');
      setExitPrice(tradeToEdit.exitPrice !== undefined && tradeToEdit.exitPrice !== null ? String(tradeToEdit.exitPrice) : '');
      setManualRealizedPnL(tradeToEdit.actualRealizedPnL !== undefined && tradeToEdit.actualRealizedPnL !== null ? String(tradeToEdit.actualRealizedPnL) : '');
      setExitDate(tradeToEdit.exitDate || new Date().toISOString().slice(0, 10));
      setStopLoss(tradeToEdit.stopLoss !== undefined && tradeToEdit.stopLoss !== null ? String(tradeToEdit.stopLoss) : '');
      setTargetPrice(
        tradeToEdit.targetPrice !== undefined && tradeToEdit.targetPrice !== null ? String(tradeToEdit.targetPrice) :
        tradeToEdit.takeProfit !== undefined && tradeToEdit.takeProfit !== null ? String(tradeToEdit.takeProfit) : ''
      );
      setTradingFees(tradeToEdit.tradingFees !== undefined && tradeToEdit.tradingFees !== null ? String(tradeToEdit.tradingFees) : '');
      setFundingFees(tradeToEdit.fundingFees !== undefined && tradeToEdit.fundingFees !== null ? String(tradeToEdit.fundingFees) : '');
      setUsdtRate(tradeToEdit.usdtRate !== undefined && tradeToEdit.usdtRate !== null ? String(tradeToEdit.usdtRate) : '90');
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
        tradeToEdit.capital !== undefined && tradeToEdit.capital !== null ? String(tradeToEdit.capital) : '2000'
      );
      setLeverage(
        tradeToEdit.leverage !== undefined && tradeToEdit.leverage !== null ? String(tradeToEdit.leverage) : '25'
      );
      setMarginUsed(
        tradeToEdit.marginUsed !== undefined && tradeToEdit.marginUsed !== null ? String(tradeToEdit.marginUsed) :
        tradeToEdit.margin !== undefined && tradeToEdit.margin !== null ? String(tradeToEdit.margin) : '2000'
      );
      setContractSize(
        tradeToEdit.contractSize !== undefined && tradeToEdit.contractSize !== null ? String(tradeToEdit.contractSize) : '0.001'
      );
      setOrderLots(
        tradeToEdit.lots !== undefined && tradeToEdit.lots !== null ? String(tradeToEdit.lots) :
        tradeToEdit.orderLots !== undefined && tradeToEdit.orderLots !== null ? String(tradeToEdit.orderLots) :
        tradeToEdit.contractQuantity !== undefined && tradeToEdit.contractQuantity !== null ? String(tradeToEdit.contractQuantity) : '14'
      );
      setTargetRiskINR(
        tradeToEdit.targetRisk !== undefined && tradeToEdit.targetRisk !== null ? String(tradeToEdit.targetRisk) : '100'
      );
      setHasBracketOrder(Boolean(tradeToEdit.hasBracketOrder ?? (tradeToEdit.stopLoss || tradeToEdit.targetPrice)));
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
    setTradeType('Intraday');
    setOrderType('Limit');
    setDirection('LONG');
    setMarket('Crypto');
    setExchange('Delta Exchange');
    setSymbol('');
    setEntryDate(new Date().toISOString().slice(0, 16));
    setEntryPrice('');
    setQuantity('0.014');
    setStartingCapital('2000');
    setLeverage('25');
    setMarginUsed('2000');
    setContractSize('0.001');
    setOrderLots('14');
    setTargetRiskINR('100');
    setHasBracketOrder(true);
    setStatus('CLOSED');
    setExitPrice('');
    setManualRealizedPnL('');
    setExitDate(new Date().toISOString().slice(0, 10));
    setStopLoss('');
    setTargetPrice('');
    setTradingFees('');
    setFundingFees('');
    setUsdtRate('90');
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

  // Synchronize Lot size to Coin Quantity (Delta Exchange Contract sizing)
  useEffect(() => {
    if (isManualQuantity) return;
    const lots = parseFloat(orderLots);
    const cSize = parseFloat(contractSize) || 0.001;
    if (!isNaN(lots) && lots >= 0 && cSize > 0) {
      const derivedCoinQty = parseFloat((lots * cSize).toFixed(6));
      setQuantity(String(derivedCoinQty));
    }
  }, [orderLots, contractSize, isManualQuantity]);

  // Position Sizing % Shortcuts (10%, 25%, 50%, 75%, 100%)
  const handlePercentageMargin = (pct) => {
    const cap = parseFloat(startingCapital) || 2000;
    const margin = (cap * (pct / 100)).toFixed(0);
    setMarginUsed(margin);

    const lev = parseFloat(leverage) || 25;
    const entry = parseFloat(entryPrice) || 0;
    const cSize = parseFloat(contractSize) || 0.001;
    const rate = parseFloat(usdtRate) || 90;
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

  // Dynamic Risk Sizer: 1-click apply recommended lots based on target risk
  const handleApplyRiskLots = (calculatedLots) => {
    if (calculatedLots > 0) {
      setOrderLots(String(calculatedLots));
      const cSize = parseFloat(contractSize) || 0.001;
      setQuantity(parseFloat((calculatedLots * cSize).toFixed(6)).toString());
      setIsManualQuantity(false);
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
    const rate = parseFloat(usdtRate) || 90;
    const isLong = direction === 'LONG';

    // 1. Capacity & Position Notional
    const capacityNotionalINR = margin * lev;
    const availableBalance = cap - margin;

    // Actual Notional based on Lots & Contract Size:
    // Position Notional = Number of Lots × Contract Size × Entry Price
    const lotsNotionalUSDT = qty * entry; // = lots * cSize * entry
    const lotsNotionalINR = lotsNotionalUSDT * rate;
    const requiredMarginINR = lev > 0 ? (lotsNotionalINR / lev) : 0;

    // 2. Stop Loss & Take Profit Price Distances
    let slDiff = 0;
    let hasSL = false;
    if (entry > 0 && sl > 0) {
      slDiff = isLong ? (entry - sl) : (sl - entry);
      hasSL = slDiff > 0;
    }

    let tpDiff = 0;
    let hasTP = false;
    if (entry > 0 && tp > 0) {
      tpDiff = isLong ? (tp - entry) : (entry - tp);
      hasTP = tpDiff > 0;
    }

    // 3. Dynamic Risk-Based Lot Sizing (e.g. Target Risk = ₹100)
    // Loss per lot in USDT = slDiff * contractSize
    // Loss per lot in INR = Loss per lot in USDT * USDT Rate
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

    // 4. Stop Loss Estimated Loss
    // For LONG: Quantity * (Entry - SL)
    // For SHORT: Quantity * (SL - Entry)
    const rawGrossLossUSDT = hasSL && qty > 0 ? (qty * slDiff) : 0;
    const grossLossINR = rawGrossLossUSDT * rate;
    const netLossINR = grossLossINR + totalFees;
    const riskPercentCapital = cap > 0 && netLossINR > 0 ? (netLossINR / cap) * 100 : 0;
    const balanceAtSL = cap > 0 ? (cap - netLossINR) : 0;

    // 5. Take Profit Estimated Profit
    // For LONG: Quantity * (TP - Entry)
    // For SHORT: Quantity * (Entry - TP)
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
    const hasExit = status === 'CLOSED' && exitPrice !== '' && !isNaN(exit) && exit > 0;
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

    // If manual exchange-reported realized P&L is provided (e.g. -100), honor it directly
    const hasManualRealized = manualRealizedPnL !== '' && !isNaN(parseFloat(manualRealizedPnL));
    if (hasManualRealized) {
      realizedNetPnLINR = parseFloat(manualRealizedPnL);
    }

    const capitalBase = margin > 0 ? margin : (cap > 0 ? cap : lotsNotionalINR);
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

  const selectCryptoPair = (pair) => {
    setSymbol(pair);
    setMarket('Crypto');
    const upper = pair.toUpperCase();
    if (upper.includes('BTC')) {
      setContractSize('0.001');
    } else if (upper.includes('ETH')) {
      setContractSize('0.01');
    } else if (upper.includes('SOL')) {
      setContractSize('0.1');
    }
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
      exitDate: status === 'CLOSED' ? (exitDate || new Date().toISOString().slice(0, 10)) : null,
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
      usdtRate: parseFloat(usdtRate) || 90,
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

  const handleDeleteInternal = () => {
    if (tradeToEdit && onDelete) {
      if (confirm(`Are you sure you want to delete trade execution for ${tradeToEdit.symbol}?`)) {
        onDelete(tradeToEdit.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0B0F19] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#1E2638] shadow-2xl transform transition-all text-slate-100 p-5 sm:p-6 space-y-4 custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (step === 2) setStep(1);
              else onClose();
            }}
            className="p-2 rounded-xl bg-[#111726] border border-[#1E2638] text-slate-400 hover:text-white hover:bg-[#1E2638] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-extrabold text-[#38BDF8] tracking-tight font-jakarta flex items-center space-x-2">
            <Coins className="w-5 h-5 text-[#38BDF8]" />
            <span>{tradeToEdit ? 'Edit Execution Record' : 'New Entry'}</span>
          </h2>

          <div className="flex items-center space-x-2">
            {tradeToEdit && (
              <button
                type="button"
                onClick={handleDeleteInternal}
                className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition"
                title="Delete Trade Execution"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#111726] border border-[#1E2638] text-slate-400 hover:text-white hover:bg-[#1E2638] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clean Step Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-[#1E2638] pb-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer flex items-center space-x-1.5 ${
              step === 1
                ? 'bg-[#38BDF8] text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-[#111726]'
            }`}
          >
            <span>1. Order Details & Levels</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const effQty = calculationSummary.qty || parseFloat(quantity);
              if (!symbol || !entryPrice || (!quantity && (!effQty || effQty <= 0))) {
                alert('Please fill in Symbol, Entry Price, and Quantity (or Lots) before proceeding.');
                return;
              }
              setStep(2);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer flex items-center space-x-1.5 ${
              step === 2
                ? 'bg-[#38BDF8] text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-[#111726]'
            }`}
          >
            <span>2. Trade Plan & Confluences</span>
          </button>
        </div>

        <div className="space-y-3.5">
          
          {/* STEP 1: TRADE DETAILS & EXECUTION */}
          {step === 1 && (
            <div className="space-y-3.5">
              
              {/* 1. TOP CONTROL BAR: DIRECTION, ORDER TYPE, STATUS & ASSET */}
              <div className="p-3.5 rounded-xl bg-[#111726]/60 border border-[#1E2638]/70 space-y-3">
                {/* Row 1: Direction, Order Type, and Trade Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Direction: Long / Short */}
                  <div className="p-1 bg-[#0B0F19] rounded-xl border border-[#1E2638] grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setDirection('LONG')}
                      className={`py-1.5 text-xs font-bold font-mono rounded-lg transition cursor-pointer flex items-center justify-center space-x-1 ${
                        direction === 'LONG'
                          ? 'bg-[#10B981] text-white shadow-md shadow-emerald-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>▲ Buy / Long</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection('SHORT')}
                      className={`py-1.5 text-xs font-bold font-mono rounded-lg transition cursor-pointer flex items-center justify-center space-x-1 ${
                        direction === 'SHORT'
                          ? 'bg-[#EF4444] text-white shadow-md shadow-rose-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>▼ Sell / Short</span>
                    </button>
                  </div>

                  {/* Order Type: Limit / Market */}
                  <div className="p-1 bg-[#0B0F19] rounded-xl border border-[#1E2638] grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setOrderType('Limit')}
                      className={`py-1.5 text-xs font-bold font-mono rounded-lg transition cursor-pointer ${
                        orderType === 'Limit'
                          ? 'bg-[#38BDF8] text-slate-950 shadow-md shadow-sky-500/20 font-extrabold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Limit Order
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('Market')}
                      className={`py-1.5 text-xs font-bold font-mono rounded-lg transition cursor-pointer ${
                        orderType === 'Market'
                          ? 'bg-[#38BDF8] text-slate-950 shadow-md shadow-sky-500/20 font-extrabold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Market Order
                    </button>
                  </div>

                  {/* Trade Status: Closed / Open */}
                  <div className="p-1 bg-[#0B0F19] rounded-xl border border-[#1E2638] grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setStatus('CLOSED')}
                      className={`py-1.5 text-xs font-bold font-mono rounded-lg transition cursor-pointer ${
                        status === 'CLOSED'
                          ? 'bg-[#10B981] text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Closed Trade
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('OPEN')}
                      className={`py-1.5 text-xs font-bold font-mono rounded-lg transition cursor-pointer ${
                        status === 'OPEN'
                          ? 'bg-[#8B5CF6] text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Open Position
                    </button>
                  </div>
                </div>

                {/* Row 2: Symbol with Quick Chips, Exchange & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  {/* Symbol & Quick Pairs */}
                  <div className="sm:col-span-6 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Instrument / Symbol *
                      </label>
                      <div className="flex items-center space-x-1">
                        {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'].map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => selectCryptoPair(p)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition cursor-pointer border ${
                              symbol === p
                                ? 'bg-[#38BDF8] text-slate-950 border-[#38BDF8]'
                                : 'bg-[#0B0F19] text-slate-400 border-[#1E2638] hover:text-white'
                            }`}
                          >
                            {p.split('/')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative flex items-center bg-[#0B0F19] rounded-xl border border-[#1E2638] px-3 py-1 focus-within:border-[#38BDF8]">
                      <CryptoIcon symbol={symbol || 'BTC'} className="w-4 h-4 mr-2 shrink-0" />
                      <input
                        type="text"
                        list="trademodal-binance-pairs"
                        placeholder="e.g. BTC/USDT"
                        value={symbol}
                        onChange={(e) => {
                          setSymbol(e.target.value);
                          const upper = (e.target.value || '').toUpperCase();
                          if (upper.includes('BTC')) setContractSize('0.001');
                          else if (upper.includes('ETH')) setContractSize('0.01');
                          else if (upper.includes('SOL')) setContractSize('0.1');
                        }}
                        className="w-full bg-transparent text-white text-xs py-1 font-bold focus:outline-none font-mono uppercase placeholder:text-slate-600"
                        required
                      />
                      <datalist id="trademodal-binance-pairs">
                        {BINANCE_POPULAR_PAIRS.map(p => (
                          <option key={p.symbol} value={p.symbol}>{p.name + ' (' + p.coin + ')'}</option>
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Exchange */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                      Exchange
                    </label>
                    <select
                      value={exchange}
                      onChange={(e) => setExchange(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-[#38BDF8] cursor-pointer"
                    >
                      <option value="Delta Exchange">Delta Exchange</option>
                      <option value="Binance">Binance</option>
                      <option value="Bybit">Bybit</option>
                      <option value="OKX">OKX</option>
                      <option value="Coinbase">Coinbase</option>
                      <option value="NSE">NSE (India)</option>
                    </select>
                  </div>

                  {/* Date & Time */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                      Execution Date
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEntryDatePicker(!showEntryDatePicker)}
                        className="w-full px-3 py-2 bg-[#0B0F19] hover:bg-[#1E2638] text-[#38BDF8] text-[11px] font-bold rounded-xl border border-[#1E2638] hover:border-[#38BDF8] focus:outline-none font-mono text-center flex items-center justify-between cursor-pointer transition"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                        <span className="truncate">{formatDateDisplay(entryDate).split(' ')[0]}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </button>

                      {showEntryDatePicker && (
                        <CustomGlassDateTimePicker
                          value={entryDate}
                          onChange={(val) => setEntryDate(val)}
                          onClose={() => setShowEntryDatePicker(false)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. CAPITAL, MARGIN & LEVERAGE (UNIFIED STRIP) */}
              <div className="p-3.5 rounded-xl bg-[#111726]/60 border border-[#1E2638]/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#38BDF8] flex items-center space-x-1.5 font-mono">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>CAPITAL & MARGIN SIZING</span>
                  </span>

                  {/* Quick Sizing Buttons */}
                  <div className="flex items-center space-x-1">
                    <span className="text-[9px] text-slate-500 font-mono mr-1">Quick Size:</span>
                    {[10, 25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handlePercentageMargin(pct)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0B0F19] text-slate-300 hover:text-[#38BDF8] hover:bg-[#1E2638] border border-[#1E2638] transition cursor-pointer"
                        title={`Use ${pct}% of Starting Capital`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4 Columns: Capital, Margin Used, Available Balance, Leverage */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                      Starting Capital (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono font-bold select-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="any"
                        placeholder="2000"
                        value={startingCapital}
                        onChange={(e) => setStartingCapital(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-[#38BDF8]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                      Margin Used (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono font-bold select-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="any"
                        placeholder="2000"
                        value={marginUsed}
                        onChange={(e) => setMarginUsed(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-[#38BDF8]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                      Available Balance (₹)
                    </label>
                    <div className={`w-full px-3 py-1.5 bg-[#0B0F19] text-xs rounded-xl border border-[#1E2638] font-mono font-black flex items-center justify-between ${
                      calculationSummary.availableBalance < 0 ? 'text-rose-400' : 'text-[#10B981]'
                    }`}>
                      <span>{formatINR(calculationSummary.availableBalance)}</span>
                    </div>
                  </div>

                  {/* Leverage with Presets */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Leverage
                      </label>
                      <span className="text-[9px] text-[#38BDF8] font-mono font-bold">{leverage}x</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[10, 25, 50].map(lev => (
                        <button
                          key={lev}
                          type="button"
                          onClick={() => setLeverage(String(lev))}
                          className={`px-1.5 py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer transition flex-1 ${
                            String(leverage) === String(lev)
                              ? 'bg-[#38BDF8] text-slate-950 border-[#38BDF8]'
                              : 'bg-[#0B0F19] text-slate-400 border-[#1E2638] hover:text-white'
                          }`}
                        >
                          {lev}x
                        </button>
                      ))}
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={leverage}
                        onChange={(e) => setLeverage(e.target.value)}
                        className="w-12 py-1 bg-[#0B0F19] text-white text-[11px] font-mono font-bold rounded-lg border border-[#1E2638] text-center focus:outline-none focus:border-[#38BDF8]"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-strip: Capacity & Contract Specification */}
                <div className="flex flex-wrap items-center justify-between text-[10px] font-mono pt-1 border-t border-[#1E2638]/60 text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Scale className="w-3 h-3 text-[#38BDF8]" />
                    <span>Capacity: <strong className="text-[#38BDF8]">{formatINR(calculationSummary.capacityNotionalINR)}</strong> (Margin × Leverage)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span>Contract: <strong className="text-white">1 Lot = {contractSize} {symbol.split('/')[0] || 'BTC'}</strong></span>
                    <span>1 USDT = <strong className="text-white">₹{usdtRate}</strong></span>
                  </div>
                </div>
              </div>

              {/* 3. ORDER LEVELS, LOT SIZING & DYNAMIC RISK SIZER */}
              <div className="p-3.5 rounded-xl bg-[#111726]/60 border border-[#1E2638]/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#38BDF8] flex items-center space-x-1.5 font-mono">
                    <Target className="w-3.5 h-3.5" />
                    <span>ORDER LEVELS & POSITION SIZING</span>
                  </span>

                  <label className="flex items-center space-x-1 text-[10px] font-mono text-slate-300 cursor-pointer bg-[#0B0F19] px-2 py-0.5 rounded-lg border border-[#1E2638] select-none">
                    <input
                      type="checkbox"
                      checked={hasBracketOrder}
                      onChange={(e) => setHasBracketOrder(e.target.checked)}
                      className="rounded accent-[#38BDF8] cursor-pointer"
                    />
                    <span>TP / SL Bracket</span>
                  </label>
                </div>

                {/* Core Levels: Entry Price, Stop Loss, Take Profit, Exit Price */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Entry Price *
                      </label>
                      <span className="text-[9px] text-[#38BDF8] font-mono font-bold">{orderType}</span>
                    </div>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 77406"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-[#38BDF8]"
                      required
                    />
                  </div>

                  {hasBracketOrder && (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-rose-400 uppercase font-mono">
                            Stop Loss (SL)
                          </label>
                          {calculationSummary.slDiff > 0 && (
                            <span className="text-[9px] text-slate-400 font-mono">{calculationSummary.slDiff.toFixed(1)} pts</span>
                          )}
                        </div>
                        <input
                          type="number"
                          step="any"
                          placeholder={direction === 'LONG' ? 'e.g. 77250' : 'e.g. 77485'}
                          value={stopLoss}
                          onChange={(e) => setStopLoss(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-rose-500/60"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-emerald-400 uppercase font-mono">
                            Take Profit (TP)
                          </label>
                          {calculationSummary.tpDiff > 0 && (
                            <span className="text-[9px] text-slate-400 font-mono">{calculationSummary.tpDiff.toFixed(1)} pts</span>
                          )}
                        </div>
                        <input
                          type="number"
                          step="any"
                          placeholder={direction === 'LONG' ? 'e.g. 77874' : 'e.g. 77200'}
                          value={targetPrice}
                          onChange={(e) => setTargetPrice(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-emerald-500/60"
                        />
                      </div>
                    </>
                  )}

                  {/* Actual Exit Price (Only shown when Closed) */}
                  {status === 'CLOSED' ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                          Actual Exit Price
                        </label>
                        <span className="text-[9px] text-[#10B981] font-mono">Closed</span>
                      </div>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 77485"
                        value={exitPrice}
                        onChange={(e) => setExitPrice(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#0B0F19] text-white text-xs rounded-xl border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-[#38BDF8]"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Position State
                      </label>
                      <div className="px-3 py-1.5 bg-[#0B0F19] text-purple-400 text-xs rounded-xl border border-[#1E2638] font-mono font-bold">
                        Open & Active
                      </div>
                    </div>
                  )}
                </div>

                {/* Sizing & Dynamic Risk Control Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-[#1E2638]/60">
                  {/* Order Size in Lots */}
                  <div className="p-2.5 rounded-xl bg-[#0B0F19] border border-[#1E2638] space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Order Size in Lots *
                      </label>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        = {calculationSummary.qty.toFixed(6)} {symbol.split('/')[0] || 'BTC'}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="1"
                        placeholder="14"
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
                        className="w-full px-3 py-1.5 bg-[#111726] text-white text-xs rounded-lg border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-[#38BDF8]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-mono font-bold pointer-events-none">
                        Lots
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Risk Target Sizer */}
                  <div className="p-2.5 rounded-xl bg-[#0B0F19] border border-[#1E2638] space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-rose-400 uppercase font-mono flex items-center space-x-1">
                        <Crosshair className="w-3 h-3 text-rose-400" />
                        <span>Dynamic Risk Target (₹)</span>
                      </label>
                      {calculationSummary.hasSL && calculationSummary.recommendedRiskLots > 0 && (
                        <button
                          type="button"
                          onClick={() => handleApplyRiskLots(calculationSummary.recommendedRiskLots)}
                          className="px-2 py-0.5 bg-[#38BDF8] hover:bg-sky-400 text-slate-950 font-extrabold text-[9px] rounded font-mono transition cursor-pointer"
                        >
                          Apply {calculationSummary.recommendedRiskLots} Lots
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative w-28 shrink-0">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono font-bold">
                          ₹
                        </span>
                        <input
                          type="number"
                          step="any"
                          placeholder="100"
                          value={targetRiskINR}
                          onChange={(e) => setTargetRiskINR(e.target.value)}
                          className="w-full pl-6 pr-2 py-1.5 bg-[#111726] text-white text-xs rounded-lg border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-rose-400"
                        />
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {calculationSummary.hasSL && calculationSummary.slDiff > 0 ? (
                          <span>Max: <strong className="text-white">{calculationSummary.recommendedRiskLots} Lots</strong> ({ (calculationSummary.recommendedRiskLots * (parseFloat(contractSize) || 0.001)).toFixed(3) } BTC)</span>
                        ) : (
                          <span className="text-slate-500 italic">Enter SL to size</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Manual Realized Override & Fees */}
                {status === 'CLOSED' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-[#1E2638]/60 text-xs font-mono">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono">
                        Exchange Realized P&L (₹)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. -100"
                        value={manualRealizedPnL}
                        onChange={(e) => setManualRealizedPnL(e.target.value)}
                        className="w-full px-2.5 py-1 bg-[#0B0F19] text-white text-xs rounded-lg border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-[#38BDF8]"
                        title="Direct exchange-reported realized P&L"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono">
                        Trading Fees (₹)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={tradingFees}
                        onChange={(e) => setTradingFees(e.target.value)}
                        className="w-full px-2.5 py-1 bg-[#0B0F19] text-white text-xs rounded-lg border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-[#38BDF8]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono">
                        Funding Fees (₹)
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={fundingFees}
                        onChange={(e) => setFundingFees(e.target.value)}
                        className="w-full px-2.5 py-1 bg-[#0B0F19] text-white text-xs rounded-lg border border-[#1E2638] font-mono font-bold focus:outline-none focus:border-[#38BDF8]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. EXECUTION PREVIEW & REALIZED OUTCOME CARD */}
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-[#1E2638] space-y-2.5 font-mono">
                <div className="flex items-center justify-between pb-1 border-b border-[#1E2638]/70">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#38BDF8] flex items-center space-x-1.5 font-mono">
                    <Activity className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Order Execution Preview</span>
                  </span>
                  <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-lg bg-[#111726] border border-[#1E2638] text-[#38BDF8]">
                    R:R {calculationSummary.rrRatioStr}
                  </span>
                </div>

                {/* 4-Item Metric Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-[#111726]/70 border border-[#1E2638]">
                    <span className="text-[9px] text-slate-400 block uppercase">Notional</span>
                    <span className="text-xs font-black text-white block mt-0.5 truncate">
                      {formatINR(calculationSummary.lotsNotionalINR)}
                    </span>
                    <span className="text-[8px] text-slate-500 block truncate">
                      ≈ ${calculationSummary.lotsNotionalUSDT.toFixed(2)} USDT
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#111726]/70 border border-[#1E2638]">
                    <span className="text-[9px] text-slate-400 block uppercase">Required Margin</span>
                    <span className="text-xs font-black text-[#38BDF8] block mt-0.5 truncate">
                      {formatINR(calculationSummary.requiredMarginINR)}
                    </span>
                    <span className="text-[8px] text-slate-500 block truncate">
                      At {leverage}x leverage
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#111726]/70 border border-rose-500/20">
                    <span className="text-[9px] text-rose-400 block uppercase">Est. SL Loss</span>
                    <span className="text-xs font-black text-rose-400 block mt-0.5 truncate">
                      {calculationSummary.hasSL ? `-${formatINR(calculationSummary.grossLossINR)}` : '--'}
                    </span>
                    <span className="text-[8px] text-slate-400 block truncate">
                      Bal: {formatINR(calculationSummary.balanceAtSL)}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#111726]/70 border border-emerald-500/20">
                    <span className="text-[9px] text-emerald-400 block uppercase">Est. TP Profit</span>
                    <span className="text-xs font-black text-[#10B981] block mt-0.5 truncate">
                      {calculationSummary.hasTP ? `+${formatINR(calculationSummary.grossProfitINR)}` : '--'}
                    </span>
                    <span className="text-[8px] text-slate-400 block truncate">
                      Bal: {formatINR(calculationSummary.balanceAtTP)}
                    </span>
                  </div>
                </div>

                {/* Realized Banner if Closed */}
                {status === 'CLOSED' && (calculationSummary.hasExit || calculationSummary.hasManualRealized) && (
                  <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                    calculationSummary.realizedNetPnL >= 0
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-rose-950/20 border-rose-500/30'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <Calculator className={`w-4 h-4 ${calculationSummary.realizedNetPnL >= 0 ? 'text-[#10B981]' : 'text-rose-400'}`} />
                      <span className="text-slate-300">
                        {calculationSummary.hasManualRealized ? 'Manual Exchange Realized P&L:' : 'Executed Realized Net P&L:'}
                      </span>
                      <strong className={`text-sm font-black ${calculationSummary.realizedNetPnL >= 0 ? 'text-[#10B981]' : 'text-rose-400'}`}>
                        {calculationSummary.realizedNetPnL >= 0 ? '+' : ''}{formatINR(calculationSummary.realizedNetPnL)}
                      </strong>
                    </div>

                    <div className="text-right text-slate-300">
                      <span>Balance After Trade: <strong className="text-white">{formatINR(calculationSummary.balanceAfterTrade)}</strong></span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 2: TRADE PLAN & CONFLUENCES */}
          {step === 2 && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-[#38BDF8] mb-1">
                    Status
                  </label>
                  <div className="p-1 bg-[#111726] rounded-xl border border-[#1E2638] grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setStatus('CLOSED')}
                      className={`py-2 text-xs font-bold rounded-lg transition ${
                        status === 'CLOSED'
                          ? 'bg-[#10B981] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Closed
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus('OPEN')}
                      className={`py-2 text-xs font-bold rounded-lg transition ${
                        status === 'OPEN'
                          ? 'bg-[#8B5CF6] text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Open
                    </button>
                  </div>
                </div>

                {status === 'CLOSED' && (
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-[#38BDF8] mb-1">
                      Exit Price
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Exit Price (e.g. 68000)"
                      value={exitPrice}
                      onChange={(e) => setExitPrice(e.target.value)}
                      className="w-full px-4 py-2 bg-[#111726] text-white text-xs rounded-xl border border-[#1E2638] font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              {/* SMC Confluences Grid */}
              <div className="p-3.5 rounded-2xl bg-[#111726] border border-[#1E2638] space-y-2">
                <span className="text-[11px] font-extrabold uppercase text-[#38BDF8] block">
                  SMC Confluence Checklist
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center space-x-2 p-2 rounded-xl bg-[#0B0F19] border border-[#1E2638] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={h1Bias}
                      onChange={(e) => setH1Bias(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-[#38BDF8]"
                    />
                    <span>1H HTF Bias</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 rounded-xl bg-[#0B0F19] border border-[#1E2638] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={m15Structure}
                      onChange={(e) => setM15Structure(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-[#38BDF8]"
                    />
                    <span>15m MSS / FVG</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 rounded-xl bg-[#0B0F19] border border-[#1E2638] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={m5EntryPoi}
                      onChange={(e) => setM5EntryPoi(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-[#38BDF8]"
                    />
                    <span>5m Entry POI</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 rounded-xl bg-[#0B0F19] border border-[#1E2638] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={m1BosChoch}
                      onChange={(e) => setM1BosChoch(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-[#38BDF8]"
                    />
                    <span>1m LTF Trigger</span>
                  </label>
                </div>
              </div>

              {/* Local Photo Upload */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#38BDF8] mb-1">
                  Upload Setup Screenshot (Local PC File)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1E2638] file:text-[#38BDF8] hover:file:bg-slate-700"
                />

                {chartUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-[#1E2638] h-28 bg-[#0B0F19]">
                    <img src={chartUrl} alt="Setup" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setChartUrl('')}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-rose-600/80 text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-[#38BDF8] mb-1">
                  Notes & Execution Rationale
                </label>
                <textarea
                  rows="2"
                  placeholder="Crypto confluences, funding rate, liquidation sweeps..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-[#111726] text-white text-xs rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-[#1E2638]">
            <button
              type="button"
              onClick={handleSaveInternal}
              className="px-6 py-2.5 bg-[#1E2638] hover:bg-[#2A364F] text-slate-300 hover:text-white font-bold text-xs rounded-xl transition border border-[#2D3850]"
            >
              Add Trade
            </button>

            {step === 1 ? (
              <button
                type="button"
                onClick={() => {
                  const effQty = calculationSummary.qty || parseFloat(quantity);
                  if (!symbol || !entryPrice || (!quantity && (!effQty || effQty <= 0))) {
                    alert('Please fill in Symbol, Entry Price, and Quantity (or Lots) before proceeding.');
                    return;
                  }
                  setStep(2);
                }}
                className="flex flex-col items-end group"
              >
                <div className="flex items-center space-x-1 text-[#38BDF8] font-extrabold text-xs group-hover:text-sky-300">
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">Trade Plan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveInternal}
                className="px-6 py-2.5 bg-[#38BDF8] hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition"
              >
                Save & Close
              </button>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
