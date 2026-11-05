import React, { useState } from 'react';

// Extract primary base crypto or commodity symbol from any trading pair format
// e.g. "BTC/USDT" -> "btc", "XAUUSD" -> "xau", "SOL-PERP" -> "sol"
export function extractBaseSymbol(symbol) {
  if (!symbol) return 'btc';
  let clean = String(symbol).trim().toUpperCase();

  // Strip prefixes like 1000 (e.g. 1000PEPE -> PEPE)
  if (clean.startsWith('1000') && clean.length > 4) {
    clean = clean.slice(4);
  }

  if (clean.includes('/')) {
    clean = clean.split('/')[0];
  } else if (clean.endsWith('USDT') && clean.length > 4) {
    clean = clean.slice(0, -4);
  } else if (clean.endsWith('BUSD') && clean.length > 4) {
    clean = clean.slice(0, -4);
  } else if (clean.endsWith('USDC') && clean.length > 4) {
    clean = clean.slice(0, -4);
  } else if (clean.endsWith('USD') && clean.length > 3) {
    clean = clean.slice(0, -3);
  } else if (clean.includes('-')) {
    clean = clean.split('-')[0];
  } else if (clean.includes('.')) {
    clean = clean.split('.')[0];
  }

  // Handle rebrands, gold & logo mapping fallbacks
  if (clean === 'POL') return 'matic';
  if (clean === 'RENDER') return 'rndr';
  if (clean === 'GOLD' || clean === 'XAUT' || clean === 'PAXG' || clean === 'XAU') return 'xau';

  return clean.toLowerCase();
}

// Extract clean human-readable asset ticker (e.g. "XAUUSD" -> "XAU", "BTC/USDT" -> "BTC")
export function getAssetTicker(symbol) {
  if (!symbol) return 'BTC';
  const clean = String(symbol).trim().toUpperCase();
  if (clean.includes('XAU') || clean.includes('GOLD')) return 'XAU';
  if (clean.includes('PAXG')) return 'PAXG';
  if (clean.includes('/')) return clean.split('/')[0];
  if (clean.endsWith('USDT') && clean.length > 4) return clean.slice(0, -4);
  if (clean.endsWith('BUSD') && clean.length > 4) return clean.slice(0, -4);
  if (clean.endsWith('USDC') && clean.length > 4) return clean.slice(0, -4);
  if (clean.endsWith('USD') && clean.length > 3) return clean.slice(0, -3);
  return clean;
}

// Returns official coin CDN image URL
export function getCryptoIconUrl(symbol) {
  const base = extractBaseSymbol(symbol);
  return `https://assets.coincap.io/assets/icons/${base}@2x.png`;
}

// Popular Delta Exchange, Binance & Global Active Trading Pairs (100% Real Authentic Symbols)
export const BINANCE_POPULAR_PAIRS = [
  { symbol: 'BTC/USDT', coin: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH/USDT', coin: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL/USDT', coin: 'SOL', name: 'Solana' },
  { symbol: 'XAUUSD', coin: 'XAU', name: 'Gold Spot / USD (Delta Exchange)' },
  { symbol: 'XRP/USDT', coin: 'XRP', name: 'XRP' },
  { symbol: 'BNB/USDT', coin: 'BNB', name: 'BNB' },
  { symbol: 'DOGE/USDT', coin: 'DOGE', name: 'Dogecoin' },
  { symbol: 'AVAX/USDT', coin: 'AVAX', name: 'Avalanche' },
  { symbol: 'SUI/USDT', coin: 'SUI', name: 'Sui' },
  { symbol: 'PEPE/USDT', coin: 'PEPE', name: 'Pepe' },
  { symbol: 'LINK/USDT', coin: 'LINK', name: 'Chainlink' },
  { symbol: 'ADA/USDT', coin: 'ADA', name: 'Cardano' },
  { symbol: 'NEAR/USDT', coin: 'NEAR', name: 'NEAR Protocol' },
  { symbol: 'SHIB/USDT', coin: 'SHIB', name: 'Shiba Inu' },
  { symbol: 'LTC/USDT', coin: 'LTC', name: 'Litecoin' },
  { symbol: 'TRX/USDT', coin: 'TRX', name: 'TRON' },
  { symbol: 'ALGO/USDT', coin: 'ALGO', name: 'Algorand' },
  { symbol: 'ALV/USDT', coin: 'ALV', name: 'Alvey Chain' },
  { symbol: 'DOT/USDT', coin: 'DOT', name: 'Polkadot' },
  { symbol: 'UNI/USDT', coin: 'UNI', name: 'Uniswap' },
  { symbol: 'INJ/USDT', coin: 'INJ', name: 'Injective' },
  { symbol: 'RENDER/USDT', coin: 'RENDER', name: 'Render' },
  { symbol: 'APT/USDT', coin: 'APT', name: 'Aptos' },
  { symbol: 'ARB/USDT', coin: 'ARB', name: 'Arbitrum' },
  { symbol: 'OP/USDT', coin: 'OP', name: 'Optimism' },
  { symbol: 'TIA/USDT', coin: 'TIA', name: 'Celestia' },
  { symbol: 'SEI/USDT', coin: 'SEI', name: 'Sei' },
  { symbol: 'AAVE/USDT', coin: 'AAVE', name: 'Aave' },
  { symbol: 'TAO/USDT', coin: 'TAO', name: 'Bittensor' },
  { symbol: 'BCH/USDT', coin: 'BCH', name: 'Bitcoin Cash' },
  { symbol: 'FET/USDT', coin: 'FET', name: 'Artificial Superintelligence (FET)' },
  { symbol: 'WIF/USDT', coin: 'WIF', name: 'dogwifhat' },
  { symbol: 'BONK/USDT', coin: 'BONK', name: 'Bonk' },
  { symbol: 'XAUTUSD', coin: 'XAU', name: 'Tether Gold (Delta Perpetual)' },
  { symbol: 'PAXGUSD', coin: 'XAU', name: 'PAX Gold (Delta Perpetual)' }
];

