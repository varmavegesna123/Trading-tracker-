import React, { useState } from 'react';

// Extract primary base crypto symbol from any trading pair format
// e.g. "BTC/USDT" -> "btc", "ETHUSDT" -> "eth", "SOL-PERP" -> "sol"
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
  if (clean === 'GOLD') return 'xau';

  return clean.toLowerCase();
}

// Returns official coin CDN image URL
export function getCryptoIconUrl(symbol) {
  const base = extractBaseSymbol(symbol);
  return `https://assets.coincap.io/assets/icons/${base}@2x.png`;
}

// Popular Binance Pairs Metadata (Real Active Spot & Perpetuals Pairs)
export const BINANCE_POPULAR_PAIRS = [
  { symbol: 'BTC/USDT', coin: 'BTC', name: 'Bitcoin' },
  { symbol: 'BTC/USD', coin: 'BTC', name: 'Bitcoin (USD)' },
  { symbol: 'ETH/USDT', coin: 'ETH', name: 'Ethereum' },
  { symbol: 'ETH/USD', coin: 'ETH', name: 'Ethereum (USD)' },
  { symbol: 'SOL/USDT', coin: 'SOL', name: 'Solana' },
  { symbol: 'SOL/USD', coin: 'SOL', name: 'Solana (USD)' },
  { symbol: 'XAU/USD', coin: 'XAU', name: 'Gold (XAU/USD)' },
  { symbol: 'XAUUSD', coin: 'XAU', name: 'Gold (XAUUSD)' },
  { symbol: 'ALV/USDT', coin: 'ALV', name: 'Alvey Chain' },
  { symbol: 'ALV/USD', coin: 'ALV', name: 'Alvey Chain (USD)' },
  { symbol: 'ALGO/USDT', coin: 'ALGO', name: 'Algorand' },
  { symbol: 'BNB/USDT', coin: 'BNB', name: 'BNB' },
  { symbol: 'XRP/USDT', coin: 'XRP', name: 'XRP' },
  { symbol: 'ADA/USDT', coin: 'ADA', name: 'Cardano' },
  { symbol: 'DOGE/USDT', coin: 'DOGE', name: 'Dogecoin' },
  { symbol: 'AVAX/USDT', coin: 'AVAX', name: 'Avalanche' },
  { symbol: 'AVAX/USD', coin: 'AVAX', name: 'Avalanche (USD)' },
  { symbol: 'SUI/USDT', coin: 'SUI', name: 'Sui' },
  { symbol: 'PEPE/USDT', coin: 'PEPE', name: 'Pepe' },
  { symbol: 'LINK/USDT', coin: 'LINK', name: 'Chainlink' },
  { symbol: 'DOT/USDT', coin: 'DOT', name: 'Polkadot' },
  { symbol: 'NEAR/USDT', coin: 'NEAR', name: 'NEAR Protocol' },
  { symbol: 'SHIB/USDT', coin: 'SHIB', name: 'Shiba Inu' },
  { symbol: 'TON/USDT', coin: 'TON', name: 'Toncoin' },
  { symbol: 'MATIC/USDT', coin: 'MATIC', name: 'Polygon' },
  { symbol: 'POL/USDT', coin: 'POL', name: 'Polygon POL' },
  { symbol: 'LTC/USDT', coin: 'LTC', name: 'Litecoin' },
  { symbol: 'UNI/USDT', coin: 'UNI', name: 'Uniswap' },
  { symbol: 'ATOM/USDT', coin: 'ATOM', name: 'Cosmos' },
  { symbol: 'ETC/USDT', coin: 'ETC', name: 'Ethereum Classic' },
  { symbol: 'XLM/USDT', coin: 'XLM', name: 'Stellar' },
  { symbol: 'APT/USDT', coin: 'APT', name: 'Aptos' },
  { symbol: 'FIL/USDT', coin: 'FIL', name: 'Filecoin' },
  { symbol: 'LDO/USDT', coin: 'LDO', name: 'Lido DAO' },
  { symbol: 'ICP/USDT', coin: 'ICP', name: 'Internet Computer' },
  { symbol: 'RENDER/USDT', coin: 'RENDER', name: 'Render' },
  { symbol: 'RNDR/USDT', coin: 'RNDR', name: 'Render Token' },
  { symbol: 'INJ/USDT', coin: 'INJ', name: 'Injective' },
  { symbol: 'OP/USDT', coin: 'OP', name: 'Optimism' },
  { symbol: 'ARB/USDT', coin: 'ARB', name: 'Arbitrum' },
  { symbol: 'FET/USDT', coin: 'FET', name: 'Fetch.ai' },
  { symbol: 'WIF/USDT', coin: 'WIF', name: 'dogwifhat' },
  { symbol: 'FLOKI/USDT', coin: 'FLOKI', name: 'Floki' },
  { symbol: 'TIA/USDT', coin: 'TIA', name: 'Celestia' },
  { symbol: 'SEI/USDT', coin: 'SEI', name: 'Sei' },
  { symbol: 'STX/USDT', coin: 'STX', name: 'Stacks' },
  { symbol: 'AAVE/USDT', coin: 'AAVE', name: 'Aave' },
  { symbol: 'MKR/USDT', coin: 'MKR', name: 'Maker' },
  { symbol: 'TAO/USDT', coin: 'TAO', name: 'Bittensor' },
  { symbol: 'WLD/USDT', coin: 'WLD', name: 'Worldcoin' },
  { symbol: 'TRX/USDT', coin: 'TRX', name: 'TRON' },
  { symbol: 'BCH/USDT', coin: 'BCH', name: 'Bitcoin Cash' },
  { symbol: 'JUP/USDT', coin: 'JUP', name: 'Jupiter' },
  { symbol: 'PYTH/USDT', coin: 'PYTH', name: 'Pyth Network' },
  { symbol: 'BONK/USDT', coin: 'BONK', name: 'Bonk' },
  { symbol: 'NOT/USDT', coin: 'NOT', name: 'Notcoin' },
  { symbol: 'DOGS/USDT', coin: 'DOGS', name: 'Dogs' },
  { symbol: 'POPCAT/USDT', coin: 'POPCAT', name: 'Popcat' }
];

// React component to render exact official coin logo image with styled fallback
export function CryptoIcon({ symbol, className = "w-5 h-5", alt = "" }) {
  const [error, setError] = useState(false);
  const base = extractBaseSymbol(symbol);
  const iconUrl = getCryptoIconUrl(symbol);

  // Dedicated Gold / XAU Badge
  if (base === 'xau' || base === 'gold') {
    return (
      <span className={`${className} rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 font-mono font-bold flex items-center justify-center text-[9px] shrink-0 uppercase shadow-xs`}>
        Au
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
