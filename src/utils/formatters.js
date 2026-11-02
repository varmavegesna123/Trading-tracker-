// Utility functions for formatting currencies, numbers, dates, and P&L calculations

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  USDT: '₮',
  EUR: '€',
  GBP: '£',
  BTC: '₿'
};

/**
 * Format currency amount with proper locale and symbol
 */
export const formatCurrency = (amount, currencyCode = 'USD') => {
  const num = Number(amount) || 0;
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';
  
  if (currencyCode === 'INR') {
    // Format according to Indian numbering system (e.g. ₹1,50,000.00)
    const absoluteNum = Math.abs(num);
    const formatted = absoluteNum.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
    return `${num < 0 ? '-' : ''}${symbol}${formatted}`;
  }
  
  const absoluteNum = Math.abs(num);
  const formatted = absoluteNum.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });
  return `${num < 0 ? '-' : ''}${symbol}${formatted}`;
};

/**
 * Format percentage with + or - sign
 */
export const formatPercent = (value) => {
  const num = Number(value) || 0;
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
};

/**
 * Format dates cleanly (e.g. 28 Jul 2026)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

/**
 * Format dates with time (e.g. 28 Jul 2026, 10:30 AM)
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Calculate P&L for a trade
 * Long: Gross = (Exit Price - Entry Price) * Quantity
 * Short: Gross = (Entry Price - Exit Price) * Quantity
 * Net P&L = Gross P&L - Trading Fees - Funding Fees
 * ROI is computed against actual margin / invested capital.
 */
export const calculateTradePnL = (trade) => {
  if (!trade) {
    return { pnlAmount: 0, grossPnL: 0, netPnL: 0, pnlPercent: 0, pnlPercentage: 0, totalValue: 0, investedCapital: 0, balanceAfterTrade: 0 };
  }

  const entry = Number(trade.entryPrice) || 0;
  const hasExit = trade.exitPrice !== undefined && trade.exitPrice !== null && trade.exitPrice !== '';
  const exit = hasExit ? Number(trade.exitPrice) : entry;
  const qty = Number(trade.quantity) || 0;
  const direction = (trade.direction || 'LONG').toUpperCase();
  const startCap = Number(trade.startingCapital) || Number(trade.capital) || 0;
  const tradingFees = Number(trade.tradingFees) || 0;
  const fundingFees = Number(trade.fundingFees) || 0;
  const totalFees = tradingFees + fundingFees;

  const marginCapital = Number(trade.marginUsed) || Number(trade.margin) || 0;
  const positionNotional = Number(trade.positionSize) || Number(trade.positionNotional) || (entry * qty);
  const investedCapital = marginCapital > 0 ? marginCapital : (positionNotional > 0 ? positionNotional : entry * qty);

  if (trade.status === 'OPEN' || !hasExit) {
    return { 
      pnlAmount: 0, 
      grossPnL: 0, 
      netPnL: 0, 
      pnlPercent: 0, 
      pnlPercentage: 0, 
      totalValue: positionNotional || investedCapital,
      investedCapital,
      marginCapital,
      balanceAfterTrade: startCap
    };
  }

  // 1. If explicit manual exchange-reported realized P&L is provided, honor it directly
  if (trade.actualRealizedPnL !== undefined && trade.actualRealizedPnL !== null && trade.actualRealizedPnL !== '') {
    const manualPnL = Number(trade.actualRealizedPnL);
    if (!isNaN(manualPnL)) {
      const pnlPercent = investedCapital > 0 ? (manualPnL / investedCapital) * 100 : 0;
      const grossPnL = Number(trade.grossPnL) || (manualPnL + totalFees);
      return {
        pnlAmount: manualPnL,
        netPnL: manualPnL,
        grossPnL,
        pnlPercent,
        pnlPercentage: pnlPercent,
        totalValue: positionNotional || investedCapital,
        investedCapital,
        marginCapital,
        tradingFees,
        fundingFees,
        balanceAfterTrade: startCap > 0 ? (startCap + manualPnL) : 0
      };
    }
  }

  // 2. If stored netPnL exists (already calculated in TradeModal with USDT conversion and fees), use it
  if (trade.netPnL !== undefined && trade.netPnL !== null && !isNaN(Number(trade.netPnL)) && trade.netPnL !== '') {
    const savedNet = Number(trade.netPnL);
    const savedGross = Number(trade.grossPnL) || (savedNet + totalFees);
    const pnlPercent = investedCapital > 0 ? (savedNet / investedCapital) * 100 : 0;
    return {
      pnlAmount: savedNet,
      netPnL: savedNet,
      grossPnL: savedGross,
      pnlPercent,
      pnlPercentage: pnlPercent,
      totalValue: positionNotional || investedCapital,
      investedCapital,
      marginCapital,
      tradingFees,
      fundingFees,
      balanceAfterTrade: startCap > 0 ? (startCap + savedNet) : 0
    };
  }

  // 3. Dynamic Calculation from raw entry, exit, quantity, and fees
  let rawGrossPnL = 0;
  if (direction === 'LONG') {
    rawGrossPnL = (exit - entry) * qty;
  } else {
    rawGrossPnL = (entry - exit) * qty;
  }

  const isCryptoUSDT = (trade.market === 'Crypto' || (trade.symbol || '').toUpperCase().includes('USDT'));
  const rate = Number(trade.usdtRate) || 90;
  // If coin quantity (e.g. BTC) on USDT pair, convert raw USDT P&L to INR
  const isCoinQuantity = isCryptoUSDT && (entry > 100 && qty < 1000);
  const grossPnL = isCoinQuantity ? (rawGrossPnL * rate) : rawGrossPnL;
  const netPnL = grossPnL - totalFees;
  const pnlPercent = investedCapital > 0 ? (netPnL / investedCapital) * 100 : 0;

  const safeNetPnL = isNaN(netPnL) ? 0 : netPnL;
  const safeGrossPnL = isNaN(grossPnL) ? 0 : grossPnL;
  const safePercent = isNaN(pnlPercent) ? 0 : pnlPercent;
  const safeCapital = isNaN(investedCapital) ? 0 : investedCapital;

  return {
    pnlAmount: safeNetPnL,
    netPnL: safeNetPnL,
    grossPnL: safeGrossPnL,
    pnlPercent: safePercent,
    pnlPercentage: safePercent,
    totalValue: positionNotional || safeCapital,
    investedCapital: safeCapital,
    marginCapital,
    tradingFees,
    fundingFees,
    balanceAfterTrade: startCap > 0 ? (startCap + safeNetPnL) : 0
  };
};