// React component to render exact official coin logo image with styled fallback
export function CryptoIcon({ symbol, className = "w-5 h-5", alt = "" }) {
  const [error, setError] = useState(false);
  const base = extractBaseSymbol(symbol);
  const iconUrl = getCryptoIconUrl(symbol);

  // Dedicated Gold / XAU Badge - matching the official Gold Bullion 3-bar icon
  if (base === 'xau' || base === 'gold') {
    return (
      <span 
        title="Gold (XAUUSD)"
        className={`${className} rounded-full bg-[#E5A910] flex items-center justify-center shrink-0 shadow-xs overflow-hidden select-none`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-[72%] h-[72%]" xmlns="http://www.w3.org/2000/svg">
          {/* Top Ingot */}
          <polygon points="9,5.5 15,5.5 16.8,9.5 7.2,9.5" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="0.4" strokeLinejoin="round" />
          {/* Bottom Left Ingot */}
          <polygon points="4.8,11.5 10.4,11.5 11.7,15.5 3.5,15.5" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="0.4" strokeLinejoin="round" />
          {/* Bottom Right Ingot */}
          <polygon points="13.6,11.5 19.2,11.5 20.5,15.5 12.3,15.5" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="0.4" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  // Dedicated ALV Badge
  if (base === 'alv') {
    return (
      <span className={`${className} rounded-full bg-purple-500/20 border border-purple-500/50 text-purple-400 font-mono font-bold flex items-center justify-center text-[9px] shrink-0 uppercase shadow-xs`}>
        ALV
      </span>
    );
  }

  if (error || !base) {
    return (
      <span className={`${className} rounded-full bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] font-mono font-bold flex items-center justify-center text-[10px] shrink-0 uppercase`}>
        {base.slice(0, 3)}
      </span>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={alt || base.toUpperCase()}
      onError={() => setError(true)}
      className={`${className} rounded-full object-cover shrink-0`}
      loading="lazy"
    />
  );
}

// Fetch Binance ticker 24hr real-time symbol data from Binance Public REST API
export async function fetchBinanceTickerPairs() {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
    if (!res.ok) throw new Error('Binance API response error');
    const data = await res.json();
    
    // Filter top 50 USDT pairs sorted by volume
    const usdtPairs = data
      .filter(item => item.symbol.endsWith('USDT') && !item.symbol.includes('UP') && !item.symbol.includes('DOWN'))
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 50)
      .map(item => {
        const base = item.symbol.slice(0, -4);
        return {
          symbol: `${base}/USDT`,
          rawSymbol: item.symbol,
          baseSymbol: base,
          price: parseFloat(item.lastPrice),
          priceChangePercent: parseFloat(item.priceChangePercent),
          quoteVolume: parseFloat(item.quoteVolume)
        };
      });
      
    return usdtPairs;
  } catch (err) {
    console.warn('Binance API fetch failed, fallback to local popular pairs', err);
    return BINANCE_POPULAR_PAIRS.map(p => ({
      symbol: p.symbol,
      rawSymbol: p.symbol.replace('/', ''),
      baseSymbol: p.coin,
      price: 0,
      priceChangePercent: 0,
      quoteVolume: 0
    }));
  }
}

