/**
 * Centralized Currency Conversion & Formatting Utility for TradeTracker
 * Delta Exchange India Currency Conversion Engine
 *
 * Rules:
 * - Fixed USD/INR conversion rate of ₹85 per $1 (USD_TO_INR_RATE = 85)
 * - 1 USD = 85 INR
 * - 1 INR = 1/85 USD
 * - No live forex or external API dependencies
 * - Amounts stored consistently in base currency (INR) and converted on display
 */

// Central configurable fixed conversion rate: 1 USD = 85 INR
export const USD_TO_INR_RATE = 85;

// Base currency for internal trade calculations, capital logs, and database storage
export const BASE_CURRENCY = 'INR';

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  USDT: '₮',
  EUR: '€',
  GBP: '£',
  BTC: '₿'
};

/**
 * Get currency symbol for any supported currency
 * @param {string} currencyCode
 * @returns {string} Symbol (₹, $, ₮, etc.)
 */
export function getCurrencySymbol(currencyCode = BASE_CURRENCY) {
  if (!currencyCode) return CURRENCY_SYMBOLS[BASE_CURRENCY];
  const code = String(currencyCode).toUpperCase().trim();
  return CURRENCY_SYMBOLS[code] || (code === 'INR' ? '₹' : '$');
}

/**
 * Convert an amount from one currency to another using the Delta Exchange India fixed rate
 * 
 * @param {number|string} amount - Numerical amount to convert
 * @param {string} fromCurrency - Source currency code (defaults to BASE_CURRENCY = 'INR')
 * @param {string} toCurrency - Destination currency code (defaults to BASE_CURRENCY = 'INR')
 * @returns {number} Converted numerical amount
 */
export function convertCurrency(amount, fromCurrency = BASE_CURRENCY, toCurrency = BASE_CURRENCY) {
  const num = Number(amount);
  if (isNaN(num)) return 0;

  const from = (fromCurrency || BASE_CURRENCY).toUpperCase().trim();
  const to = (toCurrency || BASE_CURRENCY).toUpperCase().trim();

  if (from === to) {
    return num;
  }

  // Delta Exchange / Crypto normalization: USDT is dollar-pegged (1 USDT = 1 USD)
  const normFrom = from === 'USDT' ? 'USD' : from;
  const normTo = to === 'USDT' ? 'USD' : to;

  if (normFrom === normTo) {
    return num;
  }

  // USD -> INR
  if (normFrom === 'USD' && normTo === 'INR') {
    return num * USD_TO_INR_RATE;
  }

  // INR -> USD
  if (normFrom === 'INR' && normTo === 'USD') {
    return num / USD_TO_INR_RATE;
  }

  // Standard fixed fallbacks for EUR / GBP if selected
  if (normFrom === 'INR' && normTo === 'EUR') {
    return (num / USD_TO_INR_RATE) * 0.92;
  }
  if (normFrom === 'EUR' && normTo === 'INR') {
    return (num / 0.92) * USD_TO_INR_RATE;
  }
  if (normFrom === 'INR' && normTo === 'GBP') {
    return (num / USD_TO_INR_RATE) * 0.79;
  }
  if (normFrom === 'GBP' && normTo === 'INR') {
    return (num / 0.79) * USD_TO_INR_RATE;
  }

  return num;
}

/**
 * Format currency amount with proper locale and symbol using Intl.NumberFormat
 * Converts automatically from fromCurrency (defaults to base currency INR) to toCurrency.
 * 
 * Examples:
 * - formatCurrency(8500, 'USD') => "$100.00"
 * - formatCurrency(8500, 'INR') => "₹8,500.00"
 * - formatCurrency(100, 'INR', 'USD') => "₹8,500.00"
 * - formatCurrency(85, 'USD') => "$1.00"
 * 
 * @param {number|string} amount - Financial amount in fromCurrency
 * @param {string} toCurrency - Preferred currency to display (default 'INR')
 * @param {string} fromCurrency - Currency of the input amount (default 'INR')
 * @param {object} options - Optional Intl.NumberFormat options
 * @returns {string} Formatted string
 */
export function formatCurrency(amount, toCurrency = BASE_CURRENCY, fromCurrency = BASE_CURRENCY, options = {}) {
  const num = Number(amount) || 0;
  const targetCurrency = (toCurrency || BASE_CURRENCY).toUpperCase().trim();
  const sourceCurrency = (fromCurrency || BASE_CURRENCY).toUpperCase().trim();

  // Convert amount from base / source currency to target currency
  const converted = convertCurrency(num, sourceCurrency, targetCurrency);

  const minDecimals = options.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 2;
  const maxDecimals = options.maximumFractionDigits !== undefined ? options.maximumFractionDigits : 2;

  if (targetCurrency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
      ...options
    }).format(converted);
  }

  if (targetCurrency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
      ...options
    }).format(converted);
  }

  if (targetCurrency === 'USDT') {
    const formattedNum = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
      ...options
    }).format(Math.abs(converted));
    return `${converted < 0 ? '-' : ''}₮${formattedNum}`;
  }

  // Standard ISO currencies (EUR, GBP, etc.)
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
      ...options
    }).format(converted);
  } catch (e) {
    const symbol = CURRENCY_SYMBOLS[targetCurrency] || '$';
    const formattedNum = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals,
      ...options
    }).format(Math.abs(converted));
    return `${converted < 0 ? '-' : ''}${symbol}${formattedNum}`;
  }
}