/**
 * Calculate Risk to Reward ratio & potential profit/loss metrics
 */
export const calculateRiskReward = (entryPrice, stopLoss, targetPrice, direction = 'LONG', quantity = 1, startingCapital = 0) => {
  const entry = Number(entryPrice) || 0;
  const sl = Number(stopLoss) || 0;
  const tp = Number(targetPrice) || 0;
  const qty = Number(quantity) || 0;
  const capital = Number(startingCapital) || 0;

  if (!entry) return null;

  const isLong = (direction || 'LONG').toUpperCase() === 'LONG';
  const riskPerUnit = isLong ? (entry - sl) : (sl - entry);
  const rewardPerUnit = isLong ? (tp - entry) : (entry - tp);

  const hasSL = sl > 0 && riskPerUnit > 0;
  const hasTP = tp > 0 && rewardPerUnit > 0;

  const riskAmount = hasSL && qty > 0 ? riskPerUnit * qty : 0;
  const rewardAmount = hasTP && qty > 0 ? rewardPerUnit * qty : 0;

  let ratioStr = '--';
  let ratioValue = null;
  if (hasSL && hasTP && riskPerUnit > 0) {
    ratioValue = rewardPerUnit / riskPerUnit;
    ratioStr = `1 : ${ratioValue.toFixed(2)}`;
  }

  const riskPercentCapital = capital > 0 && riskAmount > 0 ? (riskAmount / capital) * 100 : 0;
  const rewardPercentCapital = capital > 0 && rewardAmount > 0 ? (rewardAmount / capital) * 100 : 0;

  return {
    hasSL,
    hasTP,
    riskPerUnit,
    rewardPerUnit,
    riskAmount,
    rewardAmount,
    ratio: ratioStr,
    ratioValue,
    riskPercentCapital,
    rewardPercentCapital
  };
};
