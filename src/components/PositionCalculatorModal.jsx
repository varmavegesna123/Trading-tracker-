import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calculator, 
  AlertCircle, 
  Wallet, 
  Sliders, 
  Layers, 
  Crosshair, 
  Scale, 
  Activity, 
  TrendingUp, 
  Check 
} from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../utils/formatters';

function formatVal(val, currency = 'INR') {
  return formatCurrency(val, currency, 'INR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
}

export function PositionCalculatorModal({ isOpen, onClose, totalEquity = 2000, currency = 'INR' }) {
  const currencySymbol = getCurrencySymbol(currency);
  const [calculatorMode, setCalculatorMode] = useState('futures'); // 'futures' | 'equity'
  
  // Delta Futures State
  const [direction, setDirection] = useState('SHORT');
  const [orderType, setOrderType] = useState('Limit');
  const [startingCapital, setStartingCapital] = useState('2000');
  const [leverage, setLeverage] = useState('25');
  const [marginUsed, setMarginUsed] = useState('2000');
  const [contractSize, setContractSize] = useState('0.001'); // 1 lot = 0.001 BTC
  const [orderLots, setOrderLots] = useState('14');
  const [entryPrice, setEntryPrice] = useState('77406');
  const [stopLoss, setStopLoss] = useState('77485');
  const [targetPrice, setTargetPrice] = useState('77200');
  const [targetRiskINR, setTargetRiskINR] = useState('100');
  const [usdtRate, setUsdtRate] = useState('90');
  const [tradingFees, setTradingFees] = useState('0');

  // Equity Calculator State
  const [accountCapital, setAccountCapital] = useState(totalEquity || 50000);
  const [riskPercent, setRiskPercent] = useState(1.0);
  const [equityEntryPrice, setEquityEntryPrice] = useState('');
  const [equityStopLoss, setEquityStopLoss] = useState('');
  const [equityDirection, setEquityDirection] = useState('LONG');

  if (!isOpen) return null;

  // Percentage sizing shortcuts
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
      }
    }
  };

  // Dynamic risk apply
  const handleApplyRiskLots = (lots) => {
    if (lots > 0) {
      setOrderLots(String(lots));
    }
  };

  // Delta Exchange Real-time Futures Calculations
  const futuresCalc = useMemo(() => {
    const cap = parseFloat(startingCapital) || 0;
    const lev = parseFloat(leverage) || 1;
    const margin = parseFloat(marginUsed) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(targetPrice) || 0;
    const cSize = parseFloat(contractSize) || 0.001;
    const lots = parseFloat(orderLots) || 0;
    const qty = lots * cSize;
    const targetRisk = parseFloat(targetRiskINR) || 0;
    const fees = parseFloat(tradingFees) || 0;
    const rate = parseFloat(usdtRate) || 90;
    const isLong = direction === 'LONG';

    const capacityNotionalINR = margin * lev;
    const availableBalance = cap - margin;

    const lotsNotionalUSDT = qty * entry;
    const lotsNotionalINR = lotsNotionalUSDT * rate;
    const requiredMarginINR = lev > 0 ? (lotsNotionalINR / lev) : 0;

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

    const rawGrossLossUSDT = hasSL && qty > 0 ? (qty * slDiff) : 0;
    const grossLossINR = rawGrossLossUSDT * rate;
    const netLossINR = grossLossINR + fees;
    const riskPercentCapital = cap > 0 && netLossINR > 0 ? (netLossINR / cap) * 100 : 0;
    const balanceAtSL = cap > 0 ? (cap - netLossINR) : 0;

    const rawGrossProfitUSDT = hasTP && qty > 0 ? (qty * tpDiff) : 0;
    const grossProfitINR = rawGrossProfitUSDT * rate;
    const netProfitINR = grossProfitINR - fees;
    const rewardPercentCapital = cap > 0 && netProfitINR > 0 ? (netProfitINR / cap) * 100 : 0;
    const balanceAtTP = cap > 0 ? (cap + netProfitINR) : 0;

    let rrRatioStr = '--';
    if (hasSL && hasTP && grossLossINR > 0) {
      rrRatioStr = `1 : ${(grossProfitINR / grossLossINR).toFixed(2)}`;
    }

    return {
      qty,
      capacityNotionalINR,
      lotsNotionalUSDT,
      lotsNotionalINR,
      requiredMarginINR,
      availableBalance,
      hasSL,
      hasTP,
      slDiff,
      tpDiff,
      lossPerLotINR,
      recommendedRiskLots,
      grossLossINR,
      netLossINR,
      grossProfitINR,
      netProfitINR,
      riskPercentCapital,
      rewardPercentCapital,
      balanceAtSL,
      balanceAtTP,
      rrRatioStr
    };
  }, [startingCapital, leverage, marginUsed, entryPrice, stopLoss, targetPrice, contractSize, orderLots, targetRiskINR, tradingFees, usdtRate, direction]);

  // Equity calculations
  const equityCalc = useMemo(() => {
    const cap = Number(accountCapital) || 0;
    const risk = Number(riskPercent) || 0;
    const entry = Number(equityEntryPrice) || 0;
    const sl = Number(equityStopLoss) || 0;

    const maxRiskAmount = (cap * risk) / 100;
    let slDistance = 0;
    if (entry > 0 && sl > 0) {
      slDistance = equityDirection === 'LONG' ? (entry - sl) : (sl - entry);
    }

    let recommendedQty = 0;
    if (slDistance > 0 && maxRiskAmount > 0) {
      recommendedQty = Math.floor(maxRiskAmount / slDistance);
    }

    const totalPositionValue = recommendedQty * entry;
    const slPercent = entry > 0 ? (slDistance / entry) * 100 : 0;

    return {
      maxRiskAmount,
      slDistance,
      recommendedQty,
      totalPositionValue,
      slPercent
    };
  }, [accountCapital, riskPercent, equityEntryPrice, equityStopLoss, equityDirection]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0B0F19] rounded-3xl max-w-xl w-full border border-[#1E2638] shadow-2xl overflow-hidden transform transition-all text-slate-100 p-6 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E2638]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold font-mono text-white tracking-wide">
                FUTURES & RISK CALCULATOR
              </h2>
              <p className="text-[11px] text-slate-400">
                Delta Exchange contract sizing, margin capacity & risk engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#1E2638] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calculator Mode Switcher */}
        <div className="p-1 bg-[#111726] rounded-xl border border-[#1E2638] grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => setCalculatorMode('futures')}
            className={`py-2 text-xs font-bold font-mono rounded-lg transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              calculatorMode === 'futures'
                ? 'bg-[#38BDF8] text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Delta Futures (BTCUSDT)</span>
          </button>
          <button
            type="button"
            onClick={() => setCalculatorMode('equity')}
            className={`py-2 text-xs font-bold font-mono rounded-lg transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              calculatorMode === 'equity'
                ? 'bg-[#38BDF8] text-white shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Equity / Stock Sizer</span>
          </button>
        </div>

        {/* DELTA FUTURES MODE */}
        {calculatorMode === 'futures' && (
          <div className="space-y-3.5">
            
            {/* Direction & Order Type */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-1 bg-[#111726] rounded-xl border border-[#1E2638] grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    direction === 'LONG'
                      ? 'bg-[#10B981] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Buy / Long
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    direction === 'SHORT'
                      ? 'bg-[#EF4444] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sell / Short
                </button>
              </div>

              <div className="p-1 bg-[#111726] rounded-xl border border-[#1E2638] grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setOrderType('Limit')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    orderType === 'Limit'
                      ? 'bg-[#38BDF8] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Limit
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('Market')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    orderType === 'Market'
                      ? 'bg-[#38BDF8] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Market
                </button>
              </div>
            </div>

            {/* Leverage Selector */}
            <div className="p-3 rounded-2xl bg-[#111726] border border-[#1E2638] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8] flex items-center space-x-1.5 font-mono">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Leverage Selector</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-white bg-[#0B0F19] px-2 py-0.5 rounded-lg border border-[#1E2638]">
                  {leverage}x
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[1, 5, 10, 25, 50, 100].map(lev => (
                  <button
                    key={lev}
                    type="button"
                    onClick={() => setLeverage(String(lev))}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                      String(leverage) === String(lev)
                        ? 'bg-[#38BDF8] text-white border-[#38BDF8]'
                        : 'bg-[#0B0F19] text-slate-400 border-[#1E2638] hover:text-white'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
                <div className="relative ml-auto flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={leverage}
                    onChange={(e) => setLeverage(e.target.value)}
                    className="w-16 pl-2 pr-5 py-1 bg-[#0B0F19] text-white text-xs font-mono font-bold rounded-xl border border-[#1E2638] text-center focus:outline-none focus:border-[#38BDF8]"
                  />
                  <span className="absolute right-2 text-slate-400 font-mono text-xs font-bold pointer-events-none">
                    x
                  </span>
                </div>
              </div>
            </div>

            {/* Capital & Margin Sizing */}
            <div className="p-3 rounded-2xl bg-[#111726] border border-[#1E2638] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8] flex items-center space-x-1 font-mono">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Capital & Margin</span>
                </span>
                <div className="flex items-center space-x-1">
                  {[10, 25, 50, 75, 100].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePercentageMargin(pct)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0B0F19] text-slate-300 hover:text-[#38BDF8] border border-[#1E2638] cursor-pointer"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono">
                    Starting Capital ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={startingCapital}
                    onChange={(e) => setStartingCapital(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#0B0F19] text-white text-xs font-mono font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono">
                    Margin Used ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={marginUsed}
                    onChange={(e) => setMarginUsed(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#0B0F19] text-white text-xs font-mono font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono">
                    Available Balance ({currencySymbol})
                  </label>
                  <div className={`px-2.5 py-1.5 bg-[#0B0F19] text-xs font-mono font-black rounded-xl border border-[#1E2638] ${
                    futuresCalc.availableBalance < 0 ? 'text-rose-400' : 'text-[#10B981]'
                  }`}>
                    {formatVal(futuresCalc.availableBalance, currency)}
                  </div>
                </div>
              </div>
            </div>

            {/* Delta Contract & Dynamic Risk Sizing */}
            <div className="p-3 rounded-2xl bg-[#111726] border border-[#1E2638] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8] flex items-center space-x-1 font-mono">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Contract Specification & Lots</span>
                </span>
                <span className="text-[9px] text-[#38BDF8] font-mono">
                  1 Lot = {contractSize} BTC
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono">
                    Contract Size (Per Lot)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={contractSize}
                    onChange={(e) => setContractSize(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#0B0F19] text-white text-xs font-mono font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono">
                      Order Size in Lots
                    </label>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold">
                      = {futuresCalc.qty.toFixed(6)} BTC
                    </span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={orderLots}
                    onChange={(e) => setOrderLots(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#0B0F19] text-white text-xs font-mono font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              {/* Dynamic Risk Sizer Banner */}
              <div className="p-2 rounded-xl bg-[#0B0F19] border border-[#1E2638] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <Crosshair className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">
                      Target Risk: <strong>{currencySymbol}{targetRiskINR}</strong>
                    </span>
                    <span className="text-xs font-black text-[#38BDF8] block">
                      Max Permitted: {futuresCalc.recommendedRiskLots} Lots ({ (futuresCalc.recommendedRiskLots * (parseFloat(contractSize) || 0.001)).toFixed(3) } BTC)
                    </span>
                  </div>
                </div>

                {futuresCalc.recommendedRiskLots > 0 && (
                  <button
                    type="button"
                    onClick={() => handleApplyRiskLots(futuresCalc.recommendedRiskLots)}
                    className="px-2.5 py-1 bg-[#38BDF8] hover:bg-sky-400 text-slate-950 font-extrabold text-[10px] rounded-lg transition cursor-pointer"
                  >
                    Apply {futuresCalc.recommendedRiskLots} Lots
                  </button>
                )}
              </div>
            </div>

            {/* Entry, SL & TP Inputs */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase font-mono">
                  Entry Price
                </label>
                <input
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#111726] text-white text-xs font-mono font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-rose-400 uppercase font-mono">
                  Stop Loss (SL)
                </label>
                <input
                  type="number"
                  step="any"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#111726] text-white text-xs font-mono font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-emerald-400 uppercase font-mono">
                  Take Profit (TP)
                </label>
                <input
                  type="number"
                  step="any"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#111726] text-white text-xs font-mono font-bold rounded-xl border border-[#1E2638] focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Delta Exchange Order Summary Output Card */}
            <div className="p-3.5 rounded-2xl bg-[#111726] border border-[#1E2638] space-y-2.5 font-mono">
              <div className="flex items-center justify-between pb-1 border-b border-[#1E2638]/60">
                <span className="text-[10px] font-extrabold uppercase text-[#38BDF8]">
                  Delta Order Execution Preview
                </span>
                <span className="text-[10px] font-black text-[#38BDF8] bg-[#0B0F19] px-2 py-0.5 rounded-lg border border-[#1E2638]">
                  R:R {futuresCalc.rrRatioStr}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-[#0B0F19] border border-[#1E2638]">
                  <span className="text-[9px] text-slate-400 block uppercase">Position Notional</span>
                  <span className="text-xs font-black text-white block mt-0.5">
                    {formatVal(futuresCalc.lotsNotionalINR, currency)}
                  </span>
                  <span className="text-[8px] text-slate-500 block">
                    ≈ ${futuresCalc.lotsNotionalUSDT.toFixed(2)} USDT
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-[#0B0F19] border border-[#1E2638]">
                  <span className="text-[9px] text-slate-400 block uppercase">Required Margin</span>
                  <span className="text-xs font-black text-[#38BDF8] block mt-0.5">
                    {formatVal(futuresCalc.requiredMarginINR, currency)}
                  </span>
                  <span className="text-[8px] text-slate-500 block">
                    {leverage}x leverage
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-[#0B0F19] border border-[#1E2638]">
                  <span className="text-[9px] text-slate-400 block uppercase">Available Bal</span>
                  <span className={`text-xs font-black block mt-0.5 ${futuresCalc.availableBalance < 0 ? 'text-rose-400' : 'text-[#10B981]'}`}>
                    {formatVal(futuresCalc.availableBalance, currency)}
                  </span>
                  <span className="text-[8px] text-slate-500 block">
                    Cap: {formatVal(parseFloat(startingCapital) || 2000, currency)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-[#0B0F19] border border-rose-500/20">
                  <div className="flex items-center justify-between text-[9px] text-rose-400 font-bold uppercase">
                    <span>Loss at SL</span>
                    <span>{stopLoss ? `@ ${stopLoss}` : ''}</span>
                  </div>
                  <div className="text-sm font-black text-rose-400 mt-0.5">
                    {futuresCalc.hasSL ? `-${formatVal(futuresCalc.grossLossINR, currency)}` : '--'}
                  </div>
                  <div className="text-[8px] text-slate-400 flex items-center justify-between mt-0.5">
                    <span>{futuresCalc.riskPercentCapital.toFixed(2)}% capital</span>
                    <span>Bal: {formatVal(futuresCalc.balanceAtSL, currency)}</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-[#0B0F19] border border-emerald-500/20">
                  <div className="flex items-center justify-between text-[9px] text-emerald-400 font-bold uppercase">
                    <span>Profit at TP</span>
                    <span>{targetPrice ? `@ ${targetPrice}` : ''}</span>
                  </div>
                  <div className="text-sm font-black text-[#10B981] mt-0.5">
                    {futuresCalc.hasTP ? `+${formatVal(futuresCalc.grossProfitINR, currency)}` : '--'}
                  </div>
                  <div className="text-[8px] text-slate-400 flex items-center justify-between mt-0.5">
                    <span>+{futuresCalc.rewardPercentCapital.toFixed(2)}% capital</span>
                    <span>Bal: {formatVal(futuresCalc.balanceAtTP, currency)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* EQUITY MODE */}
        {calculatorMode === 'equity' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Capital ({currency})
                </label>
                <input
                  type="number"
                  value={accountCapital}
                  onChange={(e) => setAccountCapital(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111726] text-white font-mono text-sm rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Risk Per Trade (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111726] text-white font-mono text-sm rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Entry Price *
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 150.00"
                  value={equityEntryPrice}
                  onChange={(e) => setEquityEntryPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111726] text-white font-mono text-sm rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Stop Loss Price *
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 140.00"
                  value={equityStopLoss}
                  onChange={(e) => setEquityStopLoss(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111726] text-white font-mono text-sm rounded-xl border border-[#1E2638] focus:outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111726] border border-[#1E2638] space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Max Allowed Risk ({riskPercent}%):</span>
                <span className="font-bold text-rose-400">
                  {formatCurrency(equityCalc.maxRiskAmount, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>SL Distance:</span>
                <span className="font-semibold text-slate-200">
                  {equityCalc.slDistance > 0 ? `${equityCalc.slDistance.toFixed(2)} pts (${equityCalc.slPercent.toFixed(2)}%)` : 'Invalid SL'}
                </span>
              </div>

              <div className="pt-2 border-t border-[#1E2638] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                    Recommended Quantity
                  </span>
                  <span className="text-2xl font-extrabold text-[#38BDF8]">
                    {equityCalc.recommendedQty > 0 ? equityCalc.recommendedQty.toLocaleString() : 0} <span className="text-xs font-normal text-slate-400">units</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Total Exposure
                  </span>
                  <span className="text-sm font-bold text-slate-200">
                    {formatCurrency(equityCalc.totalPositionValue, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-[#1E2638]">
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold font-mono bg-[#38BDF8] hover:bg-sky-400 text-slate-950 rounded-xl transition cursor-pointer shadow-lg shadow-sky-500/20"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
